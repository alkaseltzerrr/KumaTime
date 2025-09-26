import { pool } from '../config/database.js';

export const createSession = async (req, res) => {
  try {
    const { duration, sessionType } = req.body;
    const userId = req.user.id;

    // Create session
    const newSession = await pool.query(
      'INSERT INTO sessions (user_id, duration, session_type) VALUES ($1, $2, $3) RETURNING *',
      [userId, duration, sessionType]
    );

    // Update user stats if it's a focus session
    if (sessionType === 'focus') {
      // Get current stats
      const currentStats = await pool.query(
        'SELECT * FROM user_stats WHERE user_id = $1',
        [userId]
      );

      const stats = currentStats.rows[0];
      const today = new Date().toISOString().split('T')[0];
      const lastSessionDate = stats.last_session_date ? 
        new Date(stats.last_session_date).toISOString().split('T')[0] : null;

      // Calculate streak
      let newStreak = stats.current_streak;
      if (lastSessionDate) {
        const dayDiff = Math.floor((new Date(today) - new Date(lastSessionDate)) / (1000 * 60 * 60 * 24));
        if (dayDiff === 0) {
          // Same day, no change
        } else if (dayDiff === 1) {
          // Consecutive day
          newStreak = stats.current_streak + 1;
        } else {
          // Streak broken
          newStreak = 1;
        }
      } else {
        // First session
        newStreak = 1;
      }

      const longestStreak = Math.max(newStreak, stats.longest_streak);
      
      // Update buddy happiness (increases with each session)
      const newHappiness = Math.min(100, stats.buddy_happiness + 5);
      
      // Check for buddy level up (every 10 sessions)
      const totalSessions = stats.total_sessions + 1;
      const newBuddyLevel = Math.floor(totalSessions / 10) + 1;

      // Update stats
      await pool.query(
        `UPDATE user_stats 
         SET total_focus_time = total_focus_time + $1,
             total_sessions = total_sessions + 1,
             current_streak = $2,
             longest_streak = $3,
             last_session_date = CURRENT_DATE,
             buddy_happiness = $4,
             buddy_level = $5,
             updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $6`,
        [duration, newStreak, longestStreak, newHappiness, newBuddyLevel, userId]
      );

      // Check for new badges
      await checkAndAwardBadges(userId);
    }

    res.status(201).json({
      message: 'Session recorded successfully',
      session: newSession.rows[0]
    });
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getSessionHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, offset = 0 } = req.query;

    const sessions = await pool.query(
      `SELECT * FROM sessions 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    const total = await pool.query(
      'SELECT COUNT(*) FROM sessions WHERE user_id = $1',
      [userId]
    );

    res.json({
      sessions: sessions.rows,
      total: parseInt(total.rows[0].count),
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Get session history error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user stats
    const stats = await pool.query(
      'SELECT * FROM user_stats WHERE user_id = $1',
      [userId]
    );

    // Get today's sessions
    const todaySessions = await pool.query(
      `SELECT COUNT(*), SUM(duration) as total_duration 
       FROM sessions 
       WHERE user_id = $1 
       AND DATE(created_at) = CURRENT_DATE 
       AND session_type = 'focus'`,
      [userId]
    );

    // Get this week's stats
    const weekStats = await pool.query(
      `SELECT COUNT(*), SUM(duration) as total_duration 
       FROM sessions 
       WHERE user_id = $1 
       AND created_at >= CURRENT_DATE - INTERVAL '7 days'
       AND session_type = 'focus'`,
      [userId]
    );

    res.json({
      overall: stats.rows[0] || {
        total_focus_time: 0,
        total_sessions: 0,
        current_streak: 0,
        longest_streak: 0,
        buddy_level: 1,
        buddy_happiness: 50
      },
      today: {
        sessions: parseInt(todaySessions.rows[0].count) || 0,
        duration: parseInt(todaySessions.rows[0].total_duration) || 0
      },
      week: {
        sessions: parseInt(weekStats.rows[0].count) || 0,
        duration: parseInt(weekStats.rows[0].total_duration) || 0
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Helper function to check and award badges
async function checkAndAwardBadges(userId) {
  try {
    // Get user stats
    const stats = await pool.query(
      'SELECT * FROM user_stats WHERE user_id = $1',
      [userId]
    );
    const userStats = stats.rows[0];

    // Get all badges
    const badges = await pool.query('SELECT * FROM badges');

    // Get user's existing badges
    const userBadges = await pool.query(
      'SELECT badge_id FROM user_badges WHERE user_id = $1',
      [userId]
    );
    const existingBadgeIds = userBadges.rows.map(b => b.badge_id);

    // Check each badge
    for (const badge of badges.rows) {
      if (existingBadgeIds.includes(badge.id)) continue;

      let earned = false;

      switch (badge.requirement_type) {
        case 'sessions':
          earned = userStats.total_sessions >= badge.requirement_value;
          break;
        case 'streak':
          earned = userStats.current_streak >= badge.requirement_value || 
                  userStats.longest_streak >= badge.requirement_value;
          break;
        case 'focus_time':
          earned = userStats.total_focus_time >= badge.requirement_value;
          break;
      }

      if (earned) {
        await pool.query(
          'INSERT INTO user_badges (user_id, badge_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [userId, badge.id]
        );
      }
    }
  } catch (error) {
    console.error('Error checking badges:', error);
  }
}