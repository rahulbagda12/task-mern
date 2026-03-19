import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Mail, MoreVertical, Shield, Check, X, Loader2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const roleColors = {
  admin: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300',
  hr: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
  manager: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
  employee: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
};

const Team = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', email: '', password: '', role: 'employee' });

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      const { data } = await axios.get('/api/auth/users');
      setTeamMembers(data);
    } catch (err) {
      toast.error('Failed to fetch team members.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addMember = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('/api/auth/register', newMember);
      setTeamMembers([...teamMembers, data]);
      setShowAddModal(false);
      setNewMember({ name: '', email: '', password: '', role: 'employee' });
      toast.success('Member added successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member');
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;
    try {
      await axios.delete(`/api/auth/users/${id}`);
      toast.success('Member removed');
      setTeamMembers(teamMembers.filter(m => m._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error removing member.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Team Members</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">{teamMembers.length} members in your workspace.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-sm transition-colors text-sm"
        >
          <UserPlus size={16} />
          Add Member
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Members', value: teamMembers.length },
          { label: 'Active Now', value: teamMembers.filter(m => m.isActive).length },
          { label: 'Admins & HR', value: teamMembers.filter(m => ['admin', 'hr'].includes(m.role)).length },
          { label: 'Avg. Tasks / Person', value: '-' }, 
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
            <p className="text-xs font-medium text-slate-400 mb-1">{s.label}</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-700">
                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Member</th>
                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-4 hidden md:table-cell">Role</th>
                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-4 hidden lg:table-cell">Status</th>
                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-4 hidden lg:table-cell">Joined</th>
                <th className="px-4 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {teamMembers.map((member, i) => (
                <motion.tr
                  key={member._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative flex-shrink-0">
                        <img
                          src={member.avatar || `https://ui-avatars.com/api/?name=${member.name}&background=random`}
                          alt={member.name}
                          className="w-9 h-9 rounded-full border border-slate-200 dark:border-slate-700"
                        />
                        <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-800 ${member.isActive ? 'bg-emerald-400' : 'bg-slate-300'}`}></span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{member.name}</p>
                        <p className="text-xs text-slate-400">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg capitalize ${roleColors[member.role]}`}>
                      {member.role === 'admin' && <Shield size={11} />}
                      {member.role}
                    </span>
                  </td>
                  <td className="px-4 py-4 hidden sm:table-cell">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg ${member.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'}`}>
                      {member.isActive ? <Check size={11} /> : <X size={11} />}
                      {member.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-4 hidden lg:table-cell">
                    <span className="text-xs text-slate-400">{new Date(member.createdAt).toLocaleDateString()}</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2 pr-4">
                      <button 
                        onClick={() => deleteUser(member._id)}
                        className="text-rose-500 hover:text-rose-700 p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Add New Member</h2>
              <button onClick={() => setShowAddModal(false)}><X className="w-6 h-6 text-slate-400" /></button>
            </div>
            <form onSubmit={addMember} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input required value={newMember.name} onChange={e => setNewMember({...newMember, name: e.target.value})} className="w-full px-4 py-2 rounded-xl border dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email Address</label>
                <input required type="email" value={newMember.email} onChange={e => setNewMember({...newMember, email: e.target.value})} className="w-full px-4 py-2 rounded-xl border dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input required type="password" value={newMember.password} onChange={e => setNewMember({...newMember, password: e.target.value})} className="w-full px-4 py-2 rounded-xl border dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="••••••••" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select value={newMember.role} onChange={e => setNewMember({...newMember, role: e.target.value})} className="w-full px-4 py-2 rounded-xl border dark:bg-slate-700 dark:border-slate-600 outline-none capitalize">
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="hr">HR</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all mt-4">Add Member</button>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default Team;
