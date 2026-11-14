import { useState } from 'react'
import { Lock, Mail, AlertCircle, Loader2, ArrowLeft } from 'lucide-react'

export default function AdminLogin({ onLoginSuccess }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [status, setStatus] = useState({
    loading: false,
    error: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (status.error) {
      setStatus((prev) => ({ ...prev, error: '' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (status.loading) return

    if (!formData.email.trim() || !formData.password.trim()) {
      setStatus({ loading: false, error: 'Please enter both email and password.' })
      return
    }

    setStatus({ loading: true, error: '' })

    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5001/api')
      const response = await fetch(`${apiBaseUrl}/admin/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Invalid email or password.')
      }

      setStatus({ loading: false, error: '' })
      if (onLoginSuccess) {
        onLoginSuccess(data.data)
      } else {
        window.history.pushState({}, '', '/admin')
        window.dispatchEvent(new PopStateEvent('popstate'))
      }
    } catch (err) {
      setStatus({
        loading: false,
        error: err.message || 'Login failed. Please check your credentials.',
      })
    }
  }

  const handleGoHome = (e) => {
    e.preventDefault()
    window.history.pushState({}, '', '/')
    window.dispatchEvent(new PopStateEvent('popstate'))
  }

  return (
    <div className="min-h-screen bg-darkBg text-lightText flex flex-col items-center justify-center px-6 relative">
      {/* Background glow matching cinematic atmosphere */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brandAccent/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="mb-6">
          <button
            onClick={handleGoHome}
            className="inline-flex items-center gap-2 text-xs font-mono text-mutedText hover:text-brandAccent transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Back to Portfolio</span>
          </button>
        </div>

        <div className="bg-cardBg border border-cardBorder rounded-md p-8 sm:p-10 shadow-2xl relative overflow-hidden group hover:border-brandAccent/60 transition-all duration-300">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-brandAccent" />

          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2 text-xs font-mono text-brandAccent uppercase tracking-widest">
              <Lock size={14} />
              <span>Admin Portal</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl uppercase tracking-wide text-lightText">
              Dashboard Login
            </h1>
            <p className="text-mutedText text-xs font-mono uppercase tracking-wider mt-1">
              Secure authentication via HttpOnly cookies
            </p>
          </div>

          {status.error && (
            <div role="alert" className="mb-6 p-4 bg-brandAccent/10 border border-brandAccent/40 flex items-center gap-3 text-lightText text-sm rounded-md">
              <AlertCircle size={18} className="text-brandAccent shrink-0" />
              <span>{status.error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div>
              <label htmlFor="email" className="block text-xs font-mono uppercase tracking-wider text-mutedText mb-2">
                Admin Email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-mutedText">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="admin@example.com"
                  className="w-full pl-11 pr-4 py-3 bg-darkBg border border-cardBorder text-lightText placeholder:text-mutedText/50 font-body text-sm focus:outline-none focus:border-brandAccent focus:ring-1 focus:ring-brandAccent transition-colors rounded-md"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-mono uppercase tracking-wider text-mutedText mb-2">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-mutedText">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-darkBg border border-cardBorder text-lightText placeholder:text-mutedText/50 font-body text-sm focus:outline-none focus:border-brandAccent focus:ring-1 focus:ring-brandAccent transition-colors rounded-md"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={status.loading}
              className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 bg-brandAccent text-lightText font-body text-sm font-medium tracking-wide hover:bg-brandAccent/85 transition-all duration-200 cursor-pointer shadow-lg shadow-brandAccent/20 disabled:opacity-50 rounded-md"
            >
              {status.loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <Lock size={16} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
