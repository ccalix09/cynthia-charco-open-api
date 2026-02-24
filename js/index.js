fetch("https://api.open-meteo.com/v1/forecast?latitude=35.6895&longitude=139.6917&current_weather=true")
.then(response => response.json())
.then(data => {
    console.log("Weather data:", data);
    console.log("Temperature:", data.current_weather.temperature);
    console.log("Wind Speed:", data.current_weather.windspeed);
})
.catch(error => {
    console.error("Error fetching weather data:", error);
});