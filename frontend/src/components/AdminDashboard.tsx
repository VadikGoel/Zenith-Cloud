import React, { useState, useEffect } from 'react';
import { Shield, User, Lock, Trash2, Edit, Save, Power, UserPlus, HardDrive, Share2, Search, X, Settings } from 'lucide-react';
import axios from 'axios';

const API_BASE = "http://localhost:8000/api";

export default function AdminDashboard({ onClose }: any) {
  const [users, setUsers] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [tab, setView] = useState<'users' | 'settings'>('users');

  const fetchData = async () => {
    try {
      const [uRes, sRes] = await Promise.all([
        axios.get(`${API_BASE}/admin/users`),
        axios.get(`${API_BASE}/admin/settings`)
      ]);
      setUsers(uRes.data);
      setSettings(sRes.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const toggleRegistration = async () => {
    const newVal = settings.registration_enabled === 'true' ? 'false' : 'true';
    await axios.post(`${API_BASE}/admin/settings`, { registration_enabled: newVal });
    fetchData();
  };

  const updateLimit = async (uid: number) => {
    const limit = prompt("New Storage Limit (MB):");
    if (limit) {
      await axios.post(`${API_BASE}/admin/users/update`, { user_id: uid, storage_limit: parseInt(limit) });
      fetchData();
    }
  };

  const resetPassword = async (uid: number) => {
    const pass = prompt("Enter NEW Master Key for this node:");
    if (pass) {
      await axios.post(`${API_BASE}/admin/users/update`, { user_id: uid, password: pass });
      alert("Hardware key updated.");
    }
  };

  const toggleAdmin = async (u: any) => {
    if (u.username === 'cloudadmin') return;
    await axios.post(`${API_BASE}/admin/users/update`, { user_id: u.id, is_admin: !u.is_admin });
    fetchData();
  };

  const deleteUser = async (uid: number) => {
    if (confirm("Permanently wipe this node and all associated data?")) {
      await axios.delete(`${API_BASE}/admin/users/${uid}`);
      fetchData();
    }
  };

  if (loading) return <div className="p-20 text-center font-mono text-blue-500 animate-pulse uppercase tracking-[0.5em]">Syncing_Admin_Matrix...</div>;

  return (
    <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-3xl flex animate-in fade-in">
      {/* Admin Sidebar */}
      <div className="w-80 bg-[#080808] border-r border-white/5 flex flex-col shadow-2xl">
        <div className="p-10 border-b border-white/5">
          <div className="flex items-center gap-4 mb-2">
            <Shield className="text-blue-500" size={24} />
            <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Command_Center</h2>
          </div>
          <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Root Level 0 Access</p>
        </div>

        <nav className="flex-1 p-6 space-y-2">
          <button onClick={() => setView('users')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${tab === 'users' ? 'bg-blue-600 text-white shadow-xl' : 'text-gray-500 hover:bg-white/5'}`}>
            <User size={18} /> Node Directory
          </button>
          <button onClick={() => setView('settings')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${tab === 'settings' ? 'bg-blue-600 text-white shadow-xl' : 'text-gray-500 hover:bg-white/5'}`}>
            <Settings size={18} /> System Core
          </button>
        </nav>

        <div className="p-8">
          <button onClick={onClose} className="w-full py-4 bg-white/[0.02] border border-white/10 text-gray-400 rounded-2xl hover:text-white transition-all font-black uppercase text-xs">Exit Console</button>
        </div>
      </div>

      {/* Admin Content */}
      <main className="flex-1 overflow-y-auto p-16">
        {tab === 'users' && (
          <div className="space-y-12">
            <div className="flex justify-between items-end">
              <div>
                <h3 className="text-5xl font-black text-white italic uppercase tracking-tighter mb-2">Verified_Nodes</h3>
                <p className="text-gray-600 text-xs font-bold uppercase tracking-widest">Global active storage nodes across hardware tunnel</p>
              </div>
              <div className="bg-white/5 px-6 py-3 rounded-2xl border border-white/10 flex items-center gap-4">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Active nodes:</span>
                <span className="text-blue-500 font-black text-xl font-mono">{users.length}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {users.map((u: any) => (
                <div key={u.id} className="group p-8 bg-white/[0.01] border border-white/5 rounded-[3rem] flex items-center justify-between hover:bg-white/[0.03] hover:border-white/10 transition-all shadow-inner">
                  <div className="flex items-center gap-8">
                    <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center text-3xl font-black border-2 ${u.is_admin ? 'bg-blue-600 text-white border-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.3)]' : 'bg-black text-gray-600 border-white/5'}`}>
                      {u.username[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-4">
                        <p className="text-2xl font-black text-white italic uppercase tracking-tight">{u.username}</p>
                        {u.is_admin && <span className="bg-blue-500/10 text-blue-500 text-[8px] font-black uppercase px-2 py-1 rounded-md border border-blue-500/20">ADMIN_NODE</span>}
                      </div>
                      <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-1">UUID: @{u.handle || 'GUEST'} // Storage: {u.storage_limit === 0 ? 'UNLIMITED' : `${u.storage_limit}MB`}</p>
                    </div>
                  </div>

                  <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
                    <button onClick={() => toggleAdmin(u)} className={`p-4 rounded-2xl transition-all ${u.is_admin ? 'bg-blue-600/10 text-blue-500 hover:bg-blue-600 hover:text-white' : 'bg-white/5 text-gray-500 hover:bg-blue-600 hover:text-white'}`} title="Toggle Admin">
                      <Shield size={20} />
                    </button>
                    <button onClick={() => resetPassword(u.id)} className="p-4 bg-white/5 text-gray-500 hover:bg-white/10 hover:text-white rounded-2xl transition-all" title="Reset Master Key">
                      <Lock size={20} />
                    </button>
                    <button onClick={() => updateLimit(u.id)} className="p-4 bg-white/5 text-gray-500 hover:bg-white/10 hover:text-white rounded-2xl transition-all" title="Adjust Storage">
                      <HardDrive size={20} />
                    </button>
                    {u.username !== 'cloudadmin' && (
                      <button onClick={() => deleteUser(u.id)} className="p-4 bg-red-500/5 text-red-500/40 hover:bg-red-500 hover:text-white rounded-2xl transition-all" title="Terminate Node">
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'settings' && (
          <div className="max-w-3xl space-y-16">
            <div>
              <h3 className="text-5xl font-black text-white italic uppercase tracking-tighter mb-2">System_Core</h3>
              <p className="text-gray-600 text-xs font-bold uppercase tracking-widest">Global hardware security and authorization protocols</p>
            </div>

            <div className="space-y-8">
              <div className="p-10 bg-white/[0.01] border border-white/5 rounded-[4rem] flex items-center justify-between shadow-2xl">
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <UserPlus className="text-blue-500" size={24} />
                    <p className="text-2xl font-black text-white italic uppercase tracking-tight">Public_Registration</p>
                  </div>
                  <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest ml-10">Control if new hardware nodes can be initialized on this server</p>
                </div>
                <button 
                  onClick={toggleRegistration}
                  className={`relative w-24 h-12 rounded-full transition-all duration-500 p-1 ${settings.registration_enabled === 'true' ? 'bg-blue-600 shadow-[0_0_20px_rgba(59,130,246,0.4)]' : 'bg-white/10'}`}
                >
                  <div className={`w-10 h-10 bg-white rounded-full transition-all duration-500 shadow-xl ${settings.registration_enabled === 'true' ? 'translate-x-12' : 'translate-x-0'}`}></div>
                </button>
              </div>

              <div className="p-10 bg-white/[0.01] border border-white/5 rounded-[4rem] space-y-10 shadow-2xl">
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <HardDrive className="text-blue-500" size={24} />
                    <p className="text-2xl font-black text-white italic uppercase tracking-tight">SMTP_Relay_Config</p>
                  </div>
                  <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest ml-10">Configure outgoing mail for OTP verification codes</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ml-10">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">Application Name (Branding)</label>
                    <input 
                      value={settings.app_name || ''} 
                      onChange={e => setSettings({...settings, app_name: e.target.value})}
                      className="w-full p-6 bg-black border border-white/10 rounded-3xl outline-none text-blue-500 font-black text-xl uppercase tracking-tighter focus:border-blue-500/50 transition-all"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">Storage Base Path (Hardware Node Parent)</label>
                    <input 
                      value={settings.storage_base_path || ''} 
                      placeholder="e.g. D:\ZenithStorage"
                      onChange={e => setSettings({...settings, storage_base_path: e.target.value})}
                      className="w-full p-4 bg-black border border-white/10 rounded-2xl outline-none text-white font-mono text-xs focus:border-blue-500/50 transition-all"
                    />
                    <p className="text-[9px] text-gray-700 font-bold uppercase tracking-widest ml-4">Every new node will automatically generate an isolated directory inside this path.</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">SMTP Host</label>
                    <input 
                      value={settings.smtp_server || ''} 
                      onChange={e => setSettings({...settings, smtp_server: e.target.value})}
                      className="w-full p-4 bg-black border border-white/10 rounded-2xl outline-none text-white font-mono text-xs focus:border-blue-500/50 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">SMTP Port</label>
                    <input 
                      value={settings.smtp_port || ''} 
                      onChange={e => setSettings({...settings, smtp_port: e.target.value})}
                      className="w-full p-4 bg-black border border-white/10 rounded-2xl outline-none text-white font-mono text-xs focus:border-blue-500/50 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">Sender Email (Gmail)</label>
                    <input 
                      value={settings.smtp_user || ''} 
                      onChange={e => setSettings({...settings, smtp_user: e.target.value})}
                      className="w-full p-4 bg-black border border-white/10 rounded-2xl outline-none text-white font-mono text-xs focus:border-blue-500/50 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">App Password</label>
                    <input 
                      type="password"
                      value={settings.smtp_password || ''} 
                      onChange={e => setSettings({...settings, smtp_password: e.target.value})}
                      className="w-full p-4 bg-black border border-white/10 rounded-2xl outline-none text-white font-mono text-xs focus:border-blue-500/50 transition-all"
                    />
                  </div>
                  <button 
                    onClick={async () => {
                      await axios.post(`${API_BASE}/admin/settings`, settings);
                      alert("System Core Updated.");
                    }}
                    className="md:col-span-2 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl hover:bg-blue-700 transition-all uppercase tracking-widest text-xs"
                  >
                    Save Hardware Protocols
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-blue-600/5 border border-blue-500/10 p-10 rounded-[4rem] space-y-4">
               <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] italic">System_Security_Notice</p>
               <p className="text-sm text-gray-500 leading-relaxed font-medium">ZENITH security protocols recommend disabling registration after initializing your primary node network. This prevents unauthorized block access from external sources.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
