import React, { useState } from 'react';
import { User, Globe, Instagram, Twitter, Github, Youtube, MessageSquare } from 'lucide-react';
import axios from 'axios';

const API_BASE = "http://localhost:8000/api";

export default function ProfileView({ user, isOwn, onUpdate }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const socialData = (() => { try { return JSON.parse(user.social_links || "{}") || {}; } catch(e) { return {}; } })();
  
  const handleSave = async (e: any) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('bio', e.target.bio.value);
    fd.append('handle', e.target.handle.value);
    fd.append('socials', JSON.stringify({
       instagram: e.target.instagram.value,
       twitter: e.target.twitter.value,
       github: e.target.github.value,
       youtube: e.target.youtube.value,
       discord: e.target.discord.value
    }));
    if (e.target.pfp.files[0]) fd.append('pfp', e.target.pfp.files[0]);
    try {
      await axios.post(`${API_BASE}/auth/profile`, fd);
      setIsEditing(false);
      onUpdate();
    } catch(err:any) { alert(err.response.data.detail); }
  };

  const getSocialIcon = (key: string, val: string) => {
     if (!val) return null;
     let Icon = Globe;
     let color = "text-gray-400";
     if (key === 'instagram') { Icon = Instagram; color = "text-pink-500 bg-pink-500/10"; }
     if (key === 'twitter') { Icon = Twitter; color = "text-blue-400 bg-blue-400/10"; }
     if (key === 'github') { Icon = Github; color = "text-white bg-white/10"; }
     if (key === 'youtube') { Icon = Youtube; color = "text-red-500 bg-red-500/10"; }
     if (key === 'discord') { Icon = MessageSquare; color = "text-indigo-400 bg-indigo-400/10"; }
     
     const url = key === 'discord' ? `https://discord.com/users/${val}` : `https://${key}.com/${val}`;
     return (
       <a key={key} href={url} target="_blank" rel="noreferrer" className={`p-6 rounded-[2.5rem] transition-all hover:scale-110 border border-white/5 shadow-2xl ${color}`}>
          <Icon size={32}/>
       </a>
     );
  };

  return (
    <main className="p-16 max-w-4xl mx-auto space-y-16 animate-in fade-in duration-500">
       <div className="flex justify-between items-end border-b border-white/5 pb-10">
          <div className="flex items-center gap-10">
             <div className="w-48 h-48 rounded-[4rem] bg-[#0a0a0a] border-8 border-[#080808] shadow-2xl overflow-hidden outline outline-1 outline-white/10 group relative">
                {user.pfp_url ? <img src={`http://localhost:8000${user.pfp_url}`} className="w-full h-full object-cover" /> : <User className="m-auto mt-12 text-gray-800" size={96}/>}
             </div>
             <div className="space-y-2">
                <h2 className="text-6xl font-black text-white tracking-tighter uppercase italic">{user.username}</h2>
                <p className="text-blue-500 font-black tracking-[0.4em] uppercase text-[10px]">@{user.handle || 'unassigned'}</p>
             </div>
          </div>
          {isOwn && (
            <button onClick={() => setIsEditing(!isEditing)} className="px-10 py-4 bg-white text-black font-black rounded-2xl hover:bg-blue-600 hover:text-white transition-all uppercase tracking-widest text-[10px] shadow-2xl">{isEditing ? 'Cancel' : 'Modify Identity'}</button>
          )}
       </div>

       {isEditing ? (
         <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in slide-in-from-bottom-10">
            <div className="space-y-6 md:col-span-2">
               <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-4 block underline decoration-blue-600">Avatar GIF</label>
               <input name="pfp" type="file" className="w-full p-8 bg-white/[0.02] border-2 border-dashed border-white/10 rounded-[3rem] outline-none text-gray-500 text-center font-bold" />
            </div>
            <div className="space-y-6 md:col-span-2">
               <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-4 block underline decoration-blue-600">Profile Handle (Unique UUID)</label>
               <input name="handle" defaultValue={user.handle} className="w-full p-8 bg-white/[0.02] border border-white/10 rounded-[3rem] outline-none text-2xl font-black text-blue-500 text-center tracking-widest" placeholder="UNIQUE_NODE_ID" />
            </div>
            <div className="space-y-6 md:col-span-2">
               <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-4 block">System Biography</label>
               <textarea name="bio" defaultValue={user.bio} className="w-full h-40 p-8 bg-white/[0.02] border border-white/10 rounded-[3rem] outline-none focus:border-blue-500/50 text-xl font-bold text-white shadow-inner text-center" placeholder="Define this node..." />
            </div>
            <input name="instagram" placeholder="Insta ID" defaultValue={socialData.instagram} className="p-6 bg-white/[0.02] border border-white/10 rounded-3xl font-bold text-center" />
            <input name="twitter" placeholder="Twitter ID" defaultValue={socialData.twitter} className="p-6 bg-white/[0.02] border border-white/10 rounded-3xl font-bold text-center" />
            <input name="github" placeholder="Github ID" defaultValue={socialData.github} className="p-6 bg-white/[0.02] border border-white/10 rounded-3xl font-bold text-center" />
            <input name="youtube" placeholder="Youtube ID" defaultValue={socialData.youtube} className="p-6 bg-white/[0.02] border border-white/10 rounded-3xl font-bold text-center" />
            <input name="discord" placeholder="Discord ID" defaultValue={socialData.discord} className="p-6 bg-white/[0.02] border border-white/10 rounded-3xl font-bold text-center" />
            <button type="submit" className="md:col-span-2 py-8 bg-blue-600 text-white font-black rounded-[3.5rem] text-2xl uppercase tracking-[0.3em] shadow-2xl shadow-blue-500/20 hover:scale-[1.02] transition-all italic">Commit To Hardware</button>
         </form>
       ) : (
         <div className="space-y-16 animate-in fade-in duration-700">
            <div className="p-16 bg-white/[0.01] border border-white/5 rounded-[5rem] relative shadow-inner overflow-hidden text-center">
               <div className="absolute top-0 left-0 w-64 h-64 bg-blue-600/5 blur-[120px] rounded-full"></div>
               <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-600/5 blur-[120px] rounded-full"></div>
               <p className="text-4xl font-medium text-gray-400 leading-relaxed italic relative z-10 font-serif">"{user.bio || "This node remains silent in the cloud."}"</p>
            </div>
            <div className="space-y-10">
               <h4 className="text-[10px] font-black text-gray-700 uppercase tracking-[0.6em] text-center italic">Network Cross-Links</h4>
               <div className="flex justify-center gap-10 flex-wrap">
                  {Object.entries(socialData).map(([k, v]) => getSocialIcon(k, v as string))}
               </div>
            </div>
         </div>
       )}
    </main>
  );
}
