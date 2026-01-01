const fs = require('fs');
const BASE_URL = 'http://localhost:5000/api';

// Logging setup
fs.writeFileSync('debug_orders_output.txt', '');
const originalLog = console.log;
const originalError = console.error;
console.log = (...args) => {
    fs.appendFileSync('debug_orders_output.txt', args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ') + '\n');
    originalLog(...args);
};
console.error = (...args) => {
    fs.appendFileSync('debug_orders_output.txt', "ERROR: " + args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ') + '\n');
    originalError(...args);
};

async function debugOrders() {
    try {
        console.log("Starting Order Debugging...");
        const timestamp = Date.now();

        // 1. Register Seller & Create Product
        const sellerEmail = `debug_seller_${timestamp}@test.com`;
        const sellerRes = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: sellerEmail,
                password: 'password123',
                name: 'Debug Seller',
                phone: '1234567890',
                role: 'seller',
                roleDetails: { businessName: 'Debug Corp', gstNumber: 'GSTDEBUG999' }
            })
        });
        const sellerToken = (await sellerRes.json()).token;

        await fetch(`${BASE_URL}/products/categories`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sellerToken}` },
            body: JSON.stringify({ name: "DebugCat" })
        });

        const prodRes = await fetch(`${BASE_URL}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sellerToken}` },
            body: JSON.stringify({ type: "ACCESSORY", title: "Debug Item", description: "Test", price: 100, stock: 10, category: "DebugCat" })
        });
        const product = await prodRes.json();
        console.log("Product Created:", product.id);

        // 2. Register Buyer, Add to Cart, Checkout
        const buyerRes = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: `debug_buyer_${timestamp}@test.com`, password: 'password123', name: 'Debug Buyer', phone: '9999999999' })
        });
        const buyerToken = (await buyerRes.json()).token;

        await fetch(`${BASE_URL}/orders/cart`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${buyerToken}` },
            body: JSON.stringify({ productId: product.id, quantity: 2 })
        });

        const checkoutRes = await fetch(`${BASE_URL}/orders/checkout`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${buyerToken}` }
        });
        const orderData = await checkoutRes.json();
        const orderId = orderData.order.id;
        console.log("Order Placed:", orderId);

        // 3. Fetch My Orders
        const myOrdersRes = await fetch(`${BASE_URL}/orders/my-orders`, {
            headers: { 'Authorization': `Bearer ${buyerToken}` }
        });
        const myOrders = await myOrdersRes.json();

        // Find the order we just created
        const targetOrder = myOrders.find(o => o.id === orderId);

        if (targetOrder) {
            console.log("Found Order in My Orders.");
            console.log("Item Count:", targetOrder.items.length);
            if (targetOrder.items.length > 0) {
                console.log("First Item:", JSON.stringify(targetOrder.items[0]));
                console.log("PASS: Items are present.");
            } else {
                console.error("FAIL: Items array is empty!");
            }
        } else {
            console.error("FAIL: Order not found in list.");
        }

    } catch (error) {
        console.error("Debug Error:", error.message);
    }
}

debugOrders();
