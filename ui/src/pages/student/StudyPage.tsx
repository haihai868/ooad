import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import { learningService } from '../../services/learningService'
import { CardRetentionData } from '../../types'
import { Flashcard } from '../../types'
import { deckService } from '../../services/deckService'
import { X, Check, RotateCcw } from 'lucide-react'

export default function StudyPage() {
  const [dueCards, setDueCards] = useState<CardRetentionData[]>([])
  const [currentCard, setCurrentCard] = useState<{ retention: CardRetentionData; flashcard: Flashcard } | null>(null)
  const [showBack, setShowBack] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDueCards()
  }, [])

  const loadDueCards = async () => {
    try {
      const cards = await learningService.getDueCards()
      setDueCards(cards)
      if (cards.length > 0) {
        await loadCurrentCard(cards[0])
      }
    } catch (error) {
      console.error('Failed to load due cards:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCurrentCard = async (retention: CardRetentionData) => {
    try {
      // We need to get the flashcard by ID
      // For now, we'll need to fetch all decks and find the card
      // This is a simplified version - in production, you'd have an endpoint to get card by ID
      const decks = await deckService.getAllDecks(0, 100, true)
      let foundFlashcard: Flashcard | null = null
      
      for (const deck of decks) {
        try {
          const deckWithCards = await deckService.getDeck(deck.id)
          const flashcard = deckWithCards.flashcards.find((f) => f.id === retention.card_id)
          if (flashcard) {
            foundFlashcard = flashcard
            break
          }
        } catch (e) {
          continue
        }
      }
      
      if (foundFlashcard) {
        setCurrentCard({ retention, flashcard: foundFlashcard })
        setShowBack(false)
      }
    } catch (error) {
      console.error('Failed to load card:', error)
    }
  }

  const handleQuality = async (quality: number) => {
    if (!currentCard) return

    try {
      await learningService.reviewCard(
        currentCard.retention.card_id,
        quality,
        5000 // 5 seconds study time
      )

      // Remove current card and load next
      const remaining = dueCards.filter((c) => c.card_id !== currentCard.retention.card_id)
      setDueCards(remaining)

      if (remaining.length > 0) {
        await loadCurrentCard(remaining[0])
      } else {
        setCurrentCard(null)
      }
    } catch (error) {
      console.error('Failed to review card:', error)
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

  if (!currentCard) {
    return (
      <Layout>
        <div className="card-brutal text-center">
          <h1 className="text-4xl font-black mb-4">ALL DONE!</h1>
          <p className="text-xl font-bold">No cards due for review</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-black">STUDY</h1>
          <div className="badge-brutal bg-accent">
            {dueCards.length} cards remaining
          </div>
        </div>

        <div className="card-brutal min-h-[400px] flex flex-col">
          <div className="flex-1 flex items-center justify-center p-8">
            {!showBack ? (
              <div className="text-center">
                <h2 className="text-3xl font-black mb-8">FRONT</h2>
                <p className="text-2xl font-bold">{currentCard.flashcard.front_content}</p>
              </div>
            ) : (
              <div className="text-center">
                <h2 className="text-3xl font-black mb-8">BACK</h2>
                <p className="text-2xl font-bold">{currentCard.flashcard.back_content}</p>
              </div>
            )}
          </div>

          {!showBack ? (
            <button
              onClick={() => setShowBack(true)}
              className="btn-primary w-full text-xl py-4"
            >
              SHOW ANSWER
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-center font-bold text-lg">How well did you know this?</p>
              <div className="grid grid-cols-5 gap-3">
                <button
                  onClick={() => handleQuality(0)}
                  className="btn-brutal bg-red-500 text-white py-3"
                >
                  <X className="w-6 h-6 mx-auto" />
                  <span className="text-xs font-bold">Again</span>
                </button>
                <button
                  onClick={() => handleQuality(1)}
                  className="btn-brutal bg-orange-500 text-white py-3"
                >
                  <span className="text-xs font-bold">Hard</span>
                </button>
                <button
                  onClick={() => handleQuality(2)}
                  className="btn-brutal bg-yellow-500 text-white py-3"
                >
                  <span className="text-xs font-bold">Good</span>
                </button>
                <button
                  onClick={() => handleQuality(3)}
                  className="btn-brutal bg-green-500 text-white py-3"
                >
                  <Check className="w-6 h-6 mx-auto" />
                  <span className="text-xs font-bold">Easy</span>
                </button>
                <button
                  onClick={() => handleQuality(4)}
                  className="btn-brutal bg-blue-500 text-white py-3"
                >
                  <span className="text-xs font-bold">Perfect</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

