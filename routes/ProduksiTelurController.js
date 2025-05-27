const express = require("express");
const router = express.Router();
const Produksitelur  = require("../services/ProduksiTelurService");
const {authMiddleware, adminOnly} = require("../middleware/auth/MiddlewareUser");

// router.get("/Produksi/telur", async (req, res) => {
//   try {
//     const rawData = await Produksitelur.getAllProduksiTelur();
    
//     // Format the data to make it more readable with nested objects
//     const formattedData = rawData.map(item => {
//       // Extract Telur_quartal fields
//       const {
//         Id_quartal,
//         Telur_kg_quartal,
//         // Add other telur_quartal fields here if any
//         ...produksiFields
//       } = item;
      
//       // Return restructured object
//       return {
//         ...produksiFields, // Keep all produksi_telur fields
//         quartal: {
//           id: Id_quartal,
//           telur_kg_quartal: Telur_kg_quartal,
//         }
//       };
//     });
    
//     res.status(200).json({
//       status: 200,
//       message: "Data retrieved successfully",
//       data: formattedData,
//     });
//   } catch (error) {
//     res.status(500).json({
//       status: 500,
//       message: "Failed to retrieve data",
//       error: error.message,
//     });
//   }
// });

router.get("/Produksi/telur", authMiddleware,  adminOnly, async (req, res) => {
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

router.post("/Produksi/telur/add", async (req, res) => {
  try {
    const data = await Produksitelur.createProduksiTelur({
      ...req.body,
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
    const data = await Produksitelur.updateProduksiTelur(req.params.id, {
      ...req.body,
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

router.get("/Produksi/telur/bulan", async (req, res) => {
  try {
    const data = await Produksitelur.getAllMonthlyProduction();
    res.status(200).json({
      status: 200,
      message: "Monthly production data retrieved successfully",
      data,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Failed to retrieve monthly production data",
      error: error.message,
    });
  }
});

// Process and update monthly data
router.post("/Produksi/telur/bulan/process", async (req, res) => {
  try {
    const data = await Produksitelur.processMonthlyProduction();
    res.status(200).json({
      status: 200,
      message: "Monthly production data processed successfully",
      data,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Failed to process monthly production data",
      error: error.message,
    });
  }
});

router.post("/Produksi/telur/add/bulk", async (req, res) => {
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
      if (!item.Tanggal || !item.Telur_kg) {
        return res.status(400).json({
          status: 400,
          message: `Record at index ${i} is missing required fields (Tanggal or Telur_kg)`,
        });
      }
    }
    
    const data = await Produksitelur.createBulkProduksiTelur(req.body);
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

// router.get("/Produksi/telur/find/:id", async (req, res) => {
//   const id = req.params.id;
//   try {
//     const data = await Produksitelur.getProduksiTelurById(id);
//     if (data) {
//       // Format the single record response
//       const {
//         Id_quartal,
//         Telur_kg_quartal,
//         ...produksiFields
//       } = data;
      
//       const formattedData = {
//         ...produksiFields,
//         quartal: {
//           id: Id_quartal,
//           telur_kg_quartal: Telur_kg_quartal,
//         }
//       };
      
//       res.status(200).json({
//         status: 200,
//         message: "Data retrieved successfully",
//         data: formattedData,
//       });
//     } else {
//       res.status(404).json({
//         status: 404,
//         message: "Data not found",
//       });
//     }
//   } catch (error) {
//     res.status(500).json({
//       status: 500,
//       message: "Failed to retrieve data",
//       error: error.message,
//     });
//   }
// });



module.exports = router;