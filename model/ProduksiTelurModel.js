const {executeQuery} = require('../Db');

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
    return result.recordset[0];
  } catch (error) {
    console.error("Error updating ProduksiTelur:", error);
    throw error;
  }
}

async function deleteProduksiTelur(id) {
  try {
    const query = `
      DELETE FROM produksi_telur WHERE id = @id
    `;
    await executeQuery(query, [id], ["id"], false);
    return true;
  } catch (error) {
    console.error("Error deleting ProduksiTelur:", error);
    throw error;
  }
}



module.exports = {
  getAllProduksiTelur,
  getProduksiTelurById,
  createProduksiTelur,
  updateProduksiTelur,
  deleteProduksiTelur
};