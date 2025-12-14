import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import { deckService } from '../../services/deckService'
import { learningService } from '../../services/learningService'
import { Deck, Flashcard } from '../../types'
import { ArrowLeft, X, Check } from 'lucide-react'

export default function DeckStudyPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [deck, setDeck] = useState<Deck & { flashcards: Flashcard[] } | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showBack, setShowBack] = useState(false)
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
      if (deckData.flashcards.length === 0) {
        alert('This deck has no flashcards!')
        navigate(`/dashboard/decks/${id}`)
      }
    } catch (error) {
      console.error('Failed to load deck:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleQuality = async (quality: number) => {
    if (!deck) return

    const currentCard = deck.flashcards[currentIndex]
    try {
      // Review the card
      await learningService.reviewCard(currentCard.id, quality, 5000)

      // Move to next card
      if (currentIndex < deck.flashcards.length - 1) {
        setCurrentIndex(currentIndex + 1)
        setShowBack(false)
      } else {
        // Finished deck
        navigate(`/dashboard/decks/${id}`)
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

  if (!deck || deck.flashcards.length === 0) {
    return (
      <Layout>
        <div className="card-brutal text-center">
          <h1 className="text-2xl font-bold">No flashcards in this deck</h1>
          <Link to="/dashboard/decks" className="btn-primary mt-4 inline-block">
            Back to Decks
          </Link>
        </div>
      </Layout>
    )
  }

  const currentCard = deck.flashcards[currentIndex]
  const progress = ((currentIndex + 1) / deck.flashcards.length) * 100

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link to={`/dashboard/decks/${id}`} className="btn-brutal">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="badge-brutal bg-accent">
            {currentIndex + 1} / {deck.flashcards.length}
          </div>
        </div>

        <div className="card-brutal min-h-[420px] flex flex-col">
          {/* Progress */}
          <div className="mb-4">
            <div className="h-4 border-2 border-dark bg-white">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Flip Card */}
          <div className="flex-1 flex items-center justify-center p-6 hover:cursor-pointer" onClick={() => setShowBack(!showBack)}
          >
            <div className="[perspective:1200px] w-full max-w-2xl">
              <div
                className={`
          relative w-full min-h-[300px]
          transition-transform duration-700
          [transform-style:preserve-3d]
          ${showBack ? '[transform:rotateY(180deg)]' : ''}
        `}
              >
                {/* FRONT */}
                <div className="absolute inset-0 card-brutal flex flex-col items-center justify-center p-8 text-center [backface-visibility:hidden]">

                  {currentCard.image_url && (
                    <img
                      src={currentCard.image_url}
                      alt="Flashcard"
                      className="max-h-48 object-contain mb-4 border-4 border-dark rounded-xl bg-white p-2"
                    />
                  )}

                  <p className="text-2xl font-bold">
                    {currentCard.front_content}
                  </p>
                </div>

                {/* BACK */}
                <div className="absolute inset-0 card-brutal flex flex-col items-center justify-center p-8 text-center bg-accent
          [backface-visibility:hidden]
          [transform:rotateY(180deg)]
        ">

                  <p className="text-2xl font-bold">
                    {currentCard.back_content}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          {!showBack ? (
            <button
              onClick={() => setShowBack(true)}
              className="btn-primary w-full text-xl py-4"
            >
              SHOW ANSWER
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-center font-bold text-lg">
                How well did you know this?
              </p>

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

