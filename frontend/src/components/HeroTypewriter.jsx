import { useEffect, useRef, useState, useCallback } from "react";

const HeroTypewriter = ({ text, speed = 100, onComplete }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const elementRef = useRef(null);

  // Intersection Observer - start when visible
  const observerCallback = useCallback((entries) => {
    const [entry] = entries;
    if (entry.isIntersecting && !hasStarted && currentIndex === 0) {
      setHasStarted(true);
    }
  }, [hasStarted, currentIndex]);

  useEffect(() => {
    const observer = new IntersectionObserver(observerCallback, {
      threshold: 0.1
    });

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
      observer.disconnect();
    };
  }, [observerCallback]);

  // Typing effect
  useEffect(() => {
    if (!hasStarted || currentIndex >= text.length) return;

    const timeoutId = setTimeout(() => {
      setDisplayedText(prev => prev + text[currentIndex]);
      setCurrentIndex(prev => prev + 1);
    }, speed);

    return () => clearTimeout(timeoutId);
  }, [currentIndex, hasStarted, speed, text]);

  // 🔥 NEW: notify when typing finishes
  useEffect(() => {
    if (hasStarted && currentIndex === text.length) {
      onComplete?.();
    }
  }, [hasStarted, currentIndex, text.length, onComplete]);

  const showCursor = hasStarted && currentIndex < text.length;

  return (
    <span ref={elementRef} style={{ display: "inline-block" }}>
      {displayedText}
      {showCursor && (
        <span
          style={{
            display: "inline-block",
            width: "3px",
            height: "1.4em",
            marginLeft: "1px",
            verticalAlign: "middle",
            animation: "none",
            background: "linear-gradient(to bottom, #1e3a8a, #2563eb, #38bdf8)",
            borderRadius: "2px",
            boxShadow: "0 0 5px rgba(56, 189, 248, 0.5)"
          }}
        />
      )}
    </span>
  );
};

export default HeroTypewriter;
