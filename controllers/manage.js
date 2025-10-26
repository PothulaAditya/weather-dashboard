const LocationWeather = require('../models/locationWeather');

const list = async (req, res) => {
  try {
    const locations = await LocationWeather.find().sort({ city: 1 }).lean();
    res.render('manage', {
      title: 'Manage Weather Data',
      locations,
      message: req.query.message || null,
      error: req.query.error || null
    });
  } catch (err) {
    res.render('manage', {
      title: 'Manage Weather Data',
      locations: [],
      message: null,
      error: 'Unable to load weather records right now.'
    });
  }
};

const update = async (req, res) => {
  const { city } = req.body;
  if (!city) {
    return res.redirect('/manage?error=Missing+city+identifier');
  }

  const filter = { city: new RegExp(`^${city}$`, 'i') };
  const updateDoc = {};

  const { name, temp, condition, icon, humidity, windSpeed, country } = req.body;

  if (name) updateDoc['current.name'] = name.trim();
  if (condition) updateDoc['current.condition'] = condition.trim();
  if (icon) updateDoc['current.icon'] = icon.trim();
  if (country) updateDoc['current.country'] = country.trim();

  if (temp !== undefined && temp !== '') {
    const parsed = Number(temp);
    if (!Number.isNaN(parsed)) {
      updateDoc['current.temp'] = parsed;
    }
  }
  if (humidity !== undefined && humidity !== '') {
    const parsed = Number(humidity);
    if (!Number.isNaN(parsed)) {
      updateDoc['current.humidity'] = parsed;
    }
  }
  if (windSpeed !== undefined && windSpeed !== '') {
    const parsed = Number(windSpeed);
    if (!Number.isNaN(parsed)) {
      updateDoc['current.windSpeed'] = parsed;
    }
  }

  if (Object.keys(updateDoc).length === 0) {
    return res.redirect('/manage?error=Provide+at+least+one+field+to+update');
  }

  try {
    const result = await LocationWeather.updateOne(filter, { $set: updateDoc });
    if (result.matchedCount === 0) {
      return res.redirect('/manage?error=No+matching+city+found');
    }
    return res.redirect('/manage?message=Weather+details+updated');
  } catch (err) {
    return res.redirect('/manage?error=Update+failed');
  }
};

const remove = async (req, res) => {
  const { city } = req.body;
  if (!city) {
    return res.redirect('/manage?error=Missing+city+identifier');
  }
  const filter = { city: new RegExp(`^${city}$`, 'i') };
  try {
    const result = await LocationWeather.deleteOne(filter);
    if (result.deletedCount === 0) {
      return res.redirect('/manage?error=No+matching+city+found');
    }
    return res.redirect('/manage?message=Weather+entry+deleted');
  } catch (err) {
    return res.redirect('/manage?error=Delete+failed');
  }
};

module.exports = { list, update, remove };
