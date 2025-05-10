const express = require('express');
const router = express.Router();
const db = require('../db/database');

// Route to create a new order
router.post('/create', async (req, res) => {
    const { fullName, phone, email, address, cart } = req.body;

    try {
        const order = {
            fullName,
            phone,
            email,
            address,
            createdAt: new Date().toISOString()
        };

        const result = await db.run(`INSERT INTO orders (fullName, phone, email, address, createdAt) VALUES (?, ?, ?, ?, ?)`, 
            [order.fullName, order.phone, order.email, order.address, order.createdAt]);

        const orderId = result.lastID;

        // Save cart items to the database
        for (const item of cart) {
            await db.run(`INSERT INTO order_items (orderId, foodName, price, quantity) VALUES (?, ?, ?, ?)`, 
                [orderId, item.name, item.price, item.quantity]);
        }

        res.status(201).json({ message: 'Order placed successfully!', orderId });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

// Route to retrieve all orders
router.get('/', async (req, res) => {
    try {
        const orders = await db.all(`SELECT * FROM orders`);
        res.status(200).json(orders);
    } catch (error) {
        console.error('Error retrieving orders:', error);
        res.status(500).json({ error: 'Failed to retrieve orders' });
    }
});

module.exports = router;