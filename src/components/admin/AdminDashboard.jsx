import React, { useState, useEffect, useCallback, Component } from 'react'
import {
  LogOut,
  ShieldCheck,
  User,
  ArrowLeft,
  Mail,
  Clock,
  Search,
  Trash2,
  Eye,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader2,
  X,
  Inbox,
  Check,
  Send,
  MessageSquare,
  BarChart3,
  LayoutDashboard,
  ArrowRight,
  FolderGit2,
  Plus,
  Edit,
  Star,
  Globe,
  EyeOff,
  Image as ImageIcon,
} from 'lucide-react'

// React Error Boundary to catch any rendering crashes and display them instead of a black screen
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error in AdminDashboard:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-brandAccent/20 border border-brandAccent text-lightText rounded-md space-y-4 my-6">
          <h3 className="font-display text-2xl uppercase tracking-wide">Component Rendering Error</h3>
          <p className="text-sm font-body text-mutedText">An error occurred while rendering this section:</p>
          <pre className="text-xs font-mono bg-darkBg p-4 overflow-auto rounded border border-cardBorder text-brandAccent">
            {this.state.error && this.state.error.toString()}
          </pre>
        </div>
      )
    }
    return this.props.children
  }
}

export default function AdminDashboard({ admin, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview') // 'overview', 'messages', or 'projects'

  // Overview Analytics State
  const [overviewData, setOverviewData] = useState(null)
  const [overviewLoading, setOverviewLoading] = useState(true)
  const [overviewError, setOverviewError] = useState('')
  const [activityRange, setActivityRange] = useState('7')

  // Messages Inbox State
  const [messages, setMessages] = useState([])
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1, limit: 10 })
  const [stats, setStats] = useState({ total: 0, unread: 0, read: 0, replied: 0 })
  const [statusFilter, setStatusFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [messagesError, setMessagesError] = useState('')
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  // Projects Management State
  const [adminProjects, setAdminProjects] = useState([])
  const [projectsLoading, setProjectsLoading] = useState(false)
  const [projectsError, setProjectsError] = useState('')
  const [projectModalMode, setProjectModalMode] = useState(null) // 'create' or 'edit'
  const [currentProject, setCurrentProject] = useState(null)
  const [projectForm, setProjectForm] = useState({
    title: '',
    category: 'Full-Stack Web App',
    year: '2026',
    summary: '',
    description: '',
    tools: '',
    coverImage: '',
    coverImagePublicId: '',
    liveUrl: '',
    sourceUrl: '',
    backendArchitecture: '',
    keyFeatures: '',
    featured: false,
    published: true,
    displayOrder: 0,
  })
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5001/api')

  // Fetch Analytics Overview & Stats
  const fetchOverview = useCallback(async () => {
    setOverviewLoading(true)
    setOverviewError('')
    try {
      const res = await fetch(`${apiBaseUrl}/admin/analytics/overview`, {
        method: 'GET',
        credentials: 'include',
      })
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 401) {
          onLogout()
          return
        }
        throw new Error(data.message || 'Failed to fetch analytics overview.')
      }
      setOverviewData(data.data || null)
      if (data.data?.stats) {
        setStats(data.data.stats)
      }
    } catch (err) {
      setOverviewError(err.message || 'Error loading analytics.')
    } finally {
      setOverviewLoading(false)
    }
  }, [apiBaseUrl, onLogout])

  // Fetch Messages Inbox
  const fetchMessages = useCallback(async (pageToFetch = 1, status = statusFilter, search = searchQuery) => {
    setMessagesLoading(true)
    setMessagesError('')
    try {
      let url = `${apiBaseUrl}/admin/messages?page=${pageToFetch}&limit=10`
      if (status) url += `&status=${status}`
      if (search) url += `&search=${encodeURIComponent(search)}`

      const res = await fetch(url, {
        method: 'GET',
        credentials: 'include',
      })
      const data = await res.json()

      if (!res.ok) {
        if (res.status === 401) {
          onLogout()
          return
        }
        throw new Error(data.message || 'Failed to fetch messages.')
      }

      setMessages(Array.isArray(data.data) ? data.data : [])
      setPagination(data.pagination || { total: 0, page: 1, pages: 1, limit: 10 })
    } catch (err) {
      setMessagesError(err.message || 'Error loading messages.')
      setMessages([])
    } finally {
      setMessagesLoading(false)
    }
  }, [apiBaseUrl, statusFilter, searchQuery, onLogout])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setSearchQuery(searchInput)
  }

  // Fetch Projects for Admin
  const fetchAdminProjects = useCallback(async () => {
    setProjectsLoading(true)
    setProjectsError('')
    try {
      const res = await fetch(`${apiBaseUrl}/admin/projects`, {
        method: 'GET',
        credentials: 'include',
      })
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 401) {
          onLogout()
          return
        }
        throw new Error(data.message || 'Failed to fetch projects.')
      }
      setAdminProjects(Array.isArray(data.data) ? data.data : [])
    } catch (err) {
      setProjectsError(err.message || 'Error loading projects.')
      setAdminProjects([])
    } finally {
      setProjectsLoading(false)
    }
  }, [apiBaseUrl, onLogout])

  useEffect(() => {
    fetchOverview()
  }, [fetchOverview])

  useEffect(() => {
    if (activeTab === 'messages') {
      fetchMessages(1, statusFilter, searchQuery)
    } else if (activeTab === 'projects') {
      fetchAdminProjects()
    }
  }, [activeTab, statusFilter, searchQuery, fetchMessages, fetchAdminProjects])

  // Message Actions
  const handleUpdateStatus = async (id, newStatus, e) => {
    if (e) e.stopPropagation()
    setActionLoading(true)
    try {
      const res = await fetch(`${apiBaseUrl}/admin/messages/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to update status.')

      setMessages((prev) =>
        prev.map((msg) => (msg._id === id ? { ...msg, status: newStatus } : msg))
      )
      if (selectedMessage && selectedMessage._id === id) {
        setSelectedMessage((prev) => ({ ...prev, status: newStatus }))
      }
      fetchOverview()
    } catch (err) {
      alert(err.message || 'Failed to update status.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteMessage = async (id, e) => {
    if (e) e.stopPropagation()
    if (!window.confirm('Are you sure you want to delete this contact message?')) return

    setActionLoading(true)
    try {
      const res = await fetch(`${apiBaseUrl}/admin/messages/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to delete message.')

      if (selectedMessage && selectedMessage._id === id) {
        setSelectedMessage(null)
      }
      fetchOverview()
      if (activeTab === 'messages') {
        fetchMessages(pagination.page, statusFilter, searchQuery)
      }
    } catch (err) {
      alert(err.message || 'Failed to delete message.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleOpenMessage = async (msg) => {
    setSelectedMessage(msg)
    if (msg.status === 'unread') {
      await handleUpdateStatus(msg._id, 'read')
    }
  }

  // Project Actions
  const handleOpenCreateProject = () => {
    setCurrentProject(null)
    setProjectForm({
      title: '',
      category: 'Full-Stack Web App',
      year: '2026',
      summary: '',
      description: '',
      tools: '',
      coverImage: '',
      coverImagePublicId: '',
      liveUrl: '',
      sourceUrl: '',
      backendArchitecture: '',
      keyFeatures: '',
      featured: false,
      published: true,
      displayOrder: adminProjects.length,
    })
    setUploadError('')
    setProjectModalMode('create')
  }

  const handleOpenEditProject = (proj) => {
    setCurrentProject(proj)
    setProjectForm({
      title: proj.title || '',
      category: proj.category || 'Full-Stack Web App',
      year: proj.year || '2026',
      summary: proj.summary || '',
      description: proj.description || '',
      tools: Array.isArray(proj.tools) ? proj.tools.join(', ') : '',
      coverImage: proj.coverImage || '',
      coverImagePublicId: proj.coverImagePublicId || '',
      liveUrl: proj.liveUrl || '',
      sourceUrl: proj.sourceUrl || '',
      backendArchitecture: proj.backendArchitecture || '',
      keyFeatures: Array.isArray(proj.keyFeatures) ? proj.keyFeatures.join('\n') : '',
      featured: Boolean(proj.featured),
      published: proj.published !== undefined ? Boolean(proj.published) : true,
      displayOrder: proj.displayOrder !== undefined ? proj.displayOrder : 0,
    })
    setUploadError('')
    setProjectModalMode('edit')
  }

  const handleImageFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size must be less than 5MB.')
      return
    }

    setUploadingImage(true)
    setUploadError('')

    const formData = new FormData()
    formData.append('image', file)

    try {
      const res = await fetch(`${apiBaseUrl}/admin/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Image upload failed.')

      setProjectForm(prev => ({
        ...prev,
        coverImage: data.data.secure_url,
        coverImagePublicId: data.data.public_id,
      }))
    } catch (err) {
      setUploadError(err.message || 'Failed to upload image.')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleProjectSubmit = async (e) => {
    e.preventDefault()
    setActionLoading(true)
    try {
      const endpoint = projectModalMode === 'create'
        ? `${apiBaseUrl}/admin/projects`
        : `${apiBaseUrl}/admin/projects/${currentProject._id}`
      const method = projectModalMode === 'create' ? 'POST' : 'PATCH'

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(projectForm),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to save project.')

      setProjectModalMode(null)
      fetchAdminProjects()
    } catch (err) {
      alert(err.message || 'Error saving project.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return
    setActionLoading(true)
    try {
      const res = await fetch(`${apiBaseUrl}/admin/projects/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to delete project.')
      fetchAdminProjects()
    } catch (err) {
      alert(err.message || 'Error deleting project.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleToggleProjectProperty = async (id, field, currentValue) => {
    setActionLoading(true)
    try {
      const res = await fetch(`${apiBaseUrl}/admin/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ [field]: !currentValue }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to update project.')
      fetchAdminProjects()
    } catch (err) {
      alert(err.message || 'Failed to update project property.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch(`${apiBaseUrl}/admin/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })
    } catch {
      // ignore
    }
    onLogout()
  }

  const handleGoHome = (e) => {
    e.preventDefault()
    window.history.pushState({}, '', '/')
    window.dispatchEvent(new PopStateEvent('popstate'))
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'unread':
        return 'bg-brandAccent/10 border-brandAccent/30 text-brandAccent'
      case 'read':
        return 'bg-sky-500/10 border-sky-500/30 text-sky-400'
      case 'replied':
        return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
      default:
        return 'bg-mutedText/10 border-mutedText/30 text-mutedText'
    }
  }

  return (
    <div className="min-h-screen bg-darkBg text-lightText flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-cardBorder bg-cardBg/80 backdrop-blur-md px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 flex items-center justify-center bg-brandAccent/10 border border-brandAccent/30 text-brandAccent rounded-md">
              <ShieldCheck size={20} />
            </div>
            <div>
              <span className="font-display text-lg tracking-wider uppercase block leading-none text-lightText">
                Portfolio Admin
              </span>
              <span className="text-[10px] font-mono text-mutedText uppercase tracking-wider">
                Secure Dashboard
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleGoHome}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-darkBg border border-cardBorder hover:border-brandAccent/60 text-xs font-mono text-lightText transition-colors rounded-md cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>View Portfolio</span>
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-brandAccent hover:bg-brandAccent/85 text-xs font-mono text-lightText transition-colors rounded-md shadow-md cursor-pointer"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-cardBg/40 border-b border-cardBorder px-6">
        <div className="max-w-7xl mx-auto flex items-center gap-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 py-4 text-xs font-mono uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
              activeTab === 'overview'
                ? 'border-brandAccent text-brandAccent font-medium'
                : 'border-transparent text-mutedText hover:text-lightText'
            }`}
          >
            <LayoutDashboard size={16} />
            <span>Overview & Analytics</span>
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`flex items-center gap-2 py-4 text-xs font-mono uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
              activeTab === 'messages'
                ? 'border-brandAccent text-brandAccent font-medium'
                : 'border-transparent text-mutedText hover:text-lightText'
            }`}
          >
            <Inbox size={16} />
            <span>Messages Inbox</span>
            {stats.unread > 0 && (
              <span className="px-1.5 py-0.5 bg-brandAccent text-lightText text-[10px] rounded-full">
                {stats.unread}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`flex items-center gap-2 py-4 text-xs font-mono uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
              activeTab === 'projects'
                ? 'border-brandAccent text-brandAccent font-medium'
                : 'border-transparent text-mutedText hover:text-lightText'
            }`}
          >
            <FolderGit2 size={16} />
            <span>Projects Management</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 sm:p-10 space-y-8">
        {/* Welcome Banner */}
        <div className="bg-cardBg border border-cardBorder rounded-md p-8 sm:p-10 relative overflow-hidden group hover:border-brandAccent/60 transition-all duration-300 shadow-xl">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-brandAccent" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2 text-xs font-mono text-brandAccent uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Active Session</span>
              </div>
              <h1 className="font-display text-3xl sm:text-4xl uppercase tracking-wide text-lightText">
                Welcome back, {admin?.name || 'Admin'}
              </h1>
              <p className="text-mutedText text-xs font-mono uppercase tracking-wider mt-1">
                Authenticated via secure HttpOnly JWT Cookie
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-darkBg border border-cardBorder text-xs font-mono text-mutedText rounded-md">
              <Clock size={14} className="text-brandAccent" />
              <span>Server status: Online</span>
            </div>
          </div>
        </div>

        {/* ================= OVERVIEW TAB ================= */}
        {activeTab === 'overview' && (
          <ErrorBoundary>
            <div className="space-y-8">
            {overviewLoading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3 text-mutedText">
                <Loader2 size={28} className="animate-spin text-brandAccent" />
                <span className="text-xs font-mono uppercase tracking-widest">Loading analytics overview...</span>
              </div>
            ) : overviewError ? (
              <div role="alert" className="p-4 bg-brandAccent/10 border border-brandAccent/40 flex items-center gap-3 text-lightText text-sm rounded-md">
                <AlertCircle size={18} className="text-brandAccent shrink-0" />
                <span>{overviewError}</span>
              </div>
            ) : (
              overviewData && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div
                      onClick={() => setActiveTab('messages')}
                      className="bg-cardBg border border-cardBorder hover:border-brandAccent/60 rounded-md p-6 relative overflow-hidden cursor-pointer transition-all shadow-lg group"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 flex items-center justify-center bg-darkBg border border-cardBorder text-lightText rounded-md">
                          <Inbox size={18} />
                        </div>
                        <span className="text-[10px] font-mono uppercase text-mutedText bg-darkBg border border-cardBorder px-2.5 py-1">
                          Total
                        </span>
                      </div>
                      <span className="text-xs font-mono text-mutedText uppercase tracking-wider block mb-1">Total Messages</span>
                      <span className="font-display text-3xl text-lightText">{overviewData.stats?.total ?? 0}</span>
                      <div className="mt-4 pt-3 border-t border-cardBorder flex items-center justify-between text-xs font-mono text-brandAccent group-hover:translate-x-1 transition-transform">
                        <span>View Inbox</span>
                        <ArrowRight size={14} />
                      </div>
                    </div>

                    <div
                      onClick={() => setActiveTab('messages')}
                      className="bg-cardBg border border-cardBorder hover:border-brandAccent/60 rounded-md p-6 relative overflow-hidden cursor-pointer transition-all shadow-lg group"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 flex items-center justify-center bg-darkBg border border-cardBorder text-brandAccent rounded-md">
                          <Mail size={18} />
                        </div>
                        <span className="text-[10px] font-mono uppercase text-brandAccent bg-brandAccent/10 border border-brandAccent/30 px-2.5 py-1">
                          Unread
                        </span>
                      </div>
                      <span className="text-xs font-mono text-mutedText uppercase tracking-wider block mb-1">Unread Messages</span>
                      <span className="font-display text-3xl text-brandAccent">{overviewData.stats?.unread ?? 0}</span>
                      <div className="mt-4 pt-3 border-t border-cardBorder flex items-center justify-between text-xs font-mono text-brandAccent group-hover:translate-x-1 transition-transform">
                        <span>View Inbox</span>
                        <ArrowRight size={14} />
                      </div>
                    </div>

                    <div
                      onClick={() => setActiveTab('messages')}
                      className="bg-cardBg border border-cardBorder hover:border-sky-500/60 rounded-md p-6 relative overflow-hidden cursor-pointer transition-all shadow-lg group"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 flex items-center justify-center bg-darkBg border border-cardBorder text-sky-400 rounded-md">
                          <Eye size={18} />
                        </div>
                        <span className="text-[10px] font-mono uppercase text-sky-400 bg-sky-500/10 border border-sky-500/30 px-2.5 py-1">
                          Read
                        </span>
                      </div>
                      <span className="text-xs font-mono text-mutedText uppercase tracking-wider block mb-1">Read Messages</span>
                      <span className="font-display text-3xl text-sky-400">{overviewData.stats?.read ?? 0}</span>
                      <div className="mt-4 pt-3 border-t border-cardBorder flex items-center justify-between text-xs font-mono text-sky-400 group-hover:translate-x-1 transition-transform">
                        <span>View Inbox</span>
                        <ArrowRight size={14} />
                      </div>
                    </div>

                    <div
                      onClick={() => setActiveTab('messages')}
                      className="bg-cardBg border border-cardBorder hover:border-emerald-500/60 rounded-md p-6 relative overflow-hidden cursor-pointer transition-all shadow-lg group"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 flex items-center justify-center bg-darkBg border border-cardBorder text-emerald-400 rounded-md">
                          <CheckCircle2 size={18} />
                        </div>
                        <span className="text-[10px] font-mono uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1">
                          Replied
                        </span>
                      </div>
                      <span className="text-xs font-mono text-mutedText uppercase tracking-wider block mb-1">Replied Messages</span>
                      <span className="font-display text-3xl text-emerald-400">{overviewData.stats?.replied ?? 0}</span>
                      <div className="mt-4 pt-3 border-t border-cardBorder flex items-center justify-between text-xs font-mono text-emerald-400 group-hover:translate-x-1 transition-transform">
                        <span>View Inbox</span>
                        <ArrowRight size={14} />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-7 bg-cardBg border border-cardBorder rounded-md p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 left-0 right-0 h-0.5 bg-brandAccent" />

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <BarChart3 size={18} className="text-brandAccent" />
                          <h3 className="font-display text-xl uppercase tracking-wide text-lightText">
                            Message Activity
                          </h3>
                        </div>
                        <div className="flex items-center gap-1 bg-darkBg border border-cardBorder p-1 rounded-md">
                          <button
                            onClick={() => setActivityRange('7')}
                            className={`px-3 py-1 text-[10px] font-mono uppercase rounded transition-colors cursor-pointer ${
                              activityRange === '7' ? 'bg-brandAccent text-lightText' : 'text-mutedText hover:text-lightText'
                            }`}
                          >
                            Last 7 Days
                          </button>
                          <button
                            onClick={() => setActivityRange('30')}
                            className={`px-3 py-1 text-[10px] font-mono uppercase rounded transition-colors cursor-pointer ${
                              activityRange === '30' ? 'bg-brandAccent text-lightText' : 'text-mutedText hover:text-lightText'
                            }`}
                          >
                            Last 30 Days
                          </button>
                        </div>
                      </div>

                      <div className="pt-4">
                        {(() => {
                          const rawActivity = activityRange === '7' ? (overviewData.activity7Days || []) : (overviewData.activity30Days || []);
                          const maxCount = Math.max(...rawActivity.map(item => item.count), 1);

                          if (rawActivity.length === 0) {
                            return (
                              <div className="py-16 text-center text-mutedText font-mono text-xs uppercase">
                                No submission activity recorded in this period.
                              </div>
                            );
                          }

                          return (
                            <div className="space-y-4">
                              <div className="h-48 flex items-end gap-2 pt-6 pb-2 px-2 border-b border-cardBorder bg-darkBg/40 rounded-md">
                                {rawActivity.map((item) => {
                                  const heightPercent = Math.max(Math.round((item.count / maxCount) * 100), 8);
                                  return (
                                    <div key={item._id} className="flex-1 flex flex-col items-center gap-2 group relative">
                                      <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-darkBg border border-cardBorder px-2 py-1 text-[10px] font-mono text-lightText rounded pointer-events-none z-20 whitespace-nowrap shadow-md">
                                        {item._id}: {item.count} msg{item.count !== 1 ? 's' : ''}
                                      </div>
                                      <span className="text-[10px] font-mono text-mutedText group-hover:text-brandAccent transition-colors">
                                        {item.count}
                                      </span>
                                      <div
                                        style={{ height: `${heightPercent}%` }}
                                        className="w-full bg-brandAccent/80 hover:bg-brandAccent rounded-t transition-all duration-300"
                                      />
                                      <span className="text-[9px] font-mono text-mutedText truncate max-w-[36px]">
                                        {item._id.slice(5)}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                              <div className="flex items-center justify-between text-xs font-mono text-mutedText">
                                <span>Showing daily volume</span>
                                <span>Peak: {maxCount} messages</span>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    <div className="lg:col-span-5 bg-cardBg border border-cardBorder rounded-md p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 left-0 right-0 h-0.5 bg-brandAccent" />

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MessageSquare size={18} className="text-brandAccent" />
                          <h3 className="font-display text-xl uppercase tracking-wide text-lightText">
                            Recent Submissions
                          </h3>
                        </div>
                        <button
                          onClick={() => setActiveTab('messages')}
                          className="text-xs font-mono text-brandAccent hover:underline uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                        >
                          <span>View All</span>
                          <ArrowRight size={12} />
                        </button>
                      </div>

                      <div className="space-y-3">
                        {(!overviewData.recentMessages || overviewData.recentMessages.length === 0) ? (
                          <div className="py-12 text-center text-mutedText font-mono text-xs uppercase">
                            No recent messages.
                          </div>
                        ) : (
                          overviewData.recentMessages.map((msg) => (
                            <div
                              key={msg._id}
                              onClick={() => {
                                setSelectedMessage(msg)
                                setActiveTab('messages')
                              }}
                              className="p-4 bg-darkBg border border-cardBorder hover:border-brandAccent/60 rounded-md transition-all cursor-pointer group"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-lightText group-hover:text-brandAccent transition-colors text-sm">
                                  {msg.name}
                                </span>
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-mono uppercase border rounded ${getStatusBadgeClass(msg.status)}`}>
                                  {msg.status}
                                </span>
                              </div>
                              <div className="text-xs text-mutedText truncate mb-2">{msg.subject}</div>
                              <div className="flex items-center justify-between text-[10px] font-mono text-mutedText">
                                <span>{msg.email}</span>
                                <span>{new Date(msg.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )
            )}
            </div>
          </ErrorBoundary>
        )}

        {/* ================= MESSAGES INBOX TAB ================= */}
        {activeTab === 'messages' && (
          <ErrorBoundary>
            <div className="bg-cardBg border border-cardBorder rounded-md p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-brandAccent" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-cardBorder">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono uppercase tracking-wider text-mutedText mr-2">Filter:</span>
                <button
                  onClick={() => setStatusFilter('')}
                  className={`px-3 py-1.5 text-xs font-mono uppercase rounded-md transition-all cursor-pointer ${
                    statusFilter === '' ? 'bg-brandAccent text-lightText' : 'bg-darkBg border border-cardBorder text-mutedText hover:text-lightText'
                  }`}
                >
                  All ({stats.total})
                </button>
                <button
                  onClick={() => setStatusFilter('unread')}
                  className={`px-3 py-1.5 text-xs font-mono uppercase rounded-md transition-all cursor-pointer ${
                    statusFilter === 'unread' ? 'bg-brandAccent text-lightText' : 'bg-darkBg border border-cardBorder text-mutedText hover:text-lightText'
                  }`}
                >
                  Unread ({stats.unread})
                </button>
                <button
                  onClick={() => setStatusFilter('read')}
                  className={`px-3 py-1.5 text-xs font-mono uppercase rounded-md transition-all cursor-pointer ${
                    statusFilter === 'read' ? 'bg-sky-500 text-lightText' : 'bg-darkBg border border-cardBorder text-mutedText hover:text-lightText'
                  }`}
                >
                  Read ({stats.read})
                </button>
                <button
                  onClick={() => setStatusFilter('replied')}
                  className={`px-3 py-1.5 text-xs font-mono uppercase rounded-md transition-all cursor-pointer ${
                    statusFilter === 'replied' ? 'bg-emerald-500 text-lightText' : 'bg-darkBg border border-cardBorder text-mutedText hover:text-lightText'
                  }`}
                >
                  Replied ({stats.replied})
                </button>
              </div>

              <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
                <div className="relative flex-1 sm:w-72">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-mutedText">
                    <Search size={14} />
                  </span>
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search name, email, subject..."
                    className="w-full pl-9 pr-4 py-2 bg-darkBg border border-cardBorder text-lightText placeholder:text-mutedText/50 font-body text-xs focus:outline-none focus:border-brandAccent rounded-md"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#3d4150] hover:bg-[#4e5263] text-xs font-mono text-lightText transition-colors rounded-md cursor-pointer shrink-0"
                >
                  Search
                </button>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => { setSearchInput(''); setSearchQuery(''); }}
                    className="px-3 py-2 bg-darkBg border border-cardBorder text-xs font-mono text-mutedText hover:text-lightText transition-colors rounded-md cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </form>
            </div>

            {messagesError && (
              <div role="alert" className="p-4 bg-brandAccent/10 border border-brandAccent/40 flex items-center gap-3 text-lightText text-sm rounded-md">
                <AlertCircle size={18} className="text-brandAccent shrink-0" />
                <span>{messagesError}</span>
              </div>
            )}

            {messagesLoading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3 text-mutedText">
                <Loader2 size={28} className="animate-spin text-brandAccent" />
                <span className="text-xs font-mono uppercase tracking-widest">Loading messages...</span>
              </div>
            ) : (!Array.isArray(messages) || messages.length === 0) ? (
              <div className="py-20 text-center space-y-3">
                <div className="w-12 h-12 mx-auto flex items-center justify-center bg-darkBg border border-cardBorder text-mutedText rounded-md">
                  <MessageSquare size={24} />
                </div>
                <h3 className="font-display text-xl uppercase tracking-wide text-lightText">No Messages Found</h3>
                <p className="text-mutedText text-xs font-mono uppercase tracking-wider">
                  {searchQuery || statusFilter ? 'Try adjusting your search or status filter.' : 'Your inbox is currently empty.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-cardBorder text-[10px] font-mono text-mutedText uppercase tracking-wider">
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Sender</th>
                      <th className="py-3 px-4">Subject</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cardBorder font-body text-sm">
                    {messages.map((msg) => (
                      <tr
                        key={msg._id}
                        onClick={() => handleOpenMessage(msg)}
                        className="hover:bg-darkBg/60 transition-colors cursor-pointer group"
                      >
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-mono uppercase border rounded-md ${getStatusBadgeClass(msg.status)}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${msg.status === 'unread' ? 'bg-brandAccent animate-pulse' : msg.status === 'read' ? 'bg-sky-400' : 'bg-emerald-400'}`} />
                            {msg.status}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-medium text-lightText group-hover:text-brandAccent transition-colors">
                            {msg.name}
                          </div>
                          <div className="text-xs text-mutedText">{msg.email}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-lightText truncate max-w-xs">{msg.subject}</div>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap text-xs text-mutedText font-mono">
                          {msg.createdAt ? new Date(msg.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          }) : 'N/A'}
                        </td>
                        <td className="py-4 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleOpenMessage(msg)}
                              className="p-2 bg-darkBg border border-cardBorder hover:border-brandAccent text-lightText hover:text-brandAccent rounded-md transition-colors"
                              title="View message"
                            >
                              <Eye size={14} />
                            </button>
                            {msg.status !== 'replied' && (
                              <button
                                onClick={(e) => handleUpdateStatus(msg._id, 'replied', e)}
                                disabled={actionLoading}
                                className="p-2 bg-darkBg border border-cardBorder hover:border-emerald-500 text-lightText hover:text-emerald-400 rounded-md transition-colors"
                                title="Mark as replied"
                              >
                                <Check size={14} />
                              </button>
                            )}
                            <button
                              onClick={(e) => handleDeleteMessage(msg._id, e)}
                              disabled={actionLoading}
                              className="p-2 bg-darkBg border border-cardBorder hover:border-brandAccent text-lightText hover:text-brandAccent rounded-md transition-colors"
                              title="Delete message"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!messagesLoading && pagination?.pages > 1 && (
              <div className="flex items-center justify-between pt-6 border-t border-cardBorder text-xs font-mono text-mutedText">
                <span>
                  Page {pagination.page} of {pagination.pages} (Total: {pagination.total})
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fetchMessages(pagination.page - 1, statusFilter, searchQuery)}
                    disabled={pagination.page <= 1}
                    className="inline-flex items-center gap-1 px-3 py-2 bg-darkBg border border-cardBorder hover:border-brandAccent text-lightText transition-colors disabled:opacity-30 disabled:pointer-events-none rounded-md cursor-pointer"
                  >
                    <ChevronLeft size={14} />
                    <span>Previous</span>
                  </button>
                  <button
                    onClick={() => fetchMessages(pagination.page + 1, statusFilter, searchQuery)}
                    disabled={pagination.page >= pagination.pages}
                    className="inline-flex items-center gap-1 px-3 py-2 bg-darkBg border border-cardBorder hover:border-brandAccent text-lightText transition-colors disabled:opacity-30 disabled:pointer-events-none rounded-md cursor-pointer"
                  >
                    <span>Next</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
            </div>
          </ErrorBoundary>
        )}

        {/* ================= PROJECTS MANAGEMENT TAB ================= */}
        {activeTab === 'projects' && (
          <ErrorBoundary>
            <div className="bg-cardBg border border-cardBorder rounded-md p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-brandAccent" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-cardBorder">
              <div>
                <h3 className="font-display text-2xl uppercase tracking-wide text-lightText">
                  Projects Management
                </h3>
                <p className="text-mutedText text-xs font-mono uppercase tracking-wider mt-1">
                  Manage portfolio projects, live demos, and Cloudinary cover images
                </p>
              </div>
              <button
                onClick={handleOpenCreateProject}
                className="inline-flex items-center gap-2 px-5 py-3 bg-brandAccent hover:bg-brandAccent/85 text-lightText text-xs font-mono uppercase tracking-wider rounded-md transition-colors shadow-md cursor-pointer"
              >
                <Plus size={16} />
                <span>Add New Project</span>
              </button>
            </div>

            {projectsError && (
              <div role="alert" className="p-4 bg-brandAccent/10 border border-brandAccent/40 flex items-center gap-3 text-lightText text-sm rounded-md">
                <AlertCircle size={18} className="text-brandAccent shrink-0" />
                <span>{projectsError}</span>
              </div>
            )}

            {projectsLoading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3 text-mutedText">
                <Loader2 size={28} className="animate-spin text-brandAccent" />
                <span className="text-xs font-mono uppercase tracking-widest">Loading projects...</span>
              </div>
            ) : (!Array.isArray(adminProjects) || adminProjects.length === 0) ? (
              <div className="py-20 text-center space-y-3">
                <div className="w-12 h-12 mx-auto flex items-center justify-center bg-darkBg border border-cardBorder text-mutedText rounded-md">
                  <FolderGit2 size={24} />
                </div>
                <h3 className="font-display text-xl uppercase tracking-wide text-lightText">No Projects Found</h3>
                <p className="text-mutedText text-xs font-mono uppercase tracking-wider">
                  Get started by adding your first project above.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-cardBorder text-[10px] font-mono text-mutedText uppercase tracking-wider">
                      <th className="py-3 px-4">Order</th>
                      <th className="py-3 px-4">Project</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Featured</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cardBorder font-body text-sm">
                    {adminProjects.map((proj) => (
                      <tr key={proj._id} className="hover:bg-darkBg/60 transition-colors">
                        <td className="py-4 px-4 font-mono text-xs text-mutedText">
                          #{proj.displayOrder}
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-medium text-lightText flex items-center gap-3">
                            {proj.coverImage ? (
                              <img src={proj.coverImage} alt="" className="w-10 h-10 rounded object-cover border border-cardBorder shrink-0" />
                            ) : (
                              <div className="w-10 h-10 rounded bg-darkBg border border-cardBorder flex items-center justify-center text-mutedText shrink-0">
                                <ImageIcon size={16} />
                              </div>
                            )}
                            <span className="truncate max-w-xs">{proj.title}</span>
                          </div>
                          <div className="text-xs text-mutedText truncate max-w-xs">{proj.summary}</div>
                        </td>
                        <td className="py-4 px-4 text-xs font-mono text-brandAccent uppercase">
                          {proj.category}
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <button
                            onClick={() => handleToggleProjectProperty(proj._id, 'published', proj.published)}
                            disabled={actionLoading}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-mono uppercase border rounded-md cursor-pointer transition-colors ${
                              proj.published ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20' : 'bg-brandAccent/10 border-brandAccent/30 text-brandAccent hover:bg-brandAccent/20'
                            }`}
                          >
                            {proj.published ? <Globe size={12} /> : <EyeOff size={12} />}
                            <span>{proj.published ? 'Published' : 'Draft'}</span>
                          </button>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <button
                            onClick={() => handleToggleProjectProperty(proj._id, 'featured', proj.featured)}
                            disabled={actionLoading}
                            className={`p-2 border rounded-md transition-colors cursor-pointer ${
                              proj.featured ? 'bg-brandAccent/10 border-brandAccent text-brandAccent' : 'bg-darkBg border-cardBorder text-mutedText hover:text-lightText'
                            }`}
                            title="Toggle featured status"
                          >
                            <Star size={14} className={proj.featured ? 'fill-brandAccent' : ''} />
                          </button>
                        </td>
                        <td className="py-4 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEditProject(proj)}
                              className="p-2 bg-darkBg border border-cardBorder hover:border-brandAccent text-lightText hover:text-brandAccent rounded-md transition-colors cursor-pointer"
                              title="Edit project"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteProject(proj._id)}
                              disabled={actionLoading}
                              className="p-2 bg-darkBg border border-cardBorder hover:border-brandAccent text-lightText hover:text-brandAccent rounded-md transition-colors cursor-pointer"
                              title="Delete project"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            </div>
          </ErrorBoundary>
        )}
      </main>

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-cardBg border border-cardBorder rounded-md max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-brandAccent" />

            <div className="flex items-center justify-between p-6 border-b border-cardBorder">
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-mono uppercase border rounded-md ${getStatusBadgeClass(selectedMessage.status)}`}>
                  {selectedMessage.status}
                </span>
                <span className="text-xs font-mono text-mutedText">
                  {selectedMessage.createdAt ? new Date(selectedMessage.createdAt).toLocaleString() : ''}
                </span>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="w-8 h-8 flex items-center justify-center bg-darkBg border border-cardBorder hover:border-brandAccent text-mutedText hover:text-lightText rounded-md transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 sm:p-8 space-y-6 overflow-y-auto">
              <div>
                <span className="text-xs font-mono text-mutedText uppercase tracking-wider block mb-1">Sender</span>
                <div className="text-lightText font-body font-medium text-lg">{selectedMessage.name}</div>
                <a
                  href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject || '')}`}
                  className="text-brandAccent hover:underline text-sm font-body inline-flex items-center gap-1.5 mt-1"
                >
                  <Mail size={14} />
                  <span>{selectedMessage.email}</span>
                </a>
              </div>

              <div>
                <span className="text-xs font-mono text-mutedText uppercase tracking-wider block mb-1">Subject</span>
                <div className="text-lightText font-body font-medium text-base">{selectedMessage.subject}</div>
              </div>

              <div>
                <span className="text-xs font-mono text-mutedText uppercase tracking-wider block mb-2">Message</span>
                <div className="bg-darkBg border border-cardBorder rounded-md p-6 text-lightText font-body text-sm leading-relaxed whitespace-pre-wrap">
                  {selectedMessage.message}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-cardBorder bg-darkBg/50 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                {selectedMessage.status !== 'replied' && (
                  <button
                    onClick={(e) => handleUpdateStatus(selectedMessage._id, 'replied', e)}
                    disabled={actionLoading}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-400 text-xs font-mono uppercase rounded-md transition-colors cursor-pointer"
                  >
                    <Check size={14} />
                    <span>Mark Replied</span>
                  </button>
                )}
                {selectedMessage.status === 'unread' && (
                  <button
                    onClick={(e) => handleUpdateStatus(selectedMessage._id, 'read', e)}
                    disabled={actionLoading}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-500/10 border border-sky-500/30 hover:bg-sky-500/20 text-sky-400 text-xs font-mono uppercase rounded-md transition-colors cursor-pointer"
                  >
                    <Eye size={14} />
                    <span>Mark Read</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject || '')}`}
                  onClick={() => handleUpdateStatus(selectedMessage._id, 'replied')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-brandAccent hover:bg-brandAccent/85 text-xs font-mono text-lightText transition-colors rounded-md shadow-md cursor-pointer"
                >
                  <Send size={14} />
                  <span>Reply via Email</span>
                </a>
                <button
                  onClick={(e) => {
                    handleDeleteMessage(selectedMessage._id, e)
                  }}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-darkBg border border-cardBorder hover:border-brandAccent text-brandAccent text-xs font-mono uppercase rounded-md transition-colors cursor-pointer"
                >
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Project Create / Edit Modal */}
      {projectModalMode && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-cardBg border border-cardBorder rounded-md max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-brandAccent" />

            <div className="flex items-center justify-between p-6 border-b border-cardBorder">
              <h3 className="font-display text-2xl uppercase tracking-wide text-lightText">
                {projectModalMode === 'create' ? 'Add New Project' : 'Edit Project'}
              </h3>
              <button
                onClick={() => setProjectModalMode(null)}
                className="w-8 h-8 flex items-center justify-center bg-darkBg border border-cardBorder hover:border-brandAccent text-mutedText hover:text-lightText rounded-md transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleProjectSubmit} className="p-6 sm:p-8 space-y-6 overflow-y-auto font-body text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-mutedText mb-2">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={projectForm.title}
                    onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                    placeholder="RescueGrid-AI"
                    className="w-full px-4 py-3 bg-darkBg border border-cardBorder text-lightText placeholder:text-mutedText/50 focus:outline-none focus:border-brandAccent rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-mutedText mb-2">
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    value={projectForm.category}
                    onChange={(e) => setProjectForm({ ...projectForm, category: e.target.value })}
                    placeholder="AI / Web Application"
                    className="w-full px-4 py-3 bg-darkBg border border-cardBorder text-lightText placeholder:text-mutedText/50 focus:outline-none focus:border-brandAccent rounded-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-mutedText mb-2">
                    Year
                  </label>
                  <input
                    type="text"
                    value={projectForm.year}
                    onChange={(e) => setProjectForm({ ...projectForm, year: e.target.value })}
                    placeholder="2026"
                    className="w-full px-4 py-3 bg-darkBg border border-cardBorder text-lightText placeholder:text-mutedText/50 focus:outline-none focus:border-brandAccent rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-mutedText mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={projectForm.displayOrder}
                    onChange={(e) => setProjectForm({ ...projectForm, displayOrder: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-4 py-3 bg-darkBg border border-cardBorder text-lightText placeholder:text-mutedText/50 focus:outline-none focus:border-brandAccent rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-mutedText mb-2">
                  Summary (Short Tagline) *
                </label>
                <input
                  type="text"
                  required
                  value={projectForm.summary}
                  onChange={(e) => setProjectForm({ ...projectForm, summary: e.target.value })}
                  placeholder="Real-time emergency management platform powered by AI services."
                  className="w-full px-4 py-3 bg-darkBg border border-cardBorder text-lightText placeholder:text-mutedText/50 focus:outline-none focus:border-brandAccent rounded-md"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-mutedText mb-2">
                  Full Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  placeholder="Detailed architecture and overview..."
                  className="w-full px-4 py-3 bg-darkBg border border-cardBorder text-lightText placeholder:text-mutedText/50 focus:outline-none focus:border-brandAccent rounded-md resize-y"
                />
              </div>

              {/* Cover Image Upload via Cloudinary */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-mutedText mb-2">
                  Cover Image (Cloudinary Upload)
                </label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-darkBg border border-cardBorder rounded-md">
                  {projectForm.coverImage ? (
                    <img src={projectForm.coverImage} alt="Cover Preview" className="w-24 h-16 object-cover rounded border border-cardBorder shrink-0" />
                  ) : (
                    <div className="w-24 h-16 rounded bg-cardBg border border-cardBorder flex items-center justify-center text-mutedText shrink-0">
                      <ImageIcon size={20} />
                    </div>
                  )}

                  <div className="flex-1 w-full space-y-2">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageFileChange}
                      disabled={uploadingImage}
                      className="block w-full text-xs text-mutedText file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-mono file:bg-[#3d4150] file:text-lightText hover:file:bg-[#4e5263] file:cursor-pointer cursor-pointer"
                    />
                    <div className="text-[10px] font-mono text-mutedText">
                      Supported: JPEG, PNG, WebP (Max 5MB). Uploads securely to Cloudinary.
                    </div>
                    {uploadingImage && (
                      <div className="flex items-center gap-2 text-xs font-mono text-brandAccent">
                        <Loader2 size={14} className="animate-spin" />
                        <span>Uploading to Cloudinary...</span>
                      </div>
                    )}
                    {uploadError && (
                      <div className="text-xs font-mono text-brandAccent">{uploadError}</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-mutedText mb-2">
                    Tools / Technologies (comma separated)
                  </label>
                  <input
                    type="text"
                    value={projectForm.tools}
                    onChange={(e) => setProjectForm({ ...projectForm, tools: e.target.value })}
                    placeholder="React, Node.js, MongoDB, TypeScript"
                    className="w-full px-4 py-3 bg-darkBg border border-cardBorder text-lightText placeholder:text-mutedText/50 focus:outline-none focus:border-brandAccent rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-mutedText mb-2">
                    Backend Architecture Note (Optional)
                  </label>
                  <input
                    type="text"
                    value={projectForm.backendArchitecture}
                    onChange={(e) => setProjectForm({ ...projectForm, backendArchitecture: e.target.value })}
                    placeholder="Node.js & Express REST API with Mongoose ODM"
                    className="w-full px-4 py-3 bg-darkBg border border-cardBorder text-lightText placeholder:text-mutedText/50 focus:outline-none focus:border-brandAccent rounded-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-mutedText mb-2">
                    Live Demo URL
                  </label>
                  <input
                    type="url"
                    value={projectForm.liveUrl}
                    onChange={(e) => setProjectForm({ ...projectForm, liveUrl: e.target.value })}
                    placeholder="https://example.com"
                    className="w-full px-4 py-3 bg-darkBg border border-cardBorder text-lightText placeholder:text-mutedText/50 focus:outline-none focus:border-brandAccent rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-mutedText mb-2">
                    Source Code URL (GitHub)
                  </label>
                  <input
                    type="url"
                    value={projectForm.sourceUrl}
                    onChange={(e) => setProjectForm({ ...projectForm, sourceUrl: e.target.value })}
                    placeholder="https://github.com/username/repo"
                    className="w-full px-4 py-3 bg-darkBg border border-cardBorder text-lightText placeholder:text-mutedText/50 focus:outline-none focus:border-brandAccent rounded-md"
                  />
                </div>
              </div>

              <div className="flex items-center gap-8 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={projectForm.published}
                    onChange={(e) => setProjectForm({ ...projectForm, published: e.target.checked })}
                    className="w-4 h-4 accent-brandAccent rounded"
                  />
                  <span className="text-xs font-mono uppercase tracking-wider text-lightText">Published (Visible Publicly)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={projectForm.featured}
                    onChange={(e) => setProjectForm({ ...projectForm, featured: e.target.checked })}
                    className="w-4 h-4 accent-brandAccent rounded"
                  />
                  <span className="text-xs font-mono uppercase tracking-wider text-lightText">Featured Project</span>
                </label>
              </div>

              <div className="pt-6 border-t border-cardBorder flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setProjectModalMode(null)}
                  className="px-6 py-3 bg-darkBg border border-cardBorder hover:border-brandAccent text-mutedText hover:text-lightText text-xs font-mono uppercase rounded-md transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || uploadingImage}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-brandAccent hover:bg-brandAccent/85 text-lightText text-xs font-mono uppercase rounded-md transition-colors shadow-md cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  <span>{projectModalMode === 'create' ? 'Create Project' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
