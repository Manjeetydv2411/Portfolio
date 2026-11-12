import { useState, useEffect, useRef, useCallback } from 'react'
import { Code2, Database, Server, Layers, Sparkles } from 'lucide-react'
import { useMotion } from '../../config/MotionContext.jsx'

const CUBE_FACES = [
  {
    id: 'react',
    name: 'React',
    category: 'Frontend Library',
    icon: Layers,
    description: 'Component architecture, Hooks, and high-performance UI rendering.',
    transform: 'rotateY(0deg) translateZ(110px)',
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    category: 'Core Language',
    icon: Code2,
    description: 'ES6+, asynchronous programming, closures, and DOM manipulation.',
    transform: 'rotateY(180deg) translateZ(110px)',
  },
  {
    id: 'nodejs',
    name: 'Node.js',
    category: 'Backend Runtime',
    icon: Server,
    description: 'Asynchronous event-driven server architecture and RESTful APIs.',
    transform: 'rotateY(90deg) translateZ(110px)',
  },
  {
    id: 'profile',
    name: 'Manjeet Yadav',
    category: 'Full-Stack Developer',
    icon: null,
    photo: '/images/profile.png',
    description: 'Building scalable web applications and systems with a focus on clean architecture.',
    transform: 'rotateY(-90deg) translateZ(110px)',
  },
  {
    id: 'mongodb',
    name: 'MongoDB',
    category: 'NoSQL Database',
    icon: Database,
    description: 'Schema design, aggregation pipelines, and high-speed document stores.',
    transform: 'rotateX(90deg) translateZ(110px)',
  },
  {
    id: 'sql',
    name: 'SQL',
    category: 'Relational Database',
    icon: Sparkles,
    description: 'Complex joins, indexing, query optimization, and relational modeling.',
    transform: 'rotateX(-90deg) translateZ(110px)',
  },
]

