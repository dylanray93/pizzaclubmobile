'use client'

import { useState, useEffect } from 'react'
import { signOut } from 'next-auth/react'
import { getAttendees, getAllRankings } from '@/lib/database'
import { Attendee, Ranking } from '@/types/database'

export default function Members() {
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [rankings, setRankings] = useState<Ranking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const [attendeeData, rankingData] = await Promise.all([
          getAttendees(),
          getAllRankings()
        ])
        setAttendees(attendeeData)
        setRankings(rankingData)
      } catch (err) {
        setError('Failed to load members')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getMemberStats = (memberName: string) => {
    const memberRankings = rankings.filter(r => r.rater === memberName)
    const totalRankings = memberRankings.length
    
    if (totalRankings === 0) {
      return { totalRankings: 0, averageRating: 0 }
    }

    const totalScore = memberRankings.reduce((sum, ranking) => {
      return sum + ranking.ranking_apps + ranking.ranking_crust + ranking.ranking_drinks + 
             ranking.ranking_options + ranking.ranking_sauce + ranking.ranking_value_for_money + 
             ranking.ranking_vibes
    }, 0)

    const averageRating = totalScore / (totalRankings * 7)
    
    return { totalRankings, averageRating }
  }

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
          <div className="text-lg">Loading members...</div>
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
              <a href="/" className="text-2xl font-bold text-gray-900 hover:text-gray-700">
                🍕 Pizza Club
              </a>
              <span className="text-gray-400">→</span>
              <span className="text-lg font-medium text-gray-600">Members</span>
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
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Club Members ({attendees.length})
            </h2>
            <p className="text-gray-600">
              Everyone who's part of our monthly pizza adventures
            </p>
          </div>

          {attendees.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500">No members found. Import your data to get started!</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {attendees.map((member) => {
                const stats = getMemberStats(member.name)
                return (
                  <div key={member.email} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200">
                    <div className="p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-indigo-600 font-semibold text-lg">
                            {member.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {member.name}
                          </h3>
                          <p className="text-sm text-gray-600">{member.email}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Rankings submitted:</span>
                          <span className="font-semibold text-gray-900">
                            {stats.totalRankings}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Average rating:</span>
                          <span className="font-semibold text-gray-900">
                            {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : 'N/A'}
                          </span>
                        </div>
                        
                        <div className="pt-3 border-t border-gray-200">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">Activity level:</span>
                            <div className="flex space-x-1">
                              {[1, 2, 3, 4, 5].map((level) => (
                                <div
                                  key={level}
                                  className={`w-2 h-2 rounded-full ${
                                    level <= Math.min(5, Math.ceil(stats.totalRankings / 2))
                                      ? 'bg-green-400'
                                      : 'bg-gray-200'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}