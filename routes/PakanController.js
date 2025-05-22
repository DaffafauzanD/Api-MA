const express = require("express");
const router = express.Router();
const ForecastService = require("../services/PakanServices");
const PakanModel = require("../model/PakanModel"); // Assuming you'll create this

router.get("/forecast/feed/:field/:window/:periods", async (req, res) => {
  try {
    const field = req.params.field;  // e.g., 'pakan_bulan'
    const window = parseInt(req.params.window, 10);
    const periods = parseInt(req.params.periods, 10);
    
    // Validate parameters
    if (isNaN(window) || window < 2) {
      return res.status(400).json({
        status: 400,
        message: "Window parameter must be a number greater than 1"
      });
    }
    
    if (isNaN(periods) || periods < 1) {
      return res.status(400).json({
        status: 400,
        message: "Periods parameter must be a positive number"
      });
    }
    
    // Get feed consumption data
    const feedData = await PakanModel.getAllPakan();
    
    // Sort data chronologically
    feedData.sort((a, b) => a.no - b.no);
    
    // Generate forecast
    const result = ForecastService.forecastFeedConsumption(feedData, field, window, periods);
    
    res.status(200).json({
      status: 200,
      message: "Forecast generated successfully",
      params: {
        window: window,
        periods: periods,
        field: field
      },
      data: result
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Failed to generate forecast",
      error: error.message
    });
  }
});

module.exports = router;