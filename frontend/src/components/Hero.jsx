import { useState, useCallback, useEffect } from "react";
import HeroTypewriter from "./HeroTypewriter";
import Antigravity from "./Antigravity";

import "./Hero.css";

const Hero = () => {
  const [showLowerSection, setShowLowerSection] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const typewriterTimer = setTimeout(() => {
      setTimeout(() => {
        setShowLowerSection(true);
      }, 500);
    }, 3800);

    const particlesTimer = setTimeout(() => {
      setShowParticles(true);
    }, 4300);

    return () => {
      clearTimeout(typewriterTimer);
      clearTimeout(particlesTimer);
    };
  }, []);

  const handleTypewriterComplete = useCallback(() => {
    setTimeout(() => {
      setShowLowerSection(true);
      setTimeout(() => {
        setShowParticles(true);
      }, 500);
    }, 500);
  }, []);

  const handleMouseMove = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    setMouse({ x, y });
    setHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHovered(false);
  }, []);

  return (
    <section
      id="home"
      className="hero"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* 🎨 BACKGROUND PARTICLES */}
      <div className={`hero-canvas-container ${showParticles ? "visible" : ""}`}>
        {showParticles && (
          <Antigravity
            mouseX={mouse.x}
            mouseY={mouse.y}
            hovered={hovered}
          />
        )}
      </div>

      {/* 📝 MAIN CONTENT */}
      <div className="hero-content">
        <h1 className="hero-heading">
          <HeroTypewriter
            text="Verify every deal with confidence."
            speed={45}
            onComplete={handleTypewriterComplete}
          />
        </h1>

        <div className={`hero-lower-section ${showLowerSection ? "visible" : ""}`}>
          <p className="hero-subheading">
            Make smarter buying decisions before you purchase
          </p>

          <div className="hero-buttons">
            <a href="/check" className="hero-btn-primary">
              Start Check
            </a>
            <button className="hero-btn-secondary">
              Learn More
            </button>
          </div>
        </div>
      </div>
      {/* ✅ WAVE CIRCLES REMOVED */}
    </section>
  );
};

export default Hero;
