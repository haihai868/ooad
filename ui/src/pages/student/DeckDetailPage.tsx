import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import { deckService } from '../../services/deckService'
import { Deck, Flashcard } from '../../types'
import { ArrowLeft, Plus, Edit, Trash2, BookOpen } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export default function DeckDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [deck, setDeck] = useState<Deck & { flashcards: Flashcard[] } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      loadDeck()
    }
  }, [id])

  const loadDeck = async () => {
    try {
      const deckData = await deckService.getDeck(Number(id))
      setDeck(deckData)
    } catch (error) {
      console.error('Failed to load deck:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteFlashcard = async (flashcardId: number) => {
    if (!confirm('Delete this flashcard?')) return
    try {
      await deckService.deleteFlashcard(flashcardId)
      await loadDeck()
    } catch (error) {
      console.error('Failed to delete flashcard:', error)
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

  if (!deck) {
    return (
      <Layout>
        <div className="card-brutal text-center">
          <h1 className="text-2xl font-bold">Deck not found</h1>
          <Link to="/dashboard/decks" className="btn-primary mt-4 inline-block">
            Back to Decks
          </Link>
        </div>
      </Layout>
    )
  }

  const isOwner = deck.owner_id === user?.id

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/dashboard/decks" className="btn-brutal">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-4xl font-black">{deck.title}</h1>
        </div>

        {deck.description && (
          <div className="card-brutal">
            <p className="font-bold text-lg">{deck.description}</p>
          </div>
        )}

        <div className="flex gap-3">
          <Link
            to={`/dashboard/decks/${deck.id}/study`}
            className="btn-primary"
          >
            <BookOpen className="w-5 h-5" />
            Study This Deck
          </Link>
          {isOwner && (
            <>
              <Link
                to={`/dashboard/decks/${deck.id}/edit`}
                className="btn-secondary"
              >
                <Edit className="w-5 h-5" />
                Edit Deck
              </Link>
              <Link
                to={`/dashboard/decks/${deck.id}/flashcards/new`}
                className="btn-accent"
              >
                <Plus className="w-5 h-5" />
                Add Flashcard
              </Link>
            </>
          )}
        </div>

        <div className="card-brutal">
          <h2 className="text-2xl font-black mb-4">
            FLASHCARDS ({deck.flashcards.length})
          </h2>
          {deck.flashcards.length === 0 ? (
            <p className="text-center font-bold py-8">No flashcards yet</p>
          ) : (
            <div className="space-y-4">
              {deck.flashcards.map((flashcard) => (
                <div key={flashcard.id} className="border-4 border-dark bg-white p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-bold mb-2">FRONT</p>
                      <p className="font-bold">{flashcard.front_content}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold mb-2">BACK</p>
                      <p className="font-bold">{flashcard.back_content}</p>
                    </div>
                  </div>
                  {isOwner && (
                    <div className="flex gap-2 mt-4">
                      <Link
                        to={`/dashboard/decks/${deck.id}/flashcards/${flashcard.id}/edit`}
                        className="btn-brutal bg-secondary text-white text-sm"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteFlashcard(flashcard.id)}
                        className="btn-brutal bg-red-500 text-white text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

