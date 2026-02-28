import { Canvas, useFrame } from "@react-three/fiber"
import { Environment, OrbitControls, Float } from "@react-three/drei"
import { useRef, useMemo } from "react"

function NeonRing() {
  const ringRef = useRef()

  useFrame(({ clock }) => {
    if (!ringRef.current) return
    const t = clock.getElapsedTime()
    ringRef.current.rotation.z = t * 0.3
    ringRef.current.rotation.x = Math.sin(t * 0.4) * 0.4
  })

  return (
    <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[2.2, 0.03, 64, 256]} />
      <meshStandardMaterial
        color="#a855f7"
        emissive="#a855f7"
        emissiveIntensity={1.2}
        transparent
        opacity={0.6}
      />
    </mesh>
  )
}

function GlassPanels() {
  const groupRef = useRef()

  const panels = useMemo(
    () =>
      new Array(6).fill(0).map((_, i) => ({
        angle: (i / 6) * Math.PI * 2,
        radius: 1.6 + (i % 2) * 0.3,
        height: 1.2 + (i % 3) * 0.2,
      })),
    []
  )

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.getElapsedTime()
    groupRef.current.rotation.y = t * 0.2
  })

  return (
    <group ref={groupRef}>
      {panels.map((panel, index) => (
        <Float
          key={index}
          speed={1 + index * 0.1}
          rotationIntensity={0.6}
          floatIntensity={0.4}
        >
          <mesh
            position={[
              Math.cos(panel.angle) * panel.radius,
              0.4 * Math.sin(panel.angle * 2),
              Math.sin(panel.angle) * panel.radius,
            ]}
            rotation={[0, -panel.angle + Math.PI / 2, 0]}
          >
            <boxGeometry args={[0.05, panel.height, 0.9]} />
            <meshStandardMaterial
              color="#e5e7eb"
              transparent
              opacity={0.18}
              roughness={0.1}
              metalness={0.8}
            />
          </mesh>
        </Float>
      ))}
    </group>
  )
}

function ParticleHalo() {
  const pointsRef = useRef()
  const count = 400
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const radius = 2.4 + Math.random() * 0.4
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4
      const y = (Math.random() - 0.5) * 0.6
      arr[i * 3] = Math.cos(angle) * radius
      arr[i * 3 + 1] = y
      arr[i * 3 + 2] = Math.sin(angle) * radius
    }
    return arr
  }, [])

  useFrame(({ clock }) => {
    if (!pointsRef.current) return
    const t = clock.getElapsedTime()
    pointsRef.current.rotation.y = t * 0.1
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#38bdf8"
        transparent
        opacity={0.7}
        depthWrite={false}
      />
    </points>
  )
}

function CoreOrb() {
  const orbRef = useRef()

  useFrame(({ clock }) => {
    if (!orbRef.current) return
    const t = clock.getElapsedTime()
    orbRef.current.rotation.y = t * 0.6
    orbRef.current.position.y = Math.sin(t * 1.2) * 0.15
  })

  return (
    <mesh ref={orbRef}>
      <icosahedronGeometry args={[0.7, 1]} />
      <meshStandardMaterial
        color="#38bdf8"
        emissive="#38bdf8"
        emissiveIntensity={0.9}
        wireframe
        transparent
        opacity={0.4}
      />
    </mesh>
  )
}

export default function AuthScene() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 opacity-70">
      <Canvas camera={{ position: [0, 1.5, 5], fov: 55 }}>
        <color attach="background" args={["#020617"]} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[4, 6, 2]} intensity={1.2} color="#818cf8" />
        <pointLight position={[-4, -2, -4]} intensity={0.8} color="#22d3ee" />

        <Environment preset="night" />

        <CoreOrb />
        <GlassPanels />
        <NeonRing />
        <ParticleHalo />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.4}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.8}
        />
      </Canvas>
    </div>
  )
}

