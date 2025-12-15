import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Layout from '../../components/Layout'
import { badgeService } from '../../services/badgeService'
import { Badge } from '../../types'
import { ArrowLeft } from 'lucide-react'

export default function EditBadgePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [badge, setBadge] = useState<Badge | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [rewardXp, setRewardXp] = useState(0)
  const [criteria, setCriteria] = useState({ type: 'cards_learned', value: 0, operator: 'gte' })
  const [loading, setLoading] = useState(false)
  const [loadingBadge, setLoadingBadge] = useState(true)

  useEffect(() => {
    if (id) {
      loadBadge()
    }
  }, [id])

  const loadBadge = async () => {
    try {
      const badges = await badgeService.getAllBadges()
      const badgeData = badges.find(b => b.id === Number(id))
      if (badgeData) {
        setBadge(badgeData)
        setName(badgeData.name)
        setDescription(badgeData.description || '')
        setRewardXp(badgeData.reward_xp)
        if (badgeData.criteria_json) {
          setCriteria(badgeData.criteria_json)
        }
      }
    } catch (error) {
      console.error('Failed to load badge:', error)
      alert('Failed to load badge')
    } finally {
      setLoadingBadge(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return
    setLoading(true)
    try {
      await badgeService.updateBadge(Number(id), {
        name,
        description,
        reward_xp: rewardXp,
        criteria_json: criteria,
      })
      navigate('/dashboard/badges')
    } catch (error) {
      console.error('Failed to update badge:', error)
      alert('Failed to update badge')
    } finally {
      setLoading(false)
    }
  }

  if (loadingBadge) {
    return (
      <Layout>
        <div className="card-brutal">
          <h1 className="text-2xl font-bold">Loading...</h1>
        </div>
      </Layout>
    )
  }

  if (!badge) {
    return (
      <Layout>
        <div className="card-brutal text-center">
          <h1 className="text-2xl font-bold">Badge not found</h1>
          <Link to="/dashboard/badges" className="btn-primary mt-4 inline-block">
            Back to Badges
          </Link>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/dashboard/badges" className="btn-brutal">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-4xl font-black">EDIT BADGE</h1>
        </div>

        <form onSubmit={handleSubmit} className="card-brutal space-y-6">
          <div>
            <label className="block font-bold mb-2 text-lg">Badge Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="input-brutal w-full"
            />
          </div>

          <div>
            <label className="block font-bold mb-2 text-lg">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-brutal w-full"
              rows={3}
            />
          </div>

          <div>
            <label className="block font-bold mb-2 text-lg">Reward XP *</label>
            <input
              type="number"
              value={rewardXp}
              onChange={(e) => setRewardXp(Number(e.target.value))}
              required
              min="0"
              className="input-brutal w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold mb-2 text-lg">Criteria Type</label>
              <select
                value={criteria.type}
                onChange={(e) =>
                  setCriteria({ ...criteria, type: e.target.value as any })
                }
                className="input-brutal w-full"
              >
                <option value="cards_learned">Cards Learned</option>
                <option value="streak">Streak</option>
                <option value="total_xp">Total XP</option>
              </select>
            </div>
            <div>
              <label className="block font-bold mb-2 text-lg">Target Value</label>
              <input
                type="number"
                value={criteria.value}
                onChange={(e) =>
                  setCriteria({ ...criteria, value: Number(e.target.value) })
                }
                required
                min="0"
                className="input-brutal w-full"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'UPDATING...' : 'UPDATE BADGE'}
            </button>
            <Link to="/dashboard/badges" className="btn-brutal">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </Layout>
  )
}


