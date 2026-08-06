import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  Zap, 
  Play, 
  Square, 
  Plus, 
  Download, 
  Upload, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Activity, 
  Layers, 
  Cpu, 
  Database, 
  Mail, 
  FileText, 
  MessageSquare, 
  Users, 
  GitBranch, 
  Sliders, 
  Trash2, 
  Copy, 
  RefreshCw, 
  Terminal, 
  X, 
  Search, 
  HelpCircle,
  TrendingUp,
  FileCheck,
  Bot
} from 'lucide-react';

// Preset Palette Component Definitions
const COMPONENT_PALETTE = {
  Triggers: [
    { type: 'Schedule', name: 'Schedule Trigger', icon: Clock, desc: 'Execute on recurring cron or timer schedule' },
    { type: 'FileUpload', name: 'File Upload', icon: Upload, desc: 'Trigger when new file is uploaded' },
    { type: 'NewMeeting', name: 'New Meeting', icon: Users, desc: 'Trigger on meeting transcript creation' },
    { type: 'EmailReceived', name: 'Email Received', icon: Mail, desc: 'Trigger on incoming email' },
    { type: 'NewProject', name: 'New Project', icon: Layers, desc: 'Trigger when a project is created' },
    { type: 'ApiRequest', name: 'API Request', icon: Zap, desc: 'Trigger via incoming webhook endpoint' },
    { type: 'UserAction', name: 'User Action', icon: Play, desc: 'Manual button click trigger' }
  ],
  AIAgents: [
    { type: 'GeminiAnalyzer', name: 'Gemini Analyzer', icon: Sparkles, desc: 'General-purpose Gemini 2.5 Flash AI reasoning' },
    { type: 'DocIntel', name: 'Document Intelligence', icon: FileText, desc: 'Extract key entities, FAQs, and action items' },
    { type: 'MeetingIntel', name: 'Meeting Intelligence', icon: Users, desc: 'Extract decisions, briefings, and assigned tasks' },
    { type: 'RiskPredictor', name: 'Risk Predictor', icon: TrendingUp, desc: 'Calculate project and operational risk scores' },
    { type: 'ExecSummarizer', name: 'Executive Summarizer', icon: FileCheck, desc: 'Synthesize data into executive briefing' },
    { type: 'KnowledgeSearch', name: 'Knowledge Search', icon: Database, desc: 'Query vector knowledge base' },
    { type: 'DecisionEngine', name: 'Decision Engine', icon: Cpu, desc: 'Evaluate complex multi-variable rules' }
  ],
  Actions: [
    { type: 'CreateTask', name: 'Create Task', icon: CheckCircle2, desc: 'Create Jira/Nexus task in project queue' },
    { type: 'SendEmail', name: 'Send Email', icon: Mail, desc: 'Send automated email notification' },
    { type: 'GenerateReport', name: 'Generate Report', icon: FileText, desc: 'Publish PDF or markdown summary report' },
    { type: 'NotifyDept', name: 'Notify Department', icon: Users, desc: 'Alert department heads' },
    { type: 'UpdateDashboard', name: 'Update Dashboard', icon: Activity, desc: 'Update live metric widgets' },
    { type: 'SaveToDb', name: 'Save to Database', icon: Database, desc: 'Persist record to Supabase DB' },
    { type: 'SlackMessage', name: 'Slack Message', icon: MessageSquare, desc: 'Broadcast alert to Slack channel' }
  ],
  Logic: [
    { type: 'IfElse', name: 'If / Else', icon: GitBranch, desc: 'Conditional execution branching' },
    { type: 'Loop', name: 'Loop Array', icon: RefreshCw, desc: 'Iterate over list items' },
    { type: 'Approval', name: 'Human Approval', icon: HelpCircle, desc: 'Pause until executive signoff' },
    { type: 'Condition', name: 'Condition Match', icon: Sliders, desc: 'Filter matching records' },
    { type: 'Delay', name: 'Delay Timer', icon: Clock, desc: 'Pause workflow execution for N seconds' }
  ]
};

