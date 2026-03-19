import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuthStore } from './store/authStore';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Auth Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';

// Dashboard Pages
import Overview from './pages/Dashboard/Overview';
import KanbanBoard from './pages/Tasks/KanbanBoard';
import Analytics from './pages/Analytics/Analytics';
import Team from './pages/Team/Team';
import Attendance from './pages/Attendance/Attendance';
import CalendarPage from './pages/Calendar/CalendarPage';
import Settings from './pages/Settings/Settings';

// Protected Route - requires authentication
const ProtectedRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
};

// Role-guarded route - redirects to dashboard if role is not allowed
const RoleRoute = ({ allowedRoles }) => {
  const user = useAuthStore((state) => state.user);
  if (!allowedRoles.includes(user?.role)) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
};

// Root redirect - goes to home based on role
const RootRedirect = () => {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;

  if (user.role === 'admin') return <Navigate to="/dashboard" replace />;
  if (user.role === 'hr') return <Navigate to="/dashboard/attendance" replace />;
  if (user.role === 'manager' || user.role === 'employee') return <Navigate to="/dashboard/tasks" replace />;

  return <Navigate to="/dashboard" replace />;
};

function App() {
  // Apply saved theme on first load
  useEffect(() => {
    const savedTheme = localStorage.theme;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen text-slate-900 dark:text-white bg-[#F8FAFC] dark:bg-[#0F172A] font-inter selection:bg-indigo-500/30">
        <Routes>
          {/* Root redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Public Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
          </Route>

          {/* Protected Dashboard Routes */}
          <Route path="/dashboard" element={<ProtectedRoute />}>
            <Route index element={<Overview />} />
            <Route path="settings" element={<Settings />} />
            <Route path="calendar" element={<CalendarPage />} />

            {/* Employee + Manager + Admin */}
            <Route element={<RoleRoute allowedRoles={['admin', 'manager', 'employee']} />}>
              <Route path="tasks" element={<KanbanBoard />} />
            </Route>

            {/* Admin + Manager only */}
            <Route element={<RoleRoute allowedRoles={['admin', 'manager']} />}>
              <Route path="analytics" element={<Analytics />} />
            </Route>

            {/* Admin + HR + Manager */}
            <Route element={<RoleRoute allowedRoles={['admin', 'hr', 'manager']} />}>
              <Route path="team" element={<Team />} />
            </Route>

            {/* Admin + HR only */}
            <Route element={<RoleRoute allowedRoles={['admin', 'hr']} />}>
              <Route path="attendance" element={<Attendance />} />
            </Route>
          </Route>

          {/* Catch all */}
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </div>

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar
        newestOnTop
        closeOnClick
        draggable
        pauseOnHover
        theme="colored"
        toastClassName="!rounded-xl !shadow-xl"
      />
    </BrowserRouter>
  );
}

export default App;
