import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { uploadToCloudinary } from "../utils/cloudinaryUpload";
import { useNavigate } from "react-router-dom";

const FinalDaySubmission = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const now = new Date();
  const today = now.toISOString().split("T")[0]; 
  const currentTime = now.getHours().toString().padStart(2, '0') + ":" + 
                    now.getMinutes().toString().padStart(2, '0');

  const [formData, setFormData] = useState({
    name: localStorage.getItem("employeeName") || "", 
    date: today,      
    inTime: "",       
    outTime: currentTime, 
    registerPhoto: null,
  });

  useEffect(() => {
    const savedName = localStorage.getItem("employeeName");
    if (savedName && !formData.name) {
      setFormData(prev => ({ ...prev, name: savedName }));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.registerPhoto) {
      alert("Please select image");
      return;
    }

    try {
      setLoading(true);
      const file = formData.registerPhoto;
      const photoURL = await uploadToCloudinary(
  file,
  `shift-register/${formData.name}`
);

      await addDoc(collection(db, "employeeReports"), {
        name: formData.name,
        date: formData.date,
        inTime: formData.inTime,
        outTime: formData.outTime,
        photoURL,
        createdAt: serverTimestamp(),
      });

      alert("Shift Report Submitted Successfully!");
      navigate("/userdashboard"); 

    } catch (err) {
      console.error(err);
      alert("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 md:p-6 font-sans text-slate-900">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 w-full max-w-lg overflow-hidden">
        
        {/* Header - Fixed Alignment for Mobile */}
        <div className="bg-slate-800 p-5 md:p-6 flex items-center gap-4">
          <button 
            type="button" 
            onClick={() => navigate("/userdashboard")} 
            className="p-2.5 bg-slate-700 text-slate-300 rounded-xl hover:bg-slate-600 hover:text-white transition-all active:scale-90"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex-1">
            <h2 className="text-sm md:text-xl font-black text-white uppercase tracking-widest text-center mr-8">
              Shift End
            </h2>
            <p className="text-slate-400 text-[8px] md:text-[10px] text-center uppercase font-bold mt-1 mr-8">
              Official Attendance Log
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5">
          <div>
            <label className="block text-[10px] font-black text-blue-600 uppercase mb-1.5 ml-1 tracking-wider">
              Staff Name
            </label>
            <input
              type="text"
              readOnly
              className="w-full border-2 border-slate-100 p-3.5 rounded-xl outline-none font-black text-slate-400 bg-slate-50 cursor-not-allowed uppercase text-sm"
              value={formData.name}
            />
          </div>

          {/* Grid: Always 2 columns on tablet/desktop, 1 on mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-blue-600 uppercase mb-1.5 ml-1 tracking-wider">
                Date
              </label>
              <input
                type="date"
                required
                className="w-full border-2 border-slate-100 p-3.5 rounded-xl font-bold text-slate-700 bg-slate-50 text-sm"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-blue-600 uppercase mb-1.5 ml-1 tracking-wider">
                Shift In-Time
              </label>
              <input
                type="time"
                required
                className="w-full border-2 border-slate-100 p-3.5 rounded-xl font-bold text-slate-700 text-sm focus:border-blue-400 transition-colors"
                value={formData.inTime}
                onChange={(e) => setFormData({ ...formData, inTime: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-blue-600 uppercase mb-1.5 ml-1 tracking-wider">
              Shift Out-Time (Auto)
            </label>
            <input
              type="time"
              required
              className="w-full border-2 border-slate-100 p-3.5 rounded-xl font-bold text-slate-700 bg-slate-50 text-sm"
              value={formData.outTime}
              onChange={(e) => setFormData({ ...formData, outTime: e.target.value })}
            />
          </div>

          <div className="p-5 bg-blue-50/50 border-2 border-dashed border-blue-200 rounded-2xl group hover:bg-blue-50 transition-all">
            <label className="block text-[9px] md:text-[10px] font-black text-blue-600 uppercase mb-3 tracking-wider text-center">
              Upload Register Snapshot
            </label>
            <input
              type="file"
              accept="image/*"
              required
              className="w-full text-[10px] text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-blue-600 file:text-white hover:file:bg-black cursor-pointer transition-all"
              onChange={(e) =>
                setFormData({ ...formData, registerPhoto: e.target.files[0] })
              }
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl font-black uppercase text-[11px] tracking-[2px] transition-all shadow-lg ${
                loading 
                  ? "bg-slate-300 cursor-not-allowed scale-95" 
                  : "bg-blue-600 text-white hover:bg-black active:scale-95 shadow-blue-200"
              }`}
            >
              {loading ? "Processing..." : "Complete Shift Submission"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FinalDaySubmission;