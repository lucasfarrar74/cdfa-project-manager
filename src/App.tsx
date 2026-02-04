import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ActivityProvider } from './context/ActivityContext';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './components/dashboard/Dashboard';
import CalendarView from './components/calendar/CalendarView';
import TimelineView from './components/timeline/TimelineView';
import ActivityList from './components/activities/ActivityList';

function App() {
  return (
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
  );
}

export default App;
