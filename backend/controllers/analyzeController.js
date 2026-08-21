import { generateDecision } from "../services/decisionEngine.js";

export const analyzeDeal = (req, res) => {
  try {
    const dealData = req.body;

    const result = generateDecision(dealData);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Analysis failed" });
  }
};  