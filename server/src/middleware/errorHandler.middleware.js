import { errorResponse } from '../utils/response.js';

export const globalErrorHandler = (err, req, res, next) => {
  console.error('[SERVER ERROR HANDLER]:', err);
  const status = err.statusCode || err.status || 500;
  const message = err.message || 'Something went wrong. Please try again.';
  return res.status(status).json({
    success: false,
    message: message
  });
};

export const notFoundHandler = (req, res) => {
  return res.status(404).json({
    success: false,
    message: `Route '${req.originalUrl}' not found on server`
  });
};
