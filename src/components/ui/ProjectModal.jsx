import { useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { X, ExternalLink, Globe, Layers, Calendar, User, Code2, Cpu, CheckCircle2 } from 'lucide-react'
import { useMotion } from '../../config/MotionContext.jsx'

export default function ProjectModal({ project, onClose }) {
  const { motionEnabled } = useMotion()

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [handleKeyDown])

  if (!project) return null

  const animProps = motionEnabled
    ? { initial: { opacity: 0, scale: 0.95, y: 20 }, animate: { opacity: 1, scale: 1, y: 0 }, exit: { opacity: 0, scale: 0.95, y: 20 } }
    : { initial: { opacity: 1, scale: 1, y: 0 }, animate: { opacity: 1, scale: 1, y: 0 }, exit: { opacity: 1, scale: 1, y: 0 } }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-darkBg/85 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={onClose}
    >
      <motion.div
        {...animProps}
        transition={{ duration: motionEnabled ? 0.25 : 0, ease: 'easeOut' }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl bg-cardBg border border-cardBorder rounded-lg p-6 sm:p-8 md:p-10 text-lightText my-auto max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center text-mutedText hover:text-lightText hover:bg-darkBg border border-cardBorder rounded-md transition-all duration-200 cursor-pointer"
        >
          <X size={20} />
        </button>

        {/* Category & Year */}
        <div className="flex flex-wrap items-center gap-3 mb-3 text-xs font-mono text-brandAccent uppercase tracking-widest">
          <span className="flex items-center gap-1">
            <Layers size={13} />
            {project.category}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 text-mutedText">
            <Calendar size={13} />
            {project.year}
          </span>
        </div>

        {/* Title */}
        <h2
          id="modal-title"
          className="font-display text-3xl sm:text-4xl md:text-5xl uppercase tracking-wide mb-4 text-lightText"
        >
          {project.title}
        </h2>

        {/* Role */}
        {project.role && (
          <div className="flex items-center gap-2 mb-6 text-sm text-mutedText">
            <User size={15} className="text-brandAccent" />
            <span>Role: <strong className="text-lightText">{project.role}</strong></span>
          </div>
        )}

        {/* Summary */}
        <p className="text-base sm:text-lg text-mutedText mb-6 font-body leading-relaxed border-l-2 border-brandAccent pl-4">
          {project.summary}
        </p>

        {/* Backend Architecture Section */}
        {project.backendArchitecture && (
          <div className="mb-8 bg-darkBg border border-cardBorder p-5 relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-brandAccent" />
            <div className="flex items-center gap-2 mb-2 text-xs font-mono text-brandAccent uppercase tracking-widest">
              <Cpu size={14} />
              <span>Backend Architecture & Systems</span>
            </div>
            <p className="text-lightText font-body text-sm sm:text-base leading-relaxed">
              {project.backendArchitecture}
            </p>
          </div>
        )}

        {/* Key Features Section */}
        {project.keyFeatures && project.keyFeatures.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xs font-mono uppercase tracking-widest text-mutedText mb-3 flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-brandAccent" />
              <span>Engineering Highlights</span>
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {project.keyFeatures.map((feat, idx) => (
                <li key={idx} className="bg-darkBg border border-cardBorder p-3 text-xs sm:text-sm font-mono text-lightText flex items-start gap-2">
                  <span className="text-brandAccent mt-0.5">▸</span>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Full Description */}
        <div className="mb-8">
          <h3 className="text-xs font-mono uppercase tracking-widest text-mutedText mb-2">Overview</h3>
          <p className="text-lightText font-body leading-relaxed text-sm sm:text-base">
            {project.description}
          </p>
        </div>

        {/* Tools & Technologies */}
        {project.tools && project.tools.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xs font-mono uppercase tracking-widest text-mutedText mb-3 flex items-center gap-1.5">
              <Code2 size={13} className="text-brandAccent" />
              <span>Technologies & Tools</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {project.tools.map((tool) => (
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

        {/* Action Links */}
        <div className="flex flex-wrap items-center gap-4 pt-6 border-t border-cardBorder">
          {project.liveUrl && project.liveUrl.trim() !== '' && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-brandAccent text-lightText font-body text-sm font-medium tracking-wide hover:bg-brandAccent/85 transition-all duration-200 rounded-md shadow-md shadow-brandAccent/20"
            >
              <span>Live Demo</span>
              <ExternalLink size={15} />
            </a>
          )}

          {project.sourceUrl && project.sourceUrl.trim() !== '' && (
            <a
              href={project.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#3d4150] hover:bg-[#4e5263] text-lightText font-body text-sm font-medium tracking-wide transition-all duration-200 rounded-md shadow-sm"
            >
              <Code2 size={15} />
              <span>Source Code</span>
            </a>
          )}

          <button
            type="button"
            onClick={onClose}
            className="ml-auto px-5 py-3 text-sm bg-[#3d4150] hover:bg-[#4e5263] text-lightText font-body transition-all duration-200 cursor-pointer rounded-md shadow-sm"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  )
}

