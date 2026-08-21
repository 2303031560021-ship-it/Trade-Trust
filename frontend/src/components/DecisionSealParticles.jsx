import { useEffect, useRef, useCallback } from "react";

/* ========= GEOMETRY UTILITIES ========= */
const generateDenseLine = (x1, y1, x2, y2, points) => {
  return Array.from({ length: points }, (_, i) => ({
    x: x1 + (x2 - x1) * (i / points),
    y: y1 + (y2 - y1) * (i / points),
  }));
};

const generateDenseCircle = (cx, cy, r, points, startAngle = 0, endAngle = Math.PI * 2) => {
  return Array.from({ length: points }, (_, i) => {
    const ang = startAngle + (i / points) * (endAngle - startAngle);
    return { x: cx + Math.cos(ang) * r, y: cy + Math.sin(ang) * r };
  });
};

const SHAPES = {
  seal: [
    // 1. OUTER CIRCLE (Double Layer)
    ...generateDenseCircle(0.50, 0.50, 0.25, 300),
    ...generateDenseCircle(0.50, 0.50, 0.24, 250),

    // 2. INNER CIRCLE (Double Layer)
    ...generateDenseCircle(0.50, 0.50, 0.21, 200),
    ...generateDenseCircle(0.50, 0.50, 0.20, 180),

    // 3. CHECKMARK (Double Layer)
    // First segment (Left short side)
    ...generateDenseLine(0.42, 0.50, 0.48, 0.56, 40),
    ...generateDenseLine(0.425, 0.505, 0.485, 0.565, 30),
    // Second segment (Right long side)
    ...generateDenseLine(0.48, 0.56, 0.60, 0.42, 70),
    ...generateDenseLine(0.485, 0.565, 0.605, 0.425, 60),
  ],
};

const DecisionSealParticles = () => {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const rafRef = useRef(null);
  const hueRef = useRef(190); 
  const hoveredRef = useRef(false);
  const timeRef = useRef(0);

  const GLOBAL_SIZE = 1.3; 
  const GLOBAL_ALPHA = 0.8;
  const FORMATION_SPEED = 0.06;
  const DISSOLVE_SPEED = 0.015;

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Gradient shift between deep blue and soft blue
    hueRef.current = 195 + Math.sin(timeRef.current) * 15;
    timeRef.current += 0.01;
    const isHovered = hoveredRef.current;

    particlesRef.current.forEach((p) => {
      const dotBreath = (Math.sin(timeRef.current * 2 + p.breathPhase) + 1) / 2;
      let targetX, targetY, speed;

      if (isHovered && p.shapeTarget) {
        targetX = p.shapeTarget.x * rect.width;
        targetY = p.shapeTarget.y * rect.height;
        speed = FORMATION_SPEED;
      } else {
        targetX = p.homeX;
        targetY = p.homeY;
        speed = DISSOLVE_SPEED;
      }

      p.x += (targetX - p.x) * speed;
      p.y += (targetY - p.y) * speed;

      if (!isHovered) {
        p.homeX += Math.sin(timeRef.current + p.breathPhase) * 0.1;
        p.homeY += Math.cos(timeRef.current + p.breathPhase) * 0.1;
      }

      ctx.beginPath();
      // Lightness adjustment for SaaS white background feel
      const brightness = p.isDarkVariant ? 35 : 55 + dotBreath * 15;
      ctx.fillStyle = `hsla(${hueRef.current}, 85%, ${brightness}%, ${GLOBAL_ALPHA})`;
      
      ctx.arc(p.x, p.y, GLOBAL_SIZE, 0, Math.PI * 2);
      ctx.fill();

      if (p.isDarkVariant && isHovered) {
        ctx.shadowBlur = 8;
        ctx.shadowColor = `hsla(${hueRef.current}, 100%, 70%, 0.4)`;
      } else {
        ctx.shadowBlur = 0;
      }
    });

    rafRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parentRow = canvas.closest('.step-row');

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.clientWidth * window.devicePixelRatio;
      canvas.height = parent.clientHeight * window.devicePixelRatio;
      canvas.getContext("2d").setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
    };

    window.addEventListener("resize", resize);
    resize();

    const onEnter = () => { hoveredRef.current = true; };
    const onLeave = () => { hoveredRef.current = false; };

    if (parentRow) {
      parentRow.addEventListener("mouseenter", onEnter);
      parentRow.addEventListener("mouseleave", onLeave);
    }

    const rect = canvas.getBoundingClientRect();
    const shapePoints = SHAPES.seal;
    
    particlesRef.current = Array.from({ length: 2800 }, (_, i) => ({
      x: Math.random() * rect.width,
      y: Math.random() * rect.height,
      homeX: Math.random() * rect.width,
      homeY: Math.random() * rect.height,
      shapeTarget: i < shapePoints.length ? shapePoints[i] : null,
      isDarkVariant: Math.random() > 0.8,
      breathPhase: Math.random() * Math.PI * 2,
    }));

    animate();
    
    return () => {
      window.removeEventListener("resize", resize);
      if (parentRow) {
        parentRow.removeEventListener("mouseenter", onEnter);
        parentRow.removeEventListener("mouseleave", onLeave);
      }
      cancelAnimationFrame(rafRef.current);
    };
  }, [animate]);

  return (
    <div style={{ width: "100%", height: "100%", backgroundColor: "transparent"}}>
      <canvas 
        ref={canvasRef} 
        style={{ cursor: "default", display: "block", width: "100%", height: "100%" }} 
      />
    </div>
  );
};
export default DecisionSealParticles;