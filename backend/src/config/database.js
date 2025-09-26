import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Create tables if they don't exist
const createTables = async () => {
  try {
    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Sessions table (Pomodoro sessions)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        duration INTEGER NOT NULL,
        session_type VARCHAR(20) NOT NULL, -- 'focus' or 'break'
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // User stats table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_stats (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
        total_focus_time INTEGER DEFAULT 0,
        total_sessions INTEGER DEFAULT 0,
        current_streak INTEGER DEFAULT 0,
        longest_streak INTEGER DEFAULT 0,
        last_session_date DATE,
        buddy_level INTEGER DEFAULT 1,
        buddy_happiness INTEGER DEFAULT 50,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Badges table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS badges (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        icon VARCHAR(50),
        requirement_type VARCHAR(50), -- 'sessions', 'streak', 'focus_time'
        requirement_value INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // User badges table (many-to-many)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_badges (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        badge_id INTEGER REFERENCES badges(id) ON DELETE CASCADE,
        earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, badge_id)
      )
    `);

    // Insert default badges
    const badgesExist = await pool.query('SELECT COUNT(*) FROM badges');
    if (badgesExist.rows[0].count === '0') {
      await pool.query(`
        INSERT INTO badges (name, description, icon, requirement_type, requirement_value) VALUES
        ('First Focus', 'Complete your first focus session', '🎯', 'sessions', 1),
        ('Consistent Cub', 'Maintain a 3-day streak', '🐻', 'streak', 3),
        ('Focus Master', 'Complete 10 focus sessions', '🏆', 'sessions', 10),
        ('Time Warrior', 'Focus for 5 hours total', '⏰', 'focus_time', 300),
        ('Streak Champion', 'Maintain a 7-day streak', '🔥', 'streak', 7),
        ('Dedicated Bear', 'Complete 50 focus sessions', '🐻‍❄️', 'sessions', 50),
        ('Marathon Runner', 'Focus for 20 hours total', '🏃', 'focus_time', 1200),
        ('Unstoppable', 'Maintain a 30-day streak', '💪', 'streak', 30),
        ('Zen Master', 'Focus for 50 hours total', '🧘', 'focus_time', 3000),
        ('Legend', 'Complete 100 focus sessions', '⭐', 'sessions', 100)
      `);
    }

    console.log('✅ Database tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
};

export { pool, createTables };