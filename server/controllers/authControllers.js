import { getPool } from "../config/connectDB.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { generateAccessToken } from "../utils/generateToken.js";

export const register = async (req, res) => {
  try {
    const { username, email, password_hash, role_id = 5 } = req.body;

    // Validate required fields
    if (!username || !email || !password_hash) {
      return res.status(400).json({
        message: "Username, email, and password are required",
      });
    }

    // ✅ Call connectDB to get pool
    const pool = await getPool();

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
        message: "Username or email already exists",
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
      message: "User created successfully",
    });
  } catch (err) {
    console.error("Registration error:", err);

    return res.status(500).json({
      message: "Registration failed",
      error: err.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate required fields
    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required",
      });
    }

    const pool = getPool();

    // Find user by username
    const query = `
        SELECT user_id, username, email, password_hash, role_id, is_active
        FROM Users
        WHERE username = @username
        `;

    const result = await pool
      .request()
      .input("username", username)
      .query(query);

    if (result.recordset.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = result.recordset[0];

    // Check if the account is active
    if (!user.is_active) {
      return res.status(403).json({ message: "Account is deactiavated" });
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate token
    const accessToken = generateAccessToken(user);

    res.status(200).json({
      message: "Login successful",
      user: {
        user_id: user.user_id,
        username: user.username,
      },
      accessToken,
    });
  } catch (err) {
    console.error("Login error", err);
    return res.status(500).json({
      message: "Login failed",
      error: err.message,
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const pool = await getPool();

    const query = `
    SELECT user_id, username, email, first_name, last_name, phone, role_id, is_active, created_at
    FROM Users
    WHERE user_id = @user_id
    `;

    const result = await pool
      .request()
      .input("user_id", req.user.user_id)
      .query(query);
    // console.log("result: ", result); // Test the returned result

    if (result.recordset.Length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    res.status(200).json({
      user: result.recordset[0],
    });
  } catch (err) {
    console.error("Get user error", err);
    return res.status(500).json({
      message: "Failed to get the user",
      error: err.message,
    });
  }
};
