import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { Toaster } from 'sonner';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Contacts from './pages/Contacts';
import News from './pages/News';
import Members from './pages/Members';
import Clients from './pages/Clients';
import ClientCourses from './pages/ClientCourses';
import Courses from './pages/Courses';
import Lessons from './pages/Lessons';
import Partners from './pages/Partners';
import Team from './pages/Team';
import Settings from './pages/Settings';
import Profile from './pages/Profile';

// Layout
import AdminLayout from './components/layout/AdminLayout';

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/admin/login" element={<Login />} />

          {/* Protected Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="contacts" element={<Contacts />} />
            <Route path="news" element={<News />} />
            <Route path="members" element={<Members />} />
            <Route path="clients" element={<Clients />} />
            <Route path="clients/:userId/courses" element={<ClientCourses />} />
            <Route path="courses" element={<Courses />} />
            <Route path="courses/:courseId/lessons" element={<Lessons />} />
            <Route path="partners" element={<Partners />} />
            <Route path="team" element={<Team />} />
            <Route path="settings" element={<Settings />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Redirect root to admin */}
          <Route path="/" element={<Navigate to="/admin" replace />} />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </BrowserRouter>

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgb(var(--bg-card))',
            color: 'rgb(var(--text))',
            border: '1px solid rgb(var(--border))',
          },
        }}
      />
    </>
  );
}

export default App;
