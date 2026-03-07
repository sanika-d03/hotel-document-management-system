import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  getDoc
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";

const AdminViewAllData = () => {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [searchCategory, setSearchCategory] = useState("fullName");
  const navigate = useNavigate();

  const fetchAllData = async () => {
    const snapshot = await getDocs(collection(db, "userCredentials"));
    const credentials = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));

    const mergedData = await Promise.all(
      credentials.map(async (guest) => {
        const docRef = doc(db, "userDocuments", guest.id);
        const docSnap = await getDoc(docRef);

        return {
          ...guest,
          docLinks: docSnap.exists() ? docSnap.data().documents : null
        };
      })
    );

    setData(
      mergedData.sort((a, b) => parseInt(b.srNo) - parseInt(a.srNo))
    );
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleVerify = async (id) => {
    await updateDoc(doc(db, "userCredentials", id), { status: "Verified" });
    fetchAllData();
  };

  const handleCheckOut = async (id) => {
    const outTime = new Date().toLocaleString();
    await updateDoc(doc(db, "userCredentials", id), {
      checkOut: outTime,
      isSettled: true,
      isArchived: true 
    });
    fetchAllData();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this entry?")) {
      await deleteDoc(doc(db, "userCredentials", id));
      fetchAllData();
    }
  };

  const filteredData = data.filter(item => {
    const value = search.toLowerCase();
    const guestNames = item.guests?.map(g => g.name.toLowerCase()).join(" ") || "";
    const guestPhones = item.mobiles?.join(" ") || "";
    const guestEmails = item.guests?.map(g => (g.email || "").toLowerCase()).join(" ") || "";
    const guestIDs = item.guests?.map(g => (g.regNo || "").toLowerCase()).join(" ") || "";

    if (searchCategory === "fullName") return guestNames.includes(value);
    if (searchCategory === "mobiles") return guestPhones.includes(value);
    if (searchCategory === "email") return guestEmails.includes(value);
    if (searchCategory === "regNo") return guestIDs.includes(value);
    if (searchCategory === "loggingDate") return item.loggingDate?.includes(value);
    
    return item[searchCategory]?.toString().toLowerCase().includes(value);
  });

  return (
    <div className="p-2 md:p-4 bg-gray-100 min-h-screen font-sans text-gray-800">
      {/* Search Header - Stacked on mobile, row on desktop */}
      <div className="mb-4 md:mb-6 flex flex-col lg:flex-row items-center justify-between gap-4 bg-white p-3 md:p-4 border border-gray-300 rounded shadow-sm">
        
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <button 
            onClick={() => navigate("/admin/dashboard")}
            className="flex items-center justify-center w-8 h-8 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors shrink-0"
            title="Back to Dashboard"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <h2 className="text-lg md:text-xl font-bold border-l-4 border-blue-600 pl-3 uppercase tracking-tight truncate">
            Master Records
          </h2>
        </div>

        {/* Search Bar - Full width on mobile */}
        <div className="flex w-full lg:w-auto border border-gray-300 rounded overflow-hidden shadow-inner">
          <select
            value={searchCategory}
            onChange={(e) => setSearchCategory(e.target.value)}
            className="bg-gray-50 px-2 md:px-3 py-2 text-[10px] md:text-xs font-bold border-r border-gray-300 outline-none shrink-0"
          >
            <option value="fullName">Guest</option>
            <option value="roomNo">Room</option>
            <option value="regNo">ID</option>
            <option value="email">Email</option>
            <option value="mobiles">Phone</option>
            <option value="loggingDate">Date</option>
          </select>
          <input
            type="text"
            placeholder="Search record..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 text-sm outline-none w-full lg:w-64"
          />
        </div>
      </div>

      {/* Grid Table Container */}
      <div className="bg-white border border-gray-400 shadow-xl overflow-hidden rounded-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-[10px] md:text-[11px] border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gray-800 text-white uppercase tracking-wider">
                {[
                  "Sr", "Occupant Details", "ID / Email", "Stay Info", "Contact & Address", 
                   "Check In/Out", "Files", "Status", "Actions"
                ].map(h => (
                  <th key={h} className="px-2 md:px-3 py-3 border border-gray-600 text-left font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredData.map((user) => (
                <tr
                  key={user.id}
                  className={`border-b border-gray-300 hover:bg-blue-50 transition-colors ${user.isSettled ? "bg-green-50 text-gray-500" : ""}`}
                >
                  <td className="px-2 py-3 border border-gray-300 font-bold text-center bg-gray-50">
                    {user.srNo}
                  </td>

                  <td className="px-3 py-3 border border-gray-300">
                    {user.guests?.map((g, i) => (
                      <div key={i} className="mb-2 last:mb-0 pb-2 border-b last:border-0 border-gray-100">
                        <span className="font-black block text-gray-900 uppercase leading-tight">{g.name}</span>
                        <span className="text-[9px] md:text-[10px] text-gray-500 whitespace-nowrap">{g.age}Y | {g.gender} | {user.nationality}</span>
                      </div>
                    ))}
                  </td>

                  <td className="px-3 py-3 border border-gray-300">
                    {user.guests?.map((g, i) => (
                      <div key={i} className="mb-2 last:mb-0">
                        <div className="font-bold text-blue-700">{g.regNo}</div>
                        <div className="text-[9px] md:text-[10px] text-gray-400 lowercase italic truncate w-24 md:w-32" title={g.email}>{g.email || 'no email'}</div>
                      </div>
                    ))}
                  </td>
                  
                  <td className="px-3 py-3 border border-gray-300">
                    <div className="font-black text-blue-600 text-xs md:text-sm">Room {user.roomNo}</div>
                    <div className="text-gray-500 font-medium">{user.stayDays} Days</div>
                    <div className="text-[9px] uppercase font-bold text-gray-400 truncate w-20">{user.purpose}</div>
                  </td>

                  <td className="px-3 py-3 border border-gray-300">
                    <div className="font-bold whitespace-nowrap">{user.mobiles?.join(", ")}</div>
                    <div className="text-[9px] md:text-[10px] text-gray-500 italic max-w-[120px] md:max-w-[150px] leading-tight mt-1 truncate" title={user.address}>
                      {user.address}
                    </div>
                  </td>

                  <td className="px-3 py-3 border border-gray-300 whitespace-nowrap">
                    <div className="text-green-700 font-bold">In: {user.checkIn}</div>
                    <div className="mt-1">
                      {user.checkOut ? (
                        <span className="text-red-600 font-bold">Out: {user.checkOut}</span>
                      ) : (
                        <span className="text-orange-500 italic font-black animate-pulse">In-House</span>
                      )}
                    </div>
                  </td>

                  <td className="px-3 py-3 border border-gray-300 text-center">
                    {user.docLinks ? (
                      <button
                        onClick={() => navigate(`/admin/view-documents/${user.id}`)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-[8px] md:text-[9px] font-bold uppercase whitespace-nowrap shadow-sm"
                      >
                        Docs ({Object.keys(user.docLinks).length})
                      </button>
                    ) : (
                      <span className="text-gray-300 italic text-[9px]">No Files</span>
                    )}
                  </td>

                  <td className="px-3 py-3 border border-gray-300 text-center">
                    <div className="flex flex-col items-center gap-1">
                        {user.isSettled ? <span className="text-base md:text-lg">✅</span> : <span className="text-base md:text-lg">❌</span>}
                        <span className={`px-1.5 py-0.5 rounded-[4px] text-[7px] md:text-[8px] font-black uppercase border leading-none
                        ${user.status === "Verified" || user.isSettled ? "bg-green-100 text-green-800 border-green-300" : "bg-yellow-100 text-yellow-800 border-yellow-300"}`}>
                        {user.isSettled ? "Settled" : (user.status || "Pending")}
                        </span>
                    </div>
                  </td>

                  <td className="px-3 py-3 border border-gray-300">
                    <div className="flex flex-col sm:flex-row justify-center gap-1.5">
                      {!user.isSettled && (
                        <>
                          <button onClick={() => handleVerify(user.id)} title="Verify" className="p-1 border border-green-500 text-green-600 hover:bg-green-600 hover:text-white rounded shrink-0 transition-colors">
                            <svg className="w-3 h-3 md:w-3.5 md:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                          </button>
                          <button onClick={() => handleCheckOut(user.id)} title="Checkout" className="p-1 border border-gray-500 text-gray-600 hover:bg-gray-600 hover:text-white rounded shrink-0 transition-colors">
                            <svg className="w-3 h-3 md:w-3.5 md:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                          </button>
                        </>
                      )}
                      <button onClick={() => handleDelete(user.id)} title="Delete" className="p-1 border border-red-500 text-red-500 hover:bg-red-600 hover:text-white rounded shrink-0 transition-colors">
                        <svg className="w-3 h-3 md:w-3.5 md:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Footer info for mobile users */}
      <p className="mt-4 text-[10px] text-gray-400 text-center lg:hidden italic font-bold">
        Tip: Scroll horizontally to view full guest details.
      </p>
    </div>
  );
};

export default AdminViewAllData;