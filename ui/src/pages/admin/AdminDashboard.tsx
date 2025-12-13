import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import api from '../../services/api'
import { User, Badge } from '../../types'
import { Users, Trophy, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([])
  const [badges, setBadges] = useState<Badge[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [usersRes, badgesRes] = await Promise.all([
        api.get<User[]>('/users'),
        api.get<Badge[]>('/gamification/badges'),
      ])
      setUsers(usersRes.data)
      setBadges(badgesRes.data)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="card-brutal">
          <h1 className="text-2xl font-bold">Loading...</h1>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-4xl font-black">ADMIN DASHBOARD</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card-brutal bg-primary text-white">
            <div className="flex items-center gap-4">
              <Users className="w-12 h-12" />
              <div>
                <p className="text-sm font-bold opacity-90">TOTAL USERS</p>
                <p className="text-3xl font-black">{users.length}</p>
              </div>
            </div>
          </div>

          <div className="card-brutal bg-secondary text-white">
            <div className="flex items-center gap-4">
              <Trophy className="w-12 h-12" />
              <div>
                <p className="text-sm font-bold opacity-90">TOTAL BADGES</p>
                <p className="text-3xl font-black">{badges.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card-brutal">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-black">USERS</h2>
              <Link to="/dashboard/users" className="btn-brutal bg-accent">
                VIEW ALL
              </Link>
            </div>
            <div className="space-y-2">
              {users.slice(0, 5).map((user) => (
                <div
                  key={user.id}
                  className="p-3 border-4 border-dark bg-white"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-black">{user.username}</span>
                    <span className="badge-brutal bg-secondary text-white text-xs">
                      {user.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card-brutal">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-black">BADGES</h2>
              <Link to="/dashboard/badges/manage" className="btn-brutal bg-accent">
                <Plus className="w-5 h-5" />
              </Link>
            </div>
            <div className="space-y-2">
              {badges.slice(0, 5).map((badge) => (
                <div
                  key={badge.id}
                  className="p-3 border-4 border-dark bg-white"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-black">{badge.name}</span>
                    <span className="badge-brutal bg-accent text-xs">
                      {badge.reward_xp} XP
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

