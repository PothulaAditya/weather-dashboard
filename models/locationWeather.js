const mongoose = require('mongoose');

const forecastSchema = new mongoose.Schema(
  {
    date: String,
    temp: Number,
    condition: String,
    icon: String
  },
  { _id: false }
);

const currentSchema = new mongoose.Schema(
  {
    name: String,
    country: String,
    temp: Number,
    condition: String,
    icon: String,
    humidity: Number,
    windSpeed: Number
  },
  { _id: false }
);

const locationWeatherSchema = new mongoose.Schema(
  {
    city: { type: String, required: true, unique: true },
    current: currentSchema,
    forecast: [forecastSchema]
  },
  { collection: 'locations', timestamps: true }
);

locationWeatherSchema.index({ city: 1 });

module.exports = mongoose.model('LocationWeather', locationWeatherSchema);
