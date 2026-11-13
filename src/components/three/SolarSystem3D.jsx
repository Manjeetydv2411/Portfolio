import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cpu, Layers, Server, Briefcase, Sparkles, Orbit } from 'lucide-react'
import { useMotion } from '../../config/MotionContext.jsx'

// Incommensurate prime-based durations and well-spaced initial phases prevent clustering over time
const PLANETS = [
  {
     id: 'foundations',
     number: '01',
     name: 'Programming Foundations',
     category: 'Stage 1',
     period: 'Foundations',
     icon: Cpu,
     summary: 'C++ and programming fundamentals, object-oriented programming (OOP), logical thinking, and structured code.',
     details: 'Established rigorous programming fundamentals with C++, mastering object-oriented design principles, memory management, logical thinking, and clean structured code development.',
     orbitRadiusX: 100,
     orbitRadiusY: 50,
     durationSeconds: 17.3,
     initialAngle: 0.0,
     size: 14,
  },
  {
     id: 'dsa',
     number: '02',
     name: 'Data Structures & Algorithms',
     category: 'Stage 2',
     period: 'Problem Solving',
     icon: Sparkles,
     summary: 'Arrays, strings, trees, graphs, recursion, Dynamic Programming. 550+ problems solved, Peak LeetCode 1704.',
     details: 'Mastered core algorithms and data structures with over 550 problems solved across competitive platforms, achieving a peak LeetCode rating of 1704.',
     orbitRadiusX: 145,
     orbitRadiusY: 72,
     durationSeconds: 23.7,
     initialAngle: 1.05,
     size: 15,
  },
  {
     id: 'mern',
     number: '03',
     name: 'Full-Stack Development',
     category: 'Stage 3',
     period: 'MERN Stack',
     icon: Layers,
     summary: 'HTML, CSS, JavaScript, React.js, Node.js, Express.js, MongoDB, REST APIs and authentication.',
     details: 'Built robust full-stack web applications using the MERN stack, connecting dynamic React frontends with secure Node/Express backends and MongoDB databases.',
     orbitRadiusX: 195,
     orbitRadiusY: 98,
     durationSeconds: 31.1,
     initialAngle: 2.09,
     size: 16,
  },
  {
     id: 'apps',
     number: '04',
     name: 'Real-World Applications',
     category: 'Stage 4',
     period: 'Production Apps',
     icon: Server,
     summary: 'StudyNotion EdTech platform, RescueGrid AI, application architecture and real-world functionality.',
     details: 'Engineered production-grade applications including StudyNotion (EdTech platform) and RescueGrid-AI (real-time emergency response platform), focusing on practical UIs and resilient backends.',
     orbitRadiusX: 245,
     orbitRadiusY: 122,
     durationSeconds: 37.9,
     initialAngle: 3.14,
     size: 17,
  },
  {
     id: 'sysdesign',
     number: '05',
     name: 'System Design & Engineering',
     category: 'Stage 5 (Ongoing)',
     period: 'Architecture',
     icon: Cpu,
     summary: 'Scalable backend architecture, database/API design, design patterns, and maintainable systems.',
     details: 'Actively mastering Low-Level Design (LLD), scalable backend architecture, database modeling, and clean software engineering design patterns as ongoing learning areas.',
     orbitRadiusX: 295,
     orbitRadiusY: 148,
     durationSeconds: 43.3,
     initialAngle: 4.19,
     size: 16,
  },
  {
     id: 'ai',
     number: '06',
     name: 'AI-Powered Development',
     category: 'Stage 6 (Ongoing)',
     period: 'GenAI & Python',
     icon: Briefcase,
     summary: 'Python, Generative AI, integrating AI capabilities into web apps, exploring LLM APIs.',
     details: 'Exploring Python and Generative AI, integrating LLM capabilities and AI-driven features into full-stack web applications as an ongoing area of advanced study.',
     orbitRadiusX: 345,
     orbitRadiusY: 172,
     durationSeconds: 53.7,
     initialAngle: 5.24,
     size: 15,
  },
]

