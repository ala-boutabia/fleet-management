import { connectDB } from "../config/connectDB.js";
import bcrypt from "bcrypt";

export const register = async (req, res) => {
  try {
    const { username, email, password_hash, role_id = 5 } = req.body;

    // Validate required fields
    if (!username || !email || !password_hash) {
      return res.status(400).json({ 
        message: "Username, email, and password are required" 
      });
    }

    // ✅ Call connectDB to get pool
    const pool = await connectDB();

    // Check if user already exists
    const checkQuery = `
      SELECT * FROM Users
      WHERE username = @username OR email = @email
    `;
    const checkUser = await pool
      .request()
      .input("username", username)
      .input("email", email)
      .query(checkQuery);

    if (checkUser.recordset.length > 0) {
      return res.status(400).json({ 
        message: "Username or email already exists" 
      });
    }

    const hashedPassword = await bcrypt.hash(password_hash, 10);

    const insertQuery = `
      INSERT INTO Users (username, email, password_hash, role_id)
      VALUES (@username, @email, @password_hash, @role_id)
    `;

    await pool
      .request()
      .input("username", username)
      .input("email", email)
      .input("password_hash", hashedPassword)
      .input("role_id", role_id)
      .query(insertQuery);

    res.status(201).json({ 
      message: "User created successfully" 
    });
    
  } catch (err) {
    console.error("Registration error:", err);
    
    return res.status(500).json({ 
      message: "Registration failed", 
      error: err.message 
    });
  }
};
