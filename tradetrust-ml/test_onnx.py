import onnxruntime as ort
import numpy as np

session = ort.InferenceSession("damage_model.onnx")

input_name = session.get_inputs()[0].name

dummy_input = np.random.randn(1, 3, 224, 224).astype(np.float32)

output = session.run(None, {input_name: dummy_input})

print("✅ ONNX inference worked!")
print("Output shape:", output[0].shape)
print("Output:", output[0])