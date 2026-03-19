import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const AuthLayout = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white dark:bg-slate-950 text-slate-900 dark:text-white">
      {/* Left side Form Area */}
      <div className="flex w-full items-center justify-center p-8 bg-slate-50 dark:bg-slate-900 shadow-[inset_-10px_0_20px_-10px_rgba(0,0,0,0.05)] dark:shadow-[inset_-10px_0_20px_-10px_rgba(0,0,0,0.2)]">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>

      {/* Right side Image / Graphics */}
      <div className="hidden lg:flex relative items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/20 rounded-full blur-3xl blend-overlay" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-900/30 rounded-full blur-3xl blend-overlay" />
        
        <div className="relative z-10 max-w-lg text-center text-white px-8">
          <h2 className="text-4xl font-black mb-6 drop-shadow-lg">
            Elevate Your Workflow
          </h2>
          <p className="text-lg text-white/90 font-medium leading-relaxed drop-shadow-md">
            Join thousands of teams who are already mastering their productivity with our enterprise-grade task management ecosystem.
          </p>
          
          {/* Glassmorphism Mock UI Card */}
          <div className="mt-12 backdrop-blur-xl bg-white/10 p-6 rounded-2xl border border-white/20 shadow-2xl text-left">
            <div className="flex gap-3 items-center mb-4">
              <div className="flex -space-x-2">
                <img className="w-8 h-8 rounded-full border border-white/50" src="https://i.pravatar.cc/100?img=1" alt="Avatar"/>
                <img className="w-8 h-8 rounded-full border border-white/50" src="https://i.pravatar.cc/100?img=2" alt="Avatar"/>
                <img className="w-8 h-8 rounded-full border border-white/50" src="https://i.pravatar.cc/100?img=3" alt="Avatar"/>
              </div>
              <p className="text-sm font-semibold text-white/80">+20 online with you</p>
            </div>
            <div className="space-y-3">
              <div className="h-2 w-full bg-white/20 rounded-full"></div>
              <div className="h-2 w-3/4 bg-white/20 rounded-full"></div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
