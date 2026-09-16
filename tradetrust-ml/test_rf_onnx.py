import onnxruntime as ort
import numpy as np

session = ort.InferenceSession("smartbuy_model.onnx")

input_name = session.get_inputs()[0].name

# 13 features, same structure as your original model
features = np.array([[
    0,      # category_enc
    0,      # brand_enc
    0,      # model_enc
    2024,   # model_year
    8,      # ram_gb
    256,    # storage_gb
    80000,  # original_price_inr
    60000,  # price_inr
    12,     # product_age_months
    4,      # product_condition
    4.5,    # rating
    1,      # warranty_available
    1       # documents_provided
]], dtype=np.float32)

outputs = session.run(None, {input_name: features})

print("✅ Random Forest ONNX inference worked!")
print("Outputs:")

for output in outputs:
    print(output)