import { useEffect, useState } from "react";
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

  // 🔹 edit states
  const [showEdit, setShowEdit] = useState(false);
  const [editUserId, setEditUserId] = useState(null);
  const [editEmail, setEditEmail] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    const q = query(collection(db, "users"), where("role", "==", "user"));
    const snapshot = await getDocs(q);
    const userList = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    setUsers(userList);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (uid) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      await deleteDoc(doc(db, "users", uid));
      alert("User deleted successfully ✅");
      fetchUsers();
    }
  };

  // 🔹 open edit modal
  const handleEditOpen = (user) => {
    setEditUserId(user.id);
    setEditEmail(user.email);
    setShowEdit(true);
  };

  // 🔹 update user
  const handleUpdate = async () => {
    await updateDoc(doc(db, "users", editUserId), {
      email: editEmail,
    });

    alert("User updated successfully ✅");
    setShowEdit(false);
    fetchUsers();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-500 text-lg animate-pulse">
          Loading users...
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">

      {/* 🔙 Back Button */}
      <button
        onClick={() => navigate("/admin/dashboard")}
        className="text-sm text-blue-600 font-medium mb-4 hover:underline"
      >
        ← Back
      </button>

      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        👥 Manage Users
      </h2>

      <div className="overflow-x-auto bg-white shadow-lg rounded-xl border">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
            <tr>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 font-medium">
                  {user.email}
                </td>

                <td className="px-6 py-4 text-center space-x-3">
                  <button
                    onClick={() => handleEditOpen(user)}
                    className="px-4 py-1.5 text-sm rounded-md bg-yellow-400 text-white hover:bg-yellow-500"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(user.id)}
                    className="px-4 py-1.5 text-sm rounded-md bg-red-500 text-white hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {users.length === 0 && (
              <tr>
                <td colSpan="2" className="text-center py-6 text-gray-400">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 🔹 EDIT MODAL */}
      {showEdit && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          onClick={() => setShowEdit(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-[400px] p-6 relative animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
              ✏️ Edit User
            </h3>

            <input
              type="email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              className="w-full border px-4 py-2 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter new email"
            />

            <div className="flex justify-between mt-4">
              <button
                onClick={() => setShowEdit(false)}
                className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 transition"
              >
                Cancel
              </button>

              <button
                onClick={handleUpdate}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-400 text-center mt-6">
        Only users with role <span className="font-semibold">USER</span> are shown
      </p>
    </div>
  );
};

export default ManageUsers;