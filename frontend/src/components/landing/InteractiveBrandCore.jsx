
import { Suspense, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import "./InteractiveBrandCore.css";

function BrandSculpture() {
  const group = useRef();
  const core = useRef();
  const [active, setActive] = useState(false);
  const [hovered, setHovered] = useState(false);

  useFrame((state, delta) => {
    if (!group.current || !core.current) return;

    const time = state.clock.elapsedTime;
    const pointer = state.pointer;

    group.current.rotation.y += delta * (active ? 0.6 : 0.12);

    group.current.rotation.x = THREE.MathUtils.damp(
      group.current.rotation.x,
      pointer.y * -0.22,
      3,
      delta
    );

    group.current.rotation.z = THREE.MathUtils.damp(
      group.current.rotation.z,
      pointer.x * -0.12,
      3,
      delta
    );

    group.current.position.y = Math.sin(time * 0.9) * 0.12;

    const targetScale = hovered ? 1.09 : active ? 1.16 : 1;

    const scale = THREE.MathUtils.damp(
      core.current.scale.x,
      targetScale,
      4,
      delta
    );

    core.current.scale.setScalar(scale);
  });

  return (
    <group
      ref={group}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "";
      }}
      onClick={(event) => {
        event.stopPropagation();
        setActive((value) => !value);
      }}
    >
      {/* Main glass core */}
      <mesh ref={core}>
        <icosahedronGeometry args={[1.25, 5]} />
        <meshPhysicalMaterial
          color={active ? "#a8e0b2" : "#39745a"}
          metalness={0.15}
          roughness={0.08}
          transmission={0.55}
          thickness={1.5}
          ior={1.45}
          clearcoat={1}
          clearcoatRoughness={0.08}
        />
      </mesh>

      {/* Inner glowing core */}
      <mesh scale={0.78}>
        <icosahedronGeometry args={[1, 2]} />
        <meshStandardMaterial
          color="#b5d8ac"
          metalness={0.35}
          roughness={0.25}
          emissive="#3e8c63"
          emissiveIntensity={active ? 0.7 : 0.2}
        />
      </mesh>

      {/* Three orbital rings */}
      {[
        [1.95, 0.07, 0.3, 0.2, "#c5aa73"],
        [1.72, 0.045, 1.2, -0.45, "#6d9c7b"],
        [2.18, 0.025, -0.65, 0.75, "#a5bca5"],
      ].map(([radius, tube, x, y, color], index) => (
        <mesh
          key={index}
          rotation={[x, y, index * 0.5]}
        >
          <torusGeometry args={[radius, tube, 12, 128]} />
          <meshStandardMaterial
            color={color}
            metalness={0.85}
            roughness={0.22}
          />
        </mesh>
      ))}

      {/* Floating satellite objects */}
      {[
        [2.15, 0.75, 0.1],
        [-1.85, -0.65, 0.55],
        [0.5, 1.95, -0.3],
        [-0.8, 0.2, 2.05],
      ].map((position, index) => (
        <mesh key={index} position={position}>
          <octahedronGeometry args={[0.15, 0]} />
          <meshStandardMaterial
            color={index % 2 ? "#d4b778" : "#6cae83"}
            metalness={0.7}
            roughness={0.18}
          />
        </mesh>
      ))}
    </group>
  );
}

export default function InteractiveBrandCore() {
  return (
    <div className="bg-interactive-core">
      <Canvas
        camera={{ position: [0, 0, 7.5], fov: 45 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true }}
        fallback={<p>3D preview unavailable.</p>}
      >
        <ambientLight intensity={1.5} />
        <directionalLight
          position={[4, 6, 5]}
          intensity={3}
          color="#ffffff"
        />
        <pointLight
          position={[-4, -2, 3]}
          intensity={35}
          color="#b0dbb8"
        />
        <pointLight
          position={[3, 1, -4]}
          intensity={20}
          color="#e8d4a5"
        />

        <Suspense fallback={null}>
          <BrandSculpture />
        </Suspense>
      </Canvas>

      <div className="bg-interactive-core-hint">
        Move to explore · Click to activate
      </div>
    </div>
  );
}
