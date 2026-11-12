import { createContext, useContext, useState, useEffect } from 'react'

const MotionContext = createContext({
  motionEnabled: true,
  toggleMotion: () => {},
})

export function MotionProvider({ children }) {
  const [motionEnabled, setMotionEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem('portfolio_motion')
      if (saved !== null) return JSON.parse(saved)
    } catch {
      // ignore
    }
    return !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  useEffect(() => {
    try {
      localStorage.setItem('portfolio_motion', JSON.stringify(motionEnabled))
    } catch {
      // ignore
    }
  }, [motionEnabled])

  const toggleMotion = () => setMotionEnabled((prev) => !prev)

  return (
    <MotionContext.Provider value={{ motionEnabled, toggleMotion }}>
      {children}
    </MotionContext.Provider>
  )
}

export function useMotion() {
  return useContext(MotionContext)
}
