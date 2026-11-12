import configData from '../../config.json'

// Named exports for clean per-component imports
export const identity    = configData.identity
export const contact     = configData.contact
export const projects    = configData.portfolio.projects
export const categories  = configData.portfolio.categories
export const skills      = configData.portfolio.skills
export const tools       = configData.portfolio.tools
export const experience  = configData.portfolio.experience
export const education   = configData.portfolio.education
export const appearance  = configData.appearance
export const preferences = configData.preferences
export const featuredIds = configData.portfolio.featuredProjectIds

// Default export keeps the full config available if needed
export default configData
