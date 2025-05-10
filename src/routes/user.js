const express = require('express');
const router = express.Router();
const db = require('../db/database');

// Signup Route
router.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check if the email already exists
        const existingUser = await db.fetchOne(`SELECT * FROM users WHERE email = ?`, [email]);
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists!' });
        }

        // Insert the new user into the database
        const query = `INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)`;
        await db.executeQuery(query, [name, email, password]);

        res.status(201).json({ message: 'Signup successful!' });
    } catch (err) {
        console.error('Error during signup:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the user exists and the password matches
        const user = await db.fetchOne(`SELECT * FROM users WHERE email = ? AND password = ?`, [email, password]);
        console.log(user);
        
        if (user) {
            res.status(200).json({ message: 'Login successful', user });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get User Details Route
router.get('/profile/:id', async (req, res) => {
    const userId = req.params.id;

    try {
        // Fetch user details by ID
        const user = await db.fetchOne(`SELECT * FROM users WHERE id = ?`, [userId]);
        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (err) {
        console.error('Error fetching user details:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Update User Details Route
router.put('/profile/:id', async (req, res) => {
    const userId = req.params.id;
    const { full_name, phone, email, address } = req.body;

    try {
        // Update user details
        const query = `UPDATE users SET full_name = ?, phone = ?, email = ?, address = ? WHERE id = ?`;
        const result = await db.executeQuery(query, [full_name, phone, email, address, userId]);

        if (result) {
            res.status(200).json({ message: 'User details updated successfully' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (err) {
        console.error('Error updating user details:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Delete User Route
router.delete('/profile/:id', async (req, res) => {
    const userId = req.params.id;

    try {
        // Delete user by ID
        const query = `DELETE FROM users WHERE id = ?`;
        const result = await db.executeQuery(query, [userId]);

        if (result) {
            res.status(200).json({ message: 'User deleted successfully' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;