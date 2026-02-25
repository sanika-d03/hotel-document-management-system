import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const UserCredentials = () => {
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    gender: "",
    nationality: "",
    regNo: "",
    address: "",
    mobile: "",
    email: "",
    purpose: "",
    roomNo: "",
    persons: "",
    checkIn: "",
    checkOut: "",
    stayDays: "",
    remarks: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextPage = () => setPage(page + 1);
  const prevPage = () => setPage(page - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const docRef = await addDoc(collection(db, "userCredentials"), {
        ...formData,
        createdAt: serverTimestamp()
      });

      localStorage.setItem("currentUserId", docRef.id);
      alert("Credentials saved successfully ✅");
      navigate("/upload-documents", { state: { userId: docRef.id } });
    } catch (error) {
      console.error("Firestore Error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Guest Registration Form
        </h2>

        <p className="text-center text-sm text-gray-500 mb-6">
          Step {page} of 3
        </p>

        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${(page / 3) * 100}%` }}
          ></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {page === 1 && (
            <>
              <input name="fullName" placeholder="Full Name" onChange={handleChange} className="input" />
              <input name="age" type="number" placeholder="Age" onChange={handleChange} className="input" />
              <select name="gender" onChange={handleChange} className="input">
                <option value="">Select Gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
              <input name="nationality" placeholder="Nationality" onChange={handleChange} className="input" />
              <input name="regNo" placeholder="Registration Number" onChange={handleChange} className="input" />
            </>
          )}

          {page === 2 && (
            <>
              <input name="address" placeholder="Permanent Address" onChange={handleChange} className="input" />
              <input name="mobile" placeholder="Mobile Number" onChange={handleChange} className="input" />
              <input name="email" type="email" placeholder="Email Address" onChange={handleChange} className="input" />
              <input name="purpose" placeholder="Purpose of Visit" onChange={handleChange} className="input" />
              <input name="roomNo" placeholder="Room Number" onChange={handleChange} className="input" />
            </>
          )}

          {page === 3 && (
            <>
              <input name="persons" type="number" placeholder="Number of Persons" onChange={handleChange} className="input" />
              <label className="text-sm text-gray-600">Check-in Date & Time</label>
              <input name="checkIn" type="datetime-local" onChange={handleChange} className="input" />
              <label className="text-sm text-gray-600">Check-out Date & Time</label>
              <input name="checkOut" type="datetime-local" onChange={handleChange} className="input" />
              <input name="stayDays" type="number" placeholder="Days of Stay" onChange={handleChange} className="input" />
              <textarea name="remarks" placeholder="Remarks" onChange={handleChange} className="input"></textarea>
            </>
          )}

          <div className="flex justify-between pt-4">
            {page > 1 && (
              <button type="button" onClick={prevPage} className="px-4 py-2 border rounded-md hover:bg-gray-100">
                Previous
              </button>
            )}

            {page < 3 && (
              <button type="button" onClick={nextPage} className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Next
              </button>
            )}

            {page === 3 && (
              <button type="submit" className="ml-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                Submit
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserCredentials;