const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const db = require('../db/database');

const razorpay = new Razorpay({
    key_id: 'rzp_test_maTowvalNvA422', // Replace with your Razorpay Key ID
    key_secret: 'ZLGHeGzqTmRgXwSNax2jjOWJ' // Replace with your Razorpay Key Secret
});

// Route to initiate payment
router.post('/create-order', async (req, res) => {
    const { amount, currency } = req.body;

    const options = {
        amount: amount * 100, // amount in smallest currency unit
        currency: currency,
        receipt: `receipt_order_${Math.random()}`,
    };

    try {
        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        console.error("Error creating Razorpay order:", error);
        res.status(500).send("Error creating order");
    }
});

// Route to verify payment
router.post('/verify-payment', async (req, res) => {
    const { paymentId, orderId, signature, fullName, phone, address, cart } = req.body;

    const generatedSignature = crypto.createHmac('sha256', 'ZLGHeGzqTmRgXwSNax2jjOWJ') // Replace with your Razorpay Key Secret
        .update(orderId + '|' + paymentId)
        .digest('hex');

    if (generatedSignature === signature) {
        // Payment is verified, save order details to the database
        const orderData = {
            paymentId,
            orderId,
            amount: req.body.amount,
            currency: req.body.currency,
            status: 'Paid',
            fullName,
            phone,
            address,
            createdAt: new Date().toISOString()
        };

        try {
            // Save order in the orders table
            const orderIdInDb = await db.executeQuery(
                `INSERT INTO orders (payment_id, order_id, amount, currency, status, full_name, phone, address, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [orderData.paymentId, orderData.orderId, orderData.amount, orderData.currency, orderData.status, orderData.fullName, orderData.phone, orderData.address, orderData.createdAt]
            );
            
            for (const item of cart) {
                await db.executeQuery(
                    `INSERT INTO order_items (order_id, food_name, price, quantity, total)
                     VALUES (?, ?, ?, ?, ?)`,
                    [orderIdInDb, item.foodName, item.price, item.quantity, item.total]
                );
            }

            res.json({ status: 'success', message: 'Payment verified and order saved' });
        } catch (error) {
            console.error("Error saving order to database:", error);
            res.status(500).send("Error saving order");
        }
    } else {
        res.status(400).send("Payment verification failed");
    }
});


// Route to list all orders by user ID
router.get('/orders/:userId', async (req, res) => {
    const userId = req.params.userId;

    try {
        const orders = await db.fetchAll(
            `SELECT 
                o.order_id, 
                o.payment_id, 
                o.amount, 
                o.currency, 
                o.status, 
                o.full_name, 
                o.phone, 
                o.address, 
                o.created_at,
                oi.food_name, 
                oi.quantity, 
                oi.total
             FROM orders o
             JOIN order_items oi ON o.id = oi.order_id
             WHERE o.phone = ?`,
            [userId]
        );
        res.json(orders);
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).send("Error fetching orders");
    }
});

module.exports = router;