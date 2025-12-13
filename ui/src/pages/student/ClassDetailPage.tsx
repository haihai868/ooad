import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Layout from '../../components/Layout'
import { classService } from '../../services/classService'
import api from '../../services/api'
import { Deck, ExamAssignment } from '../../types'
import { ArrowLeft, BookOpen, FileText } from 'lucide-react'

export default function ClassDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [classData, setClassData] = useState<any>(null)
  const [decks, setDecks] = useState<Deck[]>([])
  const [exams, setExams] = useState<ExamAssignment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      loadClassData()
    }
  }, [id])

  const loadClassData = async () => {
    try {
      const [classInfo, classExams] = await Promise.all([
        classService.getClass(Number(id)),
        classService.getClassExams(Number(id)),
      ])
      setClassData(classInfo)
      setExams(classExams)
      
      // Get decks for this class
      try {
        const decksResponse = await api.get(`/classes/${id}/decks`)
        setDecks(decksResponse.data)
      } catch (e) {
        console.error('Failed to load decks:', e)
      }
    } catch (error) {
      console.error('Failed to load class data:', error)
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

  if (!classData) {
    return (
      <Layout>
        <div className="card-brutal text-center">
          <h1 className="text-2xl font-bold">Class not found</h1>
          <Link to="/dashboard/classes" className="btn-primary mt-4 inline-block">
            Back to Classes
          </Link>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/dashboard/classes" className="btn-brutal">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-4xl font-black">{classData.name}</h1>
        </div>

        {classData.description && (
          <div className="card-brutal">
            <p className="font-bold text-lg">{classData.description}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card-brutal">
            <h2 className="text-2xl font-black mb-4 flex items-center gap-2">
              <BookOpen className="w-6 h-6" />
              ASSIGNED DECKS ({decks.length})
            </h2>
            {decks.length === 0 ? (
              <p className="font-bold text-center py-4">No decks assigned</p>
            ) : (
              <div className="space-y-3">
                {decks.map((deck) => (
                  <Link
                    key={deck.id}
                    to={`/dashboard/decks/${deck.id}`}
                    className="block p-4 border-4 border-dark bg-white hover:bg-accent transition-colors"
                  >
                    <h3 className="font-black">{deck.title}</h3>
                    {deck.description && (
                      <p className="text-sm font-bold mt-1">{deck.description}</p>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="card-brutal">
            <h2 className="text-2xl font-black mb-4 flex items-center gap-2">
              <FileText className="w-6 h-6" />
              ASSIGNED EXAMS ({exams.length})
            </h2>
            {exams.length === 0 ? (
              <p className="font-bold text-center py-4">No exams assigned</p>
            ) : (
              <div className="space-y-3">
                {exams.map((exam) => (
                  <Link
                    key={exam.id}
                    to={`/dashboard/exams/${exam.exam_id}`}
                    className="block p-4 border-4 border-dark bg-white hover:bg-accent transition-colors"
                  >
                    <h3 className="font-black">{exam.exam?.title || 'Exam'}</h3>
                    <p className="text-sm font-bold mt-1">
                      Due: {new Date(exam.due_date).toLocaleDateString()}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

