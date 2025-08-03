# 🌦️ Weather Forecast – React Weather App

A minimalist web app for viewing current weather and 5-day forecasts for any city in the world.

## 🚀 Features

- Search weather by city name
- Displays current temperature, weather description, humidity, and wind speed
- 5-day forecast with icons and min/max temperatures
- Automatic location detection (geolocation)
- Dynamic background illustration based on weather conditions (sun, clouds, rain, night, etc.)
- Light/Dark mode
- Smooth animated UI (Framer Motion)

## 🛠️ Built With

- [React](https://reactjs.org/)
- [OpenWeatherMap API](https://openweathermap.org/api)
- [Framer Motion](https://www.framer.com/motion/) (animations)
- CSS3

## 📦 Getting Started Locally

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/weather-app.git
   cd weather-app
   ```

2. npm install
3. npm run dev
4. Open in browser:
   http://localhost:5173

## 🔑 API Key Setup

This app requires a free API key from [OpenWeatherMap](https://openweathermap.org/api).

1. Register at [OpenWeatherMap](https://home.openweathermap.org/users/sign_up) and create an API key.
2. Create a `.env` file in your project root.
3. Add:
   VITE_WEATHER_API_KEY=your_api_key_here
4. Restart the dev server.
5. The app will automatically use your key.

**Note:** Never commit your real API key to a public repository.
