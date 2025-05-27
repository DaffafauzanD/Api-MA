const sql = require("mssql");

const config = {
  server: "Localhost",
  database: "MA_Databases",
  user: "qq",
  password: "0895YEET!@#$4215",
  options: {
    trustedConnection: true,
    enableArithAbort: true,
    trustServerCertificate: true,
  },
};

// Normal queries to db handled here
async function executeQuery(
  query,
  values = [],
  paramNames = [],
  isStoredProcedure = true,
  outputParamName = null
) {
  try {
    const pool = await sql.connect(config);
    const request = pool.request();

    if (values && paramNames) {
      for (let i = 0; i < values.length; i++) {
        request.input(paramNames[i], values[i]);
      }
    }

    // Handle output parameter
    if (outputParamName) {
      request.output(outputParamName, sql.Int);
    }

    // console.log("VALUES ", values);
    // console.log("PARAM ", paramNames);
    // console.log("QUERY " , query);
    // console.log("REQUEST ", request.parameters);
    values.forEach((val, index) => {
      if (typeof val === "undefined") {
        console.error(`Undefined value found for ${paramNames[index]}`);
      }
    });

    let result;
    if (isStoredProcedure) {
      result = await request.execute(query);
    } else {
      result = await request.batch(query);
    }

    if (outputParamName) {
      result = {
        ...result,
        [outputParamName]: request.parameters[outputParamName].value,
      };
    }

    return result;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// Bulk queries handled here
async function executeTableValuedQuery(
  query,
  table,
  paramNames = [],
  isStoredProcedure = true,
  outputParamName = null
) {
  try {
    const pool = await sql.connect(config);
    const request = pool.request();

    // Setting the table-valued parameter
    if (table instanceof sql.Table) {
      request.input(paramNames, table);
    }

    // Handle output parameter
    if (outputParamName) {
      request.output(outputParamName, sql.Int);
    }

    let result;
    if (isStoredProcedure) {
      result = await request.execute(query);
    } else {
      result = await request.batch(query);
    }

    if (outputParamName) {
      result = {
        ...result,
        [outputParamName]: request.parameters[outputParamName].value,
      };
    }

    return result;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

module.exports = {
  connect: () => sql.connect(config),
  sql,
  executeQuery,
  executeTableValuedQuery,
};

// Update your connection configuration

// const mysql = require('mysql2/promise');
// const pool = mysql.createPool({
//   host: 'localhost', // Change from 'Laragon.Mysql' to 'localhost'
//   user: 'root',
//   password: '',
//   database: 'ma_databases',
//   port: 3306,
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0
// });

// async function executeQuery(query, values = [], paramNames = [], isStoredProcedure = false, outputParamName = null) {
//   try {
//     // For MySQL, we use ? placeholders directly in the query
//     // No need for named parameters like in MSSQL
//     let sqlQuery = query;

//     // If it's a stored procedure, format it appropriately
//     if (isStoredProcedure) {
//       sqlQuery = `CALL ${query}(${values.map(() => '?').join(',')})`;
//     }

//     // Log for debugging
//     values.forEach((val, index) => {
//       if (typeof val === "undefined") {
//         console.error(`Undefined value found for parameter at index ${index}`);
//       }
//     });

//     // Execute the query
//     const [rows, fields] = await pool.execute(sqlQuery, values);

//     return {
//       recordset: rows,
//       rowsAffected: rows.affectedRows || rows.length
//     };
//   } catch (error) {
//     console.error(error);
//     throw error;
//   }
// }

// // This is a simpler function for MySQL since it doesn't have table-valued parameters
// // like SQL Server does. You would need to modify your approach.
// async function executeTableValuedQuery(query, tableData, paramName, isStoredProcedure = false) {
//   try {
//     // For bulk inserts in MySQL, you'd typically use:
//     // INSERT INTO table (col1, col2) VALUES (?, ?), (?, ?)...

//     // This is a simplified version - you'd need to adapt to your specific needs
//     const connection = await pool.getConnection();

//     try {
//       // Start transaction for bulk operations
//       await connection.beginTransaction();

//       // Transform your table data into MySQL format
//       let result;
//       if (Array.isArray(tableData.rows)) {
//         // Assuming tableData.rows contains the rows to insert
//         const placeholders = tableData.rows.map(() =>
//           `(${tableData.columns.map(() => '?').join(',')})`
//         ).join(',');

//         const flatValues = tableData.rows.flatMap(row =>
//           tableData.columns.map(col => row[col])
//         );

//         const sql = `INSERT INTO ${paramName} (${tableData.columns.join(',')}) VALUES ${placeholders}`;

//         [result] = await connection.execute(sql, flatValues);
//       }

//       await connection.commit();
//       return { recordset: [], rowsAffected: result ? result.affectedRows : 0 };
//     } catch (err) {
//       await connection.rollback();
//       throw err;
//     } finally {
//       connection.release();
//     }
//   } catch (error) {
//     console.error(error);
//     throw error;
//   }
// }

// // Simple function to check connection
// async function testConnection() {
//   try {
//     const connection = await pool.getConnection();
//     console.log('Connected to the database.');
//     connection.release();
//     return true;
//   } catch (error) {
//     console.error('Database connection error:', error);
//     return false;
//   }
// }

// module.exports = {
//   connect: testConnection,
//   pool,
//   executeQuery,
//   executeTableValuedQuery
// };
