const express = require("express");
const router = express.Router();
const Produksitelur  = require("../services/ProduksiTelurService");

router.get("/Produksi/telur", async (req, res) => {
  try {
    const rawData = await Produksitelur.getAllProduksiTelur();
    
    // Format the data to make it more readable with nested objects
    const formattedData = rawData.map(item => {
      // Extract Telur_quartal fields
      const {
        Id_quartal,
        Telur_kg_quartal,
        // Add other telur_quartal fields here if any
        ...produksiFields
      } = item;
      
      // Return restructured object
      return {
        ...produksiFields, // Keep all produksi_telur fields
        quartal: {
          id: Id_quartal,
          telur_kg_quartal: Telur_kg_quartal,
        }
      };
    });
    
    res.status(200).json({
      status: 200,
      message: "Data retrieved successfully",
      data: formattedData,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Failed to retrieve data",
      error: error.message,
    });
  }
});

router.post("/Produksi/telur/add", async (req, res) => {
  try {
    const now = new Date();
    const data = await Produksitelur.createProduksiTelur({
      ...req.body,
      created_at: now,
      update_at: now,
    });
    res.status(201).json({
      status: 201,
      message: "Data created successfully",
      data,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Failed to create data",
      error: error.message,
    });
  }
});

router.put("/Produksi/telur/edit/:id", async (req, res) => {
  try {
    const now = new Date();
    const data = await Produksitelur.updateProduksiTelur(req.params.id, {
      ...req.body,
      update_at: now,
    });
    if (data) {
      res.status(200).json({
        status: 200,
        message: "Data updated successfully",
        data,
      });
    } else {
      res.status(404).json({
        status: 404,
        message: "Data not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Failed to update data",
      error: error.message,
    });
  }
});

router.delete("/Produksi/telur/delete/:id", async (req, res) => {
  try {
    await Produksitelur.deleteProduksiTelur(req.params.id);
    res.status(200).json({
      status: 200,
      message: "Data deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Failed to delete data",
      error: error.message,
    });
  }
});


router.get("/Produksi/telur/find/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const data = await Produksitelur.getProduksiTelurById(id);
    if (data) {
      // Format the single record response
      const {
        Id_quartal,
        Telur_kg_quartal,
        ...produksiFields
      } = data;
      
      const formattedData = {
        ...produksiFields,
        quartal: {
          id: Id_quartal,
          telur_kg_quartal: Telur_kg_quartal,
        }
      };
      
      res.status(200).json({
        status: 200,
        message: "Data retrieved successfully",
        data: formattedData,
      });
    } else {
      res.status(404).json({
        status: 404,
        message: "Data not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Failed to retrieve data",
      error: error.message,
    });
  }
});



module.exports = router;