// Preset Sample Workflows
const PRESET_SAMPLE_NODES = [
  { id: 'node-1', type: 'Schedule', name: 'Schedule Trigger', category: 'Triggers', icon: 'Clock', status: 'Success', executionTime: '0.1s', model: 'System', desc: 'Every weekday at 09:00 AM' },
  { id: 'node-2', type: 'FileUpload', name: 'Meeting Transcript Upload', category: 'Triggers', icon: 'Upload', status: 'Success', executionTime: '0.4s', model: 'System', desc: 'Accepts .txt, .docx, audio transcripts' },
  { id: 'node-3', type: 'MeetingIntel', name: 'Gemini Meeting Intelligence', category: 'AIAgents', icon: 'Sparkles', status: 'Success', executionTime: '1.8s', model: 'Gemini 2.5 Flash', desc: 'Extract decisions, briefings, and risks' },
  { id: 'node-4', type: 'DecisionEngine', name: 'Extract Decisions', category: 'AIAgents', icon: 'Cpu', status: 'Success', executionTime: '0.5s', model: 'Gemini 2.5 Flash', desc: 'Identify high-priority action items' },
  { id: 'node-5', type: 'CreateTask', name: 'Generate Tasks', category: 'Actions', icon: 'CheckCircle2', status: 'Success', executionTime: '0.6s', model: 'Nexus Engine', desc: 'Auto-assign tasks to department queue' },
  { id: 'node-6', type: 'NotifyDept', name: 'Notify Engineering', category: 'Actions', icon: 'Users', status: 'Success', executionTime: '0.3s', model: 'Slack/Email', desc: 'Send Slack ping to #eng-alerts' },
  { id: 'node-7', type: 'GenerateReport', name: 'Create Executive Report', category: 'Actions', icon: 'FileText', status: 'Success', executionTime: '1.2s', model: 'Gemini 2.5 Flash', desc: 'Synthesize PDF briefing' },
  { id: 'node-8', type: 'SaveToDb', name: 'Archive Meeting', category: 'Logic', icon: 'Database', status: 'Success', executionTime: '0.2s', model: 'Supabase PostgreSQL', desc: 'Persist record with vector embedding' }
];

const ENTERPRISE_TEMPLATES = [
  { id: 'tmpl-1', title: 'Meeting Summary Automation', category: 'Executive', desc: 'Upload meeting audio or transcript -> Gemini Intelligence -> Auto Task Generation -> Executive Briefing', nodes: 8 },
  { id: 'tmpl-2', title: 'Project Risk Prediction', category: 'Engineering', desc: 'Monitor project velocity & budget -> Gemini Risk Predictor -> Escalate Delayed Projects to Slack', nodes: 6 },
  { id: 'tmpl-3', title: 'Invoice Processing & Extraction', category: 'Finance', desc: 'Incoming Invoice PDF -> OCR Entity Extractor -> Validate Amount -> Push to Accounting DB', nodes: 5 },
  { id: 'tmpl-4', title: 'HR Resume Screening & Scoring', category: 'HR', desc: 'New Candidate Resume -> Gemini Matcher -> Score Candidate -> Notify Hiring Manager', nodes: 6 },
  { id: 'tmpl-5', title: 'Document Compliance Checker', category: 'Legal', desc: 'Upload Policy Document -> Gemini Legal Compliance Agent -> Flag GDPR/SOC2 Risks', nodes: 5 },
  { id: 'tmpl-6', title: 'Customer Support AI Routing', category: 'Support', desc: 'Incoming Support Ticket -> Sentiment Analyzer -> High Priority Escalation to Senior Lead', nodes: 4 },
  { id: 'tmpl-7', title: 'Weekly Executive PDF Generator', category: 'Management', desc: 'Weekly Cron -> Pull Department KPIs -> Generate Gemini Synthesis -> Email C-Suite', nodes: 7 },
  { id: 'tmpl-8', title: 'Knowledge Base Vector Indexing', category: 'Data', desc: 'New Document Upload -> Chunk & Vector Embed -> Store in Supabase PGVector Knowledge Hub', nodes: 5 }
];

