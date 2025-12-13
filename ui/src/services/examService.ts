import api from './api'
import { Exam, ExamAssignment, Question, ExamResult } from '../types'

export const examService = {
  getMyExams: async (): Promise<Exam[]> => {
    const response = await api.get<Exam[]>('/exams')
    return response.data
  },

  getExam: async (examId: number): Promise<Exam & { questions: Question[] }> => {
    const response = await api.get<Exam & { questions: Question[] }>(`/exams/${examId}`)
    return response.data
  },

  createExam: async (exam: Omit<Exam, 'id' | 'owner_id' | 'created_at'>): Promise<Exam> => {
    const response = await api.post<Exam>('/exams', exam)
    return response.data
  },

  updateExam: async (examId: number, exam: Partial<Exam>): Promise<Exam> => {
    const response = await api.put<Exam>(`/exams/${examId}`, exam)
    return response.data
  },

  deleteExam: async (examId: number): Promise<void> => {
    await api.delete(`/exams/${examId}`)
  },

  addQuestion: async (examId: number, question: Omit<Question, 'id' | 'exam_id'>): Promise<Question> => {
    const response = await api.post<Question>(`/exams/${examId}/questions`, question)
    return response.data
  },

  updateQuestion: async (questionId: number, question: Partial<Question>): Promise<Question> => {
    const response = await api.put<Question>(`/exams/questions/${questionId}`, question)
    return response.data
  },

  deleteQuestion: async (questionId: number): Promise<void> => {
    await api.delete(`/exams/questions/${questionId}`)
  },

  assignExamToClass: async (examId: number, assignment: Omit<ExamAssignment, 'id' | 'exam_id'>): Promise<ExamAssignment> => {
    const response = await api.post<ExamAssignment>(`/exams/${examId}/assign`, assignment)
    return response.data
  },

  getAssignedExams: async (): Promise<ExamAssignment[]> => {
    const response = await api.get<ExamAssignment[]>('/exams/assigned')
    return response.data
  },

  takeExam: async (examId: number, answers: Record<string, string>): Promise<ExamResult> => {
    const response = await api.post<ExamResult>(`/exams/${examId}/take`, { answers })
    return response.data
  },

  getMyResults: async (): Promise<ExamResult[]> => {
    const response = await api.get<ExamResult[]>('/exams/results/my')
    return response.data
  },
}

