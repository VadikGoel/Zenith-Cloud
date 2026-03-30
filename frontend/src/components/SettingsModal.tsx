import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Edit } from 'lucide-react';
import axios from 'axios';

const API_BASE = "http://localhost:8000/api";

export default function SettingsModal({ roots, onRootsUpdate, user, onClose }: any) {
  const [users, setUsers] = useState<any[]>([]);
  
  useEffect(() => {
    if (user?.is_admin) axios.get(`${API_BASE}/admin/users`).then(res => setUsers(res.data)).catch(()=>{});
  }, [user]);

  const addNode = async () => {
    const name = prompt("Drive Name:");
    const path = prompt("Full Path (C:\\...):");
    if(name && path) { 
      const fd = new FormData();
      fd.append('name', name);
      fd.append('path', path);
      await axios.post(`${API_BASE}/storage-roots`, fd);
      onRootsUpdate(); 
    }
  };

  const updateLimit = async (uid: number) => {
    const limit = prompt("New Limit (MB):");
    if(limit) await axios.post(`${API_BASE}/admin/users/update`, { user_id: uid, storage_limit: parseInt(limit) });
  };

  return (
    <div className="fixed inset-0 z-[200] flex justify-end bg-black/95 backdrop-blur-3xl animate-in fade-in" onClick={onClose}>
      <div className="w-[550px] h-full bg-[#080808] border-l border-white/5 p-12 shadow-2xl overflow-y-auto" onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between mb-16">
          <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase flex items-center gap-4 underline decoration-blue-600 decoration-8 underline-offset-[12px]">System Console</h2>
          <button onClick={onClose} className="p-4 hover:bg-white/5 rounded-full transition-all text-white active:scale-90"><X size={32}/></button>
        </div>
        <div className="space-y-20">
          <section className="space-y-8">
             <div className="flex justify-between items-center px-4">
                <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.5em]">Hardware Drives</h3>
                <button onClick={addNode} className="p-2 bg-blue-600/10 text-blue-500 rounded-lg hover:bg-blue-600 hover:text-white transition-all"><Plus size={16}/></button>
             </div>
            <div className="space-y-4">
              {roots.map((r:any) => (
                <div key={r.id} className="p-8 bg-white/[0.02] border border-white/5 rounded-[3rem] flex items-center justify-between group shadow-inner">
                  <div className="min-w-0">
                    <p className="font-black text-white text-xl truncate uppercase italic">{r.name}</p>
                    <p className="text-[9px] text-gray-600 font-mono mt-2 truncate bg-black/40 p-2 rounded-xl border border-white/5">{r.path}</p>
                  </div>
                  <button onClick={() => axios.delete(`${API_BASE}/storage-roots/${r.id}`).then(onRootsUpdate)} className="p-4 text-red-500/20 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all opacity-0 group-hover:opacity-100"><Trash2/></button>
                </div>
              ))}
            </div>
          </section>
          {user?.is_admin && (
            <section className="space-y-8">
              <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.5em] ml-4">Verified Network Nodes</h3>
              <div className="grid grid-cols-1 gap-4 px-2">
                {users.map((u:any) => (
                  <div key={u.id} className="p-6 bg-white/[0.01] border border-white/5 rounded-[2.5rem] flex items-center justify-between hover:bg-white/[0.03] transition-all group">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500 font-black uppercase text-xl border border-blue-500/10 shadow-inner group-hover:scale-110 transition-transform">{u.username[0]}</div>
                      <div>
                         <p className="font-black text-white tracking-tight truncate text-lg uppercase italic">{u.username}</p>
                         <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest mt-1">Limit: {u.storage_limit === 0 ? 'Unlimited' : u.storage_limit + 'MB'}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                       <button onClick={() => updateLimit(u.id)} className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg"><Edit size={18}/></button>
                       {u.username !== 'cloudadmin' && <button onClick={() => axios.delete(`${API_BASE}/admin/users/${u.id}`).then(() => window.location.reload())} className="p-3 text-red-500/20 hover:text-red-500 hover:scale-110 transition-all"><Trash2 size={24}/></button>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
