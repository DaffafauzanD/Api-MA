const { executeQuery } = require('../Db');
const bcrypt = require('bcrypt'); // npm install bcrypt

async function findUserByUsername(username) {
  try {
    const query = `
      SELECT id, username, password_hash, created_at, is_admin, email, fullname
    FROM MA_Databases.dbo.[user] WHERE username = @username`;
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
      SELECT id, username, password_hash, created_at, is_admin, email, fullname
    FROM MA_Databases.dbo.[user] WHERE id = @id;

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
      INSERT INTO MA_Databases.dbo.[user]
        (username, password_hash, created_at, is_admin, email, fullname)
        OUTPUT INSERTED.*
        VALUES(@username, @password, GETDATE(), @is_admin, @email, @fullname);
    `;
    
    const values = [
        userData.username, 
        hashedPassword, 
        userData.is_admin || 1, // Default to non-admin
        userData.email, // Optional email
        userData.fullname// Optional fullname
    ];
    
    const paramNames = ["username", "password", "is_admin", "email", "fullname"];
    
    const result = await executeQuery(query, values, paramNames, false);
    
    // Don't return the password
    const { password, ...userWithoutPassword } = result.recordset[0];
    return userWithoutPassword;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

async function changePassword(userId, newPassword) {
  try {
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    const query = `
      UPDATE MA_Databases.dbo.[user]
      SET password_hash = @newPassword
      OUTPUT INSERTED.id, INSERTED.username, INSERTED.created_at, INSERTED.is_admin, INSERTED.email, INSERTED.fullname
      WHERE id = @userId
    `;
    
    const result = await executeQuery(query, [hashedPassword, userId], ["newPassword", "userId"], false);
    
    if (result.recordset.length === 0) {
      throw new Error("User not found");
    }
    
    return result.recordset[0];
  } catch (error) {
    console.error("Error changing password:", error);
    throw error;
  }
}

module.exports = {
  findUserByUsername,
  findUserById,
  createUser,
  changePassword
};