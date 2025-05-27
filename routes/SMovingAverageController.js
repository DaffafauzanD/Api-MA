const express = require("express");
const router = express.Router();
const ForecastService = require("../services/SMovingAverageServices");
const ProduksiTelurModel = require("../model/ProduksiTelurModel");
const PakanModel = require("../model/PakanModel");

// Route for separate forecasts
router.get("/forecast/:table/:field/:window", async (req, res) => {
  try {
    const { table, field, window } = req.params;
    const windowInt = parseInt(window, 10);
    
    // Validate parameters
    if (isNaN(windowInt) || windowInt < 2) {
      return res.status(400).json({
        status: 400,
        message: "Window parameter must be a number greater than 1"
      });
    }
    
    let data;
    // Get appropriate data based on table parameter
    if (table === 'telur') {
      data = await ProduksiTelurModel.getAllMonthlyProduction();
    } else if (table === 'pakan') {
      data = await PakanModel.getAllPakanMonthly();
    } else {
      return res.status(400).json({
        status: 400,
        message: "Table parameter must be 'telur' or 'pakan'"
      });
    }
    
    // Sort data chronologically
    data.sort((a, b) => {
      if (a.tahun !== b.tahun) return a.tahun - b.tahun;
      return a.bulan - b.bulan;
    });
    
    // Generate forecast
    const result = ForecastService.forecastMonthlyProduction(data, field, windowInt);
    
    res.status(200).json({
      status: 200,
      message: "Forecast generated successfully",
      params: {
        table,
        field,
        window: windowInt
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

// Route for combined forecasts
router.get("/forecast/combined/:window", async (req, res) => {
  try {
    const windowInt = parseInt(req.params.window, 10);
    
    // Validate parameters
    if (isNaN(windowInt) || windowInt < 2) {
      return res.status(400).json({
        status: 400,
        message: "Window parameter must be a number greater than 1"
      });
    }
    
    // Get data from both tables
    const telurData = await ProduksiTelurModel.getAllMonthlyProduction();
    const pakanData = await PakanModel.getAllPakanMonthly();
    
    // Sort data chronologically
    telurData.sort((a, b) => {
      if (a.tahun !== b.tahun) return a.tahun - b.tahun;
      return a.bulan - b.bulan;
    });
    
    pakanData.sort((a, b) => {
      if (a.tahun !== b.tahun) return a.tahun - b.tahun;
      return a.bulan - b.bulan;
    });
    
    // Create datasets object
    const datasets = {
      telur: telurData,
      pakan: pakanData
    };
    
    // Define fields to forecast
    const fields = {
      telur: 'total_telur_kg',
      pakan: 'total_pakan_kg'
    };
    
    // Generate forecasts - note we're not providing periods here as the service doesn't use it
    const results = {};
    
    for (const key in datasets) {
      if (datasets.hasOwnProperty(key) && fields.hasOwnProperty(key)) {
        results[key] = ForecastService.forecastMonthlyProduction(
          datasets[key], 
          fields[key], 
          windowInt
        );
      }
    }
    
    res.status(200).json({
      status: 200,
      message: "Combined forecasts generated successfully",
      params: {
        window: windowInt
      },
      data: results
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Failed to generate combined forecasts",
      error: error.message
    });
  }
});

module.exports = router;