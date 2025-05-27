const { executeQuery } = require('../Db');
const bcrypt = require('bcrypt'); // npm install bcrypt

async function findUserByUsername(username) {
  try {
    const query = `
      SELECT * FROM user WHERE username = @username
    `;
    const result = await executeQuery(query, [username], ["username"], false);
    return result.recordset[0];
  } catch (error) {
    console.error("Error finding user by username:", error);
    throw error;
  }
}

async function findUserById(id) {
  try {
    const query = `
      SELECT id, username, created_at FROM users WHERE id = @id
    `;
    const result = await executeQuery(query, [id], ["id"], false);
    return result.recordset[0];
  } catch (error) {
    console.error("Error finding user by id:", error);
    throw error;
  }
}

async function createUser(userData) {
  try {
    // Hash the password before storing
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    
    const query = `
      INSERT INTO users (username, password, created_at, is_admin)
      OUTPUT INSERTED.*
      VALUES (@username, @password, GETDATE(), @is_admin)
    `;
    
    const values = [
      userData.username, 
      hashedPassword, 
      userData.is_admin || 0, // Default to non-admin
    ];
    
    const paramNames = ["username", "password", "is_admin"];
    
    const result = await executeQuery(query, values, paramNames, false);
    
    // Don't return the password
    const { password, ...userWithoutPassword } = result.recordset[0];
    return userWithoutPassword;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

module.exports = {
  findUserByUsername,
  findUserById,
  createUser
};