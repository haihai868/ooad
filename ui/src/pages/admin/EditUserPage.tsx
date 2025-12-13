import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Layout from '../../components/Layout'
import { userService } from '../../services/userService'
import { User } from '../../types'
import { ArrowLeft } from 'lucide-react'

export default function EditUserPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'STUDENT' | 'TEACHER' | 'ADMIN' | 'PAID_STUDENT'>('STUDENT')
  const [status, setStatus] = useState<'ACTIVE' | 'LOCKED'>('ACTIVE')
  const [loading, setLoading] = useState(false)
  const [loadingUser, setLoadingUser] = useState(true)

  useEffect(() => {
    if (id) {
      loadUser()
    }
  }, [id])

  const loadUser = async () => {
    try {
      const userData = await userService.getUser(Number(id))
      setUser(userData)
      setUsername(userData.username)
      setEmail(userData.email)
      setRole(userData.role)
      setStatus(userData.status)
    } catch (error) {
      console.error('Failed to load user:', error)
      alert('Failed to load user')
    } finally {
      setLoadingUser(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return
    setLoading(true)
    try {
      await userService.updateUser(Number(id), {
        username,
        email,
        role,
        status,
      })
      navigate('/dashboard/users')
    } catch (error) {
      console.error('Failed to update user:', error)
      alert('Failed to update user')
    } finally {
      setLoading(false)
    }
  }

  if (loadingUser) {
    return (
      <Layout>
        <div className="card-brutal">
          <h1 className="text-2xl font-bold">Loading...</h1>
        </div>
      </Layout>
    )
  }

  if (!user) {
    return (
      <Layout>
        <div className="card-brutal text-center">
          <h1 className="text-2xl font-bold">User not found</h1>
          <Link to="/dashboard/users" className="btn-primary mt-4 inline-block">
            Back to Users
          </Link>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/dashboard/users" className="btn-brutal">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-4xl font-black">EDIT USER</h1>
        </div>

        <form onSubmit={handleSubmit} className="card-brutal space-y-6">
          <div>
            <label className="block font-bold mb-2 text-lg">Username *</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="input-brutal w-full"
            />
          </div>

          <div>
            <label className="block font-bold mb-2 text-lg">Email *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-brutal w-full"
            />
          </div>

          <div>
            <label className="block font-bold mb-2 text-lg">Role *</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              required
              className="input-brutal w-full"
            >
              <option value="STUDENT">STUDENT</option>
              <option value="PAID_STUDENT">PAID_STUDENT</option>
              <option value="TEACHER">TEACHER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>

          <div>
            <label className="block font-bold mb-2 text-lg">Status *</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              required
              className="input-brutal w-full"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="LOCKED">LOCKED</option>
            </select>
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'UPDATING...' : 'UPDATE USER'}
            </button>
            <Link to="/dashboard/users" className="btn-brutal">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </Layout>
  )
}

