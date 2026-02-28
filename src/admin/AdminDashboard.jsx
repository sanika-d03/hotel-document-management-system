import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-700 rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-sm">A</span>
          </div>
          <h1 className="text-lg font-black uppercase tracking-tighter text-slate-800">
            Admin<span className="text-indigo-600">Central</span>
          </h1>
        </div>
        
        <button
          onClick={async () => {
            await signOut(auth);
            navigate("/admin/login");
          }}
          className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-600 border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all"
        >
          Exit System 🚪
        </button>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Main Headquarters</h2>
          <p className="text-slate-500 mt-2 font-medium">Overview of your facility's users, security, and activity logs.</p>
        </div>

        {/* Action Cards Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

          {/* New Staff */}
          <div
            onClick={() => navigate("/admin/create-user")}
            className="group cursor-pointer bg-white border border-slate-200 rounded-3xl p-8 hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-100 hover:-translate-y-2 transition-all duration-300"
          >
            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors">
              <span className="text-3xl group-hover:scale-110 transition-transform">➕</span>
            </div>
            <h2 className="text-xl font-bold mb-2 text-slate-800">Add Staff</h2>
            <p className="text-slate-400 text-sm leading-relaxed font-medium">
              Create new accounts for front-desk or management.
            </p>
          </div>

          {/* User List */}
          <div
            onClick={() => navigate("/admin/manage-users")}
            className="group cursor-pointer bg-white border border-slate-200 rounded-3xl p-8 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-100 hover:-translate-y-2 transition-all duration-300"
          >
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
              <span className="text-3xl group-hover:scale-110 transition-transform">👥</span>
            </div>
            <h2 className="text-xl font-bold mb-2 text-slate-800">Staff List</h2>
            <p className="text-slate-400 text-sm leading-relaxed font-medium">
              Edit profile details or change login permissions.
            </p>
          </div>

          {/* History / Records */}
          <div
            onClick={() => navigate("/admin/view-data")}
            className="group cursor-pointer bg-white border border-slate-200 rounded-3xl p-8 hover:border-slate-800 hover:shadow-2xl hover:shadow-slate-200 hover:-translate-y-2 transition-all duration-300"
          >
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-slate-800 transition-colors">
              <span className="text-3xl group-hover:scale-110 transition-transform text-slate-600 group-hover:text-white">📜</span>
            </div>
            <h2 className="text-xl font-bold mb-2 text-slate-800">All Records</h2>
            <p className="text-slate-400 text-sm leading-relaxed font-medium">
              View every check-in and document in the system.
            </p>
          </div>

          {/* Logs */}
          <div
            onClick={() => navigate("/admin/work-reports")}
            className="group cursor-pointer bg-white border border-slate-200 rounded-3xl p-8 hover:border-orange-500 hover:shadow-2xl hover:shadow-orange-100 hover:-translate-y-2 transition-all duration-300"
          >
            <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-orange-600 transition-colors">
              <span className="text-3xl group-hover:scale-110 transition-transform">📊</span>
            </div>
            <h2 className="text-xl font-bold mb-2 text-slate-800">Work Reports</h2>
            <p className="text-slate-400 text-sm leading-relaxed font-medium">
              Review daily performance and snapshot summaries.
            </p>
          </div>

        </div>

        {/* Footer Info */}
        <div className="mt-20 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-slate-800 rounded text-[10px] font-bold text-white uppercase tracking-tighter">
              Admin Mode
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
              Access level: Unrestricted
            </p>
          </div>
          
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
              Security Protocol: Active
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;