import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Orbit } from 'lucide-react'
import { identity } from '../../config/site.js'
import { useMotion } from '../../config/MotionContext.jsx'

const SKILLS_CAROUSEL = [
  {
    id: 'cpp',
    name: 'C++',
    category: 'Languages',
    image: '/images/skills/cpp.svg',
    summary: 'Object-oriented programming, memory management, pointers, and rigorous low-level problem solving.',
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    category: 'Languages',
    image: '/images/skills/javascript.svg',
    summary: 'ES6+, asynchronous programming, closures, event loops, and modern web application logic.',
  },
  {
    id: 'dsa',
    name: 'DSA',
    category: 'Foundations',
    image: '/images/skills/dsa.svg',
    summary: 'Data Structures & Algorithms optimized for time/space complexity and efficient problem-solving.',
  },
  {
    id: 'react',
    name: 'React',
    category: 'Frontend',
    image: '/images/skills/react.svg',
    summary: 'Component-driven architecture, custom hooks, virtual DOM rendering, and state management.',
  },
  {
    id: 'nodejs',
    name: 'Node.js',
    category: 'Backend',
    image: '/images/skills/nodejs.svg',
    summary: 'Asynchronous event-driven server runtime, stream processing, and scalable microservices.',
  },
  {
    id: 'mongodb',
    name: 'MongoDB',
    category: 'Database',
    image: '/images/skills/mongodb.svg',
    summary: 'NoSQL schema design, BSON document storage, aggregation pipelines, and indexing.',
  },
  {
    id: 'sql',
    name: 'SQL',
    category: 'Database',
    image: '/images/skills/sql.svg',
    summary: 'Relational database modeling, complex joins, transactions, and query optimization.',
  },
  {
    id: 'github',
    name: 'Git & GitHub',
    category: 'Tools',
    image: '/images/skills/github.svg',
    summary: 'Distributed version control, pull request workflows, CI/CD actions, and collaboration.',
  },
  {
    id: 'sysdesign',
    name: 'System Design',
    category: 'Architecture',
    image: '/images/skills/sysdesign.svg',
    summary: 'Low-level design (LLD), scalability, caching strategies, and distributed system patterns.',
  },
]

