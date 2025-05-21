const express = require("express");
const router = express.Router();
const Produksitelur  = require("../services/ProduksiTelurService");

router.get("/Produksi/telur", async (req, res) => {
  try {
    const data = await Produksitelur.getAllProduksiTelur();
    res.status(200).json({
      status: 200,
      message: "Data retrieved successfully",
      data,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Failed to retrieve data",
      error: error.message,
    });
  }
});

router.get("/Produksi/telur/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const data = await Produksitelur.getProduksiTelurById(id);
    if (data) {
      res.status(200).json({
        status: 200,
        message: "Data retrieved successfully",
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
      message: "Failed to retrieve data",
      error: error.message,
    });
  }
});



module.exports = router;