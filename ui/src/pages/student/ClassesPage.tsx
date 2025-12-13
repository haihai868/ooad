import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import { classService } from '../../services/classService'
import { Deck } from '../../types'
import { Users, BookOpen, Plus, LogIn } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function ClassesPage() {
  const [classes, setClasses] = useState<any[]>([])
  const [inviteCode, setInviteCode] = useState('')
  const [loading, setLoading] = useState(true)

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

  const handleJoinClass = async () => {
    if (!inviteCode.trim()) return
    try {
      await classService.joinClass(inviteCode)
      setInviteCode('')
      await loadClasses()
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to join class')
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
        <h1 className="text-4xl font-black">MY CLASSES</h1>

        <div className="card-brutal">
          <h2 className="text-2xl font-black mb-4">JOIN CLASS</h2>
          <div className="flex gap-3">
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="Enter invite code"
              className="input-brutal flex-1"
              maxLength={10}
            />
            <button onClick={handleJoinClass} className="btn-primary">
              <LogIn className="w-5 h-5" />
              Join
            </button>
          </div>
        </div>

        {classes.length === 0 ? (
          <div className="card-brutal text-center py-12">
            <Users className="w-16 h-16 mx-auto mb-4" />
            <p className="text-xl font-bold">You haven't joined any classes yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {classes.map((classItem) => (
              <Link
                key={classItem.id}
                to={`/dashboard/classes/${classItem.id}`}
                className="card-brutal hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-4 mb-4">
                  <Users className="w-12 h-12" />
                  <div className="flex-1">
                    <h3 className="text-2xl font-black">{classItem.name}</h3>
                    {classItem.description && (
                      <p className="text-sm font-bold mt-1">{classItem.description}</p>
                    )}
                  </div>
                </div>
                <div className="badge-brutal bg-secondary text-white">
                  Code: {classItem.invite_code}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

