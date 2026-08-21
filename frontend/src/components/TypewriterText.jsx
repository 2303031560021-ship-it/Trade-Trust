import { useEffect, useRef, useState } from "react";

const TypewriterText = ({ text, speed = 16, cursor = "none" }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [hasStarted, setHasStarted] = useState(false);
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const elementRef = useRef(null);

  // Start typing only when visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.35 }
    );

    if (elementRef.current) observer.observe(elementRef.current);
    return () => observer.disconnect();
  }, [hasStarted]);

  // Typing logic (runs once)
  useEffect(() => {
    if (!hasStarted) return;

    let index = 0;
    setDisplayedText("");
    setIsTypingComplete(false);

    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText((prev) => prev + text.charAt(index));
        index++;
      } else {
        clearInterval(interval);
        setIsTypingComplete(true); // Mark typing as complete
      }
    }, speed);

    return () => clearInterval(interval);
  }, [hasStarted, text, speed]);

  // Show cursor ONLY for hero text (cursor="infinite") AND only after typing completes
  const showCursor = cursor === "infinite" && isTypingComplete;

  return (
  <span ref={elementRef}>
    {displayedText}
    {showCursor && (
      <span
        style={{
          display: "inline-block",
          width: "2px",
          height: "1.2em",
          marginLeft: "2px",
          verticalAlign: "middle",
          animation: "blink 1s infinite",
          background: "linear-gradient(to bottom, #1e3a8a, #2563eb, #38bdf8)",
          borderRadius: "2px"
        }}
      />
    )}
  </span>
);
};
export default TypewriterText;
