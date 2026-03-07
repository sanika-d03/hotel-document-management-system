import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const WorkReport = () => {
  const [reports, setReports] = useState([]);
  const navigate = useNavigate();

  const fetchReports = async () => {
    try {
      const q = query(collection(db, "employeeReports"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setReports(data);
    } catch (error) {
      console.error("Error fetching reports: ", error);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this report?")) {
      await deleteDoc(doc(db, "employeeReports", id));
      fetchReports();
    }
  };

  const formatTo12Hour = (timeStr) => {
    if (!timeStr) return "N/A";
    if (timeStr.toDate) {
      return timeStr.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    }
    if (typeof timeStr === "string" && timeStr.includes(":")) {
      let [hours, minutes] = timeStr.split(":");
      hours = parseInt(hours);
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;
      return `${hours}:${minutes} ${ampm}`;
    }
    return timeStr;
  };

  return (
    <div className="p-3 md:p-6 bg-gray-50 min-h-screen font-sans">
      {/* Header Section - Responsive Flex */}
      <div className="mb-4 md:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 md:p-5 border border-gray-300 rounded shadow-sm gap-4">
        <div className="flex items-center gap-3 md:gap-4">
          {/* BACK BUTTON */}
          <button 
            onClick={() => navigate("/admin/dashboard")}
            className="flex items-center justify-center w-8 h-8 bg-slate-800 text-white rounded hover:bg-slate-700 transition-colors shrink-0"
            title="Back to Dashboard"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div>
            <h1 className="text-lg md:text-xl font-black text-slate-800 uppercase tracking-tight border-l-4 border-blue-600 pl-3">
              Submission Logs
            </h1>
            <p className="text-[9px] md:text-xs text-gray-500 font-bold uppercase mt-1 ml-0 md:ml-4">Daily Attendance & Proofs</p>
          </div>
        </div>
        
        <div className="sm:text-right w-full sm:w-auto">
          <span className="bg-blue-100 text-blue-700 text-[9px] md:text-[10px] font-black px-3 py-1 rounded-full uppercase inline-block">
            Admin Access
          </span>
        </div>
      </div>

      {/* Table Container - Overflow handling */}
      <div className="bg-white border border-gray-400 shadow-lg overflow-hidden rounded-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] md:text-xs border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-800 text-white uppercase tracking-wider">
                <th className="px-3 md:px-4 py-3 border border-slate-700 text-left">Staff Name</th>
                <th className="px-3 md:px-4 py-3 border border-slate-700 text-center">Date</th>
                <th className="px-4 py-3 border border-slate-700 text-center">Shift In</th>
                <th className="px-4 py-3 border border-slate-700 text-center">Shift Out</th>
                <th className="px-4 py-3 border border-slate-700 text-center">Register Proof</th>
                <th className="px-4 py-3 border border-slate-700 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id} className="border-b border-gray-300 hover:bg-blue-50 transition-colors">
                  <td className="px-3 md:px-4 py-3 border border-gray-300 font-bold text-slate-700 uppercase truncate max-w-[120px] md:max-w-none">
                    {r.name || "N/A"}
                  </td>
                  <td className="px-3 md:px-4 py-3 border border-gray-300 text-center font-medium whitespace-nowrap">
                    {r.date}
                  </td>
                  <td className="px-3 md:px-4 py-3 border border-gray-300 text-center">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded font-bold whitespace-nowrap">
                      {formatTo12Hour(r.inTime)}
                    </span>
                  </td>
                  <td className="px-3 md:px-4 py-3 border border-gray-300 text-center">
                    <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded font-bold whitespace-nowrap">
                      {formatTo12Hour(r.outTime)}
                    </span>
                  </td>
                  <td className="px-3 md:px-4 py-3 border border-gray-300 text-center">
                    {r.photoURL ? (
                      <a
                        href={r.photoURL}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-2.5 md:px-3 py-1.5 rounded-[4px] text-[9px] md:text-[10px] font-black uppercase transition-all inline-block shadow-sm whitespace-nowrap"
                      >
                        View Photo
                      </a>
                    ) : (
                      <span className="text-gray-400 italic text-[9px] md:text-[10px]">No Photo</span>
                    )}
                  </td>
                  <td className="px-3 md:px-4 py-3 border border-gray-300 text-center">
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="p-1.5 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white rounded transition-all group shrink-0"
                      title="Delete Entry"
                    >
                      <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {reports.length === 0 && (
          <div className="p-10 md:p-20 text-center">
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs md:text-sm">No Reports Found</p>
          </div>
        )}
      </div>

      {/* Mobile Hint */}
      <p className="mt-4 text-[10px] text-gray-400 text-center md:hidden italic">
        Swipe left to view full report details.
      </p>
    </div>
  );
};

export default WorkReport;