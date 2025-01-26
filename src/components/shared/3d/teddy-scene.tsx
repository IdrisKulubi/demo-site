"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef, useState, useEffect } from "react";
import { Float, Environment } from "@react-three/drei";
import * as THREE from "three";
import { useSpring, animated } from "@react-spring/three";
import { useMusic } from "@/context/music-context";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AnimatedGroup = animated("group") as unknown as React.FC<any>;

function TeddyBear({
  position = [0, 0, 0],
}: {
  position?: [number, number, number];
}) {
  const meshRef = useRef<THREE.Group>(null);
  const [isWaving, setIsWaving] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  const { viewport } = useThree();
  const { isPlaying, toggleMusic } = useMusic();

  // Animation springs
  const { rotation, scale } = useSpring({
    rotation: isPlaying ? [0, Math.PI * 2, 0] : [0, 0, 0],
    scale: isHovered ? 1.2 : 1,
    config: { tension: 120, friction: 14 },
  });

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Create basic teddy bear shapes with materials
  const createTeddyGeometry = () => {
    const body = new THREE.Group();
    const material = new THREE.MeshStandardMaterial({
      color: "#ff6b6b",
      roughness: 0.6,
      metalness: 0.1,
      emissive: "#ff4040",
      emissiveIntensity: 0.3,
    });

    // Main body sphere
    const bodyGeom = new THREE.SphereGeometry(1, 32, 32);
    const bodyMesh = new THREE.Mesh(bodyGeom, material);
    bodyMesh.scale.set(1, 1.2, 0.8);
    body.add(bodyMesh);

    // Head
    const headGeom = new THREE.SphereGeometry(0.6, 32, 32);
    const headMesh = new THREE.Mesh(headGeom, material);
    headMesh.position.y = 1.2;
    body.add(headMesh);

    // Ears
    const earGeom = new THREE.SphereGeometry(0.2, 32, 32);
    const leftEar = new THREE.Mesh(earGeom, material);
    const rightEar = new THREE.Mesh(earGeom, material);
    leftEar.position.set(-0.4, 1.6, 0);
    rightEar.position.set(0.4, 1.6, 0);
    body.add(leftEar, rightEar);

    // Arms
    const armGeom = new THREE.CapsuleGeometry(0.2, 0.6, 8, 8);
    const leftArm = new THREE.Mesh(armGeom, material);
    const rightArm = new THREE.Mesh(armGeom, material);
    leftArm.position.set(-0.8, 0.3, 0);
    rightArm.position.set(0.8, 0.3, 0);
    leftArm.rotation.z = Math.PI / 4;
    rightArm.rotation.z = -Math.PI / 4;
    body.add(leftArm, rightArm);

    // Eyes
    const eyeGeom = new THREE.SphereGeometry(0.08, 16, 16);
    const eyeMaterial = new THREE.MeshStandardMaterial({
      color: "#000000",
      emissive: "#ffffff",
      emissiveIntensity: 0.2,
    });
    const leftEye = new THREE.Mesh(eyeGeom, eyeMaterial);
    const rightEye = new THREE.Mesh(eyeGeom, eyeMaterial);
    leftEye.position.set(-0.2, 1.3, 0.5);
    rightEye.position.set(0.2, 1.3, 0.5);
    body.add(leftEye, rightEye);

    // Nose
    const noseGeom = new THREE.SphereGeometry(0.1, 16, 16);
    const noseMaterial = new THREE.MeshStandardMaterial({
      color: "#ff4040",
      emissive: "#ff0000",
      emissiveIntensity: 0.3,
    });
    const nose = new THREE.Mesh(noseGeom, noseMaterial);
    nose.position.set(0, 1.1, 0.5);
    body.add(nose);

    return body;
  };

  useFrame((state) => {
    if (!meshRef.current) return;

    // Base floating motion
    const floatY = Math.sin(state.clock.elapsedTime) * 0.1;

    // Jump animation with smoother easing
    const jumpY = isJumping
      ? Math.sin(state.clock.elapsedTime * 8) *
        0.4 *
        (1 - Math.abs(Math.sin(state.clock.elapsedTime * 8)))
      : 0;

    // Combine animations with smoother transitions
    const targetY = floatY + jumpY;
    meshRef.current.position.y += (targetY - meshRef.current.position.y) * 0.1;

    // Rotation on hover with smooth interpolation
    const targetRotationY = isHovered
      ? Math.sin(state.clock.elapsedTime * 2) * 0.3
      : 0;
    meshRef.current.rotation.y +=
      (targetRotationY - meshRef.current.rotation.y) * 0.1;

    // Waving animation with improved timing
    if (isWaving || isHovered) {
      const rightArm = meshRef.current.children[4];
      const waveAngle =
        -Math.PI / 4 + Math.sin(state.clock.elapsedTime * 8) * 0.5;
      rightArm.rotation.z += (waveAngle - rightArm.rotation.z) * 0.2;
    }

    // Head tracking with smoother movement
    if (isHovered) {
      const head = meshRef.current.children[1];
      const targetX = isMobile ? 0 : state.pointer.x * viewport.width * 0.5;
      const targetY = isMobile
        ? 1.2
        : state.pointer.y * viewport.height * 0.3 + 1.2;
      const currentPos = new THREE.Vector3();
      head.getWorldPosition(currentPos);
      const targetPos = new THREE.Vector3(targetX, targetY, 5);
      currentPos.lerp(targetPos, 0.1);
      head.lookAt(currentPos);
    }
  });

  const handleInteraction = () => {
    if (!isJumping && !isWaving) {
      setIsJumping(true);
      setIsWaving(true);
      toggleMusic();

      // Sequence animations
      setTimeout(() => setIsJumping(false), 800);
      setTimeout(() => setIsWaving(false), 1600);

      // Show speech bubble with better positioning
      if (typeof window !== "undefined") {
        const existingBubble = document.querySelector(".speech-bubble");
        if (existingBubble) {
          existingBubble.remove();
        }

        const bubble = document.createElement("div");
        bubble.className = "speech-bubble";
        bubble.textContent = getRandomMessage();
        document.body.appendChild(bubble);

        // Position bubble relative to teddy
        const rect = document
          .querySelector(".teddy-container")
          ?.getBoundingClientRect();
        if (rect) {
          bubble.style.left = `${rect.left + rect.width * 0.5}px`;
          bubble.style.bottom = `${window.innerHeight - rect.top + 20}px`;
        }

        setTimeout(() => bubble.remove(), 2000);
      }
    }
  };

  const getRandomMessage = () => {
    const messages = [
      "Happy Valentine's! 💝",
      "Looking for love? 💕",
      "Click to find your match! 💘",
      "You're amazing! ✨",
      "Spread the love! 🌹",
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <AnimatedGroup
        ref={meshRef}
        position={position}
        onClick={handleInteraction}
        onPointerEnter={() => setIsHovered(true)}
        onPointerLeave={() => setIsHovered(false)}
        onPointerDown={(e: { stopPropagation: () => void }) => {
          e.stopPropagation();
          setIsHovered(true);
          handleInteraction();
        }}
        onPointerUp={() => setIsHovered(false)}
        style={{ rotation, scale }}
      >
        <primitive object={createTeddyGeometry()} />
      </AnimatedGroup>
    </Float>
  );
}

// Add this new component for music visualization
function MusicVisualizer({ playing }: { playing: boolean }) {
  const bars = 5;

  return (
    <div className="fixed bottom-16 left-52 flex gap-1 items-end h-8 z-20">
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          className={`w-1 bg-pink-500 rounded-t transition-all duration-300 ${
            playing ? "animate-musicBar" : "h-1"
          }`}
          style={{
            animationDelay: `${i * 0.1}s`,
            height: playing ? "8px" : "4px",
          }}
        />
      ))}
    </div>
  );
}

