import torch
import torch.nn as nn
from torchvision import models
from PIL import Image

print("Loading model...")

# Load pretrained EfficientNet
weights = models.EfficientNet_B3_Weights.DEFAULT
model = models.efficientnet_b3(weights=weights)

# Replace final layer (1000 → 3)
in_features = model.classifier[1].in_features
model.classifier[1] = nn.Linear(in_features, 3)

model.eval()

print("Modified model for 3 damage classes.")

preprocess = weights.transforms()

classes = ["No Damage", "Minor Damage", "Major Damage"]

def analyze_image(image_path):
    image = Image.open(image_path).convert("RGB")
    input_tensor = preprocess(image).unsqueeze(0)

    with torch.no_grad():
        output = model(input_tensor)

    predicted_class = torch.argmax(output, dim=1).item()

    print("Predicted Damage Level:", classes[predicted_class])

if __name__ == "__main__":
    analyze_image("test.jpg")