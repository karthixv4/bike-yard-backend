const express = require('express');
const {
    addToCart,
    getCart,
    checkout,
    getMyOrders,
    getSellerOrders,
    getOrderById,
    getOrdersByProductId,
    updateCartItem,
    removeCartItem,
    updateOrderStatus
} = require('../controllers/orderController');
const verifyJWT = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/ping', (req, res) => res.json({ message: 'pong' }));

/**
 * @swagger
 * tags:
 *   - name: Orders
 *     description: Shopping cart and order management
 */

/**
 * @swagger
 * /orders/cart:
 *   post:
 *     summary: Add item to cart
 *     description: Add a product to the user's shopping cart
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *             properties:
 *               productId:
 *                 type: string
 *                 format: uuid
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               quantity:
 *                 type: integer
 *                 default: 1
 *                 example: 2
 *     responses:
 *       201:
 *         description: Item added to cart successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 userId:
 *                   type: string
 *                   format: uuid
 *                 productId:
 *                   type: string
 *                   format: uuid
 *                 quantity:
 *                   type: integer
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.post('/cart', addToCart);

/**
 * @swagger
 * /orders/cart:
 *   get:
 *     summary: Get shopping cart
 *     description: Retrieve all items in the user's shopping cart with product details
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart retrieved successfully
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
 *                   userId:
 *                     type: string
 *                     format: uuid
 *                   productId:
 *                     type: string
 *                     format: uuid
 *                   quantity:
 *                     type: integer
 *                   product:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       title:
 *                         type: string
 *                       price:
 *                         type: number
 *                       images:
 *                         type: array
 *                         items:
 *                           type: string
 *                       stock:
 *                         type: integer
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.get('/cart', getCart);

/**
 * @swagger
 * /orders/cart/{id}:
 *   put:
 *     summary: Update cart item quantity
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: integer
 *                 example: 3
 *     responses:
 *       200:
 *         description: Cart item updated
 *       404:
 *         description: Item not found
 */
router.put('/cart/:id', verifyJWT, updateCartItem);

/**
 * @swagger
 * /orders/cart/{id}:
 *   delete:
 *     summary: Remove item from cart
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Item removed
 *       404:
 *         description: Item not found
 */
router.delete('/cart/:id', verifyJWT, removeCartItem);

/**
 * @swagger
 * /orders/checkout:
 *   post:
 *     summary: Checkout and create order
 *     description: Process checkout, create order, update stock, and clear cart. Performs all operations in a transaction.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Order placed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Order placed successfully"
 *                 order:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     buyerId:
 *                       type: string
 *                       format: uuid
 *                     totalAmount:
 *                       type: number
 *                     status:
 *                       type: string
 *                       enum: [PENDING, PAID, SHIPPED, DELIVERED, CANCELLED]
 *                       default: PAID
 *                     paymentId:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request - Cart is empty
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error - Checkout failed
 */
router.post('/checkout', checkout);

/**
 * @swagger
 * /orders/my-orders:
 *   get:
 *     summary: Get my buyer orders
 *     description: Retrieve all orders placed by the logged-in user
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of orders retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/my-orders', verifyJWT, getMyOrders);

/**
 * @swagger
 * /orders/seller-orders:
 *   get:
 *     summary: Get my sales (Seller)
 *     description: Retrieve all order items sold by the logged-in seller
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of sales retrieved successfully
 *       403:
 *         description: Forbidden - User is not a seller
 */
router.get('/seller-orders', verifyJWT, getSellerOrders);

/**
 * @swagger
 * /orders/product/{productId}:
 *   get:
 *     summary: Get orders by product
 *     description: Retrieve all sales for a specific product (Seller only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Product sales history retrieved
 *       403:
 *         description: Forbidden - Not the product owner
 */
router.get('/product/:productId', verifyJWT, getOrdersByProductId);

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     description: Retrieve detailed order information
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Order details retrieved
 *       403:
 *         description: Forbidden - Not authorized to view this order
 *       404:
 *         description: Order not found
 */
router.get('/:id', verifyJWT, getOrderById);

/**
 * @swagger
 * /orders/{id}/status:
 *   put:
 *     summary: Update order status
 *     description: Buyers can Cancel. Sellers can set to Shipped/Delivered.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, PAID, SHIPPED, DELIVERED, CANCELLED]
 *     responses:
 *       200:
 *         description: Status updated
 *       400:
 *         description: Invalid status change
 *       403:
 *         description: Unauthorized
 */
router.put('/:id/status', verifyJWT, updateOrderStatus);

module.exports = router;