import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Briefcase,
  CalendarDays,
  Bell,
  Shield,
  Clock,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-toastify';
import axios from 'axios';

// Role-based nav config: which roles can see each nav item
const allNavItems = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Overview',   to: '/dashboard',             roles: ['admin', 'hr', 'manager', 'employee'] },
  { id: 'tasks',     icon: CheckSquare,     label: 'Tasks',      to: '/dashboard/tasks',       roles: ['admin', 'manager', 'employee'] },
  { id: 'calendar',  icon: CalendarDays,    label: 'Calendar',   to: '/dashboard/calendar',    roles: ['admin', 'hr', 'manager', 'employee'] },
  { id: 'team',      icon: Users,           label: 'Team',       to: '/dashboard/team',        roles: ['admin', 'hr', 'manager'] },
  { id: 'analytics', icon: TrendingUp,      label: 'Analytics',  to: '/dashboard/analytics',   roles: ['admin', 'manager'] },
  { id: 'attendance',icon: Clock,           label: 'Attendance', to: '/dashboard/attendance',  roles: ['admin', 'hr'] },
];

const bottomItems = [
  { id: 'settings', icon: Settings, label: 'Settings', to: '/dashboard/settings' },
];

export default function Sidebar({ isOpen, setIsOpen }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  // Filter nav items based on the current user's role
  const role = user?.role || 'employee';
  const navItems = allNavItems.filter(item => item.roles.includes(role));

  const handleLogout = async () => {
    try { await axios.post('/api/auth/logout'); } catch (_) {}
    logout();
    toast.info('Logged out.');
    navigate('/login');
  };

  return (
    <motion.div
      animate={{ width: isOpen ? 256 : 72 }}
      transition={{ type: 'spring', stiffness: 280, damping: 28 }}
      className="h-screen bg-slate-900 border-r border-slate-800 text-slate-100 flex flex-col relative flex-shrink-0 z-20"
    >
      {/* Brand */}
      <div className="h-16 flex items-center px-4 border-b border-slate-800 overflow-hidden">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 flex-shrink-0">
          <Briefcase size={18} className="text-white" />
        </div>
        <AnimatePresence>
          {isOpen && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="ml-3 font-bold text-lg tracking-tight whitespace-nowrap overflow-hidden"
            >
              TaskFlow<span className="text-indigo-400">.</span>
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -right-3 top-20 w-6 h-6 bg-slate-800 rounded-full border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors z-50 shadow-md"
      >
        {isOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </button>

      {/* Nav Links */}
      <div className="flex-1 py-4 flex flex-col gap-1 px-2 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => (
          <NavItem key={item.id} item={item} isOpen={isOpen} />
        ))}
      </div>

      {/* Bottom */}
      <div className="p-2 border-t border-slate-800 space-y-1">
        {bottomItems.map((item) => (
          <NavItem key={item.id} item={item} isOpen={isOpen} />
        ))}

        {/* User Card */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-2 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
                </div>
                <div className="overflow-hidden min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{user?.name || 'User'}</p>
                  <p className="text-xs text-slate-400 capitalize truncate">{user?.role}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={handleLogout}
          className="w-full flex items-center p-3 mt-1 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all group relative overflow-hidden"
        >
          <div className="min-w-[32px] flex items-center justify-center">
            <LogOut size={18} className="group-hover:-translate-x-0.5 transition-transform" />
          </div>
          <AnimatePresence>
            {isOpen && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="ml-3 font-medium text-sm whitespace-nowrap"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
          {!isOpen && (
            <div className="absolute left-full ml-2 px-2.5 py-1 bg-slate-800 text-white rounded-md text-xs font-medium opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-xl border border-slate-700">
              Logout
            </div>
          )}
        </button>
      </div>
    </motion.div>
  );
}

function NavItem({ item, isOpen }) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.to}
      end={item.to === '/dashboard'}
      className={({ isActive }) =>
        `flex items-center p-3 rounded-xl transition-all relative group overflow-hidden ${
          isActive
            ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/20'
            : 'text-slate-400 hover:text-white hover:bg-white/5'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <div className="min-w-[32px] flex items-center justify-center flex-shrink-0">
            <Icon size={19} className={isActive ? 'text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]' : ''} />
          </div>

          <AnimatePresence>
            {isOpen && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                className={`ml-3 font-medium text-sm whitespace-nowrap ${isActive ? 'font-semibold' : ''}`}
              >
                {item.label}
              </motion.span>
            )}
          </AnimatePresence>

          {/* Tooltip for collapsed */}
          {!isOpen && (
            <div className="absolute left-full ml-2 px-2.5 py-1 bg-slate-800 text-white rounded-md text-xs font-medium opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-xl border border-slate-700">
              {item.label}
            </div>
          )}
        </>
      )}
    </NavLink>
  );
}
