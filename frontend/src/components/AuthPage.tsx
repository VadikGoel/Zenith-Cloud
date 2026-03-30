import React from 'react';

export default function AuthPage({ type, onSubmit, setView }: any) {
  return (
    <div className="h-screen flex items-center justify-center bg-[#020202] p-6 font-sans relative overflow-hidden text-center">
      <div className="bg-[#080808] p-16 rounded-[5rem] border border-white/5 shadow-2xl w-full max-w-lg space-y-12">
        <div className="space-y-6">
          <div className="w-28 h-28 bg-blue-600 rounded-[3rem] flex items-center justify-center mx-auto text-white text-6xl font-black shadow-[0_30px_100px_rgba(59,130,246,0.4)]">Z</div>
          <h1 className="text-5xl font-black text-white tracking-tighter italic uppercase underline decoration-blue-600 decoration-8 underline-offset-[10px]">Zenith</h1>
          <p className="text-gray-700 text-[10px] font-black uppercase tracking-[0.6em] pt-2">Encrypted Hardware Storage Node</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-6">
          {type !== 'verify' && <input name="username" placeholder="IDENTIFIER" className="w-full p-7 bg-white/[0.02] border border-white/10 rounded-[2.5rem] outline-none focus:border-blue-500/50 text-white font-black text-center tracking-[0.2em] uppercase shadow-inner" required />}
          {type === 'register' && <input name="email" type="email" placeholder="GMAIL ADDRESS" className="w-full p-7 bg-white/[0.02] border border-white/10 rounded-[2.5rem] outline-none focus:border-blue-500/50 text-white font-black text-center tracking-[0.2em] uppercase shadow-inner" required />}
          {type === 'verify' && <input name="code" placeholder="OTP CODE" className="w-full p-10 bg-white/[0.02] border border-white/10 rounded-[3rem] outline-none focus:border-blue-500 text-white text-6xl font-black text-center tracking-[0.4em] shadow-inner uppercase" maxLength={6} required />}
          {type !== 'verify' && <input name="password" type="password" placeholder="MASTER KEY" className="w-full p-7 bg-white/[0.02] border border-white/10 rounded-[2.5rem] outline-none focus:border-blue-500/50 text-white font-black text-center tracking-[0.2em] uppercase shadow-inner" required />}
          <button type="submit" className="w-full bg-blue-600 text-white font-black py-8 rounded-[3rem] shadow-2xl uppercase tracking-[0.4em] text-sm hover:bg-blue-700 active:scale-95 mt-6 transition-all italic underline decoration-white/20">Execute {type}_Protocol</button>
        </form>
        <button onClick={() => setView(type === 'login' ? 'register' : 'login')} className="w-full text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] hover:text-white transition-all underline decoration-2 underline-offset-[8px]">
          {type === 'login' ? 'Request Private Node' : 'Return to Authorization Gate'}
        </button>
      </div>
    </div>
  );
}
