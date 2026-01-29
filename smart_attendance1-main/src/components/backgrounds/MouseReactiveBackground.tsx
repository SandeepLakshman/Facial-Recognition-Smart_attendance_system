import { Canvas } from '@react-three/fiber';
import { Points, PointMaterial, Float } from '@react-three/drei';
import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function Particles({ count = 2000 }) {
  const mesh = useRef<THREE.Points>(null);
  
  // Generate random positions for particles
  const positions = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return positions;
  }, [count]);

  useFrame((state) => {
    if (mesh.current) {
      // Rotate particles based on mouse position
      mesh.current.rotation.x = state.mouse.y * 0.1;
      mesh.current.rotation.y = state.mouse.x * 0.1;
    }
  });

  return (
    <Points ref={mesh} positions={positions} stride={3}>
      <PointMaterial
        transparent
        color="#00ff88"
        size={0.02}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.6}
      />
    </Points>
  );
}

interface MouseReactiveBackgroundProps {
  children?: React.ReactNode;
}

export function MouseReactiveBackground({ children }: MouseReactiveBackgroundProps) {
  return (
    <div className="relative min-h-screen">
      {/* Three.js Canvas */}
      <div className="fixed inset-0 -z-10">
        <Canvas camera={{ position: [0, 0, 1] }}>
          <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
            <Particles count={1500} />
          </Float>
        </Canvas>
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}