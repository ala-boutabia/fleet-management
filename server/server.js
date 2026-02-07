import express from "express";
import dotenv from "dotenv";
dotenv.config();

import { getPool } from "./config/connectDB.js";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await getPool(); // ensure DB is ready before accepting traffic
    app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
  } catch (err) {
    console.error("Failed to start server (DB connection error):", err);
    process.exit(1);
  }
}



start();
