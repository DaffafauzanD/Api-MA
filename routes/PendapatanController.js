const express = require("express");
const router = express.Router();
const Pendapatan  = require("../services/PendapatanServices");

router.get("/Pendapatan", async (req, res) => {
  try {
    const data = await Pendapatan.getAllPendapatan();
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

module.exports = router;