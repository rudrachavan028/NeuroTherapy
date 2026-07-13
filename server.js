
// ------------------------------------------------------------------
// BACKEND SERVER SETUP
// ------------------------------------------------------------------
//
// PREREQUISITES:
// You must install the backend dependencies before running this file.
// Run the following command in your terminal:
//
//    npm install express mysql2 cors bcrypt jsonwebtoken dotenv
//
// TO RUN:
//    node server.js
//
// ------------------------------------------------------------------

import dotenv from 'dotenv';
import express from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = 5000;

// Middleware
app.use(express.json());
// Allow CORS for all origins so mobile devices can connect
app.use(cors());

// Database Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'neuro_therapy',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test Database Connection
pool.getConnection()
  .then(async conn => {
    console.log("✅ Connected to MySQL Database!");
    conn.release();

    // Auto-Migration for missing columns
    try {
      const [cols1] = await pool.execute("SHOW COLUMNS FROM users LIKE 'ptsd_level'");
      if (cols1.length === 0) {
        console.log("⚠️ Adding missing column: ptsd_level");
        await pool.execute("ALTER TABLE users ADD COLUMN ptsd_level VARCHAR(50) DEFAULT 'Low'");
      }
      
      const [cols2] = await pool.execute("SHOW COLUMNS FROM users LIKE 'assessment_completed'");
      if (cols2.length === 0) {
        console.log("⚠️ Adding missing column: assessment_completed");
        await pool.execute("ALTER TABLE users ADD COLUMN assessment_completed BOOLEAN DEFAULT FALSE");
      }
    } catch (e) {
      console.error("Migration warning:", e.message);
    }
  })
  .catch(err => {
    console.error("❌ Error connecting to database:", err.message);
    console.error("   (Make sure your MySQL server is running and .env has correct credentials)");
  });

// Routes
const router = express.Router();

// Signup Endpoint
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // Check if user exists
    const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: "Email already exists" });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert user
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    // Create Token
    const user = { id: result.insertId, name, email, ptsdLevel: 'Low', assessmentCompleted: false };
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' });

    res.status(201).json({ 
      message: "User created successfully",
      user: { ...user, token } 
    });

  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Login Endpoint
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' });

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        ptsdLevel: user.ptsd_level,
        assessmentCompleted: Boolean(user.assessment_completed),
        token
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Save Assessment Endpoint
router.post('/assessment', async (req, res) => {
  const { userId, ptsdLevel } = req.body;

  if (!userId || !ptsdLevel) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    await pool.execute(
      'UPDATE users SET ptsd_level = ?, assessment_completed = TRUE WHERE id = ?',
      [ptsdLevel, userId]
    );

    res.json({ message: "Assessment saved successfully" });
  } catch (error) {
    console.error("Save assessment error:", error);
    res.status(500).json({ error: "Failed to save assessment" });
  }
});

// --- Progress Tracking Endpoints ---

// Save Progress
router.post('/progress', async (req, res) => {
  const { userId, gameId, level, score, reactionTime, accuracy, stability, alpha, beta, theta, delta, gamma } = req.body;
  
  if (!userId || !gameId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    await pool.execute(
      `INSERT INTO game_progress 
      (user_id, game_id, level, score, reaction_time, accuracy, stability, alpha, beta, theta, delta, gamma) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId, 
        gameId, 
        level || 1, 
        score || 0, 
        reactionTime || 0, 
        accuracy || 100, 
        stability || 0,
        alpha || 50,
        beta || 50,
        theta || 50,
        delta || 50,
        gamma || 50
      ]
    );
    res.status(201).json({ message: "Progress saved" });
  } catch (error) {
    console.error("Save progress error:", error);
    res.status(500).json({ error: "Failed to save progress" });
  }
});

// Get User History
router.get('/progress/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM game_progress WHERE user_id = ? ORDER BY played_at DESC LIMIT 50',
      [userId]
    );
    res.json(rows);
  } catch (error) {
    console.error("Get progress error:", error);
    res.status(500).json({ error: "Failed to fetch progress" });
  }
});

// Mount routes at /api
app.use('/api', router);

// Start Server on 0.0.0.0 to accept external connections
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`   (Accessible via http://localhost:${PORT} or http://YOUR_LAPTOP_IP:${PORT})`);
});
