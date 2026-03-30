import React, { useState } from 'react';
import { Share2 } from 'lucide-react';
import axios from 'axios';

const API_BASE = "http://localhost:8000/api";

export default function ShareDialog({ item, onClose }: any) {
  const [password, setPassword] = useState("");
  const [link, setLink] = useState("");
  const [maxUses, setMaxUses] = useState(0);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    const fd = new FormData();
    fd.append('file_path', item.path);
    if(password) fd.append('password', password);
    fd.append('max_uses', maxUses.toString());
    try {
      const res = await axios.post(`${API_BASE}/share`, fd);
      setLink(`${window.location.origin}/share/${res.data.id}`);
    } catch(e) { alert("Fail"); }
    setLoading(false);
  };

  return (
    <div className="bg-[#080808] p-12 rounded-[3.5rem] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,1)] w-full max-w-md text-center space-y-10 animate-in zoom-in-95" onClick={e=>e.stopPropagation()}>
      <div className="w-20 h-20 bg-blue-600/20 text-blue-500 rounded-[2rem] flex items-center justify-center mx-auto border border-blue-500/20 shadow-inner"><Share2 size={40}/></div>
      <h3 className="text-3xl font-black text-white italic tracking-tight uppercase">Encrypt Node</h3>
      {!link ? (
        <div className="space-y-6">
          <input type="password" placeholder="Pass-key (Optional)" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-6 bg-white/5 border border-white/10 rounded-3xl outline-none text-center font-bold" />
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Single Access Mode (0=Unlim)</label>
            <input type="number" value={maxUses} onChange={e => setMaxUses(parseInt(e.target.value))} className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-center" />
          </div>
          <button onClick={generate} disabled={loading} className="w-full py-6 bg-blue-600 text-white font-black rounded-[2rem] shadow-2xl shadow-blue-600/20 uppercase tracking-widest">{loading ? 'SCANNING...' : 'GET SECURE URL'}</button>
        </div>
      ) : (
        <div className="space-y-6 animate-in zoom-in-95">
          <input readOnly value={link} className="w-full p-6 bg-blue-50 dark:bg-blue-900 text-blue-600 rounded-3xl text-[10px] text-center font-black" />
          <button onClick={() => {navigator.clipboard.writeText(link); alert("COPIED!")}} className="w-full py-6 bg-white text-black font-black rounded-[2rem]">COPY TO CLIPBOARD</button>
        </div>
      )}
      <button onClick={onClose} className="text-[10px] font-black text-gray-600 uppercase tracking-widest hover:text-white transition-all">Cancel Task</button>
    </div>
  );
}
