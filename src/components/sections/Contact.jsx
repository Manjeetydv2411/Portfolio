import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Send, MapPin, Phone, ExternalLink, CheckCircle2, AlertCircle, Copy, Check, Loader2 } from 'lucide-react'
import { contact, identity } from '../../config/site.js'
import { useMotion } from '../../config/MotionContext.jsx'

export default function Contact() {
  const { motionEnabled } = useMotion()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })

  const [fieldErrors, setFieldErrors] = useState({
    name: false,
    email: false,
    subject: false,
    message: false,
  })

  const [status, setStatus] = useState({
    submitting: false,
    success: false,
    error: '',
  })

  const [copied, setCopied] = useState(false)

  const handleCopyEmail = () => {
    if (!contact.email) return
    navigator.clipboard.writeText(contact.email).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }).catch(() => {
      // fallback
    })
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: false }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (status.submitting) return

    setStatus({ submitting: true, success: false, error: '' })

    const errors = {
      name: !formData.name.trim(),
      email: !formData.email.trim(),
      subject: !formData.subject.trim(),
      message: !formData.message.trim(),
    }

    setFieldErrors(errors)

    if (errors.name || errors.email || errors.subject || errors.message) {
      setStatus({ submitting: false, success: false, error: 'Please fill in all required fields.' })
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setFieldErrors((prev) => ({ ...prev, email: true }))
      setStatus({ submitting: false, success: false, error: 'Please enter a valid email address.' })
      return
    }

    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api'
      const response = await fetch(`${apiBaseUrl}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          subject: formData.subject.trim(),
          message: formData.message.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send message. Please try again.')
      }

      setStatus({
        submitting: false,
        success: true,
        error: '',
      })
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      })
    } catch (err) {
      setStatus({
        submitting: false,
        success: false,
        error: err.message || 'Network error. Please check your connection and try again.',
      })
    }
  }

  const animProps = motionEnabled
    ? { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-50px' }, transition: { duration: 0.5, ease: 'easeOut' } }
    : { initial: { opacity: 1, y: 0 } }

  return (
    <section
      id="contact"
      className="py-24 px-6 bg-darkBg border-t border-cardBorder relative scroll-mt-16"
      aria-labelledby="contact-heading"
    >
      <div className="max-w-6xl mx-auto">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <div className="flex items-center gap-2 mb-2 text-xs font-mono text-brandAccent uppercase tracking-widest">
              <Mail size={14} />
              <span>Get in Touch</span>
            </div>
            <h2
              id="contact-heading"
              className="font-display text-4xl sm:text-5xl md:text-6xl uppercase tracking-wide text-lightText"
            >
              Let's Work Together
            </h2>
          </div>
          <p className="text-mutedText max-w-sm text-sm font-body">
            Have a project in mind, want to discuss backend architecture, or explore placement opportunities? Drop a message.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

          {/* Left Column: Info & Links */}
          <motion.div
            {...animProps}
            className="lg:col-span-5 flex flex-col gap-6"
          >
            <div className="bg-cardBg border border-cardBorder rounded-md p-8 sm:p-10 relative overflow-hidden group hover:border-brandAccent/60 transition-all duration-300 shadow-lg">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-brandAccent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left z-10" />

              {/* Availability Callout Badge */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-cardBorder">
                <span className="text-xs font-mono text-brandAccent uppercase tracking-widest">
                  Start a Conversation
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-brandAccent/10 border border-brandAccent/30 text-[10px] font-mono uppercase text-brandAccent tracking-wider">
                  <span className={`w-1.5 h-1.5 rounded-full bg-brandAccent ${motionEnabled ? 'animate-pulse' : ''}`} />
                  Open for SDE Roles & Internships
                </span>
              </div>

              <p className="text-mutedText font-body text-sm sm:text-base leading-relaxed mb-8">
                Whether you have a project in mind, want to discuss scalable backend architectures, or just want to connect — my inbox is open.
              </p>

              <div className="space-y-6">
                {contact.email && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 flex items-center justify-center bg-darkBg border border-cardBorder rounded-md text-brandAccent shrink-0">
                      <Mail size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-mono text-mutedText uppercase tracking-wider block mb-1">Email</span>
                      <div className="flex items-center gap-3 flex-wrap">
                        <a
                          href={`mailto:${contact.email}`}
                          className="text-lightText hover:text-brandAccent font-body transition-colors truncate"
                        >
                          {contact.email}
                        </a>
                        <button
                          type="button"
                          onClick={handleCopyEmail}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#3d4150] hover:bg-[#4e5263] text-[10px] font-mono text-lightText transition-all cursor-pointer rounded-md shadow-sm"
                          title="Copy email address"
                        >
                          {copied ? (
                            <>
                              <Check size={12} className="text-emerald-400" />
                              <span className="text-emerald-400">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy size={12} />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {contact.phone && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 flex items-center justify-center bg-darkBg border border-cardBorder rounded-md text-brandAccent shrink-0">
                      <Phone size={18} />
                    </div>
                    <div>
                      <span className="text-xs font-mono text-mutedText uppercase tracking-wider block mb-1">Phone / WhatsApp</span>
                      <a
                        href={`tel:${contact.phone}`}
                        className="text-lightText hover:text-brandAccent font-body transition-colors"
                      >
                        {contact.phone}
                      </a>
                    </div>
                  </div>
                )}

                {identity.location && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 flex items-center justify-center bg-darkBg border border-cardBorder rounded-md text-brandAccent shrink-0">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <span className="text-xs font-mono text-mutedText uppercase tracking-wider block mb-1">Location</span>
                      <span className="text-lightText font-body">{identity.location}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Social profile links */}
              <div className="mt-8 pt-8 border-t border-cardBorder flex flex-wrap gap-3">
                {contact.linkedin && contact.linkedin.trim() !== '' && (
                  <a
                    href={contact.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#3d4150] hover:bg-[#4e5263] text-xs font-mono text-lightText transition-colors rounded-md shadow-sm"
                  >
                    <span>LinkedIn</span>
                    <ExternalLink size={12} />
                  </a>
                )}
                {contact.github && contact.github.trim() !== '' && (
                  <a
                    href={contact.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#3d4150] hover:bg-[#4e5263] text-xs font-mono text-lightText transition-colors rounded-md shadow-sm"
                  >
                    <span>GitHub</span>
                    <ExternalLink size={12} />
                  </a>
                )}
                {contact.instagram && contact.instagram.trim() !== '' && (
                  <a
                    href={contact.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#3d4150] hover:bg-[#4e5263] text-xs font-mono text-lightText transition-colors rounded-md shadow-sm"
                  >
                    <span>Instagram</span>
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>
          </motion.div>

          {/* Right Column: Contact Form */}
          <motion.div
            {...animProps}
            transition={{ duration: 0.5, delay: motionEnabled ? 0.15 : 0, ease: 'easeOut' }}
            className="lg:col-span-7"
          >
            <form
              onSubmit={handleSubmit}
              className="bg-cardBg border border-cardBorder rounded-md p-8 sm:p-10 space-y-6 relative overflow-hidden group hover:border-brandAccent/60 transition-all duration-300 shadow-lg"
              noValidate
              aria-label="Contact form"
            >
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-brandAccent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left z-10" />

              <div className="flex items-center justify-between mb-2">
                <h3 className="font-display text-2xl uppercase tracking-wide text-lightText">
                  Send a Message
                </h3>
                <span className="text-[10px] font-mono uppercase bg-darkBg border border-cardBorder px-2.5 py-1 text-mutedText">
                  API Integration
                </span>
              </div>
              <p className="text-mutedText text-xs font-mono uppercase tracking-wider mb-6">
                Secure REST API transmission
              </p>

              {status.error && (
                <div role="alert" className="p-4 bg-brandAccent/10 border border-brandAccent/40 flex items-center gap-3 text-lightText text-sm">
                  <AlertCircle size={18} className="text-brandAccent shrink-0" />
                  <span>{status.error}</span>
                </div>
              )}

              {status.success && (
                <div role="status" className="p-4 bg-emerald-500/10 border border-emerald-500/40 flex items-center gap-3 text-lightText text-sm">
                  <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                  <span>Message sent successfully! Thank you for reaching out.</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-xs font-mono uppercase tracking-wider text-mutedText mb-2">
                    Your Name <span className="text-brandAccent" aria-hidden="true">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    aria-required="true"
                    aria-invalid={fieldErrors.name}
                    placeholder="John Doe"
                    className={[
                      'w-full px-4 py-3 bg-darkBg border text-lightText placeholder:text-mutedText/50 font-body text-sm focus:outline-none focus:ring-1 transition-colors rounded-md',
                      fieldErrors.name
                        ? 'border-brandAccent ring-1 ring-brandAccent'
                        : 'border-cardBorder focus:border-brandAccent focus:ring-brandAccent',
                    ].join(' ')}
                  />
                  {fieldErrors.name && (
                    <span className="text-[11px] font-mono text-brandAccent mt-1 block">Name is required.</span>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-mono uppercase tracking-wider text-mutedText mb-2">
                    Your Email <span className="text-brandAccent" aria-hidden="true">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    aria-required="true"
                    aria-invalid={fieldErrors.email}
                    placeholder="john@example.com"
                    className={[
                      'w-full px-4 py-3 bg-darkBg border text-lightText placeholder:text-mutedText/50 font-body text-sm focus:outline-none focus:ring-1 transition-colors rounded-md',
                      fieldErrors.email
                        ? 'border-brandAccent ring-1 ring-brandAccent'
                        : 'border-cardBorder focus:border-brandAccent focus:ring-brandAccent',
                    ].join(' ')}
                  />
                  {fieldErrors.email && (
                    <span className="text-[11px] font-mono text-brandAccent mt-1 block">Valid email is required.</span>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-xs font-mono uppercase tracking-wider text-mutedText mb-2">
                  Subject <span className="text-brandAccent" aria-hidden="true">*</span>
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  aria-required="true"
                  aria-invalid={fieldErrors.subject}
                  placeholder="Project Inquiry / Collaboration"
                  className={[
                    'w-full px-4 py-3 bg-darkBg border text-lightText placeholder:text-mutedText/50 font-body text-sm focus:outline-none focus:ring-1 transition-colors rounded-md',
                    fieldErrors.subject
                      ? 'border-brandAccent ring-1 ring-brandAccent'
                      : 'border-cardBorder focus:border-brandAccent focus:ring-brandAccent',
                  ].join(' ')}
                />
                {fieldErrors.subject && (
                  <span className="text-[11px] font-mono text-brandAccent mt-1 block">Subject is required.</span>
                )}
              </div>

              <div>
                <label htmlFor="message" className="block text-xs font-mono uppercase tracking-wider text-mutedText mb-2">
                  Message <span className="text-brandAccent" aria-hidden="true">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  required
                  aria-required="true"
                  aria-invalid={fieldErrors.message}
                  placeholder="Tell me about your project or inquiry..."
                  className={[
                    'w-full px-4 py-3 bg-darkBg border text-lightText placeholder:text-mutedText/50 font-body text-sm focus:outline-none focus:ring-1 transition-colors resize-y rounded-md',
                    fieldErrors.message
                      ? 'border-brandAccent ring-1 ring-brandAccent'
                      : 'border-cardBorder focus:border-brandAccent focus:ring-brandAccent',
                  ].join(' ')}
                />
                {fieldErrors.message && (
                  <span className="text-[11px] font-mono text-brandAccent mt-1 block">Message is required.</span>
                )}
              </div>

              <button
                type="submit"
                disabled={status.submitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-brandAccent text-lightText font-body text-sm font-medium tracking-wide hover:bg-brandAccent/85 transition-all duration-200 cursor-pointer shadow-lg shadow-brandAccent/20 disabled:opacity-50 rounded-md"
              >
                {status.submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Sending Message...</span>
                  </>
                ) : (
                  <>
                    <span>Send Message</span>
                    <Send size={16} />
                  </>
                )}
              </button>
            </form>
          </motion.div>

        </div>

      </div>
    </section>
  )
}