// Enhanced music controls with volume slider
function MusicControls() {
  const { isPlaying, volume, toggleMusic, setVolume } = useMusic();
  const [showVolume, setShowVolume] = useState(false);

  return (
    <div className="fixed bottom-4 left-52 z-20 flex items-center gap-4">
      <button
        onClick={toggleMusic}
        className="bg-pink-500 hover:bg-pink-600 text-white rounded-full p-3 shadow-lg transition-all transform hover:scale-110"
        onMouseEnter={() => setShowVolume(true)}
      >
        {isPlaying ? (
          <span className="animate-pulse">🎵</span>
        ) : (
          <span>🎵</span>
        )}
      </button>

      <div
        className={`transition-all duration-300 overflow-hidden flex items-center gap-2 ${
          showVolume ? "w-32 opacity-100" : "w-0 opacity-0"
        }`}
        onMouseLeave={() => setShowVolume(false)}
      >
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="w-full h-2 bg-pink-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
        />
        <span className="text-pink-500 w-6">{Math.round(volume * 100)}</span>
      </div>
    </div>
  );
}

// Add these styles to your global styles
const globalStyles = `
  @keyframes musicBar {
    0%, 100% { height: 8px; }
    50% { height: 24px; }
  }

  .animate-musicBar {
    animation: musicBar 0.5s ease-in-out infinite;
  }

  /* Volume slider styling */
  input[type="range"] {
    height: 8px;
    background: linear-gradient(to right, #ec4899 0%, #ec4899 100%);
    border-radius: 8px;
  }

  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    height: 16px;
    width: 16px;
    border-radius: 50%;
    background: #ec4899;
    cursor: pointer;
    box-shadow: 0 0 2px 0 rgb(0 0 0 / 0.1);
    transition: all 0.2s ease-in-out;
  }

  input[type="range"]::-webkit-slider-thumb:hover {
    transform: scale(1.2);
    background: #db2777;
  }
`;

export default function TeddyScene() {
  const { isPlaying } = useMusic();

  return (
    <>
      <style jsx global>{`
        ${globalStyles}
        .speech-bubble {
          position: fixed;
          background: #fff;
          padding: 10px 15px;
          border-radius: 20px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          animation: popIn 0.3s ease-out, fadeOut 0.3s ease-in 1.7s;
          z-index: 100;
          font-size: 14px;
          transform-origin: bottom center;
          pointer-events: none;
          white-space: nowrap;
        }

        @keyframes popIn {
          0% {
            transform: scale(0) translateY(20px);
            opacity: 0;
          }
          100% {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }

        @keyframes fadeOut {
          0% {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
          100% {
            transform: scale(0.8) translateY(-20px);
            opacity: 0;
          }
        }

        @media (max-width: 768px) {
          .speech-bubble {
            font-size: 12px;
            padding: 8px 12px;
          }
        }
      `}</style>
      <div className="fixed bottom-0 left-0 w-48 h-48 z-10 cursor-pointer teddy-container">
        <Canvas
          camera={{ position: [0, 0, 5], fov: 50 }}
          dpr={[1, 2]}
          performance={{ min: 0.5 }}
        >
          <Environment preset="sunset" />
          <ambientLight intensity={0.7} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          <spotLight
            position={[0, 5, 5]}
            angle={0.4}
            penumbra={1}
            intensity={1}
            castShadow
          />

          <TeddyBear position={[0, -1, 0] as [number, number, number]} />
        </Canvas>
      </div>
      <MusicVisualizer playing={isPlaying} />
      <MusicControls />
    </>
  );
}
