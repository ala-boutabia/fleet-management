import { getPool } from "../config/connectDB.js";

// Get all users(admin only - role_id = 1)
export const getAllUsers = async (req, res) => {
  try {
    const role_id = req.user.role_id;
    console.log("role id: ", role_id);

    // Block if role is NOT 1 AND NOT 2
    if (role_id !== 1 && role_id !== 2) {
      return res.status(403).json({
        message: "You are not authorised to access this route",
      });
    }

    const pool = getPool();

    const query = `
      SELECT user_id, username, email, first_name, last_name, role_id, is_active, created_at
      FROM Users
      WHERE deleted_at IS NULL
    `;

    const result = await pool.request().query(query);

    res.status(200).json({
      count: result.recordset.length,
      users: result.recordset,
    });
  } catch (err) {
    console.error("Get users error", err);
    res.status(500).json({
      message: "Failed to get users",
      error: err.message,
    });
  }
};

