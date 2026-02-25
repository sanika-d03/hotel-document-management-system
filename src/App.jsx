import { Routes, Route } from "react-router-dom";

import AdminRegister from "./admin/AdminRegister";
import AdminLogin from "./admin/AdminLogin";

import AdminDashboard from "./admin/AdminDashboard";
import CreateUser from "./admin/CreateUser";
import AdminProtectedRoute from "./routes/AdminProtectedRoute";
import AdminViewAllData from "./admin/AdminViewAllData";
import AdminViewDocuments from "./admin/AdminViewDocuments";
import ManageUsers from "./admin/ManageUsers";

import UserLogin from "./pages/UserLogin";
import UserCredentials from "./pages/UserCredentials";
import UploadDocuments from "./pages/UploadDocuments";

function App() {
  return (
    <Routes>
      <Route path="/" element={<UserLogin />} />
      <Route path="/credentials" element={<UserCredentials />} />
      <Route path="/upload-documents" element={<UploadDocuments />} />

      {/* ADMIN */}
      <Route path="/admin/register" element={<AdminRegister />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/view-data" element={<AdminViewAllData />} />
      <Route path="/admin/manage-users" element={<ManageUsers />} />

      <Route
        path="/admin/dashboard"
        element={
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>
        }
      />

      <Route
        path="/admin/create-user"
        element={
          <AdminProtectedRoute>
            <CreateUser />
          </AdminProtectedRoute>
        }
      />

      <Route
  path="/admin/view-documents/:userId"
  element={<AdminViewDocuments />}
/>


    </Routes>
  );
}

export default App;
