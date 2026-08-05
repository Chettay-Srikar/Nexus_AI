import { generateEnterpriseAIResponse } from '../services/geminiService.js';
import { query, run, getOne } from '../config/db.js';

export const handleCommandCenter = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ success: false, message: 'Prompt is required' });
    }

    // Gather enterprise context from DB to inject into Gemini prompt
    const projects = await query('SELECT name, status, priority, progress, risk_score, department FROM projects;');
    const tasks = await query('SELECT title, status, priority, due_date, delay_prediction FROM tasks WHERE status != "Completed";');
    const meetings = await query('SELECT title, date, summary FROM meetings ORDER BY date DESC LIMIT 3;');

    const enterpriseContext = {
      userRole: req.user.role,
      userDepartment: req.user.department,
      activeProjects: projects,
      pendingTasks: tasks,
      recentMeetings: meetings
    };

    const systemInstruction = `You are NexusAI Enterprise Copilot. Analyze the provided company metrics, project statuses, and task bottlenecks to answer user queries with actionable executive reasoning. Return clear markdown summaries, recommendations, and structured metadata.`;

    const aiResult = await generateEnterpriseAIResponse({
      prompt,
      context: enterpriseContext,
      systemInstruction
    });

    // Log AI Command audit
    await run(`INSERT INTO audit_logs (user_id, user_name, action, resource, details) VALUES (?, ?, ?, ?, ?);`, [
      req.user.id, req.user.name, 'AI_COMMAND_CENTER_QUERY', 'AI Intelligence', `Prompt: ${prompt.substring(0, 50)}...`
    ]);

    return res.json({
      success: true,
      data: aiResult
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const handleDocumentIntelligence = async (req, res) => {
  try {
    const { title, textContent } = req.body;
    if (!textContent) {
      return res.status(400).json({ success: false, message: 'Text content is required for processing' });
    }

    const systemInstruction = `You are NexusAI Document Intelligence Processor. Extract key entities (Organizations, Dates, Amounts, Action Items), provide a concise summary, and extract deadlines.`;

    const aiResult = await generateEnterpriseAIResponse({
      prompt: `Analyze and extract entities/deadlines from this document: ${textContent.substring(0, 3000)}`,
      context: { title },
      systemInstruction
    });

    // Save document to DB
    const summaryText = aiResult.text.substring(0, 500);
    const result = await run(
      `INSERT INTO documents (title, file_name, file_type, content_text, summary, entities_json, uploaded_by) VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [title || 'Uploaded Document', title || 'document.txt', 'TXT', textContent, summaryText, JSON.stringify({ extracted: true }), req.user.id]
    );

    return res.json({
      success: true,
      documentId: result.lastID,
      analysis: aiResult
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const handleMeetingIntelligence = async (req, res) => {
  try {
    const { title, transcript, date } = req.body;
    if (!transcript) {
      return res.status(400).json({ success: false, message: 'Transcript text is required' });
    }

    const systemInstruction = `You are NexusAI Meeting Intelligence Engine. Parse meeting transcripts into concise Executive Summaries, Key Decisions, Assigned Action Items with Owners, and follow-up email drafts.`;

    const aiResult = await generateEnterpriseAIResponse({
      prompt: `Process this meeting transcript into executive summary, key decisions, and action items:\n\n${transcript}`,
      context: { title, date: date || new Date().toISOString().split('T')[0] },
      systemInstruction
    });

    // Save meeting intelligence to DB
    const result = await run(
      `INSERT INTO meetings (title, date, transcript, summary, key_decisions, action_items, created_by) VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [
        title || 'Department Sync',
        date || new Date().toISOString().split('T')[0],
        transcript,
        aiResult.text,
        'Key decisions parsed from transcript',
        'Action items assigned from transcript',
        req.user.id
      ]
    );

    return res.json({
      success: true,
      meetingId: result.lastID,
      analysis: aiResult
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
