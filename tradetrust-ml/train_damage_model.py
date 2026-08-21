import torch
import torch.nn as nn
from torchvision import datasets, transforms
from torch.utils.data import DataLoader, random_split
import timm

# -----------------------------
# Config
# -----------------------------
DATA_DIR = "damage_dataset"
BATCH_SIZE = 16
EPOCHS = 15
LR = 0.0005   # slightly lower LR for fine-tuning
NUM_CLASSES = 3
MODEL_NAME = "efficientnet_b3"

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# -----------------------------
# Transforms (Improved Augmentation)
# -----------------------------
transform = transforms.Compose([
    transforms.Resize((256, 256)),
    transforms.RandomResizedCrop(224, scale=(0.8, 1.0)),
    transforms.RandomHorizontalFlip(),
    transforms.RandomRotation(10),
    transforms.ColorJitter(brightness=0.2, contrast=0.2),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

# -----------------------------
# Dataset
# -----------------------------
dataset = datasets.ImageFolder(DATA_DIR, transform=transform)

train_size = int(0.8 * len(dataset))
val_size = len(dataset) - train_size

train_ds, val_ds = random_split(dataset, [train_size, val_size])

train_loader = DataLoader(train_ds, batch_size=BATCH_SIZE, shuffle=True)
val_loader = DataLoader(val_ds, batch_size=BATCH_SIZE, shuffle=False)

print("Classes:", dataset.classes)
print("Train size:", train_size)
print("Val size:", val_size)

# -----------------------------
# Model
# -----------------------------
model = timm.create_model(MODEL_NAME, pretrained=True)

# Freeze all layers first
for param in model.parameters():
    param.requires_grad = False

# Unfreeze last 2 EfficientNet blocks
for param in model.blocks[-2:].parameters():
    param.requires_grad = True

# Replace classifier
model.classifier = nn.Linear(model.classifier.in_features, NUM_CLASSES)

model = model.to(device)

# -----------------------------
# Training Setup
# -----------------------------
criterion = nn.CrossEntropyLoss()

# IMPORTANT: Train only unfrozen layers
optimizer = torch.optim.Adam(
    filter(lambda p: p.requires_grad, model.parameters()),
    lr=LR
)

# -----------------------------
# Training Loop
# -----------------------------
best_acc = 0.0

for epoch in range(EPOCHS):
    model.train()
    running_loss = 0.0

    for images, labels in train_loader:
        images, labels = images.to(device), labels.to(device)

        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()

        running_loss += loss.item()

    # Validation
    model.eval()
    correct = 0
    total = 0

    with torch.no_grad():
        for images, labels in val_loader:
            images, labels = images.to(device), labels.to(device)
            outputs = model(images)
            _, preds = torch.max(outputs, 1)
            correct += (preds == labels).sum().item()
            total += labels.size(0)

    acc = correct / total

    if acc > best_acc:
        best_acc = acc
        torch.save(model.state_dict(), "damage_model_best.pth")

    print(f"Epoch {epoch+1}/{EPOCHS} | "
          f"Loss: {running_loss:.3f} | "
          f"Val Acc: {acc:.3f}")

print(f"\n✅ Best Validation Accuracy: {best_acc:.3f}")
print("✅ Best model saved as damage_model_best.pth")