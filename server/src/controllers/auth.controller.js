import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query, getOne } from '../config/db.js';
import { JWT_SECRET } from '../middleware/auth.js';

export const register = async (req, res) => {
  try {
    const { name, email, password, role = 'Employee', department = 'Engineering' } = req.body;

    const existingUser = await getOne('SELECT id FROM users WHERE email = ?;', [email]);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const rows = await query(
      `INSERT INTO users (name, email, password_hash, role, department, avatar_url) VALUES (?, ?, ?, ?, ?, ?) RETURNING *;`,
      [name, email, password_hash, role, department, `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`]
    );
    const user = rows[0] || { name, email, role, department };

    await query(`INSERT INTO audit_logs (user_id, user_name, action, resource, details) VALUES (?, ?, ?, ?, ?);`, [
      user.id || null,
      name,
      'REGISTER',
      'USER',
      `Registered user ${email}`
    ]);

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, department: user.department },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          avatar_url: user.avatar_url
        }
      }
    });
  } catch (err) {
    console.error('Register Error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error during registration' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await getOne('SELECT * FROM users WHERE email = ?;', [email]);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    await query(`INSERT INTO audit_logs (user_id, user_name, action, resource, details) VALUES (?, ?, ?, ?, ?);`, [
      user.id,
      user.name,
      'LOGIN',
      'AUTH',
      `User ${email} logged in successfully`
    ]);

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, department: user.department },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          avatar_url: user.avatar_url
        }
      }
    });
  } catch (err) {
    console.error('Login Error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error during login' });
  }
};

export const logout = async (req, res) => {
  return res.status(200).json({ success: true, message: 'Logged out successfully' });
};

export const getMe = async (req, res) => {
  try {
    const user = await getOne('SELECT id, name, email, role, department, avatar_url, phone, created_at FROM users WHERE id = ?;', [req.user.id]);
    return res.status(200).json({ success: true, data: { user } });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error fetching user' });
  }
};

export const getProfile = async (req, res) => {
  return getMe(req, res);
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await getOne('SELECT * FROM users WHERE id = ?;', [req.user.id]);

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    const newHashed = await bcrypt.hash(newPassword, salt);
    await query('UPDATE users SET password_hash = ? WHERE id = ?;', [newHashed, req.user.id]);

    return res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error updating password' });
  }
};

export const updatePassword = async (req, res) => {
  return changePassword(req, res);
};

export const updateProfile = async (req, res) => {
  try {
    const { name, department } = req.body;
    await query('UPDATE users SET name = ?, department = ? WHERE id = ?;', [name, department, req.user.id]);
    const updated = await getOne('SELECT id, name, email, role, department, avatar_url FROM users WHERE id = ?;', [req.user.id]);
    return res.status(200).json({ success: true, data: { user: updated } });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error updating profile' });
  }
};
