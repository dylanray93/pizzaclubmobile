'use client'

import { useState, useEffect } from 'react'
import { signOut } from 'next-auth/react'
import { getRestaurants, getAttendees, addRanking, getUserRankings } from '@/lib/database'
import { Restaurant, Attendee, Ranking } from '@/types/database'

export default function Rankings() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [userRankings, setUserRankings] = useState<Ranking[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    restaurant_id: '',
    rater: '',
    ranking_apps: 5,
    ranking_crust: 5,
    ranking_drinks: 5,
    ranking_options: 5,
    ranking_sauce: 5,
    ranking_value_for_money: 5,
    ranking_vibes: 5
  })

  useEffect(() => {
    async function fetchData() {
      try {
        const [restaurantData, attendeeData] = await Promise.all([
          getRestaurants(),
          getAttendees()
        ])
        setRestaurants(restaurantData)
        setAttendees(attendeeData)
      } catch (err) {
        setError('Failed to load data')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Fetch user rankings when rater is selected
  useEffect(() => {
    async function fetchUserRankings() {
      if (formData.rater) {
        try {
          const rankings = await getUserRankings(formData.rater)
          setUserRankings(rankings)
        } catch (err) {
          console.error('Failed to fetch user rankings:', err)
        }
      } else {
        setUserRankings([])
      }
    }

    fetchUserRankings()
  }, [formData.rater])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      await addRanking(formData)
      setSuccess(true)
      setFormData({
        restaurant_id: '',
        rater: '',
        ranking_apps: 5,
        ranking_crust: 5,
        ranking_drinks: 5,
        ranking_options: 5,
        ranking_sauce: 5,
        ranking_value_for_money: 5,
        ranking_vibes: 5
      })
      
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError('Failed to submit ranking')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const updateRating = (field: string, value: number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Get restaurants that the current user hasn't ranked yet
  const availableRestaurants = restaurants.filter(restaurant => {
    return !userRankings.some(ranking => ranking.restaurant_id === restaurant.name)
  })

  // Check if current selection is already ranked
  const isAlreadyRanked = formData.rater && formData.restaurant_id && 
    userRankings.some(ranking => ranking.restaurant_id === formData.restaurant_id)

  const RatingInput = ({ 
    label, 
    field, 
    value 
  }: { 
    label: string
    field: string
    value: number 
  }) => (
    <div className="win95-panel space-y-2">
      <label className="block text-xs font-bold">
        {label}: <span className="text-blue-800">{value}/10</span>
      </label>
      <div className="space-y-1">
        <input
          type="range"
          min="0"
          max="10"
          value={value}
          onChange={(e) => updateRating(field, parseInt(e.target.value))}
          className="win95-slider w-full"
        />
        <div className="flex justify-between text-xs">
          <span>0</span>
          <span>2</span>
          <span>4</span>
          <span>6</span>
          <span>8</span>
          <span>10</span>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="win95-desktop min-h-screen">
        <div className="win95-menubar">
          <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
            <span className="font-bold">🍕 Pizza Club v1.0</span>
            <button onClick={() => signOut()} className="win95-button text-xs">Exit</button>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-64">
          <div className="win95-window">
            <div className="win95-window-title">Loading...</div>
            <div className="win95-window-content">
              <div className="text-xs">Please wait while data loads...</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="win95-desktop min-h-screen">
      <div className="win95-menubar">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <a href="/" className="font-bold hover:underline">🍕 Pizza Club v1.0</a>
            <span className="text-xs">→ Rankings.exe</span>
          </div>
          <button onClick={() => signOut()} className="win95-button text-xs">Exit</button>
        </div>
      </div>

      <main className="max-w-5xl mx-auto p-4">
        <div className="win95-window win95-startup">
          <div className="win95-window-title">
            Rate a Restaurant - Pizza Club
          </div>
          <div className="win95-window-content">
            <div className="mb-4">
              <div className="text-xs font-bold mb-1">Instructions:</div>
              <div className="text-xs">Share your experience by rating different aspects of the restaurant (0-10 scale)</div>
            </div>

            {success && (
              <div className="win95-panel bg-green-100 border-green-300 mb-4 p-2">
                <div className="text-green-800 text-xs">✅ Ranking submitted successfully!</div>
              </div>
            )}

            {error && (
              <div className="win95-panel bg-red-100 border-red-300 mb-4 p-2">
                <div className="text-red-800 text-xs">{error}</div>
              </div>
            )}

            {formData.rater && availableRestaurants.length === 0 && (
              <div className="win95-panel bg-blue-100 border-blue-300 mb-4 p-2">
                <div className="text-blue-800 text-xs">
                  🎉 Great job! You've already ranked all available restaurants. Check back when new places are added!
                </div>
              </div>
            )}

            {isAlreadyRanked && (
              <div className="win95-panel bg-yellow-100 border-yellow-300 mb-4 p-2">
                <div className="text-yellow-800 text-xs">
                  ⚠️ You've already ranked "{formData.restaurant_id}". Please select a different restaurant.
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="win95-panel">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold mb-1">Restaurant *</label>
                  <select
                    required
                    value={formData.restaurant_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, restaurant_id: e.target.value }))}
                    className="win95-select w-full"
                  >
                    <option value="">Select a restaurant</option>
                    {formData.rater ? (
                      availableRestaurants.length > 0 ? (
                        availableRestaurants.map((restaurant) => (
                          <option key={restaurant.name} value={restaurant.name}>
                            {restaurant.name}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>No restaurants available to rank</option>
                      )
                    ) : (
                      <option value="" disabled>Please select your name first</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Your Name *</label>
                  <select
                    required
                    value={formData.rater}
                    onChange={(e) => setFormData(prev => ({ ...prev, rater: e.target.value }))}
                    className="win95-select w-full"
                  >
                    <option value="">Select your name</option>
                    {attendees.map((attendee) => (
                      <option key={attendee.email} value={attendee.name}>
                        {attendee.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                <RatingInput label="Apps" field="ranking_apps" value={formData.ranking_apps} />
                <RatingInput label="Crust" field="ranking_crust" value={formData.ranking_crust} />
                <RatingInput label="Sauce" field="ranking_sauce" value={formData.ranking_sauce} />
                <RatingInput label="Drinks" field="ranking_drinks" value={formData.ranking_drinks} />
                <RatingInput label="Options" field="ranking_options" value={formData.ranking_options} />
                <RatingInput label="Value for Money" field="ranking_value_for_money" value={formData.ranking_value_for_money} />
                <RatingInput label="Vibes" field="ranking_vibes" value={formData.ranking_vibes} />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-gray-400">
                <button type="button" className="win95-button text-xs" onClick={() => window.history.back()}>
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || isAlreadyRanked || (formData.rater && availableRestaurants.length === 0)}
                  className="win95-button text-xs font-bold"
                >
                  {submitting ? 'Submitting...' : 
                   isAlreadyRanked ? 'Already Ranked' :
                   (formData.rater && availableRestaurants.length === 0) ? 'All Restaurants Ranked' :
                   'Submit Ranking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <div className="win95-statusbar">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-xs">Ready</span>
          </div>
          <div className="text-xs">Rankings.exe</div>
        </div>
      </div>
    </div>
  )
}