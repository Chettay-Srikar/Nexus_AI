import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar, Navbar } from './components/layout/Layout';

// Pages
import { LandingPage } from './pages/Landing/LandingPage';
import { Login } from './pages/Auth/Login';
import { AICommandCenter } from './pages/CommandCenter/AICommandCenter';
import { EnterpriseDashboard } from './pages/Dashboards/EnterpriseDashboard';
import { ProjectManager } from './pages/Projects/ProjectManager';
import { ProjectDetail } from './pages/Projects/ProjectDetail';
import { TaskDetail } from './pages/Tasks/TaskDetail';
import { DocumentIntelligence } from './pages/Documents/DocumentIntelligence';
import { DocumentDetail } from './pages/Documents/DocumentDetail';
import { MeetingIntelligence } from './pages/Meetings/MeetingIntelligence';
import { MeetingDetail } from './pages/Meetings/MeetingDetail';
import { WorkflowAutomation } from './pages/Workflows/WorkflowAutomation';
import { EnterpriseAnalytics } from './pages/Analytics/EnterpriseAnalytics';
import { KnowledgeHub } from './pages/Knowledge/KnowledgeHub';
import { ReportsPage } from './pages/Reports/ReportsPage';
import { UserManagement } from './pages/Admin/UserManagement';
import { DepartmentManagement } from './pages/Admin/DepartmentManagement';
import { NotificationsPage } from './pages/Notifications/NotificationsPage';
import { ProfilePage } from './pages/Profile/ProfilePage';
import { SettingsPage } from './pages/Settings/SettingsPage';
import { AuditLogs } from './pages/Settings/AuditLogs';
import { AIHistory } from './pages/History/AIHistory';
import { HelpCenter } from './pages/Help/HelpCenter';

const ProtectedLayout = () => {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen bg-[#0b0f19] flex items-center justify-center text-indigo-400 font-semibold text-sm">
        Loading NexusAI Enterprise OS...
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-[#0b0f19]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Enterprise Routes */}
          <Route element={<ProtectedLayout />}>
            <Route path="/ai" element={<AICommandCenter />} />
            <Route path="/dashboard" element={<EnterpriseDashboard />} />
            <Route path="/projects" element={<ProjectManager />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/tasks" element={<ProjectManager />} />
            <Route path="/tasks/:id" element={<TaskDetail />} />
            <Route path="/documents" element={<DocumentIntelligence />} />
            <Route path="/documents/:id" element={<DocumentDetail />} />
            <Route path="/meetings" element={<MeetingIntelligence />} />
            <Route path="/meetings/:id" element={<MeetingDetail />} />
            <Route path="/workflows" element={<WorkflowAutomation />} />
            <Route path="/workflows/:id" element={<WorkflowAutomation />} />
            <Route path="/knowledge" element={<KnowledgeHub />} />
            <Route path="/analytics" element={<EnterpriseAnalytics />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/departments" element={<DepartmentManagement />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/admin" element={<EnterpriseDashboard />} />
            <Route path="/history" element={<AIHistory />} />
            <Route path="/audit" element={<AuditLogs />} />
            <Route path="/help" element={<HelpCenter />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
