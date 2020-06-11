'use strict';

// express library sets up our server
const express = require('express');
// initalizes our express library into our variable called app
const app = express();

// dotenv lets us get our secrets from our .env file
require('dotenv').config();

// bodyguard of our server - tells who is ok to send data to
const cors = require('cors');
app.use(cors());

const superagent = require('superagent');
const pg = require('pg');


// bring in the PORT by using process.env.variable name
const PORT = process.env.PORT || 3001;

// From class demo 08
const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => console.error(err));


// end class demo code

app.get('/location', (request, response) => {
  try {
    // query: { city: 'seattle' },
    let city = request.query.city;
    let url = `https://us1.locationiq.com/v1/search.php?key=${process.env.GEO_DATA_API_KEY}&q=${city}&format=json`;

    let sqlQuery = 'SELECT * FROM cities WHERE search_query LIKE ($1)'
    let safeValue = [city];
    console.log(safeValue);

    client.query(sqlQuery, safeValue)
      .then((candy) => {
        if (candy.rowCount === 0) {
          console.log('DB');
          superagent.get(url)
            .then(resultsFromSuperAgent => {
              let finalObj = new Location(city, resultsFromSuperAgent.body[0]);
              response.status(200).send(finalObj);
              console.log(Location);
              let sqlQuery = 'INSERT INTO cities (search_query, formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4);';
              let safeValue = [finalObj.search_query, finalObj.formatted_query, finalObj.latitude, finalObj.longitude];
              client.query(sqlQuery, safeValue);
            })
        } else {
          response.status(200).send(candy.rows[0]);
          console.log('DB');
        }
      })
  } catch (err) {
    console.log('ERROR', err);
    response.status(500).send('sorry, we messed up');
  }
});

// // let search_query = request.query.city;
// // let geoData = require('./data/location.json');
// // let finalObj = new Location(search_query, geoData[0]);

function Location(searchQuery, obj) {
  this.search_query = searchQuery;
  this.formatted_query = obj.display_name;
  this.latitude = obj.lat;
  this.longitude = obj.lon;
}




// turn on the lights - move into the house - start the server

app.get('/weather', (request, response) => {
  try {
    // let geoData = require('./data/weather.json')
    // let weatherArray = geoData.data.map(element => {
    //   return new Weather(element);
    let city = request.query.search_query;
    // let weatherUrl = `https://api.weatherbit.io/v2.0/current?city=${city}=${process.env.WEATHER_API_KEY}`;
    let weatherUrl = `https://api.weatherbit.io/v2.0/forecast/daily?city=${city}&key=${process.env.WEATHER_API_KEY}`;

    superagent.get(weatherUrl)
      .then(resultsFromSuperAgent => {
        let weatherArr = resultsFromSuperAgent.body.data.map(element => new Weather(element));
        response.status(200).send(weatherArr);
        console.log(weatherArr)
      })
  } catch (err) {
    console.log('ERROR', err);
    response.status(500).send('sorry, we messed up');
  }
});


function Weather(obj) {
  this.forecast = obj.weather.description;
  this.time = obj.valid_date;
  // array.push(this)
}

app.get('/trails', (request, response) => {
  try {
    let location = [request.query.latitude, request.query.longitude];
    let trailsUrl = `https://www.hikingproject.com/data/get-trails?lat=${location[0]}&lon=${location[1]}&maxDistance=10&key=${process.env.TRAIL_API_KEY}`;

    superagent.get(trailsUrl)
      .then(resultsFromSuperAgent => {
        let trailsArr = resultsFromSuperAgent.body.trails.map(element => new Trails(element));
        response.status(200).send(trailsArr);
        console.log(trailsArr)
      })
  } catch (err) {
    console.log('ERROR', err);
    response.status(500).send('sorry, we messed up');
  }
});

function Trails(obj) {
  this.name = obj.name;
  this.location = obj.location;
  this.length = obj.length;
  this.starts = obj.starts;
  this.star_votes = obj.starVotes;
  this.summary = obj.summary;
  this.trail_url = obj.url;
  this.conditions = `${obj.conditionDetails || ''} ${obj.conditionStatus}`;
  this.condition_date = obj.conditionDate.slice(0, 10);
  this.condition_time = obj.conditionDate.slice(11, 18);
}


app.get('*', (request, response) => {
  response.status(404).send('sorry, this route does not exist');
})
client.connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`listening on ${PORT}`);
    });

  })
