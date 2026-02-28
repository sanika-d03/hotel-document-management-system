import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    // Updated Background: High-end Slate to Blue mesh
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-blue-100 relative overflow-hidden">
      
      {/* Visual Background Decor */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-blue-600/10 to-transparent pointer-events-none"></div>
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl"></div>

      {/* --- Original Navigation Structure --- */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 px-8 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-700 to-indigo-600 rounded-lg blur opacity-25"></div>
            <div className="relative bg-slate-900 px-3 py-1.5 rounded-lg text-white font-black text-xl tracking-tighter">
              HMS
            </div>
          </div>
          <div>
            <span className="font-black text-slate-800 text-xl tracking-tight block leading-none">Standard Stay</span>
            <span className="text-[9px] font-bold text-blue-600 uppercase tracking-[0.3em] mt-1 block">Internal Management</span>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="hidden md:flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
            <div className="text-right">
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">System Time</p>
              <p className="text-xs font-black text-slate-700">{currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}</p>
            </div>
          </div>
          
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center gap-2 px-6 py-2.5 text-xs font-black text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 border border-slate-200 hover:border-red-100 uppercase tracking-widest"
          >
            Logout →
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 py-16 relative z-10">
        
        {/* --- Original Hero Structure --- */}
        <header className="mb-16 border-l-4 border-blue-600 pl-8">
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter">
            Dashboard <span className="text-blue-600">Portal</span>
          </h1>
          <p className="text-slate-500 mt-3 max-w-2xl font-medium text-lg italic">
            "Welcome back. Select an operational module to begin your shift."
          </p>
        </header>

        {/* --- Original Feature Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <ModuleCard 
            onClick={() => navigate('/credentials')}
            icon={<path d="M3 21h18M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7M4 17v2h16v-2M4 7V4a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v3M7 17v2M17 17v2" />}
            title="Guest Check-In"
            desc="Complete the 15-credential registration form and securely upload guest documentation."
            color="blue"
            actionText="START BOOKING"
          />

          <ModuleCard 
            onClick={() => navigate('/userEditEntry')}
            icon={<path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />}
            title="Verify & Edit"
            desc="Fetch existing entries, perform data audits, and generate required Out Forms."
            color="emerald"
            actionText="MANAGE ENTRIES"
          />

          <ModuleCard 
            onClick={() => navigate('//finalDaySubmission')}
            icon={<path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />}
            title="Shift Settlement"
            desc="Finalize all current shift activities and clear the local verified cache."
            color="purple"
            actionText="SETTLE SHIFT"
          />

        </div>

        {/* --- Original Footer Status --- */}
        <footer className="mt-24 pt-8 border-t border-slate-200 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-10">
             <StatusBadge label="LOGIN TIME" value={currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} />
             <StatusBadge label="STATION ID" value="FRONT_DESK_01" />
          </div>
          <div className="flex items-center gap-3 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-[10px] font-black text-emerald-700 uppercase tracking-[0.2em]">System Online</span>
          </div>
        </footer>
      </main>
    </div>
  );
};

/* --- Original Sub-Components (Kept logic & names) --- */

const ModuleCard = ({ onClick, icon, title, desc, color, actionText }) => {
  const themes = {
    blue: "border-l-blue-600 text-blue-600 hover:bg-blue-50/30",
    emerald: "border-l-emerald-600 text-emerald-600 hover:bg-emerald-50/30",
    purple: "border-l-purple-600 text-purple-600 hover:bg-purple-50/30"
  };

  return (
    <div 
      onClick={onClick} 
      className={`group bg-white border border-slate-200 border-l-[6px] ${themes[color]} p-10 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 cursor-pointer relative overflow-hidden`}
    >
      <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-6 border border-slate-100 group-hover:scale-110 transition-transform duration-500">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
            {icon}
        </svg>
      </div>
      <h3 className="text-xl font-black text-slate-800 mb-3 tracking-tight uppercase">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed mb-10 font-medium">
        {desc}
      </p>
      <div className="flex items-center font-black text-[10px] tracking-[0.2em] transition-all duration-300">
        {actionText} <span className="ml-2 group-hover:translate-x-2 transition-transform">→</span>
      </div>
    </div>
  );
};

const StatusBadge = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">{label}</span>
    <span className="text-xs font-black text-slate-600 uppercase tracking-tighter">{value}</span>
  </div>
);

export default UserDashboard;