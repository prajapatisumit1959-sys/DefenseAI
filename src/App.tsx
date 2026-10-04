import React from 'react';
import { useRouter } from './hooks/useRouter';
import { AppLayout } from './layouts/AppLayout';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { CandidatePage } from './pages/CandidatePage';
import { InterviewPage } from './pages/InterviewPage';
import { ReportPage } from './pages/ReportPage';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  const { currentPath, navigate } = useRouter();

  if (currentPath === '/') {
    return <LandingPage onNavigate={navigate} />;
  }

  return (
    <AppLayout currentPath={currentPath} onNavigate={navigate}>
      {currentPath === '/dashboard' && <DashboardPage onNavigate={navigate} />}
      {currentPath === '/candidate' && <CandidatePage onNavigate={navigate} />}
      {currentPath === '/interview' && <InterviewPage onNavigate={navigate} />}
      {currentPath === '/report' && <ReportPage onNavigate={navigate} />}
      {currentPath === '/history' && <HistoryPage onNavigate={navigate} />}
      {currentPath === '/settings' && <SettingsPage onNavigate={navigate} />}
    </AppLayout>
  );
}
