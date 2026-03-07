import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore"; // Added serverTimestamp
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";

const CreateUser = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [empId, setEmpId] = useState("");
  const [loading, setLoading] = useState(false); // ✅ Added loading state
  const navigate = useNavigate();

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading

    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // ✅ Using serverTimestamp() is better for consistent data
      await setDoc(doc(db, "users", userCred.user.uid), {
        name: fullName,
        email: email,
        mobile: mobile,
        employeeId: empId,
        role: "user",
        status: "active",
        createdAt: serverTimestamp() 
      });

      alert(`Employee ${fullName} created successfully ✅`);
      navigate("/admin/dashboard");
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    // Added p-4 for mobile breathing room
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-slate-50 font-sans">
      
      {/* Container: Changed to max-w-lg for better desktop feel, w-full for mobile */}
      <div className="w-full max-w-md md:max-w-lg bg-white rounded-3xl shadow-2xl p-6 md:p-10 border border-slate-100">

        <button
          onClick={() => navigate("/admin/dashboard")}
          className="group text-[11px] text-blue-600 font-black mb-6 hover:text-black flex items-center uppercase tracking-widest transition-colors"
        >
          <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span> Back to Dashboard
        </button>

        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-black text-slate-800 text-center tracking-tight uppercase italic">
            Create Employee
          </h2>
          <div className="h-1 w-12 bg-blue-600 mx-auto mt-2 rounded-full"></div>
        </div>

        <form onSubmit={handleCreateUser} className="space-y-5">
          
          {/* Full Name */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 mb-1.5 ml-1 uppercase tracking-[0.15em]">
              Full Name
            </label>
            <input
              type="text"
              placeholder="Ex: John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl focus:outline-none focus:border-blue-500 font-bold text-slate-700 bg-slate-50/50 transition-all placeholder:text-slate-300"
            />
          </div>

          {/* Employee ID & Mobile Number (Responsive Grid) */}
          {/* sm:grid-cols-2 ensures they stay side-by-side on most phones, stacks only on very small screens */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 mb-1.5 ml-1 uppercase tracking-[0.15em]">
                Employee ID
              </label>
              <input
                type="text"
                placeholder="EMP-001"
                value={empId}
                onChange={(e) => setEmpId(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl focus:outline-none focus:border-blue-500 font-bold text-slate-700 bg-slate-50/50 transition-all placeholder:text-slate-300"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 mb-1.5 ml-1 uppercase tracking-[0.15em]">
                Mobile No
              </label>
              <input
                type="tel"
                placeholder="10-digit number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                required
                pattern="[0-9]{10}"
                maxLength="10"
                className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl focus:outline-none focus:border-blue-500 font-bold text-slate-700 bg-slate-50/50 transition-all placeholder:text-slate-300"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 mb-1.5 ml-1 uppercase tracking-[0.15em]">
              Official Email
            </label>
            <input
              type="email"
              placeholder="name@hotel.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl focus:outline-none focus:border-blue-500 font-bold text-slate-700 bg-slate-50/50 transition-all placeholder:text-slate-300"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 mb-1.5 ml-1 uppercase tracking-[0.15em]">
              Access Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength="6"
              className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl focus:outline-none focus:border-blue-500 font-bold text-slate-700 bg-slate-50/50 transition-all placeholder:text-slate-300"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all shadow-lg active:scale-95 mt-4 ${
              loading 
                ? "bg-slate-200 text-slate-400 cursor-not-allowed" 
                : "bg-blue-600 text-white hover:bg-black shadow-blue-100"
            }`}
          >
            {loading ? "Registering..." : "Complete Registration"}
          </button>
        </form>

        <div className="mt-10 pt-6 border-t border-slate-50">
          <p className="text-[9px] text-slate-400 text-center uppercase font-black tracking-widest leading-relaxed">
            Data security active. New users are set to <span className="text-emerald-500 italic">"Active Status"</span> by default.
          </p>
        </div>

      </div>
    </div>
  );
};

export default CreateUser;