DROP TABLE IF EXISTS cities;

CREATE TABLE cities(
  id SERIAL PRIMARY KEY,
  search_query VARCHAR(255),
  formatted_query VARCHAR(255),
  latitude DECIMAL(12, 8),
  longitude DECIMAL(12, 8)
);

-- Example from class code
INSERT INTO cities (search_query, formatted_query, latitude, longitude) VALUES ('test', 'test, USA', 123.456789, -987.654321);
SELECT * FROM cities;

-- Database URL: postgres://localhost:5432/DBNAME

-- via Lulu
-- INSERT INTO location (search_query, formatted_query, latitude, longitude) values ('seattle', 'Seattle, King County, Washington, USA', '47.6038321', '-122.3300624');