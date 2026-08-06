import { query, getOne, supabase } from '../config/db.js';
import { geminiService } from '../services/geminiService.js';
import { 
  aiChatSchema, 
  documentAnalysisSchema, 
  meetingAnalysisSchema, 
  projectAnalysisSchema, 
  taskPrioritizationSchema, 
  executiveReportSchema 
} from '../schemas/ai.schemas.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const handleAICommandCenter = async (req, res) => {
  try {
    console.log("Request Body:", req.body);
    const userPrompt = req.body.prompt || req.body.message || req.body.query;
    let conversationId = req.body.conversationId || req.body.conversation_id;

    if (!userPrompt) return res.status(400).json({ success: false, message: 'Prompt is required' });

    let userId = req.user ? req.user.id : null;

    // Persist or retrieve conversation session
    if (!conversationId && supabase) {
      try {
        const { data: convData } = await supabase
          .from('ai_conversations')
          .insert([{
            user_id: userId,
            title: userPrompt.substring(0, 40) + '...',
            context_type: 'COMMAND_CENTER'
          }])
          .select()
          .single();
        if (convData) conversationId = convData.id;
      } catch (e) {
        console.warn('Conversation session create notice:', e.message);
      }
    }

    if (conversationId && supabase) {
      try {
        await supabase.from('ai_messages').insert([{
          conversation_id: conversationId,
          sender: 'user',
          text: userPrompt
        }]);
      } catch (e) {
        console.warn('User message save notice:', e.message);
      }
    }

    let projects = [];
    let tasks = [];
    let meetings = [];
    try {
      projects = await query('SELECT * FROM projects;');
      tasks = await query('SELECT * FROM tasks;');
      meetings = await query('SELECT * FROM meetings;');
    } catch (e) {
      console.warn('Context lookup notice:', e.message);
    }

    const aiResponse = await geminiService.generateCommandCenterResponse(userPrompt, { projects, tasks, meetings });

    if (conversationId && supabase) {
      try {
        await supabase.from('ai_messages').insert([{
          conversation_id: conversationId,
          sender: 'ai',
          text: aiResponse.text
        }]);
      } catch (e) {
        console.warn('AI message save notice:', e.message);
      }
    }

    try {
      await query(`INSERT INTO audit_logs (user_id, user_name, action, resource, details) VALUES (?, ?, ?, ?, ?);`, [
        userId,
        req.user ? req.user.name : 'System',
        'AI_QUERY',
        'COMMAND_CENTER',
        `Prompt: ${userPrompt.substring(0, 50)}...`
      ]);
    } catch (e) {
      console.warn('Audit log notice:', e.message);
    }

    return res.json({
      success: true,
      data: {
        conversationId,
        text: aiResponse.text,
        structuredData: aiResponse.structuredData,
        source: aiResponse.source || 'gemini-2.5-flash'
      }
    });
  } catch (err) {
    console.error('AI Command Center Error:', err);
    return res.status(500).json({ success: false, message: 'AI processing failed', error: err.message });
  }
};

export const handleCommandCenter = handleAICommandCenter;

export const getAIConversations = async (req, res) => {
  try {
    let conversations = [];
    if (supabase) {
      const { data } = await supabase
        .from('ai_conversations')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) conversations = data;
    }
    return res.json({ success: true, data: { conversations } });
  } catch (err) {
    console.error('Get conversations error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch conversations' });
  }
};

export const getAIConversationById = async (req, res) => {
  try {
    const { id } = req.params;
    let messages = [];
    if (supabase) {
      const { data } = await supabase
        .from('ai_messages')
        .select('*')
        .eq('conversation_id', id)
        .order('created_at', { ascending: true });
      if (data) messages = data;
    }
    return res.json({ success: true, data: { messages } });
  } catch (err) {
    console.error('Get conversation messages error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch conversation messages' });
  }
};

