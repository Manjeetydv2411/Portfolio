import { useState, useEffect, startTransition } from 'react'
import { preferences } from './config/site.js'
import { MotionProvider } from './config/MotionContext.jsx'
import Header from './components/layout/Header.jsx'
import Footer from './components/layout/Footer.jsx'
import Hero from './components/sections/Hero.jsx'
import Projects from './components/sections/Projects.jsx'
import About from './components/sections/About.jsx'
import Skills from './components/sections/Skills.jsx'
import Contact from './components/sections/Contact.jsx'
import FAQ from './components/sections/FAQ.jsx'
import Playground from './components/sections/Playground.jsx'
import ScrollProgress from './components/ui/ScrollProgress.jsx'
import CinematicAtmosphere from './components/ui/CinematicAtmosphere.jsx'
import Ticker from './components/ui/Ticker.jsx'
import AdminLogin from './components/admin/AdminLogin.jsx'
import AdminDashboard from './components/admin/AdminDashboard.jsx'
import { Loader2 } from 'lucide-react'

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname)
  const [authChecking, setAuthChecking] = useState(true)
  const [adminUser, setAdminUser] = useState(null)

  useEffect(() => {
    const handlePopState = () => {
      startTransition(() => {
        setCurrentPath(window.location.pathname)
      })
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // Verify admin session on mount or path change to /admin*
  useEffect(() => {
    if (currentPath.startsWith('/admin')) {
      const verifySession = async () => {
        setAuthChecking(true)
        try {
          const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api'
          const res = await fetch(`${apiBaseUrl}/admin/auth/me`, {
            method: 'GET',
            credentials: 'include',
          })
          const data = await res.json()
          if (res.ok && data.success) {
            setAdminUser(data.data)
            if (currentPath === '/admin/login') {
              window.history.replaceState({}, '', '/admin')
              setCurrentPath('/admin')
            }
          } else {
            setAdminUser(null)
            if (currentPath === '/admin') {
              window.history.replaceState({}, '', '/admin/login')
              setCurrentPath('/admin/login')
            }
          }
        } catch {
          setAdminUser(null)
          if (currentPath === '/admin') {
            window.history.replaceState({}, '', '/admin/login')
            setCurrentPath('/admin/login')
          }
        } finally {
          setAuthChecking(false)
        }
      }
      verifySession()
    } else {
      setAuthChecking(false)
    }
  }, [currentPath])

  // Admin routing views
  if (currentPath.startsWith('/admin')) {
    if (authChecking) {
      return (
        <div className="min-h-screen bg-darkBg text-lightText flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={32} className="animate-spin text-brandAccent" />
            <span className="text-xs font-mono uppercase tracking-widest text-mutedText">
              Verifying Authentication...
            </span>
          </div>
        </div>
      )
    }

    if (currentPath === '/admin/login') {
      if (adminUser) {
        window.history.replaceState({}, '', '/admin')
        return <AdminDashboard admin={adminUser} onLogout={() => setAdminUser(null)} />
      }
      return <AdminLogin onLoginSuccess={(admin) => { setAdminUser(admin); setCurrentPath('/admin'); }} />
    }

    if (currentPath === '/admin') {
      if (!adminUser) {
        window.history.replaceState({}, '', '/admin/login')
        return <AdminLogin onLoginSuccess={(admin) => { setAdminUser(admin); setCurrentPath('/admin'); }} />
      }
      return <AdminDashboard admin={adminUser} onLogout={() => setAdminUser(null)} />
    }

    // Fallback for unknown /admin/* routes
    window.history.replaceState({}, '', '/admin/login')
    return <AdminLogin onLoginSuccess={(admin) => { setAdminUser(admin); setCurrentPath('/admin'); }} />
  }

  // Portfolio Homepage
  return (
    <MotionProvider>
      <div className="min-h-screen bg-transparent text-lightText font-body relative">
        <CinematicAtmosphere />
        <ScrollProgress />
        <Header />

        <main>
          <Hero />
          <About />
          <Skills />
          <Projects />
          <Playground />
          <FAQ />

          {preferences.showContactForm && (
            <Contact />
          )}
        </main>

        <Ticker />
        <Footer />
      </div>
    </MotionProvider>
  )
}

export default App
