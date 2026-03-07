import { useNavigate } from "react-router-dom";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { useEffect } from "react";

const AdminDashboard = () => {
  const navigate = useNavigate();

  // Security Check: Redirect if not authenticated
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/admin/login");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Optional: Clear any admin-specific local storage
      localStorage.removeItem("adminToken"); 
      navigate("/admin/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100">
      {/* Top Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 md:px-8 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <span className="text-white font-black text-lg">A</span>
          </div>
          <h1 className="text-xl font-black uppercase tracking-tighter text-slate-800 hidden sm:block">
            Admin<span className="text-indigo-600">Central</span>
          </h1>
        </div>
        
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 md:px-6 py-2.5 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-600 border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all active:scale-95"
        >
          Exit System 🚪
        </button>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10 md:py-16">
        {/* Welcome Section */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-2">
            <span className="h-1 w-12 bg-indigo-600 rounded-full"></span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">Management Hub</span>
          </div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight italic uppercase">Main Headquarters</h2>
          <p className="text-slate-500 mt-2 font-medium max-w-xl leading-relaxed">
            Direct access to facility infrastructure, staff permissions, and master audit logs.
          </p>
        </div>

        {/* Action Cards Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

          {/* New Staff */}
          <AdminCard 
            title="Add Staff" 
            desc="Onboard new front-desk or management users." 
            icon="➕" 
            color="indigo"
            onClick={() => navigate("/admin/create-user")}
          />

          {/* User List */}
          <AdminCard 
            title="Staff List" 
            desc="Manage profiles, passwords, and permissions." 
            icon="👥" 
            color="blue"
            onClick={() => navigate("/admin/manage-users")}
          />

          {/* History / Records */}
          <AdminCard 
            title="All Records" 
            desc="Audit complete check-in history and docs." 
            icon="📜" 
            color="slate"
            onClick={() => navigate("/admin/view-data")}
          />

          {/* Work Reports */}
          <AdminCard 
            title="Work Reports" 
            desc="Analyze daily snapshots and shift activity." 
            icon="📊" 
            color="orange"
            onClick={() => navigate("/admin/work-reports")}
          />

        </div>

        {/* System Status Footer */}
        <div className="mt-24 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6 opacity-70">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-slate-800 rounded text-[9px] font-black text-white uppercase tracking-tighter">
              Admin Mode
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.15em]">
              Clearance: level-4-unrestricted
            </p>
          </div>
          
          <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-full border border-slate-200 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.15em]">
              Security Engine: Operational
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable Card Component for cleaner code
const AdminCard = ({ title, desc, icon, color, onClick }) => {
  const themes = {
    indigo: "hover:border-indigo-500 hover:shadow-indigo-100 group-hover:bg-indigo-600 bg-indigo-50",
    blue: "hover:border-blue-500 hover:shadow-blue-100 group-hover:bg-blue-600 bg-blue-50",
    slate: "hover:border-slate-800 hover:shadow-slate-200 group-hover:bg-slate-800 bg-slate-100",
    orange: "hover:border-orange-500 hover:shadow-orange-100 group-hover:bg-orange-600 bg-orange-50"
  };

  return (
    <div
      onClick={onClick}
      className={`group cursor-pointer bg-white border border-slate-200 rounded-[2.5rem] p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 ${themes[color].split(' ').slice(0,2).join(' ')}`}
    >
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 transition-colors ${themes[color].split(' ').slice(2).join(' ')}`}>
        <span className="text-3xl group-hover:scale-110 transition-transform">{icon}</span>
      </div>
      <h2 className="text-xl font-black mb-3 text-slate-800 uppercase tracking-tight">{title}</h2>
      <p className="text-slate-400 text-xs leading-relaxed font-bold uppercase tracking-wide opacity-80">
        {desc}
      </p>
    </div>
  );
};

export default AdminDashboard;