import express from 'express';
import bodyParser from 'body-parser';
import sqlite3 from 'sqlite3';
import path from 'path';
import ejs from 'ejs';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 3000;

// Get __dirname in ES6 module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Set up the view engine with EJS
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Connect to SQLite database
const db = new sqlite3.Database('data.db', (err) => {
    if (err) {
        console.error("Error opening database:", err.message);
    } else {
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                age INTEGER NOT NULL
            )
        `);
    }
});

// Route to display form and users list
app.get('/', (req, res) => {
    db.all("SELECT * FROM users", [], (err, rows) => {
        if (err) {
            res.status(400).send("Error fetching users");
        } else {
            res.render('index', { users: rows });
        }
    });
});

// Route to handle form submission
app.post('/add-user', (req, res) => {
    const { name, age } = req.body;
    db.run("INSERT INTO users (name, age) VALUES (?, ?)", [name, age], (err) => {
        if (err) {
            return res.status(500).send("Error inserting user data");
        }
        res.redirect('/');
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
