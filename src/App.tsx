import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ActivityProvider } from './context/ActivityContext';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './components/dashboard/Dashboard';
import CalendarView from './components/calendar/CalendarView';
import TimelineView from './components/timeline/TimelineView';
import ActivityList from './components/activities/ActivityList';
import { initBackupBridge } from './services/backupBridge';

function App() {
  // Initialize backup bridge to handle Hub backup/restore requests
  useEffect(() => {
    const cleanup = initBackupBridge();
    return cleanup;
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <ActivityProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<AppLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="calendar" element={<CalendarView />} />
                <Route path="timeline" element={<TimelineView />} />
                <Route path="activities" element={<ActivityList />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </ActivityProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
