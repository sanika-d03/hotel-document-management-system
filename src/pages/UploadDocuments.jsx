import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import imageCompression from "browser-image-compression";
import { db } from "../firebase";

const UploadDocuments = () => {
  const [documentType, setDocumentType] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [uploadedDocs, setUploadedDocs] = useState([]);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

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
    try {
      const docRef = doc(db, "userDocuments", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUploadedDocs(Object.keys(docSnap.data().documents || {}));
      }
    } catch (err) {
      console.error("Failed to fetch documents", err);
    }
  };

 const compressImageTo250KB = async (imageFile) => {
  const MAX_SIZE = 250 * 1024; // 250 KB
  let quality = 0.8;
  let width = 1024;
  let compressedFile = imageFile;

  while (compressedFile.size > MAX_SIZE && quality > 0.2) {
    compressedFile = await imageCompression(compressedFile, {
      maxSizeMB: 0.25,
      maxWidthOrHeight: width,
      initialQuality: quality,
      useWebWorker: true,
    });

    quality -= 0.1;
    width -= 100;
  }

  return compressedFile;
};

  const handleFileChange = (e) => {
    if (!e.target.files || !e.target.files[0]) return;

    const selectedFile = e.target.files[0];
    const MAX_SIZE = 250 * 1024;

    // Allow images (they will be compressed later)
    if (
      !selectedFile.type.startsWith("image/") &&
      selectedFile.size > MAX_SIZE
    ) {
      alert("PDF file must be less than 250 KB");
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

      let finalFile = file;

      // Compress images only
      if (file.type.startsWith("image/")) {
        finalFile = await compressImageTo250KB(file);
      }

      // Final size safety check
      if (finalFile.size > 250 * 1024) {
        alert("File exceeds 250 KB even after compression");
        return;
      }

      const { error } = await supabase.storage
        .from("hotel-documents")
        .upload(filePath, finalFile, { upsert: true });

      if (error) throw error;

      const { data } = supabase.storage
        .from("hotel-documents")
        .getPublicUrl(filePath);

      const docRef = doc(db, "userDocuments", userId);
      const docSnap = await getDoc(docRef);

      const existingDocs = docSnap.exists()
        ? docSnap.data().documents
        : {};

      await setDoc(
        docRef,
        {
          documents: {
            ...existingDocs,
            [documentType.toLowerCase()]: {
              documentNumber,
              filePath,
              fileUrl: data.publicUrl,
              uploadedAt: serverTimestamp(),
            },
          },
        },
        { merge: true }
      );

      alert(`${documentType.toUpperCase()} Uploaded Successfully!`);

      setUploadedDocs((prev) => [
        ...new Set([...prev, documentType.toLowerCase()]),
      ]);

      setDocumentType("");
      setDocumentNumber("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      alert("Upload failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-3 md:p-6 font-sans text-slate-900">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-slate-800 p-5 md:p-6 flex justify-between items-center">
          <button
            onClick={() => navigate("/credentials")}
            className="text-[10px] font-black uppercase text-slate-400 hover:text-white transition-colors"
          >
            ← Back
          </button>
          <h2 className="text-[11px] md:text-sm font-black text-white uppercase tracking-[2px] md:tracking-[3px]">
            Identity Verification
          </h2>
          <div className="w-10"></div>
        </div>

        <div className="p-6 md:p-8">
          {uploadedDocs.length > 0 && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
              <p className="text-[9px] font-black text-emerald-600 uppercase mb-2">
                Verified Documents:
              </p>
              <div className="flex flex-wrap gap-2">
                {uploadedDocs.map((docName) => (
                  <span
                    key={docName}
                    className="px-2.5 py-1 bg-white border border-emerald-200 text-emerald-700 text-[8px] md:text-[9px] font-black rounded-lg uppercase shadow-sm"
                  >
                    ✓ {docName}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-blue-600 uppercase mb-1 ml-1">
                Select Identity Document
              </label>
              <select
                className="w-full border-2 border-slate-100 p-3.5 rounded-xl font-bold bg-slate-50 outline-none focus:border-blue-400 text-sm transition-all"
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
              >
                <option value="">Choose Document Type</option>
                <option value="aadhaar" disabled={uploadedDocs.includes("aadhaar")}>
                  Aadhaar Card {uploadedDocs.includes("aadhaar") && "(Uploaded)"}
                </option>
                <option value="pan" disabled={uploadedDocs.includes("pan")}>
                  PAN Card {uploadedDocs.includes("pan") && "(Uploaded)"}
                </option>
                <option value="license" disabled={uploadedDocs.includes("license")}>
                  Driving License
                </option>
                <option
                  value="passport"
                  disabled={uploadedDocs.includes("passport")}
                >
                  Passport
                </option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-blue-600 uppercase mb-1 ml-1">
                Document Number
              </label>
              <input
                type="text"
                placeholder="Ex: 0000 0000 0000"
                className="w-full border-2 border-slate-100 p-3.5 rounded-xl bg-slate-50 font-bold text-sm outline-none focus:border-blue-400 transition-all"
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
              />
            </div>

            <div className="p-5 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 hover:border-blue-300 transition-all">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="w-full text-[10px] md:text-xs text-slate-500 file:bg-slate-800 file:text-white file:rounded-full file:border-0 file:px-4 file:py-1.5 file:mr-2 font-bold cursor-pointer"
              />
            </div>

            <div className="pt-2 space-y-3">
              <button
                onClick={handleUpload}
                disabled={loading}
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-black uppercase text-[10px] md:text-xs tracking-[2px] shadow-lg hover:bg-blue-700 active:scale-[0.98] transition-all disabled:bg-slate-300"
              >
                {loading ? "Uploading..." : "+ Upload This Document"}
              </button>

              {uploadedDocs.length > 0 && (
                <button
                  onClick={() => navigate("/userdashboard")}
                  className="w-full py-4 bg-black text-white rounded-xl font-black uppercase text-[10px] md:text-xs tracking-[2px] shadow-lg animate-pulse hover:bg-slate-900 transition-all"
                >
                  Finish & Go to Dashboard
                </button>
              )}

              <button
                onClick={() => navigate("/userdashboard")}
                className="w-full py-2 text-[10px] font-black text-slate-400 uppercase hover:text-slate-600 transition-all"
              >
                Skip for now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadDocuments;