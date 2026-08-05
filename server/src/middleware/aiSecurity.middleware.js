import { errorResponse } from '../utils/response.js';

const FORBIDDEN_PATTERNS = [
  /ignore previous instructions/i,
  /reveal api key/i,
  /show system prompt/i,
  /print environment variables/i,
  /select \* from/i,
  /<script>/i,
  /drop table/i
];

export const aiSecurityFilter = (req, res, next) => {
  const payload = JSON.stringify(req.body);

  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(payload)) {
      return errorResponse(
        res,
        'Security Alert: Malicious prompt injection or unauthorized system request rejected.',
        400
      );
    }
  }

  next();
};
