import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import { examService } from '../../services/examService'
import { Exam, Question, Class } from '../../types'
import { ArrowLeft, Plus, Edit, Trash2, Users } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { classService } from '../../services/classService'

export default function ExamDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [exam, setExam] = useState<Exam & { questions: Question[] } | null>(null)
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
  const [showAssignForm, setShowAssignForm] = useState(false)
  const [assignment, setAssignment] = useState({
    class_id: 0,
    start_date: '',
    due_date: '',
  })

  useEffect(() => {
    if (id) {
      loadExam()
      loadClasses()
    }
  }, [id])

  const loadExam = async () => {
    try {
      const examData = await examService.getExam(Number(id))
      setExam(examData)
    } catch (error) {
      console.error('Failed to load exam:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadClasses = async () => {
    try {
      const classesData = await classService.getMyClasses()
      setClasses(classesData)
    } catch (error) {
      console.error('Failed to load classes:', error)
    }
  }

  const handleDeleteQuestion = async (questionId: number) => {
    if (!confirm('Delete this question?')) return
    try {
      await examService.deleteQuestion(questionId)
      await loadExam()
    } catch (error) {
      console.error('Failed to delete question:', error)
    }
  }

  const handleAssignExam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return
    try {
      await examService.assignExamToClass(Number(id), {
        class_id: assignment.class_id,
        start_date: new Date(assignment.start_date).toISOString(),
        due_date: new Date(assignment.due_date).toISOString(),
      })
      setShowAssignForm(false)
      setAssignment({ class_id: 0, start_date: '', due_date: '' })
    } catch (error) {
      console.error('Failed to assign exam:', error)
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

  if (!exam) {
    return (
      <Layout>
        <div className="card-brutal text-center">
          <h1 className="text-2xl font-bold">Exam not found</h1>
          <Link to="/dashboard/exams" className="btn-primary mt-4 inline-block">
            Back to Exams
          </Link>
        </div>
      </Layout>
    )
  }

  const isOwner = exam.owner_id === user?.id

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/dashboard/exams" className="btn-brutal">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-4xl font-black">{exam.title}</h1>
        </div>

        <div className="card-brutal">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-bold">Duration: {exam.duration_minutes} minutes</p>
              <p className="font-bold">Questions: {exam.questions.length}</p>
            </div>
            {isOwner && (
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAssignForm(!showAssignForm)}
                  className="btn-secondary"
                >
                  <Users className="w-5 h-5" />
                  Assign to Class
                </button>
                <Link
                  to={`/dashboard/exams/${exam.id}/questions/new`}
                  className="btn-primary"
                >
                  <Plus className="w-5 h-5" />
                  Add Question
                </Link>
              </div>
            )}
          </div>
        </div>

        {showAssignForm && isOwner && (
          <div className="card-brutal">
            <h2 className="text-2xl font-black mb-4">ASSIGN TO CLASS</h2>
            <form onSubmit={handleAssignExam} className="space-y-4">
              <div>
                <label className="block font-bold mb-2">Class</label>
                <select
                  value={assignment.class_id}
                  onChange={(e) => setAssignment({ ...assignment, class_id: Number(e.target.value) })}
                  required
                  className="input-brutal w-full"
                >
                  <option value={0}>Select class</option>
                  {classes.map((classItem) => (
                    <option key={classItem.id} value={classItem.id}>
                      {classItem.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-2">Start Date</label>
                  <input
                    type="datetime-local"
                    value={assignment.start_date}
                    onChange={(e) => setAssignment({ ...assignment, start_date: e.target.value })}
                    required
                    className="input-brutal w-full"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-2">Due Date</label>
                  <input
                    type="datetime-local"
                    value={assignment.due_date}
                    onChange={(e) => setAssignment({ ...assignment, due_date: e.target.value })}
                    required
                    className="input-brutal w-full"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn-primary">
                  Assign
                </button>
                <button
                  type="button"
                  onClick={() => setShowAssignForm(false)}
                  className="btn-brutal"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="card-brutal">
          <h2 className="text-2xl font-black mb-4">
            QUESTIONS ({exam.questions.length})
          </h2>
          {exam.questions.length === 0 ? (
            <p className="text-center font-bold py-8">No questions yet</p>
          ) : (
            <div className="space-y-4">
              {exam.questions.map((question, index) => (
                <div key={question.id} className="border-4 border-dark bg-white p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-black text-lg">Q{index + 1}</span>
                    {isOwner && (
                      <div className="flex gap-2">
                        <Link
                          to={`/dashboard/exams/${exam.id}/questions/${question.id}/edit`}
                          className="btn-brutal bg-accent"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteQuestion(question.id)}
                          className="btn-brutal bg-red-500 text-white"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="font-bold mb-2">{question.content}</p>
                  <div className="mb-2">
                    <p className="text-xs font-bold mb-1">Options:</p>
                    <div className="space-y-1">
                      {Object.entries(question.options_json).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2">
                          <span className="font-mono font-bold">{key}:</span>
                          <span className={question.correct_option === key ? 'font-black text-green-600' : ''}>
                            {value as string}
                            {question.correct_option === key && ' ✓'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs font-bold">Score: {question.score_value} points</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

