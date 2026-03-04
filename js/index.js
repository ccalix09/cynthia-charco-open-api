const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const weatherContainer = document.getElementById("weatherContainer");
const weatherInfo = document.getElementById("weatherInfo");
const weatherIcon = document.getElementById("weatherIcon");

searchBtn.addEventListener("click", getWeather);

cityInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") getWeather();
});

const weatherEmojis = {
    0: "☀️",
    1: "⛅",
    2: "⛅",
    3: "☁️",
    45: "🌫️",
    48: "🌫️",
    51: "🌦️",
    53: "🌦️",
    55: "🌦️",
    56: "🌦️",
    57: "🌦️",
    61: "🌧",
    63: "🌧",
    65: "🌧",
    66: "🌧",
    67: "🌧",
    80: "🌧",
    81: "🌧",
    82: "🌧",
    71: "❄️",
    73: "❄️",
    75: "❄️",
    77: "❄️",
    95: "⛈️",
    96: "⛈️",
    99: "⛈️",
};
function getWeatherEmoji(code) {
    return weatherEmojis[code] || "\u2754";
}
function getWeather() {
  const city = cityInput.value.trim();
  weatherContainer.style.display = "block";

  weatherIcon.textContent = "\u231B";
  weatherInfo.textContent = "Loading...";

  if (!city) {
    weatherInfo.textContent = "Please enter a city name.";
    weatherIcon.textContent = "\u2754";
    return;
  }

  fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`)
    .then((response) => response.json())
    .then((locationData) => {
      if (!locationData.results) {
        weatherInfo.textContent = "City not found.";
        weatherIcon.textContent = "\u2754";
        return;
      }

      const { latitude, longitude, name } = locationData.results[0];

      return fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m,relative_humidity_2m,weathercode`,
      )
        .then((response) => response.json())
        .then((weatherData) => {
          const temp = weatherData.current.temperature_2m;
          const wind = weatherData.current.wind_speed_10m;
          const humidity = weatherData.current.relative_humidity_2m;
          const code = weatherData.current.weathercode;

          const emoji = getWeatherEmoji(code);

          weatherIcon.textContent = emoji;
          weatherInfo.textContent = `City: ${name}\nTemperature: ${temp}\u00B0C\nWind Speed: ${wind} km/h\nHumidity: ${humidity}%`;
        });
    })
    .catch((error) => {
      weatherInfo.textContent = "Error getting weather data. Please try again.";
      weatherIcon.textContent = "\u2754";
      console.error(error);
    });
}
