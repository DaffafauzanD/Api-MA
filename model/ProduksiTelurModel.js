const {executeQuery} = require('../Db');

async function getAllProduksiTelur() {
  try {
    const query = `
      SELECT * FROM produksi_telur
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
      SELECT * FROM produksi_telur WHERE id = @id
    `;
    const result = await executeQuery(query, [id], ["id"], false);
    return result.recordset[0];
  } catch (error) {
    console.error("Error fetching data from ProduksiTelur:", error);
    throw error;
  }
}



module.exports = {
  getAllProduksiTelur,
    getProduksiTelurById,
};