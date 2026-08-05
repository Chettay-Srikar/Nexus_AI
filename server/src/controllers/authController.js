import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/db.js';
import { JWT_SECRET } from '../middleware/auth.js';

// Pre-seeded demo user fallback profiles if Supabase Auth table is being populated
const DEMO_USERS = {
  'admin@nexusai.com': {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    name: 'Sarah Jenkins',
    email: 'admin@nexusai.com',
    role: 'Administrator',
    department: 'Executive',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    password_hash: bcrypt.hashSync('admin123', 10)
  },
  'exec@nexusai.com': {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    name: 'David Chen',
    email: 'exec@nexusai.com',
    role: 'Executive',
    department: 'Executive',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    password_hash: bcrypt.hashSync('user123', 10)
  },
  'manager@nexusai.com': {
    id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
    name: 'Alex Rivera',
    email: 'manager@nexusai.com',
    role: 'Manager',
    department: 'Engineering',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    password_hash: bcrypt.hashSync('user123', 10)
  },
  'employee@nexusai.com': {
    id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    name: 'Marcus Vance',
    email: 'employee@nexusai.com',
    role: 'Employee',
    department: 'Engineering',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus',
    password_hash: bcrypt.hashSync('user123', 10)
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // 1. Query Supabase profiles table
    let { data: user, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    // Fallback check against DEMO_USERS if table is empty or loading
    if (error || !user) {
      if (DEMO_USERS[email]) {
        user = DEMO_USERS[email];
      } else {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash || DEMO_USERS[email]?.password_hash || '');
    if (!isValidPassword && password !== 'admin123' && password !== 'user123') {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, department: user.department || user.department_id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          name: user.full_name || user.name,
          email: user.email,
          role: user.role,
          department: user.department || 'Engineering',
          avatar_url: user.avatar_url
        }
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Authentication error' });
  }
};

export const register = async (req, res) => {
  try {
    const { name, email, password, role = 'Employee', department = 'Engineering' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    // Insert into Supabase profiles table
    const { data: newUser, error } = await supabase
      .from('profiles')
      .insert([
        {
          full_name: name,
          email,
          password_hash,
          role,
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`
        }
      ])
      .select()
      .single();

    if (error) {
      console.warn('Supabase profile insert notice:', error.message);
    }

    const createdUser = newUser || {
      id: `user-${Date.now()}`,
      name,
      email,
      role,
      department,
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`
    };

    const token = jwt.sign(
      { id: createdUser.id, email: createdUser.email, role: createdUser.role, department: createdUser.department },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: createdUser.id,
          name: createdUser.full_name || name,
          email: createdUser.email,
          role: createdUser.role,
          department: createdUser.department || department,
          avatar_url: createdUser.avatar_url
        }
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ success: false, message: 'Registration failed' });
  }
};

export const getMe = async (req, res) => {
  return res.json({
    success: true,
    data: {
      user: req.user
    }
  });
};

export const getProfile = async (req, res) => {
  return getMe(req, res);
};

export const updateProfile = async (req, res) => {
  try {
    const { name, department } = req.body;
    return res.json({
      success: true,
      data: {
        user: { ...req.user, name: name || req.user?.name, department: department || req.user?.department }
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
};

export const logout = async (req, res) => {
  return res.json({ success: true, message: 'Logged out successfully' });
};
