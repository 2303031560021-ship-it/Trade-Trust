/* eslint-disable react/no-unknown-property */
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const Particles = ({ mouseX = 0, mouseY = 0, hovered }) => {
  const meshRef = useRef();
  const materialRef = useRef();
  const { viewport } = useThree();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const COUNT = 500;
  const APPEAR_DURATION = 2.5;

  const particles = useMemo(() => {
    const temp = [];
    const maxRadius = Math.max(viewport.width, viewport.height) * 0.75;

    for (let i = 0; i < COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.sqrt(Math.random()) * maxRadius;

      temp.push({
        angle,
        radius,
        baseX: Math.cos(angle) * radius,
        baseY: Math.sin(angle) * radius,
        driftOffset: Math.random() * Math.PI * 2,
        size: 0.65 + Math.random() * 0.6,
        wavePhase: Math.random() * Math.PI * 2,
        appearProgress: 0,
        appearDelay: (i / COUNT) * APPEAR_DURATION
      });
    }
    return temp;
  }, [viewport.width, viewport.height]);

  useFrame(({ clock }) => {
    if (!meshRef.current || !materialRef.current) return;
    const elapsed = clock.getElapsedTime();

    /* 🌈 FASTER + SMOOTHER RAINBOW COLOR */
    const hue = (elapsed * 0.12) % 1;  // 🔥 0.05 → 0.12 = 2.4x FASTER
    const smoothHue = Math.sin(elapsed * 0.15) * 0.5 * 0.3 + 0.5; // 🔥 Smooth sine wave
    materialRef.current.color.setHSL(
      (hue + smoothHue * 0.1) % 1,     // 🔥 Combined fast + smooth
      0.85,                           // 🔥 Slightly less saturation for smoothness
      0.48                            // 🔥 Slightly brighter
    );

    const mx = mouseX * viewport.width * 0.5;
    const my = mouseY * viewport.height * 0.5;

    particles.forEach((p, i) => {
      const appearTime = elapsed - p.appearDelay;
      if (appearTime > 0) {
        p.appearProgress += (1 - p.appearProgress) * 0.08;
      }

      let x = p.baseX;
      let y = p.baseY;

      if (!hovered) {
        const primaryWave = Math.sin(elapsed * 0.18 + p.wavePhase) * 5;
        const secondaryWave = Math.cos(elapsed * 0.22 + p.driftOffset) * 3;
        const tertiaryWave = Math.sin(elapsed * 0.12 + p.angle * 2) * 2;

        x += primaryWave + secondaryWave + tertiaryWave;
        y +=
          secondaryWave * 0.6 +
          tertiaryWave * 1.0 +
          Math.cos(elapsed * 0.2 + p.wavePhase) * 2.5;

        p.wavePhase += 0.008;
      } else {
        const dx = p.baseX - mx;
        const dy = p.baseY - my;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const wave =
          Math.sin(dist * 0.12 - elapsed * 2.5 + p.driftOffset) *
          Math.exp(-dist * 0.035) *
          6;

        const nx = dx / (dist + 0.001);
        const ny = dy / (dist + 0.001);

        x += nx * wave;
        y += ny * wave;
      }

      const z =
        Math.sin(elapsed * 0.6 + p.driftOffset + p.wavePhase * 0.5) * 2.0;

      dummy.position.set(x, y, z);

      const pulse =
        0.88 +
        Math.sin(elapsed * 1.4 + p.driftOffset + p.wavePhase) * 0.12;

      const scale = pulse * p.size * p.appearProgress;

      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, COUNT]}>
      <sphereGeometry args={[0.32, 16, 16]} />
      <meshBasicMaterial
        ref={materialRef}
        transparent
        opacity={0.9}
        fog={false}
      />
    </instancedMesh>
  );
};

const Antigravity = ({ mouseX, mouseY, hovered }) => (
  <Canvas
    camera={{ position: [0, 0, 110], fov: 45 }}
    gl={{ alpha: true, antialias: true }}
    style={{
      position: "absolute",
      inset: 0,
      pointerEvents: "none",
      zIndex: 1
    }}
  >
    <color attach="background" args={["transparent"]} />
    <Particles mouseX={mouseX} mouseY={mouseY} hovered={hovered} />
  </Canvas>
);

export default Antigravity;
