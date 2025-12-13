import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import { examService } from '../../services/examService'
import { ExamAssignment } from '../../types'
import { FileText, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'

export default function ExamsPage() {
  const [exams, setExams] = useState<ExamAssignment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadExams()
  }, [])

  const loadExams = async () => {
    try {
      const examsData = await examService.getAssignedExams()
      setExams(examsData)
    } catch (error) {
      console.error('Failed to load exams:', error)
    } finally {
      setLoading(false)
    }
  }

  const isAvailable = (exam: ExamAssignment) => {
    const now = new Date()
    const start = new Date(exam.start_date)
    const due = new Date(exam.due_date)
    return now >= start && now <= due
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
        <h1 className="text-4xl font-black">MY EXAMS</h1>

        {exams.length === 0 ? (
          <div className="card-brutal text-center py-12">
            <FileText className="w-16 h-16 mx-auto mb-4" />
            <p className="text-xl font-bold">No exams assigned</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {exams.map((exam) => {
              const available = isAvailable(exam)
              return (
                <div
                  key={exam.id}
                  className={`card-brutal ${available ? 'bg-accent' : 'bg-gray-200'}`}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <FileText className="w-12 h-12" />
                    <div className="flex-1">
                      <h3 className="text-2xl font-black">{exam.exam?.title || 'Exam'}</h3>
                      {exam.exam && (
                        <p className="text-sm font-bold">
                          Duration: {exam.exam.duration_minutes} minutes
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-bold">
                        Start: {format(new Date(exam.start_date), 'MMM dd, yyyy HH:mm')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-bold">
                        Due: {format(new Date(exam.due_date), 'MMM dd, yyyy HH:mm')}
                      </span>
                    </div>
                  </div>

                  {available ? (
                    <Link
                      to={`/dashboard/exams/${exam.exam_id}/take`}
                      className="btn-primary w-full text-center"
                    >
                      Take Exam
                    </Link>
                  ) : (
                    <div className="text-center font-bold">
                      {new Date() < new Date(exam.start_date) ? 'Not started yet' : 'Expired'}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Layout>
  )
}

