
/*
 * InventoryTracker REST API
 * File: product.controller.ts
 *
 * Purpose:
 * Handle HTTP requests for inventory products.
 *
 * This controller implements the following
 * CRUD operations:
 *
 * CREATE - Add a new product to MySQL.
 * READ   - Retrieve all products or one product.
 * UPDATE - Modify an existing product.
 * DELETE - Remove an existing product.
 *
 * All SQL statements use parameterized queries
 * to prevent SQL injection.
 */

// Import Express request and response types.
import { Request, Response } from 'express';

// Import the MySQL ResultSetHeader type.
// It provides information about INSERT,
// UPDATE, and DELETE query results.
import { ResultSetHeader, RowDataPacket } from 'mysql2';

// Import the shared MySQL connection pool.
import pool from '../config/database';

// Import the product interfaces for type checking.
import {
    Product,
    CreateProduct,
    UpdateProduct
} from '../models/product.model';

/*
 * Database Product Type
 *
 * MySQL returns query results as RowDataPacket
 * objects. This interface describes a product row.
 *
 * MySQL represents BOOLEAN columns as 0 or 1,
 * so we convert is_active into a boolean before
 * sending products to API clients.
 */
interface ProductRow extends RowDataPacket {

    id: number;
    name: string;
    description: string | null;
    quantity: number;
    price: string | number;
    date_added: Date;
    is_active: number;
}

/*
 * Convert Database Row to Product
 *
 * Purpose:
 * Convert MySQL-specific values into the
 * Product interface used by our application.
 */
function mapProduct(row: ProductRow): Product {

    return {

        // Copy the product's unique identifier.
        id: row.id,

        // Copy the product name and description.
        name: row.name,
        description: row.description,

        // Copy the current inventory quantity.
        quantity: row.quantity,

        // Convert MySQL DECIMAL values into numbers.
        price: Number(row.price),

        // Copy the date the product was added.
        date_added: row.date_added,

        // Convert MySQL's 0/1 representation
        // into a TypeScript boolean.
        is_active: Boolean(row.is_active)
    };
}

/*
 * GET ALL PRODUCTS
 *
 * HTTP Method: GET
 * Endpoint: /api/products
 *
 * Retrieves every product from MySQL.
 */
export async function getAllProducts(
    req: Request,
    res: Response
): Promise<void> {

    try {

        // Retrieve all products ordered by ID.
        const [rows] = await pool.query<ProductRow[]>(
            'SELECT * FROM products ORDER BY id ASC'
        );

        // Convert database rows into Product objects.
        const products: Product[] = rows.map(mapProduct);

        // Return the products as a JSON array.
        res.status(200).json(products);

    } catch (error) {

        // Log the database error for debugging.
        console.error('Error retrieving products:', error);

        // Return a generic error without exposing
        // internal database information.
        res.status(500).json({
            message: 'Failed to retrieve products.'
        });
    }
}

/*
 * GET PRODUCT BY ID
 *
 * HTTP Method: GET
 * Endpoint: /api/products/:id
 *
 * Retrieves one product using its unique ID.
 */
export async function getProductById(
    req: Request,
    res: Response
): Promise<void> {

    // Convert the URL parameter into a number.
    const id = Number(req.params.id);

    // Reject invalid product IDs.
    if (!Number.isSafeInteger(id) || id <= 0) {

        res.status(400).json({
            message: 'A valid product ID is required.'
        });

        return;
    }

    try {

        // The question mark is a parameter placeholder.
        // MySQL2 safely substitutes the provided ID.
        const [rows] = await pool.query<ProductRow[]>(
            'SELECT * FROM products WHERE id = ?',
            [id]
        );

        // Return 404 when the product does not exist.
        if (rows.length === 0) {

            res.status(404).json({
                message: 'Product not found.'
            });

            return;
        }

        // Return the matching product.
        res.status(200).json(mapProduct(rows[0]));

    } catch (error) {

        console.error('Error retrieving product:', error);

        res.status(500).json({
            message: 'Failed to retrieve product.'
        });
    }
}

/*
 * CREATE PRODUCT
 *
 * HTTP Method: POST
 * Endpoint: /api/products
 *
 * Inserts a new product into the MySQL database.
 */
export async function createProduct(
    req: Request,
    res: Response
): Promise<void> {

    // Read the submitted product information.
    const data: CreateProduct = req.body;

    // Verify that the request body is an object.
    if (!data || typeof data !== 'object' ||
        Array.isArray(data)) {

        res.status(400).json({
            message: 'A valid product object is required.'
        });

        return;
    }

    // Validate the required fields.
    if (
        typeof data.name !== 'string' ||
        data.name.trim().length === 0 ||
        data.name.length > 100 ||
        !Number.isSafeInteger(data.quantity) ||
        data.quantity < 0 ||
        typeof data.price !== 'number' ||
        !Number.isFinite(data.price) ||
        data.price < 0 ||
        data.price > 99999999.99 ||
        (data.description !== undefined &&
         data.description !== null &&
         typeof data.description !== 'string') ||
        (data.is_active !== undefined &&
         typeof data.is_active !== 'boolean')
    ) {

        res.status(400).json({
            message: 'Invalid product data. Check name, quantity, price, description, and active status.'
        });

        return;
    }

    try {

        // Insert the new product into MySQL.
        //
        // CURDATE() supplies the current database date
        // because date_added does not have a SQL default.
        //
        // The database automatically generates the ID.
        const [result] = await pool.execute<ResultSetHeader>(
            `INSERT INTO products
             (name, description, quantity, price, date_added, is_active)
             VALUES (?, ?, ?, ?, CURDATE(), ?)`,
            [
                data.name.trim(),
                data.description ?? null,
                data.quantity,
                data.price,
                data.is_active ?? true
            ]
        );

        // Return the new product's ID.
        // HTTP 201 indicates successful creation.
        res.status(201).json({
            message: 'Product created successfully.',
            id: result.insertId
        });

    } catch (error) {

        console.error('Error creating product:', error);

        res.status(500).json({
            message: 'Failed to create product.'
        });
    }
}

