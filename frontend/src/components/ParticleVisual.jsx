import { useEffect, useRef, useCallback } from "react";

/* ========= GEOMETRY DATA ========= */
const generateDenseLine = (x1, y1, x2, y2, points, isProtected = false) => {
  return Array.from({ length: points }, (_, i) => ({
    x: x1 + (x2 - x1) * (i / points),
    y: y1 + (y2 - y1) * (i / points),
    isProtected 
  }));
};

const generateDenseCurve = (x1, y1, cx, cy, x2, y2, points) => {
  return Array.from({ length: points }, (_, i) => {
    const t = i / points;
    const x = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * cx + t * t * x2;
    const y = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * cy + t * t * y2;
    return { x, y, isProtected: false };
  });
};

const radius = 0.03; 

const SHAPES = {
  form: [
    ...generateDenseLine(0.30 + radius, 0.18, 0.67 - radius, 0.18, 60),
    ...generateDenseCurve(0.67 - radius, 0.18, 0.67, 0.18, 0.67, 0.18 + radius, 15),
    ...generateDenseLine(0.67, 0.18 + radius, 0.67, 0.88 - radius, 70),
    ...generateDenseCurve(0.67, 0.88 - radius, 0.67, 0.88, 0.67 - radius, 0.88, 15),
    ...generateDenseLine(0.67 - radius, 0.88, 0.30 + radius, 0.88, 60),
    ...generateDenseCurve(0.30 + radius, 0.88, 0.30, 0.88, 0.30, 0.88 - radius, 15),
    ...generateDenseLine(0.30, 0.88 - radius, 0.30, 0.18 + radius, 70),
    ...generateDenseCurve(0.30, 0.18 + radius, 0.30, 0.18, 0.30 + radius, 0.18, 15),
    ...generateDenseLine(0.40, 0.38, 0.57, 0.38, 35, true),
    ...generateDenseLine(0.40, 0.52, 0.57, 0.52, 35, true),
    ...generateDenseLine(0.40, 0.66, 0.50, 0.66, 30, true),
    ...generateDenseLine(0.33, 0.21, 0.64, 0.21, 30),
    ...generateDenseLine(0.64, 0.21, 0.64, 0.85, 30),
    ...generateDenseLine(0.64, 0.85, 0.33, 0.85, 50),
    ...generateDenseLine(0.33, 0.85, 0.33, 0.21, 30),
    ...generateDenseLine(0.45, 0.18, 0.45, 0.14, 15),
    ...generateDenseLine(0.45, 0.14, 0.52, 0.14, 20),
    ...generateDenseLine(0.52, 0.14, 0.52, 0.18, 15),
    ...generateDenseLine(0.43, 0.17, 0.54, 0.17, 20),
    ...generateDenseLine(0.70, 0.25, 0.70, 0.70, 60),
    ...generateDenseLine(0.74, 0.25, 0.74, 0.70, 60),
    ...generateDenseLine(0.70, 0.70, 0.72, 0.80, 25),
    ...generateDenseLine(0.74, 0.70, 0.72, 0.80, 25),
  ],
};

