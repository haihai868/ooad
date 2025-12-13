import api from './api'
import { Deck, Flashcard } from '../types'

export const deckService = {
  getAllDecks: async (skip = 0, limit = 100, isPublic = true): Promise<Deck[]> => {
    const response = await api.get<Deck[]>('/decks', {
      params: { skip, limit, is_public: isPublic },
    })
    return response.data
  },

  getMyDecks: async (): Promise<Deck[]> => {
    const response = await api.get<Deck[]>('/decks/my-decks')
    return response.data
  },

  getDeck: async (deckId: number): Promise<Deck & { flashcards: Flashcard[] }> => {
    const response = await api.get<Deck & { flashcards: Flashcard[] }>(`/decks/${deckId}`)
    return response.data
  },

  createDeck: async (deck: Omit<Deck, 'id' | 'owner_id' | 'created_at' | 'updated_at'>): Promise<Deck> => {
    const response = await api.post<Deck>('/decks', deck)
    return response.data
  },

  updateDeck: async (deckId: number, deck: Partial<Deck>): Promise<Deck> => {
    const response = await api.put<Deck>(`/decks/${deckId}`, deck)
    return response.data
  },

  deleteDeck: async (deckId: number): Promise<void> => {
    await api.delete(`/decks/${deckId}`)
  },

  addFlashcard: async (deckId: number, flashcard: Omit<Flashcard, 'id' | 'deck_id' | 'created_at'>): Promise<Flashcard> => {
    const response = await api.post<Flashcard>(`/decks/${deckId}/flashcards`, flashcard)
    return response.data
  },

  updateFlashcard: async (flashcardId: number, flashcard: Partial<Flashcard>): Promise<Flashcard> => {
    const response = await api.put<Flashcard>(`/decks/flashcards/${flashcardId}`, flashcard)
    return response.data
  },

  deleteFlashcard: async (flashcardId: number): Promise<void> => {
    await api.delete(`/decks/flashcards/${flashcardId}`)
  },

  addFavorite: async (deckId: number): Promise<void> => {
    await api.post(`/decks/${deckId}/favorite`)
  },

  removeFavorite: async (deckId: number): Promise<void> => {
    await api.delete(`/decks/${deckId}/favorite`)
  },

  getFavorites: async (): Promise<Deck[]> => {
    const response = await api.get<Deck[]>('/decks/favorites/list')
    return response.data
  },
}

