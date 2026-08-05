# 🏆 NexusAI - Enterprise AI SaaS Platform
> *"One AI Brain. Every Department. Every Decision."*

NexusAI is a production-ready, enterprise-grade AI Operating System designed to unify fragmented organizational data across HR, CRM, task managers, meeting transcripts, project dashboards, and policy documents using **Google Gemini AI**.

---

## 🏗️ 1. Architecture Summary

```
+-----------------------------------------------------------------------------------+
|                                    NEXUSAI CLIENT                                 |
|   React (Vite) | Tailwind CSS | Framer Motion | Recharts | Lucide Icons           |
+-----------------------------------------------------------------------------------+
                                         |
                                (REST API / JWT)
                                         v
+-----------------------------------------------------------------------------------+
|                                    NEXUSAI SERVER                                 |
| Node.js | Express.js | Helmet | CORS | Zod Validation | Rate Limiter              |
+-----------------------------------------------------------------------------------+
     |                                      |                                  |
     v                                      v                                  v
+-----------------------+   +-------------------------------+   +-------------------+
|  GOOGLE GEMINI API    |   |    SUPABASE POSTGRESQL DB     |   |  SUPABASE STORAGE |
| Server-Side Execution |   | 21 Tables | RLS Policies | Views|   | Documents/Avatars |
+-----------------------+   +-------------------------------+   +-------------------+
```

- **Frontend Architecture**: React (Vite) single-page application utilizing React Router v6, Tailwind CSS glassmorphism theme (`#0b0f19`), Framer Motion page transitions, and Recharts visualization components.
- **Backend Architecture**: Node.js & Express.js REST API structured cleanly into `config`, `controllers`, `services`, `middleware`, `validators`, `prompts`, `schemas`, `database`, and `utils`.
- **Database Architecture**: 21 normalized PostgreSQL tables in Supabase with UUID primary keys, Row-Level Security (RLS) policies, indexes, database views, and automated triggers.

---

## 📋 2. Complete Feature List

1. **Landing Page (`/`)**: Animated hero section, interactive background visualizer, enterprise statistics, feature cards, pricing tier toggles, and FAQ.
2. **Authentication Portal (`/login`)**: JWT authentication, bcrypt password hashing with Zod complexity validation, quick role switching for Admin, Executive, Manager, and Employee.
3. **AI Command Center (`/ai`)**: Natural language chat assistant with embedded Recharts graphics (Bar/Pie charts), markdown rendering, history sidebar drawer, copy response, and export `.md` transcript.
4. **Role-Based Dashboards (`/dashboard`)**: Executive & Department Manager views with real-time KPI cards, department risk metrics, AI health index, and active project trackers.
5. **Project Management (`/projects` & `/projects/:id`)**: Dual view mode switcher (Kanban Cards vs Enterprise Table view), search, department/priority filters, CSV Exporter, Edit/Delete modals, and detailed milestone views.
6. **Task Management (`/tasks` & `/tasks/:id`)**: Task status toggle, AI delay prediction badges ("High Risk of Delay" vs "On Track"), and threaded task discussion comments.
7. **Document Intelligence (`/documents` & `/documents/:id`)**: Text/PDF ingestion, entity extraction, deadline identification, policy summarization, and file deletion.
8. **Meeting Intelligence (`/meetings` & `/meetings/:id`)**: Transcript synthesis into key decisions, assigned action items, follow-up email drafts, and meeting record deletion.
9. **Knowledge Hub (`/knowledge`)**: Vector deep search across policies, SLAs, engineering guidelines, and HR manuals.
10. **Workflow Automation (`/workflows`)**: Visual Trigger -> Condition -> Action orchestration with status toggles (`Active`/`Paused`) and live test trigger simulators.
11. **Business Analytics (`/analytics`)**: Department productivity indexes, meeting efficiency scores, and revenue vs target line charts.
12. **Executive Reports (`/reports`)**: Synthesize multi-department data into downloadable PDF, CSV, or Excel report presets.
13. **User Directory (`/users`)**: Enterprise user governance, corporate email directory, and role assignment.
14. **Department Management (`/departments`)**: Headcount metrics and annual budget allocation editor.
15. **Notifications (`/notifications`)**: Priority filters (`Risk`, `Info`, `Success`), Clear All, and Mark All as Read controls.
16. **Audit Logs (`/audit`)**: Immutable SOC2 compliance event log tracking.
17. **AI History (`/history`)**: Historical log of natural language prompts processed by Gemini AI.
18. **Global Search Bar**: Live debounced search in Navbar querying Projects, Tasks, Documents, and Meetings.
19. **Settings & Profile (`/settings` & `/profile`)**: Account updates and Gemini model temperature parameters.
20. **Help Center (`/help`)**: Interactive enterprise documentation and FAQ.

---

## 🤖 3. AI Features & Intelligence Layer

