import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/react";
import "./SavedResults.css";

const BADGE_STYLES = {
  BUY: {
    background: "rgba(0, 200, 120, 0.2)",
    color: "#00ff9c",
  },
  HOLD: {
    background: "rgba(255, 180, 0, 0.2)",
    color: "#ffc400",
  },
  AVOID: {
    background: "rgba(255, 60, 60, 0.2)",
    color: "#ff4d4d",
  },
};

const SavedResults = () => {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchResults = async () => {
      try {
        const res = await fetch(
          `https://trade-trust.onrender.com/api/saved-results/${user.id}`
        );
        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch saved results:", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [user, isLoaded]);

const handleViewResult = (item) => {
  navigate("/result", {
    state: {
      result: item.result,
      formInputs: item.formInputs,
      imagePreview: item.imagePreview || null
    }
  });
};

  const formatConfidence = (val) => {
    if (val == null) return "N/A";
    return `${Math.round(val * 100)}%`;
  };

  const formatPrice = (val) => {
    if (val == null) return "N/A";
    return `₹${Number(val).toLocaleString("en-IN")}`;
  };

  const placeholderImg =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Crect width='120' height='120' fill='%23181818'/%3E%3Ctext x='50%25' y='54%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='13' fill='%23555'%3ENo Image%3C/text%3E%3C/svg%3E";

  if (!isLoaded || loading) {
    return (
      <div className="saved-results-page">
        <h1 className="saved-results-title">Saved Results</h1>
        <div className="saved-results-loading">
          <div className="saved-results-spinner" />
          <p>Loading your saved results…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="saved-results-page">
        <h1 className="saved-results-title">Saved Results</h1>
        <div className="saved-results-empty">
          <p>Please sign in to view your saved results.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="saved-results-page">
      <h1 className="saved-results-title">Saved Results</h1>

      {results.length === 0 ? (
        <div className="saved-results-empty">
          <p>No saved results yet.</p>
        </div>
      ) : (
        <div className="saved-results-list">
          {results.map((item, idx) => {
            const decision = (item.result?.decision || "").toUpperCase();
            const badge = BADGE_STYLES[decision] || BADGE_STYLES.HOLD;

            return (
              <div className="saved-result-card" key={item._id || idx}>
                {/* Image Section */}
                <div className="saved-result-image-wrapper">
                  <img
                    className="saved-result-image"
                    src={item.imagePreview || placeholderImg}
                    alt={item.brand || "Product"}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = placeholderImg;
                    }}
                  />
                </div>

                {/* Product Info Section */}
                <div className="saved-result-info">
                  <h2 className="saved-result-name">
                   {item.formInputs?.brand || "Unknown Product"}
                  </h2>
                  <p className="saved-result-detail">
                    Category: {item.formInputs?.category || "N/A"}
                  </p>
                  <p className="saved-result-detail">
                    Price: {formatPrice(item.formInputs?.askingPrice)}
                  </p>
                  <p className="saved-result-detail">
                   Confidence: {formatConfidence(item.result?.confidence)}
                  </p>
                </div>

                {/* Decision + Action Section */}
                <div className="saved-result-actions">
                  <span
                    className="saved-result-badge"
                    style={{
                      background: badge.background,
                      color: badge.color,
                    }}
                  >
                    {decision || "N/A"}
                  </span>
                  <button
                    className="saved-result-view-btn"
                    onClick={() => handleViewResult(item)}
                  >
                    View Result
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SavedResults;