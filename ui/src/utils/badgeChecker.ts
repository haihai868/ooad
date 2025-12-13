import { BadgeCriteria, UserStats } from '../types'

export function checkBadgeCriteria(userStats: UserStats, criteria: BadgeCriteria): boolean {
  if (!criteria || !criteria.type || criteria.value === undefined) {
    return false
  }

  const operator = criteria.operator || 'gte'
  let currentValue = 0

  switch (criteria.type) {
    case 'cards_learned':
      currentValue = userStats.cards_learned || 0
      break
    case 'streak':
      currentValue = userStats.current_streak || 0
      break
    case 'total_xp':
      currentValue = userStats.total_xp || 0
      break
    case 'decks_completed':
      // This would need to be calculated from user's deck completion data
      // For now, return false as we don't have this data
      return false
    case 'exams_passed':
      // This would need to be calculated from user's exam results
      // For now, return false as we don't have this data
      return false
    default:
      return false
  }

  switch (operator) {
    case 'gte':
      return currentValue >= criteria.value
    case 'lte':
      return currentValue <= criteria.value
    case 'eq':
      return currentValue === criteria.value
    default:
      return currentValue >= criteria.value
  }
}

export function calculateBadgeProgress(userStats: UserStats, criteria: BadgeCriteria): number {
  if (!criteria || !criteria.type || criteria.value === undefined) {
    return 0
  }

  let currentValue = 0

  switch (criteria.type) {
    case 'cards_learned':
      currentValue = userStats.cards_learned || 0
      break
    case 'streak':
      currentValue = userStats.current_streak || 0
      break
    case 'total_xp':
      currentValue = userStats.total_xp || 0
      break
    default:
      return 0
  }

  const progress = Math.min(100, Math.round((currentValue / criteria.value) * 100))
  return progress
}

