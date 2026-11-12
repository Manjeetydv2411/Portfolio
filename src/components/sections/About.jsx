import { motion } from 'framer-motion'
import { UserCheck, GraduationCap, Briefcase, Code, Terminal, Sparkles } from 'lucide-react'
import { identity, education, experience, tools, preferences } from '../../config/site.js'
import { useMotion } from '../../config/MotionContext.jsx'
import SolarSystem3D from '../three/SolarSystem3D.jsx'

export default function About() {
  const { motionEnabled } = useMotion()

  const animProps = motionEnabled
    ? { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-50px' }, transition: { duration: 0.5, ease: 'easeOut' } }
    : { initial: { opacity: 1, y: 0 } }

  return (
    <section
      id="about"
      className="py-24 px-6 bg-darkBg border-t border-cardBorder relative overflow-hidden scroll-mt-16"
      aria-labelledby="about-heading"
    >
      <div className="max-w-6xl mx-auto">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <div className="flex items-center gap-2 mb-2 text-xs font-mono text-brandAccent uppercase tracking-widest">
              <UserCheck size={14} />
              <span>Background & Identity</span>
            </div>
            <h2
              id="about-heading"
              className="font-display text-4xl sm:text-5xl md:text-6xl uppercase tracking-wide text-lightText"
            >
              About Me
            </h2>
          </div>
          <p className="text-mutedText max-w-sm text-sm font-body">
            Computer science background, academic foundations, professional experience, and technical tools.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-12">

          {/* Left Column: Bio & Intro */}
          <motion.div
            {...animProps}
            className="lg:col-span-7 flex flex-col gap-6"
          >
            <div className="bg-cardBg border border-cardBorder p-8 sm:p-10 relative">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-brandAccent" />

              <h3 className="font-display text-2xl sm:text-3xl uppercase tracking-wide text-lightText mb-4">
                {identity.profession}
              </h3>

              <p className="text-base sm:text-lg text-lightText font-body leading-relaxed mb-6">
                {identity.about}
              </p>

              <div className="pt-6 border-t border-cardBorder grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-mono text-mutedText">
                <div>
                  <span className="text-brandAccent uppercase tracking-wider block text-xs mb-1">Location</span>
                  <span className="text-lightText">{identity.location}</span>
                </div>
                <div>
                  <span className="text-brandAccent uppercase tracking-wider block text-xs mb-1">Status</span>
                  <span className="text-lightText inline-flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full bg-brandAccent ${motionEnabled ? 'animate-pulse' : ''}`} />
                    {identity.availability}
                  </span>
                </div>
              </div>
            </div>

            {/* Tools & Environment */}
            {tools && tools.length > 0 && (
              <div className="bg-cardBg border border-cardBorder p-6 sm:p-8">
                <div className="flex items-center gap-2 mb-4 text-xs font-mono text-brandAccent uppercase tracking-widest">
                  <Terminal size={14} />
                  <span>Development Environment & Tools</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tools.map((tool) => (
                    <span
                      key={tool}
                      className="px-3 py-1 text-xs font-mono bg-darkBg border border-cardBorder text-lightText tracking-wide"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Right Column: Education & Experience */}
          <motion.div
            {...animProps}
            transition={{ duration: 0.5, delay: motionEnabled ? 0.15 : 0, ease: 'easeOut' }}
            className="lg:col-span-5 flex flex-col gap-6"
          >
            {/* Education Card */}
            {preferences.showEducation && education && education.length > 0 && (
              <div className="bg-cardBg border border-cardBorder p-6 sm:p-8 hover:border-brandAccent/60 transition-all duration-300 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-brandAccent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left z-10" />

                <div className="flex items-center justify-between mb-6 pb-4 border-b border-cardBorder">
                  <div className="flex items-center gap-2 text-xs font-mono text-brandAccent uppercase tracking-widest">
                    <GraduationCap size={16} />
                    <span>Education</span>
                  </div>
                  <span className="text-[10px] font-mono uppercase bg-brandAccent/10 text-brandAccent px-2.5 py-0.5 border border-brandAccent/30 tracking-wider">
                    Currently Studying
                  </span>
                </div>

                <div className="space-y-6">
                  {education.map((edu, idx) => (
                    <div key={idx} className="relative pl-4 border-l-2 border-brandAccent/50 space-y-1.5">
                      <span className="text-xs font-mono text-brandAccent tracking-wider block">
                        {edu.period}
                      </span>
                      <h4 className="font-display text-xl sm:text-2xl uppercase text-lightText tracking-wide leading-tight">
                        {edu.degree}
                      </h4>
                      <p className="text-sm text-mutedText font-body">
                        {edu.institution}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Experience Card */}
            {preferences.showExperience && experience && experience.length > 0 && (
              <div className="bg-cardBg border border-cardBorder p-6 sm:p-8 hover:border-brandAccent/60 transition-all duration-300 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-brandAccent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left z-10" />

                <div className="flex items-center justify-between mb-6 pb-4 border-b border-cardBorder">
                  <div className="flex items-center gap-2 text-xs font-mono text-brandAccent uppercase tracking-widest">
                    <Briefcase size={16} />
                    <span>Experience</span>
                  </div>
                  <span className="text-[10px] font-mono uppercase bg-cardBg border border-cardBorder text-lightText px-2.5 py-0.5 tracking-wider">
                    Internship
                  </span>
                </div>

                <div className="space-y-6">
                  {experience.map((exp, idx) => (
                    <div key={idx} className="relative pl-4 border-l-2 border-brandAccent/50 space-y-2">
                      <span className="text-xs font-mono text-brandAccent tracking-wider block">
                        {exp.period}
                      </span>
                      <h4 className="font-display text-xl sm:text-2xl uppercase text-lightText tracking-wide leading-tight">
                        {exp.role}
                      </h4>
                      <p className="text-sm text-lightText font-semibold tracking-wide pb-1">
                        {exp.organization}
                      </p>

                      <div className="bg-darkBg border border-cardBorder p-4 space-y-3 mt-2">
                        <p className="text-sm text-mutedText font-body leading-relaxed">
                          {exp.description}
                        </p>
                        <div className="flex flex-wrap gap-2 pt-2 border-t border-cardBorder">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-cardBg border border-cardBorder text-xs font-mono text-lightText">
                            <span className="w-1.5 h-1.5 rounded-full bg-brandAccent" />
                            Intelligent Data Processing
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-cardBg border border-cardBorder text-xs font-mono text-lightText">
                            <span className="w-1.5 h-1.5 rounded-full bg-brandAccent" />
                            Backend Integration
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-cardBg border border-cardBorder text-xs font-mono text-lightText">
                            <span className="w-1.5 h-1.5 rounded-full bg-brandAccent" />
                            Analytical Pipeline Workflows
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </motion.div>

        </div>

        {/* Immersive 3D Solar System Journey Experience */}
        <SolarSystem3D />

      </div>
    </section>
  )
}
