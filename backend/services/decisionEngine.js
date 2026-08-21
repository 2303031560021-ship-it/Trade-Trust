export const generateDecision = (data) => {

  const {
    price = 0,
    fair_value = 0,
    warranty_available = false,
    documents_provided = false,
    seller_id_proof = false,
    original_box = false,
    accessories_available = false,
    condition = "average"
  } = data;

  /* ---------------- TRUST SCORE ---------------- */

  let trustScore = 30; // neutral base

  if (warranty_available) trustScore += 20;
  if (documents_provided) trustScore += 15;
  if (seller_id_proof) trustScore += 15;
  if (original_box) trustScore += 10;
  if (accessories_available) trustScore += 10;

  trustScore = Math.min(trustScore, 100);


  /* ---------------- CONDITION SCORE ---------------- */

  let conditionScore = 0;

  if (condition === "like_new") conditionScore = 30;
  else if (condition === "good") conditionScore = 22;
  else if (condition === "average") conditionScore = 12;
  else conditionScore = 5;


  /* ---------------- PRICE SCORE ---------------- */

  let priceScore = 0;

  if (fair_value > 0) {

    const difference = price - fair_value;
    const percentDiff = (difference / fair_value) * 100;

    if (percentDiff <= -10) {
      priceScore = 35; // great deal
    }
    else if (percentDiff <= 0) {
      priceScore = 28; // fair price
    }
    else if (percentDiff <= 10) {
      priceScore = 18; // slightly higher but acceptable
    }
    else if (percentDiff <= 20) {
      priceScore = 8; // overpriced
    }
    else {
      priceScore = 0; // very overpriced
    }

  } else {

    // fallback when fair value missing
    if (price <= 10000) priceScore = 25;
    else if (price <= 20000) priceScore = 18;
    else priceScore = 10;

  }


  /* ---------------- FINAL SCORE ---------------- */

  const finalScore =
    trustScore * 0.35 +
    conditionScore * 0.30 +
    priceScore * 0.35;


  /* ---------------- DECISION ---------------- */

  let recommendation;
  let risk;

  if (finalScore >= 70) {
    recommendation = "BUY";
    risk = "Low";
  }
  else if (finalScore >= 45) {
    recommendation = "HOLD";
    risk = "Medium";
  }
  else {
    recommendation = "AVOID";
    risk = "High";
  }


  /* ---------------- CONFIDENCE ---------------- */

  let confidence;

  if (recommendation === "BUY") {
    confidence = Math.min(95, 75 + Math.round(finalScore / 2));
  }
  else if (recommendation === "HOLD") {
    confidence = 60 + Math.round(finalScore / 4);
  }
  else {
    confidence = 50 + Math.round((45 - finalScore) / 2);
  }


  /* ---------------- HUMAN FRIENDLY EXPLANATIONS ---------------- */

  const positives = [];
  const negatives = [];
  const suggestions = [];

  /* Positives */

  if (trustScore >= 80) {
    positives.push("The seller has provided strong proof like warranty or original documents.");
  }

  if (conditionScore >= 25) {
    positives.push("The device appears to be in very good physical condition.");
  }

  if (priceScore >= 28) {
    positives.push("The asking price looks reasonable compared to the expected value.");
  }

  /* Negatives */

  if (trustScore < 50) {
    negatives.push("There is limited information from the seller, which adds some uncertainty.");
  }

  if (conditionScore <= 10) {
    negatives.push("The condition suggests the device may have noticeable wear.");
  }

  if (priceScore <= 8) {
    negatives.push("The price seems much higher than what the device is likely worth.");
  }

  /* Suggestions */

  if (priceScore <= 18) {
    suggestions.push("You could try negotiating the price a little lower.");
  }

  if (!documents_provided) {
    suggestions.push("Ask the seller if they still have the original purchase bill.");
  }

  if (!warranty_available) {
    suggestions.push("Check if any warranty is still available for the product.");
  }


  /* ---------------- RETURN RESULT ---------------- */

  return {
    recommendation,
    confidence,
    risk,
    trust_score: Math.round(trustScore),
    score: Math.round(finalScore),
    positives,
    negatives,
    suggestions
  };

};