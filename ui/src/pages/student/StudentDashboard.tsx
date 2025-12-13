import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import api from '../../services/api'
import { StudyProgress, UserStats } from '../../types'
import { BookOpen, Trophy, TrendingUp, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function StudentDashboard() {
  const [progress, setProgress] = useState<StudyProgress | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProgress()
  }, [])

  const fetchProgress = async () => {
    try {
      const response = await api.get<StudyProgress>('/learning/progress')
      setProgress(response.data)
    } catch (error) {
      console.error('Failed to fetch progress:', error)
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

  const stats = progress?.user_stats

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-4xl font-black">DASHBOARD</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card-brutal bg-primary text-white">
            <div className="flex items-center gap-4">
              <BookOpen className="w-12 h-12" />
              <div>
                <p className="text-sm font-bold opacity-90">CARDS DUE</p>
                <p className="text-3xl font-black">{progress?.cards_due_today || 0}</p>
              </div>
            </div>
          </div>

          <div className="card-brutal bg-secondary text-white">
            <div className="flex items-center gap-4">
              <TrendingUp className="w-12 h-12" />
              <div>
                <p className="text-sm font-bold opacity-90">TOTAL XP</p>
                <p className="text-3xl font-black">{stats?.total_xp || 0}</p>
              </div>
            </div>
          </div>

          <div className="card-brutal bg-accent">
            <div className="flex items-center gap-4">
              <Clock className="w-12 h-12" />
              <div>
                <p className="text-sm font-bold">CURRENT STREAK</p>
                <p className="text-3xl font-black">{stats?.current_streak || 0} days</p>
              </div>
            </div>
          </div>

          <div className="card-brutal">
            <div className="flex items-center gap-4">
              <Trophy className="w-12 h-12" />
              <div>
                <p className="text-sm font-bold">CARDS LEARNED</p>
                <p className="text-3xl font-black">{stats?.cards_learned || 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card-brutal">
            <h2 className="text-2xl font-black mb-4">QUICK ACTIONS</h2>
            <div className="space-y-3">
              <Link to="/dashboard/study" className="btn-primary w-full block text-center">
                START STUDYING
              </Link>
              <Link to="/dashboard/decks" className="btn-secondary w-full block text-center">
                BROWSE DECKS
              </Link>
              <Link to="/dashboard/badges" className="btn-accent w-full block text-center">
                VIEW BADGES
              </Link>
              <Link to="/dashboard/leaderboard" className="btn-brutal bg-secondary text-white w-full block text-center">
                LEADERBOARD
              </Link>
            </div>
          </div>

          <div className="card-brutal">
            <h2 className="text-2xl font-black mb-4">STUDY STATS</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-bold">Cards in Learning:</span>
                <span className="text-2xl font-black">{progress?.cards_in_learning || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold">Cards Mastered:</span>
                <span className="text-2xl font-black">{progress?.cards_mastered || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold">Longest Streak:</span>
                <span className="text-2xl font-black">{stats?.longest_streak || 0} days</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

