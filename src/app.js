const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const orderRoutes = require('./routes/order');
const paymentRoutes = require('./routes/payment');
const userRoutes = require('./routes/user');

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({
    store: new SQLiteStore({ db: 'sessions.db', dir: './db' }),
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 } // 1 minute
}));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/order', orderRoutes);
app.use('/payment', paymentRoutes);
app.use('/user', userRoutes);

// Home route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});