import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import { userService } from '../../services/userService'
import { User } from '../../types'
import { Users, Edit, Trash2 } from 'lucide-react'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const usersData = await userService.getAllUsers()
      setUsers(usersData)
    } catch (error) {
      console.error('Failed to load users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (userId: number) => {
    if (!confirm('Delete this user?')) return
    try {
      await userService.deleteUser(userId)
      await loadUsers()
    } catch (error) {
      console.error('Failed to delete user:', error)
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
        <h1 className="text-4xl font-black">USERS MANAGEMENT</h1>

        <div className="card-brutal">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-4 border-dark">
                  <th className="text-left p-4 font-black">ID</th>
                  <th className="text-left p-4 font-black">Username</th>
                  <th className="text-left p-4 font-black">Email</th>
                  <th className="text-left p-4 font-black">Role</th>
                  <th className="text-left p-4 font-black">Status</th>
                  <th className="text-left p-4 font-black">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b-2 border-dark">
                    <td className="p-4 font-bold">{user.id}</td>
                    <td className="p-4 font-bold">{user.username}</td>
                    <td className="p-4 font-bold">{user.email}</td>
                    <td className="p-4">
                      <span className="badge-brutal bg-secondary text-white">
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`badge-brutal ${
                          user.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'
                        } text-white`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button className="btn-brutal bg-accent">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="btn-brutal bg-red-500 text-white"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  )
}

