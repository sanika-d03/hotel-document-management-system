import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { supabase } from "../supabaseClient";
import jsPDF from "jspdf"; // ✅ ADDED

// ✅ UI-only label mapping (NO data change)
const documentLabels = {
  aadhaar: "Aadhaar Card",
  pan: "PAN Card",
  license: "Driving License",
  passport: "Passport",
  profile: "Passport",
};

const AdminViewDocuments = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocs = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        const ref = doc(db, "userDocuments", userId);
        const snap = await getDoc(ref);

        if (snap.exists() && snap.data().documents) {
          const docsMap = snap.data().documents;

          const docsArray = Object.keys(docsMap).map((key) => ({
            type: key,
            ...docsMap[key],
          }));

          setDocuments(docsArray);
        } else {
          setDocuments([]);
        }
      } catch (err) {
        console.error("Error fetching documents:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDocs();
  }, [userId]);

  // ✅ EXISTING: View / Print
  const handleViewAndPrint = (url) => {
    if (!url) return;
    window.open(url, "_blank");
  };

  // ✅ NEW: Download as PDF (NO DB CHANGE)
  const downloadAsPDF = (fileUrl, title) => {
    try {
      // If already PDF → direct download
      if (fileUrl.endsWith(".pdf")) {
        const link = document.createElement("a");
        link.href = fileUrl;
        link.download = `${title}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      // Image → Convert to PDF
      const pdf = new jsPDF("p", "mm", "a4");
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = fileUrl;

      img.onload = () => {
        const imgWidth = 190;
        const imgHeight = (img.height * imgWidth) / img.width;

        pdf.text(title, 10, 10);
        pdf.addImage(img, "JPEG", 10, 20, imgWidth, imgHeight);
        pdf.save(`${title}.pdf`);
      };
    } catch (err) {
      console.error("PDF download failed", err);
      alert("Failed to download PDF");
    }
  };

  // ❌ EXISTING: Reject document
  const handleReject = async (docType, fileUrl) => {
    const confirm = window.confirm(
      `Are you sure you want to reject ${docType}?`
    );
    if (!confirm) return;

    try {
      const path = fileUrl.split("/storage/v1/object/public/")[1];
      await supabase.storage.from("hotel-documents").remove([path]);

      const ref = doc(db, "userDocuments", userId);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const updatedDocs = { ...snap.data().documents };
        delete updatedDocs[docType];
        await updateDoc(ref, { documents: updatedDocs });
      }

      setDocuments((prev) => prev.filter((d) => d.type !== docType));
      alert("Document rejected & deleted ❌");
    } catch (err) {
      console.error(err);
      alert("Failed to reject document");
    }
  };

  if (loading)
    return <p className="text-center mt-10">Loading documents...</p>;

  if (documents.length === 0)
    return (
      <div className="text-center mt-10">
        <p className="text-gray-400 mb-4">
          No documents found for this user.
        </p>
        <button
          onClick={() => navigate("/admin/view-data")}
          className="text-blue-500 hover:underline"
        >
          Return to User List
        </button>
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto p-6">
      <button
        onClick={() => navigate("/admin/view-data")}
        className="mb-6 px-4 py-2 border rounded bg-white hover:bg-gray-100 transition shadow-sm"
      >
        ← Back to User List
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {documents.map((doc, idx) => (
          <div
            key={idx}
            className="bg-white border rounded-xl p-5 shadow-sm flex flex-col"
          >
            <div className="flex justify-between mb-3">
              <span className="font-bold">
                {documentLabels[doc.type] || doc.type}
              </span>
              <span className="text-xs text-gray-400">
                ID: {doc.documentNumber || "N/A"}
              </span>
            </div>

            <div className="flex-grow flex items-center justify-center bg-gray-50 h-64 mb-4">
              {doc.fileUrl.endsWith(".pdf") ? (
                <div className="text-center text-5xl">📄</div>
              ) : (
                <img
                  src={doc.fileUrl}
                  alt={doc.type}
                  className="max-h-full cursor-pointer"
                  onClick={() => handleViewAndPrint(doc.fileUrl)}
                />
              )}
            </div>

            {/* ✅ UPDATED ACTIONS */}
            <div className="space-y-2">
              <button
                onClick={() => handleViewAndPrint(doc.fileUrl)}
                className="w-full bg-indigo-600 text-white py-2 rounded"
              >
                🖨️ View / Print
              </button>

              <button
                onClick={() =>
                  downloadAsPDF(
                    doc.fileUrl,
                    documentLabels[doc.type] || doc.type
                  )
                }
                className="w-full bg-green-600 text-white py-2 rounded"
              >
                ⬇️ Download PDF
              </button>

              <button
                onClick={() => handleReject(doc.type, doc.fileUrl)}
                className="w-full text-red-500 text-sm"
              >
                Reject / Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminViewDocuments;