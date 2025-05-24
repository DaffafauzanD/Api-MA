const { executeQuery } = require('../Db');

async function getAllPakan() {
  try {
    const query = `
      SELECT * FROM Pakan_hari
      ORDER BY Id
    `;
    const result = await executeQuery(query, [], [], false);
    return result.recordset;
  } catch (error) {
    console.error("Error fetching data from pakan_konsumsi:", error);
    throw error;
  }
}

async function createProduksiPakan(data) {
  try {
    const query = `
      INSERT INTO Produksi_Pakan_hari 
        (Tanggal,Pakan_kg)
      OUTPUT INSERTED.*
      VALUES (@Tanggal, @Pakan_kg)
    `;
    const values = [
      data.Tanggal, data.Pakan_kg
    ];
    const paramNames = [
      "Tanggal", "Pakan_kg"
    ];
    const result = await executeQuery(query, values, paramNames, false);

    await processMonthlyProductionPakan();

    return result.recordset[0];
  } catch (error) {
    console.error("Error creating ProduksiPakan:", error);
    throw error;
  }
}

async function processMonthlyProductionPakan() {
  try {
    // First get all daily data
    const query = `
      SELECT 
        MONTH(Tanggal) as bulan, 
        YEAR(Tanggal) as tahun,
        SUM(Telur_kg) as total_Pakan_kg,
        COUNT(*) as jumlah_hari,
        AVG(Telur_kg) as rata_rata_harian
      FROM produksi_Pakan_hari 
      WHERE Tanggal IS NOT NULL
      GROUP BY MONTH(Tanggal), YEAR(Tanggal)
    `;
    
    const dailyData = await executeQuery(query, [], [], false);
    
    // For each month in the result, insert or update the monthly table
    for (const monthData of dailyData.recordset) {
      // Check if this month already exists
      const checkQuery = `
        SELECT id FROM produksi_Pakan_bulan 
        WHERE bulan = @bulan AND tahun = @tahun
      `;
      const checkResult = await executeQuery(
        checkQuery, 
        [monthData.bulan, monthData.tahun], 
        ["bulan", "tahun"], 
        false
      );
      
      if (checkResult.recordset.length > 0) {
        // Update existing record
        const updateQuery = `
          UPDATE produksi_Pakan_bulan SET
            total_telur_kg = @total_Pakan_kg,
            jumlah_hari = @jumlah_hari,
            rata_rata_harian = @rata_rata_harian,
            update_at = GETDATE()
          OUTPUT INSERTED.*
          WHERE bulan = @bulan AND tahun = @tahun
        `;
        
        await executeQuery(
          updateQuery, 
          [monthData.total_telur_kg, monthData.jumlah_hari, monthData.rata_rata_harian, 
           monthData.bulan, monthData.tahun],
          ["total_telur_kg", "jumlah_hari", "rata_rata_harian", "bulan", "tahun"],
          false
        );
      } else {
        // Insert new record
        const insertQuery = `
          INSERT INTO produksi_Pakan_bulan 
            (bulan, tahun, total_Pakan_kg, jumlah_hari, rata_rata_harian, created_at, update_at)
          OUTPUT INSERTED.*
          VALUES (@bulan, @tahun, @total_telur_kg, @jumlah_hari, @rata_rata_harian, GETDATE(), GETDATE())
        `;
        
        await executeQuery(
          insertQuery,
          [monthData.bulan, monthData.tahun, monthData.total_Pakan_kg, 
           monthData.jumlah_hari, monthData.rata_rata_harian],
          ["bulan", "tahun", "total_Pakan_kg", "jumlah_hari", "rata_rata_harian"],
          false
        );
      }
    }
    
    // Return the current state of the monthly table
    const resultQuery = `SELECT * FROM produksi_telur_bulan ORDER BY tahun, bulan`;
    const result = await executeQuery(resultQuery, [], [], false);
    return result.recordset;
  } catch (error) {
    console.error("Error processing monthly production data:", error);
    throw error;
  }
}


async function getAllPakanMonthly() {
  try {
    const query = `
      SELECT * FROM produksi_Pakan_bulan
      ORDER BY tahun, bulan
    `;
    const result = await executeQuery(query, [], [], false);
    return result.recordset;
  } catch (error) {
    console.error("Error fetching data from produksi_pakan_bulan:", error);
    throw error;
  }
}


// Add other CRUD operations as needed

module.exports = {
  getAllPakan,
  getAllPakanMonthly,
  processMonthlyProductionPakan
};