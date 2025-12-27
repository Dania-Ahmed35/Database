const mysql = require('mysql2');
require('dotenv').config();

// Create the pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Export the promise-based version for modern async/await
module.exports = pool.promise();