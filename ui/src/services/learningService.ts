import api from './api'
import { CardRetentionData, StudyProgress, AlgoConfigs } from '../types'

export const learningService = {
  getProgress: async (): Promise<StudyProgress> => {
    const response = await api.get<StudyProgress>('/learning/progress')
    return response.data
  },

  getDueCards: async (): Promise<CardRetentionData[]> => {
    const response = await api.get<CardRetentionData[]>('/learning/due-cards')
    return response.data
  },

  reviewCard: async (cardId: number, quality: number, studyTimeMs: number): Promise<any> => {
    const response = await api.post('/learning/review', null, {
      params: { card_id: cardId, quality, study_time_ms: studyTimeMs },
    })
    return response.data
  },

  getAlgoConfig: async (): Promise<AlgoConfigs> => {
    const response = await api.get<AlgoConfigs>('/learning/algo-config')
    return response.data
  },

  updateAlgoConfig: async (config: Partial<AlgoConfigs>): Promise<AlgoConfigs> => {
    const response = await api.put<AlgoConfigs>('/learning/algo-config', config)
    return response.data
  },
}