- **8 Intelligence Modules**: Enterprise Chat, Document Intelligence, Meeting Intelligence, Project Intelligence, Task Intelligence, Workflow Recommendation, Executive Insights, and Business Analytics.
- **Strict Zod JSON Validation**: Every AI response must validate against predefined Zod schemas (`aiChatSchema`, `documentAnalysisSchema`, `meetingAnalysisSchema`, `projectAnalysisSchema`, `taskPrioritizationSchema`, `executiveReportSchema`).
- **Repair Retry Strategy**: Malformed JSON responses trigger a single-attempt repair prompt before falling back to deterministic reasoning output.
- **Temperature Governance**: `0.2` for deterministic risk analysis & delay predictions; `0.5` for natural summaries & executive email drafting.

---

## 🛡️ 4. Security Features

- **Server-Side API Key Isolation**: Google Gemini API key is strictly encapsulated on the backend (`gemini.service.js`) and is **never** exposed to the frontend.
- **Prompt Injection Defense (`aiSecurity.middleware.js`)**: Rejects malicious prompts attempting system prompt extractions, API key reveals, SQL injection, or script injection.
- **Auth Security**: Passwords hashed with `bcryptjs` (salt rounds = 10); Zod password validation (min 8 chars, uppercase, lowercase, number, special char).
- **Rate Limiters**: Auth rate limiter (20 requests / 15 min) and AI rate limiter (100 requests / 15 min).
- **HTTP Security**: Express application secured with `helmet()`, CORS configuration, and global error handling masking internal stack traces.

---

## ⚡ 5. Performance Optimizations

- **Vite Production Build**: Compiled in **8.05s** with **0 errors**.
- **Debounced Search**: Navbar global search uses a 300ms debounce buffer.
- **Indexed Database Joins**: SQL queries optimized with indexes on `email`, `department_id`, `project_id`, `assigned_to`, `status`, `priority`, and `created_at`.
- **Lightweight Components**: Utility CSS styling and memoized UI layouts.

---

## 🚀 6. Cloud Deployment Instructions

### Frontend Deployment (Vercel)
1. Push repository to GitHub.
2. Import project into Vercel dashboard setting root directory to `client`.
3. Build Command: `npm run build` | Output Directory: `dist`.
4. Add Environment Variable: `VITE_API_BASE_URL=https://your-backend-render-url.onrender.com/api`.

### Backend Deployment (Render)
1. Import repository into Render dashboard as a Web Service setting root directory to `server`.
2. Build Command: `npm install` | Start Command: `node src/server.js`.
3. Add Environment Variables: `GEMINI_API_KEY`, `JWT_SECRET`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `CLIENT_URL`.

### Database Deployment (Supabase PostgreSQL)
1. Create a new project on Supabase.
2. Navigate to SQL Editor and run `server/src/database/migrations/001_initial_schema.sql`.
3. Run seed script `server/src/database/seed.sql`.

---

## 🧪 7. Testing & Verification Checklist

- [x] **Authentication**: Registration, Login, JWT verification, Token refresh, Logout.
- [x] **Role Access**: Admin, Executive, Manager, Employee permissions verified.
- [x] **Project CRUD**: Create, Read, Edit Modal, Delete Modal, Detail View (`/projects/:id`).
- [x] **Task CRUD**: Create, Edit, Delete, Status Toggle, Discussion Comments (`POST /api/tasks/:id/comments`).
- [x] **AI Intelligence**: Command Center queries, Document analysis, Meeting transcript processing.
- [x] **Global Search**: Live debounced search indexing all resources.
- [x] **Production Build**: Verified with Vite `npm run build` (0 errors).

---

## 🎬 8. Judge Demo Flow (3-Minute Presentation Script)

1. **0:00 - 0:30 (Landing Page & Hero)**: Showcase NexusAI tagline *"One AI Brain. Every Department. Every Decision."*, highlight real-time stats and smooth Framer Motion animations.
2. **0:30 - 1:15 (Login & Role Dashboards)**: Sign in as `Administrator` (`admin@nexusai.com`). Navigate to the Executive Dashboard to showcase company health index, risk scores, and department metrics.
3. **1:15 - 2:00 (AI Command Center)**: Ask Gemini AI *"Which projects are delayed?"*. Show the rendered Bar Chart, risk badge, and export markdown transcript feature.
4. **2:00 - 2:30 (Project & Task Queue)**: Navigate to Projects. Switch between **Kanban Cards** and **Table View**. Click Edit project modal, click Task detail to show live task comments.
5. **2:30 - 3:00 (Document & Meeting Hubs)**: Show Document Intelligence entity extraction and Meeting transcript synthesis follow-up email generator.

---

## 🔮 9. Future Scope & Roadmap

- **Multimodal Audio/Video Streaming**: Real-time WebRTC audio transcript processing directly from live browser microphones.
- **WebSocket Push Notifications**: Instant real-time task assignment alerts delivered via Socket.io.
- **Custom Fine-Tuned Gemini Models**: Fine-tuned enterprise domain models on proprietary company knowledge graphs.
