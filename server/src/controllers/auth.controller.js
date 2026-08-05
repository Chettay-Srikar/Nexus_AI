import bcrypt from 'bcryptjs';
import { getOne, run } from '../config/db.js';
import { generateToken } from '../utils/jwt.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const register = async (req, res) => {
  try {
    const { name, email, password, role, department, phone } = req.body;

    const existing = await getOne('SELECT id FROM users WHERE email = ?;', [email]);
    if (existing) {
      return errorResponse(res, 'Email is already registered', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;

    const result = await run(
      `INSERT INTO users (name, email, password_hash, role, department, phone, avatar_url) VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [name, email, hashedPassword, role || 'Employee', department || 'Engineering', phone || null, avatarUrl]
    );

    const newUser = await getOne('SELECT id, name, email, role, department, avatar_url, created_at FROM users WHERE id = ?;', [result.lastID]);
    const token = generateToken(newUser);

    // Audit Log
    await run(`INSERT INTO audit_logs (user_id, user_name, action, resource, details) VALUES (?, ?, ?, ?, ?);`, [
      newUser.id, newUser.name, 'USER_REGISTER', 'Authentication', `Registered with role ${newUser.role}`
    ]);

    return successResponse(res, 'Account created successfully', { token, user: newUser }, 201);
  } catch (err) {
    return errorResponse(res, 'Failed to register user', 500);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await getOne('SELECT * FROM users WHERE email = ?;', [email]);

    if (!user) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      avatar_url: user.avatar_url,
      created_at: user.created_at
    };

    const token = generateToken(safeUser);

    // Audit Log
    await run(`INSERT INTO audit_logs (user_id, user_name, action, resource, details) VALUES (?, ?, ?, ?, ?);`, [
      safeUser.id, safeUser.name, 'USER_LOGIN', 'Authentication', 'Successful password login'
    ]);

    return successResponse(res, 'Login successful', { token, user: safeUser });
  } catch (err) {
    return errorResponse(res, 'Failed to process login', 500);
  }
};

export const logout = async (req, res) => {
  return successResponse(res, 'Logged out successfully');
};

export const getMe = async (req, res) => {
  return successResponse(res, 'Current user profile fetched', { user: req.user });
};

export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await getOne('SELECT * FROM users WHERE id = ?;', [req.user.id]);

    const isValid = await bcrypt.compare(oldPassword, user.password_hash);
    if (!isValid) {
      return errorResponse(res, 'Current password is incorrect', 400);
    }

    const newHashed = await bcrypt.hash(newPassword, 10);
    await run('UPDATE users SET password_hash = ? WHERE id = ?;', [newHashed, req.user.id]);

    return successResponse(res, 'Password changed successfully');
  } catch (err) {
    return errorResponse(res, 'Failed to change password', 500);
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, department } = req.body;
    await run('UPDATE users SET name = ?, department = ? WHERE id = ?;', [name, department, req.user.id]);
    const updatedUser = await getOne('SELECT id, name, email, role, department, avatar_url FROM users WHERE id = ?;', [req.user.id]);

    return successResponse(res, 'Profile updated successfully', { user: updatedUser });
  } catch (err) {
    return errorResponse(res, 'Failed to update profile', 500);
  }
};
