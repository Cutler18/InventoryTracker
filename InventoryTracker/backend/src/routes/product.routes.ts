
/*
 * InventoryTracker REST API
 * File: product.routes.ts
 *
 * Purpose:
 * Define the REST API routes for managing
 * inventory products.
 *
 * Each route connects an HTTP request to
 * its corresponding Product Controller method.
 */

// Import Express Router.
import { Router } from 'express';

// Import all five CRUD controller methods.
import {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} from '../controllers/product.controller';

// Create a new Express router.
const router = Router();

/*
 * READ ALL PRODUCTS
 *
 * GET /api/products
 *
 * Retrieves all products from the database.
 */
router.get('/', getAllProducts);

/*
 * READ ONE PRODUCT
 *
 * GET /api/products/:id
 *
 * Retrieves a product by its unique ID.
 */
router.get('/:id', getProductById);

/*
 * CREATE PRODUCT
 *
 * POST /api/products
 *
 * Adds a new product to the database.
 */
router.post('/', createProduct);

/*
 * UPDATE PRODUCT
 *
 * PUT /api/products/:id
 *
 * Updates an existing product.
 */
router.put('/:id', updateProduct);

/*
 * DELETE PRODUCT
 *
 * DELETE /api/products/:id
 *
 * Permanently removes a product.
 */
router.delete('/:id', deleteProduct);

// Export the router so server.ts can use it.
export default router;
