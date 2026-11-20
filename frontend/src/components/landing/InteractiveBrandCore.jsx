import { Suspense, useRef, useState } from "react";
import { Text3D, Center } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import "./InteractiveBrandCore.css";



function Shield3D({ active }) {
  const shieldRef = useRef();
  const rimShape = useRef();

  const shieldShape = new THREE.Shape();

  shieldShape.moveTo(0, 1.35);
  shieldShape.bezierCurveTo(0.45, 1.12, 0.95, 1.1, 1.08, 1.0);
  shieldShape.lineTo(1.08, 0.05);
  shieldShape.bezierCurveTo(1.05, -0.65, 0.55, -1.12, 0, -1.42);
  shieldShape.bezierCurveTo(-0.55, -1.12, -1.05, -0.65, -1.08, 0.05);
  shieldShape.lineTo(-1.08, 1.0);
  shieldShape.bezierCurveTo(-0.95, 1.1, -0.45, 1.12, 0, 1.35);
  shieldShape.closePath();

  useFrame((state, delta) => {
    if (!shieldRef.current) return;

    const targetScale = active ? 1 : 0.001;
    const targetZ = active
  ? 2.25 + Math.sin(state.clock.elapsedTime * 1.2) * 0.055
  : 0;

    const scale = THREE.MathUtils.damp(
      shieldRef.current.scale.x,
      targetScale,
      4,
      delta
    );

    shieldRef.current.scale.setScalar(scale);

    shieldRef.current.position.z = THREE.MathUtils.damp(
      shieldRef.current.position.z,
      targetZ,
      4,
      delta
    );

   

const pointer = state.pointer;

const targetRotationY = active
  ? -0.10 + pointer.x * 0.24
  : -Math.PI / 2;

const targetRotationX = active
  ? 0.07 - pointer.y * 0.18
  : -0.25;

shieldRef.current.rotation.y = THREE.MathUtils.damp(
  shieldRef.current.rotation.y,
  targetRotationY,
  3,
  delta
);

shieldRef.current.rotation.x = THREE.MathUtils.damp(
  shieldRef.current.rotation.x,
  targetRotationX,
  3,
  delta
);


  });

  return (
    <group
      ref={shieldRef}
      position={[0, 0, 0]}
      scale={0.001}
    >
      {/* Solid extruded shield */}
      <mesh>
       
<extrudeGeometry
  args={[
    shieldShape,
    {
      depth: 0.32,
      bevelEnabled: true,
      bevelThickness: 0.09,
      bevelSize: 0.075,
      bevelSegments: 6,
      steps: 2,
      curveSegments: 24,
    },
  ]}
/>

        <meshPhysicalMaterial
          color="#174c35"
          metalness={0.72}
          roughness={0.2}
          clearcoat={1}
          clearcoatRoughness={0.08}
        />
      </mesh>


{/* Raised inner shield panel */}
<mesh position={[0, 0, 0.43]} scale={[0.88, 0.88, 1]}>
  <shapeGeometry args={[shieldShape]} />
  <meshPhysicalMaterial
    color="#103c2b"
    metalness={0.65}
    roughness={0.24}
    clearcoat={1}
    clearcoatRoughness={0.12}
    polygonOffset
    polygonOffsetFactor={-1}
  />
</mesh>

{/* Metallic accent plate */}
<mesh position={[0, 0.55, 0.48]}>
  <boxGeometry args={[1.2, 0.035, 0.035]} />
  <meshStandardMaterial
    color="#d9bd7d"
    metalness={0.9}
    roughness={0.18}
  />
</mesh>


      {/* Gold shield outline */}
      <line ref={rimShape} position={[0, 0, 0.49]}>
        <bufferGeometry
          attach="geometry"
          {...{
            attributes: {
              position: new THREE.Float32BufferAttribute(
                shieldShape
                  .getPoints(90)
                  .flatMap((point) => [point.x, point.y, 0]),
                3
              ),
            },
          }}
        />
        <lineBasicMaterial color="#e2c88b" />
      </line>

      {/* Raised central emblem */}
      <mesh position={[0, 0.55, 0.31]}>
        <icosahedronGeometry args={[0.25, 1]} />
        <meshStandardMaterial
          color="#d4b778"
          metalness={0.9}
          roughness={0.15}
        />
      </mesh>

      {/* Main 3D lettering */}
      
{/* Extruded 3D brand name */}
<group position={[0, 0.08, 0.52]}>
  <Center>
    <Text3D
      font="/fonts/helvetiker_bold.typeface.json"
      size={0.29}
      height={0.085}
      curveSegments={12}
      bevelEnabled
      bevelThickness={0.018}
      bevelSize={0.012}
      bevelSegments={4}
      letterSpacing={0.025}
    >
      UNWIND
      <meshPhysicalMaterial
        color="#f5e4b5"
        metalness={0.85}
        roughness={0.17}
        clearcoat={1}
      />
    </Text3D>
  </Center>
</group>

{/* Extruded 3D subtitle */}
<group position={[0, -0.40, 0.52]}>
  <Center>
    <Text3D
      font="/fonts/helvetiker_bold.typeface.json"
      size={0.15}
      height={0.065}
      curveSegments={10}
      bevelEnabled
      bevelThickness={0.012}
      bevelSize={0.008}
      bevelSegments={3}
      letterSpacing={0.018}
    >
      BRAND GUARD
      <meshPhysicalMaterial
        color="#d4b778"
        metalness={0.88}
        roughness={0.18}
        clearcoat={1}
      />
    </Text3D>
  </Center>
</group>


      {/* Decorative divider */}
      <mesh position={[0, -0.19, 0.54]}>
        <boxGeometry args={[1.35, 0.012, 0.012]} />
        <meshStandardMaterial
          color="#d4b778"
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>
    </group>
  );
}

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
  <>
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

    <Shield3D active={active} />
  </>
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
  position={[-3, 4, 8]}
  intensity={2.2}
  color="#fff1cf"
/>

<directionalLight
  position={[5, -2, 6]}
  intensity={1.4}
  color="#b6e5c4"
/>

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
        Move to explore · Click to reveal BrandGuard
      </div>
    </div>
  );
}
