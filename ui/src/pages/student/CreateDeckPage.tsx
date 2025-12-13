import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import { deckService } from '../../services/deckService'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function CreateDeckPage() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const deck = await deckService.createDeck({
        title,
        description,
        is_public: isPublic,
      })
      navigate(`/dashboard/decks/${deck.id}`)
    } catch (error) {
      console.error('Failed to create deck:', error)
      alert('Failed to create deck')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/dashboard/decks" className="btn-brutal">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-4xl font-black">CREATE DECK</h1>
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
              {loading ? 'CREATING...' : 'CREATE DECK'}
            </button>
            <Link to="/dashboard/decks" className="btn-brutal">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </Layout>
  )
}

