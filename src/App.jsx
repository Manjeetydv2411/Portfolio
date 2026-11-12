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

function App() {
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
