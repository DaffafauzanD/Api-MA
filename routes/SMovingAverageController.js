const express = require("express");
const router = express.Router();
const ForecastService = require("../services/SMovingAverageServices");
const ProduksiTelurModel = require("../model/ProduksiTelurModel");
const PakanModel = require("../model/PakanModel");

// Route for separate forecasts
router.get("/forecast/:table/:field/:window/:periods", async (req, res) => {
  try {
    const { table, field, window, periods } = req.params;
    const windowInt = parseInt(window, 10);
    const periodsInt = parseInt(periods, 10);
    
    // Validate parameters
    if (isNaN(windowInt) || windowInt < 2) {
      return res.status(400).json({
        status: 400,
        message: "Window parameter must be a number greater than 1"
      });
    }
    
    if (isNaN(periodsInt) || periodsInt < 1) {
      return res.status(400).json({
        status: 400,
        message: "Periods parameter must be a positive number"
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
    const result = ForecastService.forecastMonthlyProduction(data, field, windowInt, periodsInt);
    
    res.status(200).json({
      status: 200,
      message: "Forecast generated successfully",
      params: {
        table,
        field,
        window: windowInt,
        periods: periodsInt
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
router.get("/forecast/combined/:window/:periods", async (req, res) => {
  try {
    const windowInt = parseInt(req.params.window, 10);
    const periodsInt = parseInt(req.params.periods, 10);
    
    // Validate parameters
    if (isNaN(windowInt) || windowInt < 2) {
      return res.status(400).json({
        status: 400,
        message: "Window parameter must be a number greater than 1"
      });
    }
    
    if (isNaN(periodsInt) || periodsInt < 1) {
      return res.status(400).json({
        status: 400,
        message: "Periods parameter must be a positive number"
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
    
    // Generate combined forecasts
    const results = ForecastService.forecastMultipleDatasets(
      datasets, 
      fields, 
      windowInt, 
      periodsInt
    );
    
    res.status(200).json({
      status: 200,
      message: "Combined forecasts generated successfully",
      params: {
        window: windowInt,
        periods: periodsInt
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