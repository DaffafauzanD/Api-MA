const {executeQuery} = require('../Db');

async function getAllPendapatan() {
  try {
    const query = `
      SELECT * FROM pendapatan
    `;
    const result = await executeQuery(query, [], [], false);
    return result.recordset;
  } catch (error) {
    console.error("Error fetching data from Pendapatan:", error);
    throw error;
  }
}

module.exports = {
  getAllPendapatan,
};