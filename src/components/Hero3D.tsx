import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float, Environment } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';

interface AnimatedBlobProps {
  isMorph?: boolean;
}

const AnimatedBlob: React.FC<AnimatedBlobProps> = ({ isMorph = false }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <Float
      speed={2}
      rotationIntensity={0.5}
      floatIntensity={0.5}
    >
      <Sphere
        ref={meshRef}
        args={[1.2, 64, 64]}
        scale={hovered ? 1.05 : 1}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <MeshDistortMaterial
          color={isMorph ? "#ff6b6b" : "#7ce7ff"}
          attach="material"
          distort={0.3}
          speed={1.5}
          roughness={0.4}
          metalness={0.3}
          clearcoat={0.8}
          clearcoatRoughness={0.2}
        />
      </Sphere>
    </Float>
  );
};

const Scene: React.FC<{ isMorph?: boolean }> = ({ isMorph }) => {
  return (
    <>
      <Environment preset="sunset" />
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={0.8} color="#7ce7ff" />
      <pointLight position={[-5, -5, -5]} intensity={0.4} color="#a084ff" />
      <directionalLight position={[0, 10, 5]} intensity={0.6} color="#ffffff" />
      <AnimatedBlob isMorph={isMorph} />
    </>
  );
};

interface Hero3DProps {
  isMorph?: boolean;
  fallback?: boolean;
}

export const Hero3D: React.FC<Hero3DProps> = ({ isMorph = false, fallback = false }) => {
  const [webGLSupported, setWebGLSupported] = useState(true);
  const [showFallback, setShowFallback] = useState(fallback);

  useEffect(() => {
    // Check WebGL support
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setWebGLSupported(false);
        setShowFallback(true);
      }
    } catch (e) {
      setWebGLSupported(false);
      setShowFallback(true);
    }
  }, []);

  if (showFallback || !webGLSupported) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <motion.div
          className={`w-48 h-48 rounded-full bg-gradient-to-br ${
            isMorph 
              ? 'from-danger/30 to-danger/10' 
              : 'from-accent-1/30 to-accent-2/10'
          } flex items-center justify-center backdrop-blur-sm border border-white/10`}
          animate={{
            scale: [1, 1.05, 1],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${
            isMorph 
              ? 'from-danger to-danger/50' 
              : 'from-accent-1 to-accent-2'
          } opacity-60`} />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-80 h-80 lg:w-96 lg:h-96">
        <Canvas
          camera={{ position: [0, 0, 4], fov: 50 }}
          dpr={[1, 2]}
          performance={{ min: 0.5 }}
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 0.8;
            gl.outputColorSpace = THREE.SRGBColorSpace;
          }}
        >
          <Suspense fallback={null}>
            <Scene isMorph={isMorph} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
};