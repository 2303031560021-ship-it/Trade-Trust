function generateExplanation({
  decision,
  confidence,
  damagePenalty,
  askingPrice,
  adjustedPrice,
  trustScore,
  majorProbability,
  minorProbability
}) {
  const damagePercent = (damagePenalty * 100).toFixed(1);
  const difference = askingPrice - Math.round(adjustedPrice);
  const percentageDifference = askingPrice > 0
    ? ((difference / askingPrice) * 100).toFixed(1)
    : "0.0";

  // --- Summary ---
  let summary = "";
  if (decision === "BUY") {
    summary = "This deal looks fair and is recommended based on pricing, condition, and seller trust.";
  } else if (decision === "HOLD") {
    summary = "This deal has mixed signals — consider negotiating or verifying more details before committing.";
  } else {
    summary = "This deal carries notable risk — the pricing, condition, or seller trust raise concerns.";
  }

  // --- Pricing Impact ---
  let pricingInterpretation = "";
  if (askingPrice > adjustedPrice * 1.15) {
    pricingInterpretation = `The asking price is significantly above the condition-adjusted fair value by ₹${Math.abs(difference)}. You may be overpaying.`;
  } else if (askingPrice > adjustedPrice) {
    pricingInterpretation = `The asking price is slightly above the adjusted fair value. There is a small pricing gap of ₹${Math.abs(difference)}.`;
  } else {
    pricingInterpretation = `The asking price is at or below the adjusted fair value — the pricing appears reasonable.`;
  }

  // --- Damage Impact ---
  let damageInterpretation = "";
  if (damagePenalty > 0.3) {
    damageInterpretation = `Significant physical damage detected (${damagePercent}% penalty applied). This heavily reduces the product's effective value.`;
  } else if (damagePenalty > 0.15) {
    damageInterpretation = `Moderate physical wear detected (${damagePercent}% penalty). The product's value has been noticeably reduced.`;
  } else if (damagePenalty > 0) {
    damageInterpretation = `Minimal visible damage detected (${damagePercent}% penalty). The product is in reasonable physical condition.`;
  } else {
    damageInterpretation = `No significant damage detected. The product appears to be in good physical condition.`;
  }

  // --- Trust Impact ---
  let trustLevel = "Low";
  let trustInterpretation = "";
  if (trustScore >= 80) {
    trustLevel = "High";
    trustInterpretation = `The seller demonstrates high reliability (Trust Score: ${trustScore}/100). Documentation, warranty, and accessories availability strengthen confidence.`;
  } else if (trustScore >= 60) {
    trustLevel = "Moderate";
    trustInterpretation = `The seller shows moderate reliability (Trust Score: ${trustScore}/100). Some trust signals are present, but additional verification is recommended.`;
  } else {
    trustLevel = "Low";
    trustInterpretation = `Seller reliability is low (Trust Score: ${trustScore}/100). Missing documentation or warranty information reduces confidence in this deal.`;
  }

  // --- Final Reasoning ---
  const confidencePct = (confidence * 100).toFixed(1);
  let finalReasoning = `After evaluating pricing (₹${askingPrice} vs adjusted ₹${Math.round(adjustedPrice)}), physical condition (${damagePercent}% damage penalty), and seller trust (${trustScore}/100), `;
  if (decision === "BUY") {
    finalReasoning += `the deal is classified as recommended with ${confidencePct}% confidence. The combination of fair pricing, acceptable condition, and adequate trust signals supports this recommendation.`;
  } else if (decision === "HOLD") {
    finalReasoning += `the deal is classified as uncertain with ${confidencePct}% confidence. One or more factors — pricing, condition, or trust — are borderline and warrant caution.`;
  } else {
    finalReasoning += `the deal is classified as not recommended with ${confidencePct}% confidence. The risk factors outweigh the positives in this evaluation.`;
  }

  // --- Improvement Suggestions ---
  const improvementSuggestions = [];
  if (askingPrice > adjustedPrice) {
    improvementSuggestions.push(`Negotiate the price closer to the adjusted fair value of ₹${Math.round(adjustedPrice)}.`);
  }
  if (!trustScore || trustScore < 60) {
    improvementSuggestions.push("Request warranty documentation or proof of purchase from the seller.");
  }
  if (damagePenalty > 0.15) {
    improvementSuggestions.push("Ask for additional photos or an in-person inspection to verify product condition.");
  }
  if (trustScore < 80) {
    improvementSuggestions.push("Ask the seller to provide original accessories and packaging for added trust.");
  }
  if (damagePenalty > 0.3) {
    improvementSuggestions.push("Consider a professional evaluation of the device before purchasing.");
  }

  return {
    summary,

    pricingImpact: {
      askingPrice,
      adjustedPrice: Math.round(adjustedPrice),
      difference,
      percentageDifference,
      interpretation: pricingInterpretation
    },

    damageImpact: {
      majorProbability: majorProbability ?? 0,
      minorProbability: minorProbability ?? 0,
      damagePenaltyPercent: damagePercent,
      interpretation: damageInterpretation
    },

    trustImpact: {
      trustScore,
      level: trustLevel,
      interpretation: trustInterpretation
    },

    finalReasoning,

    improvementSuggestions
  };
}

export default generateExplanation;