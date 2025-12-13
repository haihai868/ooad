import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import { examService } from '../../services/examService'
import { Exam } from '../../types'
import { FileText, Plus, Edit, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function TeacherExamsPage() {
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadExams()
  }, [])

  const loadExams = async () => {
    try {
      const examsData = await examService.getMyExams()
      setExams(examsData)
    } catch (error) {
      console.error('Failed to load exams:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (examId: number) => {
    if (!confirm('Delete this exam?')) return
    try {
      await examService.deleteExam(examId)
      await loadExams()
    } catch (error) {
      console.error('Failed to delete exam:', error)
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
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-black">MY EXAMS</h1>
          <Link to="/dashboard/exams/new" className="btn-primary">
            <Plus className="w-5 h-5" />
            New Exam
          </Link>
        </div>

        {exams.length === 0 ? (
          <div className="card-brutal text-center py-12">
            <FileText className="w-16 h-16 mx-auto mb-4" />
            <p className="text-xl font-bold">No exams yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {exams.map((exam) => (
              <div key={exam.id} className="card-brutal">
                <div className="flex items-center gap-4 mb-4">
                  <FileText className="w-12 h-12" />
                  <div className="flex-1">
                    <h3 className="text-2xl font-black">{exam.title}</h3>
                    <p className="text-sm font-bold">
                      Duration: {exam.duration_minutes} minutes
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/dashboard/exams/${exam.id}`}
                    className="btn-secondary flex-1 text-center"
                  >
                    View
                  </Link>
                  <Link
                    to={`/dashboard/exams/${exam.id}/edit`}
                    className="btn-brutal bg-accent flex-1 text-center"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(exam.id)}
                    className="btn-brutal bg-red-500 text-white"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

