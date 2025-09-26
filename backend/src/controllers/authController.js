import bcrypt from 'bcryptjs';
import { pool } from '../config/database.js';
import { generateToken } from '../middleware/auth.js';
import { validationResult } from 'express-validator';

export const signup = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists with this email or username' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email',
      [username, email, passwordHash]
    );

    // Create user stats entry
    await pool.query(
      'INSERT INTO user_stats (user_id) VALUES ($1)',
      [newUser.rows[0].id]
    );

    // Generate token
    const token = generateToken(newUser.rows[0]);

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: newUser.rows[0].id,
        username: newUser.rows[0].username,
        email: newUser.rows[0].email
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const user = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (user.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user.rows[0]);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.rows[0].id,
        username: user.rows[0].username,
        email: user.rows[0].email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await pool.query(
      `SELECT u.id, u.username, u.email, u.created_at,
              s.total_focus_time, s.total_sessions, s.current_streak, 
              s.longest_streak, s.buddy_level, s.buddy_happiness
       FROM users u
       LEFT JOIN user_stats s ON u.id = s.user_id
       WHERE u.id = $1`,
      [req.user.id]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user badges
    const badges = await pool.query(
      `SELECT b.* FROM badges b
       JOIN user_badges ub ON b.id = ub.badge_id
       WHERE ub.user_id = $1
       ORDER BY ub.earned_at DESC`,
      [req.user.id]
    );

    res.json({
      ...user.rows[0],
      badges: badges.rows
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};