const ParticleVisual = () => {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const rafRef = useRef(null);
  const hueRef = useRef(200); 
  const hoveredRef = useRef(false);
  const timeRef = useRef(0);

  const GLOBAL_SIZE = 1.2;
  const GLOBAL_ALPHA = 0.7;
  
  const FORMATION_SPEED = 0.1; 
  const DISSOLVE_SPEED = 0.008; 
  const IDLE_DRIFT = 0.0008; 

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    
    ctx.clearRect(0, 0, rect.width, rect.height);
    
    let hueStep = hoveredRef.current ? 0.12 : 0.03;
    hueRef.current = (hueRef.current + hueStep) % 360;
    
    if (hueRef.current > 30 && hueRef.current < 170) {
      hueRef.current = 170; 
    }
    let displayHue = hueRef.current;

    timeRef.current += 0.008;
    const isHovered = hoveredRef.current;
    const particles = particlesRef.current;

    let arrivedCount = 0;
    let assignedCount = 0;
    particles.forEach(p => {
      if (p.isAssigned) {
        assignedCount++;
        const dx = (p.shapeTarget.x * rect.width) - p.x;
        const dy = (p.shapeTarget.y * rect.height) - p.y;
        if (Math.sqrt(dx*dx + dy*dy) < 1.2) arrivedCount++;
      }
    });
    
    const isFullyFormed = arrivedCount / assignedCount > 0.98;

    if (isHovered && isFullyFormed) {
      particles.forEach((p) => {
        if (p.isAssigned && p.isExchanger && !p.shapeTarget.isProtected && Math.random() < 0.0004) {
          const idleIdx = particles.findIndex(other => !other.isAssigned);
          if (idleIdx !== -1) {
            const target = p.shapeTarget;
            p.shapeTarget = null;
            p.isAssigned = false;
            particles[idleIdx].shapeTarget = target;
            particles[idleIdx].isAssigned = true;
            particles[idleIdx].isTransferring = true;
            particles[idleIdx].isExchanger = true; 
            p.isExchanger = false;
          }
        }
      });
    }

    particles.forEach((p) => {
      const dotBreath = (Math.sin(timeRef.current * 1.5 + p.breathPhase) + 1) / 2;
      let targetX, targetY, speed;

      if (isHovered && p.shapeTarget) {
        targetX = p.shapeTarget.x * rect.width;
        targetY = p.shapeTarget.y * rect.height;
        speed = p.isTransferring ? 0.0015 : FORMATION_SPEED; 
      } else {
        targetX = p.homeX;
        targetY = p.homeY;
        speed = DISSOLVE_SPEED;
      }

      p.x += (targetX - p.x) * speed;
      p.y += (targetY - p.y) * speed;

      if (!isHovered) {
        p.homeX += (Math.random() - 0.5) * 0.005; 
        p.homeY += (Math.random() - 0.5) * 0.005;
      }

      if (p.isTransferring && Math.abs(p.x - targetX) < 0.2) p.isTransferring = false;

      ctx.beginPath();
      const s = 85; 
      const l = p.isDarkVariant ? 25 : 40 + (dotBreath * 12);
      ctx.fillStyle = `hsla(${displayHue}, ${s}%, ${l}%, ${GLOBAL_ALPHA})`;
      ctx.arc(p.x, p.y, GLOBAL_SIZE, 0, Math.PI * 2);
      ctx.fill();
    });

    rafRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // FIND THE ROW TRIGGER TO START FORMATION
    const parentRow = canvas.closest('.step-row');

    const resize = () => {
      const parent = canvas.parentElement;
      canvas.width = parent.clientWidth * window.devicePixelRatio;
      canvas.height = parent.clientHeight * window.devicePixelRatio;
      canvas.getContext("2d").scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    window.addEventListener("resize", resize);
    resize();

    const onEnter = () => { hoveredRef.current = true; };
    const onLeave = () => { hoveredRef.current = false; };

    // Attach listeners to the row container
    if (parentRow) {
      parentRow.addEventListener("mouseenter", onEnter);
      parentRow.addEventListener("mouseleave", onLeave);
    }

    const rect = canvas.getBoundingClientRect();
    const shapePoints = SHAPES.form;
    const totalDots = 2300; 
    const tempParticles = [];

    for (let i = 0; i < totalDots; i++) {
      const assigned = i < shapePoints.length;
      tempParticles.push({
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        homeX: Math.random() * rect.width,
        homeY: Math.random() * rect.height,
        shapeTarget: assigned ? shapePoints[i] : null,
        isAssigned: assigned,
        isDarkVariant: Math.random() > 0.85, 
        breathPhase: Math.random() * Math.PI * 2,
        isTransferring: false,
        isExchanger: Math.random() < 0.05 
      });
    }

    particlesRef.current = tempParticles;
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

  return <canvas ref={canvasRef} className="particle-canvas" style={{ cursor: 'default' }} />;
};

export default ParticleVisual;