import api from './api'
import { Badge, UserBadge, BadgeCriteria } from '../types'
import { checkBadgeCriteria, calculateBadgeProgress } from '../utils/badgeChecker'

export const badgeService = {
  getAllBadges: async (): Promise<Badge[]> => {
    const response = await api.get<Badge[]>('/gamification/badges')
    return response.data
  },

  getMyBadges: async (): Promise<UserBadge[]> => {
    const response = await api.get<UserBadge[]>('/gamification/badges/get/my')
    return response.data
  },

  unlockBadge: async (badgeId: number, progress: number = 100): Promise<UserBadge> => {
    const response = await api.put<UserBadge>(`/gamification/badges/${badgeId}/unlock`, null, {
      params: { progress },
    })
    return response.data
  },

  claimBadge: async (badgeId: number): Promise<UserBadge> => {
    const response = await api.post<UserBadge>(`/gamification/badges/${badgeId}/claim`)
    return response.data
  },

  createBadge: async (badge: Omit<Badge, 'id'>): Promise<Badge> => {
    const response = await api.post<Badge>('/gamification/badges', badge)
    return response.data
  },

  updateBadge: async (badgeId: number, badge: Partial<Badge>): Promise<Badge> => {
    const response = await api.put<Badge>(`/gamification/badges/${badgeId}`, badge)
    return response.data
  },

  deleteBadge: async (badgeId: number): Promise<void> => {
    await api.delete(`/gamification/badges/${badgeId}`)
  },

  // Check and unlock badges based on user stats
  checkAndUnlockBadges: async (userStats: any, badges: Badge[]): Promise<void> => {
    for (const badge of badges) {
      if (badge.criteria_json) {
        const shouldUnlock = checkBadgeCriteria(userStats, badge.criteria_json)
        if (shouldUnlock) {
          try {
            // Calculate progress based on criteria
            const progress = calculateBadgeProgress(userStats, badge.criteria_json)
            // Only unlock if progress >= 100 (fully achieved)
            if (progress >= 100) {
              await badgeService.unlockBadge(badge.id, 100)
            } else {
              // Update progress but don't unlock yet
              await badgeService.unlockBadge(badge.id, progress)
            }
          } catch (error) {
            console.error(`Failed to unlock badge ${badge.id}:`, error)
          }
        }
      }
    }
  },
}

