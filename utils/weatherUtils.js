const { WeatherSummary, Alert } = require("../models/WeatherSummary");

const convertKelvinToCelsius = (temp) => {
  return temp - 273.15;
};

const updateWeatherSummary = async (newData) => {
  const today = new Date().setHours(0, 0, 0, 0);
  let summary = await WeatherSummary.findOne({ date: today });

  if (!summary) {
    summary = new WeatherSummary({
      date: today,
      hourlyData: [],
    });
  }

  summary.hourlyData.push(newData);

  const temperatures = summary.hourlyData.map((data) => data.temp);
  summary.averageTemperature =
    temperatures.reduce((sum, temp) => sum + temp, 0) / temperatures.length;
  summary.maxTemperature = Math.max(...temperatures);
  summary.minTemperature = Math.min(...temperatures);

  await summary.save();
};

const determineDominantCondition = (hourlyData) => {
  const conditionCount = hourlyData.reduce((acc, data) => {
    acc[data.main] = (acc[data.main] || 0) + 1;
    return acc;
  }, {});

  let dominantCondition = "";
  let maxCount = 0;
  for (const [condition, count] of Object.entries(conditionCount)) {
    if (count > maxCount) {
      dominantCondition = condition;
      maxCount = count;
    }
  }
  return dominantCondition;
};

const checkAlerts = async (weatherData) => {
  const alerts = await Alert.find();
  alerts.forEach((alert) => {
    if (weatherData.temp > alert.temperatureThreshold) {
      console.log(
        `Alert: Temperature exceeds ${alert.temperatureThreshold} degrees Celsius`
      );
    }
    if (weatherData.main === alert.conditionThreshold) {
      console.log(`Alert: Weather condition is ${alert.conditionThreshold}`);
    }
  });
};

module.exports = {
  convertKelvinToCelsius,
  updateWeatherSummary,
  checkAlerts,
};
