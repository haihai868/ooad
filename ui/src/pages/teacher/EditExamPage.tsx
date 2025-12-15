import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Layout from '../../components/Layout'
import { examService } from '../../services/examService'
import { Exam } from '../../types'
import { ArrowLeft } from 'lucide-react'

export default function EditExamPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [exam, setExam] = useState<Exam | null>(null)
  const [title, setTitle] = useState('')
  const [durationMinutes, setDurationMinutes] = useState(60)
  const [loading, setLoading] = useState(false)
  const [loadingExam, setLoadingExam] = useState(true)

  useEffect(() => {
    if (id) {
      loadExam()
    }
  }, [id])

  const loadExam = async () => {
    try {
      const examData = await examService.getExam(Number(id))
      setExam(examData)
      setTitle(examData.title)
      setDurationMinutes(examData.duration_minutes)
    } catch (error) {
      console.error('Failed to load exam:', error)
      alert('Failed to load exam')
    } finally {
      setLoadingExam(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return
    setLoading(true)
    try {
      await examService.updateExam(Number(id), {
        title,
        duration_minutes: durationMinutes,
      })
      navigate(`/dashboard/exams/${id}`)
    } catch (error) {
      console.error('Failed to update exam:', error)
      alert('Failed to update exam')
    } finally {
      setLoading(false)
    }
  }

  if (loadingExam) {
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
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link to={`/dashboard/exams/${id}`} className="btn-brutal">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-4xl font-black">EDIT EXAM</h1>
        </div>

        <form onSubmit={handleSubmit} className="card-brutal space-y-6">
          <div>
            <label className="block font-bold mb-2 text-lg">Exam Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="input-brutal w-full"
              placeholder="Enter exam title"
            />
          </div>

          <div>
            <label className="block font-bold mb-2 text-lg">Duration (minutes) *</label>
            <input
              type="number"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              required
              min="1"
              className="input-brutal w-full"
            />
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'UPDATING...' : 'UPDATE EXAM'}
            </button>
            <Link to={`/dashboard/exams/${id}`} className="btn-brutal">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </Layout>
  )
}


