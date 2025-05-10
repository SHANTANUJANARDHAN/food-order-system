const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const Razorpay = require('razorpay'); // Import Razorpay
const userRoutes = require('./src/routes/user');
const orderRoutes = require('./src/routes/order');
const paymentRoutes = require('./src/routes/payment');
const db = require('./src/db/database');
const router = express.Router();

const razorpay = new Razorpay({
    key_id: 'rzp_test_maTowvalNvA422', // Replace with your Razorpay Key ID
    key_secret: 'ZLGHeGzqTmRgXwSNax2jjOWJ' // Replace with your Razorpay Key Secret
});

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'src/public')));
app.use(express.static(path.join(__dirname, 'src/views')));  // Serve static files from src/views

// Initialize database
db.initializeDatabase(); // Corrected function name

// Root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/views/index.html')); // Serve index.html
});

// Login Route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const query = `SELECT * FROM users WHERE email = ? AND password = ?`;
        const user = await db.fetchOne(query, [email, password]);

        if (user) {
            res.json({ message: 'Login successful', user });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Create Razorpay Order
router.post('/create-order', async (req, res) => {
    const { amount, currency } = req.body;

    try {
        const options = {
            amount: amount * 100, // Amount in paise
            currency,
            receipt: `receipt_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (err) {
        console.error('Error creating Razorpay order:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = router;