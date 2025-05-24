const express = require("express");
const router = express.Router();
const ForecastService = require("../services/PakanServices");
const produksi_telur = require("../model/ProduksiTelurModel");
const PakanModel = require("../model/PakanModel"); // Assuming you'll create this

//#region forecast



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

    const feedDataTelur = await produksi_telur.getAllMonthlyProduction();
    
    // Sort data chronologically
    feedData.sort((a, b) => a.no - b.no);
    feedDataTelur.sort((a, b) => a.no - b.no);
    
    // Generate forecast
    const resultpakan = ForecastService.forecastFeedConsumption(feedData, field, window, periods);
    const resultpakanTelur = ForecastService.forecastFeedConsumption(feedDataTelur, field, window, periods);
    res.status(200).json({
      status: 200,
      message: "Forecast generated successfully",
      params: {
        window: window,
        periods: periods,
        field: field
      },
      data_pakan: resultpakan,
      data_pakan_telur: resultpakanTelur

    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Failed to generate forecast",
      error: error.message
    });
  }
});

//#endregion forecast

router.get("/pakan", async (req, res) => {
  try {
    const data = await PakanModel.getAllPakan();
    res.status(200).json({
      status: 200,
      message: "Data retrieved successfully",
      data: data
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Failed to retrieve data",
      error: error.message
    });
  }
});

router.get("/pakan/bulan", async (req, res) => {
  try {
    const data = await PakanModel.getAllPakanMonthly();
    res.status(200).json({
      status: 200,
      message: "Data retrieved successfully",
      data: data
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Failed to retrieve data",
      error: error.message
    });
  }
});

router.post("/pakan/add", async (req, res) => {
  try {
    const data = await PakanModel.createProduksiPakan(req.body);
    res.status(200).json({
      status: 200,
      message: "Data processed successfully",
      data: data
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Failed to process data",
      error: error.message
    });
  }
});

router.get("/pakan/process", async (req, res) => {
  try {
    const data = await PakanModel.processMonthlyProductionPakan();
    res.status(200).json({
      status: 200,
      message: "Monthly production processed successfully",
      data: data
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Failed to process monthly production",
      error: error.message
    });
  }
});

router.put("/pakan/update/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const data = await PakanModel.updateProduksiPakan(id, req.body);
    res.status(200).json({
      status: 200,
      message: "Data updated successfully",
      data: data
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Failed to update data",
      error: error.message
    });
  }
});

router.delete("/pakan/delete/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const data = await PakanModel.deleteProduksiPakan(id);
    res.status(200).json({
      status: 200,
      message: "Data deleted successfully",
      data: data
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Failed to delete data",
      error: error.message
    });
  }
});

router.post("/Produksi/Pakan/add/bulk", async (req, res) => {
  try {
    // Check if the request body is an array
    if (!Array.isArray(req.body)) {
      return res.status(400).json({
        status: 400,
        message: "Input must be an array of records",
      });
    }
    
    // Validate each item in the array
    for (let i = 0; i < req.body.length; i++) {
      const item = req.body[i];
      if (!item.Tanggal || !item.Pakan_kg) {
        return res.status(400).json({
          status: 400,
          message: `Record at index ${i} is missing required fields (Tanggal or Pakan_kg)`,
        });
      }
    }
    
    const data = await PakanModel.createBulkProduksiPakan(req.body);
    res.status(201).json({
      status: 201,
      message: `Successfully created ${data.length} records`,
      data,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Failed to create bulk data",
      error: error.message,
    });
  }
});



module.exports = router;