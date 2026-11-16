
/*
 * InventoryTracker REST API
 * File: product.model.ts
 *
 * Purpose:
 * Define the structure of a Product object used
 * throughout the InventoryTracker application.
 *
 * This interface corresponds to the columns in
 * the MySQL products table.
 *
 * TypeScript interfaces provide compile-time
 * type checking but do not create database tables
 * or validate incoming HTTP requests at runtime.
 */

/*
 * Product Interface
 *
 * Represents a complete inventory product
 * retrieved from the MySQL database.
 */
export interface Product {

    // Unique identifier assigned automatically
    // by MySQL when the product is created.
    id: number;

    // Name of the inventory product.
    // Corresponds to VARCHAR(100) in MySQL.
    name: string;

    // Optional product description.
    // MySQL allows this column to contain NULL.
    description: string | null;

    // Number of units currently in inventory.
    // This value must be zero or greater.
    quantity: number;

    // Price of one unit of the product.
    // Corresponds to DECIMAL(10,2) in MySQL.
    price: number;

    // Date the product was added to inventory.
    // The MySQL DATE column is represented as
    // a JavaScript Date object in our model.
    date_added: Date;

    // Indicates whether the product is active.
    // MySQL stores BOOLEAN as TINYINT(1).
    // Database values will need conversion
    // when reading them into this interface.
    is_active: boolean;
}

/*
 * CreateProduct Interface
 *
 * Defines the fields required when a user
 * creates a new inventory product.
 *
 * The id property is omitted because MySQL
 * automatically generates it.
 *
 * The date_added property is omitted because
 * our backend will assign the current date
 * when inserting a new product.
 */
export interface CreateProduct {

    // Required product name.
    name: string;

    // Optional product description.
    description?: string | null;

    // Initial inventory quantity.
    quantity: number;

    // Price per unit.
    price: number;

    // Optional active status.
    // The backend will default this to true.
    is_active?: boolean;
}

/*
 * UpdateProduct Interface
 *
 * Defines the fields that may be modified
 * when updating an existing product.
 *
 * Partial<CreateProduct> makes every property
 * optional, allowing updates to individual
 * product fields without requiring all values.
 *
 * The product ID will be supplied separately
 * through the API URL.
 */
export interface UpdateProduct extends Partial<CreateProduct> {
}
