import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import api from '../../services/api'
import { Class, Exam } from '../../types'
import { Users, BookOpen, Plus, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function TeacherDashboard() {
  const [classes, setClasses] = useState<Class[]>([])
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [classesRes, examsRes] = await Promise.all([
        api.get<Class[]>('/classes'),
        api.get<Exam[]>('/exams'),
      ])
      setClasses(classesRes.data)
      setExams(examsRes.data)
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
        <h1 className="text-4xl font-black">TEACHER DASHBOARD</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-brutal bg-primary text-white">
            <div className="flex items-center gap-4">
              <Users className="w-12 h-12" />
              <div>
                <p className="text-sm font-bold opacity-90">TOTAL CLASSES</p>
                <p className="text-3xl font-black">{classes.length}</p>
              </div>
            </div>
          </div>

          <div className="card-brutal bg-secondary text-white">
            <div className="flex items-center gap-4">
              <BookOpen className="w-12 h-12" />
              <div>
                <p className="text-sm font-bold opacity-90">TOTAL EXAMS</p>
                <p className="text-3xl font-black">{exams.length}</p>
              </div>
            </div>
          </div>

          <Link to="/dashboard/decks/new" className="card-brutal bg-accent text-white hover:opacity-90 transition-opacity">
            <div className="flex items-center gap-4">
              <FileText className="w-12 h-12" />
              <div>
                <p className="text-sm font-bold opacity-90">CREATE DECK</p>
                <p className="text-lg font-black">Click to create</p>
              </div>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card-brutal">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-black">MY CLASSES</h2>
              <Link to="/dashboard/classes/new" className="btn-brutal bg-accent">
                <Plus className="w-5 h-5" />
              </Link>
            </div>
            <div className="space-y-3">
              {classes.length === 0 ? (
                <p className="font-bold text-center py-4">No classes yet</p>
              ) : (
                classes.map((classItem) => (
                  <Link
                    key={classItem.id}
                    to={`/dashboard/classes/${classItem.id}`}
                    className="block p-4 border-4 border-dark bg-white hover:bg-accent transition-colors"
                  >
                    <h3 className="font-black text-lg">{classItem.name}</h3>
                    <p className="text-sm font-bold">Code: {classItem.invite_code}</p>
                  </Link>
                ))
              )}
            </div>
          </div>

          <div className="card-brutal">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-black">MY EXAMS</h2>
              <Link to="/dashboard/exams/new" className="btn-brutal bg-accent">
                <Plus className="w-5 h-5" />
              </Link>
            </div>
            <div className="space-y-3">
              {exams.length === 0 ? (
                <p className="font-bold text-center py-4">No exams yet</p>
              ) : (
                exams.map((exam) => (
                  <Link
                    key={exam.id}
                    to={`/dashboard/exams/${exam.id}`}
                    className="block p-4 border-4 border-dark bg-white hover:bg-accent transition-colors"
                  >
                    <h3 className="font-black text-lg">{exam.title}</h3>
                    <p className="text-sm font-bold">{exam.duration_minutes} minutes</p>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

