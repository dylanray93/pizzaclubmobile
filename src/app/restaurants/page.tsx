'use client'

import { useState, useEffect } from 'react'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { calculateRestaurantSummaries } from '@/lib/database'
import { RestaurantSummary } from '@/types/database'

export default function Restaurants() {
  const [restaurants, setRestaurants] = useState<RestaurantSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'rating' | 'date' | 'name'>('rating')

  useEffect(() => {
    async function fetchRestaurants() {
      try {
        const data = await calculateRestaurantSummaries()
        setRestaurants(data)
      } catch (err) {
        setError('Failed to load restaurants')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchRestaurants()
  }, [])

  const getRatingColor = (rating: number) => {
    if (rating >= 7) return 'text-green-600'
    if (rating >= 5) return 'text-yellow-600'
    return 'text-red-600'
  }

  const formatRating = (rating: number) => {
    return rating > 0 ? rating.toFixed(1) : 'N/A'
  }

  const sortedRestaurants = [...restaurants].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.averageRankings.overall - a.averageRankings.overall
      case 'date':
        return new Date(b.date_visited).getTime() - new Date(a.date_visited).getTime()
      case 'name':
        return a.name.localeCompare(b.name)
      default:
        return 0
    }
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <h1 className="text-2xl font-bold text-gray-900">🍕 Pizza Club</h1>
              <button
                onClick={() => signOut()}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </header>
        <div className="flex items-center justify-center min-h-64">
          <div className="text-lg">Loading restaurants...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <h1 className="text-2xl font-bold text-gray-900">🍕 Pizza Club</h1>
              <button
                onClick={() => signOut()}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </header>
        <div className="flex items-center justify-center min-h-64">
          <div className="text-red-600">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-gray-700">
                🍕 Pizza Club
              </Link>
              <span className="text-gray-400">→</span>
              <span className="text-lg font-medium text-gray-600">Restaurants</span>
            </div>
            <button
              onClick={() => signOut()}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  All Restaurants ({restaurants.length})
                </h2>
                <p className="text-gray-600">
                  Pizza places we've visited with average ratings from all members
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <label htmlFor="sort" className="text-sm font-medium text-gray-700">
                  Sort by:
                </label>
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'rating' | 'date' | 'name')}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="rating">Overall Rating</option>
                  <option value="date">Visit Date (Newest)</option>
                  <option value="name">Name (A-Z)</option>
                </select>
                <a
                  href="/restaurants/add"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  + Add Restaurant
                </a>
              </div>
            </div>
          </div>

          {restaurants.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500">No restaurants found. Import your data to get started!</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedRestaurants.map((restaurant, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                        {restaurant.name}
                      </h3>
                      <div className={`text-2xl font-bold ${getRatingColor(restaurant.averageRankings.overall)}`}>
                        {formatRating(restaurant.averageRankings.overall)}
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">📍 Address:</span>
                        <span className="text-gray-900 text-right">{restaurant.address}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">📅 Visited:</span>
                        <span className="text-gray-900">{new Date(restaurant.date_visited).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">👥 Raters:</span>
                        <span className="text-gray-900">{restaurant.totalRaters}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Category Ratings</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Crust:</span>
                          <span className={getRatingColor(restaurant.averageRankings.crust)}>
                            {formatRating(restaurant.averageRankings.crust)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Sauce:</span>
                          <span className={getRatingColor(restaurant.averageRankings.sauce)}>
                            {formatRating(restaurant.averageRankings.sauce)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Apps:</span>
                          <span className={getRatingColor(restaurant.averageRankings.apps)}>
                            {formatRating(restaurant.averageRankings.apps)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Drinks:</span>
                          <span className={getRatingColor(restaurant.averageRankings.drinks)}>
                            {formatRating(restaurant.averageRankings.drinks)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Options:</span>
                          <span className={getRatingColor(restaurant.averageRankings.options)}>
                            {formatRating(restaurant.averageRankings.options)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Value:</span>
                          <span className={getRatingColor(restaurant.averageRankings.value_for_money)}>
                            {formatRating(restaurant.averageRankings.value_for_money)}
                          </span>
                        </div>
                        <div className="flex justify-between col-span-2">
                          <span className="text-gray-600">Vibes:</span>
                          <span className={getRatingColor(restaurant.averageRankings.vibes)}>
                            {formatRating(restaurant.averageRankings.vibes)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}