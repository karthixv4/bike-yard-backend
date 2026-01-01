const express = require('express');
const { createProduct, getProducts, getProductById, createCategory, getAllCategories, updateProduct, getDashboardProducts, deleteProduct } = require('../controllers/productController');
const verifyJWT = require('../middleware/authMiddleware');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Products
 *     description: Product listing and management
 */

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a new product listing
 *     description: Create a new product listing. Requires seller profile. Supports AI Sound Doctor analysis if description contains "AudioCheck".
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - title
 *               - description
 *               - price
 *               - images
 *               - condition
 *               - stock
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [BIKE, ACCESSORY, PART]
 *                 example: "BIKE"
 *               title:
 *                 type: string
 *                 example: "Yamaha R15 V3"
 *               description:
 *                 type: string
 *                 example: "Well maintained bike with AudioCheck feature"
 *               price:
 *                 type: number
 *                 format: float
 *                 example: 150000.00
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["https://example.com/image1.jpg"]
 *               condition:
 *                 type: string
 *                 enum: [NEW, USED, REFURBISHED, OPEN_BOX]
 *                 example: "USED"
 *               brand:
 *                 type: string
 *                 example: "Yamaha"
 *               model:
 *                 type: string
 *                 example: "R15 V3"
 *               year:
 *                 type: integer
 *                 example: 2020
 *               kmDriven:
 *                 type: integer
 *                 example: 15000
 *               ownership:
 *                 type: integer
 *                 example: 1
 *               stock:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 sellerId:
 *                   type: string
 *                   format: uuid
 *                 type:
 *                   type: string
 *                 title:
 *                   type: string
 *                 description:
 *                   type: string
 *                 price:
 *                   type: number
 *                 images:
 *                   type: array
 *                   items:
 *                     type: string
 *                 condition:
 *                   type: string
 *                 stock:
 *                   type: integer
 *                 isSold:
 *                   type: boolean
 *       403:
 *         description: Forbidden - User must be a seller to list products
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
// Categories Routes
/**
 * @swagger
 * /products/categories:
 *   post:
 *     summary: Create a new category
 *     description: Create a new product category (e.g., Bikes, Accessories).
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Helmets"
 *     responses:
 *       201:
 *         description: Category created successfully
 *       400:
 *         description: Category already exists or missing name
 *       500:
 *         description: Internal server error
 */
router.post('/categories', verifyJWT, createCategory);

/**
 * @swagger
 * /products/categories/all:
 *   get:
 *     summary: Get all categories
 *     description: Retrieve a list of all product categories
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     format: uuid
 *                   name:
 *                     type: string
 *       500:
 *         description: Internal server error
 */
router.get('/categories/all', getAllCategories);

router.post('/', verifyJWT, createProduct); // Needs Auth


/**
 * @swagger
 * /products/dashboard:
 *   get:
 *     summary: Get dashboard products (Bikes & Accessories)
 *     description: Retrieve products split into "bikes" and "accessories" with independent pagination.
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: bikePage
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for bikes
 *       - in: query
 *         name: bikeLimit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page for bikes
 *       - in: query
 *         name: accPage
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for accessories
 *       - in: query
 *         name: accLimit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page for accessories
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bikes:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                     meta:
 *                       type: object
 *                 accessories:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                     meta:
 *                       type: object
 *       500:
 *         description: Internal server error
 */
router.get('/dashboard', getDashboardProducts);

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products with filters
 *     description: Retrieve all available products with optional filtering by brand, model, type, and price range
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: brand
 *         schema:
 *           type: string
 *         description: Filter by brand name
 *         example: "Yamaha"
 *       - in: query
 *         name: model
 *         schema:
 *           type: string
 *         description: Filter by model name
 *         example: "R15"
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [BIKE, ACCESSORY, PART]
 *         description: Filter by product type
 *         example: "BIKE"
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price filter
 *         example: 100000
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price filter
 *         example: 200000
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     format: uuid
 *                   type:
 *                     type: string
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 *                   price:
 *                     type: number
 *                   images:
 *                     type: array
 *                     items:
 *                       type: string
 *                   condition:
 *                     type: string
 *                   brand:
 *                     type: string
 *                   model:
 *                     type: string
 *                   stock:
 *                     type: integer
 *                   isSold:
 *                     type: boolean
 *                   seller:
 *                     type: object
 *       500:
 *         description: Internal server error
 */
router.get('/', getProducts);    // Public

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get product by ID
 *     description: Retrieve detailed information about a specific product including reviews and seller information
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Product ID
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 type:
 *                   type: string
 *                 title:
 *                   type: string
 *                 description:
 *                   type: string
 *                 price:
 *                   type: number
 *                 images:
 *                   type: array
 *                   items:
 *                     type: string
 *                 condition:
 *                   type: string
 *                 brand:
 *                   type: string
 *                 model:
 *                   type: string
 *                 year:
 *                   type: integer
 *                 kmDriven:
 *                   type: integer
 *                 ownership:
 *                   type: integer
 *                 stock:
 *                   type: integer
 *                 isSold:
 *                   type: boolean
 *                 reviews:
 *                   type: array
 *                   items:
 *                     type: object
 *                 seller:
 *                   type: object
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', getProductById); // Public

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Update a product
 *     description: Update product details and manage images (add/delete). Only the seller can update their own product.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               addImages:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     publicId:
 *                       type: string
 *                     url:
 *                       type: string
 *               deleteImageIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *               condition:
 *                 type: string
 *               stock:
 *                 type: integer
 *               isSold:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       403:
 *         description: Forbidden - Not authorized
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', verifyJWT, updateProduct);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete a product
 *     description: Delete a product. Only the seller can delete their own product. Deletion is BLOCKED if the product has associated orders or inspections.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       400:
 *         description: Cannot delete product due to associated orders or inspections
 *       403:
 *         description: Forbidden - Not authorized
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', verifyJWT, deleteProduct);

// Force Restart Trigger
module.exports = router;