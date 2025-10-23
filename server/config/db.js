// config/db.js
const mysql = require("mysql2/promise");
require("dotenv").config();

// Create a promise-based pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// Test the connection once
async function testConnection() {
    try {
        const conn = await pool.getConnection();
        console.log("✅ MySQL Connected!");
        conn.release();
    } catch (err) {
        console.error("❌ Database connection failed:", err.message);
    }
}

// Run the test (optional)
testConnection();

module.exports = pool;
