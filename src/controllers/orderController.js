// src/controllers/orderController.js
const prisma = require('../prisma/prismaConnection');

// Add to Cart
const addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const requestedQty = quantity || 1;

        // Check Product Stock
        const product = await prisma.product.findUnique({
            where: { id: productId }
        });

        if (!product) return res.status(404).json({ message: "Product not found" });
        if (product.isSold) return res.status(400).json({ message: "Product is already sold" });
        if (requestedQty > product.stock) {
            return res.status(400).json({ message: `Only ${product.stock} items left in stock` });
        }

        const cartItem = await prisma.cartItem.create({
            data: {
                userId: req.user.id,
                productId,
                quantity: requestedQty
            }
        });
        res.status(201).json(cartItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Cart
const getCart = async (req, res) => {
    try {
        const cart = await prisma.cartItem.findMany({
            where: { userId: req.user.id },
            include: {
                product: {
                    include: { images: true }
                }
            }
        });
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Checkout (Transaction)
const checkout = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Get Cart
        const cartItems = await prisma.cartItem.findMany({
            where: { userId },
            include: { product: true }
        });

        if (cartItems.length === 0) return res.status(400).json({ message: "Cart is empty" });

        // 2. Calculate Total
        let totalAmount = 0;
        cartItems.forEach(item => {
            totalAmount += (item.product.price * item.quantity);
        });

        // 3. Perform Transaction (Create Order -> Create Items -> Delete Cart -> Update Stock)
        const result = await prisma.$transaction(async (tx) => {
            // Create Order
            const order = await tx.order.create({
                data: {
                    buyerId: userId,
                    totalAmount,
                    status: 'PAID', // In real app, this happens after Payment Gateway callback
                    paymentId: `PAY-${Date.now()}` // Mock Payment ID
                }
            });

            // Create Order Items & Update Stock
            for (const item of cartItems) {
                await tx.orderItem.create({
                    data: {
                        orderId: order.id,
                        productId: item.productId,
                        quantity: item.quantity,
                        priceAtPurchase: item.product.price
                    }
                });

                // Update product stock
                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: { decrement: item.quantity },
                        // Mark sold if stock hits 0 and it's a bike (assuming unique bike)
                        isSold: item.product.type === 'BIKE' ? true : undefined
                    }
                });
            }

            // Clear Cart
            await tx.cartItem.deleteMany({ where: { userId } });

            return order;
        });

        res.status(201).json({ message: "Order placed successfully", order: result });

    } catch (error) {
        res.status(500).json({ message: "Checkout failed", error: error.message });
    }
};

// Get Buyer Orders (My Orders)
const getMyOrders = async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            where: { buyerId: req.user.id },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                title: true,
                                images: { take: 1 },
                                type: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Seller Orders (My Sales)
