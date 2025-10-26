# Weather Dashboard

Simple Node.js + Express + Pug app that shows current weather and a 5-day forecast using OpenWeatherMap.

Prerequisites
- Node 18+ / npm

Setup
1. In project folder, install dependencies:

   npm install

2. (Optional but recommended) Have a MongoDB instance ready. You can use MongoDB Atlas or a local installation. Copy the connection string (e.g. `mongodb://localhost:27017/weather_dashboard`).

3. Create an OpenWeatherMap API key (https://openweathermap.org/).

You can provide the API key either via environment variable or a `.env` file.

Option A — environment variable (PowerShell):

   $env:OPENWEATHERMAP_API_KEY = 'your_api_key_here'

Option B — .env file (recommended for local dev):

   Copy `.env.example` to `.env` and edit the key:

   OPENWEATHERMAP_API_KEY=your_api_key_here
   MONGODB_URI=mongodb://localhost:27017/weather_dashboard

4. Start the app:

   npm start

4. Open http://localhost:3000

Notes
- The app expects the environment variable OPENWEATHERMAP_API_KEY to be set.
- If `MONGODB_URI` is set, the server will attempt to connect to MongoDB on startup. On success you will see a “MongoDB connected” message in the console; on failure the process exits with an error so you can fix the URI or credentials.
- Public assets load bootstap and jquery via CDN wrappers saved in `public/` to keep the repo small.
