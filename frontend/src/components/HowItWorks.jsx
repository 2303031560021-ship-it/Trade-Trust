import React, { useEffect, useRef, useState } from "react";
import "./HowItWorks.css";

import ParticleVisual from "./ParticleVisual";
import VerifyDealParticles from "./VerifyDealParticles";
import DecisionSealParticles from "./DecisionSealParticles";
import TypingText from "./TypingText";

const HowItWorks = () => {
  const sectionRef = useRef(null);
  const [startHeaderTyping, setStartHeaderTyping] = useState(false);

  const steps = [
    {
      title: "Enter the details",
      description: "Share basic product and seller information to get started.",
      Visual: ParticleVisual,
    },
    {
      title: "Verify the seller",
      description: "We analyze multiple trust and risk signals in real time.",
      Visual: VerifyDealParticles,
    },
    {
      title: "Decide smartly",
      description: "Get a clear recommendation on what to do next.",
      Visual: DecisionSealParticles,
    },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStartHeaderTyping(true);
          observer.disconnect();
        }
      },
      { threshold: 0 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section className="how-it-works" ref={sectionRef}>
      <div className="how-it-works-container">
        <div className="how-it-works-header">
          <h2 className="how-it-works-title">
            <TypingText text="How it works" speed={55} start={startHeaderTyping} />
          </h2>
          <p className="how-it-works-subtitle">
            <TypingText text="Three simple steps" speed={55} start={startHeaderTyping} />
          </p>
        </div>

        <div className="steps-wrapper">
          {steps.map((step, index) => (
            <StepRow
              key={index}
              step={step}
              isLast={index === steps.length - 1}
            />
          ))}
        </div>

        {/* --- TRADE TRUST WATERMARK --- */}
        <div className="watermark-footer">
          <h1 className="watermark-text">TradeTrust</h1>
        </div>
      </div>
    </section>
  );
};

const StepRow = ({ step, isLast }) => {
  const rowRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [startTyping, setStartTyping] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!rowRef.current) return;
      const rect = rowRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const triggerPoint = windowHeight * 0.6;
      const distance = triggerPoint - rect.top;
      const totalMove = rect.height;
      const p = Math.min(Math.max(distance / totalMove, 0), 1);
      setProgress(p * 100);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStartTyping(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    if (rowRef.current) observer.observe(rowRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="step-row" ref={rowRef}>
      <div className="step-visual">{step.Visual && <step.Visual />}</div>
      <div className="step-content">
        <h3 className="step-title">
          <TypingText text={step.title} speed={25} start={startTyping} />
        </h3>
        <p className="step-description">
          <TypingText text={step.description} speed={20} start={startTyping} />
        </p>
        {!isLast && (
          <div className="step-connector-track">
            <div className="step-connector-active" style={{ height: `${progress}%` }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default HowItWorks;