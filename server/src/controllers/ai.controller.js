import { geminiService } from '../services/gemini.service.js';
import { 
  aiChatSchema, 
  documentAnalysisSchema, 
  meetingAnalysisSchema, 
  projectAnalysisSchema, 
  taskPrioritizationSchema, 
  executiveReportSchema 
} from '../schemas/ai.schemas.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { query, getOne } from '../config/db.js';

export const chat = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return errorResponse(res, 'Prompt is required', 400);

    const activeProjects = await query('SELECT name, status, priority, risk_score FROM projects LIMIT 5;');
    const aiResult = await geminiService.generateValidatedJson({
      prompt,
      context: { user: req.user, activeProjects },
      schema: aiChatSchema,
      temperature: 0.5
    });

    return successResponse(res, 'AI Chat Response Generated', aiResult);
  } catch (err) {
    return errorResponse(res, 'Failed to process AI chat query', 500);
  }
};

export const summarizeMeeting = async (req, res) => {
  try {
    const { transcript } = req.body;
    if (!transcript) return errorResponse(res, 'Meeting transcript is required', 400);

    const aiResult = await geminiService.generateValidatedJson({
      prompt: transcript,
      schema: meetingAnalysisSchema,
      temperature: 0.3
    });

    return successResponse(res, 'Meeting Intelligence Processing Complete', aiResult);
  } catch (err) {
    return errorResponse(res, 'Failed to summarize meeting transcript', 500);
  }
};

export const analyzeDocument = async (req, res) => {
  try {
    const { textContent } = req.body;
    if (!textContent) return errorResponse(res, 'Text content is required', 400);

    const aiResult = await geminiService.generateValidatedJson({
      prompt: textContent,
      schema: documentAnalysisSchema,
      temperature: 0.2
    });

    return successResponse(res, 'Document Intelligence Analysis Complete', aiResult);
  } catch (err) {
    return errorResponse(res, 'Failed to analyze document', 500);
  }
};

export const analyzeProject = async (req, res) => {
  try {
    const { projectId } = req.body;
    const project = await getOne('SELECT * FROM projects WHERE id = ?;', [projectId]);

    const aiResult = await geminiService.generateValidatedJson({
      prompt: `Analyze risk score and delay predictions for project: ${project ? project.name : 'Cloud Migration'}`,
      context: project || {},
      schema: projectAnalysisSchema,
      temperature: 0.2
    });

    return successResponse(res, 'Project Risk Intelligence Complete', aiResult);
  } catch (err) {
    return errorResponse(res, 'Failed to analyze project', 500);
  }
};

export const prioritizeTasks = async (req, res) => {
  try {
    const tasks = await query('SELECT title, status, due_date, priority FROM tasks WHERE status != "Completed";');
    const aiResult = await geminiService.generateValidatedJson({
      prompt: 'Calculate task priority scores and delay risk metrics',
      context: { tasks },
      schema: taskPrioritizationSchema,
      temperature: 0.2
    });

    return successResponse(res, 'Task Prioritization Complete', aiResult);
  } catch (err) {
    return errorResponse(res, 'Failed to prioritize tasks', 500);
  }
};

export const generateExecutiveReport = async (req, res) => {
  try {
    const aiResult = await geminiService.generateValidatedJson({
      prompt: 'Synthesize quarterly enterprise analytics into an executive briefing report',
      context: { department: req.user.department },
      schema: executiveReportSchema,
      temperature: 0.2
    });

    return successResponse(res, 'Executive Report Generated Successfully', aiResult);
  } catch (err) {
    return errorResponse(res, 'Failed to generate executive report', 500);
  }
};
