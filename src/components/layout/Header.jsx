import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Play, Pause } from 'lucide-react'
import { identity, preferences } from '../../config/site.js'
import { useMotion } from '../../config/MotionContext.jsx'

const NAV_LINKS = [
  { label: 'About',      href: '#about' },
  { label: 'Skills',     href: '#skills' },
  { label: 'Projects',   href: '#projects' },
  { label: 'Playground', href: '#playground' },
  { label: 'Contact',    href: '#contact', show: preferences.showContactForm },
]

export default function Header() {
  const { motionEnabled, toggleMotion } = useMotion()
  const [scrolled,     setScrolled]     = useState(false)
  const [menuOpen,     setMenuOpen]     = useState(false)
  const [activeSection, setActiveSection] = useState('hero')

  // Scroll shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Active section via IntersectionObserver
  useEffect(() => {
    const ids = NAV_LINKS.map((l) => l.href.replace('#', ''))
    const observers = []

    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id) },
        { rootMargin: '-40% 0px -55% 0px' }
      )
      obs.observe(el)
      observers.push(obs)
    })

    return () => observers.forEach((o) => o.disconnect())
  }, [])

  // Close menu on Escape
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') setMenuOpen(false)
  }, [])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const visibleLinks = NAV_LINKS.filter((l) => l.show !== false)

  const handleNavClick = (href) => {
    setMenuOpen(false)
    setTimeout(() => {
      const el = document.querySelector(href)
      if (el) el.scrollIntoView({ behavior: motionEnabled ? 'smooth' : 'auto' })
    }, 80)
  }

  return (
    <>
      <header
        className={[
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled
            ? 'bg-darkBg/90 backdrop-blur-md border-b border-cardBorder/80 shadow-lg shadow-black/20 py-2.5'
            : 'bg-transparent py-4',
        ].join(' ')}
        role="banner"
      >
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">

          {/* Logo with profile photo and name indicator */}
          <a
            href="#hero"
            onClick={(e) => { e.preventDefault(); handleNavClick('#hero') }}
            className="flex items-center gap-3 hover:opacity-95 transition-opacity duration-200 group"
            aria-label={`${identity.fullName} — back to top`}
          >
            <div className="w-9 h-9 rounded-lg overflow-hidden border border-brandAccent/60 bg-darkBg flex items-center justify-center shadow-md group-hover:border-brandAccent transition-colors">
              <img
                src="/images/logo1.jpeg"
                alt={`${identity.fullName} Logo`}
                className="w-full h-full object-contain p-0.5 group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <span className="font-display text-lg uppercase tracking-wider text-lightText hidden sm:inline">
              {identity.displayName}
            </span>
          </a>

          {/* Desktop nav */}
          <nav aria-label="Primary navigation" className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-7 bg-cardBg/60 border border-cardBorder px-5 py-2 backdrop-blur-sm rounded-md">
              {visibleLinks.map((link) => {
                const isActive = activeSection === link.href.replace('#', '')
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => { e.preventDefault(); handleNavClick(link.href) }}
                    className={[
                      'text-xs font-mono tracking-widest uppercase transition-colors duration-200 relative py-1',
                      isActive
                        ? 'text-brandAccent font-semibold'
                        : 'text-mutedText hover:text-lightText',
                    ].join(' ')}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {link.label}
                    {isActive && motionEnabled && (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-brandAccent"
                      />
                    )}
                  </a>
                )
              })}
            </div>

            {/* Motion Toggle Button */}
            <button
              type="button"
              onClick={toggleMotion}
              aria-label={motionEnabled ? 'Disable animations' : 'Enable animations'}
              title={motionEnabled ? 'Animations: ON (Click to disable)' : 'Animations: OFF (Click to enable)'}
              className={`p-2.5 border transition-all duration-200 flex items-center gap-1.5 text-xs font-mono cursor-pointer rounded-md ${
                motionEnabled
                  ? 'border-brandAccent/60 text-brandAccent bg-brandAccent/10 hover:border-brandAccent'
                  : 'border-cardBorder text-mutedText bg-cardBg hover:text-lightText'
              }`}
            >
              {motionEnabled ? <Pause size={13} /> : <Play size={13} />}
              <span className="hidden xl:inline">{motionEnabled ? 'Motion: On' : 'Motion: Off'}</span>
            </button>

            {/* CTA */}
            <a
              href="#contact"
              onClick={(e) => { e.preventDefault(); handleNavClick('#contact') }}
              className="px-5 py-2.5 bg-brandAccent text-lightText font-body text-xs font-medium uppercase tracking-widest hover:bg-brandAccent/85 transition-all duration-200 shadow-md shadow-brandAccent/20 cursor-pointer rounded-md"
            >
              Let's Talk
            </a>
          </nav>

          {/* Mobile right controls (Motion toggle + Hamburger) */}
          <div className="md:hidden flex items-center gap-2">
            <button
              type="button"
              onClick={toggleMotion}
              aria-label={motionEnabled ? 'Disable animations' : 'Enable animations'}
              className={`p-2 border transition-colors flex items-center text-xs font-mono cursor-pointer rounded-md ${
                motionEnabled
                  ? 'border-brandAccent text-brandAccent bg-brandAccent/10'
                  : 'border-cardBorder text-mutedText bg-cardBg'
              }`}
            >
              {motionEnabled ? <Pause size={14} /> : <Play size={14} />}
            </button>

            <button
              type="button"
              className="flex items-center justify-center w-10 h-10 bg-cardBg border border-cardBorder text-lightText hover:text-brandAccent transition-colors duration-200 rounded-md"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            initial={motionEnabled ? { opacity: 0, y: -8 } : { opacity: 1 }}
            animate={{ opacity: 1, y: 0 }}
            exit={motionEnabled ? { opacity: 0, y: -8 } : { opacity: 0 }}
            transition={{ duration: motionEnabled ? 0.2 : 0, ease: 'easeOut' }}
            className="fixed inset-0 z-40 bg-darkBg/98 backdrop-blur-md flex flex-col pt-24 px-6 sm:px-10 pb-12 overflow-y-auto"
            onClick={() => setMenuOpen(false)}
          >
            <div className="w-full max-w-md mx-auto flex flex-col flex-1" onClick={(e) => e.stopPropagation()}>
              <nav aria-label="Mobile navigation" className="flex flex-col gap-2 mt-2">
                {visibleLinks.map((link, i) => {
                  const isActive = activeSection === link.href.replace('#', '')
                  return (
                    <motion.a
                      key={link.href}
                      href={link.href}
                      initial={motionEnabled ? { opacity: 0, x: -16 } : { opacity: 1 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: motionEnabled ? i * 0.05 : 0, duration: 0.2 }}
                      onClick={(e) => { e.preventDefault(); handleNavClick(link.href) }}
                      className={[
                        'font-display text-3xl sm:text-4xl tracking-wide py-3 px-2 border-b border-cardBorder transition-colors duration-200 flex items-center justify-between',
                        isActive ? 'text-brandAccent pl-4 border-l-2 border-l-brandAccent' : 'text-lightText hover:text-brandAccent',
                      ].join(' ')}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <span>{link.label}</span>
                      {isActive && <span className="w-2 h-2 rounded-full bg-brandAccent" />}
                    </motion.a>
                  )
                })}
              </nav>

              {/* Mobile CTA */}
              <motion.a
                href="#contact"
                initial={motionEnabled ? { opacity: 0 } : { opacity: 1 }}
                animate={{ opacity: 1 }}
                transition={{ delay: motionEnabled ? visibleLinks.length * 0.05 + 0.1 : 0 }}
                onClick={(e) => { e.preventDefault(); handleNavClick('#contact') }}
                className="mt-8 w-full py-4 bg-brandAccent text-lightText font-body text-sm font-medium uppercase tracking-widest text-center shadow-lg shadow-brandAccent/20 hover:bg-brandAccent/85 transition-all duration-200 cursor-pointer rounded-md"
              >
                Let's Talk
              </motion.a>

              {/* Availability badge */}
              <div className="mt-auto pt-8 flex items-center gap-2 text-xs text-mutedText tracking-widest uppercase">
                <span className={`w-2 h-2 rounded-full bg-brandAccent ${motionEnabled ? 'animate-pulse' : ''}`} />
                <span>{identity.availability}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
