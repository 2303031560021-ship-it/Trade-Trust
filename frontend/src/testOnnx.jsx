import { useEffect } from "react";
import { loadDamageModel } from "./onnxModels";

function TestOnnx() {
  useEffect(() => {
    loadDamageModel()
      .then(() => {
        console.log("✅ Damage ONNX model loaded");
      })
      .catch((error) => {
        console.error("❌ ONNX model failed:", error);
      });
  }, []);

  return null;
}

export default TestOnnx;