
/*
 * InventoryTracker REST API
 * File: database.ts
 *
 * Purpose:
 * Establish and manage connections between the
 * Express application and the MySQL database.
 *
 * A connection pool allows the application to reuse
 * database connections instead of creating a new
 * connection for every incoming API request.
 */

// Import the promise-based MySQL2 library.
// This allows us to use async/await when executing
// database queries throughout the application.
import mysql from 'mysql2/promise';

// Import dotenv to load database configuration
// values from the project's .env file.
import dotenv from 'dotenv';

// Load environment variables before creating
// the MySQL connection pool.
dotenv.config();

/*
 * MySQL Connection Pool
 *
 * The pool manages multiple database connections
 * and makes them available when needed.
 */
const pool = mysql.createPool({

    // Hostname of the MySQL database server.
    host: process.env.DB_HOST || 'localhost',

    // Port used by the MySQL database server.
    port: Number(process.env.DB_PORT) || 3306,

    // Username used to authenticate with MySQL.
    user: process.env.DB_USER || 'root',

    // Password used to authenticate with MySQL.
    password: process.env.DB_PASSWORD || '',

    // Name of the InventoryTracker database.
    database: process.env.DB_NAME || 'inventory_tracker',

    // Wait for an available connection if all
    // connections in the pool are currently busy.
    waitForConnections: true,

    // Allow a maximum of 10 active connections.
    connectionLimit: 10,

    // Allow an unlimited number of requests to
    // wait for an available connection.
    queueLimit: 0

});

/*
 * Test Database Connection
 *
 * This function verifies that the application
 * can connect to MySQL and execute a query.
 */
export async function testDatabaseConnection(): Promise<void> {

    try {

        // Execute a simple query against MySQL.
        // SELECT 1 confirms that the connection works
        // without modifying any database records.
        await pool.query('SELECT 1');

        // Display a success message in the terminal.
        console.log('Successfully connected to MySQL database.');

    } catch (error) {

        // Display connection errors to help diagnose
        // incorrect credentials or server settings.
        console.error('MySQL database connection failed:', error);

        // Rethrow the error so the server startup
        // process can handle the failed connection.
        throw error;
    }
}

// Export the connection pool so our future product
// routes and controllers can execute SQL queries.
export default pool;
