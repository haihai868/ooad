import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import { badgeService } from '../../services/badgeService'
import { learningService } from '../../services/learningService'
import { Badge, UserBadge, StudyProgress } from '../../types'
import { Trophy, Lock, Unlock, CheckCircle } from 'lucide-react'
import { calculateBadgeProgress } from '../../utils/badgeChecker'

export default function BadgesPage() {
  const [badges, setBadges] = useState<Badge[]>([])
  const [userBadges, setUserBadges] = useState<UserBadge[]>([])
  const [progress, setProgress] = useState<StudyProgress | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [badgesData, userBadgesData, progressData] = await Promise.all([
        badgeService.getAllBadges(),
        badgeService.getMyBadges(),
        learningService.getProgress(),
      ])
      setBadges(badgesData)
      setUserBadges(userBadgesData)
      setProgress(progressData)

      // Check and unlock badges
      if (progressData) {
        await badgeService.checkAndUnlockBadges(progressData.user_stats, badgesData)
        // Reload user badges after checking
        const updated = await badgeService.getMyBadges()
        setUserBadges(updated)
      }
    } catch (error) {
      console.error('Failed to load badges:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClaim = async (badgeId: number) => {
    try {
      await badgeService.claimBadge(badgeId)
      await loadData()
    } catch (error) {
      console.error('Failed to claim badge:', error)
    }
  }

  const getBadgeStatus = (badgeId: number): UserBadge | undefined => {
    return userBadges.find((ub) => ub.badge_id === badgeId)
  }

  const getBadgeProgress = (badge: Badge): number => {
    const userBadge = getBadgeStatus(badge.id)
    if (userBadge) {
      return userBadge.progress
    }
    if (badge.criteria_json && progress) {
      return calculateBadgeProgress(progress.user_stats, badge.criteria_json)
    }
    return 0
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
        <h1 className="text-4xl font-black">BADGES</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {badges.map((badge) => {
            const userBadge = getBadgeStatus(badge.id)
            const progressValue = getBadgeProgress(badge)
            const isUnlocked = userBadge?.status === 'UNLOCKED' || userBadge?.status === 'CLAIMED'
            const isClaimed = userBadge?.status === 'CLAIMED'

            return (
              <div
                key={badge.id}
                className={`card-brutal ${
                  isUnlocked ? 'bg-accent' : 'bg-gray-200'
                }`}
              >
                <div className="flex items-center gap-4 mb-4">
                  {isClaimed ? (
                    <CheckCircle className="w-12 h-12 text-green-600" />
                  ) : isUnlocked ? (
                    <Unlock className="w-12 h-12" />
                  ) : (
                    <Lock className="w-12 h-12 text-gray-500" />
                  )}
                  <div className="flex-1">
                    <h3 className="text-xl font-black">{badge.name}</h3>
                    <p className="text-sm font-bold">{badge.reward_xp} XP</p>
                  </div>
                </div>

                {badge.description && (
                  <p className="text-sm font-bold mb-4">{badge.description}</p>
                )}

                {badge.criteria_json && (
                  <div className="mb-4">
                    <p className="text-xs font-bold mb-2">CRITERIA:</p>
                    <p className="text-xs">
                      {badge.criteria_json.type}: {badge.criteria_json.value}
                    </p>
                  </div>
                )}

                <div className="mb-4">
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>Progress</span>
                    <span>{progressValue}%</span>
                  </div>
                  <div className="h-4 border-2 border-dark bg-white">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${progressValue}%` }}
                    />
                  </div>
                </div>

                {isUnlocked && !isClaimed && (
                  <button
                    onClick={() => handleClaim(badge.id)}
                    className="btn-primary w-full"
                  >
                    CLAIM BADGE
                  </button>
                )}

                {isClaimed && (
                  <div className="text-center font-bold text-green-600">
                    CLAIMED
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </Layout>
  )
}

