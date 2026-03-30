import React from 'react';
import { Github, Shield, HardDrive, Cpu, Zap, Code } from 'lucide-react';

export default function LandingPage({ appName, onEnter }: { appName: string, onEnter: () => void }) {
  const initial = appName ? appName[0] : 'Z';
  
  return (
    <div className="h-screen bg-[#020202] text-white flex flex-col overflow-hidden relative selection:bg-blue-500/30 font-sans">
       {/* Background Ambient Glows */}
       <div className="absolute top-[-10%] -left-20 w-[600px] h-[600px] bg-blue-600/10 blur-[150px] rounded-full animate-pulse"></div>
       <div className="absolute bottom-[-10%] -right-20 w-[600px] h-[600px] bg-indigo-600/10 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
       
       {/* Nav */}
       <header className="h-24 px-12 flex items-center justify-between relative z-10 backdrop-blur-md bg-black/20 border-b border-white/5">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center font-black text-2xl shadow-2xl shadow-blue-500/20">{initial}</div>
             <span className="text-2xl font-black italic tracking-tighter uppercase">{appName || 'Zenith'}</span>
          </div>
          <div className="flex items-center gap-8">
             <nav className="hidden md:flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
                <a href="#features" className="hover:text-blue-500 transition-colors">Infrastructure</a>
                <a href="#architect" className="hover:text-blue-500 transition-colors">Architect</a>
                <a href="#security" className="hover:text-blue-500 transition-colors">Security</a>
             </nav>
             <button onClick={onEnter} className="px-10 py-4 bg-white text-black font-black rounded-2xl hover:bg-blue-600 hover:text-white transition-all uppercase tracking-widest text-xs shadow-2xl active:scale-95">Access_Node</button>
          </div>
       </header>

       <div className="flex-1 overflow-y-auto scrollbar-hide snap-y snap-mandatory">
          {/* Hero Section */}
          <section className="h-[calc(100vh-6rem)] flex flex-col items-center justify-center px-10 text-center relative snap-start space-y-12">
             <div className="space-y-6">
                <p className="text-blue-500 font-black tracking-[0.8em] text-[10px] uppercase animate-pulse">Zenith_Protocol_v1.5_Active</p>
                <h1 className="text-8xl md:text-9xl font-black italic tracking-tighter uppercase leading-[0.8] mix-blend-difference">
                   Own Your<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500 inline-block mt-4">Hardware</span><br/>Cloud.
                </h1>
             </div>
             <p className="max-w-2xl text-gray-500 font-medium text-lg leading-relaxed">
                {appName || 'Zenith'} is a high-performance, self-hosted hardware tunnel. Store, stream, and share your digital blocks with absolute OLED-grade privacy and zero third-party oversight.
             </p>
             <div className="flex flex-col items-center gap-4">
                <button onClick={onEnter} className="px-16 py-8 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-[2.5rem] text-2xl uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 italic">Initialize Protocol</button>
                <p className="text-[9px] font-black text-gray-700 uppercase tracking-[0.5em]">No Registration Required for Public Nodes</p>
             </div>
          </section>

          {/* About Architect Section */}
          <section id="architect" className="min-h-screen flex flex-col items-center justify-center px-10 relative snap-start bg-[#050505]/50 border-y border-white/5 py-32">
             <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
                <div className="space-y-10">
                   <div className="space-y-4">
                      <h4 className="text-blue-500 font-black text-xs tracking-[0.6em] uppercase">System_Architect</h4>
                      <h2 className="text-7xl font-black italic tracking-tighter uppercase text-white leading-none">Vadik<br/>Goel.</h2>
                   </div>
                   <p className="text-gray-400 text-xl leading-relaxed font-medium">
                      The visionary behind the Zenith Infrastructure. Vadik designed this hardware-first cloud to eliminate the vulnerabilities of centralized storage. 
                      Every line of code is optimized for extreme performance and unshakeable privacy.
                   </p>
                   <div className="flex gap-6">
                      <a href="https://github.com/vadikgoel" target="_blank" rel="noreferrer" className="flex items-center gap-4 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group">
                         <Github size={20} className="text-gray-400 group-hover:text-white" />
                         <span className="font-black uppercase tracking-widest text-xs">vadikgoel</span>
                      </a>
                      <div className="flex items-center gap-4 px-8 py-4 bg-blue-600/10 border border-blue-500/20 rounded-2xl">
                         <Code size={20} className="text-blue-500" />
                         <span className="font-black uppercase tracking-widest text-xs text-blue-500">Lead_Engineer</span>
                      </div>
                   </div>
                </div>
                <div className="relative">
                   <div className="aspect-square bg-gradient-to-br from-blue-600/20 to-transparent rounded-[5rem] border border-white/10 shadow-inner flex items-center justify-center relative overflow-hidden group">
                      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                      <Cpu size={200} strokeWidth={0.5} className="text-blue-500 opacity-20 group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute inset-0 flex items-center justify-center">
                         <p className="text-[150px] font-black text-white/5 italic select-none">VG</p>
                      </div>
                   </div>
                   {/* Abstract Data Flow Decoration */}
                   <div className="absolute -top-10 -right-10 w-32 h-32 border-t-2 border-r-2 border-blue-500/30 rounded-tr-[3rem]"></div>
                   <div className="absolute -bottom-10 -left-10 w-32 h-32 border-b-2 border-l-2 border-indigo-500/30 rounded-bl-[3rem]"></div>
                </div>
             </div>
          </section>

          {/* Infrastructure Section */}
          <section id="features" className="min-h-screen flex flex-col items-center justify-center px-10 snap-start space-y-20 py-32">
             <div className="text-center space-y-4">
                <h3 className="text-5xl font-black italic tracking-tighter uppercase text-white underline decoration-blue-600 decoration-8 underline-offset-[12px]">Cloud_Infrastructure</h3>
                <p className="text-gray-600 font-bold uppercase tracking-[0.4em] text-xs">Decentralized Hardware Protocol</p>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl w-full">
                {[
                  { icon: HardDrive, title: 'DIRECT_HARDWARE', desc: 'Zenith maps directly to your physical drives. No virtual partitions, no overhead, just raw high-speed data blocks.' },
                  { icon: Shield, title: 'ARMORED_AUTH', desc: 'Every node requires a Master Key. Database protection protocols (WAL) ensure your data remains uncorrupted during failure.' },
                  { icon: Zap, title: 'NEON_PLAYBACK', desc: 'Stream 4K video instantly using our optimized hardware tunnels. No buffering, no caching, just direct delivery.' }
                ].map((f, i) => (
                  <div key={i} className="group p-12 bg-white/[0.01] border border-white/5 rounded-[4rem] space-y-8 hover:bg-white/[0.03] hover:border-blue-500/20 transition-all hover:-translate-y-2 shadow-2xl">
                     <div className="w-16 h-16 bg-blue-600/10 rounded-[1.5rem] flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                        <f.icon size={32} />
                     </div>
                     <div className="space-y-4">
                        <h4 className="text-white font-black text-xl tracking-tight uppercase italic">{f.title}</h4>
                        <p className="text-gray-500 font-medium leading-relaxed">{f.desc}</p>
                     </div>
                  </div>
                ))}
             </div>
          </section>
       </div>

       {/* Floating Watermark (Duplicate for extra visibility) */}
       <div className="absolute top-1/2 -right-32 -rotate-90 opacity-5 select-none pointer-events-none">
          <p className="text-[12rem] font-black uppercase tracking-tighter whitespace-nowrap">VADIK_GOEL_ARCHITECT</p>
       </div>
    </div>
  );
}
