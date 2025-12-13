import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { BookOpen } from 'lucide-react'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(username, password)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-light p-4">
      <div className="card-brutal w-full max-w-md">
        <div className="text-center mb-8">
          <BookOpen className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-4xl font-black mb-2">FLASHCARD LEARN</h1>
          <p className="text-lg font-bold">Login to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500 text-white px-4 py-3 font-bold border-4 border-dark">
              {error}
            </div>
          )}

          <div>
            <label className="block font-bold mb-2 text-lg">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="input-brutal w-full"
              placeholder="Enter username"
            />
          </div>

          <div>
            <label className="block font-bold mb-2 text-lg">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input-brutal w-full"
              placeholder="Enter password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full text-xl py-4"
          >
            {loading ? 'LOGGING IN...' : 'LOGIN'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="font-bold">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary underline">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

