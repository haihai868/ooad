import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Layout from '../../components/Layout'
import { examService } from '../../services/examService'
import { Exam, Question } from '../../types'
import { ArrowLeft, Clock } from 'lucide-react'
import { format } from 'date-fns'

export default function TakeExamPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [exam, setExam] = useState<Exam & { questions: Question[] } | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [startTime] = useState(Date.now())
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (id) {
      loadExam()
    }
  }, [id])

  useEffect(() => {
    if (exam && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleSubmit()
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [exam, timeRemaining])

  const loadExam = async () => {
    try {
      const examData = await examService.getExam(Number(id))
      setExam(examData)
      setTimeRemaining(examData.duration_minutes * 60)
    } catch (error) {
      console.error('Failed to load exam:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!id || submitting) return
    setSubmitting(true)
    try {
      const timeTaken = Math.floor((Date.now() - startTime) / 1000)
      const result = await examService.takeExam(Number(id), answers)
      navigate(`/dashboard/exams/${id}/result`, { state: { result, timeTaken } })
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to submit exam')
    } finally {
      setSubmitting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
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

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link to="/dashboard/exams" className="btn-brutal">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="card-brutal bg-red-500 text-white">
            <div className="flex items-center gap-2">
              <Clock className="w-6 h-6" />
              <span className="text-2xl font-black">{formatTime(timeRemaining)}</span>
            </div>
          </div>
        </div>

        <div className="card-brutal">
          <h1 className="text-4xl font-black mb-2">{exam.title}</h1>
          <p className="font-bold">Duration: {exam.duration_minutes} minutes</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
          {exam.questions.map((question, index) => (
            <div key={question.id} className="card-brutal">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl font-black">Q{index + 1}</span>
                <span className="badge-brutal bg-accent">
                  {question.score_value} points
                </span>
              </div>
              <p className="font-bold text-lg mb-4">{question.content}</p>
              <div className="space-y-2">
                {Object.entries(question.options_json).map(([key, value]) => (
                  <label
                    key={key}
                    className={`block p-4 border-4 border-dark cursor-pointer hover:bg-accent ${
                      answers[question.id.toString()] === key ? 'bg-primary text-white' : 'bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={key}
                      checked={answers[question.id.toString()] === key}
                      onChange={(e) =>
                        setAnswers({ ...answers, [question.id.toString()]: e.target.value })
                      }
                      className="mr-3"
                    />
                    <span className="font-bold">{key}: {value as string}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting || Object.keys(answers).length < exam.questions.length}
              className="btn-primary flex-1 text-xl py-4"
            >
              {submitting ? 'SUBMITTING...' : 'SUBMIT EXAM'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}

