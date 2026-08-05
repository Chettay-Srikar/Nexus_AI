import { errorResponse } from '../utils/response.js';

export const globalErrorHandler = (err, req, res, next) => {
  // Detailed log on server console ONLY - never leak stack traces to client
  console.error('[SERVER ERROR HANDLER]:', err);

  return errorResponse(
    res,
    'Something went wrong. Please try again.',
    err.statusCode || 500
  );
};

export const notFoundHandler = (req, res) => {
  return errorResponse(res, `Route '${req.originalUrl}' not found on server`, 404);
};
