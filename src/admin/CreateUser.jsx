import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";

const CreateUser = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState(""); // ✅ नवीन स्टेट: मोबाईल नंबर
  const [empId, setEmpId] = useState(""); // ✅ नवीन स्टेट: एम्प्लॉई आयडी
  const navigate = useNavigate();

  const handleCreateUser = async (e) => {
    e.preventDefault();

    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // ✅ Firestore मध्ये नवीन फील्ड्ससह डेटा सेव्ह करा
      await setDoc(doc(db, "users", userCred.user.uid), {
        name: fullName,
        email: email,
        mobile: mobile, // मोबाईल नंबर सेव्ह करा
        employeeId: empId, // एम्प्लॉई आयडी सेव्ह करा
        role: "user",
        status: "active", // रिअल सिस्टममध्ये स्टेटस महत्त्वाचा असतो
        createdAt: new Date()
      });

      alert(`Employee ${fullName} created successfully ✅`);
      navigate("/admin/dashboard");
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 border">

        <button
          onClick={() => navigate("/admin/dashboard")}
          className="text-sm text-blue-600 font-medium mb-4 hover:underline flex items-center"
        >
          ← Back
        </button>

        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
          👤 Create New Employee
        </h2>

        <form onSubmit={handleCreateUser} className="space-y-4">
          
          {/* Full Name */}
          <div>
            <label className="block text-[11px] font-black text-gray-400 mb-1 uppercase tracking-wider">
              Full Name
            </label>
            <input
              type="text"
              placeholder="Enter Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>

          {/* Employee ID & Mobile Number (Row) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-black text-gray-400 mb-1 uppercase tracking-wider">
                Employee ID
              </label>
              <input
                type="text"
                placeholder="EMP ID"
                value={empId}
                onChange={(e) => setEmpId(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-[11px] font-black text-gray-400 mb-1 uppercase tracking-wider">
                Mobile No
              </label>
              <input
                type="tel"
                placeholder=""
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                required
                maxLength="10"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-[11px] font-black text-gray-400 mb-1 uppercase tracking-wider">
              User Email
            </label>
            <input
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-[11px] font-black text-gray-400 mb-1 uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-black text-white font-bold py-3 rounded-xl transition duration-300 shadow-md uppercase tracking-widest text-sm mt-2"
          >
            Create User
          </button>
        </form>

        <p className="text-[10px] text-gray-400 text-center mt-6 uppercase font-bold tracking-tighter">
          This user will be registered in the <span className="text-blue-500">Employee List</span>
        </p>

      </div>
    </div>
  );
};

export default CreateUser;