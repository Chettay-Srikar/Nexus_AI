import { Router } from 'express';
import { 
  chat, 
  summarizeMeeting, 
  analyzeDocument, 
  analyzeProject, 
  prioritizeTasks, 
  generateExecutiveReport 
} from '../controllers/ai.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { aiRateLimiter } from '../middleware/rateLimiter.middleware.js';
import { aiSecurityFilter } from '../middleware/aiSecurity.middleware.js';

const router = Router();

// Apply authentication, rate limiting, and prompt injection security filters
router.use(authenticate, aiRateLimiter, aiSecurityFilter);

router.post('/chat', chat);
router.post('/summarize', summarizeMeeting);
router.post('/generate-report', generateExecutiveReport);
router.post('/analyze-document', analyzeDocument);
router.post('/analyze-project', analyzeProject);
router.post('/prioritize-tasks', prioritizeTasks);
router.post('/risk-analysis', analyzeProject);
router.post('/workflow-suggestions', chat);

export default router;
