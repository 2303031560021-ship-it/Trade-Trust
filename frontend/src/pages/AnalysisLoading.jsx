import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./AnalysisLoading.css";

const loadingMessages = [
  "Uploading image...",
  "Analyzing product damage...",
  "Evaluating pricing fairness...",
  "Calculating trust score...",
  "Generating smart recommendation..."
];

function AnalysisLoading() {
  const navigate = useNavigate();
  const location = useLocation();
  const { formInputs, imageFile, imagePreview } = location.state || {};

  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (!formInputs || !imageFile) {
      navigate("/", { replace: true });
      return;
    }

    const intervalId = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 1200);

    const analyzeData = async () => {
      try {
        const formData = new FormData();

        formData.append("image", imageFile);

        Object.keys(formInputs).forEach((key) => {
          formData.append(key, formInputs[key]);
        });

        const response = await fetch("http://localhost:5001/analyze", {
          method: "POST",
          body: formData
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Backend error:", errorText);
          throw new Error("Backend error");
        }

        const data = await response.json();

     

        navigate("/result", {
          replace: true,
          state: { result: data, formInputs, imagePreview }
        });

      } catch (error) {
        console.error("Analysis failed:", error);
        alert("Analysis failed. Please check backend connection.");
        navigate("/", { replace: true });
      }
    };

    analyzeData();

    return () => clearInterval(intervalId);
  }, [navigate, formInputs, imageFile]);

  return (
    <div className="analysis-overlay">
      <div className="analysis-card">
        <div className="spinner"></div>
        <h2 className="analysis-title">Analyzing Your Deal</h2>
        <p className="analysis-message">
          {loadingMessages[messageIndex]}
        </p>
      </div>
    </div>
  );
}

export default AnalysisLoading;