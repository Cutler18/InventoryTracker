
/*
 * InventoryTracker REST API
 * File: server.ts
 *
 * Purpose:
 * This file initializes the Express application,
 * configures middleware, and starts the HTTP server.
 *
 * Future development will add routes for managing
 * inventory products stored in a MySQL database.
 */

// Import Express to create our REST API server.
import express, { Request, Response } from 'express';

// Import CORS to allow requests from other applications,
// including the frontend we will develop later.
import cors from 'cors';

// Import dotenv to load environment variables
// from a .env configuration file.
import dotenv from 'dotenv';

// Import the database connection test function.
// This verifies that MySQL is accessible before
// the Express server begins accepting requests.
import { testDatabaseConnection } from './config/database';

// Import the Product Routes for inventory CRUD operations.
import productRoutes from './routes/product.routes';

// Load environment variables before configuring the server.
dotenv.config();

// Create an instance of the Express application.
const app = express();

// Set the server port using an environment variable.
// If PORT is not defined, use port 3000.
const PORT: number = Number(process.env.PORT) || 3000;

/*
 * Middleware Configuration
 */

// Enable Cross-Origin Resource Sharing (CORS).
// This allows our future Angular or React frontend
// to communicate with the InventoryTracker API.
app.use(cors());

// Enable Express to automatically parse incoming
// JSON request bodies into JavaScript objects.
//
// This will be necessary when creating or updating
// inventory products using POST and PUT requests.
app.use(express.json());

/*
 * Register the InventoryTracker Product Routes.
 *
 * All routes defined in product.routes.ts
 * will begin with /api/products.
 *
 * Examples:
 * GET    /api/products
 * GET    /api/products/1
 * POST   /api/products
 * PUT    /api/products/1
 * DELETE /api/products/1
 */
app.use('/api/products', productRoutes);

/*
 * Test Endpoint
 *
 * HTTP Method: GET
 * URL: http://localhost:3000/
 *
 * This endpoint verifies that the Express server
 * is running and responding to HTTP requests.
 */
app.get('/', (req: Request, res: Response): void => {

    // Return a JSON response confirming that
    // the InventoryTracker API is operational.
    res.status(200).json({
        message: 'InventoryTracker REST API is running!',
        status: 'success'
    });

});

/*
 * Start the Express Server
 */


/*
 * Start the Express Server
 *
 * Before accepting HTTP requests, verify that
 * the MySQL database is available.
 *
 * This prevents the API from starting successfully
 * when its database connection is unavailable.
 */
async function startServer(): Promise<void> {

    try {

        // Test the connection to the MySQL database.
        await testDatabaseConnection();

        // Start the Express server only after the
        // database connection test succeeds.
        app.listen(PORT, (): void => {

            // Display the API address in the terminal.
            console.log(
                `InventoryTracker API running at http://localhost:${PORT}`
            );

        });

    } catch (error) {

        // Display an error if the database is unavailable.
        console.error(
            'Unable to start InventoryTracker API:',
            error
        );

        // Exit the application with a failure status.
        process.exit(1);
    }
}

// Execute the server startup function.
startServer();