export const WorkflowAutomation = () => {
  const [workflows, setWorkflows] = useState([]);
  const [canvasNodes, setCanvasNodes] = useState(PRESET_SAMPLE_NODES);
  const [selectedNodeId, setSelectedNodeId] = useState('node-3');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Execution state
  const [isRunning, setIsRunning] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(-1);
  const [logs, setLogs] = useState([]);
  const [showLogsDrawer, setShowLogsDrawer] = useState(false);

  // Modals state
  const [showAiGenModal, setShowAiGenModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [workflowName, setWorkflowName] = useState('Executive Meeting Automation Workflow');

  // Node editing state
  const [nodeConfig, setNodeConfig] = useState({
    name: '',
    desc: '',
    model: 'Gemini 2.5 Flash',
    temperature: 0.3,
    timeout: 30,
    retryCount: 3,
    outputFormat: 'JSON'
  });

  useEffect(() => {
    fetchWorkflows();
  }, []);

  useEffect(() => {
    const active = canvasNodes.find(n => n.id === selectedNodeId);
    if (active) {
      setNodeConfig({
        name: active.name,
        desc: active.desc || '',
        model: active.model || 'Gemini 2.5 Flash',
        temperature: 0.3,
        timeout: 30,
        retryCount: 3,
        outputFormat: 'JSON'
      });
    }
  }, [selectedNodeId, canvasNodes]);

  const fetchWorkflows = async () => {
    try {
      const res = await api.get('/workflows');
      if (res.data?.success) setWorkflows(res.data.data?.workflows ?? res.data.workflows ?? []);
    } catch (err) {
      console.error('Error fetching workflows:', err);
    }
  };

  const handleAddNode = (item, catName) => {
    const newNode = {
      id: `node-${Date.now()}`,
      type: item.type,
      name: item.name,
      category: catName,
      icon: item.icon.name || 'Sparkles',
      status: 'Idle',
      executionTime: '0.0s',
      model: catName === 'AIAgents' ? 'Gemini 2.5 Flash' : 'System',
      desc: item.desc
    };
    setCanvasNodes(prev => [...prev, newNode]);
    setSelectedNodeId(newNode.id);
  };

  const handleDeleteNode = (e, id) => {
    e.stopPropagation();
    setCanvasNodes(prev => prev.filter(n => n.id !== id));
    if (selectedNodeId === id) setSelectedNodeId(null);
  };

  const handleSaveNodeConfig = () => {
    if (!selectedNodeId) return;
    setCanvasNodes(prev => prev.map(n => {
      if (n.id === selectedNodeId) {
        return {
          ...n,
          name: nodeConfig.name,
          desc: nodeConfig.desc,
          model: nodeConfig.model
        };
      }
      return n;
    }));
  };

  const handleRunWorkflow = () => {
    if (canvasNodes.length === 0 || isRunning) return;
    setIsRunning(true);
    setShowLogsDrawer(true);
    setActiveStepIndex(0);
    setLogs([
      `[${new Date().toLocaleTimeString()}] 🚀 Initiating Workflow Execution: "${workflowName}"...`
    ]);

    let step = 0;
    const interval = setInterval(() => {
      if (step < canvasNodes.length) {
        const currentNode = canvasNodes[step];
        setActiveStepIndex(step);
        
        // Update node status
        setCanvasNodes(prev => prev.map((n, i) => i === step ? { ...n, status: 'Running' } : n));

        setLogs(prevLogs => [
          ...prevLogs,
          `[${new Date().toLocaleTimeString()}] ▶ Executing Step ${step + 1}/${canvasNodes.length}: [${currentNode.name}] (${currentNode.category})`
        ]);

        setTimeout(() => {
          setCanvasNodes(prev => prev.map((n, i) => i === step ? { ...n, status: 'Success' } : n));
        }, 500);

        step++;
      } else {
        clearInterval(interval);
        setIsRunning(false);
        setActiveStepIndex(-1);
        setLogs(prevLogs => [
          ...prevLogs,
          `[${new Date().toLocaleTimeString()}] ✅ Workflow Executed Successfully in ${(canvasNodes.length * 0.7).toFixed(1)}s! All ${canvasNodes.length} nodes completed.`
        ]);
      }
    }, 900);
  };

  const handleStopWorkflow = () => {
    setIsRunning(false);
    setActiveStepIndex(-1);
    setLogs(prevLogs => [
      ...prevLogs,
      `[${new Date().toLocaleTimeString()}] ⏹ Execution manually stopped by user.`
    ]);
  };

  const handleClearCanvas = () => {
    if (window.confirm('Clear all nodes from visual canvas?')) {
      setCanvasNodes([]);
      setSelectedNodeId(null);
    }
  };

  const handleLoadTemplate = (tmpl) => {
    setWorkflowName(tmpl.title);
    const generated = [
      { id: 'node-1', type: 'Schedule', name: `${tmpl.title} Trigger`, category: 'Triggers', icon: 'Clock', status: 'Idle', executionTime: '0.1s', model: 'System', desc: 'Trigger on schedule or webhook' },
      { id: 'node-2', type: 'GeminiAnalyzer', name: 'Gemini AI Agent', category: 'AIAgents', icon: 'Sparkles', status: 'Idle', executionTime: '1.4s', model: 'Gemini 2.5 Flash', desc: tmpl.desc },
      { id: 'node-3', type: 'DecisionEngine', name: 'Decision & Rules Engine', category: 'AIAgents', icon: 'Cpu', status: 'Idle', executionTime: '0.4s', model: 'Gemini 2.5 Flash', desc: 'Apply business logic rules' },
      { id: 'node-4', type: 'CreateTask', name: 'Execute Action', category: 'Actions', icon: 'CheckCircle2', status: 'Idle', executionTime: '0.5s', model: 'Nexus System', desc: 'Update DB and dispatch notifications' },
      { id: 'node-5', type: 'SaveToDb', name: 'Persist Log', category: 'Logic', icon: 'Database', status: 'Idle', executionTime: '0.2s', model: 'Supabase PG', desc: 'Archive audit log' }
    ];
    setCanvasNodes(generated);
    setSelectedNodeId('node-2');
  };

  const handleAiGenerateWorkflow = async () => {
    if (!aiPrompt.trim()) return;
    setAiGenerating(true);
    try {
      const res = await api.post('/ai/generate-workflow', { prompt: aiPrompt });
      if (res.data?.success && res.data.data) {
        const aiData = res.data.data;
        if (aiData.title) setWorkflowName(aiData.title);
        if (Array.isArray(aiData.nodes)) {
          setCanvasNodes(aiData.nodes);
          setSelectedNodeId(aiData.nodes[0]?.id || null);
        }
      }
      setShowAiGenModal(false);
      setAiPrompt('');
    } catch (err) {
      console.error('AI Generate workflow error:', err);
    } finally {
      setAiGenerating(false);
    }
  };

  const handleExportJson = () => {
    const exportData = {
      title: workflowName,
      createdAt: new Date().toISOString(),
      nodes: canvasNodes
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workflowName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_workflow.json`;
    a.click();
  };

  const handleImportJson = () => {
    try {
      const parsed = JSON.parse(importJsonText);
      if (parsed.title) setWorkflowName(parsed.title);
      if (Array.isArray(parsed.nodes)) {
        setCanvasNodes(parsed.nodes);
        setSelectedNodeId(parsed.nodes[0]?.id || null);
      }
      setShowImportModal(false);
      setImportJsonText('');
    } catch (e) {
      alert('Invalid JSON structure. Please check input format.');
    }
  };

  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'Triggers': return 'border-amber-500/40 bg-amber-500/10 text-amber-400';
      case 'AIAgents': return 'border-purple-500/40 bg-purple-500/10 text-purple-400';
      case 'Actions': return 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400';
      case 'Logic': return 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400';
      default: return 'border-indigo-500/40 bg-indigo-500/10 text-indigo-400';
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-gray-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-2.5">
            <Zap className="w-6 h-6 text-amber-400 fill-amber-400/20" />
            AI Workflow Automation Engine
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Design, automate, and execute enterprise AI workflows using drag-and-drop AI agents, business logic, and intelligent triggers.
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={() => { setCanvasNodes([]); setSelectedNodeId(null); setWorkflowName('New Custom AI Workflow'); }}
            className="px-3.5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold flex items-center gap-1.5 border border-gray-700 transition"
          >
            <Plus className="w-4 h-4 text-indigo-400" />
            <span>New Workflow</span>
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="px-3.5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold flex items-center gap-1.5 border border-gray-700 transition"
          >
            <Upload className="w-4 h-4 text-indigo-400" />
            <span>Import Workflow</span>
          </button>
          <button
            onClick={() => setShowAiGenModal(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-90 text-white text-xs font-bold flex items-center gap-2 shadow-lg transition"
          >
            <Sparkles className="w-4 h-4 animate-spin-slow" />
            <span>AI Generate Workflow</span>
          </button>
        </div>
      </div>

      {/* KPI Workflow Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-gray-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium">Active Workflows</p>
            <h3 className="text-2xl font-bold text-gray-100 mt-1">18</h3>
            <span className="text-[10px] text-emerald-400 font-semibold mt-1 inline-block">↑ +3 created this week</span>
          </div>
          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-gray-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium">Running Today</p>
            <h3 className="text-2xl font-bold text-gray-100 mt-1">236</h3>
            <span className="text-[10px] text-emerald-400 font-semibold mt-1 inline-block">99.8% Success Rate</span>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Zap className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-gray-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium">AI Automations</p>
            <h3 className="text-2xl font-bold text-gray-100 mt-1">94</h3>
            <span className="text-[10px] text-purple-400 font-semibold mt-1 inline-block">Gemini 2.5 Flash Engine</span>
          </div>
          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-gray-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium">Time Saved</p>
            <h3 className="text-2xl font-bold text-gray-100 mt-1">312 Hours</h3>
            <span className="text-[10px] text-emerald-400 font-semibold mt-1 inline-block">~$18,400 Labor Value Saved</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Visual Workflow Builder Workspace (3 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Components Palette (3 Cols) */}
        <div className="lg:col-span-3 glass-panel p-4 rounded-2xl border border-gray-800 space-y-4 max-h-[750px] overflow-y-auto">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" /> Component Palette
            </h3>
            <span className="text-[10px] text-gray-500 font-mono">Click to Add</span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-gray-500" />
            <input
              type="text"
              placeholder="Search components..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-4">
            {Object.entries(COMPONENT_PALETTE).map(([catName, items]) => {
              const filtered = items.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()) || i.desc.toLowerCase().includes(searchTerm.toLowerCase()));
              if (filtered.length === 0) return null;

              return (
                <div key={catName} className="space-y-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border inline-block ${getCategoryColor(catName)}`}>
                    {catName}
                  </span>
                  <div className="space-y-1.5">
                    {filtered.map((item, idx) => {
                      const IconComp = item.icon;
                      return (
                        <div
                          key={idx}
                          onClick={() => handleAddNode(item, catName)}
                          className="p-2.5 rounded-xl bg-gray-900/60 border border-gray-800/80 hover:border-indigo-500/50 text-xs cursor-pointer transition flex items-start gap-2.5 group"
                        >
                          <div className={`p-1.5 rounded-lg shrink-0 border ${getCategoryColor(catName)}`}>
                            <IconComp className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-semibold text-gray-200 group-hover:text-indigo-300 transition truncate">{item.name}</h4>
                            <p className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">{item.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center Column: Visual Workflow Canvas (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Canvas Controls Header */}
          <div className="glass-panel p-3.5 rounded-2xl border border-gray-800 flex items-center justify-between gap-2">
            <input
              type="text"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="bg-transparent text-sm font-bold text-gray-100 focus:outline-none focus:border-b border-indigo-500 px-1 truncate max-w-[220px]"
            />
            <div className="flex items-center gap-2">
              {!isRunning ? (
                <button
                  onClick={handleRunWorkflow}
                  disabled={canvasNodes.length === 0}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow transition disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Run Workflow</span>
                </button>
              ) : (
                <button
                  onClick={handleStopWorkflow}
                  className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 shadow transition"
                >
                  <Square className="w-3.5 h-3.5 fill-white" />
                  <span>Stop</span>
                </button>
              )}
              <button
                onClick={handleExportJson}
                title="Export JSON"
                className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 transition"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={handleClearCanvas}
                title="Clear Canvas"
                className="p-1.5 rounded-lg bg-gray-800 hover:bg-red-900/40 text-gray-400 hover:text-red-400 border border-gray-700 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Interactive Visual Canvas Area */}
          <div className="glass-panel p-6 rounded-2xl border border-gray-800 min-h-[560px] max-h-[600px] overflow-y-auto relative flex flex-col items-center bg-gray-950/60 bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:16px_16px]">
            {canvasNodes.length === 0 ? (
              /* Empty State Illustration */
              <div className="my-auto text-center space-y-4 max-w-sm p-6">
                <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/10">
                  <Bot className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-gray-100">No workflows on canvas yet</h3>
                  <p className="text-xs text-gray-400">Build intelligent enterprise automations using AI-powered workflow orchestration or templates.</p>
                </div>
                <div className="flex items-center justify-center gap-2 pt-2">
                  <button
                    onClick={() => handleLoadTemplate(ENTERPRISE_TEMPLATES[0])}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
                  >
                    Load Sample Workflow
                  </button>
                  <button
                    onClick={() => setShowAiGenModal(true)}
                    className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold border border-gray-700 transition"
                  >
                    ✨ AI Generator
                  </button>
                </div>
              </div>
            ) : (
              /* Connected Node Chain Visual Flow */
              <div className="w-full space-y-3 my-auto py-4">
                {canvasNodes.map((node, index) => {
                  const isSelected = selectedNodeId === node.id;
                  const isActiveExecuting = activeStepIndex === index;

                  return (
                    <React.Fragment key={node.id}>
                      {/* Visual Flow Connector Arrow */}
                      {index > 0 && (
                        <div className="flex justify-center items-center py-1">
                          <div className={`w-0.5 h-6 transition-all duration-300 ${
                            activeStepIndex >= index ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' : 'bg-gray-800'
                          }`} />
                          <ArrowRight className={`w-3.5 h-3.5 absolute rotate-90 transition-colors ${
                            activeStepIndex >= index ? 'text-emerald-400' : 'text-gray-700'
                          }`} />
                        </div>
                      )}

                      {/* Canvas Node Card */}
                      <div
                        onClick={() => setSelectedNodeId(node.id)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer relative group flex items-center justify-between gap-3 ${
                          isActiveExecuting
                            ? 'bg-indigo-600/30 border-indigo-400 shadow-lg shadow-indigo-500/20 ring-2 ring-indigo-500/50 scale-[1.02]'
                            : isSelected
                            ? 'bg-gray-900 border-indigo-500 shadow-md text-gray-100 ring-1 ring-indigo-500/40'
                            : 'bg-gray-900/80 border-gray-800 hover:border-gray-700 text-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-[10px] font-mono font-bold text-gray-500 w-5">
                            #{index + 1}
                          </span>
                          <div className={`p-2 rounded-lg border ${getCategoryColor(node.category)}`}>
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-gray-100 text-xs truncate">{node.name}</h4>
                              <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${getCategoryColor(node.category)}`}>
                                {node.category}
                              </span>
                            </div>
                            <p className="text-[10px] text-gray-400 line-clamp-1 mt-0.5">{node.desc || 'Configured AI workflow step'}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${
                            node.status === 'Running' ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30 animate-pulse' :
                            node.status === 'Success' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                            'bg-gray-800 text-gray-400 border-gray-700'
                          }`}>
                            {node.status}
                          </span>
                          <span className="text-[10px] font-mono text-gray-500">{node.executionTime}</span>
                          <button
                            onClick={(e) => handleDeleteNode(e, node.id)}
                            className="p-1 text-gray-600 hover:text-red-400 transition opacity-0 group-hover:opacity-100"
                            title="Delete Node"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Node Properties Panel (3 Cols) */}
        <div className="lg:col-span-3 glass-panel p-5 rounded-2xl border border-gray-800 space-y-4 min-h-[560px]">
          <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-gray-800">
            <Sliders className="w-4 h-4 text-indigo-400" /> Node Inspector
          </h3>

          {selectedNodeId ? (
            <div className="space-y-4 text-xs">
              <div>
                <label className="text-[11px] text-gray-400 font-medium block mb-1">Node Name</label>
                <input
                  type="text"
                  value={nodeConfig.name}
                  onChange={(e) => setNodeConfig({ ...nodeConfig, name: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-1.5 text-gray-100 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-gray-400 font-medium block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={nodeConfig.desc}
                  onChange={(e) => setNodeConfig({ ...nodeConfig, desc: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-1.5 text-gray-100 text-xs focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-gray-400 font-medium block mb-1">AI Model Engine</label>
                <select
                  value={nodeConfig.model}
                  onChange={(e) => setNodeConfig({ ...nodeConfig, model: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-1.5 text-gray-100 text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="Gemini 2.5 Flash">Gemini 2.5 Flash (Recommended)</option>
                  <option value="Gemini 2.0 Flash">Gemini 2.0 Flash</option>
                  <option value="Gemini 1.5 Pro">Gemini 1.5 Pro</option>
                  <option value="System">System Orchestration</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-gray-400 font-medium mb-1">
                  <span>Temperature</span>
                  <span className="text-indigo-400 font-mono">{nodeConfig.temperature}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={nodeConfig.temperature}
                  onChange={(e) => setNodeConfig({ ...nodeConfig, temperature: parseFloat(e.target.value) })}
                  className="w-full accent-indigo-500 bg-gray-800 rounded-lg cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">Timeout (sec)</label>
                  <input
                    type="number"
                    value={nodeConfig.timeout}
                    onChange={(e) => setNodeConfig({ ...nodeConfig, timeout: parseInt(e.target.value) })}
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg px-2 py-1 text-gray-100 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">Retries</label>
                  <input
                    type="number"
                    value={nodeConfig.retryCount}
                    onChange={(e) => setNodeConfig({ ...nodeConfig, retryCount: parseInt(e.target.value) })}
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg px-2 py-1 text-gray-100 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-gray-400 font-medium block mb-1">Output Format</label>
                <select
                  value={nodeConfig.outputFormat}
                  onChange={(e) => setNodeConfig({ ...nodeConfig, outputFormat: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-1.5 text-gray-100 text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="JSON">JSON Object</option>
                  <option value="Markdown">Markdown Text</option>
                  <option value="PlainText">Plain Text String</option>
                  <option value="Array">Structured Array</option>
                </select>
              </div>

              <button
                onClick={handleSaveNodeConfig}
                className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow mt-2"
              >
                Save Node Configuration
              </button>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 space-y-2">
              <HelpCircle className="w-8 h-8 mx-auto text-gray-700" />
              <p className="text-xs">Select any node on the visual canvas to inspect and modify AI parameters.</p>
            </div>
          )}
        </div>
      </div>

      {/* Live Execution Terminal Logs Drawer */}
      {showLogsDrawer && (
        <div className="glass-panel p-4 rounded-2xl border border-gray-800 space-y-3 bg-black/80 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-gray-800 pb-2">
            <span className="text-gray-300 font-bold flex items-center gap-2 text-xs">
              <Terminal className="w-4 h-4 text-emerald-400" /> Live Workflow Execution Logs
            </span>
            <button onClick={() => setShowLogsDrawer(false)} className="text-gray-500 hover:text-gray-300">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-1 max-h-40 overflow-y-auto text-[11px] leading-relaxed">
            {logs.map((log, i) => (
              <p key={i} className={log.includes('✅') ? 'text-emerald-400 font-semibold' : log.includes('🚀') ? 'text-indigo-400 font-semibold' : 'text-gray-300'}>
                {log}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Enterprise AI Workflow Templates Horizontal Section */}
      <div className="space-y-4 pt-4 border-t border-gray-800">
        <h2 className="text-sm font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-400" /> Enterprise AI Templates
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {ENTERPRISE_TEMPLATES.map((tmpl) => (
            <div key={tmpl.id} className="glass-panel p-4 rounded-2xl border border-gray-800 space-y-3 flex flex-col justify-between hover:border-gray-700 transition group">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {tmpl.category}
                  </span>
                  <span className="text-[10px] text-gray-500">{tmpl.nodes} Nodes</span>
                </div>
                <h3 className="font-bold text-gray-100 text-xs group-hover:text-indigo-300 transition">{tmpl.title}</h3>
                <p className="text-[11px] text-gray-400 line-clamp-2">{tmpl.desc}</p>
              </div>

              <button
                onClick={() => handleLoadTemplate(tmpl)}
                className="w-full py-1.5 rounded-lg bg-gray-800 hover:bg-indigo-600 hover:text-white text-gray-300 text-xs font-semibold border border-gray-700 transition"
              >
                Use Template
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Workflow History Execution Table */}
      <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
        <h2 className="text-sm font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-400" /> Workflow Execution History
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] uppercase tracking-wider text-gray-400 border-b border-gray-800 bg-gray-900/40">
              <tr>
                <th className="p-3">Workflow Name</th>
                <th className="p-3">Triggered By</th>
                <th className="p-3">Status</th>
                <th className="p-3">Execution Time</th>
                <th className="p-3">Last Run</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              <tr className="hover:bg-gray-800/30 transition">
                <td className="p-3 font-semibold text-gray-100">Meeting Automation</td>
                <td className="p-3 text-gray-400">File Upload</td>
                <td className="p-3"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Completed</span></td>
                <td className="p-3 font-mono text-gray-300">2.1 sec</td>
                <td className="p-3 text-gray-400">Today, 12:31 PM</td>
                <td className="p-3 text-right space-x-2">
                  <button onClick={handleRunWorkflow} className="text-gray-400 hover:text-emerald-400">▶ Run</button>
                  <button onClick={() => setShowLogsDrawer(true)} className="text-gray-400 hover:text-indigo-400">📋 Logs</button>
                </td>
              </tr>
              <tr className="hover:bg-gray-800/30 transition">
                <td className="p-3 font-semibold text-gray-100">Project Risk Analysis</td>
                <td className="p-3 text-gray-400">Schedule (Daily)</td>
                <td className="p-3"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 animate-pulse">Running</span></td>
                <td className="p-3 font-mono text-gray-300">1.4 sec</td>
                <td className="p-3 text-gray-400">Now</td>
                <td className="p-3 text-right space-x-2">
                  <button onClick={() => setShowLogsDrawer(true)} className="text-gray-400 hover:text-indigo-400">📋 Logs</button>
                </td>
              </tr>
              <tr className="hover:bg-gray-800/30 transition">
                <td className="p-3 font-semibold text-gray-100">Daily Executive Report</td>
                <td className="p-3 text-gray-400">User Action</td>
                <td className="p-3"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Completed</span></td>
                <td className="p-3 font-mono text-gray-300">4.0 sec</td>
                <td className="p-3 text-gray-400">Yesterday</td>
                <td className="p-3 text-right space-x-2">
                  <button onClick={handleRunWorkflow} className="text-gray-400 hover:text-emerald-400">▶ Run</button>
                  <button onClick={() => setShowLogsDrawer(true)} className="text-gray-400 hover:text-indigo-400">📋 Logs</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating AI Workflow Generator Modal */}
      {showAiGenModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl border border-gray-800 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-100 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400 animate-spin-slow" />
                Generate Workflow with AI
              </h3>
              <button onClick={() => setShowAiGenModal(false)} className="text-gray-400 hover:text-gray-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-400">
              Describe what you want to automate in plain English. Gemini AI will generate the complete visual graph, node parameters, and execution sequence.
            </p>

            <textarea
              rows={4}
              placeholder="Whenever a meeting transcript is uploaded, summarize it, extract tasks, assign owners, email department heads, and generate executive report."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-xs text-gray-100 focus:outline-none focus:border-purple-500 resize-none"
            />

            <div className="flex items-center gap-2">
              <button
                onClick={handleAiGenerateWorkflow}
                disabled={aiGenerating || !aiPrompt.trim()}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white font-bold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {aiGenerating ? <Sparkles className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>{aiGenerating ? 'Generating Workflow Graph...' : '✨ Generate Workflow'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Workflow JSON Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl border border-gray-800 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-100 flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-400" /> Import Workflow JSON
              </h3>
              <button onClick={() => setShowImportModal(false)} className="text-gray-400 hover:text-gray-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <textarea
              rows={6}
              placeholder='Paste workflow JSON here...'
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-xs text-gray-100 font-mono focus:outline-none focus:border-indigo-500 resize-none"
            />

            <button
              onClick={handleImportJson}
              disabled={!importJsonText.trim()}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition disabled:opacity-50"
            >
              Import Canvas Workflow
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default WorkflowAutomation;
