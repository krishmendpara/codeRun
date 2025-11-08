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
  RiImageLine,
  RiTimeLine,
  RiCodeSSlashLine,
} from "react-icons/ri";

export default function Home() {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [Allfiles, setAllfiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");

  // Auth Check
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Fetch user files
  useEffect(() => {
    if (!user) return;
    
    axios
      .get("/code/submissions")
      .then((res) => {
        // Handle new backend response format
        const files = res.data.data || res.data;
        setAllfiles(Array.isArray(files) ? files : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching files:", err);
        setLoading(false);
        showMessage("Failed to load files", "error");
      });
  }, [user]);

  // Auto-hide messages
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Show message helper
  const showMessage = (text, type = "info") => {
    setMessage(text);
    setMessageType(type);
  };

  // Delete file
  const handleDelete = async (id, fileName) => {
    if (!window.confirm(`Delete "${fileName}"?`)) return;

    setDeletingId(id);
    try {
      await axios.delete(`/code/submissions/${id}`);
      setAllfiles((prev) => prev.filter((file) => file._id !== id));
      showMessage(`Deleted "${fileName}"`, "success");
    } catch (err) {
      console.error("Delete error:", err);
      showMessage("Failed to delete file", "error");
    } finally {
      setDeletingId(null);
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      await axios.post("/user/logout");
      localStorage.removeItem("token");
      setUser(null);
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
      // Still logout on client side even if API fails
      localStorage.removeItem("token");
      setUser(null);
      navigate("/login");
    }
  };

  // Filter files
  const filteredFiles = Allfiles.filter((f) =>
    f.fileName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-tr from-gray-950 via-gray-900 to-emerald-950 text-gray-200 relative overflow-hidden">
      {/* HEADER */}
      <header className="flex justify-between items-center px-4 sm:px-6 md:px-8 py-4 border-b border-emerald-700/50 bg-gray-900/80 backdrop-blur-md shadow-lg">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-emerald-400 truncate">
            CodeRun Dashboard
          </h1>
          {user && (
            <p className="text-gray-400 text-xs sm:text-sm mt-1 truncate">
              {user.email}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3 ml-4">
          {/* Desktop Buttons */}
          <button
            onClick={() => navigate("/about")}
            className="hidden md:block px-4 py-2 border border-emerald-600 rounded-lg hover:bg-emerald-800/40 text-emerald-400 text-sm font-medium transition-all"
          >
            About
          </button>
          <button
            onClick={() => navigate("/editor", { state: { user } })}
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-emerald-500 text-gray-900 font-semibold rounded-lg hover:bg-emerald-400 transition-all text-sm shadow-lg hover:shadow-emerald-500/50"
          >
            <RiCodeSSlashLine size={18} />
            <span className="hidden md:inline">Open Editor</span>
            <span className="md:hidden">Editor</span>
          </button>

          {/* Desktop Logout Button */}
          <button
            onClick={handleLogout}
            className="hidden md:flex items-center gap-2 px-4 py-2 border border-red-500/50 text-red-400 text-sm rounded-lg hover:bg-red-900/40 hover:border-red-500 transition-all font-medium"
          >
            <RiLogoutBoxLine size={18} />
            Logout
          </button>

          {/* Mobile Menu Icon */}
          <button
            onClick={() => setMenuOpen(true)}
            className="sm:hidden p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-all border border-emerald-700/30"
            aria-label="Open menu"
          >
            <RiMenu3Line size={22} />
          </button>
        </div>
      </header>

      {/* Message Banner */}
      {message && (
        <div
          className={`px-4 sm:px-6 md:px-8 py-3 border-b ${
            messageType === "error"
              ? "bg-red-500/10 border-red-500/30 text-red-400"
              : messageType === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-yellow-500/10 border-yellow-500/30 text-yellow-300"
          } text-sm animate-slideDown`}
        >
          {message}
        </div>
      )}

      {/* BACKDROP (for mobile menu) */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 sm:hidden"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* RIGHT SIDE MENU DRAWER */}
      <div
        className={`fixed top-0 right-0 h-full w-72 sm:w-80 bg-gray-900/98 backdrop-blur-md border-l border-emerald-700/50 shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center px-5 py-4 border-b border-emerald-700/50 bg-gray-800/50">
          <h3 className="text-lg font-semibold text-emerald-400 flex items-center gap-2">
            <RiUser3Line size={20} />
            Profile
          </h3>
          <button
            onClick={() => setMenuOpen(false)}
            className="p-2 text-gray-400 hover:text-emerald-400 hover:bg-gray-800 rounded-lg transition-all"
            aria-label="Close menu"
          >
            <RiCloseLine size={22} />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          {user ? (
            <>
              <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-emerald-700/30">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/50">
                  <RiUser3Line size={24} className="text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-emerald-400 font-semibold text-sm sm:text-base truncate">
                    {user.username || "User"}
                  </p>
                  <p className="text-gray-400 text-xs truncate">{user.email}</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/editor", { state: { user } });
                }}
                className="mt-2 px-4 py-2.5 bg-emerald-500 text-gray-900 font-semibold rounded-lg hover:bg-emerald-400 transition-all text-sm shadow-lg hover:shadow-emerald-500/50 flex items-center justify-center gap-2"
              >
                <RiCodeSSlashLine size={18} />
                Open Editor
              </button>

              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/about");
                }}
                className="px-4 py-2 border border-emerald-600/50 rounded-lg hover:bg-emerald-800/40 hover:border-emerald-600 text-emerald-400 text-sm font-medium transition-all"
              >
                About / Help
              </button>

              <hr className="border-emerald-700/40 my-2" />

              <button
                onClick={() => {
                  setMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center justify-center gap-2 px-4 py-2 border border-red-500/50 text-red-400 text-sm rounded-lg hover:bg-red-900/40 hover:border-red-500 transition-all font-medium"
              >
                <RiLogoutBoxLine size={18} /> Logout
              </button>
            </>
          ) : (
            <p className="text-gray-400 text-sm text-center py-4">
              No user info available
            </p>
          )}
        </div>
      </div>

      {/* FILES SECTION */}
      <section className="flex-1 px-4 sm:px-6 md:px-8 py-6 sm:py-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-emerald-400 flex items-center gap-2">
              <RiFolderOpenLine size={24} />
              <span>Your Files</span>
              {!loading && (
                <span className="text-sm text-gray-400 font-normal">
                  ({filteredFiles.length})
                </span>
              )}
            </h2>

            <button
              onClick={() => navigate("/editor", { state: { user } })}
              className="sm:hidden px-4 py-2 bg-emerald-500 text-gray-900 font-semibold rounded-lg hover:bg-emerald-400 transition-all text-sm shadow-lg flex items-center justify-center gap-2"
            >
              <RiCodeSSlashLine size={18} />
              New File
            </button>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="🔍 Search files by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-emerald-700/50 text-emerald-300 placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm sm:text-base transition-all"
            />
          </div>

          {/* Files Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
              <p>Loading your files...</p>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <RiFolderOpenLine size={64} className="mb-4 opacity-30" />
              <p className="text-lg mb-2">
                {searchTerm ? "No files found" : "No files yet"}
              </p>
              <p className="text-sm mb-6">
                {searchTerm
                  ? "Try a different search term"
                  : "Create your first file in the editor"}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => navigate("/editor", { state: { user } })}
                  className="px-6 py-2 bg-emerald-500 text-gray-900 font-semibold rounded-lg hover:bg-emerald-400 transition-all shadow-lg"
                >
                  Open Editor
                </button>
              )}
            </div>
          ) : (
            <ul className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredFiles.map((file) => (
                <li
                  key={file._id}
                  className="bg-gray-900/80 border border-emerald-700/40 rounded-xl p-4 flex flex-col justify-between hover:bg-emerald-950/40 hover:border-emerald-600/60 transition-all shadow-lg hover:shadow-emerald-900/50 group"
                >
                  {/* File Header */}
                  <div className="mb-3">
                    <h3 className="text-emerald-400 font-semibold text-base sm:text-lg truncate flex items-center gap-2 mb-2 group-hover:text-emerald-300 transition-colors">
                      <RiFileCodeLine size={20} className="flex-shrink-0" />
                      <span className="truncate">
                        {file.fileName}
                        <span className="text-gray-500 text-sm ml-1">
                          {file.language?.toLowerCase() === "python" ? ".py" : ".js"}
                        </span>
                      </span>
                    </h3>

                    {/* File Metadata */}
                    <div className="flex flex-wrap gap-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1 bg-gray-800/50 px-2 py-1 rounded">
                        <RiCodeSSlashLine size={14} />
                        {file.language || "Unknown"}
                      </span>
                      
                      {file.executionTime && (
                        <span className="flex items-center gap-1 bg-gray-800/50 px-2 py-1 rounded">
                          <RiTimeLine size={14} />
                          {file.executionTime}
                        </span>
                      )}
                      
                      {file.graph && (
                        <span className="flex items-center gap-1 bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded border border-emerald-500/30">
                          <RiImageLine size={14} />
                          Graph
                        </span>
                      )}
                    </div>

                    {/* Output Preview */}
                    {file.output && (
                      <p className="mt-2 text-xs text-gray-500 line-clamp-2 bg-gray-950/50 p-2 rounded border border-gray-800">
                        {file.output}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-auto">
                    <button
                      onClick={() =>
                        navigate("/editor", {
                          state: { user, loadFile: file },
                        })
                      }
                      className="flex-1 px-3 py-2 bg-emerald-500 text-gray-900 text-sm font-semibold rounded-lg hover:bg-emerald-400 transition-all shadow-md hover:shadow-emerald-500/50"
                    >
                      Open
                    </button>
                    <button
                      onClick={() => handleDelete(file._id, file.fileName)}
                      disabled={deletingId === file._id}
                      className={`flex items-center justify-center gap-1 px-3 py-2 border text-sm rounded-lg transition-all ${
                        deletingId === file._id
                          ? "border-gray-600 text-gray-500 cursor-not-allowed"
                          : "border-red-500/50 text-red-400 hover:bg-red-900/40 hover:border-red-500"
                      }`}
                    >
                      {deletingId === file._id ? (
                        <div className="w-4 h-4 border-2 border-gray-500/30 border-t-gray-500 rounded-full animate-spin" />
                      ) : (
                        <>
                          <RiDeleteBinLine size={16} />
                          <span className="hidden sm:inline">Delete</span>
                        </>
                      )}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="text-center py-4 border-t border-emerald-700/50 bg-gray-900/80 text-xs sm:text-sm text-gray-400">
        <p>
          © {new Date().getFullYear()} CodeRun — Created with{" "}
          <span className="text-emerald-400">💚</span> by Krish
        </p>
      </footer>
    </main>
  );
}