export const deleteAIConversation = async (req, res) => {
  try {
    const { id } = req.params;
    if (supabase) {
      await supabase.from('ai_messages').delete().eq('conversation_id', id);
      await supabase.from('ai_conversations').delete().eq('id', id);
    }
    return res.json({ success: true, message: 'Conversation deleted successfully' });
  } catch (err) {
    console.error('Delete conversation error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete conversation' });
  }
};

export const analyzeDocumentAI = async (req, res) => {
  try {
    console.log("Incoming document:", req.body);
    const { title, file_type, content, textContent } = req.body;
    const docText = content || textContent || '';

    const analysis = await geminiService.analyzeDocument(title || 'Document', docText);

    let doc = null;
    try {
      const { data, error } = await supabase
        .from('documents')
        .insert([{
          title: title || 'Untitled Document',
          file_name: `${(title || 'doc').toLowerCase().replace(/\s+/g, '_')}.${(file_type || 'pdf').toLowerCase()}`,
          file_type: file_type || 'PDF',
          content_text: docText,
          summary: analysis.executiveSummary || analysis.summary || '',
          status: 'Indexed',
          uploaded_by: req.user ? req.user.id : null
        }])
        .select();

      if (!error && data) doc = data[0];
    } catch (e) {
      console.warn('Document insert notice:', e.message);
    }

    if (!doc) {
      doc = {
        id: `doc-${Date.now()}`,
        title: title || 'Untitled Document',
        file_type: file_type || 'PDF',
        summary: analysis.executiveSummary || analysis.summary,
        created_at: new Date().toISOString()
      };
    }

    const responsePayload = {
      success: true,
      data: {
        document: doc,
        analysis
      }
    };

    console.log("Returning:", responsePayload);
    return res.json(responsePayload);
  } catch (err) {
    console.error('Document AI Error:', err);
    return res.status(500).json({ success: false, message: 'Document analysis failed', error: err.message });
  }
};

export const handleDocumentIntelligence = analyzeDocumentAI;

export const analyzeMeetingAI = async (req, res) => {
  try {
    console.log("Meeting received:", req.body);
    const { title, date, meetingDate, transcript } = req.body;
    const mDate = meetingDate || date || new Date().toISOString().split('T')[0];

    const analysis = await geminiService.analyzeMeeting(title || 'Meeting', transcript || '');

    let meeting = null;
    try {
      const { data, error } = await supabase
        .from('meetings')
        .insert([{
          title: title || 'Executive Strategy Sync',
          meeting_date: mDate,
          transcript: transcript || '',
          status: 'Processed',
          created_by: req.user ? req.user.id : null
        }])
        .select();

      if (!error && data) meeting = data[0];
    } catch (e) {
      console.warn('Meeting insert notice:', e.message);
    }

    if (!meeting) {
      meeting = {
        id: `m-${Date.now()}`,
        title: title || 'Executive Strategy Sync',
        meeting_date: mDate,
        date: mDate,
        summary: analysis.executiveSummary || analysis.summary,
        created_at: new Date().toISOString()
      };
    }

    const responsePayload = {
      success: true,
      data: {
        meeting,
        analysis
      }
    };

    console.log("Returning:", responsePayload);
    return res.json(responsePayload);
  } catch (err) {
    console.error('Meeting AI Error:', err);
    return res.status(500).json({ success: false, message: 'Meeting analysis failed', error: err.message });
  }
};

export const handleMeetingIntelligence = analyzeMeetingAI;

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
    const { textContent, content } = req.body;
    const text = textContent || content;
    if (!text) return errorResponse(res, 'Text content is required', 400);

    const aiResult = await geminiService.generateValidatedJson({
      prompt: text,
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
    const tasks = await query('SELECT title, status, due_date, priority FROM tasks WHERE status != ?;', ['Completed']);
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
      context: { department: req.user ? req.user.department : 'Executive' },
      schema: executiveReportSchema,
      temperature: 0.2
    });

    return successResponse(res, 'Executive Report Generated Successfully', aiResult);
  } catch (err) {
    return errorResponse(res, 'Failed to generate executive report', 500);
  }
};
