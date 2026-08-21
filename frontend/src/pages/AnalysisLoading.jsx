import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as ort from "onnxruntime-web";
ort.env.wasm.wasmPaths = "/wasm/";
import "./AnalysisLoading.css";

const loadingMessages = [
  "Loading AI model...",
  "Analyzing product damage...",
  "Evaluating pricing fairness...",
  "Calculating trust score...",
  "Generating smart recommendation..."
];

async function predictDamage(imageFile) {
 const session = await ort.InferenceSession.create(
  "/models/damage_model_browser.onnx"
);

  const image = new Image();

  const imageURL = URL.createObjectURL(imageFile);

  try {
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
      image.src = imageURL;
    });

    const canvas = document.createElement("canvas");
    canvas.width = 224;
    canvas.height = 224;

    const ctx = canvas.getContext("2d");

    ctx.drawImage(image, 0, 0, 224, 224);

    const imageData = ctx.getImageData(0, 0, 224, 224);

    const data = new Float32Array(1 * 3 * 224 * 224);

    const mean = [0.485, 0.456, 0.406];
    const std = [0.229, 0.224, 0.225];

    for (let y = 0; y < 224; y++) {
      for (let x = 0; x < 224; x++) {
        const pixelIndex = (y * 224 + x) * 4;

        const r = imageData.data[pixelIndex] / 255;
        const g = imageData.data[pixelIndex + 1] / 255;
        const b = imageData.data[pixelIndex + 2] / 255;

        const index = y * 224 + x;

        data[index] = (r - mean[0]) / std[0];
        data[224 * 224 + index] = (g - mean[1]) / std[1];
        data[2 * 224 * 224 + index] = (b - mean[2]) / std[2];
      }
    }

    const inputName = session.inputNames[0];

    const inputTensor = new ort.Tensor(
      "float32",
      data,
      [1, 3, 224, 224]
    );

    const output = await session.run({
      [inputName]: inputTensor
    });

    const outputTensor = output[session.outputNames[0]];
    const logits = outputTensor.data;

    const expValues = Array.from(logits).map((value) =>
      Math.exp(value)
    );

    const sum = expValues.reduce((a, b) => a + b, 0);

    const probs = expValues.map((value) => value / sum);

    const majorProbability = probs[0];
    const minorProbability = probs[1];
    const noDamageProbability = probs[2];

    const damagePenalty =
      majorProbability * 0.40 +
      minorProbability * 0.15;

    return {
      major_probability: majorProbability,
      minor_probability: minorProbability,
      no_damage_probability: noDamageProbability,
      damage_penalty: damagePenalty
    };
  } finally {
    URL.revokeObjectURL(imageURL);
  }
}

function AnalysisLoading() {
  const navigate = useNavigate();
  const location = useLocation();

  const { formInputs, imageFile, imagePreview } =
    location.state || {};

  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (!formInputs || !imageFile) {
      navigate("/", { replace: true });
      return;
    }

    const intervalId = setInterval(() => {
      setMessageIndex(
        (prev) => (prev + 1) % loadingMessages.length
      );
    }, 1200);

    const analyzeData = async () => {
      try {
        // ============================================
        // STEP 1 — RUN DAMAGE MODEL IN BROWSER
        // ============================================

        const damageData = await predictDamage(imageFile);

        console.log("✅ ONNX damage prediction:", damageData);

        // ============================================
        // STEP 2 — SEND RESULT TO BACKEND
        // ============================================

       const requestData = {
  ...formInputs,
  damage_penalty: damageData.damage_penalty,
  major_probability: damageData.major_probability,
  minor_probability: damageData.minor_probability,
  no_damage_probability: damageData.no_damage_probability
};

const response = await fetch(
  "https://trade-trust.onrender.com/analyze",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(requestData)
  }
);
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Backend error:", errorText);
          throw new Error("Backend error");
        }

        const data = await response.json();

        navigate("/result", {
          replace: true,
          state: {
            result: data,
            formInputs,
            imagePreview
          }
        });

      } catch (error) {
        console.error("Analysis failed:", error);

        alert(
          "Analysis failed. Please try again."
        );

        navigate("/", { replace: true });
      }
    };

    analyzeData();

    return () => clearInterval(intervalId);
  }, [navigate, formInputs, imageFile, imagePreview]);

  return (
    <div className="analysis-overlay">
      <div className="analysis-card">
        <div className="spinner"></div>

        <h2 className="analysis-title">
          Analyzing Your Deal
        </h2>

        <p className="analysis-message">
          {loadingMessages[messageIndex]}
        </p>
      </div>
    </div>
  );
}

export default AnalysisLoading;