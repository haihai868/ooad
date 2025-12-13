import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Layout from '../../components/Layout'
import { classService } from '../../services/classService'
import { deckService } from '../../services/deckService'
import api from '../../services/api'
import { Deck, ExamAssignment } from '../../types'
import { ArrowLeft, BookOpen, FileText, Plus, Users } from 'lucide-react'

export default function TeacherClassDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [classData, setClassData] = useState<any>(null)
  const [decks, setDecks] = useState<Deck[]>([])
  const [exams, setExams] = useState<ExamAssignment[]>([])
  const [allDecks, setAllDecks] = useState<Deck[]>([])
  const [loading, setLoading] = useState(true)
  const [showAssignDeck, setShowAssignDeck] = useState(false)

  useEffect(() => {
    if (id) {
      loadClassData()
    }
  }, [id])

  const loadClassData = async () => {
    try {
      const [classInfo, classExams, myDecks] = await Promise.all([
        classService.getClass(Number(id)),
        classService.getClassExams(Number(id)),
        deckService.getMyDecks(),
      ])
      setClassData(classInfo)
      setExams(classExams)
      setAllDecks(myDecks)
      
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

  const handleAssignDeck = async (deckId: number) => {
    try {
      await classService.assignDeckToClass(Number(id), deckId)
      await loadClassData()
      setShowAssignDeck(false)
    } catch (error) {
      console.error('Failed to assign deck:', error)
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
            <div className="mt-4">
              <span className="font-bold">Invite Code: </span>
              <span className="badge-brutal bg-accent font-mono">
                {classData.invite_code}
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card-brutal">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-black flex items-center gap-2">
                <BookOpen className="w-6 h-6" />
                ASSIGNED DECKS ({decks.length})
              </h2>
              <button
                onClick={() => setShowAssignDeck(!showAssignDeck)}
                className="btn-brutal bg-accent"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            {showAssignDeck && (
              <div className="mb-4 p-4 border-4 border-dark bg-white">
                <p className="font-bold mb-2">Select deck to assign:</p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {allDecks.map((deck) => (
                    <button
                      key={deck.id}
                      onClick={() => handleAssignDeck(deck.id)}
                      className="w-full text-left p-2 border-2 border-dark hover:bg-accent"
                    >
                      {deck.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {decks.length === 0 ? (
              <p className="font-bold text-center py-4">No decks assigned</p>
            ) : (
              <div className="space-y-3">
                {decks.map((deck) => (
                  <div
                    key={deck.id}
                    className="p-4 border-4 border-dark bg-white"
                  >
                    <h3 className="font-black">{deck.title}</h3>
                    {deck.description && (
                      <p className="text-sm font-bold mt-1">{deck.description}</p>
                    )}
                  </div>
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
                  <div
                    key={exam.id}
                    className="p-4 border-4 border-dark bg-white"
                  >
                    <h3 className="font-black">{exam.exam?.title || 'Exam'}</h3>
                    <p className="text-sm font-bold mt-1">
                      Due: {new Date(exam.due_date).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

