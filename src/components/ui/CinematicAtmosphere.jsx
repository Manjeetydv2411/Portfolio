import { useEffect, useRef } from 'react'
import { useMotion } from '../../config/MotionContext.jsx'

export default function CinematicAtmosphere() {
  const { motionEnabled } = useMotion()
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    let W, H, rafId
    let stars = []
    let mouse = { x: -200, y: -200, active: false }
    let spotlight = { x: -200, y: -200 }
    let trailParticles = []

    const starCount = 110 // Elegant starfield density

    const initStars = () => {
      stars = Array.from({ length: starCount }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        size: Math.random() * 1.5 + 0.4, // 0.4px to 1.9px
        baseAlpha: Math.random() * 0.5 + 0.15,
        alpha: Math.random() * 0.5 + 0.15,
        twinkleSpeed: Math.random() * 0.015 + 0.005,
        twinkleOffset: Math.random() * Math.PI * 2,
        driftX: (Math.random() - 0.5) * 0.05,
        driftY: (Math.random() - 0.5) * 0.05,
      }))
    }

    const resize = () => {
      W = canvas.width = window.innerWidth
      H = canvas.height = window.innerHeight
      if (stars.length === 0) initStars()
    }

    resize()
    initStars()

    const handleMouseMove = (e) => {
      if (!motionEnabled) return
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      if (isTouch) return

      mouse.x = e.clientX
      mouse.y = e.clientY
      mouse.active = true

      // Spotlight smoothing
      spotlight.x += (mouse.x - spotlight.x) * 0.15
      spotlight.y += (mouse.y - spotlight.y) * 0.15

      // Cursor trail particles
      for (let i = 0; i < 2; i++) {
        trailParticles.push({
          x: mouse.x + (Math.random() - 0.5) * 6,
          y: mouse.y + (Math.random() - 0.5) * 6,
          r: Math.random() * 1.8 + 0.8,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          alpha: Math.random() * 0.5 + 0.3,
          decay: Math.random() * 0.02 + 0.015,
        })
      }
    }

    const handleMouseLeave = () => {
      mouse.active = false
      mouse.x = -200
      mouse.y = -200
    }

    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    document.addEventListener('mouseleave', handleMouseLeave)

    // Magnetic hover setup for interactive elements (excluding project articles to prevent horizontal card shifting)
    const handleMouseOver = (e) => {
      if (!motionEnabled) return
      const target = e.target.closest('button, a, [role="button"]')
      if (!target) return
      target.style.transition = 'transform 0.2s cubic-bezier(0.25, 1, 0.5, 1)'

      const onTargetMove = (te) => {
        const rect = target.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        const distX = te.clientX - centerX
        const distY = te.clientY - centerY
        target.style.transform = `translate(${distX * 0.12}px, ${distY * 0.12}px)`
      }

      const onTargetLeave = () => {
        target.style.transform = 'translate(0px, 0px)'
        target.removeEventListener('mousemove', onTargetMove)
        target.removeEventListener('mouseleave', onTargetLeave)
      }

      target.addEventListener('mousemove', onTargetMove, { passive: true })
      target.addEventListener('mouseleave', onTargetLeave)
    }

    document.addEventListener('mouseover', handleMouseOver, { passive: true })

    let time = 0
    const animate = (timestamp) => {
      time = timestamp * 0.001
      ctx.clearRect(0, 0, W, H)

      // 1. Render Starfield
      for (const s of stars) {
        if (motionEnabled) {
          // Gentle twinkling
          const currentAlpha = s.baseAlpha + Math.sin(time * s.twinkleSpeed * 60 + s.twinkleOffset) * 0.25
          s.alpha = Math.max(0.05, Math.min(0.85, currentAlpha))

          // Slow drift
          s.x += s.driftX
          s.y += s.driftY
          if (s.x < 0) s.x = W
          if (s.x > W) s.x = 0
          if (s.y < 0) s.y = H
          if (s.y > H) s.y = 0
        }

        ctx.beginPath()
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(242, 239, 235, ${s.alpha})`
        ctx.fill()
      }

      // 2. Cursor Spotlight (Soft red radial gradient)
      if (motionEnabled && mouse.active) {
        const gradRadius = 320
        const gradient = ctx.createRadialGradient(
          spotlight.x, spotlight.y, 0,
          spotlight.x, spotlight.y, gradRadius
        )
        gradient.addColorStop(0, 'rgba(255, 38, 60, 0.08)')
        gradient.addColorStop(0.5, 'rgba(255, 38, 60, 0.025)')
        gradient.addColorStop(1, 'transparent')

        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, W, H)
      }

      // 3. Particle Trail
      if (motionEnabled) {
        for (let i = trailParticles.length - 1; i >= 0; i--) {
          const p = trailParticles[i]
          p.x += p.vx
          p.y += p.vy
          p.alpha -= p.decay

          if (p.alpha <= 0) {
            trailParticles.splice(i, 1)
            continue
          }

          ctx.beginPath()
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(255, 38, 60, ${p.alpha})`
          ctx.shadowColor = '#ff263c'
          ctx.shadowBlur = 6
          ctx.fill()
          ctx.shadowBlur = 0
        }
      }

      rafId = requestAnimationFrame(animate)
    }

    rafId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
      document.removeEventListener('mouseover', handleMouseOver)
    }
  }, [motionEnabled])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[95]"
      aria-hidden="true"
    />
  )
}
