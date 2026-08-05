import { query, getOne } from '../config/db.js';
import { geminiService } from '../services/geminiService.js';

export const handleAICommandCenter = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ success: false, message: 'Prompt is required' });

    const projects = await query('SELECT * FROM projects;');
    const tasks = await query('SELECT * FROM tasks;');
    const meetings = await query('SELECT * FROM meetings;');

    const aiResponse = await geminiService.generateCommandCenterResponse(prompt, { projects, tasks, meetings });

    await query(`INSERT INTO audit_logs (user_id, user_name, action, resource, details) VALUES (?, ?, ?, ?, ?);`, [
      req.user ? req.user.id : null,
      req.user ? req.user.name : 'System',
      'AI_QUERY',
      'COMMAND_CENTER',
      `Prompt: ${prompt.substring(0, 50)}...`
    ]);

    return res.json({
      success: true,
      data: {
        text: aiResponse.text,
        structuredData: aiResponse.structuredData,
        source: 'gemini-1.5-flash'
      }
    });
  } catch (err) {
    console.error('AI Command Center Error:', err);
    return res.status(500).json({ success: false, message: 'AI processing failed', error: err.message });
  }
};

export const analyzeDocumentAI = async (req, res) => {
  try {
    const { title, file_type, content } = req.body;

    const analysis = await geminiService.analyzeDocument(title, content);

    const rows = await query(
      `INSERT INTO documents (title, file_name, file_type, content_text, summary, entities_json, deadlines_json, uploaded_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING *;`,
      [
        title,
        `${title.toLowerCase().replace(/\s+/g, '_')}.${file_type.toLowerCase()}`,
        file_type,
        content,
        analysis.summary,
        JSON.stringify(analysis.entities),
        JSON.stringify(analysis.deadlines),
        req.user ? req.user.id : null
      ]
    );

    const doc = rows[0] || { title, file_type };

    return res.json({
      success: true,
      data: {
        document: doc,
        analysis
      }
    });
  } catch (err) {
    console.error('Document AI Error:', err);
    return res.status(500).json({ success: false, message: 'Document analysis failed', error: err.message });
  }
};

export const analyzeMeetingAI = async (req, res) => {
  try {
    const { title, transcript } = req.body;

    const analysis = await geminiService.analyzeMeeting(title, transcript);

    const rows = await query(
      `INSERT INTO meetings (title, date, transcript, summary, key_decisions, action_items, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *;`,
      [
        title,
        new Date().toISOString().split('T')[0],
        transcript,
        analysis.summary,
        JSON.stringify(analysis.key_decisions),
        JSON.stringify(analysis.action_items),
        req.user ? req.user.id : null
      ]
    );

    const meeting = rows[0] || { title };

    return res.json({
      success: true,
      data: {
        meeting,
        analysis
      }
    });
  } catch (err) {
    console.error('Meeting AI Error:', err);
    return res.status(500).json({ success: false, message: 'Meeting analysis failed', error: err.message });
  }
};
