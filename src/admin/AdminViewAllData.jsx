import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";

const AdminViewAllData = () => {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  // ✅ New state to track which field we are searching in
  const [searchCategory, setSearchCategory] = useState("fullName");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllData = async () => {
      const snapshot = await getDocs(collection(db, "userCredentials"));
      const allData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setData(allData);
    };

    fetchAllData();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this record?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "userCredentials", id));
      setData(prev => prev.filter(item => item.id !== id));
      alert("Deleted successfully ✅");
    } catch (error) {
      console.error(error);
      alert("Delete failed ❌");
    }
  };

  // ✅ Updated Filter Logic for name, date, reg no, and mobile
  const filteredData = data.filter(item => {
    if (!search) return true;
    const searchValue = search.toLowerCase();

    switch (searchCategory) {
      case "fullName":
        return item.fullName?.toLowerCase().includes(searchValue);
      case "regNo":
        return item.regNo?.toLowerCase().includes(searchValue);
      case "mobile":
        return item.mobile?.includes(searchValue);
      case "checkIn":
        // This allows searching by date string (e.g., "2026-02-24")
        return item.checkIn?.includes(searchValue);
      default:
        return true;
    }
  });

  return (
    <div className="p-6 max-w-[95%] mx-auto">

      {/* 🔙 Back Button */}
      <button
        onClick={() => navigate("/admin/dashboard")}
        className="
          inline-flex items-center gap-2 mb-4
          px-4 py-2 rounded-lg
          bg-white border border-gray-300
          text-sm font-medium text-gray-700
          shadow-sm hover:shadow-md
          hover:bg-gray-100
          transition-all duration-200
        "
      >
        ← Back to Dashboard
      </button>

      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
  📋 User Directory Panel
</h2>

      {/* ✅ UPDATED SEARCH SECTION WITH DROP-DOWN */}
      <div className="flex justify-center mb-5 gap-0">
        <div className="flex border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 shadow-sm">
          <select 
            value={searchCategory}
            onChange={(e) => {
                setSearchCategory(e.target.value);
                setSearch(""); // Clear search text when switching categories
            }}
            className="bg-gray-50 border-r px-3 py-2 text-sm text-gray-600 outline-none cursor-pointer"
          >
            <option value="fullName">Name</option>
            <option value="regNo">Reg No</option>
            <option value="mobile">Mobile No</option>
            <option value="checkIn">Check-In Date</option>
          </select>

          <input
            type={searchCategory === "checkIn" ? "date" : "text"}
            placeholder={`Search by ${searchCategory}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 md:w-80 px-4 py-2 outline-none"
          />
        </div>
      </div>

      <div className="overflow-x-auto bg-white shadow-xl rounded-xl border">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-700 uppercase text-xs sticky top-0">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Reg No</th>
              <th className="px-4 py-3">Age</th>
              <th className="px-4 py-3">Gender</th>
              <th className="px-4 py-3">Nationality</th>
              <th className="px-4 py-3">Address</th>
              <th className="px-4 py-3">Mobile</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Purpose</th>
              <th className="px-4 py-3">Room</th>
              <th className="px-4 py-3">Persons</th>
              <th className="px-4 py-3">Check-In</th>
              <th className="px-4 py-3">Check-Out</th>
              <th className="px-4 py-3">Days</th>
              <th className="px-4 py-3">Remarks</th>
              <th className="px-4 py-3">Documents</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {filteredData.length > 0 ? (
              filteredData.map(user => (
                <tr key={user.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-2 font-medium">{user.fullName}</td>
                  <td className="px-4 py-2">{user.regNo}</td>
                  <td className="px-4 py-2">{user.age}</td>
                  <td className="px-4 py-2">{user.gender}</td>
                  <td className="px-4 py-2">{user.nationality}</td>
                  <td className="px-4 py-2 max-w-xs truncate">{user.address}</td>
                  <td className="px-4 py-2">{user.mobile}</td>
                  <td className="px-4 py-2">{user.email}</td>
                  <td className="px-4 py-2">{user.purpose}</td>
                  <td className="px-4 py-2">{user.roomNo}</td>
                  <td className="px-4 py-2">{user.persons}</td>
                  <td className="px-4 py-2">{user.checkIn}</td>
                  <td className="px-4 py-2">{user.checkOut}</td>
                  <td className="px-4 py-2">{user.stayDays}</td>
                  <td className="px-4 py-2">{user.remarks}</td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/admin/view-documents/${user.id}`)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition"
                      >
                        View Documents
                      </button>

                      <button
                        onClick={() => handleDelete(user.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="16" className="text-center py-6 text-gray-400">
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400 text-center mt-5">
        Showing data from <span className="font-semibold">userCredentials</span> collection
      </p>
    </div>
  );
};

export default AdminViewAllData;