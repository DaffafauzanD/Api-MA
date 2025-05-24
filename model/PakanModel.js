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
      INSERT INTO Pakan_hari 
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

async function updateProduksiPakan(id, data) {
  try {
    const query = `
      UPDATE Pakan_hari SET
        Tanggal = @tanggal,
        Pakan_kg = @Pakan_kg
      OUTPUT INSERTED.*
      WHERE Id = @id
    `;
    const values = [
      data.Tanggal, data.Pakan_kg, id
    ];
    const paramNames = [
      "tanggal", "Pakan_kg", "id"
    ];
    const result = await executeQuery(query, values, paramNames, false);
    await processMonthlyProductionPakan();
    return result.recordset[0];
  } catch (error) {
    console.error("Error updating ProduksiPakan:", error);
    throw error;
  }
}

async function deleteProduksiPakan(id) {
  try {
    const query = `
      DELETE FROM Pakan_hari WHERE id = @id
    `;
    await executeQuery(query, [id], ["id"], false);
    await processMonthlyProductionPakan();
    return true;
  } catch (error) {
    console.error("Error deleting ProduksiPakan:", error);
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
        SUM(Pakan_kg) as total_Pakan_kg,
        COUNT(*) as jumlah_hari,
        AVG(Pakan_kg) as rata_rata_harian
      FROM Pakan_hari 
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
            total_Pakan_kg = @total_Pakan_kg,
            jumlah_hari = @jumlah_hari,
            rata_rata_harian = @rata_rata_harian,
            update_at = GETDATE()
          OUTPUT INSERTED.*
          WHERE bulan = @bulan AND tahun = @tahun
        `;
        
        await executeQuery(
          updateQuery, 
          [monthData.total_Pakan_kg, monthData.jumlah_hari, monthData.rata_rata_harian, 
           monthData.bulan, monthData.tahun],
          ["total_Pakan_kg", "jumlah_hari", "rata_rata_harian", "bulan", "tahun"],
          false
        );
      } else {
        // Insert new record
        const insertQuery = `
          INSERT INTO produksi_Pakan_bulan 
            (bulan, tahun, total_Pakan_kg, jumlah_hari, rata_rata_harian, created_at, update_at)
          OUTPUT INSERTED.*
          VALUES (@bulan, @tahun, @total_Pakan_kg, @jumlah_hari, @rata_rata_harian, GETDATE(), GETDATE())
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
    const resultQuery = `SELECT * FROM produksi_Pakan_bulan ORDER BY tahun, bulan`;
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

async function createBulkProduksiPakan(dataArray) {
  try {
    // Import sql directly from the Db module without destructuring
    const sql = require('../Db').sql;
    
    // Create a new pool connection
    const pool = await sql.connect();
    const transaction = new sql.Transaction(pool);
    
    try {
      // Start transaction
      await transaction.begin();
      
      const results = [];
      
      // Process each item in the array
      for (const data of dataArray) {
        const request = new sql.Request(transaction);
        request.input('Tanggal', sql.Date, new Date(data.Tanggal));
        request.input('Pakan_kg', sql.Decimal(10, 2), parseFloat(data.Pakan_kg));
        
        const query = `
          INSERT INTO Pakan_hari (Tanggal, Pakan_kg)
          OUTPUT INSERTED.*
          VALUES (@Tanggal, @Pakan_kg)
        `;
        
        const result = await request.query(query);
        results.push(...result.recordset);
      }
      
      // Commit transaction
      await transaction.commit();
      
      // Process monthly data after all inserts
      await processMonthlyProductionPakan();
      
      return results;
    } catch (error) {
      // If any error occurs, rollback the transaction
      if (transaction._aborted) {
        console.error("Transaction was aborted");
      } else {
        await transaction.rollback();
        console.error("Transaction rolled back due to error:", error);
      }
      throw error;
    } finally {
      // Make sure to close the pool to prevent connection leaks
      pool.close();
    }
  } catch (error) {
    console.error("Error in bulk insert:", error);
    throw error;
  }
}


// Add other CRUD operations as needed

module.exports = {
  getAllPakan,
  getAllPakanMonthly,
  processMonthlyProductionPakan,
  createProduksiPakan,
  updateProduksiPakan,
  deleteProduksiPakan,
  createBulkProduksiPakan
};