import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";

const CreateUser = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleCreateUser = async (e) => {
    e.preventDefault();

    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await setDoc(doc(db, "users", userCred.user.uid), {
        email: email,
        role: "user",
        createdAt: new Date()
      });

      alert("User created successfully ✅");
      navigate("/admin/dashboard");
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 border">

        {/* 🔙 Back Button */}
        <button
          onClick={() => navigate("/admin/dashboard")}
          className="text-sm text-blue-600 font-medium mb-4 hover:underline"
        >
          ← Back
        </button>

        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
          👤 Create New User
        </h2>

        <form onSubmit={handleCreateUser} className="space-y-5">

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              User Email
            </label>
            <input
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition duration-200 shadow-md"
          >
            ➕ Create User
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-6">
          User will be created with <span className="font-semibold">USER</span> role
        </p>

      </div>
    </div>
  );
};

export default CreateUser;