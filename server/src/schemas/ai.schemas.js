import { z } from 'zod';

export const aiChatSchema = z.object({
  answer: z.string(),
  summary: z.string(),
  recommendations: z.array(z.string()),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']),
  confidence: z.number().min(0).max(100),
  related_projects: z.array(z.string()).optional(),
  related_tasks: z.array(z.string()).optional(),
  related_documents: z.array(z.string()).optional(),
  citations: z.array(z.string()).optional()
});

export const documentAnalysisSchema = z.object({
  summary: z.string(),
  key_points: z.array(z.string()),
  entities: z.array(z.string()),
  departments: z.array(z.string()),
  deadlines: z.array(z.string()),
  risks: z.array(z.string()),
  recommendations: z.array(z.string()),
  confidence: z.number().min(0).max(100)
});

export const meetingAnalysisSchema = z.object({
  summary: z.string(),
  participants: z.array(z.string()),
  decisions: z.array(z.string()),
  action_items: z.array(z.string()),
  deadlines: z.array(z.string()),
  risks: z.array(z.string()),
  follow_up_email: z.string(),
  confidence: z.number().min(0).max(100)
});

export const projectAnalysisSchema = z.object({
  health_score: z.number().min(0).max(100),
  risk_score: z.number().min(0).max(100),
  status: z.enum(['On Track', 'Delayed', 'High Risk', 'Completed', 'Planning']),
  predicted_delay: z.string(),
  critical_tasks: z.array(z.string()),
  recommendations: z.array(z.string()),
  manager_summary: z.string()
});

export const taskPrioritizationSchema = z.object({
  priority_score: z.number().min(0).max(100),
  risk_level: z.enum(['Low', 'Medium', 'High', 'Critical']),
  estimated_completion: z.string(),
  recommended_assignee: z.string(),
  dependency_chain: z.array(z.string()).optional(),
  business_impact: z.string()
});

export const executiveReportSchema = z.object({
  overall_health: z.number().min(0).max(100),
  executive_summary: z.string(),
  department_scores: z.record(z.number()),
  major_risks: z.array(z.string()),
  wins: z.array(z.string()),
  recommendations: z.array(z.string()),
  next_steps: z.array(z.string())
});
