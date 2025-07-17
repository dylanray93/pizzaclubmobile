import { supabase } from './supabase'
import { Restaurant, Ranking, Attendee, RestaurantSummary } from '@/types/database'

export async function getRestaurants(): Promise<Restaurant[]> {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .order('date_visited', { ascending: false })

  if (error) {
    console.error('Error fetching restaurants:', error)
    throw error
  }

  return data || []
}

export async function getRestaurantRankings(restaurantId: string): Promise<Ranking[]> {
  const { data, error } = await supabase
    .from('rankings')
    .select('*')
    .eq('restaurant_id', restaurantId)

  if (error) {
    console.error('Error fetching rankings:', error)
    throw error
  }

  return data || []
}

export async function getAllRankings(): Promise<Ranking[]> {
  const { data, error } = await supabase
    .from('rankings')
    .select('*')

  if (error) {
    console.error('Error fetching all rankings:', error)
    throw error
  }

  return data || []
}

export async function getUserRankings(raterName: string): Promise<Ranking[]> {
  const { data, error } = await supabase
    .from('rankings')
    .select('*')
    .eq('rater', raterName)

  if (error) {
    console.error('Error fetching user rankings:', error)
    throw error
  }

  return data || []
}

export async function getAttendees(): Promise<Attendee[]> {
  const { data, error } = await supabase
    .from('attendees')
    .select('*')
    .order('name')

  if (error) {
    console.error('Error fetching attendees:', error)
    throw error
  }

  return data || []
}

export async function addRanking(ranking: Omit<Ranking, 'ranking_id'>): Promise<void> {
  const rankingWithId = {
    ...ranking,
    ranking_id: crypto.randomUUID()
  }

  const { error } = await supabase
    .from('rankings')
    .insert([rankingWithId])

  if (error) {
    console.error('Error adding ranking:', error)
    throw error
  }
}

export async function addRestaurant(restaurant: Restaurant): Promise<void> {
  const { error } = await supabase
    .from('restaurants')
    .insert([restaurant])

  if (error) {
    console.error('Error adding restaurant:', error)
    throw error
  }
}

export async function calculateRestaurantSummaries(): Promise<RestaurantSummary[]> {
  const restaurants = await getRestaurants()
  const allRankings = await getAllRankings()

  return restaurants.map(restaurant => {
    const restaurantRankings = allRankings.filter(
      ranking => ranking.restaurant_id === restaurant.name
    )

    if (restaurantRankings.length === 0) {
      return {
        ...restaurant,
        averageRankings: {
          apps: 0,
          crust: 0,
          drinks: 0,
          options: 0,
          sauce: 0,
          value_for_money: 0,
          vibes: 0,
          overall: 0
        },
        totalRaters: 0
      }
    }

    const totals = restaurantRankings.reduce(
      (acc, ranking) => ({
        apps: acc.apps + ranking.ranking_apps,
        crust: acc.crust + ranking.ranking_crust,
        drinks: acc.drinks + ranking.ranking_drinks,
        options: acc.options + ranking.ranking_options,
        sauce: acc.sauce + ranking.ranking_sauce,
        value_for_money: acc.value_for_money + ranking.ranking_value_for_money,
        vibes: acc.vibes + ranking.ranking_vibes
      }),
      { apps: 0, crust: 0, drinks: 0, options: 0, sauce: 0, value_for_money: 0, vibes: 0 }
    )

    const count = restaurantRankings.length
    const averages = {
      apps: totals.apps / count,
      crust: totals.crust / count,
      drinks: totals.drinks / count,
      options: totals.options / count,
      sauce: totals.sauce / count,
      value_for_money: totals.value_for_money / count,
      vibes: totals.vibes / count,
      overall: (totals.apps + totals.crust + totals.drinks + totals.options + totals.sauce + totals.value_for_money + totals.vibes) / (count * 7)
    }

    return {
      ...restaurant,
      averageRankings: averages,
      totalRaters: count
    }
  })
}