-- Create attendees table
CREATE TABLE attendees (
    email text,
    name text
);

-- Create restaurants table  
CREATE TABLE restaurants (
    address text,
    date_visited date,
    name text
);

-- Create rankings table
CREATE TABLE rankings (
    ranking_apps integer,
    ranking_crust integer,
    ranking_drinks integer,
    ranking_id text,
    ranking_options integer,
    ranking_sauce integer,
    ranking_value_for_money integer,
    ranking_vibes integer,
    rater text,
    restaurant_id text
);

-- Add indexes for better performance
CREATE INDEX idx_rankings_restaurant_id ON rankings(restaurant_id);
CREATE INDEX idx_rankings_rater ON rankings(rater);
CREATE INDEX idx_attendees_email ON attendees(email);