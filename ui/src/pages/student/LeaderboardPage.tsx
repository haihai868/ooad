import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import api from '../../services/api'
import { Trophy, Medal, Award } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

interface LeaderboardEntry {
  user_id: number
  username: string
  total_xp: number
  current_streak: number
  rank: number
}

interface LeaderboardResponse {
  entries: LeaderboardEntry[]
  total_users: number
  user_rank?: number
}

export default function LeaderboardPage() {
  const { user } = useAuth()
  const [leaderboard, setLeaderboard] = useState<LeaderboardResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLeaderboard()
  }, [])

  const loadLeaderboard = async () => {
    try {
      const response = await api.get<LeaderboardResponse>('/gamification/leaderboard')
      setLeaderboard(response.data)
    } catch (error) {
      console.error('Failed to load leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-8 h-8 text-yellow-500" />
    if (rank === 2) return <Medal className="w-8 h-8 text-gray-400" />
    if (rank === 3) return <Award className="w-8 h-8 text-orange-600" />
    return <span className="text-2xl font-black">#{rank}</span>
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

  if (!leaderboard) {
    return (
      <Layout>
        <div className="card-brutal text-center">
          <h1 className="text-2xl font-bold">Failed to load leaderboard</h1>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-4xl font-black">LEADERBOARD</h1>

        {leaderboard.user_rank && (
          <div className="card-brutal bg-accent">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold">YOUR RANK</p>
                <p className="text-3xl font-black">#{leaderboard.user_rank}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold">TOTAL USERS</p>
                <p className="text-3xl font-black">{leaderboard.total_users}</p>
              </div>
            </div>
          </div>
        )}

        <div className="card-brutal">
          <div className="space-y-4">
            {leaderboard.entries.map((entry) => {
              const isCurrentUser = entry.user_id === user?.id
              return (
                <div
                  key={entry.user_id}
                  className={`p-4 border-4 border-dark ${
                    isCurrentUser ? 'bg-accent' : 'bg-white'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 flex justify-center">
                      {getRankIcon(entry.rank)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-black">
                          {entry.username}
                          {isCurrentUser && ' (YOU)'}
                        </span>
                      </div>
                      <div className="flex gap-4 mt-2">
                        <span className="text-sm font-bold">
                          XP: {entry.total_xp}
                        </span>
                        <span className="text-sm font-bold">
                          Streak: {entry.current_streak} days
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </Layout>
  )
}

