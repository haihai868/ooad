import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import { deckService } from '../../services/deckService'
import { Deck } from '../../types'
import { Plus, Heart, BookOpen } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function DecksPage() {
  const [decks, setDecks] = useState<Deck[]>([])
  const [favorites, setFavorites] = useState<Deck[]>([])
  const [loading, setLoading] = useState(true)
  const [showFavorites, setShowFavorites] = useState(false)

  useEffect(() => {
    loadDecks()
  }, [])

  const loadDecks = async () => {
    try {
      const [allDecks, favDecks] = await Promise.all([
        deckService.getMyDecks(),
        deckService.getFavorites(),
      ])
      setDecks(allDecks)
      setFavorites(favDecks)
    } catch (error) {
      console.error('Failed to load decks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleFavorite = async (deckId: number, isFavorite: boolean) => {
    try {
      if (isFavorite) {
        await deckService.removeFavorite(deckId)
      } else {
        await deckService.addFavorite(deckId)
      }
      await loadDecks()
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
    }
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

  const displayDecks = showFavorites ? favorites : decks

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-black">MY DECKS</h1>
          <div className="flex gap-3">
            <Link to="/dashboard/decks/browse" className="btn-brutal bg-secondary text-white">
              <BookOpen className="w-5 h-5" />
              Browse
            </Link>
            <button
              onClick={() => setShowFavorites(!showFavorites)}
              className={`btn-brutal ${showFavorites ? 'bg-accent' : 'bg-white'}`}
            >
              <Heart className="w-5 h-5" />
              Favorites
            </button>
            <Link to="/dashboard/decks/new" className="btn-primary">
              <Plus className="w-5 h-5" />
              New Deck
            </Link>
          </div>
        </div>

        {displayDecks.length === 0 ? (
          <div className="card-brutal text-center py-12">
            <BookOpen className="w-16 h-16 mx-auto mb-4" />
            <p className="text-xl font-bold">No decks found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayDecks.map((deck) => {
              const isFavorite = favorites.some((f) => f.id === deck.id)
              return (
                <div key={deck.id} className="card-brutal">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-black flex-1">{deck.title}</h3>
                    <button
                      onClick={() => handleToggleFavorite(deck.id, isFavorite)}
                      className={`${isFavorite ? 'text-red-500' : 'text-gray-400'}`}
                    >
                      <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                  {deck.description && (
                    <p className="text-sm font-bold mb-4">{deck.description}</p>
                  )}
                  <div className="flex gap-2">
                    <Link
                      to={`/dashboard/decks/${deck.id}`}
                      className="btn-secondary flex-1 text-center"
                    >
                      View
                    </Link>
                    <Link
                      to={`/dashboard/decks/${deck.id}/study`}
                      className="btn-primary flex-1 text-center"
                    >
                      Study
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Layout>
  )
}

