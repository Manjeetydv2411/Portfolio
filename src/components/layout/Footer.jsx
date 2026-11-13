import { Mail, ArrowUp } from 'lucide-react'
import { identity, contact } from '../../config/site.js'

// Inline SVG for LinkedIn
function LinkedinIcon({ size = 16, strokeWidth = 1.75 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}

// Inline SVG for Instagram
function InstagramIcon({ size = 16, strokeWidth = 1.75 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}

// Inline SVG for GitHub
function GithubIcon({ size = 16, strokeWidth = 1.75 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  )
}

const SOCIAL_LINKS = [
  { label: 'GitHub',    href: contact.github,                  Icon: GithubIcon    },
  { label: 'LinkedIn',  href: contact.linkedin,                Icon: LinkedinIcon  },
  { label: 'Instagram', href: contact.instagram,               Icon: InstagramIcon },
  { label: 'Email',     href: `mailto:${contact.email}`,       Icon: Mail          },
].filter((s) => s.href && s.href.trim() !== '' && s.href !== 'mailto:')

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-cardBorder bg-darkBg" role="contentinfo">
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">

        {/* Name + copyright */}
        <div className="flex flex-col items-center md:items-start gap-1">
          <span className="font-display text-lightText tracking-widest text-base">
            {identity.fullName}
          </span>
          <span className="text-xs text-mutedText tracking-wide">
            © {year} — All rights reserved
          </span>
        </div>

        {/* Social links */}
        <nav aria-label="Social links" className="flex items-center gap-5">
          {SOCIAL_LINKS.map(({ label, href, Icon }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith('mailto') ? undefined : '_blank'}
              rel={href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
              aria-label={label}
              title={label}
              className="w-9 h-9 flex items-center justify-center bg-cardBg border border-cardBorder rounded-md text-mutedText hover:text-brandAccent hover:border-brandAccent/50 transition-all duration-200"
            >
              <Icon size={16} strokeWidth={1.75} />
            </a>
          ))}
        </nav>

        {/* Back to top */}
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Back to top"
          className="flex items-center gap-2 text-xs text-mutedText hover:text-brandAccent tracking-widest uppercase transition-colors duration-200 group"
        >
          <span>Top</span>
          <ArrowUp
            size={14}
            className="transition-transform duration-200 group-hover:-translate-y-0.5"
          />
        </button>

      </div>
    </footer>
  )
}