const getSellerOrders = async (req, res) => {
    try {
        const seller = await prisma.sellerProfile.findUnique({
            where: { userId: req.user.id }
        });

        if (!seller) {
            return res.status(403).json({ message: "You are not a registered seller" });
        }

        // Find OrderItems for products sold by this seller
        const sales = await prisma.orderItem.findMany({
            where: {
                product: { sellerId: seller.id }
            },
            include: {
                product: {
                    select: { title: true, price: true }
                },
                order: {
                    select: {
                        id: true,
                        createdAt: true,
                        buyer: { select: { name: true, email: true } },
                        status: true
                    }
                }
            },
            orderBy: { order: { createdAt: 'desc' } }
        });

        res.json(sales);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Order By ID (Detailed View)
const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                items: {
                    include: { product: true }
                },
                buyer: {
                    select: { name: true, email: true, phone: true }
                }
            }
        });

        if (!order) return res.status(404).json({ message: "Order not found" });

        // Security: Only Buyer or Admin should see full order
        // (Sellers shouldn't necessarily see items from other sellers in the same order, 
        // but checking that logic here is complex. For now, restricted to Buyer.)
        if (order.buyerId !== req.user.id) {
            return res.status(403).json({ message: "Unauthorized access to this order" });
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Orders By Product (Product Sales History)
const getOrdersByProductId = async (req, res) => {
    try {
        const { productId } = req.params;

        // 1. Verify Ownership
        const product = await prisma.product.findUnique({
            where: { id: productId },
            include: { seller: true }
        });

        if (!product) return res.status(404).json({ message: "Product not found" });

        if (product.seller.userId !== req.user.id) {
            return res.status(403).json({ message: "Unauthorized: You can only view sales key for your own products" });
        }

        // 2. Fetch Sales
        const productSales = await prisma.orderItem.findMany({
            where: { productId },
            include: {
                order: {
                    select: {
                        id: true,
                        buyer: { select: { name: true } },
                        createdAt: true,
                        status: true
                    }
                }
            },
            orderBy: { order: { createdAt: 'desc' } }
        });

        res.json(productSales);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Update Cart Item (Quantity)
const updateCartItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;

        if (!quantity || quantity < 1) {
            return res.status(400).json({ message: "Quantity must be at least 1" });
        }

        // Verify ownership and get product details
        const cartItem = await prisma.cartItem.findUnique({
            where: { id },
            include: { product: true }
        });

        if (!cartItem) return res.status(404).json({ message: "Cart item not found" });
        if (cartItem.userId !== req.user.id) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        // Stock Validation
        if (quantity > cartItem.product.stock) {
            return res.status(400).json({ message: `Only ${cartItem.product.stock} items available` });
        }

        const updatedItem = await prisma.cartItem.update({
            where: { id },
            data: { quantity: parseInt(quantity) },
            include: { product: { include: { images: true } } }
        });

        res.json(updatedItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Remove Cart Item
const removeCartItem = async (req, res) => {
    try {
        const { id } = req.params;

        // Verify ownership
        const cartItem = await prisma.cartItem.findUnique({
            where: { id }
        });

        if (!cartItem) return res.status(404).json({ message: "Cart item not found" });
        if (cartItem.userId !== req.user.id) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        await prisma.cartItem.delete({
            where: { id }
        });

        res.json({ message: "Item removed from cart" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Update Order Status (Cancel/Ship/Deliver)
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // PENDING, PAID, SHIPPED, DELIVERED, CANCELLED

        const validStatuses = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const order = await prisma.order.findUnique({
            where: { id },
            include: { items: { include: { product: true } } }
        });

        if (!order) return res.status(404).json({ message: "Order not found" });

        // Logic split based on role
        const isBuyer = order.buyerId === req.user.id;

        let isAuthorizedSeller = false;
        if (!isBuyer) {
            const sellerProfile = await prisma.sellerProfile.findUnique({
                where: { userId: req.user.id }
            });
            if (sellerProfile) {
                isAuthorizedSeller = order.items.some(item => item.product.sellerId === sellerProfile.id);
            }
        }

        if (!isBuyer && !isAuthorizedSeller && !req.user.roles?.isAdmin) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        // --- BUYER LOGIC ---
        if (isBuyer) {
            if (status !== "CANCELLED") {
                return res.status(403).json({ message: "Buyers can only CANCEL orders" });
            }
            if (["SHIPPED", "DELIVERED"].includes(order.status)) {
                return res.status(400).json({ message: "Cannot cancel order that has been shipped or delivered" });
            }
        }

        // --- SELLER LOGIC ---
        if (isAuthorizedSeller) {
            // DISCLAIMER: In a multi-seller system, a single order might contain items from multiple sellers.
            // Currently, 'status' is defined on the Order level (schema constraints).
            // Thus, if one seller updates the status (e.g. to SHIPPED), it marks the whole order as SHIPPED.
            // Ideally, status should be on OrderItem level for granular control. 
            // Proceeding with Order-level update as per MVP requirements.
        }

        const updatedOrder = await prisma.$transaction(async (tx) => {
            const updated = await tx.order.update({
                where: { id },
                data: { status }
            });

            // Restocking Logic if CANCELLED
            if (status === "CANCELLED") {
                for (const item of order.items) {
                    await tx.product.update({
                        where: { id: item.productId },
                        data: {
                            stock: { increment: item.quantity },
                            isSold: item.product.type === 'BIKE' ? false : undefined
                        }
                    });
                }
            }
            return updated;
        });

        res.json(updatedOrder);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

console.log("OrderController Loaded. functions:", Object.keys({ addToCart, updateOrderStatus }));
module.exports = {
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
};