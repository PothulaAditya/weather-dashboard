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

Deploying to Render.com
----------------------

1. Create a free account at https://render.com and connect your GitHub account.
2. In Render, create a new "Web Service" and select this repository (`PothulaAditya/weather-dashboard`).
   - Branch: `main`
   - Build Command: `npm install`
   - Start Command: `npm start`
3. In the Render service settings add two environment variables (Settings → Environment):
   - `OPENWEATHERMAP_API_KEY` = your OpenWeather API key
   - `MONGODB_URI` = your MongoDB connection string (use MongoDB Atlas or a running MongoDB instance)
4. Save and deploy. Render will build and start the app. The public URL will be displayed on the service page (e.g. `https://weather-dashboard.onrender.com`).

You can also use the included `render.yaml` (already in the repo) to create the service using Render's dashboard "Create from YAML" flow — note the deployment still needs the secret environment variables set through Render.

Notes on production
- Ensure `MONGODB_URI` points to a production-ready MongoDB (MongoDB Atlas recommended).
- Keep your OpenWeather API key secret — set it only in Render (do not commit it).
- If you prefer a managed DB on Render, create a managed MongoDB instance there and paste the URI into `MONGODB_URI`.