export default function OrbitalSkills3D() {
  const { motionEnabled } = useMotion()
  const [selectedSkill, setSelectedSkill] = useState(SKILLS_CAROUSEL[0])
  const [hoveredId, setHoveredId] = useState(null)
  const [portraitError, setPortraitError] = useState(false)
  const [radius, setRadius] = useState(320)

  const cardRefs = useRef({})
  const animFrameRef = useRef(null)
  const angleRef = useRef(0)
  const lastTimeRef = useRef(performance.now())

  // Responsive radius calculation
  useEffect(() => {
    const updateRadius = () => {
      const width = window.innerWidth
      if (width < 640) {
        setRadius(170) // Mobile
      } else if (width < 1024) {
        setRadius(250) // Tablet
      } else {
        setRadius(330) // Desktop
      }
    }
    updateRadius()
    window.addEventListener('resize', updateRadius)
    return () => window.removeEventListener('resize', updateRadius)
  }, [])

  useEffect(() => {
    if (!motionEnabled) {
      lastTimeRef.current = performance.now()
      return
    }

    const animate = (currentTime) => {
      const delta = (currentTime - lastTimeRef.current) / 1000
      lastTimeRef.current = currentTime

      // Rotate continuously around Y axis
      angleRef.current += delta * 0.28

      const totalCards = SKILLS_CAROUSEL.length
      const verticalAmplitude = radius * 0.16 // Coherent vertical bobbing based on radius

      SKILLS_CAROUSEL.forEach((skill, index) => {
        const angle = angleRef.current + (index / totalCards) * 2 * Math.PI
        const x = Math.sin(angle) * radius
        const z = Math.cos(angle) * radius // ranges from -radius to +radius

        // Normalized depth (0 at back, 1 at front)
        const normalizedZ = (z + radius) / (2 * radius)

        // 1. Coherent vertical position: rear panels higher (negative Y), front panels lower (positive Y)
        const y = Math.cos(angle) * verticalAmplitude

        // 2. Coherent scale: rear panels smaller, front panels larger
        const scale = 0.68 + normalizedZ * 0.52 // 0.68 at back to 1.20 at front

        // 3. Coherent opacity: rear panels clearly visible (min 0.65), front panels prominent (1.0)
        const opacity = 0.65 + normalizedZ * 0.35 // 0.65 at back to 1.0 at front

        // Z-Index layering
        const zIndex = Math.round(normalizedZ * 100) + 10

        const el = cardRefs.current[skill.id]
        if (el) {
          el.style.transform = `translate3d(${x}px, ${y}px, ${z}px) scale(${scale})`
          el.style.opacity = opacity
          el.style.zIndex = zIndex
        }
      })

      animFrameRef.current = requestAnimationFrame(animate)
    }

    animFrameRef.current = requestAnimationFrame(animate)
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [motionEnabled, radius])

  return (
    <div className="w-full bg-cardBg border border-cardBorder rounded-md p-6 sm:p-10 relative overflow-visible my-12">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-brandAccent/5 blur-[160px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1 text-xs font-mono text-brandAccent uppercase tracking-widest">
            <Orbit size={14} className={motionEnabled ? 'animate-spin' : ''} />
            <span>3D Rotating Circular Gallery</span>
          </div>
          <h3 className="font-display text-2xl sm:text-3xl uppercase tracking-wide text-lightText">
            Orbital Skills Carousel
          </h3>
        </div>
        <span className="text-xs font-mono text-mutedText bg-darkBg border border-cardBorder px-3 py-1.5 self-start sm:self-auto">
          Click any panel to inspect competency
        </span>
      </div>

      {/* 3D Carousel Stage */}
      <div
        className="relative w-full h-[600px] sm:h-[700px] flex items-center justify-center my-6 overflow-visible"
        style={{ perspective: '1400px' }}
      >
        {/* SVG Orbital Track Path */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="-400 -350 800 700">
          <ellipse
            cx="0"
            cy="0"
            rx={radius}
            ry={radius * 0.16}
            fill="none"
            stroke="#66222b"
            strokeWidth="1.8"
            strokeOpacity="0.75"
            strokeDasharray="5 5"
          />
        </svg>

        <div
          className="relative w-full h-full flex items-center justify-center overflow-visible pointer-events-none z-10"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Central Stationary Rectangular Portrait: Top edge at 50% height (vertical center line) extending downward */}
          <div className="absolute top-[50%] left-1/2 -translate-x-1/2 z-[200] pointer-events-auto">
            <div className="w-[140px] h-[180px] sm:w-[180px] sm:h-[230px] lg:w-[210px] lg:h-[270px] border-2 border-brandAccent bg-darkBg shadow-2xl shadow-brandAccent/50 flex items-center justify-center relative">
              {!portraitError ? (
                <img
                  src="/images/profile.png"
                  alt={identity.fullName}
                  className="w-full h-full object-cover"
                  onError={() => setPortraitError(true)}
                />
              ) : (
                <span className="font-display text-3xl text-lightText tracking-wider">
                  {identity.displayName ? identity.displayName.slice(0, 2).toUpperCase() : 'MY'}
                </span>
              )}
            </div>
          </div>

          {/* 3D Rotating Circular Image Panels with High Minimum Opacity */}
          {SKILLS_CAROUSEL.map((skill, index) => {
            const isSelected = selectedSkill.id === skill.id
            const isHovered = hoveredId === skill.id
            const initialAngle = (index / SKILLS_CAROUSEL.length) * 2 * Math.PI
            const initialX = Math.sin(initialAngle) * radius
            const initialZ = Math.cos(initialAngle) * radius
            const initialNormalizedZ = (initialZ + radius) / (2 * radius)
            const initialY = Math.cos(initialAngle) * (radius * 0.16)

            return (
              <div
                key={skill.id}
                ref={(el) => (cardRefs.current[skill.id] = el)}
                className="absolute pointer-events-auto cursor-pointer group transition-transform duration-75"
                style={{
                  transform: `translate3d(${initialX}px, ${initialY}px, ${initialZ}px) scale(${0.68 + initialNormalizedZ * 0.52})`,
                  opacity: 0.65 + initialNormalizedZ * 0.35,
                  transformStyle: 'preserve-3d',
                }}
                onClick={() => setSelectedSkill(skill)}
                onMouseEnter={() => setHoveredId(skill.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div
                  className={[
                    'absolute -translate-x-1/2 -translate-y-1/2 w-[85px] sm:w-[105px] lg:w-[130px] bg-[#121212]/95 border overflow-hidden backdrop-blur-md transition-all duration-200 shadow-2xl',
                    isSelected
                      ? 'border-brandAccent ring-2 ring-brandAccent/60 bg-cardBg'
                      : isHovered
                      ? 'border-brandAccent/80'
                      : 'border-cardBorder hover:border-brandAccent/50',
                  ].join(' ')}
                >
                  {/* Skill Image Illustration */}
                  <div className="w-full h-[60px] sm:h-[75px] lg:h-[95px] bg-darkBg overflow-hidden border-b border-cardBorder relative">
                    <img
                      src={skill.image}
                      alt={skill.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Panel Footer */}
                  <div className="p-2 sm:p-2.5 bg-cardBg flex flex-col items-center text-center">
                    <span className="text-[9px] sm:text-[10px] font-mono text-brandAccent uppercase tracking-widest truncate max-w-full">
                      {skill.category}
                    </span>
                    <span className="text-[11px] sm:text-xs font-mono font-bold text-lightText tracking-wide truncate max-w-full">
                      {skill.name}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Selected Skill Details Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedSkill.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3 }}
          className="bg-darkBg border border-cardBorder p-6 relative z-10 mt-6"
        >
          <div className="absolute top-0 left-0 w-1.5 h-full bg-brandAccent" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <span className="text-xs font-mono text-brandAccent uppercase tracking-widest">
              {selectedSkill.category} Capability
            </span>
            <span className="text-[11px] font-mono bg-cardBg border border-cardBorder px-2.5 py-1 text-lightText self-start sm:self-auto">
              Active Selection
            </span>
          </div>

          <h4 className="font-display text-2xl sm:text-3xl uppercase tracking-wide text-lightText mb-2">
            {selectedSkill.name}
          </h4>

          <p className="text-sm sm:text-base text-mutedText font-body leading-relaxed">
            {selectedSkill.summary}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
