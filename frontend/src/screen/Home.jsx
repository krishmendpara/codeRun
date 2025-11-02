import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import axios from "../config/axios";
import {
  RiDeleteBinLine,
  RiFileCodeLine,
  RiFolderOpenLine,
  RiMenu3Line,
  RiCloseLine,
  RiLogoutBoxLine,
  RiUser3Line,
} from "react-icons/ri";

export default function Home() {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [Allfiles, setAllfiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  // Fetch user files
  useEffect(() => {
    if (!user) return;
    axios
      .get("/code/submissions")
      .then((res) => {
        setAllfiles(res?.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user]);

  // Delete file
  const handleDelete = (id) => {
    axios
      .delete(`/code/submissions/${id}`)
      .then(() => {
        setAllfiles((prev) => prev.filter((file) => file._id !== id));
      })
      .catch((err) => console.log(err));
  };

  // Logout (same logic)
  const handleLogout = () => {
    axios
      .post("/user/logout")
      .then(() => {
        localStorage.removeItem("token");
        setUser(null);
        navigate("/login");
      })
      .catch((err) => console.log(err));
  };

  // Filter files
  const filteredFiles = Allfiles.filter((f) =>
    f.fileName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="min-h-screen flex flex-col bg-linear-to-tr from-gray-950 via-gray-900 to-emerald-950 text-gray-200 relative overflow-hidden">
      {/* HEADER */}
      <header className="flex justify-between items-center px-5 sm:px-8 py-4 border-b border-emerald-700 bg-gray-900/80 backdrop-blur-md">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-emerald-400">
            CodeRun Dashboard
          </h1>
          {user && (
            <p className="text-gray-400 text-xs sm:text-sm mt-1 break-all">
              {user.email}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Desktop Buttons */}
          <button
            onClick={() => navigate("/about")}
            className="hidden sm:block px-4 py-2 border border-emerald-600 rounded-lg hover:bg-emerald-800/40 text-emerald-400 text-sm font-medium transition-all"
          >
            About / Help
          </button>
          <button
            onClick={() =>
              navigate("/editor", {
                state: { user },
              })
            }
            className="hidden sm:block px-4 py-2 bg-emerald-500 text-gray-900 font-semibold rounded-lg hover:bg-emerald-400 transition-all text-sm"
          >
            Open Editor
          </button>

          {/* ✅ Desktop Logout Button */}
          <button
            onClick={handleLogout}
            className="hidden sm:flex items-center gap-2 px-4 py-2 border border-red-500 text-red-400 text-sm rounded-lg hover:bg-red-900/40 transition-all font-medium"
          >
            <RiLogoutBoxLine size={18} />
            Logout
          </button>

          {/* Menu Icon (Mobile Only) */}
          <button
            onClick={() => setMenuOpen(true)}
            className="sm:hidden p-2 rounded-md bg-gray-800 hover:bg-gray-700 transition-all"
          >
            <RiMenu3Line size={22} />
          </button>
        </div>
      </header>

      {/* RIGHT SIDE MENU DRAWER */}
      <div
        className={`fixed top-0 right-0 h-full w-64 sm:w-72 bg-gray-900/95 backdrop-blur-md border-l border-emerald-700 transform transition-transform duration-300 ease-in-out z-50 ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center px-5 py-4 border-b border-emerald-700">
          <h3 className="text-lg font-semibold text-emerald-400">Profile</h3>
          <button
            onClick={() => setMenuOpen(false)}
            className="text-gray-400 hover:text-emerald-400 transition-all"
          >
            <RiCloseLine size={22} />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          {user ? (
            <>
              <div className="flex items-center gap-3">
                <RiUser3Line size={26} className="text-emerald-400" />
                <div>
                  <p className="text-emerald-400 font-semibold text-sm sm:text-base">
                    {user.username}
                  </p>
                  <p className="text-gray-400 text-xs break-all">{user.email}</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/editor", { state: { user } });
                }}
                className="mt-4 px-4 py-2 bg-emerald-500 text-gray-900 font-semibold rounded-lg hover:bg-emerald-400 transition-all text-sm"
              >
                Open Editor
              </button>

              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/about");
                }}
                className="px-4 py-2 border border-emerald-600 rounded-lg hover:bg-emerald-800/40 text-emerald-400 text-sm font-medium transition-all"
              >
                About / Help
              </button>

              <hr className="border-emerald-700/40 my-3" />

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 border border-red-500 text-red-400 text-sm rounded-lg hover:bg-red-900/40 transition-all"
              >
                <RiLogoutBoxLine size={18} /> Logout
              </button>
            </>
          ) : (
            <p className="text-gray-400 text-sm">No user info available</p>
          )}
        </div>
      </div>

      {/* FILES SECTION */}
      <section className="flex-1 px-5 sm:px-8 py-8 overflow-y-auto">
        <h2 className="text-xl sm:text-2xl font-semibold text-emerald-400 mb-5 flex items-center gap-2">
          <RiFolderOpenLine size={20} /> Your Saved Files
        </h2>

        <div className="mb-5">
          <input
            type="text"
            placeholder="Search your files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-emerald-700 text-emerald-300 focus:ring-2 focus:ring-emerald-400 outline-none text-sm sm:text-base"
          />
        </div>

        {loading ? (
          <p className="text-gray-400 text-center sm:text-left">
            Loading your files...
          </p>
        ) : filteredFiles.length === 0 ? (
          <p className="text-gray-400 text-center sm:text-left">
            No files found.
          </p>
        ) : (
          <ul className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredFiles.map((file) => (
              <li
                key={file._id}
                className="bg-gray-900 border border-emerald-700/50 rounded-xl p-4 sm:p-5 flex flex-col justify-between hover:bg-emerald-950/40 transition-all shadow-md"
              >
                <div>
                  <h3 className="text-emerald-400 font-semibold text-base sm:text-lg truncate flex items-center gap-2">
                    <RiFileCodeLine size={18} /> {file.fileName}
                    {file.language === "python" ? ".py" : ".js"}
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Language: {file.language}
                  </p>
                </div>

                <div className="flex justify-between items-center mt-4 gap-2">
                  <button
                    onClick={() =>
                      navigate("/editor", {
                        state: { user, loadFile: file },
                      })
                    }
                    className="flex-1 px-3 py-1.5 bg-emerald-500 text-gray-900 text-sm font-semibold rounded-md hover:bg-emerald-400 transition-all"
                  >
                    Open
                  </button>
                  <button
                    onClick={() => handleDelete(file._id)}
                    className="flex items-center justify-center gap-1 flex-1 px-3 py-1.5 border border-red-500 text-red-400 text-sm rounded-md hover:bg-red-900/40 transition-all"
                  >
                    <RiDeleteBinLine size={16} /> Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* FOOTER */}
      <footer className="text-center py-4 border-t border-emerald-700 bg-gray-900/80 text-xs sm:text-sm text-gray-400">
        © {new Date().getFullYear()} CodeRun — Created with 💚 by Krish
      </footer>
    </main>
  );
}
