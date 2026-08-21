from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
from PIL import Image
import torch
import torch.nn as nn
from torchvision import transforms
import timm
import joblib
import numpy as np
import io
import os
from huggingface_hub import hf_hub_download

app = FastAPI()
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
# =========================
# HUGGING FACE MODEL FILES
# =========================

HF_REPO = "rishipatel0/tradetrust-ml"
HF_TOKEN = os.getenv("HF_TOKEN")

damage_model_path = hf_hub_download(
    repo_id=HF_REPO,
    filename="damage_model_best.pth",
    token=HF_TOKEN
)

tabular_model_path = hf_hub_download(
    repo_id=HF_REPO,
    filename="smartbuy_model.pkl",
    token=HF_TOKEN
)

label_encoders_path = hf_hub_download(
    repo_id=HF_REPO,
    filename="label_encoders.pkl",
    token=HF_TOKEN
)

target_encoder_path = hf_hub_download(
    repo_id=HF_REPO,
    filename="target_encoder.pkl",
    token=HF_TOKEN
)

# =========================
# DAMAGE MODEL
# =========================

damage_model = timm.create_model(
    "efficientnet_b3",
    pretrained=False
)

damage_model.classifier = nn.Linear(
    damage_model.classifier.in_features,
    3
)

damage_model.load_state_dict(
    torch.load(damage_model_path, map_location=device)
)

damage_model.to(device)
damage_model.eval()

damage_transform = transforms.Compose([
    transforms.Resize((256, 256)),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(
        [0.485, 0.456, 0.406],
        [0.229, 0.224, 0.225]
    )
])

# =========================
# TABULAR MODEL
# =========================

tabular_model = joblib.load(tabular_model_path)
label_encoders = joblib.load(label_encoders_path)
target_encoder = joblib.load(target_encoder_path)

# =========================
# SAFE ENCODER FUNCTION
# =========================
def safe_encode(encoder, value):
    try:
        if value in encoder.classes_:
            return encoder.transform([value])[0]
        else:
            # fallback to first known class
            return encoder.transform([encoder.classes_[0]])[0]
    except Exception:
        return encoder.transform([encoder.classes_[0]])[0]

# =========================
# DAMAGE ENDPOINT
# =========================
@app.post("/predict-damage")
async def predict_damage(file: UploadFile = File(...)):
    image_bytes = await file.read()
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image = damage_transform(image).unsqueeze(0).to(device)

    with torch.no_grad():
        outputs = damage_model(image)
        probs = torch.softmax(outputs, dim=1)[0].cpu().numpy()

    major_p = float(probs[0])
    minor_p = float(probs[1])
    no_p = float(probs[2])

    damage_penalty = (major_p * 0.40) + (minor_p * 0.15)

    return {
        "major_probability": major_p,
        "minor_probability": minor_p,
        "no_damage_probability": no_p,
        "damage_penalty": float(damage_penalty)
    }

# =========================
# DEAL INPUT MODEL
# =========================
class DealInput(BaseModel):
    category: str
    brand: str
    model: str
    model_year: float
    ram_gb: float
    storage_gb: float
    original_price_inr: float
    price_inr: float
    product_age_months: float
    product_condition: float
    rating: float
    warranty_available: float
    documents_provided: float

# =========================
# DEAL ENDPOINT
# =========================
@app.post("/predict-deal")
def predict_deal(data: DealInput):

    # SAFE encoding (no crash on unseen values)
    category_enc = safe_encode(label_encoders["category"], data.category)
    brand_enc = safe_encode(label_encoders["brand"], data.brand)
    model_enc = safe_encode(label_encoders["model"], data.model)

    features = np.array([[ 
        category_enc,
        brand_enc,
        model_enc,
        data.model_year,
        data.ram_gb,
        data.storage_gb,
        data.original_price_inr,
        data.price_inr,
        data.product_age_months,
        data.product_condition,
        data.rating,
        data.warranty_available,
        data.documents_provided
    ]])
    prediction = tabular_model.predict(features)[0]
    confidence = float(np.max(tabular_model.predict_proba(features)))
    decision = target_encoder.inverse_transform([prediction])[0]

    # ------------------------------------------------------
    # SMART DECISION CORRECTION LAYER
    # ------------------------------------------------------

    price_ratio = data.price_inr / data.original_price_inr if data.original_price_inr else 1

    good_condition = data.product_condition >= 3
    trust_signals = data.warranty_available + data.documents_provided

    # Upgrade HOLD → BUY
    if decision == "HOLD":
        if price_ratio <= 0.75 and good_condition and trust_signals >= 1:
            decision = "BUY"

    # Downgrade AVOID → HOLD
    if decision == "AVOID":
        if price_ratio <= 0.85 and good_condition:
            decision = "HOLD"

    return {
        "decision": decision,
        "confidence": confidence
    }