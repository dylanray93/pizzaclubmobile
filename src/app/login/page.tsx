'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function Login() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await signIn('credentials', {
      password,
      redirect: false
    })

    if (result?.error) {
      setError('Invalid password')
      setLoading(false)
    } else {
      router.push('/')
    }
  }

  return (
    <div className="win95-desktop flex items-center justify-center min-h-screen">
      <div className="win95-window win95-startup max-w-md w-full mx-4">
        <div className="win95-window-title flex items-center justify-between">
          <span>🍕 Pizza Club - Login</span>
          <div className="flex space-x-1">
            <div className="w-3 h-3 bg-gray-300 border border-gray-600" style={{background: 'var(--win95-gray)', border: '1px outset var(--win95-gray)'}}></div>
            <div className="w-3 h-3 bg-gray-300 border border-gray-600" style={{background: 'var(--win95-gray)', border: '1px outset var(--win95-gray)'}}></div>
          </div>
        </div>
        <div className="win95-window-content space-y-4">
          <div className="text-center">
            <div className="text-2xl mb-2 win95-bounce">🍕</div>
            <div className="font-bold text-sm mb-1">Pizza Club v1.0</div>
            <div className="text-xs">Unauthorized access is prohibited</div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold mb-1">Password:</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="win95-input w-full"
                placeholder="Enter password..."
              />
            </div>
            
            {error && (
              <div className="win95-panel bg-red-100 text-red-800 text-xs p-2 border border-red-300">
                ⚠️ {error}
              </div>
            )}
            
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                className="win95-button text-xs"
                disabled
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="win95-button text-xs font-bold"
              >
                {loading ? 'Logging in...' : 'OK'}
              </button>
            </div>
          </form>
          
          <div className="win95-statusbar -mx-2 -mb-2 mt-4 text-xs">
            <span className="win95-blink">●</span> Ready
          </div>
        </div>
      </div>
    </div>
  )
}