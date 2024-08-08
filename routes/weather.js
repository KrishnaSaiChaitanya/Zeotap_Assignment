const express = require("express");
const router = express.Router();
const axios = require("axios");
const { WeatherSummary, Alert } = require("../models/WeatherSummary");
const {
  convertKelvinToCelsius,
  updateWeatherSummary,
  checkAlerts,
} = require("../utils/weatherUtils");
const apiKey = require("../config").weatherApiKey;

const fetchWeatherData = async () => {
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=Bangalore&appid=${apiKey}`
    );
    const data = response.data;
    const weatherData = {
      main: data.weather[0].main,
      temp: convertKelvinToCelsius(data.main.temp),
      feels_like: convertKelvinToCelsius(data.main.feels_like),
      dt: data.dt,
    };
    await updateWeatherSummary(weatherData);
    await checkAlerts(weatherData);
    console.log("Weather details fetched at:", new Date().toLocaleString());
  } catch (error) {
    console.error("Error fetching weather data:", error);
  }
};

setInterval(fetchWeatherData, 120000);

router.get("/weather_summary", async (req, res) => {
  const today = new Date().setHours(0, 0, 0, 0);
  const summary = await WeatherSummary.findOne({ date: today });
  res.json(summary);
});

router.post("/update_alert_threshold", async (req, res) => {
  try {
    const { temperatureThreshold, conditionThreshold } = req.body;
    const alert = await Alert.findOneAndUpdate(
      {},
      { temperatureThreshold, conditionThreshold },
      { upsert: true, new: true }
    );

    res.json({ message: "Threshold Value saved Successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to save Threshold Value" });
  }
});

module.exports = router;
