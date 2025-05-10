const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database ' + err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

const initializeDatabase = () => {
    const schema = `

    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        phone TEXT ,
        email TEXT ,
        password TEXT NOT NULL,
        address 
    );



 CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    payment_id TEXT NOT NULL,
    order_id TEXT NOT NULL,
    amount REAL NOT NULL,
    currency TEXT NOT NULL,
    status TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    created_at TEXT NOT NULL
);

  CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        food_name TEXT NOT NULL,
        price REAL NOT NULL,
        quantity INTEGER NOT NULL,
        total REAL NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders (id)
    );
`;

    db.exec(schema, (err) => {
        if (err) {
            console.error('Error executing schema: ' + err.message);
        } else {
            console.log('Database schema initialized.');
        }
    });
};

const executeQuery = (query, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(query, params, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.lastID); // Return the last inserted ID
            }
        });
    });
};

// Fetch a single record (for SELECT)
const fetchOne = (query, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(query, params, (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
};

// Fetch multiple records (for SELECT)
const fetchAll = (query, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

// Close the database connection
const closeDatabase = () => {
    db.close((err) => {
        if (err) {
            console.error('Error closing database: ' + err.message);
        } else {
            console.log('Database connection closed.');
        }
    });
};

module.exports = {
    initializeDatabase,
    executeQuery,
    fetchOne,
    fetchAll,
    closeDatabase
};