import { useState, useEffect } from "react";
import { collection, query, where, getDocs, doc, updateDoc, getDoc, setDoc, deleteField } from "firebase/firestore";
import { db } from "../firebase";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

const UserEditEntry = () => {
  const [entries, setEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const navigate = useNavigate();
  const currentStaff = localStorage.getItem("employeeName") || "Staff";

  // 1. FETCH CREDENTIALS + DOCUMENTS
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "userCredentials"), where("isArchived", "==", false));
      const credSnapshot = await getDocs(q);
      
      const mergedData = await Promise.all(credSnapshot.docs.map(async (cDoc) => {
        const creds = cDoc.data();
        const docRef = doc(db, "userDocuments", cDoc.id);
        const docSnap = await getDoc(docRef);
        
        return {
          id: cDoc.id,
          ...creds,
          documentList: docSnap.exists() ? docSnap.data().documents : {}
        };
      }));

      setEntries(mergedData);
      if (mergedData.length > 0 && !selectedEntry) setSelectedEntry(mergedData[0]);
    } catch (error) { console.error("Fetch error:", error); }
    setLoading(false);
  };

  useEffect(() => { fetchAllData(); }, []);

  // 2. DOCUMENT HANDLERS
  const handleNewDocUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedEntry) return;

    const docType = prompt("Enter Document Type (e.g., Aadhaar, PAN, License):")?.toLowerCase();
    if (!docType) return;
    const docNum = prompt("Enter Document Number:");

    try {
      setUploadingDoc(true);
      const fileExt = file.name.split(".").pop();
      const fileName = `${docType}_${Date.now()}.${fileExt}`;
      const filePath = `${selectedEntry.id}/${fileName}`;

      const { error } = await supabase.storage.from("hotel-documents").upload(filePath, file);
      if (error) throw error;

      const { data } = supabase.storage.from("hotel-documents").getPublicUrl(filePath);
      
      const newDocData = {
        documentNumber: docNum,
        filePath,
        fileUrl: data.publicUrl,
        fileName,
        uploadedAt: new Date()
      };

      const docRef = doc(db, "userDocuments", selectedEntry.id);
      await setDoc(docRef, { documents: { [docType]: newDocData } }, { merge: true });

      setSelectedEntry({
        ...selectedEntry,
        documentList: { ...selectedEntry.documentList, [docType]: newDocData }
      });
      alert("Document Added Successfully! ✅");
    } catch (err) { alert("Upload failed: " + err.message); }
    finally { setUploadingDoc(false); }
  };

  const removeDoc = async (type) => {
    if (!window.confirm(`Permanently remove ${type}?`)) return;
    try {
      const docRef = doc(db, "userDocuments", selectedEntry.id);
      await updateDoc(docRef, { [`documents.${type}`]: deleteField() });
      
      const updatedDocs = { ...selectedEntry.documentList };
      delete updatedDocs[type];
      setSelectedEntry({ ...selectedEntry, documentList: updatedDocs });
    } catch (err) { alert("Delete failed"); }
  };

  // 3. UPDATE HANDLERS
  const handleSaveAll = async () => {
    try {
      const { documentList, ...credsToSave } = selectedEntry; 
      const docRef = doc(db, "userCredentials", selectedEntry.id);
      await updateDoc(docRef, credsToSave);
      alert("Profile and Credentials Updated! ✅");
      fetchAllData();
    } catch (err) { alert("Update failed ❌"); }
  };

  const handleFinalCheckout = async () => {
    if (!selectedEntry) return;
    if (!window.confirm(`Finalize Checkout for ${selectedEntry.guests[0]?.name}?`)) return;
    
    const outTs = new Date().toLocaleString(); 
    
    try {
      await updateDoc(doc(db, "userCredentials", selectedEntry.id), {
        checkOut: outTs, 
        status: "Checked Out", 
        isSettled: true, 
        isArchived: true, 
        submittedBy: currentStaff, 
        finalizedAt: outTs, 
        loggingDate: new Date().toLocaleDateString('en-GB')
      });
      alert(`Record Settled and Archived! ✅`);
      setSelectedEntry(null);
      fetchAllData();
    } catch (err) { alert("Submission failed ❌"); }
  };

  if (loading) return <div className="p-10 text-center font-bold animate-pulse text-blue-600">SYNCING MASTER DATABASE...</div>;

  return (
    <div className="flex h-screen bg-slate-100 font-sans overflow-hidden">
      
      {/* SIDEBAR: GUEST LIST */}
      <div className="w-1/4 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b bg-slate-50 flex justify-between items-center">
            <button 
              onClick={() => navigate("/userdashboard")}
              className="p-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="font-black text-slate-800 uppercase italic text-sm">Active Queue</h1>
            <span className="bg-blue-600 text-white text-[10px] px-2 py-1 rounded-full">{entries.length}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {entries.map((item) => (
            <div key={item.id} onClick={() => setSelectedEntry(item)} 
              className={`p-4 rounded-2xl cursor-pointer border-2 transition-all ${selectedEntry?.id === item.id ? "border-blue-500 bg-blue-50 shadow-md" : "border-transparent bg-slate-50 hover:bg-slate-100"}`}>
              <div className="flex justify-between items-start mb-1">
                <p className="text-[10px] font-black text-blue-500 uppercase">Room {item.roomNo || "N/A"}</p>
                <p className="text-[10px] font-bold text-slate-400">#{item.srNo}</p>
              </div>
              <h3 className="font-bold text-slate-800 uppercase truncate">{item.guests[0]?.name}</h3>
            </div>
          ))}
        </div>
      </div>

      {/* WORKSPACE: MASTER EDIT FORM */}
      <div className="flex-1 overflow-y-auto p-10 bg-slate-50">
        {selectedEntry ? (
          <div className="max-w-4xl mx-auto space-y-8 pb-20">
            
            {/* ACTION HEADER */}
            <div className="flex justify-between items-end border-b-2 border-slate-200 pb-6">
                <div>
                    <p className="text-xs font-black text-blue-600 uppercase tracking-tighter mb-1">Master Management</p>
                    <h2 className="text-4xl font-black text-slate-800 uppercase italic">Edit Profile</h2>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleSaveAll} className="bg-slate-800 text-white px-8 py-3 rounded-xl font-black uppercase text-xs hover:bg-black transition-all shadow-lg">Save All Edits</button>
                    <button onClick={handleFinalCheckout} className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-black uppercase text-xs hover:bg-emerald-700 transition-all shadow-lg">Checkout & Archive</button>
                </div>
            </div>

            {/* SECTION 1: DYNAMIC GUEST LIST */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6">
              <label className="text-xs font-black text-blue-600 uppercase italic tracking-widest">1. Occupant Information</label>
              {selectedEntry.guests.map((g, i) => (
                <div key={i} className={`p-6 rounded-3xl border space-y-4 relative ${i === 0 ? 'bg-blue-50/50 border-blue-100' : 'bg-slate-50 border-slate-200'}`}>
                  <span className={`absolute -top-3 left-6 border px-3 py-1 rounded-full text-[10px] font-black ${i === 0 ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200 text-slate-400'}`}>
                    {i === 0 ? "PRIMARY OCCUPANT" : `GUEST ${i+1}`}
                  </span>
                  
                  <div className={`grid ${i === 0 ? "grid-cols-4" : "grid-cols-3"} gap-3`}>
                    <div className="col-span-2">
                        <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Full Name</label>
                        <input className="w-full p-3 rounded-xl border-none shadow-sm font-bold uppercase outline-none focus:ring-2 focus:ring-blue-400" value={g.name} onChange={(e) => {
                            const up = [...selectedEntry.guests]; up[i].name = e.target.value; setSelectedEntry({...selectedEntry, guests: up});
                        }} />
                    </div>
                    <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Age</label>
                        <input className="w-full p-3 rounded-xl border-none shadow-sm font-bold text-center outline-none focus:ring-2 focus:ring-blue-400" type="number" value={g.age} onChange={(e) => {
                            const up = [...selectedEntry.guests]; up[i].age = e.target.value; setSelectedEntry({...selectedEntry, guests: up});
                        }} />
                    </div>

                    {/* FIXED REG NO LOGIC: READS FROM guests[0].regNo */}
                    {i === 0 && (
                      <div>
                        <label className="text-[9px] font-black text-blue-600 uppercase ml-1">Master ID / Reg No</label>
                        <input 
                          className="w-full p-3 rounded-xl border-2 border-blue-200 bg-blue-50 font-black uppercase outline-none focus:ring-2 focus:ring-blue-400 text-blue-700" 
                          value={selectedEntry.guests[0]?.regNo || ""} 
                          onChange={(e) => {
                            const up = [...selectedEntry.guests]; 
                            up[0].regNo = e.target.value; 
                            setSelectedEntry({...selectedEntry, guests: up});
                          }} 
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Email Address (Optional)</label>
                    <input className="w-full p-3 rounded-xl border-none shadow-sm font-bold outline-none focus:ring-2 focus:ring-blue-400" type="email" placeholder="guest@example.com" value={g.email || ""} onChange={(e) => {
                        const up = [...selectedEntry.guests]; up[i].email = e.target.value; setSelectedEntry({...selectedEntry, guests: up});
                    }} />
                  </div>
                </div>
              ))}
            </div>

            {/* SECTION 2: STAY & CONTACT DETAILS */}
            <div className="grid grid-cols-3 gap-6">
               <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <label className="text-[10px] font-black text-slate-400 uppercase italic">Room Number</label>
                  <input className="w-full mt-2 font-black text-2xl text-blue-600 outline-none" value={selectedEntry.roomNo} onChange={(e) => setSelectedEntry({...selectedEntry, roomNo: e.target.value})} />
               </div>
               <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <label className="text-[10px] font-black text-slate-400 uppercase italic">Primary Phone</label>
                  <input className="w-full mt-2 font-black text-2xl text-slate-700 outline-none" value={selectedEntry.mobiles[0]} onChange={(e) => {
                    const m = [...selectedEntry.mobiles]; m[0] = e.target.value; setSelectedEntry({...selectedEntry, mobiles: m});
                  }} />
               </div>
               <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <label className="text-[10px] font-black text-slate-400 uppercase italic">Nationality</label>
                  <input className="w-full mt-2 font-black text-2xl text-slate-700 outline-none uppercase" value={selectedEntry.nationality} onChange={(e) => setSelectedEntry({...selectedEntry, nationality: e.target.value})} />
               </div>
            </div>

            {/* SECTION 3: DOCUMENTS */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6">
              <div className="flex justify-between items-center border-b pb-4">
                <label className="text-xs font-black text-blue-600 uppercase italic tracking-widest">2. Verified Documents</label>
                <label className="cursor-pointer bg-blue-600 text-white px-5 py-2 rounded-xl font-bold text-[10px] uppercase hover:bg-blue-700 shadow-md transition-all">
                   {uploadingDoc ? "Uploading..." : "+ Add New Doc"}
                   <input type="file" className="hidden" onChange={handleNewDocUpload} disabled={uploadingDoc} />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {Object.entries(selectedEntry.documentList || {}).map(([type, data]) => (
                  <div key={type} className="group relative border border-slate-200 rounded-3xl overflow-hidden bg-white hover:shadow-xl transition-all">
                    <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
                       <div>
                         <p className="text-[10px] font-black uppercase text-blue-600 italic">{type}</p>
                         <p className="text-xs font-bold text-slate-800">{data.documentNumber}</p>
                       </div>
                       <button onClick={() => removeDoc(type)} className="w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all">✕</button>
                    </div>
                    <div className="p-2">
                        {data.fileUrl.endsWith('.pdf') ? (
                        <div className="h-48 bg-slate-100 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed">
                            <span className="text-4xl mb-2">📄</span>
                            <p className="text-[10px] font-black text-slate-400 uppercase">PDF DOCUMENT</p>
                        </div>
                        ) : (
                        <img src={data.fileUrl} alt={type} className="h-48 w-full object-cover rounded-2xl shadow-inner border border-slate-100" />
                        )}
                        <a href={data.fileUrl} target="_blank" rel="noreferrer" className="block text-center py-3 text-[10px] font-black text-blue-500 uppercase tracking-widest hover:text-blue-700 transition-colors">View Document</a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 4: ADDRESS & REMARKS */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-4">
               <label className="text-xs font-black text-blue-600 uppercase italic tracking-widest">3. Address & Remarks</label>
               <div className="grid grid-cols-2 gap-4">
                   <div>
                       <label className="text-[10px] font-bold text-slate-400 uppercase ml-2 mb-1 block">Full Address</label>
                       <textarea className="w-full p-4 bg-slate-50 rounded-2xl border-none shadow-inner outline-none font-medium h-32 focus:ring-2 focus:ring-blue-400" value={selectedEntry.address} onChange={(e) => setSelectedEntry({...selectedEntry, address: e.target.value})} />
                   </div>
                   <div>
                       <label className="text-[10px] font-bold text-slate-400 uppercase ml-2 mb-1 block">Staff Remarks</label>
                       <textarea className="w-full p-4 bg-slate-50 rounded-2xl border-none shadow-inner outline-none font-medium h-32 focus:ring-2 focus:ring-blue-400" value={selectedEntry.remarks} onChange={(e) => setSelectedEntry({...selectedEntry, remarks: e.target.value})} />
                   </div>
               </div>
            </div>

          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-300">
             <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center mb-6 opacity-50">
                <span className="text-4xl">👤</span>
             </div>
             <p className="font-black uppercase tracking-widest text-sm">Select a guest from the queue</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserEditEntry;