// src/pages/UserLogin.jsx
import React, { useState } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";

const UserLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // 1️⃣ Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const uid = userCredential.user.uid;

      // 2️⃣ Check Firestore record
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);

      // ❌ User not created by admin
      if (!userSnap.exists()) {
        await signOut(auth);
        setError("User is undefined or not authorized. Please contact admin.");
        return;
      }

      const userData = userSnap.data();

      // ❌ Wrong role
      if (userData.role !== "user") {
        await signOut(auth);
        setError("Access denied. This account is not a user.");
        return;
      }

      // ✅ Authorized user
      alert("User Login Successful!");
      navigate("/credentials");

    } catch (err) {
      console.error(err);
      setError("Invalid email or password");
    }
  };

  return (
  <div className="min-h-screen flex items-center justify-center ">
    <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
      
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
        User Login
      </h2>

      <form onSubmit={handleLogin} className="space-y-4">
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error && (
          <p className="text-red-600 text-sm text-center">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700 transition"
        >
          Login
        </button>

      </form>
    </div>
  </div>
);

}

export default UserLogin;
