import { useEffect, useState } from "react";

const TypingText = ({ text, speed = 30, start }) => {
  const [value, setValue] = useState("");
  const [showCursor, setShowCursor] = useState(false);

  useEffect(() => {
    if (!start) return;

    let i = 0;
    setShowCursor(true);

    const interval = setInterval(() => {
      i++;
      setValue(text.slice(0, i));

      if (i >= text.length) {
        clearInterval(interval);
        setShowCursor(false);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, start]);

  return <>{value}</>;

};

export default TypingText;
