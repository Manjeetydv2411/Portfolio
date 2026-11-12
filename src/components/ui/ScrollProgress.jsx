import { useState, useEffect } from 'react'
import { motion, useScroll, useSpring, useTransform } from 'framer-motion'
import { useMotion } from '../../config/MotionContext.jsx'

const SECTIONS = [
  { id: 'hero', label: 'Hero' },
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'contact', label: 'Contact' },
]

export default function ScrollProgress() {
  const { motionEnabled } = useMotion()
  const { scrollYProgress } = useScroll()

  // Spring-smoothed scroll progress (0 to 1)
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  })

  // Map 0-1 progress to vertical pixel translation along the 320px track height
  const yTranslate = useTransform(smoothProgress, [0, 1], [0, 320])

  const [activeId, setActiveId] = useState('hero')

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + window.innerHeight * 0.3
      for (const sec of SECTIONS) {
        const el = document.getElementById(sec.id)
        if (el) {
          const top = el.offsetTop
          const height = el.offsetHeight
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveId(sec.id)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (id) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: motionEnabled ? 'smooth' : 'auto' })
    }
  }

  return (
    <>
      {/* Top horizontal progress bar */}
      {motionEnabled ? (
        <motion.div
          className="fixed top-0 left-0 right-0 h-0.5 z-[100] origin-left"
          style={{
            scaleX: smoothProgress,
            backgroundColor: '#ff263c',
            boxShadow: '0 0 10px #ff263c, 0 0 4px #ff263c',
          }}
        />
      ) : (
        <div
          className="fixed top-0 left-0 right-0 h-0.5 z-[100]"
          style={{
            backgroundColor: '#ff263c',
            boxShadow: '0 0 10px #ff263c, 0 0 4px #ff263c',
          }}
        />
      )}

      {/* Right vertical scroll progress tracker */}
      <aside
        aria-label="Scroll progress tracker"
        className="hidden lg:flex fixed right-6 top-1/2 -translate-y-1/2 z-[90] flex-col items-center py-6 px-3 pointer-events-auto"
      >
        {/* Track container with fixed height matching markers container */}
        <div className="relative flex flex-col h-[320px] items-center">

          {/* Background track line (untraversed thin dark-grey line) */}
          <div className="absolute top-0 bottom-0 w-[2px] bg-cardBorder rounded-full overflow-visible">
            {/* Traversed bright red portion with soft neon glow */}
            {motionEnabled ? (
              <motion.div
                className="w-full origin-top rounded-full"
                style={{
                  scaleY: smoothProgress,
                  backgroundColor: '#ff263c',
                  boxShadow: '0 0 12px rgba(255, 38, 60, 0.8), 0 0 4px rgba(255, 38, 60, 0.9)',
                  height: '100%',
                }}
              />
            ) : (
              <div
                className="w-full origin-top rounded-full h-full"
                style={{
                  transform: `scaleY(${scrollYProgress.get?.() || 0})`,
                  backgroundColor: '#ff263c',
                  boxShadow: '0 0 12px rgba(255, 38, 60, 0.8), 0 0 4px rgba(255, 38, 60, 0.9)',
                }}
              />
            )}
          </div>

          {/* Single continuously moving glowing indicator circle */}
          {motionEnabled ? (
            <motion.div
              className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-darkBg z-20 pointer-events-none flex items-center justify-center"
              style={{
                y: yTranslate,
                backgroundColor: '#ff263c',
                boxShadow: '0 0 16px rgba(255, 38, 60, 1), 0 0 6px rgba(255, 38, 60, 0.9), inset 0 0 4px rgba(255, 255, 255, 0.8)',
              }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  backgroundColor: '#ffffff',
                  boxShadow: '0 0 6px #ffffff',
                }}
              />
            </motion.div>
          ) : (
            <div
              className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-darkBg z-20 pointer-events-none flex items-center justify-center"
              style={{
                transform: `translateX(-50%) translateY(${Math.min(320, Math.max(0, (scrollYProgress.get?.() || 0) * 320))}px)`,
                backgroundColor: '#ff263c',
                boxShadow: '0 0 16px rgba(255, 38, 60, 1), 0 0 6px rgba(255, 38, 60, 0.9), inset 0 0 4px rgba(255, 255, 255, 0.8)',
              }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  backgroundColor: '#ffffff',
                  boxShadow: '0 0 6px #ffffff',
                }}
              />
            </div>
          )}

          {/* Fixed Section Markers */}
          <div className="relative flex flex-col justify-between h-full items-center z-10 w-full py-1">
            {SECTIONS.map((sec) => {
              const isActive = activeId === sec.id
              return (
                <div key={sec.id} className="relative group flex items-center justify-center">
                  {/* Section tooltip label on hover */}
                  <span className="absolute right-8 px-2 py-1 bg-cardBg border border-cardBorder text-[10px] font-mono text-lightText uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-lg">
                    {sec.label}
                  </span>

                  {/* Marker button */}
                  <button
                    type="button"
                    onClick={() => scrollToSection(sec.id)}
                    aria-label={`Scroll to ${sec.label}`}
                    className={[
                      'w-3 h-3 rounded-full transition-all duration-300 cursor-pointer relative z-10',
                      isActive
                        ? 'bg-brandAccent ring-4 ring-brandAccent/40 scale-125'
                        : 'bg-cardBorder hover:bg-mutedText',
                    ].join(' ')}
                  />
                </div>
              )
            })}
          </div>

        </div>
      </aside>
    </>
  )
}
