import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { uploadToCloudinary } from "../utils/cloudinaryUpload";
import imageCompression from "browser-image-compression";
import { db } from "../firebase";
import Cropper from "react-easy-crop";

const UploadDocuments = () => {
  const [documentType, setDocumentType] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [side, setSide] = useState("front"); // New state for Front/Back selection
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [uploadedDocs, setUploadedDocs] = useState([]);

  // States for Cropping
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropper, setShowCropper] = useState(false);

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

  // --- Helper Function for Cropping ---
  const getCroppedImg = async (imageSrc, cropPixels) => {
    const image = new Image();
    image.src = imageSrc;
    await new Promise((resolve) => (image.onload = resolve));

    const canvas = document.createElement("canvas");
    canvas.width = cropPixels.width;
    canvas.height = cropPixels.height;
    const ctx = canvas.getContext("2d");

    ctx.drawImage(
      image,
      cropPixels.x,
      cropPixels.y,
      cropPixels.width,
      cropPixels.height,
      0,
      0,
      cropPixels.width,
      cropPixels.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(new File([blob], "cropped.jpg", { type: "image/jpeg" }));
      }, "image/jpeg");
    });
  };

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const compressImageTo250KB = async (imageFile) => {
    const MAX_SIZE = 250 * 1024;
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

    if (selectedFile.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result);
        setShowCropper(true);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      if (selectedFile.size > MAX_SIZE) {
        alert("PDF file must be less than 250 KB");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!documentType || !documentNumber || !file) {
      alert("Please fill all fields and select a file");
      return;
    }

    try {
      setLoading(true);
      const folderPath = `hotel-documents/${userId}`;
      let finalFile = file;

      if (file.type.startsWith("image/")) {
        finalFile = await compressImageTo250KB(file);
      }

      if (finalFile.size > 250 * 1024) {
        alert("File exceeds 250 KB even after compression");
        return;
      }

      const cloudinaryUrl = await uploadToCloudinary(finalFile, folderPath);
      const docRef = doc(db, "userDocuments", userId);
      const docSnap = await getDoc(docRef);
      const existingDocs = docSnap.exists() ? docSnap.data().documents : {};

      // Logic: If Aadhaar or License, append the side to the storage key
      const needsSides = ["aadhaar", "license"].includes(documentType);
      const storageKey = needsSides ? `${documentType}_${side}` : documentType;

      await setDoc(
        docRef,
        {
          documents: {
            ...existingDocs,
            [storageKey]: {
              documentNumber,
              fileUrl: cloudinaryUrl,
              uploadedAt: serverTimestamp(),
              side: needsSides ? side : "n/a"
            },
          },
        },
        { merge: true }
      );

      alert(`${documentType.toUpperCase()} (${needsSides ? side : ""}) Uploaded Successfully!`);
      setUploadedDocs((prev) => [...new Set([...prev, storageKey])]);
      
      // Reset only file and inputs, keep document type if you want to upload the other side immediately
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
      
      {/* --- CROPPER MODAL --- */}
      {showCropper && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 bg-slate-800 text-white text-center font-bold text-xs uppercase tracking-widest">
              Adjust {documentType} {["aadhaar", "license"].includes(documentType) ? `(${side} side)` : ""}
            </div>
            <div className="relative h-72 bg-black">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={4 / 3}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div className="p-6 bg-white space-y-4">
                <input 
                    type="range" 
                    value={zoom} 
                    min={1} max={3} step={0.1} 
                    onChange={(e) => setZoom(e.target.value)}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCropper(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold uppercase text-[10px]"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels);
                    setFile(croppedFile);
                    setShowCropper(false);
                  }}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold uppercase text-[10px]"
                >
                  Apply Crop
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                    ✓ {docName.replace("_", " ")}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* DOCUMENT TYPE SELECT */}
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
                <option value="aadhaar">Aadhaar Card</option>
                <option value="pan">PAN Card</option>
                <option value="license">Driving License</option>
                <option value="passport">Passport</option>
              </select>
            </div>

            {/* SIDE SELECTION - Only shows for Aadhaar & License */}
            {["aadhaar", "license"].includes(documentType) && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <label className="block text-[10px] font-black text-blue-600 uppercase mb-2 ml-1">
                  Select Card Side
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSide("front")}
                    className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all border-2 ${
                      side === "front" 
                      ? "bg-blue-600 border-blue-600 text-white shadow-md" 
                      : "bg-white border-slate-100 text-slate-400"
                    }`}
                  >
                    Front Side
                  </button>
                  <button
                    onClick={() => setSide("back")}
                    className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all border-2 ${
                      side === "back" 
                      ? "bg-blue-600 border-blue-600 text-white shadow-md" 
                      : "bg-white border-slate-100 text-slate-400"
                    }`}
                  >
                    Back Side
                  </button>
                </div>
              </div>
            )}

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
              {file && (
                <p className="mt-2 text-[9px] text-blue-600 font-bold uppercase italic">
                   File Ready: {file.name}
                </p>
              )}
            </div>

            <div className="pt-2 space-y-3">
              <button
                onClick={handleUpload}
                disabled={loading}
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-black uppercase text-[10px] md:text-xs tracking-[2px] shadow-lg hover:bg-blue-700 active:scale-[0.98] transition-all disabled:bg-slate-300"
              >
                {loading ? "Uploading..." : `+ Upload ${documentType} ${["aadhaar", "license"].includes(documentType) ? side : ""}`}
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