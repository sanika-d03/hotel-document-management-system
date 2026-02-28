import { collection, addDoc, serverTimestamp, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const UserCredentials = () => {
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    srNo: "", 
    // The first guest is the "Primary", subsequent ones are companions
    guests: [{ name: "", age: "", gender: "", regNo: "", email: "" }], 
    nationality: "",
    address: "",
    mobiles: [""],
    purpose: "",
    roomNo: "",
    persons: "",
    checkIn: "",
    stayDays: "",
    remarks: "",
    isArchived: false,
    status: "Checked In",
    isSettled: false
  });

  useEffect(() => {
    const fetchLastSrNo = async () => {
      try {
        const q = query(collection(db, "userCredentials"), orderBy("createdAt", "desc"), limit(1));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const lastData = querySnapshot.docs[0].data();
          const lastNumber = parseInt(lastData.srNo) || 0;
          setFormData(prev => ({ ...prev, srNo: (lastNumber + 1).toString() }));
        } else {
          setFormData(prev => ({ ...prev, srNo: "1" }));
        }
      } catch (error) {
        setFormData(prev => ({ ...prev, srNo: "1" })); 
      }
    };
    fetchLastSrNo();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGuestChange = (index, e) => {
    const newGuests = [...formData.guests];
    newGuests[index][e.target.name] = e.target.value;
    setFormData({ ...formData, guests: newGuests });
  };

  const addGuestField = () => {
    // New guests (companions) don't need regNo or email initialized
    setFormData({ 
      ...formData, 
      guests: [...formData.guests, { name: "", age: "", gender: "" }] 
    });
  };

  const handleMobileChange = (index, value) => {
    const newMobiles = [...formData.mobiles];
    newMobiles[index] = value;
    setFormData({ ...formData, mobiles: newMobiles });
  };

  const addMobileField = () => {
    setFormData({ ...formData, mobiles: [...formData.mobiles, ""] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const finalData = {
        ...formData,
        persons: formData.guests.length.toString(),
        createdAt: serverTimestamp(),
      };
      const docRef = await addDoc(collection(db, "userCredentials"), finalData);
      localStorage.setItem("currentUserId", docRef.id);
      alert("Registration Successful ✅");
      navigate("/upload-documents", { state: { userId: docRef.id } });
    } catch (error) {
      alert("Submission failed ❌");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 font-sans">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-gray-100 p-8">

        
        
        {/* Header */}
<div className="flex justify-between items-center mb-8">
    <div className="flex items-center gap-4">
        {/* ADD THIS EXIT BUTTON HERE */}
        <button 
          type="button" 
          onClick={() => navigate("/userdashboard")} 
          className="p-2 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-all shadow-sm"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div>
            <h2 className="text-2xl font-black text-slate-800 uppercase italic">Guest Registration</h2>
            <p className="text-slate-400 text-sm font-medium">Step {page} of 3</p>
        </div>
    </div>
    <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
        <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest text-center">Auto Sr No</p>
        <span className="text-blue-700 font-bold text-xl">#{formData.srNo}</span>
    </div>
</div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* PAGE 1: INDIVIDUAL GUEST DETAILS */}
          {page === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <label className="block text-xs font-black text-blue-600 uppercase italic mb-4 tracking-widest">1. Guest Identity & Contact</label>
              
              <div className="space-y-6">
                {formData.guests.map((guest, index) => (
                    <div key={index} className="p-5 bg-slate-50 border border-slate-200 rounded-3xl space-y-4 relative">
                        <div className="absolute -top-3 left-6 bg-white px-3 py-1 border border-slate-200 rounded-full text-[10px] font-black text-slate-400">
                            {index === 0 ? "PRIMARY GUEST" : `COMPANION ${index + 1}`}
                        </div>
                        
                        <div className="flex gap-3">
                            <input name="name" placeholder="Full Name" value={guest.name} onChange={(e) => handleGuestChange(index, e)} className="flex-[2] p-3 border rounded-xl outline-none bg-white font-bold uppercase focus:ring-2 focus:ring-blue-400" required />
                            <input name="age" type="number" placeholder="Age" value={guest.age} onChange={(e) => handleGuestChange(index, e)} className="flex-1 p-3 border rounded-xl outline-none bg-white font-bold focus:ring-2 focus:ring-blue-400" required />
                        </div>

                        <div className={`grid ${index === 0 ? "grid-cols-2" : "grid-cols-1"} gap-3`}>
                            <select name="gender" value={guest.gender} onChange={(e) => handleGuestChange(index, e)} className="p-3 border rounded-xl outline-none bg-white font-bold focus:ring-2 focus:ring-blue-400" required >
                                <option value="">Gender</option>
                                <option>Male</option>
                                <option>Female</option>
                                <option>Other</option>
                            </select>
                            
                            {/* Only show Reg No for the first person */}
                            {index === 0 && (
                              <input name="regNo" placeholder="ID / Reg No." value={guest.regNo} onChange={(e) => handleGuestChange(index, e)} className="p-3 border rounded-xl outline-none bg-white font-bold focus:ring-2 focus:ring-blue-400" required />
                            )}
                        </div>

                        {/* Only show Email for the first person */}
                        {index === 0 && (
                          <input name="email" type="email" placeholder="Email Address (Optional)" value={guest.email} onChange={(e) => handleGuestChange(index, e)} className="w-full p-3 border rounded-xl outline-none bg-white font-bold focus:ring-2 focus:ring-blue-400" />
                        )}
                    </div>
                ))}
              </div>
              
              <button type="button" onClick={addGuestField} className="w-full mt-6 py-4 border-2 border-dashed border-blue-200 text-blue-600 rounded-2xl font-black hover:bg-blue-50 transition-all uppercase text-xs tracking-widest">
                + Add Another Person
              </button>

              <div className="mt-8 pt-6 border-t border-slate-100">
                <label className="block text-xs font-black text-slate-500 uppercase mb-2 tracking-widest">Nationality</label>
                <input name="nationality" placeholder="e.g. Indian" onChange={handleChange} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none font-bold focus:border-blue-400" />
              </div>
            </div>
          )}

          {/* PAGE 2: CONTACT & LOCATION */}
          {page === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase mb-2 tracking-widest">Address</label>
                <input name="address" placeholder="Permanent Address" onChange={handleChange} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-blue-400" />
              </div>
              
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase mb-3 tracking-widest">Primary Contact Number(s)</label>
                {formData.mobiles.map((mobile, index) => (
                    <input key={index} placeholder={`Mobile Number ${index + 1}`} value={mobile} onChange={(e) => handleMobileChange(index, e.target.value)} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none mb-2 font-bold focus:border-blue-400" required />
                ))}
                <button type="button" onClick={addMobileField} className="text-blue-600 text-xs font-black uppercase tracking-widest">+ Add Alternative Number</button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase mb-2 tracking-widest">Room No.</label>
                  <input name="roomNo" placeholder="e.g. 101" onChange={handleChange} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none font-black text-blue-600 focus:border-blue-400" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase mb-2 tracking-widest">Purpose</label>
                  <input name="purpose" placeholder="Visit Purpose" onChange={handleChange} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-blue-400" />
                </div>
              </div>
            </div>
          )}

          {/* PAGE 3: SUMMARY */}
          {page === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                  <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Total Persons</label>
                  <p className="text-2xl font-black text-blue-800">{formData.guests.length}</p>
                </div>
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Stay (Days)</label>
                  <input name="stayDays" type="number" placeholder="Days" onChange={handleChange} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none font-bold" />
                </div>
              </div>
              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Check-In Time</label>
                <input name="checkIn" type="datetime-local" onChange={handleChange} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none font-bold" required />
              </div>
              <textarea name="remarks" placeholder="Special remarks..." onChange={handleChange} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl h-28 outline-none"></textarea>
            </div>
          )}

          <div className="flex gap-4 pt-6 border-t border-slate-100">
            {page > 1 && (
              <button type="button" onClick={() => setPage(page - 1)} className="flex-1 py-4 border-2 border-slate-200 rounded-xl font-black text-slate-500 hover:bg-slate-50 transition-all uppercase text-xs tracking-widest">Back</button>
            )}
            {page < 3 ? (
              <button type="button" onClick={() => setPage(page + 1)} className="flex-[2] py-4 bg-blue-600 text-white rounded-xl font-black shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all uppercase text-xs tracking-widest">Next Step</button>
            ) : (
              <button type="submit" className="flex-[2] py-4 bg-emerald-600 text-white rounded-xl font-black shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all uppercase text-xs tracking-widest">Complete Registration</button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserCredentials;