const {executeQuery} = require('../Db');

async function getAllProduksiTelur() {
  try {
    const query = `
      SELECT pt.*, tq.*
      FROM produksi_telur pt
      LEFT JOIN Telur_quartal tq ON pt.telur_ref_quartal = tq.Id_quartal
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
      SELECT pt.*, tq.* 
      FROM produksi_telur pt 
      LEFT JOIN Telur_quartal tq ON pt.telur_ref_quartal = tq.Id_quartal
      WHERE id = @id
    `;
    const result = await executeQuery(query, [id], ["id"], false);
    return result.recordset[0];
  } catch (error) {
    console.error("Error fetching data from ProduksiTelur:", error);
    throw error;
  }
}

async function createProduksiTelur(data) {
  try {
    const query = `
      INSERT INTO produksi_telur 
        (tanggal, telur_butir, telur_gram, telur_kg_hari, telur_kg_minggu, telur_kg_bulan, telur_kg_quartal, persen_produksi, created_at, update_at)
      OUTPUT INSERTED.*
      VALUES (GETDATE(), @telur_butir, @telur_gram, @telur_kg_hari, @telur_kg_minggu, @telur_kg_bulan, @telur_kg_quartal, @persen_produksi, GETDATE(), GETDATE())
    `;
    const values = [
      data.telur_butir, data.telur_gram, data.telur_kg_hari,
      data.telur_kg_minggu, data.telur_kg_bulan, data.telur_kg_quartal,
      data.persen_produksi
    ];
    const paramNames = [
      "telur_butir", "telur_gram", "telur_kg_hari",
      "telur_kg_minggu", "telur_kg_bulan", "telur_kg_quartal",
      "persen_produksi"
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
      UPDATE produksi_telur SET
        tanggal = @tanggal,
        telur_butir = @telur_butir,
        telur_gram = @telur_gram,
        telur_kg_hari = @telur_kg_hari,
        telur_kg_minggu = @telur_kg_minggu,
        telur_kg_bulan = @telur_kg_bulan,
        telur_kg_quartal = @telur_kg_quartal,
        persen_produksi = @persen_produksi,
        update_at = @update_at
      OUTPUT INSERTED.*
      WHERE id = @id
    `;
    const values = [
      data.tanggal, data.telur_butir, data.telur_gram, data.telur_kg_hari,
      data.telur_kg_minggu, data.telur_kg_bulan, data.telur_kg_quartal,
      data.persen_produksi, data.update_at, id
    ];
    const paramNames = [
      "tanggal", "telur_butir", "telur_gram", "telur_kg_hari",
      "telur_kg_minggu", "telur_kg_bulan", "telur_kg_quartal",
      "persen_produksi", "update_at", "id"
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