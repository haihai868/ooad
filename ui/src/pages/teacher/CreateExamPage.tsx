import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Layout from '../../components/Layout'
import { examService } from '../../services/examService'
import { ArrowLeft } from 'lucide-react'

export default function CreateExamPage() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [durationMinutes, setDurationMinutes] = useState(60)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const exam = await examService.createExam({
        title,
        duration_minutes: durationMinutes,
      })
      navigate(`/dashboard/exams/${exam.id}`)
    } catch (error) {
      console.error('Failed to create exam:', error)
      alert('Failed to create exam')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/dashboard/exams" className="btn-brutal">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-4xl font-black">CREATE EXAM</h1>
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
              {loading ? 'CREATING...' : 'CREATE EXAM'}
            </button>
            <Link to="/dashboard/exams" className="btn-brutal">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </Layout>
  )
}

