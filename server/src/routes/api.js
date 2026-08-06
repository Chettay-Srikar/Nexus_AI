import { Router } from 'express';
import { register, login, getMe, updateProfile } from '../controllers/authController.js';
import { handleCommandCenter, handleDocumentIntelligence, handleMeetingIntelligence, getAIConversations, getAIConversationById, deleteAIConversation } from '../controllers/aiController.js';
import { getProjects, createProject, updateProject, deleteProject, getTasks, createTask, updateTask, deleteTask, updateTaskStatus, addTaskComment, getProjectById, getTaskById } from '../controllers/projectController.js';
import { getEnterpriseAnalytics, getWorkflows, triggerWorkflow, toggleWorkflowStatus, deleteWorkflow, getNotifications, getDocuments, deleteDocument, getMeetings, deleteMeeting, globalSearch } from '../controllers/analyticsController.js';
import { getMeetingById, getDocumentById, getKnowledgeItems, getUsers, getDepartments } from '../controllers/extendedController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = Router();

// Health Check & Global Search
router.get('/health', (req, res) => res.json({ status: 'ok', service: 'NexusAI Enterprise Backend', timestamp: new Date() }));
router.get('/search', authenticateToken, globalSearch);

// Auth Routes
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/me', authenticateToken, getMe);
router.put('/auth/profile', authenticateToken, updateProfile);

// AI Intelligence Routes (Protected)
router.post('/ai/command-center', authenticateToken, handleCommandCenter);
router.get('/ai/conversations', authenticateToken, getAIConversations);
router.get('/ai/conversations/:id', authenticateToken, getAIConversationById);
router.delete('/ai/conversations/:id', authenticateToken, deleteAIConversation);
router.post('/ai/document-intelligence', authenticateToken, handleDocumentIntelligence);
router.post('/ai/meeting-intelligence', authenticateToken, handleMeetingIntelligence);
router.post('/ai/generate-workflow', authenticateToken, handleGenerateWorkflow);

// Project Routes
router.get('/projects', authenticateToken, getProjects);
router.get('/projects/:id', authenticateToken, getProjectById);
router.post('/projects', authenticateToken, authorizeRoles('Administrator', 'Executive', 'Manager'), createProject);
router.put('/projects/:id', authenticateToken, authorizeRoles('Administrator', 'Executive', 'Manager'), updateProject);
router.delete('/projects/:id', authenticateToken, authorizeRoles('Administrator', 'Executive', 'Manager'), deleteProject);

// Task Routes
router.get('/tasks', authenticateToken, getTasks);
router.get('/tasks/:id', authenticateToken, getTaskById);
router.post('/tasks', authenticateToken, createTask);
router.put('/tasks/:id', authenticateToken, updateTask);
router.delete('/tasks/:id', authenticateToken, deleteTask);
router.put('/tasks/:id/status', authenticateToken, updateTaskStatus);
router.post('/tasks/:id/comments', authenticateToken, addTaskComment);

// Documents & Meetings Routes
router.get('/documents', authenticateToken, getDocuments);
router.get('/documents/:id', authenticateToken, getDocumentById);
router.delete('/documents/:id', authenticateToken, authorizeRoles('Administrator', 'Executive', 'Manager'), deleteDocument);

router.get('/meetings', authenticateToken, getMeetings);
router.get('/meetings/:id', authenticateToken, getMeetingById);
router.delete('/meetings/:id', authenticateToken, authorizeRoles('Administrator', 'Executive', 'Manager'), deleteMeeting);

// Knowledge, Workflows & Analytics
router.get('/knowledge', authenticateToken, getKnowledgeItems);
router.get('/workflows', authenticateToken, getWorkflows);
router.post('/workflows/:id/trigger', authenticateToken, triggerWorkflow);
router.put('/workflows/:id/toggle', authenticateToken, toggleWorkflowStatus);
router.delete('/workflows/:id', authenticateToken, authorizeRoles('Administrator', 'Executive'), deleteWorkflow);

// Admin & Governance
router.get('/analytics', authenticateToken, getEnterpriseAnalytics);
router.get('/notifications', authenticateToken, getNotifications);
router.get('/users', authenticateToken, authorizeRoles('Administrator', 'Executive', 'Manager'), getUsers);
router.get('/departments', authenticateToken, getDepartments);

export default router;
