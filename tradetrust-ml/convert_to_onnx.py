import torch
import torch.nn as nn
import timm

# Load your original PyTorch model
model = timm.create_model(
    "efficientnet_b3",
    pretrained=False
)

model.classifier = nn.Linear(
    model.classifier.in_features,
    3
)

model.load_state_dict(
    torch.load(
        "damage_model_best.pth",
        map_location="cpu"
    )
)

model.eval()

# Dummy input: same image size used by your model
dummy_input = torch.randn(1, 3, 224, 224)

# Convert to ONNX
torch.onnx.export(
    model,
    dummy_input,
    "damage_model.onnx",
    input_names=["input"],
    output_names=["output"],
    opset_version=17
)

print("✅ damage_model.onnx created successfully!")