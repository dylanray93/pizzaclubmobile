export interface Attendee {
  email: string;
  name: string;
}

export interface Restaurant {
  address: string;
  date_visited: string; // ISO date string
  name: string;
}

export interface Ranking {
  ranking_apps: number;
  ranking_crust: number;
  ranking_drinks: number;
  ranking_id: string;
  ranking_options: number;
  ranking_sauce: number;
  ranking_value_for_money: number;
  ranking_vibes: number;
  rater: string;
  restaurant_id: string;
}

// Helper type for restaurant with rankings
export interface RestaurantWithRankings extends Restaurant {
  rankings: Ranking[];
}

// Average rankings for display
export interface RestaurantSummary extends Restaurant {
  averageRankings: {
    apps: number;
    crust: number;
    drinks: number;
    options: number;
    sauce: number;
    value_for_money: number;
    vibes: number;
    overall: number;
  };
  totalRaters: number;
}