import { useState, useMemo, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FolderGit2, ExternalLink, Code2, ArrowUpRight, Star, Cpu } from 'lucide-react'
import { projects as staticProjects, categories } from '../../config/site.js'
import { useMotion } from '../../config/MotionContext.jsx'
import ProjectModal from '../ui/ProjectModal.jsx'

export default function Projects() {
  const { motionEnabled } = useMotion()
  const [projectList, setProjectList] = useState(staticProjects)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [activeProject, setActiveProject] = useState(null)

  const imageRefs = useRef({})

  useEffect(() => {
    const fetchDynamicProjects = async () => {
      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api'
        const res = await fetch(`${apiBaseUrl}/projects`)
        const data = await res.json()
        if (res.ok && data.data && data.data.length > 0) {
          // Map MongoDB project fields to match frontend expectations if necessary
          const mapped = data.data.map(p => ({
            id: p._id,
            title: p.title,
            category: p.category || 'Full-Stack Web App',
            year: p.year || '2026',
            summary: p.summary,
            description: p.description,
            tools: p.tools || [],
            coverImage: p.coverImage || '',
            liveUrl: p.liveUrl || '',
            sourceUrl: p.sourceUrl || '',
            backendArchitecture: p.backendArchitecture || '',
            keyFeatures: p.keyFeatures || [],
            featured: p.featured,
          }))
          setProjectList(mapped)
        }
      } catch {
        // Fallback to static config projects on network error
      }
    }
    fetchDynamicProjects()
  }, [])

  const filteredProjects = useMemo(() => {
    return projectList.filter((project) =>
      selectedCategory === 'All' || project.category === selectedCategory
    )
  }, [projectList, selectedCategory])

  const allCategories = ['All', ...categories]

  const handleCardMouseMove = (e, id) => {
    if (!motionEnabled) return
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    if (isTouch) return

    const imgEl = imageRefs.current[id]
    if (!imgEl) return

    const card = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - card.left
    const y = e.clientY - card.top

    const centerX = card.width / 2
    const centerY = card.height / 2

    const moveY = ((y - centerY) / centerY) * 4

    imgEl.style.transform = `translate(0px, ${moveY}px) scale(1.05)`
  }

  const handleCardMouseLeave = (id) => {
    const imgEl = imageRefs.current[id]
    if (!imgEl) return
    imgEl.style.transform = 'translate(0px, 0px) scale(1)'
  }

  return (
    <section
      id="projects"
      className="py-24 px-6 bg-darkBg border-t border-cardBorder relative scroll-mt-16"
      aria-labelledby="projects-heading"
    >
      <div className="max-w-6xl mx-auto">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <div className="flex items-center gap-2 mb-2 text-xs font-mono text-brandAccent uppercase tracking-widest">
              <FolderGit2 size={14} />
              <span>Selected Work</span>
            </div>
            <h2
              id="projects-heading"
              className="font-display text-4xl sm:text-5xl md:text-6xl uppercase tracking-wide text-lightText"
            >
              Featured Projects
            </h2>
          </div>
          <p className="text-mutedText max-w-sm text-sm font-body">
            Production-grade web applications, real-time backend systems, and modern developer tooling.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-10 pb-6 border-b border-cardBorder">
          {allCategories.map((cat) => {
            const isActive = selectedCategory === cat
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={[
                  'px-4 py-2 text-xs font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer rounded-md',
                  isActive
                    ? 'bg-brandAccent text-lightText font-medium shadow-md shadow-brandAccent/20'
                    : 'bg-cardBg border border-cardBorder text-mutedText hover:text-lightText hover:border-brandAccent/40',
                ].join(' ')}
              >
                {cat}
              </button>
            )
          })}
        </div>

        {/* Project Card Stacking Sequence */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-20 bg-cardBg border border-cardBorder rounded-md">
            <p className="text-mutedText font-body text-base">No projects in this category.</p>
            <button
              type="button"
              onClick={() => setSelectedCategory('All')}
              className="mt-4 px-4 py-2 text-xs font-mono text-brandAccent hover:underline uppercase tracking-wider cursor-pointer"
            >
              Show all
            </button>
          </div>
        ) : (
          <div className="relative flex flex-col space-y-12 pb-16">
            {filteredProjects.map((project, index) => {
              const animProps = motionEnabled
                ? {
                    initial: { opacity: 0, y: 30 },
                    whileInView: { opacity: 1, y: 0 },
                    viewport: { once: true, margin: '-40px' },
                    transition: { duration: 0.5, delay: index * 0.1, ease: 'easeOut' },
                  }
                : { initial: { opacity: 1, y: 0 } }

              const stickyTop = 100 + index * 24

              return (
                <motion.article
                  key={project.id}
                  {...animProps}
                  style={{
                    position: 'sticky',
                    top: `${stickyTop}px`,
                    zIndex: (index + 1) * 10,
                  }}
                  onMouseMove={(e) => handleCardMouseMove(e, project.id)}
                  onMouseLeave={() => handleCardMouseLeave(project.id)}
                  className="group bg-cardBg border border-cardBorder rounded-md flex flex-col md:flex-row hover:border-brandAccent/60 transition-all duration-300 relative overflow-hidden shadow-2xl"
                >
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-brandAccent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left z-20" />

                  {project.coverImage && (
                    <div className="relative w-full md:w-5/12 h-56 md:h-auto bg-darkBg border-r border-cardBorder overflow-hidden shrink-0">
                      <img
                        ref={(el) => (imageRefs.current[project.id] = el)}
                        src={project.coverImage}
                        alt={project.title}
                        className="w-full h-full object-cover opacity-100 transition-transform duration-300 ease-out"
                        style={{ willChange: 'transform' }}
                        onError={(e) => { e.target.style.display = 'none' }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-cardBg via-cardBg/30 to-transparent pointer-events-none" />
                    </div>
                  )}

                  <div className="p-8 sm:p-10 flex flex-col flex-1 gap-5">

                    <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                      <span className="text-brandAccent uppercase tracking-widest">{project.category}</span>
                      <span className="text-mutedText">·</span>
                      <span className="text-mutedText">{project.year}</span>
                      {project.featured && (
                        <span className="ml-auto inline-flex items-center gap-1 text-[10px] uppercase bg-brandAccent/10 text-brandAccent px-2.5 py-0.5 border border-brandAccent/30">
                          <Star size={10} className="fill-brandAccent" />
                          Featured
                        </span>
                      )}
                    </div>

                    <h3
                      className="font-display text-3xl sm:text-4xl uppercase tracking-wide text-lightText group-hover:text-brandAccent transition-colors duration-200 leading-tight cursor-pointer"
                      onClick={() => setActiveProject(project)}
                    >
                      {project.title}
                    </h3>

                    <p className="text-mutedText font-body text-base leading-relaxed">
                      {project.summary}
                    </p>

                    {project.backendArchitecture && (
                      <div className="bg-darkBg border border-cardBorder p-3.5 text-xs font-mono text-mutedText flex items-start gap-2.5">
                        <Cpu size={15} className="text-brandAccent shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{project.backendArchitecture}</span>
                      </div>
                    )}

                    {project.tools && project.tools.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {project.tools.map((tool) => (
                          <span
                            key={tool}
                            className="px-3 py-1 text-xs font-mono bg-darkBg border border-cardBorder text-lightText tracking-wide rounded-md"
                          >
                            {tool}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-4 pt-4 mt-auto border-t border-cardBorder">
                      <button
                        type="button"
                        onClick={() => setActiveProject(project)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-mono bg-[#3d4150] hover:bg-[#4e5263] text-lightText transition-colors duration-200 rounded-md shadow-sm uppercase tracking-wider cursor-pointer"
                      >
                        <ArrowUpRight size={15} />
                        Details
                      </button>

                      {project.liveUrl && project.liveUrl.trim() !== '' ? (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          aria-label={`${project.title} live demo`}
                          className="ml-auto inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-mono bg-brandAccent hover:bg-brandAccent/85 text-lightText transition-colors duration-200 rounded-md shadow-md shadow-brandAccent/20"
                        >
                          <ExternalLink size={15} />
                          Live
                        </a>
                      ) : (
                        <span className="ml-auto inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-mono bg-cardBg border border-cardBorder text-lightText/50 rounded-md cursor-not-allowed">
                          <ExternalLink size={15} />
                          Coming Soon
                        </span>
                      )}

                      {project.sourceUrl && project.sourceUrl.trim() !== '' && (
                        <a
                          href={project.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          aria-label={`${project.title} source code`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-mono bg-[#3d4150] hover:bg-[#4e5263] text-lightText transition-colors duration-200 rounded-md shadow-sm"
                        >
                          <Code2 size={15} />
                          Code
                        </a>
                      )}
                    </div>

                  </div>
                </motion.article>
              )
            })}
          </div>
        )}

      </div>

      {/* Project Detail Modal */}
      {activeProject && (
        <ProjectModal
          project={activeProject}
          onClose={() => setActiveProject(null)}
        />
      )}
    </section>
  )
}
