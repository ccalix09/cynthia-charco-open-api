// Get references to elements from the HTML file
const cityInput = document.getElementById("cityInput"); // Input field for city name
const searchBtn = document.getElementById("searchBtn"); // Button to trigger weather search
const weatherContainer = document.getElementById("weatherContainer"); // Container for weather
const weatherInfo = document.getElementById("weatherInfo"); // Weather details
const weatherIcon = document.getElementById("weatherIcon"); // Weather emoji
const forecastTitle = document.getElementById("forecastTitle"); // Title for forecast 
const forecast = document.getElementById("forecast"); // Container for 7-day forecast 

// Add click event listener to the search button
searchBtn.addEventListener("click", getWeather); // When the search button is clicked, the getWeather function is called to fetch and show weather data

cityInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") getWeather(); // If "Enter", fetch weather
});

// Object mapping weather codes (from Open-Meteo API) to emojis/weather code to emoji
const weatherEmojis = {
  0: "☀️", // Clear sky
  1: "⛅",
  2: "⛅",
  3: "☁️", // Cloudy
  45: "🌫️", // Fog
  48: "🌫️",
  51: "🌦️", // Drizzle
  53: "🌦️",
  55: "🌦️",
  56: "🌦️",
  57: "🌦️",
  61: "🌧", // Rain
  63: "🌧",
  65: "🌧",
  66: "🌧",
  67: "🌧",
  80: "🌧",
  81: "🌧",
  82: "🌧",
  71: "❄️", // Snow
  73: "❄️",
  75: "❄️",
  77: "❄️",
  95: "⛈️", // Thunderstorm
  96: "⛈️",
  99: "⛈️",
};
// Function that returns the emoji for a given weather
function getWeatherEmoji(code) {
  return weatherEmojis[code] || "\u2754"; // Return emoji if found, otherwise return a question mark
}
// Array for week names - used for 7-day forecast
const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
// Main function to fetch and display weather data
async function getWeather() {
  const city = cityInput.value.trim(); // Get city name from input and remove extra spaces

  // If user didn't enter a city - please enter city name appears
  if (!city) {
    weatherContainer.style.display = "block"; // Make the weather container visible
    forecastTitle.style.display = "none"; // Hide forecast title
    weatherInfo.textContent = "Please enter a city name."; // Show msg
    weatherIcon.textContent = "\u2754"; // Display question mark
    return;
  }
  // Show containers while fetching data
  weatherContainer.style.display = "block";
  forecastTitle.style.display = "block";
  // Show loading state
  weatherInfo.textContent = "Loading...";
  weatherIcon.textContent = "\u231B"; // Hourglass emoji
  forecast.textContent = ""; // Clear previous forecast
  try {
    // Fetch location info
    const locationRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`,
    );

    const locationData = await locationRes.json();
    // If city not found
    if (!locationData.results || locationData.results.length === 0) {
      weatherInfo.textContent = "City not found.";
      weatherIcon.textContent = "\u2754";
      return;
    }
    // Take latitude, longitude, and name of city
    const { latitude, longitude, name } = locationData.results[0];
    // Fetch weather data from Open-Meteo API
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,wind_speed_10m_max&timezone=auto`,
    );

    const weatherData = await weatherRes.json();
    const current = weatherData.current; // Current weather
    const daily = weatherData.daily; // 7-day forecast

    // Current high/low temperatures
    const todayMax = weatherData.daily.temperature_2m_max[0];
    const todayMin = weatherData.daily.temperature_2m_min[0];

    // Update current weather display
    weatherIcon.textContent = getWeatherEmoji(current.weather_code); // Emoji for current weather
    weatherInfo.textContent = `City: ${name}
    Temperature: ${current.temperature_2m}\u00B0C
    High: ${todayMax}\u00B0C
    Low: ${todayMin}\u00B0C
    Wind Speed: ${current.wind_speed_10m} km/h
    Humidity: 💧 ${current.relative_humidity_2m}%`;

    // 7-day forecast
    forecast.textContent = ""; // Clear previous forecast
    for (let i = 0; i < daily.time.length; i++) {
      const dateObj = new Date(daily.time[i] + "T00:00:00"); // Convert date string to Date object
      let dayName = "N/A";
      let dayNumber = "--";
      if (!isNaN(dateObj)) {
        dayName = weekdayNames[dateObj.getDay()]; // Get day of the week 
        dayNumber = String(dateObj.getDate()).padStart(2, "0"); // Get day of the month
      } else {
        console.warn("Invalid date for forecast:", daily.time[i]);
      }
      const maxTemp = daily.temperature_2m_max[i];
      const minTemp = daily.temperature_2m_min[i];
      const wind = daily.wind_speed_10m_max[i];
      const code = daily.weather_code[i];

      const emoji = getWeatherEmoji(code); // Get emoji for the day's weather 

      // Creates container for each day (forecast)
      const dayDiv = document.createElement("div");
      dayDiv.classList.add("forecast-day");

      // Date Element
      const dateEl = document.createElement("div");
      dateEl.textContent = `${dayName} ${dayNumber}`;
      dateEl.classList.add("forecast-date"); 
      dayDiv.appendChild(dateEl);

      // Emoji Element
      const emojiEl = document.createElement("div");
      emojiEl.textContent = emoji;
      emojiEl.style.fontSize = "5rem";
      dayDiv.appendChild(emojiEl);

      // High Temperature Element
      const highEl = document.createElement("p");
      highEl.textContent = `High: ${maxTemp}\u00B0C`;
      dayDiv.appendChild(highEl);

      // Low Temperature Element
      const lowEl = document.createElement("p");
      lowEl.textContent = `Low: ${minTemp}\u00B0C`;
      dayDiv.appendChild(lowEl);

      // Wind Speed Element
      const windEl = document.createElement("p");
      windEl.textContent = `Wind: ${wind} km/h`;
      dayDiv.appendChild(windEl);
      // Append the day's forecast to the forecast container
      forecast.appendChild(dayDiv);
    }
  } catch (error) {
    // Handle any errors during fetch or processing
    weatherInfo.textContent = "Error getting weather data. Please try again.";
    weatherIcon.textContent = "\u2754";
    console.error(error);
  }
}
