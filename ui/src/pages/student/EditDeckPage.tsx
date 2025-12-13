import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Layout from '../../components/Layout'
import { deckService } from '../../services/deckService'
import { Deck } from '../../types'
import { ArrowLeft } from 'lucide-react'

export default function EditDeckPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [deck, setDeck] = useState<Deck | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingDeck, setLoadingDeck] = useState(true)

  useEffect(() => {
    if (id) {
      loadDeck()
    }
  }, [id])

  const loadDeck = async () => {
    try {
      const deckData = await deckService.getDeck(Number(id))
      setDeck(deckData)
      setTitle(deckData.title)
      setDescription(deckData.description || '')
      setIsPublic(deckData.is_public)
    } catch (error) {
      console.error('Failed to load deck:', error)
      alert('Failed to load deck')
    } finally {
      setLoadingDeck(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return
    setLoading(true)
    try {
      await deckService.updateDeck(Number(id), {
        title,
        description,
        is_public: isPublic,
      })
      navigate(`/dashboard/decks/${id}`)
    } catch (error) {
      console.error('Failed to update deck:', error)
      alert('Failed to update deck')
    } finally {
      setLoading(false)
    }
  }

  if (loadingDeck) {
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

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link to={`/dashboard/decks/${id}`} className="btn-brutal">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-4xl font-black">EDIT DECK</h1>
        </div>

        <form onSubmit={handleSubmit} className="card-brutal space-y-6">
          <div>
            <label className="block font-bold mb-2 text-lg">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="input-brutal w-full"
              placeholder="Enter deck title"
            />
          </div>

          <div>
            <label className="block font-bold mb-2 text-lg">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-brutal w-full"
              rows={4}
              placeholder="Enter deck description (optional)"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isPublic"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="w-6 h-6 border-4 border-dark"
            />
            <label htmlFor="isPublic" className="font-bold text-lg">
              Make this deck public
            </label>
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'UPDATING...' : 'UPDATE DECK'}
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

