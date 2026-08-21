import React from "react";
import "./Features.css";
import TypewriterText from "./TypewriterText";

import hp1 from "../assets/hp1.png";
import hp2 from "../assets/hp2.png";
import hp3 from "../assets/hp3.png";

const Features = () => {
  const features = [
    {
      title: "Deal Fairness Analyzer",
      description:
       " Compares the seller's asking price against real damage data and market benchmarks to instantly tell you if you're overpaying.",
      image: hp1,
    },
    {
      title: "Seller Credibility Check",
      description:
       " Scores seller trustworthiness based on documents, warranty, accessories, and verification history — so you know who you're buying from.",
      image: hp2,
    },
    {
      title: "Risk & Scam Warnings",
      description:
        " Flags missing documents, overpriced listings, and unverified sellers — giving you a clear warning before you commit to a risky deal.",
      image: hp3,
    },
  ];

  return (
    <section id="features" className="features">
      <div className="features-bg" />

      <div className="features-container">
        <div className="features-header">
          <h2 className="features-title">
            <TypewriterText
              text="TradeTrust verifies every deal intelligently by evaluating pricing and credibility to protect buyers from scams."
              speed={22}
              cursor="infinite"
            />
          </h2>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div
              key={index}
              className="feature-row"
              style={{ "--index": index }}
            >
              <div className="feature-text">
                <h3 className="feature-card-title">{feature.title}</h3>
                <p className="feature-card-description">
                  <TypewriterText text={feature.description} speed={16} />
                </p>
              </div>

              <div className="feature-visual">
                <img src={feature.image} alt={feature.title} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
