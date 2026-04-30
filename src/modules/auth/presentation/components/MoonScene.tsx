import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Stars } from '@react-three/drei';
import * as THREE from 'three';

/** Luna 3D — esfera más pequeña con textura lunar realista */
function Moon() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y += 0.002;
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.05;
  });

  return (
    <group position={[0, 0.5, 0]}>
      {/* Luna principal — más pequeña y con apariencia de media luna */}
      <Sphere ref={meshRef} args={[0.9, 64, 64]}>
        <MeshDistortMaterial
          color="#1a3a2a"
          emissive="#2dd4a8"
          emissiveIntensity={0.12}
          roughness={0.85}
          metalness={0.1}
          distort={0.08}
          speed={1.2}
        />
      </Sphere>

      {/* Glow alrededor de la luna */}
      <Sphere args={[0.95, 32, 32]}>
        <meshBasicMaterial
          color="#2dd4a8"
          transparent
          opacity={0.04}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Glow exterior más grande y difuso */}
      <Sphere args={[1.2, 32, 32]}>
        <meshBasicMaterial
          color="#2dd4a8"
          transparent
          opacity={0.015}
          side={THREE.BackSide}
        />
      </Sphere>
    </group>
  );
}

/** Anillo orbital delgado */
function OrbitalRing() {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ringRef.current) return;
    ringRef.current.rotation.x = Math.PI / 2.2 + Math.sin(state.clock.elapsedTime * 0.4) * 0.03;
    ringRef.current.rotation.z += 0.0015;
  });

  return (
    <mesh ref={ringRef} position={[0, 0.5, 0]}>
      <torusGeometry args={[1.5, 0.008, 16, 120]} />
      <meshBasicMaterial color="#2dd4a8" transparent opacity={0.25} />
    </mesh>
  );
}

/** Partículas de polvo estelar cercanas a la luna */
function NearParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  const count = 50;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Distribuir en un área más concentrada alrededor de la luna
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1.5 + Math.random() * 2.5;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) + 0.5;
      pos[i * 3 + 2] = r * Math.cos(phi) * 0.5;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (!particlesRef.current) return;
    particlesRef.current.rotation.y = state.clock.elapsedTime * 0.015;
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#2dd4a8"
        size={0.02}
        transparent
        opacity={0.5}
        sizeAttenuation
      />
    </points>
  );
}

/**
 * Escena espacial completa: campo de estrellas profundo + luna + anillo + partículas.
 * El campo de estrellas (Stars de drei) crea la sensación de espacio exterior.
 */
export default function MoonScene() {
  return (
    <div className="moon-scene-container">
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 50 }}
        style={{ background: 'transparent' }}
        gl={{ antialias: true, alpha: true }}
      >
        {/* Campo de estrellas profundo — sensación de espacio exterior */}
        <Stars
          radius={80}
          depth={60}
          count={2500}
          factor={3}
          saturation={0}
          fade
          speed={0.5}
        />

        {/* Iluminación dramática — luz lateral para efecto de media luna */}
        <ambientLight intensity={0.08} />
        <directionalLight
          position={[4, 2, 3]}
          intensity={1.2}
          color="#ffffff"
        />
        <pointLight position={[-4, 1, -2]} intensity={0.15} color="#2dd4a8" />
        <pointLight position={[1, -3, 2]} intensity={0.08} color="#115e4a" />

        {/* Escena */}
        <Moon />
        <OrbitalRing />
        <NearParticles />
      </Canvas>
    </div>
  );
}
