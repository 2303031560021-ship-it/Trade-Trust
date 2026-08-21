// trustScore.js
// Returns 0–100. No base padding — score is earned, not given.
//
// Weight breakdown (max 100):
//   Warranty Card        → 25  (strongest trust signal)
//   Original Bill        → 20
//   Seller ID Proof      → 15
//   Original Box         → 15
//   Accessories          → 10
//   Seller Rating        → 15

function calculateTrustScore({
  warranty_available,
  documents_provided,
  seller_id_proof,
  original_box,
  accessories_available,
  seller_rating,
}) {
  let trustScore = 0;

  if (warranty_available)    trustScore += 25;
  if (documents_provided)    trustScore += 20;
  if (seller_id_proof)       trustScore += 15;
  if (original_box)          trustScore += 15;
  if (accessories_available) trustScore += 10;

  // Seller rating contribution (max 15)
  if (seller_rating >= 4.5)      trustScore += 15;
  else if (seller_rating >= 4.0) trustScore += 10;
  else if (seller_rating >= 3.0) trustScore += 6;
  else if (seller_rating >= 2.0) trustScore += 3;

  return Math.min(trustScore, 100);
}

export default calculateTrustScore;