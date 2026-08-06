import jwt from 'jsonwebtoken';
import { supabase } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'nexusai_super_secret_jwt_key_2026';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication token required' });
  }

  try {
    console.log("JWT_SECRET used for VERIFY:", JWT_SECRET);
    console.log("Incoming Token:", token.substring(0, 30) + "...");

    const decoded = jwt.verify(token, JWT_SECRET);

    // Attempt Supabase database profile lookup
    let user = null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', decoded.id)
        .single();

      if (!error && data) {
        user = {
          ...data,
          name: data.full_name || data.name || decoded.name || 'User'
        };
      }
    } catch (dbErr) {
      // Fall through to decoded token fallback
    }

    // Fallback to decoded token payload (e.g. for demo accounts or offline DB)
    if (!user) {
      user = {
        id: decoded.id,
        name: decoded.name || decoded.full_name || (decoded.email ? decoded.email.split('@')[0] : 'Enterprise User'),
        email: decoded.email,
        role: decoded.role || 'Employee',
        department: decoded.department || 'Engineering',
        avatar_url: decoded.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(decoded.email || 'User')}`
      };
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Invalid or expired authentication token' });
  }
};

export const authenticate = authenticateToken;

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Role '${req.user.role}' lacks required permissions (${roles.join(', ')})`
      });
    }

    next();
  };
};

export { JWT_SECRET };
