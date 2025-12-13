import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import { classService } from '../../services/classService'
import { Class } from '../../types'
import { Users, Plus, Copy } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function TeacherClassesPage() {
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newClass, setNewClass] = useState({ name: '', description: '' })

  useEffect(() => {
    loadClasses()
  }, [])

  const loadClasses = async () => {
    try {
      const classesData = await classService.getMyClasses()
      setClasses(classesData)
    } catch (error) {
      console.error('Failed to load classes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await classService.createClass(newClass)
      setNewClass({ name: '', description: '' })
      setShowCreateForm(false)
      await loadClasses()
    } catch (error) {
      console.error('Failed to create class:', error)
    }
  }

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code)
    alert('Invite code copied!')
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
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-black">MY CLASSES</h1>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="btn-primary"
          >
            <Plus className="w-5 h-5" />
            New Class
          </button>
        </div>

        {showCreateForm && (
          <div className="card-brutal">
            <h2 className="text-2xl font-black mb-4">CREATE NEW CLASS</h2>
            <form onSubmit={handleCreateClass} className="space-y-4">
              <div>
                <label className="block font-bold mb-2">Class Name</label>
                <input
                  type="text"
                  value={newClass.name}
                  onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                  required
                  className="input-brutal w-full"
                  placeholder="Enter class name"
                />
              </div>
              <div>
                <label className="block font-bold mb-2">Description</label>
                <textarea
                  value={newClass.description}
                  onChange={(e) => setNewClass({ ...newClass, description: e.target.value })}
                  className="input-brutal w-full"
                  rows={3}
                  placeholder="Enter description (optional)"
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn-primary">
                  Create Class
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="btn-brutal"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {classes.length === 0 ? (
          <div className="card-brutal text-center py-12">
            <Users className="w-16 h-16 mx-auto mb-4" />
            <p className="text-xl font-bold">No classes yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {classes.map((classItem) => (
              <div key={classItem.id} className="card-brutal">
                <div className="flex items-center gap-4 mb-4">
                  <Users className="w-12 h-12" />
                  <div className="flex-1">
                    <h3 className="text-2xl font-black">{classItem.name}</h3>
                    {classItem.description && (
                      <p className="text-sm font-bold mt-1">{classItem.description}</p>
                    )}
                  </div>
                </div>
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold">Invite Code:</span>
                    <span className="badge-brutal bg-accent font-mono">
                      {classItem.invite_code}
                    </span>
                    <button
                      onClick={() => copyInviteCode(classItem.invite_code)}
                      className="btn-brutal bg-secondary text-white"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <Link
                  to={`/dashboard/classes/${classItem.id}`}
                  className="btn-primary w-full text-center"
                >
                  Manage Class
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

