import jwt from 'jsonwebtoken';
import { getOne } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'nexusai_super_secret_jwt_key_2026';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await getOne('SELECT id, name, email, role, department, avatar_url FROM users WHERE id = ?;', [decoded.id]);
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'User session expired or no longer exists' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Invalid or expired authentication token' });
  }
};

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
