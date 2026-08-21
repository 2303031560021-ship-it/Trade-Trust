# TradeTrust

### AI-Powered Second-Hand Product Deal Analyzer

TradeTrust is an AI-powered web application designed to help users evaluate second-hand electronic products before making a purchase.

It analyzes the physical condition of a product, evaluates seller and product trust signals, estimates a fair value, and generates a final BUY / HOLD / AVOID recommendation.

## 🚀 Live Demo

👉 https://trade-trust-jet.vercel.app/

---

## 📌 Problem Statement

Buying second-hand electronics can be risky because users often have difficulty determining:

- Whether the product has visible damage
- Whether the asking price is reasonable
- Whether the seller and product can be trusted
- Whether the deal is actually worth buying

TradeTrust combines AI-based image analysis with product and seller information to provide a simple and understandable deal recommendation.

---

## ✨ Features

- 🔍 AI-based product damage detection
- 💰 Fair value estimation
- 🛡️ Product and seller trust scoring
- 🧠 BUY / HOLD / AVOID recommendation
- 📊 Final deal score
- 💾 Save and retrieve previous results
- 👤 User authentication with Clerk
- 📱 Multiple second-hand electronics categories
- ⚡ Browser-based AI inference using ONNX Runtime Web

### Supported Categories

- Mobile
- Laptop
- Tablet
- TV
- Smartwatch
- Washing Machine
- Headphones

---

## 🤖 AI / Machine Learning

### Damage Detection

The damage detection model is based on EfficientNet-B3.

It classifies product images into three categories:

| Class | Meaning |
|---|---|
| Major Damage | Significant visible damage |
| Minor Damage | Minor visible damage |
| No Damage | No significant visible damage |

The trained PyTorch model was converted to ONNX so that damage inference can run directly inside the user's browser using ONNX Runtime Web.

### Why ONNX?

Originally, the ML model was intended to run as a separate Python ML service.

The final architecture uses ONNX Runtime Web for damage detection.

Benefits include:

- Browser-side inference
- Reduced backend ML workload
- No need to send the product image to the ML server for damage detection
- Easier frontend deployment
- Faster interaction after the model is loaded

---

## 🧮 Deal Evaluation

TradeTrust evaluates a deal using three major components.

### 1. Damage Penalty

The damage probabilities are converted into a damage penalty:

Damage Penalty =

Major Damage Probability × 0.40

+

Minor Damage Probability × 0.15

### 2. Trust Score

The trust score evaluates signals such as:

- Warranty availability
- Documents provided
- Seller ID proof
- Original box
- Accessories
- Seller rating

### 3. Final Deal Score

Physical condition is given higher importance than trust.

Final Score =

Damage Health × 70%

+

Trust Score × 30%

The final recommendation is:

- Final Score >= 65 → BUY
- Final Score 40–64 → HOLD
- Final Score < 40 → AVOID

---

## 🏗️ System Architecture

```text
                    ┌──────────────────────┐
                    │        USER          │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │       VERCEL         │
                    │   React Frontend     │
                    └──────────┬───────────┘
                               │
                 ┌─────────────┴─────────────┐
                 │                           │
                 ▼                           ▼
       ┌──────────────────┐       ┌──────────────────┐
       │ ONNX Runtime Web │       │  RENDER BACKEND  │
       │                  │       │  Node + Express  │
       │ Damage Detection │       │                  │
       └──────────────────┘       │ Trust / Verdict  │
                                  │ Pricing / Results │
                                  └────────┬─────────┘
                                           │
                                           ▼
                                  ┌──────────────────┐
                                  │  MONGODB ATLAS   │
                                  │                  │
                                  │ Saved Results    │
                                  └──────────────────┘
