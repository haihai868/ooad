import api from './api'
import { User } from '../types'

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  role?: 'STUDENT' | 'TEACHER' | 'ADMIN'
}

export interface TokenResponse {
  access_token: string
  token_type: string
}

export const authService = {
  login: async (data: LoginRequest): Promise<TokenResponse> => {
    const response = await api.post<TokenResponse>('/auth/login', data)
    return response.data
  },

  register: async (data: RegisterRequest): Promise<User> => {
    const response = await api.post<User>('/auth/register', data)
    return response.data
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/users/me')
    return response.data
  },
}

