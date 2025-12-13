import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import { badgeService } from '../../services/badgeService'
import { Badge } from '../../types'
import { Trophy, Plus, Edit, Trash2 } from 'lucide-react'

export default function AdminBadgesPage() {
  const [badges, setBadges] = useState<Badge[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newBadge, setNewBadge] = useState({
    name: '',
    description: '',
    reward_xp: 0,
    criteria_json: { type: 'cards_learned', value: 0, operator: 'gte' },
  })

  useEffect(() => {
    loadBadges()
  }, [])

  const loadBadges = async () => {
    try {
      const badgesData = await badgeService.getAllBadges()
      setBadges(badgesData)
    } catch (error) {
      console.error('Failed to load badges:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBadge = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await badgeService.createBadge(newBadge)
      setNewBadge({
        name: '',
        description: '',
        reward_xp: 0,
        criteria_json: { type: 'cards_learned', value: 0, operator: 'gte' },
      })
      setShowCreateForm(false)
      await loadBadges()
    } catch (error) {
      console.error('Failed to create badge:', error)
    }
  }

  const handleDelete = async (badgeId: number) => {
    if (!confirm('Delete this badge?')) return
    try {
      await badgeService.deleteBadge(badgeId)
      await loadBadges()
    } catch (error) {
      console.error('Failed to delete badge:', error)
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

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-black">BADGES MANAGEMENT</h1>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="btn-primary"
          >
            <Plus className="w-5 h-5" />
            New Badge
          </button>
        </div>

        {showCreateForm && (
          <div className="card-brutal">
            <h2 className="text-2xl font-black mb-4">CREATE NEW BADGE</h2>
            <form onSubmit={handleCreateBadge} className="space-y-4">
              <div>
                <label className="block font-bold mb-2">Badge Name</label>
                <input
                  type="text"
                  value={newBadge.name}
                  onChange={(e) => setNewBadge({ ...newBadge, name: e.target.value })}
                  required
                  className="input-brutal w-full"
                />
              </div>
              <div>
                <label className="block font-bold mb-2">Description</label>
                <textarea
                  value={newBadge.description}
                  onChange={(e) => setNewBadge({ ...newBadge, description: e.target.value })}
                  className="input-brutal w-full"
                  rows={3}
                />
              </div>
              <div>
                <label className="block font-bold mb-2">Reward XP</label>
                <input
                  type="number"
                  value={newBadge.reward_xp}
                  onChange={(e) => setNewBadge({ ...newBadge, reward_xp: Number(e.target.value) })}
                  required
                  min="0"
                  className="input-brutal w-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-2">Criteria Type</label>
                  <select
                    value={newBadge.criteria_json.type}
                    onChange={(e) =>
                      setNewBadge({
                        ...newBadge,
                        criteria_json: {
                          ...newBadge.criteria_json,
                          type: e.target.value as any,
                        },
                      })
                    }
                    className="input-brutal w-full"
                  >
                    <option value="cards_learned">Cards Learned</option>
                    <option value="streak">Streak</option>
                    <option value="total_xp">Total XP</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-2">Target Value</label>
                  <input
                    type="number"
                    value={newBadge.criteria_json.value}
                    onChange={(e) =>
                      setNewBadge({
                        ...newBadge,
                        criteria_json: {
                          ...newBadge.criteria_json,
                          value: Number(e.target.value),
                        },
                      })
                    }
                    required
                    min="0"
                    className="input-brutal w-full"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn-primary">
                  Create Badge
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="btn-brutal"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {badges.map((badge) => (
            <div key={badge.id} className="card-brutal">
              <div className="flex items-center gap-4 mb-4">
                <Trophy className="w-12 h-12" />
                <div className="flex-1">
                  <h3 className="text-xl font-black">{badge.name}</h3>
                  <p className="text-sm font-bold">{badge.reward_xp} XP</p>
                </div>
              </div>
              {badge.description && (
                <p className="text-sm font-bold mb-4">{badge.description}</p>
              )}
              {badge.criteria_json && (
                <div className="mb-4">
                  <p className="text-xs font-bold mb-1">CRITERIA:</p>
                  <p className="text-xs">
                    {badge.criteria_json.type}: {badge.criteria_json.value}
                  </p>
                </div>
              )}
              <div className="flex gap-2">
                <button className="btn-brutal bg-accent flex-1">
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(badge.id)}
                  className="btn-brutal bg-red-500 text-white"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}

