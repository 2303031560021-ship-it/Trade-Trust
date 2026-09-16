import joblib
import numpy as np
from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import FloatTensorType

# Load original model
model = joblib.load("smartbuy_model.pkl")

# Your model receives 13 features
initial_type = [
    ("float_input", FloatTensorType([None, 13]))
]

# Convert
onnx_model = convert_sklearn(
    model,
    initial_types=initial_type
)

# Save new ONNX model
with open("smartbuy_model.onnx", "wb") as f:
    f.write(onnx_model.SerializeToString())

print("✅ smartbuy_model.onnx created successfully!")