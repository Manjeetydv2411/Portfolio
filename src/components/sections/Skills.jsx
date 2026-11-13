import { motion } from 'framer-motion'
import { Cpu, Layout, Server, Code2, Wrench, Database } from 'lucide-react'
import { skills, tools } from '../../config/site.js'
import { useMotion } from '../../config/MotionContext.jsx'
import OrbitalSkills3D from '../three/OrbitalSkills3D.jsx'

// Reorganized into 6 professional SDE categories using confirmed portfolio data
const CATEGORIES = [
  {
    title: 'Programming Languages',
    subtitle: 'Core systems & scripting',
    icon: Code2,
    items: skills.filter((s) => /^(JavaScript|TypeScript|Python|C\+\+)$/i.test(s)),
  },
  {
    title: 'Frontend Development',
    subtitle: 'UI architecture & styling',
    icon: Layout,
    items: skills.filter((s) => /React|Tailwind/i.test(s)),
  },
  {
    title: 'Backend & APIs',
    subtitle: 'Server runtime & services',
    icon: Server,
    items: skills.filter((s) => /Node\.js|Express/i.test(s)),
  },
  {
    title: 'Databases',
    subtitle: 'Relational & NoSQL persistence',
    icon: Database,
    items: skills.filter((s) => /MongoDB|SQL/i.test(s)),
  },
  {
    title: 'Developer Tools',
    subtitle: 'Version control & workflow',
    icon: Wrench,
    items: tools,
    isSecondary: true, // Styling hint to distinguish workflow tools
  },
  {
    title: 'Core CS & System Design',
    subtitle: 'Data structures & architecture',
    icon: Cpu,
    items: skills.filter((s) => /Data Structures/i.test(s)),
  },
]

export default function Skills() {
  const { motionEnabled } = useMotion()

  return (
    <section
      id="skills"
      className="py-24 px-6 bg-darkBg border-t border-cardBorder relative scroll-mt-16"
      aria-labelledby="skills-heading"
    >
      <div className="max-w-6xl mx-auto">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <div className="flex items-center gap-2 mb-2 text-xs font-mono text-brandAccent uppercase tracking-widest">
              <Cpu size={14} />
              <span>Capabilities & Stack</span>
            </div>
            <h2
              id="skills-heading"
              className="font-display text-4xl sm:text-5xl md:text-6xl uppercase tracking-wide text-lightText"
            >
              Skills & Tools
            </h2>
          </div>
          <p className="text-mutedText max-w-sm text-sm font-body">
            Core programming languages, production backend frameworks, databases, and engineering tooling.
          </p>
        </div>

        {/* Interactive Orbital Skills Visualization */}
        <OrbitalSkills3D />

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-16">
          {CATEGORIES.map((cat, catIdx) => {
            const Icon = cat.icon
            if (!cat.items || cat.items.length === 0) return null

            const animProps = motionEnabled
              ? {
                  initial: { opacity: 0, y: 20 },
                  whileInView: { opacity: 1, y: 0 },
                  viewport: { once: true, margin: '-50px' },
                  transition: { duration: 0.4, delay: catIdx * 0.08, ease: 'easeOut' },
                }
              : { initial: { opacity: 1, y: 0 } }

            return (
              <motion.div
                key={cat.title}
                {...animProps}
                className="group bg-cardBg border border-cardBorder rounded-md p-6 sm:p-8 relative flex flex-col hover:border-brandAccent/60 transition-all duration-300 shadow-lg hover:-translate-y-1 overflow-hidden"
              >
                {/* Top accent line on hover */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-brandAccent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left z-10" />

                {/* Category Header */}
                <div className="flex items-start gap-4 mb-6 pb-4 border-b border-cardBorder">
                  <div className="w-10 h-10 flex items-center justify-center bg-darkBg border border-cardBorder text-brandAccent shrink-0">
                    <Icon size={18} />
                  </div>
                  <div>
                    <h3 className="font-display text-xl sm:text-2xl uppercase tracking-wide text-lightText leading-tight">
                      {cat.title}
                    </h3>
                    <p className="text-[11px] font-mono text-mutedText mt-0.5 uppercase tracking-wider">
                      {cat.subtitle}
                    </p>
                  </div>
                </div>

                {/* Skill Pills */}
                <div className="flex flex-wrap gap-2 mt-auto">
                  {cat.items.map((item) => {
                    const isWorkflowTool = cat.isSecondary && /macbook|zsh|omniroute/i.test(item)
                    return (
                      <span
                        key={item}
                        className={[
                          'px-3 py-1.5 text-xs font-mono tracking-wide transition-colors duration-200 border rounded-md',
                          isWorkflowTool
                            ? 'bg-darkBg/50 border-cardBorder text-mutedText/80 hover:text-lightText hover:border-brandAccent/40'
                            : 'bg-darkBg border-cardBorder text-lightText hover:border-brandAccent',
                        ].join(' ')}
                      >
                        {item}
                      </span>
                    )
                  })}
                </div>
              </motion.div>
            )
          })}
        </div>

      </div>
    </section>
  )
}

