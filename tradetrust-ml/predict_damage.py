import torch
import torch.nn as nn
from torchvision import transforms
from PIL import Image
import timm
import sys

# -----------------------------
# Config
# -----------------------------
MODEL_PATH = "damage_model_best.pth"
MODEL_NAME = "efficientnet_b3"
NUM_CLASSES = 3

# -------------------------------------------------------
# Damage weight configuration
# These map probability → price penalty fraction (0–1)
#
# MAJOR_WEIGHT = 0.70 means:
#   if model is 100% sure it's major damage → 70% penalty
#   This puts damagePenalty range at 0.0–0.70
#   But computeVerdict() normalises against 0.30 max,
#   so we keep weights at 0.30 max to stay in that range.
#
# The verdict formula handles severity via the 70/30 split.
# Keep these as-is — they feed into the penalty correctly.
# -------------------------------------------------------
MAJOR_WEIGHT = 0.30   # max 30% price reduction for major
MINOR_WEIGHT = 0.12   # max 12% price reduction for minor

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# -----------------------------
# Load Model
# -----------------------------
model = timm.create_model(MODEL_NAME, pretrained=False)
model.classifier = nn.Linear(model.classifier.in_features, NUM_CLASSES)
model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
model.to(device)
model.eval()

classes = ['major_damage', 'minor_damage', 'no_damage']

# -----------------------------
# Transform
# -----------------------------
transform = transforms.Compose([
    transforms.Resize((256, 256)),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(
        [0.485, 0.456, 0.406],
        [0.229, 0.224, 0.225]
    )
])

# -----------------------------
# Prediction Function
# -----------------------------
def predict(image_path):
    image = Image.open(image_path).convert("RGB")
    image = transform(image).unsqueeze(0).to(device)

    with torch.no_grad():
        outputs = model(image)
        probs = torch.softmax(outputs, dim=1)[0]

    major_prob = probs[0].item()
    minor_prob = probs[1].item()
    no_prob    = probs[2].item()

    # Weighted penalty: major dominates
    damage_penalty = (major_prob * MAJOR_WEIGHT) + (minor_prob * MINOR_WEIGHT)

    return major_prob, minor_prob, no_prob, damage_penalty


# -----------------------------
# Main Execution
# -----------------------------
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Please provide image path.")
        sys.exit()

    image_path = sys.argv[1]
    print("Running damage analysis...\n")

    major, minor, no, penalty = predict(image_path)

    print(f"Major Damage Probability : {major:.3f}")
    print(f"Minor Damage Probability : {minor:.3f}")
    print(f"No Damage Probability    : {no:.3f}")
    print(f"\nEstimated Price Reduction: {penalty * 100:.2f}%")