export default function TechCube3D() {
  const { motionEnabled } = useMotion()
  const [rotation, setRotation] = useState({ x: -18, y: 25 })
  const [isDragging, setIsDragging] = useState(false)
  const [activeFace, setActiveFace] = useState(CUBE_FACES[0])
  const dragStartRef = useRef({ x: 0, y: 0 })
  const animFrameRef = useRef(null)

  useEffect(() => {
    if (!motionEnabled || isDragging) return

    let lastTime = performance.now()
    const animate = (currentTime) => {
      const delta = (currentTime - lastTime) / 1000
      lastTime = currentTime

      setRotation((prev) => ({
        x: prev.x + delta * 6,
        y: prev.y + delta * 12,
      }))

      animFrameRef.current = requestAnimationFrame(animate)
    }

    animFrameRef.current = requestAnimationFrame(animate)
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [motionEnabled, isDragging])

  const handleMouseDown = useCallback((e) => {
    setIsDragging(true)
    dragStartRef.current = { x: e.clientX, y: e.clientY }
  }, [])

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return
    const dx = e.clientX - dragStartRef.current.x
    const dy = e.clientY - dragStartRef.current.y
    dragStartRef.current = { x: e.clientX, y: e.clientY }

    setRotation((prev) => ({
      x: Math.max(-80, Math.min(80, prev.x - dy * 0.5)),
      y: prev.y + dx * 0.5,
    }))
  }, [isDragging])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleTouchStart = useCallback((e) => {
    if (!e.touches[0]) return
    setIsDragging(true)
    dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }, [])

  const handleTouchMove = useCallback((e) => {
    if (!isDragging || !e.touches[0]) return
    const dx = e.touches[0].clientX - dragStartRef.current.x
    const dy = e.touches[0].clientY - dragStartRef.current.y
    dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }

    setRotation((prev) => ({
      x: Math.max(-80, Math.min(80, prev.x - dy * 0.5)),
      y: prev.y + dx * 0.5,
    }))
  }, [isDragging])

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  return (
    <div className="w-full flex flex-col items-center select-none">
      <div
        className="relative w-[280px] h-[280px] sm:w-[340px] sm:h-[340px] flex items-center justify-center cursor-grab active:cursor-grabbing"
        style={{ perspective: '1200px' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        aria-label="Interactive 3D Technology Cube. Click and drag to rotate."
      >
        <div className="absolute inset-0 bg-brandAccent/5 blur-3xl rounded-full pointer-events-none" />

        <div
          className="relative w-[180px] h-[180px] sm:w-[220px] sm:h-[220px]"
          style={{
            transformStyle: 'preserve-3d',
            transform: `translateZ(-90px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
          }}
        >
          {CUBE_FACES.map((face) => {
            const Icon = face.icon
            const isSelected = activeFace.id === face.id

            /* ── Photo face ── */
            if (face.photo) {
              return (
                <div
                  key={face.id}
                  onClick={(e) => {
                    e.stopPropagation()
                    setActiveFace(face)
                  }}
                  className={[
                    'absolute inset-0 w-full h-full border cursor-pointer shadow-2xl overflow-hidden',
                    isSelected
                      ? 'border-brandAccent ring-1 ring-brandAccent/50'
                      : 'border-[#222222] hover:border-brandAccent/60',
                  ].join(' ')}
                  style={{
                    transform: face.transform,
                    backfaceVisibility: 'visible',
                    background: '#0a0a0a',
                  }}
                >
                  {/* Portrait fills the face */}
                  <img
                    src={face.photo}
                    alt={face.name}
                    draggable={false}
                    className="w-full h-full object-cover object-top"
                  />
                  {/* Subtle red gradient overlay at the bottom */}
                  <div className="absolute bottom-0 left-0 w-full h-10 bg-gradient-to-t from-brandAccent/30 to-transparent pointer-events-none" />
                  {/* Thin red border inset */}
                  <div className="absolute inset-0 border-2 border-brandAccent/40 pointer-events-none" />
                </div>
              )
            }

            /* ── Tech faces (unchanged) ── */
            return (
              <div
                key={face.id}
                onClick={(e) => {
                  e.stopPropagation()
                  setActiveFace(face)
                }}
                className={[
                  'absolute inset-0 w-full h-full bg-[#121212] border p-5 flex flex-col justify-between transition-colors duration-200 cursor-pointer shadow-2xl',
                  isSelected
                    ? 'border-brandAccent ring-1 ring-brandAccent/50'
                    : 'border-[#222222] hover:border-brandAccent/60',
                ].join(' ')}
                style={{
                  transform: face.transform,
                  backfaceVisibility: 'visible',
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-brandAccent uppercase tracking-widest">
                    {face.category}
                  </span>
                  <div className="w-8 h-8 flex items-center justify-center bg-[#090909] border border-[#222222] text-brandAccent">
                    <Icon size={16} />
                  </div>
                </div>

                <div className="my-auto text-center">
                  <h4 className="font-display text-2xl sm:text-3xl uppercase tracking-wide text-[#f2efeb] mb-1">
                    {face.name}
                  </h4>
                  <span className="text-[11px] font-mono text-[#a09c9a] block">
                    Click to inspect
                  </span>
                </div>

                <div className="pt-2 border-t border-[#222222] text-[10px] font-mono text-[#a09c9a] uppercase tracking-wider text-center">
                  3D Tech Core
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-6 w-full max-w-sm bg-[#121212] border border-[#222222] p-4 relative">
        <div className="absolute top-0 left-0 w-1 h-full bg-brandAccent" />
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-mono text-brandAccent uppercase tracking-widest">
            {activeFace.category}
          </span>
          <span className="text-[10px] font-mono text-[#a09c9a]">
            Rotate cube to explore
          </span>
        </div>
        <h3 className="font-display text-xl uppercase tracking-wide text-[#f2efeb] mb-1">
          {activeFace.name}
        </h3>
        <p className="text-xs text-[#a09c9a] font-body leading-relaxed">
          {activeFace.description}
        </p>
      </div>
    </div>
  )
}
