const { executeQuery } = require('../Db');

async function getAllPakan() {
  try {
    const query = `
      SELECT * FROM pakan
      ORDER BY Id
    `;
    const result = await executeQuery(query, [], [], false);
    return result.recordset;
  } catch (error) {
    console.error("Error fetching data from pakan_konsumsi:", error);
    throw error;
  }
}

// Add other CRUD operations as needed

module.exports = {
  getAllPakan,
};