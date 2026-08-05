import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { getOne, run, query } from '../config/db.js';
import { JWT_SECRET } from '../middleware/auth.js';

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['Administrator', 'Executive', 'Manager', 'Employee']).default('Employee'),
  department: z.string().default('Engineering')
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const register = async (req, res) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const existing = await getOne('SELECT id FROM users WHERE email = ?;', [validatedData.email]);

    if (existing) {
      return res.status(400).json({ success: false, message: 'Email is already registered' });
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10);
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(validatedData.name)}`;

    const result = await run(
      `INSERT INTO users (name, email, password_hash, role, department, avatar_url) VALUES (?, ?, ?, ?, ?, ?);`,
      [validatedData.name, validatedData.email, hashedPassword, validatedData.role, validatedData.department, avatarUrl]
    );

    const newUser = await getOne('SELECT id, name, email, role, department, avatar_url, created_at FROM users WHERE id = ?;', [result.lastID]);

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Audit Log
    await run(`INSERT INTO audit_logs (user_id, user_name, action, resource, details) VALUES (?, ?, ?, ?, ?);`, [
      newUser.id, newUser.name, 'USER_REGISTER', 'Authentication', `New user registered with role ${newUser.role}`
    ]);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: newUser
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: err.errors });
    }
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const user = await getOne('SELECT * FROM users WHERE email = ?;', [validatedData.email]);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(validatedData.password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      avatar_url: user.avatar_url,
      created_at: user.created_at
    };

    // Audit Log
    await run(`INSERT INTO audit_logs (user_id, user_name, action, resource, details) VALUES (?, ?, ?, ?, ?);`, [
      safeUser.id, safeUser.name, 'USER_LOGIN', 'Authentication', `User logged in from ${req.ip || 'web'}`
    ]);

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: safeUser
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: 'Validation error', errors: err.errors });
    }
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getMe = async (req, res) => {
  return res.json({
    success: true,
    user: req.user
  });
};

export const updateProfile = async (req, res) => {
  try {
    const { name, department } = req.body;
    await run('UPDATE users SET name = ?, department = ? WHERE id = ?;', [name, department, req.user.id]);
    const updatedUser = await getOne('SELECT id, name, email, role, department, avatar_url FROM users WHERE id = ?;', [req.user.id]);
    return res.json({ success: true, user: updatedUser });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
