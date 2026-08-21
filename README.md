# TradeTrust

### AI-Powered Second-Hand Product Deal Analyzer

TradeTrust is an AI-powered web application designed to help users evaluate second-hand electronic products before making a purchase.

It analyzes the **physical condition of a product**, evaluates **seller/product trust signals**, estimates a **fair value**, and generates a final **BUY / HOLD / AVOID** recommendation.

## 🚀 Live Demo

**[Open TradeTrust](https://trade-trust-jet.vercel.app/)**

---

## 📌 Problem Statement

Buying second-hand electronics can be risky because users often have difficulty determining:

- Whether the product has visible damage
- Whether the asking price is reasonable
- Whether the seller and product can be trusted
- Whether the deal is actually worth buying

TradeTrust combines AI-based image analysis with product and seller information to provide a simple, understandable deal recommendation.

---

## ✨ Features

- 🔍 **AI Damage Detection**
  - Detects major damage, minor damage, and no damage from a product image.
  - Uses an EfficientNet-B3 based deep learning model.
  - Model inference runs directly in the browser using ONNX Runtime Web.

- 💰 **Fair Value Estimation**
  - Estimates an adjusted fair value based on product information and detected damage.

- 🛡️ **Trust Score**
  - Evaluates trust signals such as:
    - Warranty availability
    - Documents
    - Seller ID proof
    - Original box
    - Accessories
    - Seller rating

- 🧠 **Smart Deal Recommendation**
  - Generates one of three decisions:
    - `BUY`
    - `HOLD`
    - `AVOID`

- 📊 **Final Deal Score**
  - Combines physical product condition and trust score to calculate an overall deal score.

- 💾 **Save Results**
  - Users can save their analyzed deals.
  - Saved results are stored in MongoDB Atlas.

- 👤 **User Authentication**
  - Uses Clerk for user authentication.

- 📱 **Multiple Product Categories**
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

The damage detection model is based on:

**EfficientNet-B3**

The model classifies product images into:

| Class | Meaning |
|---|---|
| Major Damage | Significant visible damage |
| Minor Damage | Minor visible damage |
| No Damage | No significant visible damage |

The model was converted to **ONNX** so that inference can run directly inside the user's browser.

### Why ONNX?

Originally, the ML model was intended to run as a separate Python ML service.

The final architecture uses ONNX Runtime Web instead.

This provides:

- Browser-side inference
- No image upload required for damage inference
- Lower backend ML workload
- Faster interaction after the model is loaded
- Easier deployment of the frontend

---

## 🧮 Deal Evaluation

TradeTrust uses three major components:

### 1. Damage Score

The damage probabilities are converted into a damage penalty.

```text
Damage Penalty =
Major Damage Probability × 0.40
+
Minor Damage Probability × 0.15
