const LocationWeather = require('../models/locationWeather');

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

  const mongoCurrent = await fetchCurrentFromMongo(city);
  if (mongoCurrent) {
    viewModel.weatherResult = mongoCurrent;
    return res.render('index', viewModel);
  }

  viewModel.error = `No stored weather data found for "${city}". Add it in MongoDB first.`;
  return res.render('index', viewModel);
};

const forecast = async (req, res) => {
  const city = (req.query.city || '').trim();
  if (!city) return res.render('forecast', { title: 'Forecast', error: 'Search 5 days forecast.' });

  const normalized = normalizeCity(city);
  const doc = normalized
    ? await LocationWeather.findOne({ city: new RegExp(`^${normalized}$`, 'i') }).lean()
    : null;
  if (doc && Array.isArray(doc.forecast) && doc.forecast.length) {
    const days = doc.forecast.slice(0, 5).map(day => ({
      date: day.date,
      temp: day.temp,
      condition: day.condition,
      icon: iconUrl(day.icon)
    }));
    res.render('forecast', {
      title: '5-Day Forecast',
      location: doc.current ? doc.current.name || doc.city : doc.city,
      days,
      source: 'mongo',
      query: doc.city
    });
    return;
  }

  res.render('forecast', {
    title: '5-Day Forecast',
    error: normalized
      ? `No stored forecast found for "${city}". Add it in MongoDB first.`
      : 'Search 5 days forecast.',
    query: city
  });
};

module.exports = { homelist, forecast };
