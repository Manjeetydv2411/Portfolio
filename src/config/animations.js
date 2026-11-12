/**
 * Shared animation variants & helpers.
 *
 * All motion values are transform-only (opacity, translate, scale) so they
 * stay on the GPU compositor thread and never trigger layout recalculation.
 *
 * Every helper accepts `enabled` (from useMotion) and returns the correct
 * props object — when disabled everything resolves to opacity:1 / no movement.
 */

// ─── Scroll-in variants ────────────────────────────────────────────────────

/** Fade up from a small Y offset. Use on section headers and cards. */
export const fadeUp = (enabled, delay = 0) =>
  enabled
    ? {
        initial: { opacity: 0, y: 24 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: '-60px' },
        transition: { duration: 0.5, delay, ease: [0.25, 0.1, 0.25, 1] },
      }
    : { initial: { opacity: 1, y: 0 } }

/** Fade in with no Y movement — good for labels / eyebrow text. */
export const fadeIn = (enabled, delay = 0) =>
  enabled
    ? {
        initial: { opacity: 0 },
        whileInView: { opacity: 1 },
        viewport: { once: true, margin: '-60px' },
        transition: { duration: 0.4, delay, ease: 'easeOut' },
      }
    : { initial: { opacity: 1 } }

// ─── Hover / tap variants ──────────────────────────────────────────────────

/** Subtle lift for cards — scale + tiny Y shift. */
export const cardHover = (enabled) =>
  enabled
    ? {
        whileHover: { scale: 1.02, y: -4 },
        whileTap:   { scale: 0.99 },
        transition: { type: 'spring', stiffness: 320, damping: 22 },
      }
    : {}

/** Slight scale for small interactive elements: icon buttons, social links. */
export const iconHover = (enabled) =>
  enabled
    ? {
        whileHover: { scale: 1.15 },
        whileTap:   { scale: 0.88 },
        transition: { type: 'spring', stiffness: 400, damping: 20 },
      }
    : {}

/** Scale for CTA / primary buttons. */
export const buttonHover = (enabled) =>
  enabled
    ? {
        whileHover: { scale: 1.03 },
        whileTap:   { scale: 0.97 },
        transition: { type: 'spring', stiffness: 380, damping: 22 },
      }
    : {}
