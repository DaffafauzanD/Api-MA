const {executeQuery, executeTableValuedQuery} = require('../Db');


// async function getAllProduksiTelur() {
//   try {
//     const query = `
//       SELECT pt.*, tq.*
//       FROM produksi_telur pt
//       LEFT JOIN Telur_quartal tq ON pt.telur_ref_quartal = tq.Id_quartal
//     `;
//     const result = await executeQuery(query, [], [], false);
//     return result.recordset;
//   } catch (error) {
//     console.error("Error fetching data from ProduksiTelur:", error);
//     throw error;
//   }
// }

// async function getProduksiTelurById(id) {
//   try {
//     const query = `
//       SELECT pt.*, tq.* 
//       FROM produksi_telur pt 
//       LEFT JOIN Telur_quartal tq ON pt.telur_ref_quartal = tq.Id_quartal
//       WHERE id = @id
//     `;
//     const result = await executeQuery(query, [id], ["id"], false);
//     return result.recordset[0];
//   } catch (error) {
//     console.error("Error fetching data from ProduksiTelur:", error);
//     throw error;
//   }
// }

// async function createProduksiTelur(data) {
//   try {
//     const query = `
//       INSERT INTO produksi_telur 
//         (tanggal, telur_butir, telur_gram, telur_kg_hari, telur_kg_minggu, telur_kg_bulan, telur_kg_quartal, persen_produksi, created_at, update_at)
//       OUTPUT INSERTED.*
//       VALUES (GETDATE(), @telur_butir, @telur_gram, @telur_kg_hari, @telur_kg_minggu, @telur_kg_bulan, @telur_kg_quartal, @persen_produksi, GETDATE(), GETDATE())
//     `;
//     const values = [
//       data.telur_butir, data.telur_gram, data.telur_kg_hari,
//       data.telur_kg_minggu, data.telur_kg_bulan, data.telur_kg_quartal,
//       data.persen_produksi
//     ];
//     const paramNames = [
//       "telur_butir", "telur_gram", "telur_kg_hari",
//       "telur_kg_minggu", "telur_kg_bulan", "telur_kg_quartal",
//       "persen_produksi"
//     ];
//     const result = await executeQuery(query, values, paramNames, false);
//     return result.recordset[0];
//   } catch (error) {
//     console.error("Error creating ProduksiTelur:", error);
//     throw error;
//   }
// }

async function getAllProduksiTelur() {
  try {
    const query = `
      SELECT * FROM produksi_telur_hari
    `;
    const result = await executeQuery(query, [], [], false);
    return result.recordset;
  } catch (error) {
    console.error("Error fetching data from ProduksiTelur:", error);
    throw error;
  }
}

async function getProduksiTelurById(id) {
  try {
    const query = `
      SELECT * FROM produksi_telur_hari
      WHERE Id = @id
    `;
    const result = await executeQuery(query, [id], ["Id"], false);
    return result.recordset[0];
  } catch (error) {
    console.error("Error fetching data from ProduksiTelur:", error);
    throw error;
  }
}


async function processPendapatanData() {
  try {
    // Step 1: Get all monthly production data
    const monthlyData = await getAllMonthlyProduction();
    
    // Define egg price constant (could be moved to a configuration file)
    const HARGA_TELUR_PER_KG = 22000;
    
    // Step 2: Calculate monthly revenue for each month
    for (const monthData of monthlyData) {
      // Calculate monthly revenue
      const pendapatanBulan = monthData.total_telur_kg * HARGA_TELUR_PER_KG;
      
      // Check if this month already exists in pendapatan table
      const checkQuery = `
        SELECT id FROM pendapatan 
        WHERE produksi_id = @produksi_id
      `;
      const checkResult = await executeQuery(
        checkQuery, 
        [monthData.id], 
        ["produksi_id"], 
        false
      );
      
      if (checkResult.recordset.length > 0) {
        // Update existing record
        const updateQuery = `
          UPDATE pendapatan SET
            pendapatan_bulan = @pendapatan_bulan,
            update_at = GETDATE()
          WHERE produksi_id = @produksi_id
        `;
        
        await executeQuery(
          updateQuery, 
          [pendapatanBulan, monthData.id],
          ["pendapatan_bulan", "produksi_id"],
          false
        );
      } else {
        // Insert new record
        const insertQuery = `
          INSERT INTO pendapatan 
            (produksi_id, pendapatan_bulan, created_at, update_at)
          VALUES (@produksi_id, @pendapatan_bulan, GETDATE(), GETDATE())
        `;
        
        await executeQuery(
          insertQuery,
          [monthData.id, pendapatanBulan],
          ["produksi_id", "pendapatan_bulan"],
          false
        );
      }
    }
    
    // Step 3: Calculate and update quarterly revenue
    const quartalQuery = `
      UPDATE p
      SET p.pendapatan_quartal = (
        SELECT SUM(p2.pendapatan_bulan)
        FROM pendapatan p2
        JOIN produksi_telur_bulan ptb2 ON p2.produksi_id = ptb2.id
        WHERE YEAR(ptb2.tahun) = YEAR(ptb.tahun)
        AND ((MONTH(ptb2.bulan)-1) / 3) + 1 = ((MONTH(ptb.bulan)-1) / 3) + 1
      )
      FROM pendapatan p
      JOIN produksi_telur_bulan ptb ON p.produksi_id = ptb.id
    `;
    
    await executeQuery(quartalQuery, [], [], false);
    
    // Step 4: Calculate and update yearly revenue
    const yearlyQuery = `
      UPDATE p
      SET p.pendapatan_tahun = (
        SELECT SUM(p2.pendapatan_bulan)
        FROM pendapatan p2
        JOIN produksi_telur_bulan ptb2 ON p2.produksi_id = ptb2.id
        WHERE YEAR(ptb2.tahun) = YEAR(ptb.tahun)
      )
      FROM pendapatan p
      JOIN produksi_telur_bulan ptb ON p.produksi_id = ptb.id
    `;
    
    await executeQuery(yearlyQuery, [], [], false);
    
    // Return the current state of the pendapatan table
    const resultQuery = `
      SELECT p.*, ptb.bulan, ptb.tahun 
      FROM pendapatan p
      JOIN produksi_telur_bulan ptb ON p.produksi_id = ptb.id
      ORDER BY ptb.tahun, ptb.bulan
    `;
    const result = await executeQuery(resultQuery, [], [], false);
    return result.recordset;
  } catch (error) {
    console.error("Error processing pendapatan data:", error);
    throw error;
  }
}


