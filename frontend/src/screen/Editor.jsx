import React, { useState, useEffect, useContext } from "react";
import {
  RiSaveLine,
  RiFileCodeLine,
  RiPlayLine,
  RiFolderOpenLine,
  RiImageLine,
  RiCloseLine,
  RiDownloadLine,
} from "react-icons/ri";
import { UserContext } from "../context/UserContext";
import axios from "../config/axios";
import { useNavigate, useLocation } from "react-router-dom";
import Editor from "@monaco-editor/react";

export default function CodeEditor() {
  const location = useLocation();
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  // STATES
  const [language, setLanguage] = useState("python");
  const [fileName, setFileName] = useState("");
  const [savedFiles, setSavedFiles] = useState([]);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [executionTime, setExecutionTime] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [isRunning, setIsRunning] = useState(false);
  const [graph, setGraph] = useState(null);
  const [showGraphModal, setShowGraphModal] = useState(false);

  const [code, setCode] = useState({
    python: `# Write Python code here
print("Hello, CodeRun!");`,
    javascript: "// Write JavaScript code here\nconsole.log('Hello, CodeRun!');",
  });

  const file = location.state?.loadFile || null;

  //Auth Check
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !user) navigate("/login");
  }, [user, navigate]);

  //Fetch Saved Files
  useEffect(() => {
    axios
      .get("/code/submissions")
      .then((res) => {
        const submissions = res.data.data || res.data;
        setSavedFiles(submissions);
      })
      .catch((err) => console.error("Error fetching files:", err));
  }, []);

  //Auto Hide Messages
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  //Load File
  useEffect(() => {
    if (file) {
      setLanguage(file.language.toLowerCase());
      setCode((prev) => ({ ...prev, [file.language.toLowerCase()]: file.code }));
      setFileName(file.fileName);
      if (file.graph) {
        setGraph(file.graph);
      }
    }
  }, [file]);

  //Run Code
  const runCode = async () => {
    setIsRunning(true);
    setOutput("");
    setError("");
    setGraph(null);
    setExecutionTime("");

    try {
      const res = await axios.post("/code/run", {
        language: language === "python" ? "Python" : "JavaScript",
        code: code[language],
      });

      setOutput(res.data.output || "");
      setExecutionTime(res.data.executionTime || "");
      setError(res.data.error || "");

      // Check if graph was generated
      if (res.data.hasGraph && res.data.graph) {
        setGraph(res.data.graph);
        setMessage("Code executed with graph!");
        setMessageType("success");
      } else if (res.data.output) {
        setMessage("Code executed successfully!");
        setMessageType("success");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Execution failed");
      setMessage("Execution failed");
      setMessageType("error");
    } finally {
      setIsRunning(false);
    }
  };

  //Save File
  const saveFile = async () => {
    if (!fileName.trim()) {
      setMessage("Please enter a file name.");
      setMessageType("error");
      return;
    }

    try {
      const res = await axios.post("/code/save", {
        code: code[language],
        language: language === "python" ? "Python" : "JavaScript",
        fileName,
        output,
        error,
        executionTime,
        graph: graph || null,
      });

      const savedFile = res.data.data || res.data;
      setSavedFiles((prev) => [...prev, savedFile]);
      setMessage(`Saved "${fileName}"`);
      setMessageType("success");
      setFileName("");
    } catch (err) {
      setMessage(err.response?.data?.message || "Error saving file");
      setMessageType("error");
    }
  };

  //Load File
  const loadFile = (file) => {
    const lang = file.language.toLowerCase();
    setLanguage(lang);
    setCode((prev) => ({ ...prev, [lang]: file.code }));
    setFileName(file.fileName);
    setOutput(file.output || "");
    setError(file.error || "");
    setExecutionTime(file.executionTime || "");
    setGraph(file.graph || null);
    setMessage(`Loaded ${file.fileName}`);
    setMessageType("info");
  };

  //Download Graph
  const downloadGraph = () => {
    if (!graph) return;
    const link = document.createElement("a");
    link.href = graph;
    link.download = `graph_${fileName || "output"}.png`;
    link.click();
  };

  return (
    <main className="min-h-screen bg-gradient-to-tr from-gray-950 via-gray-900 to-emerald-950 p-2 sm:p-3 md:p-4">
      <div className="max-w-7xl mx-auto rounded-xl sm:rounded-2xl shadow-2xl border border-emerald-700/40 bg-gray-900/70 backdrop-blur-xl overflow-hidden">
        {/* HEADER */}
        <header className="flex flex-col gap-2 sm:gap-3 p-3 sm:p-4 border-b border-emerald-700/40 bg-gray-800/50">
          {/* Language Buttons */}
          <div className="flex gap-2 justify-center flex-wrap">
            {["python", "javascript"].map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 sm:gap-2 transition-all ${
                  language === lang
                    ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/50"
                    : "text-emerald-400 hover:bg-gray-700 border border-emerald-700/30"
                }`}
              >
                <RiFileCodeLine size={16} className="sm:w-[18px] sm:h-[18px]" />
                {lang.toUpperCase()}
              </button>
            ))}
          </div>

          {/* File Input + Save button */}
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Enter file name..."
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="flex-1 px-3 py-2 bg-gray-900 border border-emerald-600/50 rounded-lg text-emerald-300 text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />

            <button
              onClick={saveFile}
              className="px-4 py-2 bg-emerald-500 text-black text-sm rounded-lg font-semibold flex items-center gap-2 hover:bg-emerald-400 transition-all shadow-lg hover:shadow-emerald-500/50 justify-center"
            >
              <RiSaveLine size={18} />
              <span>Save</span>
            </button>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`text-sm px-3 py-2 rounded-lg border ${
                messageType === "error"
                  ? "text-red-400 bg-red-500/10 border-red-500/30"
                  : messageType === "success"
                  ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
                  : "text-yellow-300 bg-yellow-500/10 border-yellow-500/30"
              }`}
            >
              {message}
            </div>
          )}
        </header>

        {/* BODY */}
        <div className="flex flex-col lg:flex-row">
          {/* EDITOR SECTION */}
          <section className="flex-1 p-3 sm:p-4">
            {/* Editor */}
            <div className="border border-emerald-700/40 rounded-lg sm:rounded-xl overflow-hidden shadow-inner h-[50vh] sm:h-[60vh] lg:h-[70vh]">
              <Editor
                height="100%"
                theme="vs-dark"
                language={language}
                value={code[language]}
                onChange={(value) =>
                  setCode((prev) => ({ ...prev, [language]: value || "" }))
                }
                options={{
                  minimap: { enabled: window.innerWidth > 768 },
                  fontSize: window.innerWidth < 640 ? 12 : 14,
                  automaticLayout: true,
                  scrollBeyondLastLine: false,
                  wordWrap: "on",
                }}
              />
            </div>

            {/* RUN BUTTON */}
            <div className="flex justify-end mt-3">
              <button
                onClick={runCode}
                disabled={isRunning}
                className={`px-6 py-2.5 rounded-lg font-semibold flex items-center gap-2 shadow-lg transition-all ${
                  isRunning
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                    : "bg-emerald-500 hover:bg-emerald-400 text-black hover:shadow-emerald-500/50"
                }`}
              >
                <RiPlayLine size={18} className={isRunning ? "animate-spin" : ""} />
                {isRunning ? "Running..." : "Run Code"}
              </button>
            </div>
          </section>

          {/* OUTPUT + FILES SIDEBAR */}
          <aside className="w-full lg:w-[380px] border-t lg:border-l lg:border-t-0 border-emerald-700/40 bg-gray-900/60 p-3 sm:p-4 flex flex-col gap-4 max-h-[70vh] lg:max-h-none overflow-y-auto">
            {/* OUTPUT */}
            <div className="border border-emerald-700/40 rounded-lg p-3 bg-gray-950/50">
              <h2 className="text-emerald-400 font-bold mb-3 flex items-center gap-2 text-sm sm:text-base">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                Output
              </h2>

              <pre className="bg-gray-950 p-3 rounded-lg text-green-300 font-mono text-xs sm:text-sm max-h-[200px] overflow-auto border border-gray-800">
                {error ? (
                  <span className="text-red-400">{error}</span>
                ) : output ? (
                  <>
                    {output}
                    {executionTime && (
                      <p className="text-emerald-400 font-bold mt-2 pt-2 border-t border-gray-800">
                        ⚡ Executed in {executionTime}
                      </p>
                    )}
                  </>
                ) : (
                  <span className="text-gray-500">No output yet. Run your code!</span>
                )}
              </pre>
            </div>

            {/* GRAPH PREVIEW */}
            {graph && (
              <div className="border border-emerald-700/40 rounded-lg p-3 bg-gray-950/50">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-emerald-400 font-bold flex items-center gap-2 text-sm sm:text-base">
                    <RiImageLine size={18} />
                    Graph Output
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={downloadGraph}
                      className="p-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-md transition-all"
                      title="Download Graph"
                    >
                      <RiDownloadLine size={16} />
                    </button>
                    <button
                      onClick={() => setShowGraphModal(true)}
                      className="px-2 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-md text-xs font-semibold transition-all"
                    >
                      Expand
                    </button>
                  </div>
                </div>
                <div className="bg-white rounded-lg overflow-hidden">
                  <img
                    src={graph}
                    alt="Generated Graph"
                    className="w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setShowGraphModal(true)}
                  />
                </div>
              </div>
            )}

            {/* RECENT FILES */}
            <div className="border border-emerald-700/40 rounded-lg p-3 bg-gray-950/50">
              <h3 className="text-emerald-400 font-semibold mb-3 flex items-center gap-2 text-sm sm:text-base">
                <RiFolderOpenLine size={18} />
                Recent Files
              </h3>

              {savedFiles.length === 0 ? (
                <p className="text-gray-400 text-center text-xs sm:text-sm py-4">
                  No files saved yet
                </p>
              ) : (
                <ul className="space-y-2 max-h-[200px] overflow-y-auto">
                  {savedFiles.slice(-8).reverse().map((file) => (
                    <li key={file._id}>
                      <button
                        onClick={() => loadFile(file)}
                        className="w-full text-left px-3 py-2 bg-gray-900 text-emerald-300 hover:bg-emerald-700/20 border border-emerald-800/50 hover:border-emerald-600 rounded-lg text-xs sm:text-sm flex items-center gap-2 transition-all group"
                      >
                        <RiFileCodeLine size={16} className="text-emerald-500 group-hover:text-emerald-400" />
                        <span className="truncate flex-1">
                          {file.fileName}
                          <span className="text-gray-500 ml-1">
                            {file.language.toLowerCase() === "python" ? ".py" : ".js"}
                          </span>
                        </span>
                        {file.graph && (
                          <RiImageLine size={14} className="text-emerald-400" title="Has graph" />
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* GRAPH MODAL */}
      {showGraphModal && graph && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowGraphModal(false)}
        >
          <div
            className="bg-gray-900 rounded-xl max-w-5xl w-full max-h-[90vh] overflow-auto border border-emerald-700/40 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-emerald-700/40 sticky top-0 bg-gray-900 z-10">
              <h3 className="text-emerald-400 font-bold text-lg flex items-center gap-2">
                <RiImageLine size={22} />
                Graph Output
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={downloadGraph}
                  className="p-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded-lg transition-all"
                  title="Download"
                >
                  <RiDownloadLine size={20} />
                </button>
                <button
                  onClick={() => setShowGraphModal(false)}
                  className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all"
                >
                  <RiCloseLine size={20} />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-4 bg-white">
              <img src={graph} alt="Full Graph" className="w-full h-auto" />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}