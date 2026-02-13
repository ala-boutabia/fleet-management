import sql from "mssql";
import dotenv from "dotenv";
dotenv.config()

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
  
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

let pool = null;
let poolPromise = null;

export const connectDB = async () => {
  // Fast path: return existing pool
  if (pool) return pool;

  // Prevent concurrent connection attempts
  if (!poolPromise) {
    poolPromise = new sql.ConnectionPool(dbConfig)
      .connect()
      .then((p) => {
        pool = p;

        // Handle pool errors (connection drops, etc.)
        pool.on("error", (err) => {
          console.error("SQL pool error:", err);
          pool = null;
          poolPromise = null; // Allow reconnection
        });

        console.log("Database connected successfully");
        return pool;
      })
      .catch((err) => {
        console.error("Database connection failed:", err);
        poolPromise = null; // Allow retry on next call
        throw err;
      });
  }

  return poolPromise;
};

export const getPool = () => {
  if (!pool) {
    throw new Error("Database to connectd. Call connectDB() first.")
  }
  return pool
}

// Optional: graceful shutdown
export const closeDB = async () => {
  if (pool) {
    await pool.close();
    pool = null;
    poolPromise = null;
    console.log("Database connection closed");
  }
};

export default connectDB;