async function createProduksiTelur(data) {
  try {
    const query = `
      INSERT INTO Produksi_telur_hari 
        (Tanggal,Telur_kg)
      OUTPUT INSERTED.*
      VALUES (@Tanggal, @Telur_kg)
    `;
    const values = [
      data.Tanggal, data.Telur_kg
    ];
    const paramNames = [
      "Tanggal", "Telur_kg"
    ];
    const result = await executeQuery(query, values, paramNames, false);

    await processMonthlyProduction();

    return result.recordset[0];
  } catch (error) {
    console.error("Error creating ProduksiTelur:", error);
    throw error;
  }
}

async function updateProduksiTelur(id, data) {
  try {
    const query = `
      UPDATE produksi_telur_hari SET
        Tanggal = @tanggal,
        Telur_kg = @Telur_kg
      OUTPUT INSERTED.*
      WHERE Id = @id
    `;
    const values = [
      data.Tanggal, data.Telur_kg, id
    ];
    const paramNames = [
      "tanggal", "Telur_kg", "id"
    ];
    const result = await executeQuery(query, values, paramNames, false);
    await processMonthlyProduction();
    return result.recordset[0];
  } catch (error) {
    console.error("Error updating ProduksiTelur:", error);
    throw error;
  }
}

async function deleteProduksiTelur(id) {
  try {
    const query = `
      DELETE FROM Produksi_telur_hari WHERE id = @id
    `;
    await executeQuery(query, [id], ["id"], false);
    await processMonthlyProduction();
    return true;
  } catch (error) {
    console.error("Error deleting ProduksiTelur:", error);
    throw error;
  }
}

async function processMonthlyProduction() {
  try {
    // First get all daily data
    const query = `
      SELECT 
        MONTH(Tanggal) as bulan, 
        YEAR(Tanggal) as tahun,
        SUM(Telur_kg) as total_telur_kg,
        COUNT(*) as jumlah_hari,
        AVG(Telur_kg) as rata_rata_harian
      FROM produksi_telur_hari 
      WHERE Tanggal IS NOT NULL
      GROUP BY MONTH(Tanggal), YEAR(Tanggal)
    `;
    
    const dailyData = await executeQuery(query, [], [], false);
    
    // For each month in the result, insert or update the monthly table
    for (const monthData of dailyData.recordset) {
      // Check if this month already exists
      const checkQuery = `
        SELECT id FROM produksi_telur_bulan 
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
          UPDATE produksi_telur_bulan SET
            total_telur_kg = @total_telur_kg,
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
          INSERT INTO produksi_telur_bulan 
            (bulan, tahun, total_telur_kg, jumlah_hari, rata_rata_harian, created_at, update_at)
          OUTPUT INSERTED.*
          VALUES (@bulan, @tahun, @total_telur_kg, @jumlah_hari, @rata_rata_harian, GETDATE(), GETDATE())
        `;
        
        await executeQuery(
          insertQuery,
          [monthData.bulan, monthData.tahun, monthData.total_telur_kg, 
           monthData.jumlah_hari, monthData.rata_rata_harian],
          ["bulan", "tahun", "total_telur_kg", "jumlah_hari", "rata_rata_harian"],
          false
        );
      }
    }
     await processPendapatanData();
    
    // Return the current state of the monthly table
    const resultQuery = `SELECT * FROM produksi_telur_bulan ORDER BY tahun, bulan`;
    const result = await executeQuery(resultQuery, [], [], false);
    return result.recordset;
  } catch (error) {
    console.error("Error processing monthly production data:", error);
    throw error;
  }
}

async function getAllMonthlyProduction() {
  try {
    const query = `SELECT * FROM produksi_telur_bulan ORDER BY tahun, bulan`;
    const result = await executeQuery(query, [], [], false);
    return result.recordset;
  } catch (error) {
    console.error("Error fetching monthly production data:", error);
    throw error;
  }
}

async function createBulkProduksiTelur(dataArray) {
  try {
    // Import the sql module directly
    const { sql, executeQuery } = require('../Db');
    
    // Connect using sql.connect() without passing config again
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
        request.input('Telur_kg', sql.Decimal(10, 2), parseFloat(data.Telur_kg));
        
        const query = `
          INSERT INTO Produksi_telur_hari (Tanggal, Telur_kg)
          OUTPUT INSERTED.*
          VALUES (@Tanggal, @Telur_kg)
        `;
        
        const result = await request.query(query);
        results.push(...result.recordset);
      }
      
      // Commit transaction
      await transaction.commit();
      
      // Process monthly data after all inserts
      await processMonthlyProduction();
      
      return results;
    } catch (error) {
      // If any error occurs, rollback the transaction
      await transaction.rollback();
      console.error("Transaction error:", error);
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



module.exports = {
  getAllProduksiTelur,
  processMonthlyProduction,
  getAllMonthlyProduction,
  getProduksiTelurById,
  createProduksiTelur,
  updateProduksiTelur,
  deleteProduksiTelur,
  createBulkProduksiTelur
};