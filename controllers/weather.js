const LocationWeather = require('../models/locationWeather');
const axios = require('axios');

const API_KEY = process.env.OPENWEATHERMAP_API_KEY;
const WEATHER_API_BASE = 'https://api.openweathermap.org/data/2.5';

const featuredCities = [
  { name: 'Charminar', query: 'Charminar,IN' },
  { name: 'Hitech City', query: 'Hitech City,IN' },
  { name: 'Gachibowli', query: 'Gachibowli,IN' },
  { name: 'Secunderabad', query: 'Secunderabad,IN' },
  { name: 'Banjara Hills', query: 'Banjara Hills,IN' },
  { name: 'Mehdipatnam', query: 'Mehdipatnam,IN' },
  { name: 'Jubilee Hills', query: 'Jubilee Hills,IN' },
  { name: 'Kukatpally', query: 'Kukatpally,IN' },
  { name: 'Madhapur', query: 'Madhapur,IN' },
  { name: 'Begumpet', query: 'Begumpet,IN' }
];

const iconUrl = (code) => (code ? `https://openweathermap.org/img/wn/${code}@2x.png` : '');

const normalizeCity = (value = '') =>
  value
    .toString()
    .toLowerCase()
    .replace(/,.*$/, '')
    .trim();

const kelvinToCelsius = (kelvin) => Math.round(kelvin - 273.15);

const fetchWeatherFromAPI = async (city) => {
  try {
    const response = await axios.get(`${WEATHER_API_BASE}/weather`, {
      params: {
        q: city,
        appid: API_KEY
      }
    });

    const data = response.data;
    return {
      name: data.name,
      country: data.sys.country,
      temp: kelvinToCelsius(data.main.temp),
      condition: data.weather[0].main,
      icon: data.weather[0].icon,
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 3.6) // Convert m/s to km/h
    };
  } catch (error) {
    console.error('Error fetching weather data:', error.message);
    return null;
  }
};

const fetchForecastFromAPI = async (city) => {
  try {
    const response = await axios.get(`${WEATHER_API_BASE}/forecast`, {
      params: {
        q: city,
        appid: API_KEY
      }
    });

    const dailyForecasts = response.data.list
      .filter((item, index) => index % 8 === 0) // Get one reading per day
      .slice(0, 5) // Get 5 days
      .map(item => ({
        date: new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        temp: kelvinToCelsius(item.main.temp),
        condition: item.weather[0].main,
        icon: iconUrl(item.weather[0].icon)
      }));

    return dailyForecasts;
  } catch (error) {
    console.error('Error fetching forecast data:', error.message);
    return null;
  }
};

const updateWeatherInDB = async (city, current, forecast) => {
  try {
    await LocationWeather.findOneAndUpdate(
      { city: normalizeCity(city) },
      { 
        city: normalizeCity(city),
        current,
        forecast,
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error('Error updating weather in DB:', error.message);
  }
};

const fetchCurrentFromMongo = async (city) => {
  const normalized = normalizeCity(city);
  if (!normalized) return null;
  const doc = await LocationWeather.findOne({ city: new RegExp(`^${normalized}$`, 'i') }).lean();
  if (!doc || !doc.current) return null;
  const current = doc.current;
  return {
    location: current.name || doc.city,
    temp: current.temp ?? null,
    condition: current.condition || '',
    icon: iconUrl(current.icon),
    humidity: current.humidity ?? null,
    windSpeed: current.windSpeed ?? null,
    source: 'mongo',
    query: doc.city
  };
};

const homelist = async (req, res) => {
  const city = (req.query.city || '').trim();
  const viewModel = {
    title: 'Weather Dashboard',
    featuredCities,
    query: city,
    weatherResult: null,
    error: null,
    info: null
  };

  if (!city) {
    return res.render('index', viewModel);
  }

  try {
    // Fetch real-time data from OpenWeather API
    const currentWeather = await fetchWeatherFromAPI(city);
    
    if (currentWeather) {
      // Store the data in MongoDB
      await updateWeatherInDB(city, currentWeather, null);

      viewModel.weatherResult = {
        location: currentWeather.name,
        temp: currentWeather.temp,
        condition: currentWeather.condition,
        icon: iconUrl(currentWeather.icon),
        humidity: currentWeather.humidity,
        windSpeed: currentWeather.windSpeed,
        source: 'api',
        query: city
      };
      return res.render('index', viewModel);
    }

    viewModel.error = `Could not find weather data for "${city}". Please check the city name.`;
    return res.render('index', viewModel);
  } catch (error) {
    viewModel.error = 'An error occurred while fetching weather data. Please try again.';
    return res.render('index', viewModel);
  }
};

const forecast = async (req, res) => {
  const city = (req.query.city || '').trim();
  if (!city) return res.render('forecast', { title: 'Forecast', error: 'Search 5 days forecast.' });

  try {
    // Fetch real-time forecast from OpenWeather API
    const forecastData = await fetchForecastFromAPI(city);
    const currentWeather = await fetchWeatherFromAPI(city);

    if (forecastData && currentWeather) {
      // Store the data in MongoDB
      await updateWeatherInDB(city, currentWeather, forecastData);

      res.render('forecast', {
        title: '5-Day Forecast',
        location: currentWeather.name,
        days: forecastData,
        source: 'api',
        query: city
      });
      return;
    }

    res.render('forecast', {
      title: '5-Day Forecast',
      error: `Could not find forecast data for "${city}". Please check the city name.`,
      query: city
    });
  } catch (error) {
    res.render('forecast', {
      title: '5-Day Forecast',
      error: 'An error occurred while fetching forecast data. Please try again.',
      query: city
    });
  }
};

// API: return forecast JSON useful for debugging or integrations
const apiForecast = async (req, res) => {
  const city = (req.query.city || '').trim();
  if (!city) return res.status(400).json({ error: 'city query parameter is required' });

  try {
    // Try live API first
    const forecastData = await fetchForecastFromAPI(city);
    const currentWeather = await fetchWeatherFromAPI(city);

    if (forecastData && currentWeather) {
      // Optionally cache
      await updateWeatherInDB(city, currentWeather, forecastData).catch(() => {});

      return res.json({
        source: 'api',
        location: currentWeather.name,
        current: currentWeather,
        days: forecastData
      });
    }

    // Fallback: try MongoDB
    const normalized = normalizeCity(city);
    const doc = normalized
      ? await LocationWeather.findOne({ city: new RegExp(`^${normalized}$`, 'i') }).lean()
      : null;

    if (doc) {
      return res.json({
        source: 'mongo',
        location: doc.current ? doc.current.name || doc.city : doc.city,
        current: doc.current || null,
        days: doc.forecast || []
      });
    }

    return res.status(404).json({ error: `No forecast found for "${city}"` });
  } catch (err) {
    console.error('apiForecast error:', err.message || err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// API: list all stored locations (read-only). Useful to verify which DB the app is writing to.
const apiLocations = async (req, res) => {
  try {
    const docs = await LocationWeather.find({}).lean();
    return res.json({ count: docs.length, locations: docs.map(d => ({ city: d.city, updatedAt: d.updatedAt || d.updated_at || null })) });
  } catch (err) {
    console.error('apiLocations error:', err.message || err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


module.exports = { homelist, forecast, apiForecast, apiLocations };

