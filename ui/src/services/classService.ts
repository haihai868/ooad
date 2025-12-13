import api from './api'
import { Class, ExamAssignment } from '../types'

export const classService = {
  getMyClasses: async (): Promise<Class[]> => {
    const response = await api.get<Class[]>('/classes')
    return response.data
  },

  getClass: async (classId: number): Promise<Class> => {
    const response = await api.get<Class>(`/classes/${classId}`)
    return response.data
  },

  createClass: async (classData: Omit<Class, 'id' | 'teacher_id' | 'invite_code' | 'created_at'>): Promise<Class> => {
    const response = await api.post<Class>('/classes', classData)
    return response.data
  },

  updateClass: async (classId: number, classData: Partial<Class>): Promise<Class> => {
    const response = await api.put<Class>(`/classes/${classId}`, classData)
    return response.data
  },

  deleteClass: async (classId: number): Promise<void> => {
    await api.delete(`/classes/${classId}`)
  },

  joinClass: async (inviteCode: string): Promise<void> => {
    await api.post('/classes/join', null, {
      params: { invite_code: inviteCode },
    })
  },

  getClassExams: async (classId: number): Promise<ExamAssignment[]> => {
    const response = await api.get<ExamAssignment[]>(`/classes/${classId}/exams`)
    return response.data
  },

  assignDeckToClass: async (classId: number, deckId: number): Promise<void> => {
    await api.post(`/classes/${classId}/decks`, null, {
      params: { deck_id: deckId },
    })
  },
}

