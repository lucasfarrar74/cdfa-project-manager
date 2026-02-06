import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ActivityProvider, useActivities } from './context/ActivityContext';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './components/dashboard/Dashboard';
import CalendarView from './components/calendar/CalendarView';
import TimelineView from './components/timeline/TimelineView';
import ActivityList from './components/activities/ActivityList';
import { initBackupBridge } from './services/backupBridge';
import { initializeActivityBridge } from './services/activityBridge';

// Inner component that has access to ActivityContext
function AppWithBridges() {
  const { createActivity } = useActivities();

  // Initialize backup bridge
  useEffect(() => {
    const cleanup = initBackupBridge();
    return cleanup;
  }, []);

  // Initialize activity bridge for Hub integration
  useEffect(() => {
    const cleanup = initializeActivityBridge((data) => {
      if (!data.name) return null;
      // Create activity with default type 'trade_show'
      return createActivity('trade_show', data);
    });
    return cleanup;
  }, [createActivity]);

  return (
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
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ActivityProvider>
          <AppWithBridges />
        </ActivityProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
