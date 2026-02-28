import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Stars, Float } from "@react-three/drei"
import { useRef } from "react"

function AnimatedSphere() {
  const meshRef = useRef()

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = clock.getElapsedTime() * 0.2
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.3
    }
  })

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial
          color="#667eea"
          emissive="#667eea"
          emissiveIntensity={0.5}
          wireframe
          transparent
          opacity={0.3}
        />
      </mesh>
    </Float>
  )
}

function Particles() {
  const points = useRef()
  const count = 100
  const positions = useRef(new Float32Array(count * 3))

  // Initialize positions
  if (positions.current) {
    for (let i = 0; i < count * 3; i += 3) {
      positions.current[i] = (Math.random() - 0.5) * 10
      positions.current[i + 1] = (Math.random() - 0.5) * 10
      positions.current[i + 2] = (Math.random() - 0.5) * 10
    }
  }

  useFrame(({ clock }) => {
    if (points.current && positions.current) {
      const t = clock.getElapsedTime()
      for (let i = 0; i < count * 3; i += 3) {
        positions.current[i] += Math.sin(t + i * 0.01) * 0.01
        positions.current[i + 1] += Math.cos(t * 0.5 + i * 0.01) * 0.01
      }
      points.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions.current}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#f093fb" transparent opacity={0.6} />
    </points>
  )
}

export default function ThreeBackground() {
  return (
    <div className="fixed inset-0 -z-10 opacity-30">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#667eea" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#f093fb" />
        <Stars radius={100} depth={50} count={5000} factor={4} fade speed={1} />
        <AnimatedSphere />
        <Particles />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  )
}

