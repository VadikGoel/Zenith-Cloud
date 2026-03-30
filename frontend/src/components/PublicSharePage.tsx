import React, { useState, useEffect } from 'react';
import { File, User, Instagram, Twitter, Github, Globe, Eye, Download, Shield } from 'lucide-react';
import axios from 'axios';

const API_BASE = "http://localhost:8000/api";

export default function PublicSharePage({ shareId }: any) {
  const [info, setInfo] = useState<any>(null);
  const [password, setPassword] = useState("");
  
  useEffect(() => {
    axios.get(`${API_BASE}/share/${shareId}/info`)
      .then(res => setInfo(res.data))
      .catch(()=>alert("EXPIRED OR INVALID"));
  }, [shareId]);

  if (!info) return <div className="h-screen bg-black flex items-center justify-center text-white font-black uppercase tracking-[0.8em] animate-pulse text-xs italic">Establish Hardware link...</div>;
  
  const socials = (() => { try { return JSON.parse(info.socials || "{}") || {}; } catch(e) { return {}; } })();

  return (
    <div className="h-screen bg-[#020202] flex items-center justify-center p-6 font-sans relative overflow-hidden">
       <div className="absolute -top-64 -left-64 w-[600px] h-[640px] bg-blue-600/10 blur-[180px] rounded-full opacity-50"></div>
       <div className="bg-[#080808] p-20 rounded-[6rem] shadow-[0_100px_200px_-50px_rgba(0,0,0,1)] w-full max-w-4xl text-center space-y-16 border border-white/5 relative overflow-hidden">
          <div className="w-40 h-40 bg-white/[0.02] text-blue-500 rounded-[4.5rem] flex items-center justify-center mx-auto border border-white/5 shadow-inner"><File size={80} strokeWidth={1}/></div>
          <div className="space-y-4">
            <h2 className="text-6xl font-black text-white tracking-tighter uppercase italic">{info.filename}</h2>
            <p className="text-xs font-black text-blue-600 uppercase tracking-[0.8em] italic opacity-80">Encrypted Cloud Packet</p>
          </div>
          <div className="flex items-center gap-10 p-12 bg-white/[0.01] rounded-[4.5rem] border border-white/5 w-full max-w-lg mx-auto shadow-2xl backdrop-blur-xl group">
             <div className="w-24 h-24 rounded-[2rem] overflow-hidden bg-black border border-white/10 shadow-2xl">
                {info.pfp ? <img src={`http://localhost:8000${info.pfp}`} className="w-full h-full object-cover" /> : <User className="m-auto mt-6 text-gray-800" size={48}/>}
             </div>
             <div className="text-left flex-1 min-w-0">
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.5em] mb-2">Original Source</p>
                <p className="font-black text-3xl text-white tracking-tight italic truncate">@{info.username}</p>
                <div className="flex gap-5 mt-5">
                   {socials.instagram && <a href={`https://instagram.com/${socials.instagram}`} target="_blank" rel="noreferrer" className="p-3 bg-pink-500/10 text-pink-500 rounded-xl"><Instagram size={18} /></a>}
                   {socials.twitter && <a href={`https://twitter.com/${socials.twitter}`} target="_blank" rel="noreferrer" className="p-3 bg-blue-400/10 text-blue-400 rounded-xl"><Twitter size={18} /></a>}
                   {socials.github && <a href={`https://github.com/${socials.github}`} target="_blank" rel="noreferrer" className="p-3 bg-white/10 text-white rounded-xl"><Github size={18} /></a>}
                   <Globe size={18} className="text-gray-600 hover:text-blue-500 cursor-pointer"/>
                </div>
             </div>
          </div>
          <div className="w-full max-w-md mx-auto space-y-10 relative z-10">
             {info.needs_password && <input type="password" placeholder="SECURE PROTOCOL KEY" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-10 bg-black border border-white/10 rounded-[3rem] outline-none text-center font-black text-4xl tracking-[0.5em] text-blue-500 focus:border-blue-500/50 shadow-inner" />}
             <div className="flex items-center justify-center gap-3 text-gray-500 text-xs font-black uppercase tracking-widest"><Eye size={14}/> Access Count: {info.views}</div>
             <button onClick={async () => {
                const fd = new FormData(); if(password) fd.append('password', password);
                try {
                  const res = await axios.post(`${API_BASE}/share/${shareId}/download`, fd, { responseType: 'blob' });
                  const a = document.createElement('a'); a.href = URL.createObjectURL(res.data); a.download = info.filename; a.click();
                } catch(e) { alert("WRONG_KEY"); }
             }} className="w-full bg-white text-black font-black py-10 rounded-[4rem] shadow-2xl text-3xl hover:bg-blue-600 hover:text-white transition-all uppercase tracking-[0.3em] flex items-center justify-center gap-8 italic">
                <Download size={40} /> DOWNLOAD
             </button>
          </div>
          <div className="flex items-center justify-center gap-5 text-gray-800 pt-4 opacity-50"><Shield size={20}/><p className="text-[10px] font-black uppercase tracking-[0.6em]">ZENITH_SECURITY_PROTOCOL_ACTIVE</p></div>
       </div>
    </div>
  );
}
