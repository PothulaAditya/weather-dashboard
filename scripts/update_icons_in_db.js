require('dotenv').config();
const mongoose = require('mongoose');
const LocationWeather = require('../models/locationWeather');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/weather_dashboard';
const iconUrl = (code) => (code && !code.startsWith('http') ? `https://openweathermap.org/img/wn/${code}@2x.png` : code || '');

async function run() {
  try {
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    const docs = await LocationWeather.find({}).exec();
    console.log(`Found ${docs.length} documents`);

    let modified = 0;
    for (const doc of docs) {
      let changed = false;

      if (doc.current && doc.current.icon) {
        const newIcon = iconUrl(doc.current.icon);
        if (newIcon !== doc.current.icon) {
          doc.current.icon = newIcon;
          changed = true;
        }
      }

      if (Array.isArray(doc.forecast) && doc.forecast.length) {
        for (let i = 0; i < doc.forecast.length; i++) {
          const f = doc.forecast[i];
          if (f && f.icon) {
            const newIcon = iconUrl(f.icon);
            if (newIcon !== f.icon) {
              doc.forecast[i].icon = newIcon;
              changed = true;
            }
          }
        }
      }

      if (changed) {
        await doc.save();
        modified++;
        console.log(`Updated document for city='${doc.city}'`);
      }
    }

    console.log(`Migration complete. Documents modified: ${modified}`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    try { await mongoose.disconnect(); } catch (e) {}
    process.exit(1);
  }
}

run();
