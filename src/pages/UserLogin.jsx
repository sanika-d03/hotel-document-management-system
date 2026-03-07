import React, { useState } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";

const UserLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await signOut(auth);
        setError("User not found in database.");
        return;
      }

      const userData = userSnap.data();
      if (userData.role !== "user") {
        await signOut(auth);
        setError("Access denied. Admin only.");
        return;
      }

      localStorage.setItem("employeeName", userData.name || "Staff Member");
      localStorage.setItem("employeeEmail", email);

      alert("Login Successful!");
      navigate("/userdashboard");

    } catch (err) {
      console.error(err);
      setError("Invalid email or password.");
    }
  };

  return (
    /* Changed: Added horizontal padding (px-4) so the card doesn't touch the screen edges on mobile */
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 sm:px-6">
      
      {/* Changed: 
          - Added w-full to ensure it uses available space.
          - Added sm:max-w-md to keep it centered and neat on larger screens.
          - Adjusted padding: p-6 for mobile, p-8 for larger screens. 
      */}
      <div className="w-full max-w-[100%] sm:max-w-md bg-white rounded-xl shadow-lg p-6 sm:p-8">
        
        {/* Changed: Text size scales slightly for better mobile viewing */}
        <h2 className="text-xl sm:text-2xl font-black text-center text-slate-800 mb-6 uppercase italic">
          Employee Login
        </h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase">Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              /* Changed: py-3 on mobile is good for "fat-finger" friendliness */
              className="w-full px-3 py-3 mt-1 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold text-base" 
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              className="w-full px-3 py-3 mt-1 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold text-base" 
            />
          </div>
          {error && <p className="text-red-600 text-xs text-center font-bold">{error}</p>}
          
          <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-xl font-black uppercase hover:bg-blue-600 active:scale-[0.98] transition-all shadow-lg text-sm sm:text-base">
            Enter Dashboard
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserLogin;