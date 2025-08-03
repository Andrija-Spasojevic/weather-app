import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./App.css";

function App() {
  const [city, setCity] = useState("Kraljevo");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("weather-dark-mode");
    return saved ? JSON.parse(saved) : false;
  });
  const [bgFade, setBgFade] = useState(false);

  // const API_KEY = "your_api_key_here";
  const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
  const lang = "hr";
  console.log("API KEY:", API_KEY);

  function getDailyForecast(list) {
    if (!list) return [];
    const days = {};
    list.forEach((item) => {
      const date = new Date(item.dt_txt);
      const day = date.toLocaleDateString("sr-RS", {
        weekday: "short",
        day: "numeric",
        month: "numeric",
      });
      if (!days[day]) days[day] = [];
      days[day].push(item);
    });
    return Object.entries(days).map(([day, arr]) => {
      const temp_max = Math.max(...arr.map((el) => el.main.temp_max));
      const temp_min = Math.min(...arr.map((el) => el.main.temp_min));
      const icons = arr.map((el) => el.weather[0].icon);
      const icon = icons[Math.floor(icons.length / 2)];
      const descs = arr.map((el) => el.weather[0].description);
      const desc = descs[Math.floor(descs.length / 2)];
      return { day, temp_max, temp_min, icon, desc };
    });
  }

  const fetchForecast = async (cityName) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&units=metric&lang=${lang}&appid=${API_KEY}`
      );
      if (!response.ok) throw new Error("Greška kod prognoze.");
      const data = await response.json();
      setForecast(data);
    } catch {
      setForecast(null);
    }
  };

  function getBgClass(weather) {
    if (!weather) return "bg-default";
    const main = weather.weather[0].main.toLowerCase();
    const dt = weather.dt;
    const sunrise = weather.sys.sunrise;
    const sunset = weather.sys.sunset;
    if (dt < sunrise || dt > sunset) return "bg-night";
    if (main.includes("clear")) return "bg-clear";
    if (main.includes("cloud")) return "bg-clouds";
    if (main.includes("rain") || main.includes("drizzle")) return "bg-rain";
    if (main.includes("snow")) return "bg-snow";
    if (main.includes("thunder")) return "bg-thunder";
    return "bg-default";
  }

  useEffect(() => {
    localStorage.setItem("weather-dark-mode", JSON.stringify(darkMode));
  }, [darkMode]);

  // Fade pozadine kad se menja vreme (loading)
  useEffect(() => {
    if (loading) {
      setBgFade(true);
    } else {
      const timeout = setTimeout(() => setBgFade(false), 180); // promeni na 300ms za još duže fade
      return () => clearTimeout(timeout);
    }
  }, [loading]);

  // Ključ za animirani prikaz mora biti unique za svaki novi podatak!
  const weatherKey = weather ? `${weather.id}-${weather.dt}` : "empty";

  // Poziv API za trenutno vreme + forecast
  const fetchWeather = async (e, newCity = null) => {
    e && e.preventDefault();
    const searchCity = newCity || city;
    if (!searchCity.trim()) return;
    setLoading(true);
    setError("");
    setWeather(null);
    setForecast(null);

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${searchCity}&units=metric&lang=${lang}&appid=${API_KEY}`
      );
      if (!response.ok) throw new Error("Grad nije pronađen.");
      const data = await response.json();
      setWeather(data);
      fetchForecast(data.name);
    } catch (err) {
      setError(err.message || "Greška prilikom učitavanja.");
    } finally {
      setLoading(false);
    }
  };

  // Geolokacija
  const fetchWeatherByCoords = async (lat, lon) => {
    setLoading(true);
    setError("");
    setWeather(null);
    setForecast(null);

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=${lang}&appid=${API_KEY}`
      );
      if (!response.ok) throw new Error("Neuspešno preuzimanje podataka.");
      const data = await response.json();
      setWeather(data);
      setCity(data.name);
      fetchForecast(data.name);
    } catch (err) {
      setError("Greška sa geolokacijom.");
    } finally {
      setLoading(false);
    }
  };

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      setError("Geolokacija nije podržana.");
      return;
    }
    setError("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchWeatherByCoords(latitude, longitude);
      },
      () => {
        setError("Nije moguće pristupiti lokaciji.");
      }
    );
  };

  useEffect(() => {
    fetchWeather();
    // eslint-disable-next-line
  }, []);

  return (
    <div
      className={
        `app-bg ${getBgClass(weather)}${darkMode ? " dark" : ""}` +
        (bgFade ? " bg-fade" : "")
      }
    >
      <motion.div
        className={`weather-card${darkMode ? " dark" : ""}`}
        initial={{ scale: 0.97, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.45, type: "spring" }}
      >
        <button
          className="toggle-mode"
          onClick={() => setDarkMode((prev) => !prev)}
          aria-label="Toggle dark mode"
        >
          {darkMode ? "🌞" : "🌙"}
        </button>
        <h1>Vremenska prognoza</h1>
        <form onSubmit={fetchWeather}>
          <input
            type="text"
            placeholder="Unesi grad..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="city-input"
          />
          <button type="submit" className="search-btn">
            Prikaži
          </button>
          <button
            type="button"
            className="geo-btn"
            onClick={handleGeolocation}
            title="Moja lokacija"
          >
            📍
          </button>
        </form>
        {loading && <p className="info-text">Učitavanje...</p>}
        {error && <p className="error-text">{error}</p>}

        {/* ANIMATED WEATHER INFO */}
        <AnimatePresence mode="wait">
          {!loading && weather && (
            <motion.div
              key={weatherKey}
              className="weather-info"
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -40, scale: 0.97 }}
              transition={{ duration: 0.6, type: "spring" }}
            >
              <h2>
                {weather.name}, {weather.sys.country}
              </h2>
              <img
                src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                alt={weather.weather[0].description}
                className="weather-icon"
              />
              <p className="temp">{Math.round(weather.main.temp)}°C</p>
              <p className="desc">{weather.weather[0].description}</p>
              <div className="extra-info">
                <p>Vlažnost: {weather.main.humidity}%</p>
                <p>Vetar: {weather.wind.speed} m/s</p>
              </div>
              {forecast && (
                <div className="forecast-section">
                  <h3>Prognoza (5 dana):</h3>
                  <div className="forecast-list">
                    <AnimatePresence>
                      {getDailyForecast(forecast.list).map((f, i) => (
                        <motion.div
                          key={f.day + "-" + f.icon}
                          className="forecast-day"
                          initial={{ opacity: 0, y: 20, scale: 0.94 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 20, scale: 0.97 }}
                          transition={{ delay: 0.08 * i, duration: 0.29 }}
                        >
                          <div>{f.day}</div>
                          <img
                            src={`https://openweathermap.org/img/wn/${f.icon}@2x.png`}
                            alt={f.desc}
                          />
                          <div>
                            <span style={{ fontWeight: 700 }}>
                              {Math.round(f.temp_max)}°C
                            </span>
                            <span style={{ color: "#6b9cb8" }}>
                              {" "}
                              / {Math.round(f.temp_min)}°C
                            </span>
                          </div>
                          <div style={{ fontSize: 12 }}>{f.desc}</div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default App;
