require('dotenv').config();
const mongoose = require('mongoose');
const LocationWeather = require('../models/locationWeather');

// Source (local) and target (Atlas) connection strings
const LOCAL_URI = 'mongodb://localhost:27017/weather_dashboard';
const ATLAS_URI = process.env.MONGODB_URI;

if (!ATLAS_URI || !ATLAS_URI.includes('mongodb+srv')) {
  console.error('Error: MONGODB_URI must be set to an Atlas connection string (mongodb+srv://...)');
  process.exit(1);
}

async function migrateData() {
  let sourceDb, targetDb;

  try {
    // Connect to local MongoDB
    console.log('Connecting to source database (local)...');
    sourceDb = await mongoose.createConnection(LOCAL_URI);
    const SourceLocation = sourceDb.model('LocationWeather', LocationWeather.schema);
    
    // Connect to Atlas
    console.log('Connecting to target database (Atlas)...');
    targetDb = await mongoose.createConnection(ATLAS_URI);
    const TargetLocation = targetDb.model('LocationWeather', LocationWeather.schema);

    // Read all documents from local
    console.log('Reading documents from local MongoDB...');
    const docs = await SourceLocation.find({}).lean();
    console.log(`Found ${docs.length} documents locally`);

    if (docs.length === 0) {
      console.log('No documents to migrate. Try searching for some cities first!');
      process.exit(0);
    }

    // Insert into Atlas
    console.log('Migrating to Atlas...');
    let migrated = 0;
    for (const doc of docs) {
      const { _id, ...docWithoutId } = doc;
      await TargetLocation.findOneAndUpdate(
        { city: doc.city },
        docWithoutId,
        { upsert: true, new: true }
      );
      migrated++;
      console.log(`Migrated ${doc.city} (${migrated}/${docs.length})`);
    }

    console.log('\nMigration complete!');
    console.log(`- Documents processed: ${docs.length}`);
    console.log(`- Documents migrated: ${migrated}`);
    console.log('\nNext steps:');
    console.log('1. Verify data in Atlas (check the collection in MongoDB Atlas UI)');
    console.log('2. Update your local .env to use only the Atlas URI');
    console.log('3. Restart your application');

  } catch (error) {
    console.error('Migration failed:', error.message || error);
    process.exit(1);
  } finally {
    if (sourceDb) await sourceDb.close();
    if (targetDb) await targetDb.close();
    process.exit(0);
  }
}

migrateData();