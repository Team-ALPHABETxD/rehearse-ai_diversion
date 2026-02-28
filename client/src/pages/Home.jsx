import { useState, useRef, useEffect } from "react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Environment, ContactShadows, PerspectiveCamera } from "@react-three/drei"
import { useNavigate } from "react-router-dom"
import { ArrowRight, Sparkles, Zap, Target, TrendingUp } from "lucide-react"
import { Button } from "../components/ui/button"
import AuthScene from "../components/AuthScene"

// 3D Student Character Component
function StudentCharacter({ position = [0, 0, 0] }) {
  const groupRef = useRef()
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (groupRef.current) {
      // Gentle breathing animation
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.05
      // Slight head movement
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })

  return (
    <group ref={groupRef} position={position} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      {/* Head */}
      <mesh position={[0, 1.5, 0]}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial color={hovered ? "#fbbf24" : "#fcd34d"} />
      </mesh>

      {/* Body/Torso */}
      <mesh position={[0, 0.8, 0]}>
        <boxGeometry args={[0.5, 0.8, 0.3]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>

      {/* Arms - typing position */}
      <mesh position={[-0.4, 0.8, 0]} rotation={[0, 0, -0.3]}>
        <boxGeometry args={[0.15, 0.5, 0.15]} />
        <meshStandardMaterial color="#2563eb" />
      </mesh>
      <mesh position={[0.4, 0.8, 0]} rotation={[0, 0, 0.3]}>
        <boxGeometry args={[0.15, 0.5, 0.15]} />
        <meshStandardMaterial color="#2563eb" />
      </mesh>

      {/* Laptop/Table */}
      <mesh position={[0, 0.3, 0.2]} rotation={[-0.2, 0, 0]}>
        <boxGeometry args={[0.8, 0.05, 0.6]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={[0, 0.5, 0.2]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[0.7, 0.05, 0.5]} />
        <meshStandardMaterial color="#0f172a" emissive="#3b82f6" emissiveIntensity={0.3} />
      </mesh>

      {/* Chair */}
      <mesh position={[0, -0.2, 0]}>
        <boxGeometry args={[0.6, 0.4, 0.6]} />
        <meshStandardMaterial color="#64748b" />
      </mesh>

      {/* Interview screen/monitor in front */}
      <mesh position={[0, 1.2, -1.5]}>
        <boxGeometry args={[1.2, 0.8, 0.1]} />
        <meshStandardMaterial color="#0f172a" emissive="#8b5cf6" emissiveIntensity={0.5} />
      </mesh>

      {/* Glow effect */}
      {hovered && (
        <pointLight position={[0, 1.5, 0]} intensity={1} color="#fbbf24" />
      )}
    </group>
  )
}

// Floating particles around the scene
function Particles() {
  const particles = useRef()

  useFrame(({ clock }) => {
    if (particles.current) {
      particles.current.rotation.y = clock.getElapsedTime() * 0.1
    }
  })

  const count = 50
  const positions = new Float32Array(count * 3)

  for (let i = 0; i < count * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 10
  }

  return (
    <points ref={particles}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.1} color="#8b5cf6" transparent opacity={0.6} />
    </points>
  )
}

// Feature Card Component with Water Wave Effect
function FeatureCard({ feature, Icon, index, side }) {
  const cardRef = useRef(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)
  const [time, setTime] = useState(0)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const springConfig = { damping: 25, stiffness: 200 }
  const x = useSpring(mouseX, springConfig)
  const y = useSpring(mouseY, springConfig)

  const rotateX = useTransform(y, [-0.5, 0.5], [5, -5])
  const rotateY = useTransform(x, [-0.5, 0.5], [-5, 5])

  // Animate time for wave effect
  useEffect(() => {
    if (isHovered) {
      const interval = setInterval(() => {
        setTime((prev) => prev + 0.1)
      }, 50)
      return () => clearInterval(interval)
    }
  }, [isHovered])

  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    
    const rect = cardRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    const xPos = (e.clientX - centerX) / (rect.width / 2)
    const yPos = (e.clientY - centerY) / (rect.height / 2)
    
    mouseX.set(xPos)
    mouseY.set(yPos)
    setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
    setIsHovered(false)
    setTime(0)
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  // Calculate wave effect based on mouse position and time
  const waveOffset1 = isHovered
    ? Math.sin((mousePosition.x / 15) + time) * 8
    : 0
  const waveOffset2 = isHovered
    ? Math.cos((mousePosition.y / 15) + time * 1.2) * 6
    : 0

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, x: side === "left" ? -50 : 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.9 + index * 0.15, duration: 0.6 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className="relative glass-strong rounded-2xl p-6 lg:p-8 group cursor-pointer overflow-hidden"
    >
      {/* Water Wave Effect Background */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden rounded-2xl"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(139, 92, 246, 0.3) 0%, transparent 50%)`,
        }}
      >
        {/* Animated Wave Layers */}
        <motion.div
          className="absolute inset-0"
          animate={{
            x: [0, 20, 0],
            y: [0, waveOffset1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            background: `radial-gradient(ellipse at ${mousePosition.x}px ${mousePosition.y}px, rgba(99, 102, 241, 0.25) 0%, transparent 60%)`,
            transform: `translate(${waveOffset1}px, ${waveOffset2}px)`,
          }}
        />
        <motion.div
          className="absolute inset-0"
          animate={{
            x: [0, -15, 0],
            y: [0, -waveOffset2, 0],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            background: `radial-gradient(ellipse at ${mousePosition.x}px ${mousePosition.y}px, rgba(168, 85, 247, 0.2) 0%, transparent 70%)`,
            transform: `translate(${-waveOffset2}px, ${waveOffset1}px)`,
          }}
        />
        <motion.div
          className="absolute inset-0"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(139, 92, 246, 0.15) 0%, transparent 50%)`,
          }}
        />
      </motion.div>

      {/* Content */}
      <div className="relative z-10">
        <motion.div
          className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}
          whileHover={{ scale: 1.15, rotate: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Icon className="text-white" size={28} />
        </motion.div>
        <h3 className="text-xl font-bold text-white mb-2">
          {feature.title}
        </h3>
        <p className="text-white/60 text-sm leading-relaxed">
          {feature.description}
        </p>
      </div>

      {/* Glow effect on hover */}
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          boxShadow: `0 0 40px rgba(139, 92, 246, 0.5)`,
          background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(139, 92, 246, 0.1) 0%, transparent 70%)`,
        }}
      />
    </motion.div>
  )
}

