import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { BookOpen } from 'lucide-react'

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'STUDENT' | 'TEACHER'>('STUDENT')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await register(username, email, password, role)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-light p-4">
      <div className="card-brutal w-full max-w-md">
        <div className="text-center mb-8">
          <BookOpen className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-4xl font-black mb-2">JOIN US</h1>
          <p className="text-lg font-bold">Create your account</p>
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
              placeholder="Choose username"
            />
          </div>

          <div>
            <label className="block font-bold mb-2 text-lg">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-brutal w-full"
              placeholder="Enter email"
            />
          </div>

          <div>
            <label className="block font-bold mb-2 text-lg">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="input-brutal w-full"
              placeholder="Create password"
            />
          </div>

          <div>
            <label className="block font-bold mb-2 text-lg">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'STUDENT' | 'TEACHER')}
              className="input-brutal w-full"
            >
              <option value="STUDENT">Student</option>
              <option value="TEACHER">Teacher</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full text-xl py-4"
          >
            {loading ? 'REGISTERING...' : 'REGISTER'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="font-bold">
            Already have an account?{' '}
            <Link to="/login" className="text-primary underline">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

