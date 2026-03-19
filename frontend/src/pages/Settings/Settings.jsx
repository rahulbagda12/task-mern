import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Bell, Palette, Shield, Save, Camera } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-toastify';

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Palette },
];

const InputField = ({ label, type = 'text', defaultValue, placeholder, disabled }) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{label}</label>
    <input
      type={type}
      defaultValue={defaultValue}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    />
  </div>
);

const Toggle = ({ label, description, defaultChecked }) => {
  const [on, setOn] = useState(defaultChecked ?? true);
  return (
    <div className="flex items-start justify-between gap-4 py-4 border-b border-slate-100 dark:border-slate-700 last:border-0">
      <div>
        <p className="text-sm font-semibold text-slate-800 dark:text-white">{label}</p>
        {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => setOn(!on)}
        className={`relative inline-flex h-5 w-9 items-center rounded-full flex-shrink-0 transition-colors ${on ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${on ? 'translate-x-4' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );
};

const ProfileTab = ({ user }) => (
  <div className="space-y-6">
    {/* Avatar */}
    <div className="flex items-center gap-5">
      <div className="relative">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-black">
          {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
        </div>
        <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg flex items-center justify-center shadow-sm hover:bg-slate-50 transition-colors">
          <Camera size={13} className="text-slate-500" />
        </button>
      </div>
      <div>
        <p className="font-semibold text-slate-900 dark:text-white">{user?.name}</p>
        <p className="text-sm text-slate-400 capitalize">{user?.role} · Member since 2025</p>
        <button className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline">Upload new photo</button>
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <InputField label="Full Name" defaultValue={user?.name} placeholder="John Doe" />
      <InputField label="Email Address" defaultValue={user?.email} type="email" disabled />
      <InputField label="Job Title" placeholder="e.g. Product Manager" />
      <InputField label="Department" placeholder="e.g. Engineering" />
      <InputField label="Phone" type="tel" placeholder="+1 (555) 000-0000" />
      <div className="flex items-end">
        <div className="w-full">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Role</label>
          <div className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-500 dark:text-slate-400 capitalize flex items-center gap-2">
            <Shield size={13} />
            {user?.role} (contact admin to change)
          </div>
        </div>
      </div>
    </div>
  </div>
);

const SecurityTab = () => (
  <div className="space-y-6">
    <div className="space-y-4">
      <h3 className="font-semibold text-slate-800 dark:text-white">Change Password</h3>
      <InputField label="Current Password" type="password" placeholder="••••••••" />
      <InputField label="New Password" type="password" placeholder="Min. 8 characters" />
      <InputField label="Confirm New Password" type="password" placeholder="••••••••" />
    </div>
    <div className="p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl">
      <p className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-1">Password requirements</p>
      <ul className="text-xs text-amber-600 dark:text-amber-300 space-y-1 list-disc list-inside">
        <li>At least 8 characters</li>
        <li>One uppercase letter</li>
        <li>One number or special character</li>
      </ul>
    </div>
    <div>
      <h3 className="font-semibold text-slate-800 dark:text-white mb-3">Sessions</h3>
      <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-800 dark:text-white">Current Session</p>
          <p className="text-xs text-slate-400 mt-0.5">Chrome · Windows · Active now</p>
        </div>
        <span className="text-xs font-semibold text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-lg">Active</span>
      </div>
    </div>
  </div>
);

const NotificationsTab = () => (
  <div>
    <p className="text-sm text-slate-400 mb-4">Control which notifications you receive.</p>
    <Toggle label="Task Assigned" description="Notify when a task is assigned to you." defaultChecked={true} />
    <Toggle label="Task Deadline" description="Remind 24h before task due date." defaultChecked={true} />
    <Toggle label="Task Comments" description="Notify when someone comments on your task." defaultChecked={true} />
    <Toggle label="Team Updates" description="Notify when team members join or leave." defaultChecked={false} />
    <Toggle label="Weekly Digest" description="Get a weekly activity summary via email." defaultChecked={true} />
    <Toggle label="Marketing Emails" description="News, tips and product updates." defaultChecked={false} />
  </div>
);

const AppearanceTab = () => {
  const [theme, setTheme] = useState(
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  );
  const applyTheme = (t) => {
    setTheme(t);
    if (t === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    }
  };
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Theme</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { key: 'light', label: 'Light', bg: 'bg-slate-100', inner: 'bg-white', text: 'text-slate-800' },
            { key: 'dark', label: 'Dark', bg: 'bg-slate-800', inner: 'bg-slate-900', text: 'text-white' },
            { key: 'system', label: 'System', bg: 'bg-gradient-to-br from-slate-100 to-slate-800', inner: 'bg-slate-400', text: 'text-slate-700' },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => applyTheme(t.key === 'system' ? 'light' : t.key)}
              className={`p-4 rounded-2xl border-2 transition-all ${
                theme === t.key ? 'border-indigo-500 shadow-md shadow-indigo-500/20' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300'
              }`}
            >
              <div className={`w-full h-10 rounded-xl ${t.bg} mb-2 p-1.5`}>
                <div className={`h-full w-2/3 rounded-md ${t.inner}`}></div>
              </div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t.label}</p>
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Accent Color</p>
        <div className="flex gap-3">
          {['indigo', 'violet', 'blue', 'emerald', 'rose', 'amber'].map(c => (
            <button
              key={c}
              className={`w-8 h-8 rounded-full bg-${c}-500 ring-2 ring-offset-2 ring-transparent hover:ring-${c}-400 transition-all dark:ring-offset-slate-900`}
              title={c}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const Settings = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');

  const handleSave = () => {
    toast.success('Settings saved successfully!');
  };

  const tabContent = {
    profile: <ProfileTab user={user} />,
    security: <SecurityTab />,
    notifications: <NotificationsTab />,
    appearance: <AppearanceTab />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Manage your account and preferences.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        {/* Tab Bar */}
        <div className="flex border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6 md:p-8">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {tabContent[activeTab]}
          </motion.div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 md:px-8 py-4 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
          <button className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors">
            Cancel
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            className="px-5 py-2 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2"
          >
            <Save size={15} />
            Save Changes
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default Settings;
