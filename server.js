// server.js
const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");

const app = express();
app.use(bodyParser.json());

const PORT = 3000;

// Create a MySQL connection pool
// const pool = mysql.createPool({
// 	host: "localhost",
// 	user: "root@localhost",
// 	password: "", // replace with your MySQL root password
// 	database: "node_api",
// });

const pool = mysql.createPool({
	host: "localhost",
	user: "root",
	password: "",
	database: "node_api",
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0,
});

// Promisify for Node.js async/await
const promisePool = pool.promise();

// Get all users
app.get("/users", async (req, res) => {
	try {
		const [rows] = await promisePool.query("SELECT * FROM users");
		res.json(rows);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Create a new user
app.post("/users", async (req, res) => {
	const { name, email } = req.body;
	try {
		const [result] = await promisePool.query(
			"INSERT INTO users (name, email) VALUES (?, ?)",
			[name, email]
		);
		res.status(201).json({ id: result.insertId, name, email });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Update a user
app.put("/users/:id", async (req, res) => {
	const userId = parseInt(req.params.id);
	const { name, email } = req.body;
	try {
		const [result] = await promisePool.query(
			"UPDATE users SET name = ?, email = ? WHERE id = ?",
			[name, email, userId]
		);
		if (result.affectedRows === 0) {
			res.status(404).json({ message: "User not found" });
		} else {
			res.json({ message: "User updated successfully" });
		}
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Delete a user
app.delete("/users/:id", async (req, res) => {
	const userId = parseInt(req.params.id);
	try {
		const [result] = await promisePool.query("DELETE FROM users WHERE id = ?", [
			userId,
		]);
		if (result.affectedRows === 0) {
			res.status(404).json({ message: "User not found" });
		} else {
			res.json({ message: "User deleted successfully" });
		}
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
