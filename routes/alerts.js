const express = require("express");
const router = express.Router();
const Alert = require("../models/WeatherSummary").Alert;

router.get("/alerts", async (req, res) => {
  const alerts = await Alert.find();
  res.json(alerts);
});

module.exports = router;
