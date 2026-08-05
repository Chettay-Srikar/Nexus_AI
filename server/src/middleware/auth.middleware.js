import { verifyToken } from '../utils/jwt.js';
import { errorResponse } from '../utils/response.js';
import { getOne } from '../config/db.js';

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return errorResponse(res, 'Authentication token required', 401);
  }

  try {
    const decoded = verifyToken(token);
    const user = await getOne('SELECT id, name, email, role, department, avatar_url FROM users WHERE id = ?;', [decoded.id]);

    if (!user) {
      return errorResponse(res, 'User session expired or user no longer exists', 401);
    }

    req.user = user;
    next();
  } catch (err) {
    return errorResponse(res, 'Invalid or expired token', 403);
  }
};

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Authentication required', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(
        res, 
        `Forbidden: Role '${req.user.role}' lacks permission. Required: ${allowedRoles.join(', ')}`, 
        403
      );
    }

    next();
  };
};
