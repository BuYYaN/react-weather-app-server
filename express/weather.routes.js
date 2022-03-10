const express = require("express");
const weatherControllers = require("./weather.controller");
const router = express.Router();

router.get("/info", weatherControllers.getWeatherInfo);
router.get("/history", weatherControllers.getWeatherHistory);

module.exports = router;
