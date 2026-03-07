import { useEffect, useState, useCallback } from "react"; // Added useCallback
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  query,
  where,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 🔹 Edit states
  const [showEdit, setShowEdit] = useState(false);
  const [editUserId, setEditUserId] = useState(null);
  const [editEmail, setEditEmail] = useState("");
  const [editName, setEditName] = useState("");
  const [editMobile, setEditMobile] = useState(""); 
  const [editEmpId, setEditEmpId] = useState(""); 

  // ✅ Wrapped in useCallback to prevent the "cascading renders" error
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "users"), where("role", "==", "user"));
      const snapshot = await getDocs(q);
      const userList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(userList);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, []); // Empty array means this function is created once

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]); // fetchUsers is now a stable dependency

  const handleDelete = async (uid) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteDoc(doc(db, "users", uid));
        alert("User deleted successfully ✅");
        fetchUsers();
      } catch (err) {
        console.error(err);
        alert("Delete failed");
      }
    }
  };

  const handleEditOpen = (user) => {
    setEditUserId(user.id);
    setEditEmail(user.email);
    setEditName(user.name || "");
    setEditMobile(user.mobile || ""); 
    setEditEmpId(user.employeeId || ""); 
    setShowEdit(true);
  };

  const handleUpdate = async () => {
    try {
      await updateDoc(doc(db, "users", editUserId), {
        email: editEmail,
        name: editName,
        mobile: editMobile, 
        employeeId: editEmpId, 
      });

      alert("User updated successfully ✅");
      setShowEdit(false);
      fetchUsers();
    } catch (err) {
      console.error(err); // Used err to clear warning
      alert("Update failed ❌");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-500 text-lg animate-pulse font-black uppercase tracking-widest">
          Syncing Employee Database...
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <button
        onClick={() => navigate("/admin/dashboard")}
        className="text-sm text-blue-600 font-bold mb-4 hover:underline flex items-center"
      >
        ← Back to Dashboard
      </button>

      <header className="mb-8 text-center">
        <h2 className="text-3xl font-black text-slate-800 uppercase italic tracking-tighter">
          👥 Manage Employees
        </h2>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Active Staff Directory</p>
      </header>

      <div className="overflow-x-auto bg-white shadow-2xl rounded-3xl border border-slate-200 overflow-hidden">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-slate-900 text-white uppercase text-[10px] font-black tracking-widest">
            <tr>
              <th className="px-6 py-5">ID</th>
              <th className="px-6 py-5">Employee Name</th>
              <th className="px-6 py-5">Contact & Email</th>
              <th className="px-6 py-5 text-center">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-slate-50 transition-all group">
                <td className="px-6 py-4 font-black text-blue-600 italic">
                  {user.employeeId || "No ID"}
                </td>
                <td className="px-6 py-4">
                  <p className="font-black text-slate-800 uppercase leading-none">{user.name || "N/A"}</p>
                  <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">Role: Staff</p>
                </td>
                <td className="px-6 py-4">
                  <p className="font-bold text-slate-700">{user.mobile || "No Mobile"}</p>
                  <p className="text-xs text-slate-400">{user.email}</p>
                </td>

                <td className="px-6 py-4 text-center space-x-2">
                  <button
                    onClick={() => handleEditOpen(user)}
                    className="px-4 py-2 text-[10px] font-black uppercase rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all border border-emerald-100"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(user.id)}
                    className="px-4 py-2 text-[10px] font-black uppercase rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-100"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {users.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center py-20">
                   <p className="text-slate-300 font-black italic uppercase text-2xl">No Staff Registered</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 🔹 EDIT MODAL */}
      {showEdit && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm z-50 p-4"
          onClick={() => setShowEdit(false)}
        >
          <div
            className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md p-8 relative animate-fadeIn border-t-[12px] border-blue-600"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-black text-slate-800 mb-8 text-center uppercase italic tracking-tighter">
              Update Employee
            </h3>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">Emp ID</label>
                  <input
                    type="text"
                    value={editEmpId}
                    onChange={(e) => setEditEmpId(e.target.value)}
                    className="w-full border-2 border-slate-100 px-4 py-3 rounded-2xl focus:border-blue-500 outline-none font-bold text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">Mobile</label>
                  <input
                    type="tel"
                    maxLength="10"
                    value={editMobile}
                    onChange={(e) => setEditMobile(e.target.value)}
                    className="w-full border-2 border-slate-100 px-4 py-3 rounded-2xl focus:border-blue-500 outline-none font-bold text-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full border-2 border-slate-100 px-4 py-3 rounded-2xl focus:border-blue-500 outline-none font-bold uppercase text-slate-700"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">Email Address</label>
                <input
                  type="email"
                  value={editEmail}
                  className="w-full border-2 border-slate-100 px-4 py-3 rounded-2xl focus:border-blue-500 outline-none font-medium text-slate-400 bg-slate-50"
                  disabled 
                />
              </div>
            </div>

            <div className="flex gap-4 mt-10">
              <button
                onClick={() => setShowEdit(false)}
                className="flex-1 py-4 rounded-2xl bg-slate-100 text-slate-500 font-black uppercase text-xs hover:bg-slate-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="flex-1 py-4 rounded-2xl bg-blue-600 text-white font-black uppercase text-xs hover:bg-black transition shadow-lg shadow-blue-200"
              >
                Save Updates
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;