/*
 * UPDATE PRODUCT
 *
 * HTTP Method: PUT
 * Endpoint: /api/products/:id
 *
 * Updates the fields of an existing product.
 *
 * Although this endpoint uses PUT, it accepts
 * partial updates for this milestone.
 */
export async function updateProduct(
    req: Request,
    res: Response
): Promise<void> {

    // Read and validate the product ID.
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {

        res.status(400).json({
            message: 'A valid product ID is required.'
        });

        return;
    }

    // Read the updated product information.
    const data: UpdateProduct = req.body;

    // Reject missing, invalid, or empty request bodies.
    if (!data || typeof data !== 'object' ||
        Array.isArray(data) ||
        Object.keys(data).length === 0) {

        res.status(400).json({
            message: 'Product update data is required.'
        });

        return;
    }

    // Define the fields that clients may update.
    // The ID and date_added cannot be modified here.
    const allowedFields = [
        'name',
        'description',
        'quantity',
        'price',
        'is_active'
    ];

    // Reject unknown fields instead of silently
    // ignoring them.
    if (Object.keys(data).some(
        key => !allowedFields.includes(key)
    )) {

        res.status(400).json({
            message: 'The request contains unsupported fields.'
        });

        return;
    }

    // Validate only the fields included in the request.
    if (
        (data.name !== undefined &&
         (typeof data.name !== 'string' ||
          data.name.trim().length === 0 ||
          data.name.length > 100)) ||

        (data.quantity !== undefined &&
         (!Number.isSafeInteger(data.quantity) ||
          data.quantity < 0)) ||

        (data.price !== undefined &&
         (typeof data.price !== 'number' ||
          !Number.isFinite(data.price) ||
          data.price < 0 ||
          data.price > 99999999.99)) ||

        (data.description !== undefined &&
         data.description !== null &&
         typeof data.description !== 'string') ||

        (data.is_active !== undefined &&
         typeof data.is_active !== 'boolean')
    ) {

        res.status(400).json({
            message: 'Invalid product update data.'
        });

        return;
    }

    // Build the SQL SET clause from allowed fields.
    const updates: string[] = [];

    // Store validated values that can be passed
// safely as parameters to MySQL.
const values: (string | number | boolean | null)[] = [];

    // Add the name when provided.
    if (data.name !== undefined) {
        updates.push('name = ?');
        values.push(data.name.trim());
    }

    // Add the description when provided.
    if (data.description !== undefined) {
        updates.push('description = ?');
        values.push(data.description);
    }

    // Add the quantity when provided.
    if (data.quantity !== undefined) {
        updates.push('quantity = ?');
        values.push(data.quantity);
    }

    // Add the price when provided.
    if (data.price !== undefined) {
        updates.push('price = ?');
        values.push(data.price);
    }

    // Add the active status when provided.
    if (data.is_active !== undefined) {
        updates.push('is_active = ?');
        values.push(data.is_active);
    }

    // Reject requests without any updateable values.
    if (updates.length === 0) {

        res.status(400).json({
            message: 'No valid fields were supplied.'
        });

        return;
    }

    // Add the product ID as the final SQL parameter.
    values.push(id);

    try {

        // Update the matching database record.
        const [result] = await pool.execute<ResultSetHeader>(
            `UPDATE products
             SET ${updates.join(', ')}
             WHERE id = ?`,
            values
        );

        // MySQL reports zero affected rows when
        // no record matches the supplied ID.
        if (result.affectedRows === 0) {

            res.status(404).json({
                message: 'Product not found.'
            });

            return;
        }

        // Confirm that the update was successful.
        res.status(200).json({
            message: 'Product updated successfully.'
        });

    } catch (error) {

        console.error('Error updating product:', error);

        res.status(500).json({
            message: 'Failed to update product.'
        });
    }
}

/*
 * DELETE PRODUCT
 *
 * HTTP Method: DELETE
 * Endpoint: /api/products/:id
 *
 * Permanently deletes a product from MySQL.
 */
export async function deleteProduct(
    req: Request,
    res: Response
): Promise<void> {

    // Convert the requested product ID into a number.
    const id = Number(req.params.id);

    // Validate the ID before accessing the database.
    if (!Number.isSafeInteger(id) || id <= 0) {

        res.status(400).json({
            message: 'A valid product ID is required.'
        });

        return;
    }

    try {

        // Delete the product with the matching ID.
        const [result] = await pool.execute<ResultSetHeader>(
            'DELETE FROM products WHERE id = ?',
            [id]
        );

        // Return 404 if no matching product exists.
        if (result.affectedRows === 0) {

            res.status(404).json({
                message: 'Product not found.'
            });

            return;
        }

        // Confirm successful deletion.
        res.status(200).json({
            message: 'Product deleted successfully.'
        });

    } catch (error) {

        console.error('Error deleting product:', error);

        res.status(500).json({
            message: 'Failed to delete product.'
        });
    }
}
