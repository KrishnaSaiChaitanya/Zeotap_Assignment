const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const weatherSummarySchema = new Schema({
  date: { type: Date, required: true },
  averageTemperature: Number,
  maxTemperature: Number,
  minTemperature: Number,
  dominantCondition: String,
  hourlyData: [
    {
      main: String,
      temp: Number,
      feels_like: Number,
      dt: Number,
    },
  ],
});

const alertSchema = new Schema({
  temperatureThreshold: Number,
  conditionThreshold: String,
});

module.exports = {
  WeatherSummary: mongoose.model("WeatherSummary", weatherSummarySchema),
  Alert: mongoose.model("Alert", alertSchema),
};
