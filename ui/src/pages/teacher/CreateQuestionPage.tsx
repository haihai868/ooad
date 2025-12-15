import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Layout from '../../components/Layout'
import { examService } from '../../services/examService'
import { Exam } from '../../types'
import { ArrowLeft } from 'lucide-react'

export default function CreateQuestionPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [exam, setExam] = useState<Exam | null>(null)
  const [content, setContent] = useState('')
  const [options, setOptions] = useState({ A: '', B: '', C: '', D: '' })
  const [correctOption, setCorrectOption] = useState('A')
  const [scoreValue, setScoreValue] = useState(1.0)
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
      await examService.addQuestion(Number(id), {
        content,
        options_json: options,
        correct_option: correctOption,
        score_value: scoreValue,
      })
      navigate(`/dashboard/exams/${id}`)
    } catch (error) {
      console.error('Failed to create question:', error)
      alert('Failed to create question')
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
          <h1 className="text-4xl font-black">
            ADD QUESTION TO {exam.title.toUpperCase()}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="card-brutal space-y-6">
          <div>
            <label className="block font-bold mb-2 text-lg">Question Content *</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              className="input-brutal w-full"
              rows={4}
              placeholder="Enter question"
            />
          </div>

          <div>
            <label className="block font-bold mb-2 text-lg">Options *</label>
            <div className="space-y-3">
              {['A', 'B', 'C', 'D'].map((option) => (
                <div key={option} className="flex items-center gap-3">
                  <span className="font-black w-8">{option}:</span>
                  <input
                    type="text"
                    value={options[option as keyof typeof options]}
                    onChange={(e) =>
                      setOptions({ ...options, [option]: e.target.value })
                    }
                    required
                    className="input-brutal flex-1"
                    placeholder={`Option ${option}`}
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold mb-2 text-lg">Correct Option *</label>
            <select
              value={correctOption}
              onChange={(e) => setCorrectOption(e.target.value)}
              required
              className="input-brutal w-full"
            >
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
            </select>
          </div>

          <div>
            <label className="block font-bold mb-2 text-lg">Score Value *</label>
            <input
              type="number"
              value={scoreValue}
              onChange={(e) => setScoreValue(Number(e.target.value))}
              required
              min="0"
              step="0.1"
              className="input-brutal w-full"
            />
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'CREATING...' : 'CREATE QUESTION'}
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


