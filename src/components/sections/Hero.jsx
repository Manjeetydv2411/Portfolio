import { useState, useEffect, useRef, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, MapPin, Sparkles, Download, ExternalLink } from 'lucide-react'
import { identity, skills, preferences } from '../../config/site.js'
import { useMotion } from '../../config/MotionContext.jsx'
import TechCube3D from '../three/TechCube3D.jsx'

const TITLES = ["Full-Stack Developer", "Software Engineer", "Problem Solver"]

/* ─── Background layer ───────────────────────────────────────────────────────
   Memoised so Hero state changes (title rotation) never re-run the canvas loop.
   All animation is driven by rAF inside useEffect — zero React re-renders.
──────────────────────────────────────────────────────────────────────────── */
const HeroBackground = memo(function HeroBackground({ motionEnabled }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    // Particle config
    const COUNT = 38
    const ACCENT = '227,43,60' // brandAccent rgb

    let W, H, particles, rafId

    const resize = () => {
      W = canvas.width  = canvas.offsetWidth
      H = canvas.height = canvas.offsetHeight
    }

    const makeParticle = () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.4 + 0.3,          // radius 0.3–1.7 px
      vx: (Math.random() - 0.5) * 0.18,       // very slow drift
      vy: (Math.random() - 0.5) * 0.18,
      // ~1 in 7 particles gets a faint red tint, rest are off-white
      accent: Math.random() < 0.14,
      opacity: Math.random() * 0.35 + 0.08,
    })

    const init = () => {
      resize()
      particles = Array.from({ length: COUNT }, makeParticle)
    }

    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      for (const p of particles) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = p.accent
          ? `rgba(${ACCENT},${p.opacity})`
          : `rgba(242,239,235,${p.opacity * 0.55})`
        ctx.fill()

        // drift & wrap
        p.x += p.vx
        p.y += p.vy
        if (p.x < -4) p.x = W + 4
        if (p.x > W + 4) p.x = -4
        if (p.y < -4) p.y = H + 4
        if (p.y > H + 4) p.y = -4
      }
      rafId = requestAnimationFrame(draw)
    }

    init()
    if (motionEnabled) {
      rafId = requestAnimationFrame(draw)
    } else {
      // Static snapshot — draw once, no animation
      draw()
      cancelAnimationFrame(rafId)
    }

    const ro = new ResizeObserver(() => { resize(); if (!motionEnabled) draw() })
    ro.observe(canvas)

    return () => {
      cancelAnimationFrame(rafId)
      ro.disconnect()
    }
  }, [motionEnabled])

  return (
    /* Entire background stack, z-0, pointer-events-none */
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">

      {/* 1 — Subtle dot-grid SVG (static, CSS-only, scales to any size) */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.04]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="hero-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="0.75" cy="0.75" r="0.75" fill="#f2efeb" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-grid)" />
      </svg>

      {/* 2 — Top-centre red ambient glow (right-column depth) */}
      <div
        className="absolute right-0 top-[-80px] w-[520px] h-[520px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(227,43,60,0.07) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      {/* 3 — Centre-left secondary glow for depth */}
      <div
        className="absolute left-[-100px] top-1/2 -translate-y-1/2 w-[380px] h-[380px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(227,43,60,0.04) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />

      {/* 4 — Bottom vignette fade into the next section */}
      <div
        className="absolute bottom-0 left-0 w-full h-32"
        style={{
          background: 'linear-gradient(to bottom, transparent, rgba(9,9,9,0.6))',
        }}
      />

      {/* 5 — Particle canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ mixBlendMode: 'screen' }}
      />
    </div>
  )
})

export default function Hero() {
  const { motionEnabled } = useMotion()
  const [titleIndex, setTitleIndex] = useState(0)

  useEffect(() => {
    if (!motionEnabled) return
    const interval = setInterval(() => {
      setTitleIndex((prev) => (prev + 1) % TITLES.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [motionEnabled])

  const scrollTo = (href) => {
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: motionEnabled ? 'smooth' : 'auto' })
  }

  const animProps = motionEnabled
    ? { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 } }
    : { initial: { opacity: 1, y: 0 }, animate: { opacity: 1, y: 0 } }

  return (
    <section
      id="hero"
      className="relative pt-36 pb-24 px-6 overflow-hidden bg-darkBg"
      aria-label="Hero"
    >
      <HeroBackground motionEnabled={motionEnabled} />

      <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">

        {/* Left Column: Content */}
        <div className="lg:col-span-7 flex flex-col items-start">

          {/* Top bar: Availability & Location */}
          <motion.div
            {...animProps}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="flex flex-wrap items-center gap-4 mb-6"
          >
            {identity.availability && (
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-cardBg border border-cardBorder text-xs tracking-widest text-lightText uppercase">
                <span className={`w-2 h-2 rounded-full bg-brandAccent ${motionEnabled ? 'animate-pulse' : ''}`} />
                <span>{identity.availability}</span>
              </div>
            )}

            {identity.location && (
              <div className="inline-flex items-center gap-1.5 text-xs text-mutedText tracking-wide">
                <MapPin size={13} className="text-brandAccent" />
                <span>{identity.location}</span>
              </div>
            )}
          </motion.div>

          {/* New Greeting and Name */}
          <motion.div
            className="mb-6 space-y-2"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
            }}
          >
            <motion.p
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              className="text-lg sm:text-xl text-mutedText font-medium"
            >
              Hi, I'm
            </motion.p>
            <motion.h1
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight leading-[0.92] text-lightText uppercase"
            >
              <span className="text-brandAccent inline-block relative">
                Manjeet Yadav.
                <span className="absolute -bottom-2 left-0 w-full h-1 bg-brandAccent/30 blur-[1px]" />
              </span>
            </motion.h1>

            {/* Animated Title */}
            <div className="h-[2em] overflow-hidden relative">
              <AnimatePresence mode="wait">
                <motion.p
                  key={titleIndex}
                  initial={motionEnabled ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
                  animate={motionEnabled ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
                  exit={motionEnabled ? { opacity: 0, y: -20 } : { opacity: 0, y: 0 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="text-2xl sm:text-3xl text-brandAccent font-display uppercase tracking-wide absolute top-0 left-0 w-full"
                >
                  {TITLES[titleIndex]}
                </motion.p>
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Intro / Bio */}
          <motion.p
            {...animProps}
            transition={{ duration: 0.8, delay: motionEnabled ? 0.6 : 0, ease: 'easeOut' }}
            className="text-base sm:text-lg text-mutedText max-w-xl leading-relaxed mb-8 font-body"
          >
            {identity.intro}
          </motion.p>

          {/* CTAs */}
          <motion.div
            {...animProps}
            transition={{ duration: 0.8, delay: motionEnabled ? 0.7 : 0, ease: 'easeOut' }}
            className="flex flex-wrap items-center gap-4 mb-12"
          >
            <button
              type="button"
              onClick={() => scrollTo('#projects')}
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-brandAccent text-lightText font-body text-sm font-medium tracking-wide hover:bg-brandAccent/90 transition-all duration-200 group cursor-pointer shadow-lg shadow-brandAccent/20"
            >
              <span>View Projects</span>
              <ArrowRight size={16} className={`transition-transform duration-200 ${motionEnabled ? 'group-hover:translate-x-1' : ''}`} />
            </button>

            <a
              href="/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-cardBg border border-cardBorder text-lightText font-body text-sm font-medium tracking-wide hover:border-brandAccent/50 transition-all duration-200 cursor-pointer"
            >
              <ExternalLink size={16} />
              <span>View Resume</span>
            </a>

            <a
              href="/resume.pdf"
              download="Manjeet_Yadav_Resume.pdf"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-cardBg border border-cardBorder text-lightText font-body text-sm font-medium tracking-wide hover:border-brandAccent/50 transition-all duration-200 cursor-pointer"
            >
              <Download size={16} />
              <span>Download Resume</span>
            </a>

            {preferences.showContactForm && (
              <button
                type="button"
                onClick={() => scrollTo('#contact')}
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-cardBg border border-cardBorder text-lightText font-body text-sm font-medium tracking-wide hover:border-brandAccent/50 transition-all duration-200 cursor-pointer"
              >
                <span>Get in Touch</span>
              </button>
            )}
          </motion.div>

        </div>

        {/* Right Column: Interactive 3D Technology Cube */}
        <motion.div
          {...animProps}
          transition={{ duration: 0.9, delay: motionEnabled ? 0.25 : 0, ease: 'easeOut' }}
          className="lg:col-span-5 w-full flex items-center justify-center"
        >
          <TechCube3D />
        </motion.div>

      </div>

      {/* Technology / Skill pills spanning full width below */}
      {skills && skills.length > 0 && (
        <div className="max-w-6xl mx-auto mt-16 pt-8 border-t border-cardBorder relative z-10">
          <div className="flex items-center gap-2 mb-4 text-xs text-mutedText tracking-widest uppercase">
            <Sparkles size={13} className="text-brandAccent" />
            <span>Core Expertise & Tech Stack</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {skills.slice(0, 8).map((skill) => (
              <span
                key={skill}
                className="px-3 py-1 text-xs font-mono bg-cardBg border border-cardBorder text-mutedText rounded-none tracking-wide"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={() => scrollTo('#projects')}
          aria-label="Scroll to projects"
          className="flex flex-col items-center gap-2 group cursor-pointer bg-transparent border-0 p-0"
        >
          {/* Mouse shell */}
          <div className="w-5 h-8 rounded-full border border-mutedText/40 group-hover:border-brandAccent/60 transition-colors duration-300 relative flex justify-center pt-1.5 overflow-hidden">
            {/* Scrolling dot — animates only when motion is enabled */}
            <motion.span
              className="w-0.5 h-1.5 rounded-full bg-brandAccent block"
              animate={motionEnabled ? { y: [0, 10, 0], opacity: [1, 0, 1] } : {}}
              transition={motionEnabled ? { duration: 1.6, repeat: Infinity, ease: 'easeInOut' } : {}}
            />
          </div>
          {/* Label */}
          <span className="text-[9px] font-mono tracking-[0.2em] text-mutedText/50 uppercase group-hover:text-brandAccent/70 transition-colors duration-300">
            Scroll to explore
          </span>
        </button>
      </div>
    </section>
  )
}