export default function SolarSystem3D() {
  const { motionEnabled } = useMotion()
  const [selectedPlanet, setSelectedPlanet] = useState(PLANETS[0])
  const [hoveredPlanet, setHoveredPlanet] = useState(null)

  const planetRefs = useRef({})
  const animFrameRef = useRef(null)
  const pausedElapsedRef = useRef(0)
  const lastActiveTimeRef = useRef(performance.now())

  const [orbitScale, setOrbitScale] = useState(1)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setOrbitScale(0.6)
      } else if (window.innerWidth < 1024) {
        setOrbitScale(0.8)
      } else {
        setOrbitScale(1)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (!motionEnabled) {
      pausedElapsedRef.current += (performance.now() - lastActiveTimeRef.current) / 1000
      return
    }

    lastActiveTimeRef.current = performance.now()

    const animate = (currentTime) => {
      const currentElapsed = (currentTime - lastActiveTimeRef.current) / 1000
      const totalElapsed = pausedElapsedRef.current + currentElapsed

      PLANETS.forEach((planet) => {
        const angularSpeed = (2 * Math.PI) / planet.durationSeconds
        const angle = planet.initialAngle + angularSpeed * totalElapsed

        const x = planet.orbitRadiusX * orbitScale * Math.cos(angle)
        const y = planet.orbitRadiusY * orbitScale * Math.sin(angle)

        const el = planetRefs.current[planet.id]
        if (el) {
          el.style.transform = `translate(${x}px, ${y}px)`
        }
      })

      animFrameRef.current = requestAnimationFrame(animate)
    }

    animFrameRef.current = requestAnimationFrame(animate)
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [motionEnabled, orbitScale])

  return (
    <div className="w-full bg-cardBg border border-cardBorder rounded-md p-6 sm:p-10 relative overflow-visible my-12">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brandAccent/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1 text-xs font-mono text-brandAccent uppercase tracking-widest">
            <Orbit size={14} className={motionEnabled ? 'animate-spin' : ''} />
            <span>Developer Journey & Milestones</span>
          </div>
          <h3 className="font-display text-2xl sm:text-3xl uppercase tracking-wide text-lightText">
            The Orbital Learning System
          </h3>
        </div>
        <span className="text-xs font-mono text-mutedText bg-darkBg border border-cardBorder px-3 py-1.5 self-start sm:self-auto">
          Click any planet to inspect milestone
        </span>
      </div>

      {/* Solar System Stage with overflow-visible to prevent clipping */}
      <div className="relative w-full h-[440px] sm:h-[500px] flex items-center justify-center my-6 overflow-visible">

        {/* Absolute Centered Canvas / SVG Container */}
        <div className="absolute inset-0 flex items-center justify-center overflow-visible pointer-events-none">
          <svg className="w-full h-full overflow-visible" viewBox="-400 -220 800 440">
            <defs>
              <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#e32b3c" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#090909" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Elliptical Orbit Paths */}
            {PLANETS.map((planet) => (
              <ellipse
                key={`orbit-${planet.id}`}
                cx="0"
                cy="0"
                rx={planet.orbitRadiusX * orbitScale}
                ry={planet.orbitRadiusY * orbitScale}
                fill="none"
                stroke="#66222b"
                strokeWidth="1.8"
                strokeOpacity="0.75"
                strokeDasharray="5 5"
              />
            ))}

            {/* Central Sun */}
            <g className="cursor-pointer pointer-events-auto" onClick={() => setSelectedPlanet(PLANETS[0])}>
              <circle cx="0" cy="0" r={48 * orbitScale} fill="url(#sunGlow)" />
              <circle cx="0" cy="0" r={34 * orbitScale} fill="#121212" stroke="#e32b3c" strokeWidth={2.5 * orbitScale} />
              <text x="0" y="0" textAnchor="middle" dominantBaseline="middle" fill="#f2efeb" fontSize={8 * orbitScale} fontFamily="monospace" fontWeight="bold">
                MY JOURNEY
              </text>
            </g>
          </svg>

          {/* Orbiting Planets Positioned via requestAnimationFrame Direct DOM Refs */}
          {PLANETS.map((planet) => {
            const isSelected = selectedPlanet.id === planet.id
            const isHovered = hoveredPlanet === planet.id
            const Icon = planet.icon

            const initialX = planet.orbitRadiusX * orbitScale * Math.cos(planet.initialAngle)
            const initialY = planet.orbitRadiusY * orbitScale * Math.sin(planet.initialAngle)

            return (
              <div
                key={planet.id}
                ref={(el) => (planetRefs.current[planet.id] = el)}
                className="absolute pointer-events-auto cursor-pointer group"
                style={{
                  transform: `translate(${initialX}px, ${initialY}px)`,
                }}
                onClick={() => setSelectedPlanet(planet)}
                onMouseEnter={() => setHoveredPlanet(planet.id)}
                onMouseLeave={() => setHoveredPlanet(null)}
              >
                {/* Planet Node Centered on (x, y) */}
                <div
                  className={[
                    'absolute -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center border transition-all duration-200 shadow-xl',
                    isSelected
                      ? 'bg-brandAccent border-lightText ring-4 ring-brandAccent/30 scale-125 z-30'
                      : isHovered
                      ? 'bg-cardBg border-brandAccent scale-110 z-20'
                      : 'bg-darkBg border-cardBorder hover:border-brandAccent z-10',
                  ].join(' ')}
                  style={{
                    width: `${planet.size * 2.2}px`,
                    height: `${planet.size * 2.2}px`,
                  }}
                >
                  <Icon size={planet.size} className={isSelected ? 'text-lightText' : 'text-brandAccent'} />

                  {/* Stage Number Badge */}
                  <span className="absolute -top-2.5 -right-2.5 px-1.5 py-0.5 bg-darkBg border border-brandAccent text-[9px] font-mono font-bold text-brandAccent shadow-md">
                    {planet.number}
                  </span>

                  {/* Planet Label Tooltip */}
                  <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-darkBg border border-cardBorder text-[10px] font-mono text-lightText whitespace-nowrap opacity-90 group-hover:opacity-100 shadow-lg pointer-events-none z-40">
                    {planet.name}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Selected Milestone Details Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedPlanet.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3 }}
          className="bg-darkBg border border-cardBorder p-6 relative z-10 mt-4"
        >
          <div className="absolute top-0 left-0 w-1.5 h-full bg-brandAccent" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-brandAccent uppercase tracking-widest">
                {selectedPlanet.category}
              </span>
              <span className="text-mutedText">•</span>
              <span className="text-xs font-mono text-mutedText">
                {selectedPlanet.period}
              </span>
            </div>
            <span className="text-[11px] font-mono bg-cardBg border border-cardBorder px-2.5 py-1 text-lightText self-start sm:self-auto">
              Milestone Active
            </span>
          </div>

          <h4 className="font-display text-2xl sm:text-3xl uppercase tracking-wide text-lightText mb-2">
            {selectedPlanet.name}
          </h4>

          <p className="text-sm sm:text-base text-mutedText font-body leading-relaxed mb-3">
            {selectedPlanet.summary}
          </p>

          <p className="text-xs sm:text-sm text-lightText font-body leading-relaxed border-t border-cardBorder pt-3">
            {selectedPlanet.details}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
