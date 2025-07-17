'use client'

import { useState, useEffect } from 'react'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { getAttendees, getAllRankings, getRestaurants } from '@/lib/database'
import { Attendee, Ranking, Restaurant } from '@/types/database'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  Cell, PieChart, Pie
} from 'recharts'

interface MemberComparison {
  member: string;
  apps?: number;
  crust?: number;
  drinks?: number;
  options?: number;
  sauce?: number;
  value_for_money?: number;
  vibes?: number;
}

interface TimelineTrend {
  date: string;
  restaurant?: string;
  apps?: number;
  crust?: number;
  drinks?: number;
  options?: number;
  sauce?: number;
  value_for_money?: number;
  vibes?: number;
}

interface AnalyticsData {
  memberRatingDistribution: { name: string; count: number; color: string }[]
  categoryAverages: { category: string; average: number }[]
  memberComparison: MemberComparison[]
  timelineTrends: TimelineTrend[]
  ratingDistribution: { rating: string; count: number }[]
}

export default function Analytics() {
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [rankings, setRankings] = useState<Ranking[]>([])
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const [attendeeData, rankingData, restaurantData] = await Promise.all([
          getAttendees(),
          getAllRankings(),
          getRestaurants()
        ])
        setAttendees(attendeeData)
        setRankings(rankingData)
        setRestaurants(restaurantData)
        
        // Process analytics data
        processAnalyticsData(attendeeData, rankingData, restaurantData)
      } catch (err) {
        setError('Failed to load analytics data')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const processAnalyticsData = (attendees: Attendee[], rankings: Ranking[], restaurants: Restaurant[]) => {
    // Member rating distribution (how many ratings each member has submitted)
    const memberCounts = attendees.map((member, index) => ({
      name: member.name,
      count: rankings.filter(r => r.rater === member.name).length,
      color: `hsl(${(index * 137.5) % 360}, 70%, 50%)`
    }))

    // Category averages across all rankings
    const categories = ['apps', 'crust', 'drinks', 'options', 'sauce', 'value_for_money', 'vibes']
    const categoryAverages = categories.map(cat => {
      const key = `ranking_${cat}` as keyof Ranking
      const values = rankings.map(r => r[key] as number).filter(v => v > 0)
      return {
        category: cat.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        average: values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0
      }
    })

    // Member comparison across categories
    const memberComparison = attendees.map(member => {
      const memberRankings = rankings.filter(r => r.rater === member.name)
      if (memberRankings.length === 0) return { member: member.name }
      
      const result: MemberComparison = { member: member.name }
      categories.forEach(cat => {
        const key = `ranking_${cat}` as keyof Ranking
        const values = memberRankings.map(r => r[key] as number).filter(v => v > 0)
        ;(result as any)[cat] = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0
      })
      return result
    }).filter(m => Object.keys(m).length > 1)

    // Timeline trends (ratings over time by restaurant visit date)
    const restaurantsByDate = restaurants
      .map(r => ({
        ...r,
        rankings: rankings.filter(rank => rank.restaurant_id === r.name)
      }))
      .filter(r => r.rankings.length > 0)
      .sort((a, b) => new Date(a.date_visited).getTime() - new Date(b.date_visited).getTime())
      .slice(-10) // Last 10 restaurants

    const timelineTrends = restaurantsByDate.map(restaurant => {
      const result: TimelineTrend = {
        date: new Date(restaurant.date_visited).toLocaleDateString(),
        restaurant: restaurant.name.substring(0, 15) + (restaurant.name.length > 15 ? '...' : '')
      }
      
      categories.forEach(cat => {
        const key = `ranking_${cat}` as keyof Ranking
        const values = restaurant.rankings.map(r => r[key] as number).filter(v => v > 0)
        ;(result as any)[cat] = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0
      })
      
      return result
    })

    // Overall rating distribution
    const allRatings = rankings.flatMap(r => [
      r.ranking_apps, r.ranking_crust, r.ranking_drinks, r.ranking_options,
      r.ranking_sauce, r.ranking_value_for_money, r.ranking_vibes
    ]).filter(r => r <= 10) // Filter out ratings over 10
    
    const ratingCounts = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(rating => ({
      rating: rating.toString(),
      count: allRatings.filter(r => r === rating).length
    }))

    setAnalyticsData({
      memberRatingDistribution: memberCounts,
      categoryAverages,
      memberComparison,
      timelineTrends,
      ratingDistribution: ratingCounts
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <h1 className="text-2xl font-bold text-gray-900">🍕 Pizza Club</h1>
              <button onClick={() => signOut()} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                Sign Out
              </button>
            </div>
          </div>
        </header>
        <div className="flex items-center justify-center min-h-64">
          <div className="text-lg">Loading analytics...</div>
        </div>
      </div>
    )
  }

  if (error || !analyticsData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <h1 className="text-2xl font-bold text-gray-900">🍕 Pizza Club</h1>
              <button onClick={() => signOut()} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                Sign Out
              </button>
            </div>
          </div>
        </header>
        <div className="flex items-center justify-center min-h-64">
          <div className="text-red-600">{error || 'Failed to load analytics'}</div>
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
              <span className="text-lg font-medium text-gray-600">Analytics</span>
            </div>
            <button onClick={() => signOut()} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium">
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Pizza Club Analytics</h2>
            <p className="text-gray-600">Deep insights into our pizza rating patterns and trends</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Member Activity Distribution */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Member Activity Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={analyticsData.memberRatingDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, count }) => `${name}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {analyticsData.memberRatingDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Overall Rating Distribution */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Rating Distribution (All Categories)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={analyticsData.ratingDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="rating" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Performance */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Average Ratings by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.categoryAverages} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 10]} />
                <YAxis dataKey="category" type="category" width={100} />
                <Tooltip formatter={(value: number) => [value.toFixed(2), 'Average Rating']} />
                <Bar dataKey="average" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Member Comparison Radar */}
          {analyticsData.memberComparison.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Member Rating Patterns (Radar Chart)</h3>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={analyticsData.memberComparison.slice(0, 4)}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="member" />
                  <PolarRadiusAxis domain={[0, 10]} />
                  <Radar name="Apps" dataKey="apps" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                  <Radar name="Crust" dataKey="crust" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} />
                  <Radar name="Sauce" dataKey="sauce" stroke="#ffc658" fill="#ffc658" fillOpacity={0.3} />
                  <Radar name="Vibes" dataKey="vibes" stroke="#ff7c7c" fill="#ff7c7c" fillOpacity={0.3} />
                  <Legend />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Timeline Trends */}
          {analyticsData.timelineTrends.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Rating Trends Over Time (Last 10 Restaurants)</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={analyticsData.timelineTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip 
                    labelFormatter={(label, payload) => {
                      const restaurant = payload?.[0]?.payload?.restaurant
                      return restaurant ? `${label} - ${restaurant}` : label
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="crust" stroke="#8884d8" strokeWidth={2} />
                  <Line type="monotone" dataKey="sauce" stroke="#82ca9d" strokeWidth={2} />
                  <Line type="monotone" dataKey="vibes" stroke="#ffc658" strokeWidth={2} />
                  <Line type="monotone" dataKey="value_for_money" stroke="#ff7c7c" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-3xl font-bold text-indigo-600">{rankings.length}</div>
              <div className="text-gray-600">Total Rankings</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-3xl font-bold text-green-600">{restaurants.length}</div>
              <div className="text-gray-600">Restaurants Visited</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-3xl font-bold text-purple-600">{attendees.length}</div>
              <div className="text-gray-600">Active Members</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}