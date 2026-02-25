import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-full max-w-4xl px-6">

        <h1 className="text-3xl font-bold text-gray-800 mb-10 text-center">
          Admin Dashboard
        </h1>

        {/* Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Create User */}
          <div
            onClick={() => navigate("/admin/create-user")}
            className="cursor-pointer border rounded-xl p-6 shadow-sm
                       hover:shadow-xl hover:-translate-y-1 transition-all"
          >
            <h2 className="text-xl font-semibold mb-2 text-blue-600">
              ➕ Create User
            </h2>
            <p className="text-gray-600 text-sm">
              Add new users and assign login access.
            </p>
          </div>

          {/* Manage Users */}
          <div
            onClick={() => navigate("/admin/manage-users")}
            className="cursor-pointer border rounded-xl p-6 shadow-sm
                       hover:shadow-xl hover:-translate-y-1 transition-all"
          >
            <h2 className="text-xl font-semibold mb-2 text-green-600">
              👥 Manage Users
            </h2>
            <p className="text-gray-600 text-sm">
              Edit user details, reset passwords or remove users.
            </p>
          </div>

          {/* View All Data */}
          <div
            onClick={() => navigate("/admin/view-data")}
            className="cursor-pointer border rounded-xl p-6 shadow-sm
                       hover:shadow-xl hover:-translate-y-1 transition-all"
          >
            <h2 className="text-xl font-semibold mb-2 text-indigo-600">
              📊 View All User Data
            </h2>
            <p className="text-gray-600 text-sm">
              View and search all user documents in one place.
            </p>
          </div>
        </div>

        {/* Logout */}
        <div className="flex justify-center mt-12">
          <button
            onClick={async () => {
              await signOut(auth);
              navigate("/admin/login");
            }}
            className="px-8 py-3 rounded-lg border border-red-500 text-red-600
                       hover:bg-red-600 hover:text-white transition"
          >
            🚪 Logout
          </button>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
