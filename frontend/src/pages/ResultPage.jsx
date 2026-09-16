import { useLocation, useNavigate } from "react-router-dom";
import "./ResultPage.css";
import { useUser } from "@clerk/react";
import toast from "react-hot-toast";

const conditionMap = { 4: "Like New", 3: "Good", 2: "Average", 1: "Poor" };

const safetyChecklist = [
  "Meet in a public, well-lit place for the transaction.",
  "Test the device fully before making any payment.",
  "Verify the serial number or IMEI against official records.",
  "Avoid making advance payments or deposits.",
  "Use secure, traceable payment methods.",
  "Record device condition (photos/video) at handover.",
  "Request written warranty or return confirmation from the seller."
];

function ResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
  const result = location.state?.result;
  const formInputs = location.state?.formInputs;
const imagePreview =
  location.state?.imagePreview ||
  location.state?.imageFile ||
  null;
  if (!result) {
    return (
      <div className="result-page">
        <div className="result-container">
          <h2>No analysis data found.</h2>
          <button className="result-btn" onClick={() => navigate("/")}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const handleSaveResult = async () => {
  if (!user) {
    alert("Please login to save results");
    return;
  }

  const saveData = {
    userId: user.id,
    result,
    formInputs,
    imagePreview,
    createdAt: new Date()
  };

  try {
    const response = await fetch(
      "https://trade-trust.onrender.com/api/save-result",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(saveData)
      }
    );

    const responseText = await response.text();

    console.log("SAVE STATUS:", response.status);
    console.log("SAVE RESPONSE:", responseText);

    if (!response.ok) {
      throw new Error(`Save failed: ${response.status} - ${responseText}`);
    }

    const data = JSON.parse(responseText);

    if (data.success) {
      toast.success("Result saved successfully!");
    }

  } catch (error) {
    console.error("SAVE RESULT ERROR:", error);
    toast.error("Failed to save result");
  }
};
  const {
    decision,
    confidence,
    trust_score,
    explanation,
    pricing,
    damage
  } = result;

  const confidencePercent = Math.round((confidence ?? 0) * 100);

  // Normalize decision label
  const getDecisionLabel = () => {
    const d = (decision || "").toUpperCase();
    if (d === "BUY") return "Recommended";
    if (d === "HOLD") return "Outcome Uncertain";
    return "Not Recommended";
  };

  const getDecisionClass = () => {
    const d = (decision || "").toUpperCase();
    if (d === "BUY") return "decision-buy";
    if (d === "HOLD") return "decision-hold";
    return "decision-avoid";
  };

  // Safely read structured explanation (handle both old string and new object)
  const isStructured = explanation && typeof explanation === "object";
  const summary = isStructured ? explanation.summary : (typeof explanation === "string" ? explanation : "");
  const pricingImpact = isStructured ? explanation.pricingImpact : null;
  const damageImpact = isStructured ? explanation.damageImpact : null;
  const trustImpact = isStructured ? explanation.trustImpact : null;
  const finalReasoning = isStructured ? explanation.finalReasoning : "";
  const improvementSuggestions = isStructured ? (explanation.improvementSuggestions || []) : [];

  const askingPrice = pricingImpact?.askingPrice ?? pricing?.asking_price ?? 0;
  const adjustedPrice = pricingImpact?.adjustedPrice ?? pricing?.adjusted_price ?? 0;
  const damagePenaltyPercent = damageImpact?.damagePenaltyPercent ?? (damage?.damage_penalty ? (damage.damage_penalty * 100).toFixed(1) : "0.0");
  const trustScoreVal = trustImpact?.trustScore ?? trust_score ?? 0;

  const isNotRecommended = (decision || "").toUpperCase() === "AVOID";

  // Decision-based accent class for the outer wrapper
  const getAccentClass = () => {
    const d = (decision || "").toUpperCase();
    if (d === "BUY") return "accent-buy";
    if (d === "HOLD") return "accent-hold";
    return "accent-avoid";
  };

  // Enhanced final summary interpretation
  const getFinalInterpretation = () => {
    const d = (decision || "").toUpperCase();
    if (d === "BUY") return "Strong alignment between price, condition, and trust indicators supports this recommendation. The deal appears favorable under current analysis.";
    if (d === "HOLD") return "This deal falls into a borderline zone. While some factors are acceptable, pricing and condition reduce overall strength. Careful negotiation is advised.";
    return "Significant risk indicators outweigh potential value. Price, damage severity, or seller trust create elevated transaction risk.";
  };

  // Decision color for Final Summary left border
  const getFinalBorderClass = () => {
    const d = (decision || "").toUpperCase();
    if (d === "BUY") return "final-border-buy";
    if (d === "HOLD") return "final-border-hold";
    return "final-border-avoid";
  };

  return (
    <div className="result-page">
      <div className="result-container">
       <div className={`analysis-wrapper ${getAccentClass()}`}>

        <div className="page-header">
          <h1>TradeTrust Analysis Report</h1>
          <p className="page-subtitle">Your personalized second-hand deal audit</p>
        </div>

        {/* ── Section 1: User Input Recap ── */}
        {formInputs && (
          <section className="listing-details-section">
            <h2 className="section-heading">Your Listing Details</h2>
            <div className="listing-details-card">
              {imagePreview && (
                <div className="listing-image-wrap">
                  <img src={imagePreview} alt="Uploaded product" className="listing-image" />
                </div>
              )}
              <div className="listing-meta">
                {formInputs.category && (
                  <div className="meta-item">
                    <span className="meta-label">Category</span>
                    <span className="meta-value">{formInputs.category}</span>
                  </div>
                )}
                {formInputs.brand && (
                  <div className="meta-item">
                    <span className="meta-label">Brand</span>
                    <span className="meta-value">{formInputs.brand}</span>
                  </div>
                )}
                {formInputs.model && (
                  <div className="meta-item">
                    <span className="meta-label">Model</span>
                    <span className="meta-value">{formInputs.model}</span>
                  </div>
                )}
                {formInputs.product_condition != null && (
                  <div className="meta-item">
                    <span className="meta-label">Condition</span>
                    <span className="meta-value">{conditionMap[formInputs.product_condition] || formInputs.product_condition}</span>
                  </div>
                )}
                {formInputs.product_age_months != null && (
                  <div className="meta-item">
                    <span className="meta-label">Usage</span>
                    <span className="meta-value">{formInputs.product_age_months < 12 ? "Under 1 Year" : formInputs.product_age_months < 24 ? "1–2 Years" : "2+ Years"}</span>
                  </div>
                )}
                {formInputs.askingPrice != null && (
                  <div className="meta-item">
                    <span className="meta-label">Asking Price</span>
                    <span className="meta-value">₹{Number(formInputs.askingPrice).toLocaleString("en-IN")}</span>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ── Section 2: Decision Hero ── */}
        <section className="decision-hero">
          <span className={`decision-badge ${getDecisionClass()}`}>
            {getDecisionLabel()}
          </span>
          <p className="decision-confidence">AI Confidence: {confidencePercent}%</p>
          <div className="confidence-bar-wrap">
            <div className="progress-track">
              <div
                className={`progress-fill ${getDecisionClass()}-fill`}
                style={{ width: `${confidencePercent}%` }}
              />
            </div>
          </div>
          {summary && <p className="decision-summary">{summary}</p>}
        </section>

        {/* ── Section 3: Deal Snapshot (4 metrics) ── */}
        <section className="snapshot-section">
          <h2 className="section-heading">Deal Snapshot</h2>
          <div className="snapshot-grid">
            <div className="snapshot-card">
              <span className="snapshot-label">Asking Price</span>
              <span className="snapshot-value">₹{Number(askingPrice).toLocaleString("en-IN")}</span>
            </div>
            <div className="snapshot-card">
              <span className="snapshot-label">Adjusted Fair Value</span>
              <span className="snapshot-value">₹{Number(adjustedPrice).toLocaleString("en-IN")}</span>
            </div>
            <div className="snapshot-card">
              <span className="snapshot-label">Damage Impact</span>
              <span className="snapshot-value">{damagePenaltyPercent}%</span>
            </div>
            <div className="snapshot-card">
              <span className="snapshot-label">Trust Score</span>
              <span className="snapshot-value">{trustScoreVal}<span className="snapshot-unit"> / 100</span></span>
            </div>
          </div>
        </section>

        {/* ── Section 4: Detailed Justification ── */}
        <section className="justification-section">
          <h2 className="section-heading">Detailed Decision Justification</h2>

          {/* Pricing Evaluation */}
          <div className="justification-block">
            <h3 className="justification-title">Pricing Evaluation</h3>
            {pricingImpact ? (
              <>
                <div className="justification-metrics">
                  <span>Asking: <strong>₹{Number(pricingImpact.askingPrice).toLocaleString("en-IN")}</strong></span>
                  <span>Fair Value: <strong>₹{Number(pricingImpact.adjustedPrice).toLocaleString("en-IN")}</strong></span>
                  <span>Gap: <strong>₹{Math.abs(pricingImpact.difference).toLocaleString("en-IN")} ({pricingImpact.percentageDifference}%)</strong></span>
                </div>
                <p className="justification-text">{pricingImpact.interpretation}</p>
              </>
            ) : (
              <p className="justification-text">
                Asking Price: ₹{pricing?.asking_price ?? "N/A"} — Adjusted: ₹{pricing?.adjusted_price ?? "N/A"}
              </p>
            )}
          </div>

          {/* Damage Assessment */}
          <div className="justification-block">
            <h3 className="justification-title">Damage Assessment</h3>
            {(() => {
              // Compute severity from raw penalty (works with both structured & fallback)
              const rawPenalty = damageImpact
                ? Number(damageImpact.damagePenaltyPercent) / 100
                : (damage?.damage_penalty ?? 0);
              const penaltyDisplay = damageImpact
                ? damageImpact.damagePenaltyPercent
                : (damage?.damage_penalty != null ? (damage.damage_penalty * 100).toFixed(1) : "0.0");

              let severity, severityClass, conditionSummary;
              if (rawPenalty > 0.30) {
                severity = "High";
                severityClass = "severity-high";
                conditionSummary = [
                  "Significant structural damage indicators detected.",
                  "The estimated value has been substantially reduced to reflect condition risk.",
                  `A ${penaltyDisplay}% pricing adjustment was applied due to detected damage.`
                ];
              } else if (rawPenalty > 0.15) {
                severity = "Moderate";
                severityClass = "severity-moderate";
                conditionSummary = [
                  "Noticeable wear detected, likely cosmetic with possible minor structural impact.",
                  "A moderate price adjustment has been applied to reflect the product's condition.",
                  `A ${penaltyDisplay}% pricing adjustment was applied due to detected wear.`
                ];
              } else {
                severity = "Low";
                severityClass = "severity-low";
                conditionSummary = [
                  "Minimal visible damage detected — primarily cosmetic, if any.",
                  "Only a minor value adjustment was necessary.",
                  `A ${penaltyDisplay}% pricing adjustment was applied.`
                ];
              }

              // Raw probabilities for transparency line
              const majorPct = damageImpact
                ? (damageImpact.majorProbability * 100).toFixed(1)
                : (damage?.major_probability != null ? (damage.major_probability * 100).toFixed(1) : null);
              const minorPct = damageImpact
                ? (damageImpact.minorProbability * 100).toFixed(1)
                : (damage?.minor_probability != null ? (damage.minor_probability * 100).toFixed(1) : null);

              return (
                <>
                  <div className="damage-summary-row">
                    <div className="damage-summary-item">
                      <span className="damage-summary-label">Damage Severity</span>
                      <span className={`severity-badge ${severityClass}`}>{severity}</span>
                    </div>
                    <div className="damage-summary-item">
                      <span className="damage-summary-label">Value Reduction Applied</span>
                      <span className="damage-summary-value">{penaltyDisplay}%</span>
                    </div>
                  </div>

                  <div className="damage-condition-summary">
                    <span className="damage-condition-heading">Detected Condition Summary</span>
                    <ul className="damage-condition-list">
                      {conditionSummary.map((line, i) => (
                        <li key={i}>{line}</li>
                      ))}
                    </ul>
                  </div>

                  {(majorPct != null || minorPct != null) && (
                    <p className="damage-transparency">
                      AI Detection Confidence: {majorPct != null && <>Major {majorPct}%</>}{majorPct != null && minorPct != null && " • "}{minorPct != null && <>Minor {minorPct}%</>}
                    </p>
                  )}
                </>
              );
            })()}
          </div>

          {/* Seller Trust Review */}
          <div className="justification-block">
            <h3 className="justification-title">Seller Trust Review</h3>
            {trustImpact ? (
              <>
                <div className="justification-metrics">
                  <span>Trust Score: <strong>{trustImpact.trustScore}/100</strong></span>
                  <span>Level: <strong className={`trust-level trust-${trustImpact.level.toLowerCase()}`}>{trustImpact.level}</strong></span>
                </div>
                <p className="justification-text">{trustImpact.interpretation}</p>
              </>
            ) : (
              <p className="justification-text">
                Trust Score: {trust_score ?? "N/A"}
              </p>
            )}
          </div>

          {/* Final Weighting Summary – Enhanced */}
          {(finalReasoning || true) && (
            <div className={`final-summary-block ${getFinalBorderClass()}`}>
              <h3 className="final-summary-heading">
                Final Decision Summary
                <span className="final-heading-underline" />
              </h3>

              <div className="final-factors">
                <span className="final-factors-label">Key Evaluation Factors</span>
                <ul className="final-factors-list">
                  <li>Pricing: ₹{Number(askingPrice).toLocaleString("en-IN")} vs Adjusted ₹{Number(adjustedPrice).toLocaleString("en-IN")}</li>
                  <li>Condition Impact: {damagePenaltyPercent}% value reduction</li>
                  <li>Seller Trust: {trustScoreVal}/100</li>
                </ul>
              </div>

              <p className="final-interpretation">{getFinalInterpretation()}</p>

              {finalReasoning && (
                <p className="final-reasoning-detail">{finalReasoning}</p>
              )}

              <div className="final-confidence-row">
                <span className="final-confidence-label">AI Confidence</span>
                <span className={`final-confidence-value ${getDecisionClass()}-glow`}>{confidencePercent}%</span>
              </div>
            </div>
          )}
        </section>

        {/* ── Section 5: What Could Improve This Deal ── */}
        {improvementSuggestions.length > 0 && (
          <section className="improvement-section">
            <h2 className="section-heading">What Could Improve This Deal</h2>
            <ul className="improvement-list">
              {improvementSuggestions.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </section>
        )}

        {/* ── Section 6: Safety Checklist ── */}
        <section className={`safety-section ${isNotRecommended ? "safety-warning" : ""}`}>
          <h2 className="section-heading">
            {isNotRecommended ? "⚠ If You Proceed, Stay Safe" : "If You Proceed, Stay Safe"}
          </h2>
          {isNotRecommended && (
            <p className="safety-warning-text">
              This deal is not recommended. If you still choose to proceed, take extra precautions.
            </p>
          )}
          <ul className="safety-list">
            {safetyChecklist.map((item, idx) => (
              <li key={idx}>
                <span className="safety-check">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Footer ── */}
    <div className="footer-actions">
  <button
    className="result-btn"
    type="button"
    onClick={() => navigate("/")}
  >
    Back to Home
  </button>

  <button
    className="result-btn"
    type="button"
    onClick={handleSaveResult}  
    style={{ marginLeft: "14px" }}
  >
    Save Result
  </button>
</div>

       </div>{/* end analysis-wrapper */}
      </div>
    </div>
  );
}

export default ResultPage;