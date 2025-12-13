import api from './api'
import { User, UserPreferences } from '../types'

export const userService = {
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/users/me')
    return response.data
  },

  updateCurrentUser: async (user: Partial<User>): Promise<User> => {
    const response = await api.put<User>('/users/me', user)
    return response.data
  },

  getPreferences: async (): Promise<UserPreferences> => {
    const response = await api.get<UserPreferences>('/users/me/preferences')
    return response.data
  },

  updatePreferences: async (preferences: Partial<UserPreferences>): Promise<UserPreferences> => {
    const response = await api.put<UserPreferences>('/users/me/preferences', preferences)
    return response.data
  },

  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/users')
    return response.data
  },

  getUser: async (userId: number): Promise<User> => {
    const response = await api.get<User>(`/users/${userId}`)
    return response.data
  },

  updateUser: async (userId: number, user: Partial<User>): Promise<User> => {
    const response = await api.put<User>(`/users/${userId}`, user)
    return response.data
  },

  deleteUser: async (userId: number): Promise<void> => {
    await api.delete(`/users/${userId}`)
  },
}

