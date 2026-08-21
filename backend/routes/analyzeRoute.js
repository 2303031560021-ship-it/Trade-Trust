import express from "express";
import multer from "multer";
import FormData from "form-data";
import fs from "fs";
import calculateTrustScore from "../utils/trustScore.js";
import generateExplanation from "../utils/explanation.js";
import {
  ensureMlService,
  isMlServiceUnavailableError,
  mlServiceClient,
  ML_SERVICE_URL,
} from "../services/mlService.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// ============================================================
// VERDICT ENGINE
// Damage is PRIMARY (70%), Trust is SECONDARY (30%)
//
// damageScore  : 0–100  (higher = worse damage)
// trustScore   : 0–100  (higher = better trust)
// finalScore   : 0–100  (higher = better deal)
//
// RECOMMENDED      : finalScore >= 65
// OUTCOME UNCERTAIN: finalScore 40–64
// NOT RECOMMENDED  : finalScore < 40
// ============================================================
function computeVerdict(damagePenalty, trustScore) {
  // Convert damagePenalty (0.0–0.30) → damageScore (0–100)
  // damagePenalty of 0.30 = worst possible = damageScore 100
  const damageScore = Math.min((damagePenalty / 0.30) * 100, 100);

  // damageHealth: how good the product is physically (0–100)
  const damageHealth = 100 - damageScore;

  // Weighted final score: damage 70%, trust 30%
  const finalScore = damageHealth * 0.70 + trustScore * 0.30;

  let decision;
  if (finalScore >= 65) {
    decision = "BUY";       // → Recommended
  } else if (finalScore >= 40) {
    decision = "HOLD";      // → Outcome Uncertain
  } else {
    decision = "AVOID";     // → Not Recommended
  }

  // Confidence: how far from the nearest threshold boundary
  const distFromBoundary = Math.min(
    Math.abs(finalScore - 65),
    Math.abs(finalScore - 40)
  );
  const confidence = Number(
    Math.min(0.60 + (distFromBoundary / 25) * 0.37, 0.97).toFixed(3)
  );

  return { decision, confidence, finalScore: Math.round(finalScore) };
}

router.post("/", upload.single("image"), async (req, res) => {
  let filePath;

  try {
    if (!req.file) {
      return res.status(400).json({ error: "Image is required" });
    }

    filePath = req.file.path;

    // ======================================================
    // STEP 1 — DAMAGE DETECTION (runs for ALL categories)
    // ======================================================
    await ensureMlService();

    const formData = new FormData();
    formData.append("file", fs.createReadStream(filePath));

    const damageResponse = await mlServiceClient.post(
      "/predict-damage",
      formData,
      { headers: formData.getHeaders() }
    );

    const damagePenalty = Number(damageResponse.data.damage_penalty) || 0;
    const majorProbability = Number(damageResponse.data.major_probability) || 0;
    const minorProbability = Number(damageResponse.data.minor_probability) || 0;

    const {
      askingPrice = 0,
      brand = "",
      category = "",
      product_condition = 3,
      warranty_available = 0,
      documents_provided = 0,
      seller_id_proof = 0,
      original_box = 0,
      accessories_available = 0,
      seller_rating = 0,
    } = req.body;

    const askingPriceNum = Number(askingPrice) || 0;

    // ======================================================
    // STEP 2 — TRUST SCORE (same for all categories)
    // ======================================================
    const trustScore = calculateTrustScore({
      warranty_available: Number(warranty_available),
      documents_provided: Number(documents_provided),
      seller_id_proof: Number(seller_id_proof),
      original_box: Number(original_box),
      accessories_available: Number(accessories_available),
      seller_rating: Number(seller_rating),
    });

    // ======================================================
    // STEP 3 — VERDICT (damage-primary formula)
    // ======================================================
    const { decision, confidence, finalScore } = computeVerdict(
      damagePenalty,
      trustScore
    );

    // ======================================================
    // STEP 4 — PRICE CALCULATION
    // ======================================================

    // Brand base prices for mobile — kept for adjusted price calc
    const brandBasePrices = {
      Apple: 80000,
      Samsung: 60000,
      OnePlus: 50000,
      Xiaomi: 30000,
      Realme: 25000,
      Vivo: 28000,
      Oppo: 27000,
      Google: 65000,
    };

    let basePrice;
    if (category === "Mobile") {
      basePrice = brandBasePrices[brand] || 40000;
    } else {
      // For non-mobile, derive base from asking price (reverse-engineer)
      basePrice = askingPriceNum > 0 ? Math.round(askingPriceNum * 1.35) : 50000;
    }

    const trustPenalty = (100 - trustScore) / 1000;
    const adjustedPrice = Math.round(
      basePrice * (1 - damagePenalty) * (1 - trustPenalty)
    );

    // ======================================================
    // STEP 5 — EXPLANATION
    // ======================================================
    const explanation = generateExplanation({
      decision,
      confidence,
      damagePenalty,
      askingPrice: askingPriceNum,
      adjustedPrice,
      trustScore,
      majorProbability,
      minorProbability,
    });

    return res.json({
      damage: damageResponse.data,
      pricing: {
        asking_price: askingPriceNum,
        adjusted_price: adjustedPrice,
        estimated_market_value: basePrice,
      },
      decision,
      confidence,
      trust_score: trustScore,
      final_score: finalScore,        // useful for debugging / showing in UI
      explanation,
    });

  } catch (error) {
    if (isMlServiceUnavailableError(error)) {
      console.error(`ML service unavailable at ${ML_SERVICE_URL}:`, error.message);
      return res.status(503).json({
        error: "ML prediction service is unavailable. Please try again in a few seconds.",
      });
    }

    console.error("FULL ERROR:", error.response?.data || error.message);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
});

export default router;