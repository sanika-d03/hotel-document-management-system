import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

const UploadDocuments = () => {
  const [documentType, setDocumentType] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const storedId = localStorage.getItem("currentUserId");
    if (!storedId) {
      alert("No user session found. Please fill details first.");
      navigate("/credentials");
    } else {
      setUserId(storedId);
    }
  }, [navigate]);

  const handleFileChange = (e) => {
    if (!e.target.files || !e.target.files[0]) return;

    const selectedFile = e.target.files[0];

    // 🔒 STRICT validation (very important for Supabase)
    const maxSizeMB = 3; // reduce timeout issues
    if (selectedFile.size > maxSizeMB * 1024 * 1024) {
      alert("File must be less than 3MB (WhatsApp images are often too large)");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowedTypes.includes(selectedFile.type)) {
      alert("Only JPG, PNG or PDF files are allowed");
      return;
    }

    setFile(selectedFile);
  };

  // 🔁 Retry Upload Function (fixes timeout)
  const uploadWithRetry = async (filePath, file, retries = 2) => {
    try {
      const { data, error } = await supabase.storage
        .from("hotel-documents")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

      if (error) throw error;
      return data;
    } catch (err) {
      if (retries > 0) {
        console.warn("Retrying upload...", retries);
        return uploadWithRetry(filePath, file, retries - 1);
      }
      throw err;
    }
  };

  const handleUpload = async () => {
    if (!documentType || !documentNumber || !file) {
      alert("Please fill all fields and select a file");
      return;
    }

    if (!userId) {
      alert("User session missing. Restart the process.");
      return;
    }

    try {
      setLoading(true);

      const fileExt = file.name.split(".").pop();
      const timestamp = Date.now();
      const safeDocType = documentType.toLowerCase();
      const fileName = `${safeDocType}_${timestamp}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      console.log("Uploading to:", filePath);
      console.log("File size (KB):", (file.size / 1024).toFixed(2));

      // 🚀 Upload with retry (MAIN FIX)
      await uploadWithRetry(filePath, file);

      // 🌐 Get public URL
      const { data } = supabase.storage
        .from("hotel-documents")
        .getPublicUrl(filePath);

      const publicUrl = data.publicUrl;

      if (!publicUrl) {
        throw new Error("Public URL generation failed");
      }

      console.log("Public URL:", publicUrl);

      // 🗄 Save metadata in Firestore
      const docRef = doc(db, "userDocuments", userId);

      await setDoc(
        docRef,
        {
          documents: {
            [safeDocType]: {
              documentNumber,
              filePath,
              fileUrl: publicUrl,
              fileName: fileName,
              uploadedAt: serverTimestamp(),
            },
          },
        },
        { merge: true }
      );

      alert("Document uploaded successfully ✅");

      // Reset form
      setDocumentType("");
      setDocumentNumber("");
      setFile(null);
    } catch (err) {
      console.error("FINAL Upload Error:", err);

      if (err.message.includes("Failed to fetch")) {
        alert(
          "Network timeout with Supabase.\n\nFix:\n1. Turn OFF VPN\n2. Use Mobile Hotspot\n3. Try smaller image (<2MB)"
        );
      } else {
        alert("Upload failed: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 border">
        <button
          onClick={() => navigate("/credentials")}
          className="text-sm text-blue-600 font-medium mb-4 hover:underline"
        >
          ← Back
        </button>

        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          📄 Upload Documents
        </h2>

        <p className="text-[10px] text-gray-400 text-center mb-4">
          Session: {userId}
        </p>

        <label className="block text-sm font-medium text-gray-600 mb-1">
          Document Type
        </label>
        <select
          className="w-full border px-4 py-2 rounded-lg mb-4"
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value)}
        >
          <option value="">Select Document</option>
          <option value="aadhaar">Aadhaar Card</option>
          <option value="pan">PAN Card</option>
          <option value="license">Driving License</option>
          <option value="passport">Passport</option>
        </select>

        <label className="block text-sm font-medium text-gray-600 mb-1">
          Document Number
        </label>
        <input
          type="text"
          placeholder="Enter document number"
          className="w-full border px-4 py-2 rounded-lg mb-4"
          value={documentNumber}
          onChange={(e) => setDocumentNumber(e.target.value)}
        />

        <label className="block text-sm font-medium text-gray-600 mb-1">
          Upload File (JPG, PNG, PDF - Max 3MB)
        </label>
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileChange}
          className="w-full border px-3 py-2 rounded-lg mb-3"
        />

        {file && (
          <p className="text-xs text-gray-500 mb-4">
            📎 {file.name} ({(file.size / 1024).toFixed(1)} KB)
          </p>
        )}

        <button
          onClick={handleUpload}
          disabled={loading}
          className={`w-full py-3 rounded-lg font-semibold text-white ${
            loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Uploading..." : "Confirm & Upload"}
        </button>
      </div>
    </div>
  );
};

export default UploadDocuments;