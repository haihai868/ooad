import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Layout from '../../components/Layout'
import { deckService } from '../../services/deckService'
import { Deck, Flashcard } from '../../types'
import { ArrowLeft } from 'lucide-react'

export default function EditFlashcardPage() {
  const { id, flashcardId } = useParams<{ id: string; flashcardId: string }>()
  const navigate = useNavigate()
  const [deck, setDeck] = useState<Deck & { flashcards: Flashcard[] } | null>(null)
  const [flashcard, setFlashcard] = useState<Flashcard | null>(null)
  const [frontContent, setFrontContent] = useState('')
  const [backContent, setBackContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (id) {
      loadDeck()
    }
  }, [id])

  const loadDeck = async () => {
    try {
      const deckData = await deckService.getDeck(Number(id))
      setDeck(deckData)
      const card = deckData.flashcards.find(f => f.id === Number(flashcardId))
      if (card) {
        setFlashcard(card)
        setFrontContent(card.front_content)
        setBackContent(card.back_content)
        setImageUrl(card.image_url || '')
      }
    } catch (error) {
      console.error('Failed to load deck:', error)
      alert('Failed to load flashcard')
    } finally {
      setLoadingData(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!flashcardId) return
    setLoading(true)
    try {
      await deckService.updateFlashcard(Number(flashcardId), {
        front_content: frontContent,
        back_content: backContent,
        image_url: imageUrl || undefined,
      })
      navigate(`/dashboard/decks/${id}`)
    } catch (error) {
      console.error('Failed to update flashcard:', error)
      alert('Failed to update flashcard')
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <Layout>
        <div className="card-brutal">
          <h1 className="text-2xl font-bold">Loading...</h1>
        </div>
      </Layout>
    )
  }

  if (!flashcard || !deck) {
    return (
      <Layout>
        <div className="card-brutal text-center">
          <h1 className="text-2xl font-bold">Flashcard not found</h1>
          <Link to={`/dashboard/decks/${id}`} className="btn-primary mt-4 inline-block">
            Back to Deck
          </Link>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link to={`/dashboard/decks/${id}`} className="btn-brutal">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-4xl font-black">
            EDIT FLASHCARD {deck && `IN ${deck.title.toUpperCase()}`}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="card-brutal space-y-6">
          <div>
            <label className="block font-bold mb-2 text-lg">Front Content *</label>
            <textarea
              value={frontContent}
              onChange={(e) => setFrontContent(e.target.value)}
              required
              className="input-brutal w-full"
              rows={4}
              placeholder="Enter front content (question)"
            />
          </div>

          <div>
            <label className="block font-bold mb-2 text-lg">Back Content *</label>
            <textarea
              value={backContent}
              onChange={(e) => setBackContent(e.target.value)}
              required
              className="input-brutal w-full"
              rows={4}
              placeholder="Enter back content (answer)"
            />
          </div>

          <div>
            <label className="block font-bold mb-2 text-lg">Image URL (Optional)</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="input-brutal w-full"
              placeholder="Enter image URL"
            />
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'UPDATING...' : 'UPDATE FLASHCARD'}
            </button>
            <Link to={`/dashboard/decks/${id}`} className="btn-brutal">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </Layout>
  )
}


