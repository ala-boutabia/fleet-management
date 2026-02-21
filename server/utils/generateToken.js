import jwt from "jsonwebtoken";

export const generateAccessToken = (user) => {
  try {
    return jwt.sign(
      { user_id: user.user_id, username: user.username, role_id: user.role_id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || "7d" }
    );
  } catch (error) {
    console.error("Error generating access token:", error);
    throw error; // rethrow so the controller can handle it
  }
};

