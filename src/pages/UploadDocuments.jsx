import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore"; // Added getDoc
import { db } from "../firebase";

const UploadDocuments = () => {
  const [documentType, setDocumentType] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [uploadedDocs, setUploadedDocs] = useState([]); // Track multiple uploads

  const navigate = useNavigate();

  // Load user session and check for existing documents
  useEffect(() => {
    const storedId = localStorage.getItem("currentUserId");
    if (!storedId) {
      alert("No user session found. Please fill details first.");
      navigate("/credentials");
      return;
    }
    setUserId(storedId);
    fetchExistingDocs(storedId);
  }, [navigate]);

  const fetchExistingDocs = async (id) => {
    const docRef = doc(db, "userDocuments", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setUploadedDocs(Object.keys(docSnap.data().documents || {}));
    }
  };

  const handleFileChange = (e) => {
    if (!e.target.files || !e.target.files[0]) return;
    const selectedFile = e.target.files[0];
    if (selectedFile.size > 3 * 1024 * 1024) {
      alert("File must be less than 3MB");
      return;
    }
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!documentType || !documentNumber || !file) {
      alert("Please fill all fields and select a file");
      return;
    }

    try {
      setLoading(true);
      const fileExt = file.name.split(".").pop();
      const fileName = `${documentType.toLowerCase()}_${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      const { error } = await supabase.storage.from("hotel-documents").upload(filePath, file);
      if (error) throw error;

      const { data } = supabase.storage.from("hotel-documents").getPublicUrl(filePath);
      
      const docRef = doc(db, "userDocuments", userId);
      await setDoc(docRef, {
        documents: {
          [documentType.toLowerCase()]: {
            documentNumber,
            filePath,
            fileUrl: data.publicUrl,
            uploadedAt: serverTimestamp(),
          },
        },
      }, { merge: true });

      alert(`${documentType.toUpperCase()} Uploaded Successfully!`);
      
      // Update local state to show the list
      setUploadedDocs(prev => [...new Set([...prev, documentType.toLowerCase()])]);
      
      // Reset fields for the NEXT document
      setDocumentType("");
      setDocumentNumber("");
      setFile(null);

    } catch (err) {
      alert("Upload failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans text-slate-900">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        
        <div className="bg-slate-800 p-6 flex justify-between items-center">
          <button onClick={() => navigate("/credentials")} className="text-[10px] font-black uppercase text-slate-400">← Back</button>
          <h2 className="text-sm font-black text-white uppercase tracking-[3px]">Identity Verification</h2>
          <div className="w-10"></div>
        </div>

        <div className="p-8">
          {/* MULTI-DOCUMENT TRACKER */}
          {uploadedDocs.length > 0 && (
            <div className="mb-6 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
              <p className="text-[10px] font-black text-emerald-600 uppercase mb-2">Verified Documents:</p>
              <div className="flex flex-wrap gap-2">
                {uploadedDocs.map(docName => (
                  <span key={docName} className="px-2 py-1 bg-white border border-emerald-200 text-emerald-700 text-[9px] font-bold rounded-lg uppercase">
                    ✓ {docName}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="block text-[10px] font-black text-blue-600 uppercase mb-1">Select Identity Document</label>
              <select
                className="w-full border-2 border-slate-100 p-3 rounded-xl font-bold bg-slate-50 outline-none focus:border-blue-400"
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
              >
                <option value="">Choose Document Type</option>
                <option value="aadhaar" disabled={uploadedDocs.includes("aadhaar")}>Aadhaar Card {uploadedDocs.includes("aadhaar") && "(Uploaded)"}</option>
                <option value="pan" disabled={uploadedDocs.includes("pan")}>PAN Card {uploadedDocs.includes("pan") && "(Uploaded)"}</option>
                <option value="license" disabled={uploadedDocs.includes("license")}>Driving License</option>
                <option value="passport" disabled={uploadedDocs.includes("passport")}>Passport</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-blue-600 uppercase mb-1">Document Number</label>
              <input
                type="text"
                placeholder="Ex: 0000 0000 0000"
                className="w-full border-2 border-slate-100 p-3 rounded-xl bg-slate-50 font-bold"
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
              />
            </div>

            <div className="p-5 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
              <input type="file" accept="image/*,.pdf" onChange={handleFileChange} className="w-full text-xs text-slate-500 file:bg-slate-800 file:text-white file:rounded-full file:border-0 file:px-4 file:py-1 font-bold" />
            </div>

            <div className="pt-4 space-y-3">
              <button
                onClick={handleUpload}
                disabled={loading}
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-black uppercase text-xs tracking-[2px] shadow-lg hover:bg-blue-700 disabled:bg-slate-300"
              >
                {loading ? "Uploading..." : "+ Upload This Document"}
              </button>

              {/* FINISH BUTTON - Only shows if at least 1 doc is uploaded */}
              {uploadedDocs.length > 0 && (
                <button
                  onClick={() => navigate("/userdashboard")}
                  className="w-full py-4 bg-black text-white rounded-xl font-black uppercase text-xs tracking-[2px] shadow-lg animate-bounce"
                >
                  Finish & Go to Dashboard
                </button>
              )}
              
              <button onClick={() => navigate("/userdashboard")} className="w-full text-[10px] font-black text-slate-400 uppercase">Skip for now</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadDocuments;