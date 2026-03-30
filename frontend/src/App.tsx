import React, { useState, useEffect } from 'react';
import { 
  Folder, File, Image as ImageIcon, Video, Share2, Download, Trash2, ChevronRight, 
  Search, Upload, X, User, LogOut, Shield, Github, Plus
} from 'lucide-react';
import axios from 'axios';

// Component Imports
import ProfileView from './components/ProfileView';
import AdminDashboard from './components/AdminDashboard';
import AuthPage from './components/AuthPage';
import ShareDialog from './components/ShareDialog';
import PublicSharePage from './components/PublicSharePage';
import VideoPlayer from './components/VideoPlayer';
import LandingPage from './components/LandingPage';

const API_BASE = "http://localhost:8000/api";

interface FileInfo { name: string; path: string; is_dir: boolean; size: number; mime_type?: string; }
interface StorageRoot { id: number; name: string; path: string; }
interface UserProfile { id: number; username: string; handle: string; email: string; is_admin: boolean; storage_limit: number; pfp_url?: string; bio?: string; social_links?: string; }

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [config, setConfig] = useState({ app_name: 'Zenith', registration_enabled: true });
  const [view, setView] = useState<'landing' | 'explorer' | 'login' | 'register' | 'verify' | 'profile' | 'search'>('landing');
  const [path, setPath] = useState<string>("");
  const [items, setItems] = useState<FileInfo[]>([]);
  const [roots, setRoots] = useState<StorageRoot[]>([]);
  const [selectedItem, setSelectedItem] = useState<FileInfo | null>(null);
  const [previewItem, setPreviewItem] = useState<FileInfo | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(true);
  const [verifyEmail, setVerifyEmail] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);

  const handleLogout = () => { 
    localStorage.removeItem('token'); 
    setToken(null); 
    setUser(null); 
    setView('landing'); 
    window.location.reload(); // Hard reset for security
  };

  const fetchUser = () => {
    if (!token) return;
    axios.get(`${API_BASE}/auth/me`).then(res => { setUser(res.data); }).catch(() => handleLogout());
  };

  useEffect(() => {
    // Fetch Public Config
    axios.get(`${API_BASE}/config`).then(res => {
      if (res.data && res.data.app_name) setConfig(res.data);
    }).catch(() => {});
    
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axios.get(`${API_BASE}/auth/me`).then(res => { 
        setUser(res.data); 
        setView('explorer'); 
      }).catch(() => handleLogout()).finally(() => setLoading(false));
    } else {
      const isShare = window.location.pathname.startsWith('/share/');
      if (!isShare) setView('landing');
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (user && view === 'explorer') {
      axios.get(`${API_BASE}/storage-roots`).then(res => setRoots(res.data)).catch(() => {});
      axios.get(`${API_BASE}/files/list?path=${encodeURIComponent(path)}`).then(res => setItems(res.data)).catch(() => setItems([]));
    }
  }, [user, path, view]);

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    if(q.length > 1) {
      axios.get(`${API_BASE}/users/search?q=${q}`).then(res => { setSearchResults(res.data); setView('search'); });
    } else if(q.length === 0) { 
      if (user) setView('explorer');
      else setView('landing');
    }
  };

  if (loading) return <div className="h-screen bg-black flex items-center justify-center text-blue-500 font-mono animate-pulse uppercase tracking-widest text-xs">ESTABLISHING_LINK...</div>;

  const shareId = window.location.pathname.startsWith('/share/') ? window.location.pathname.split('/')[2] : null;
  if (shareId) return <PublicSharePage shareId={shareId} />;

  if (view === 'landing' && !user) return <LandingPage appName={config.app_name} onEnter={() => setView('login')} />;

  if (view === 'login' && !user) return <AuthPage type="login" onSubmit={async (e:any)=>{
    e.preventDefault();
    const fd = new FormData(); fd.append('username', e.target.username.value); fd.append('password', e.target.password.value);
    try { const res = await axios.post(`${API_BASE}/auth/login`, fd); localStorage.setItem('token', res.data.access_token); setToken(res.data.access_token); }
    catch(e) { alert("Login Failed"); }
  }} setView={setView} />;

  if (view === 'register') return <AuthPage type="register" onSubmit={async (e:any)=>{
    e.preventDefault();
    const data = { username: e.target.username.value, email: e.target.email.value, password: e.target.password.value };
    try { await axios.post(`${API_BASE}/auth/register`, data); setVerifyEmail(data.email); setView('verify'); }
    catch(e:any) { alert(e.response?.data?.detail || "Registration Error"); }
  }} setView={setView} />;

  if (view === 'verify') return <AuthPage type="verify" onSubmit={async (e:any)=>{
    e.preventDefault();
    try { await axios.post(`${API_BASE}/auth/verify`, { email: verifyEmail, code: e.target.code.value }); alert("Verified!"); setView('login'); }
    catch(e) { alert("Invalid OTP"); }
  }} setView={setView} email={verifyEmail} />;

  return (
    <div className="flex h-screen bg-[#020202] text-gray-300 font-sans selection:bg-blue-500/30 overflow-hidden relative">
      {/* Sidebar */}
      <div className="w-64 bg-[#080808] border-r border-white/5 flex flex-col shrink-0 shadow-2xl">
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white font-black shadow-xl shadow-blue-500/20">{config.app_name ? config.app_name[0] : 'Z'}</div>
          <span className="font-black text-xl tracking-tighter text-white uppercase italic">{config.app_name || 'Zenith'}</span>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto scrollbar-hide">
          <button onClick={() => {setPath(""); setView('explorer'); setSelectedProfile(null);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${view === 'explorer' && !selectedProfile ? 'bg-white/5 text-white font-bold' : 'hover:bg-white/[0.02] text-gray-500'}`}>
            <Folder size={18} /> My Files
          </button>
          <div className="py-4">
             <p className="px-4 text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3">Nodes</p>
             {roots.map(root => (
               <button key={root.id} onClick={() => {setPath(root.name); setView('explorer'); setSelectedProfile(null);}} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all ${path.startsWith(root.name) ? 'text-blue-400 font-bold bg-blue-500/5 shadow-inner' : 'text-gray-500 hover:text-gray-300'}`}>
                 <div className={`w-1 h-1 rounded-full ${path.startsWith(root.name) ? 'bg-blue-500 shadow-[0_0_8px_#3b82f6]' : 'bg-gray-700'}`}></div> {root.name}
               </button>
             ))}
          </div>
        </nav>

        <div className="p-4 border-t border-white/5 space-y-1 bg-[#050505]">
          <button onClick={() => {setView('profile'); setSelectedProfile(null);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${view === 'profile' && !selectedProfile ? 'bg-white/10 text-white font-bold' : 'hover:bg-white/5 text-gray-400'}`}>
            <User size={18} /> Profile
          </button>
          {user?.is_admin && (
            <button onClick={() => setShowSettings(true)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-400 hover:bg-white/5 transition-all">
              <Shield size={18} /> Console
            </button>
          )}
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-500/60 hover:bg-red-500/5 transition-all">
            <LogOut size={18} /> Shutdown
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-10 bg-[#080808]/80 backdrop-blur-3xl shrink-0 z-10">
          <div className="flex items-center gap-4 flex-1">
            <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl px-5 py-2.5 w-full max-w-md focus-within:border-blue-500/40 transition-all group shadow-inner">
              <Search size={20} className="text-gray-600 group-focus-within:text-blue-500" />
              <input type="text" value={searchQuery} onChange={e=>handleSearch(e.target.value)} placeholder="Search network nodes..." className="bg-transparent border-none outline-none ml-4 w-full text-sm text-white" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={async () => {
                if (!path) return;
                const name = prompt("Folder Name:");
                if (name) {
                  const fd = new FormData();
                  fd.append('path', path);
                  fd.append('name', name);
                  await axios.post(`${API_BASE}/files/mkdir`, fd);
                  axios.get(`${API_BASE}/files/list?path=${encodeURIComponent(path)}`).then(res => setItems(res.data));
                }
              }}
              disabled={!path}
              className={`px-6 py-2.5 rounded-2xl text-sm font-black flex items-center gap-3 transition-all ${!path ? 'bg-white/5 text-gray-600 cursor-not-allowed' : 'bg-white/10 hover:bg-white/20 text-white shadow-xl'}`}
            >
              <Plus size={20} /> NEW_FOLDER
            </button>
            <label className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-2xl text-sm font-black flex items-center gap-3 cursor-pointer shadow-xl active:scale-95 transition-all">
              <Upload size={20} /> UPLOAD
              <input type="file" className="hidden" onChange={async (e)=>{
                if(!e.target.files?.length || !path) return;
                const fd = new FormData(); fd.append('file', e.target.files[0]);
                await axios.post(`${API_BASE}/files/upload?path=${encodeURIComponent(path)}`, fd);
                axios.get(`${API_BASE}/files/list?path=${encodeURIComponent(path)}`).then(res => setItems(res.data));
              }} />
            </label>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-[#020202]">
          {view === 'explorer' && (
            <>
              <div className="px-10 py-4 border-b border-white/5 flex items-center gap-3 text-[10px] font-black text-gray-600 uppercase tracking-widest bg-[#050505]/50">
                <button onClick={() => setPath("")} className="hover:text-blue-500 transition-all">DRIVE_ROOT</button>
                {path.split('/').filter(Boolean).map((part, i, arr) => (
                  <React.Fragment key={i}>
                    <ChevronRight size={12} className="text-gray-800" />
                    <button onClick={() => setPath(arr.slice(0, i + 1).join('/'))} className={i === arr.length - 1 ? 'text-blue-500 underline underline-offset-4' : 'hover:text-white transition-all'}>{part}</button>
                  </React.Fragment>
                ))}
              </div>
              <main className="p-10">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-32 text-gray-600 space-y-4">
                    <Folder size={64} className="opacity-20" />
                    <p className="font-mono text-[10px] uppercase tracking-[0.4em]">Node_Empty // No_Files_Detected</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-8">
                    {items.map(item => (
                      <div key={item.path} onClick={() => item.is_dir ? setPath(item.path) : setPreviewItem(item)} className="group p-6 rounded-[2.5rem] bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] hover:border-blue-500/30 transition-all cursor-pointer relative text-center shadow-xl">
                        <div className="w-20 h-20 flex items-center justify-center bg-white/[0.02] rounded-[2.5rem] mx-auto mb-4 group-hover:scale-110 transition-transform shadow-inner border border-white/5">
                          {item.is_dir ? <Folder size={40} className="text-blue-500 fill-blue-500/10" /> : (item.mime_type?.startsWith('image/') ? <ImageIcon size={40} className="text-purple-500" /> : (item.mime_type?.startsWith('video/') ? <Video size={40} className="text-red-500" /> : <File size={40} className="text-gray-600" />))}
                        </div>
                        <p className="text-[11px] font-black truncate w-full px-2 dark:text-gray-400 group-hover:text-white transition-colors uppercase tracking-tight">{item.name}</p>
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 flex gap-2 transition-all scale-90 group-hover:scale-100">
                           {!item.is_dir && <button onClick={(e) => {e.stopPropagation(); setSelectedItem(item); setShowShareModal(true)}} className="p-2 bg-black border border-white/10 rounded-xl hover:text-blue-400 shadow-2xl backdrop-blur-md"><Share2 size={14}/></button>}
                          <button onClick={(e) => {e.stopPropagation(); axios.delete(`${API_BASE}/files/delete?path=${encodeURIComponent(item.path)}`).then(() => axios.get(`${API_BASE}/files/list?path=${encodeURIComponent(path)}`).then(res => setItems(res.data)))}} className="p-2 bg-black border border-white/10 rounded-xl hover:text-red-500 shadow-2xl backdrop-blur-md"><Trash2 size={14}/></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </main>
            </>
          )}

          {view === 'search' && (
            <main className="p-16 max-w-4xl mx-auto space-y-10 animate-in fade-in">
               <h2 className="text-3xl font-black italic uppercase tracking-tighter text-gray-500 underline decoration-blue-600 decoration-4 underline-offset-8">Network Directory</h2>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {searchResults.map(u => (
                    <div key={u.id} onClick={() => {setSelectedProfile(u); setView('profile')}} className="p-6 bg-white/[0.02] border border-white/5 rounded-[2.5rem] flex items-center gap-6 cursor-pointer hover:bg-white/[0.05] transition-all hover:scale-[1.02] shadow-2xl">
                       <div className="w-16 h-16 rounded-2xl bg-black border border-white/10 overflow-hidden shrink-0 shadow-inner">
                          {u.pfp_url ? <img src={`http://localhost:8000${u.pfp_url}`} className="w-full h-full object-cover" /> : <User className="m-auto mt-4 text-gray-800" size={32}/>}
                       </div>
                       <div className="min-w-0">
                          <p className="font-black text-xl text-white tracking-tight truncate uppercase italic">{u.username}</p>
                          <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">@{u.handle || 'Guest'}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </main>
          )}

          {view === 'profile' && (
            <ProfileView user={selectedProfile || user!} isOwn={!selectedProfile} onUpdate={fetchUser} />
          )}
        </div>

        {/* Admin Dashboard Overlay */}
        {showSettings && <AdminDashboard onClose={() => setShowSettings(false)} />}
        
        {showShareModal && selectedItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-3xl p-6 transition-all duration-500" onClick={() => setShowShareModal(false)}>
            <ShareDialog item={selectedItem} onClose={() => setShowShareModal(false)} />
          </div>
        )}

        {previewItem && (
          <div className="fixed inset-0 z-[110] flex flex-col bg-black animate-in fade-in duration-500">
            <div className="h-20 flex items-center justify-between px-10 border-b border-white/5 bg-[#080808]">
              <div className="flex items-center gap-4">
                <File className="text-blue-500" size={24}/>
                <span className="font-black text-white uppercase tracking-tighter text-lg">{previewItem.name}</span>
              </div>
              <button onClick={() => setPreviewItem(null)} className="p-3 hover:bg-white/5 rounded-full text-white transition-all"><X size={32}/></button>
            </div>
            <div className="flex-1 flex items-center justify-center p-12 overflow-hidden bg-[#020202]">
              {previewItem.mime_type?.startsWith('image/') ? (
                <img src={`http://localhost:8000/api/files/download?path=${encodeURIComponent(previewItem.path)}&token=${token}`} className="max-w-full max-h-full object-contain rounded-[3rem] shadow-[0_0_150px_rgba(59,130,246,0.1)] border border-white/10" />
              ) : previewItem.mime_type?.startsWith('video/') ? (
                <VideoPlayer 
                  src={`http://localhost:8000/api/media/stream?path=${encodeURIComponent(previewItem.path)}&token=${token}`} 
                  downloadUrl={`http://localhost:8000/api/files/download?path=${encodeURIComponent(previewItem.path)}&token=${token}`}
                  title={previewItem.name} 
                />
              ) : (
                <button 
                  onClick={() => window.open(`http://localhost:8000/api/files/download?path=${encodeURIComponent(previewItem.path)}&token=${token}`)} 
                  className="px-12 py-5 bg-white text-black font-black rounded-[2.5rem] uppercase tracking-widest shadow-2xl hover:bg-blue-600 hover:text-white transition-all scale-110"
                >
                  Download Encrypted Block
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Persistent Developer Watermark */}
      <footer className="absolute bottom-6 right-10 z-[300] flex items-center gap-4 pointer-events-auto">
         <div className="text-right">
            <p className="text-[8px] font-black text-gray-700 uppercase tracking-[0.4em]">Node Architect</p>
            <p className="text-xs font-black text-white/40 hover:text-blue-500 transition-colors cursor-default uppercase italic tracking-tighter">Vadik Goel</p>
         </div>
         <a href="https://github.com/vadikgoel" target="_blank" rel="noreferrer" className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-gray-500 hover:text-white hover:bg-blue-600 hover:border-blue-500 transition-all shadow-xl">
            <Github size={18} />
         </a>
      </footer>
    </div>
  );
}
