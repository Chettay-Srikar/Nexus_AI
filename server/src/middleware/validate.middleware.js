import { errorResponse } from '../utils/response.js';

export const validateBody = (schema) => {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      const formattedErrors = err.errors ? err.errors.map(e => ({ field: e.path.join('.'), message: e.message })) : err.message;
      return errorResponse(res, 'Validation Error', 400, formattedErrors);
    }
  };
};