// 3D Scene Component
function Scene3D() {
  return (
    <Canvas
      camera={{ position: [5, 3, 5], fov: 50 }}
      style={{ width: "100%", height: "100%" }}
    >
      <PerspectiveCamera makeDefault position={[5, 3, 5]} fov={50} />
      
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} color="#ffffff" />
      <pointLight position={[-5, 3, -5]} intensity={0.5} color="#8b5cf6" />
      <pointLight position={[5, 3, -5]} intensity={0.5} color="#3b82f6" />

      {/* Environment */}
      <Environment preset="night" />
      
      {/* Student Character */}
      <StudentCharacter position={[0, 0, 0]} />
      
      {/* Particles */}
      <Particles />
      
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>

      <ContactShadows opacity={0.4} scale={10} blur={2} far={4.5} position={[0, -0.49, 0]} />
      
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.5}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 2.2}
      />
    </Canvas>
  )
}

export default function Home() {
  const navigate = useNavigate()

  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Analysis",
      description: "Get real-time feedback on your interview performance",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Target,
      title: "ATS Resume Checker",
      description: "Optimize your resume for Applicant Tracking Systems",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Zap,
      title: "Practice Interviews",
      description: "Record and analyze your responses with AI insights",
      color: "from-yellow-500 to-orange-500",
    },
    {
      icon: TrendingUp,
      title: "Track Progress",
      description: "Monitor your improvement with detailed analytics",
      color: "from-green-500 to-emerald-500",
    },
  ]

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950">
      <AuthScene />
      {/* Animated background gradient */}
      <div className="absolute inset-0 gradient-bg opacity-20" />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 lg:px-12 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* Left Side - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-block"
            >
              <span className="glass px-4 py-2 rounded-full text-sm text-white/80 font-medium">
                🚀 AI-Powered Interview Simulator
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl lg:text-7xl font-bold leading-tight"
            >
              <span className="gradient-text">Master Your</span>
              <br />
              <span className="text-white">Interview Skills</span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-white/70 leading-relaxed max-w-lg"
            >
              Practice with AI-powered feedback on resumes, video interviews, 
              eye contact, speaking pace, and aptitude tests. Get personalized 
              insights to ace your next interview.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button
                variant="default"
                size="lg"
                onClick={() => navigate("/signup")}
                className="group text-lg px-8 py-6"
              >
                Start Free Trial
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate("/login")}
                className="text-lg px-8 py-6"
              >
                I already have an account
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-3 gap-6 pt-8"
            >
              <div className="text-center">
                <div className="text-3xl font-bold gradient-text">10K+</div>
                <div className="text-sm text-white/60 mt-1">Students</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold gradient-text">95%</div>
                <div className="text-sm text-white/60 mt-1">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold gradient-text">24/7</div>
                <div className="text-sm text-white/60 mt-1">Available</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side - 3D Scene */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative h-[500px] lg:h-[600px] rounded-2xl overflow-hidden glass-strong"
          >
            <Scene3D />
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent pointer-events-none" />
          </motion.div>
        </div>

        {/* Features Section with Water Wave Effect */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mt-20 lg:mt-32"
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Powerful Features
            </h2>
            <p className="text-white/60 text-lg">
              Everything you need to prepare for your dream job
            </p>
          </div>

          {/* Features Container with Middle Line */}
          <div className="relative max-w-7xl mx-auto">
            {/* Middle Vertical Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-purple-500/50 to-transparent transform -translate-x-1/2 hidden lg:block" />
            
            {/* Features Grid - 2 on left, 2 on right */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              {/* Left Side Features */}
              <div className="space-y-8">
                {features.slice(0, 2).map((feature, index) => {
                  const Icon = feature.icon
                  return (
                    <FeatureCard
                      key={feature.title}
                      feature={feature}
                      Icon={Icon}
                      index={index}
                      side="left"
                    />
                  )
                })}
              </div>

              {/* Right Side Features */}
              <div className="space-y-8 lg:mt-20">
                {features.slice(2, 4).map((feature, index) => {
                  const Icon = feature.icon
                  return (
                    <FeatureCard
                      key={feature.title}
                      feature={feature}
                      Icon={Icon}
                      index={index + 2}
                      side="right"
                    />
                  )
                })}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Call to Action Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.8 }}
          className="mt-20 lg:mt-32 text-center"
        >
          <div className="glass-strong rounded-3xl p-12 lg:p-16 max-w-4xl mx-auto">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Ace Your Next Interview?
            </h2>
            <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
              Join thousands of students who have improved their interview skills 
              with our AI-powered platform.
            </p>
            <Button
              variant="default"
              size="lg"
              onClick={() => navigate("/signup")}
              className="text-lg px-10 py-6 group"
            >
              Get Started — It&apos;s Free
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

