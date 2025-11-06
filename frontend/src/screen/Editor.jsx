import React, { useState, useEffect, useContext } from "react";
import {
  RiSaveLine,
  RiFileCodeLine,
  RiPlayLine,
  RiFolderOpenLine,
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

  const [code, setCode] = useState({
    python: "# Write Python code here\nprint('Hello, CodeRun!')",
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
      .then((res) => setSavedFiles(res.data))
      .catch((err) => console.error("Error fetching files:", err));
  }, []);

  //Auto Hide Messages
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 2500);
      return () => clearTimeout(timer);
    }
  }, [message]);

  //Load File
  useEffect(() => {
    if (file) {
      setLanguage(file.language);
      setCode((prev) => ({ ...prev, [file.language]: file.code }));
      setFileName(file.fileName);
    }
  }, [file]);

  //Run Code
  const runCode = () => {
    axios
      .post("/code/run", { language, code: code[language] })
      .then((res) => {
        setOutput(res.data.output || "");
        setExecutionTime(res.data.executionTime || "");
        setError(res.data.error || "");
      })
      .catch((err) => setError(err.response?.data?.error || "Execution failed"));
  };

  //Save File
  const saveFile = () => {
    if (!fileName.trim()) {
      setMessage("Please enter a file name.");
      setMessageType("error");
      return;
    }

    axios
      .post("/code/save", {
        code: code[language],
        language,
        user,
        fileName,
        output,
        error,
        executionTime,
      })
      .then((res) => {
        setSavedFiles((prev) => [...prev, res.data]);
        setMessage(`Saved "${res.data.fileName}" (${res.data.language})`);
        setMessageType("success");
        setFileName("");
      })
      .catch((err) => {
        setMessage(err.response?.data?.message || "Error saving file");
        setMessageType("error");
      });
  };

  //Load File
  const loadFile = (file) => {
    setLanguage(file.language);
    setCode((prev) => ({ ...prev, [file.language]: file.code }));
    setFileName(file.fileName);
    setMessage(`Loaded ${file.fileName}`);
    setMessageType("info");
  };

  return (
    <main className="min-h-screen bg-gradient-to-tr from-gray-950 via-gray-900 to-emerald-950 p-3 sm:p-4">
      <div className="max-w-7xl mx-auto rounded-2xl shadow-xl border border-emerald-700/40 bg-gray-900/70 backdrop-blur-xl">

        {/* HEADER */}
        <header className="flex flex-col gap-3 p-4 border-b border-emerald-700/40 bg-gray-800/50">

          {/* Language Buttons */}
          <div className="flex gap-2 justify-center flex-wrap">
            {["python", "javascript"].map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition ${
                  language === lang
                    ? "bg-emerald-500 text-black"
                    : "text-emerald-400 hover:bg-gray-700"
                }`}
              >
                <RiFileCodeLine size={18} />
                {lang.toUpperCase()}
              </button>
            ))}
          </div>

          {/* File Input + Save button (mobile optimized) */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">

            {/* FILENAME INPUT */}
            <input
              type="text"
              placeholder="File Name"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="flex-1 px-3 py-2 bg-gray-900 border border-emerald-600 rounded-lg text-emerald-300 text-sm"
            />

            {/* SMALL SAVE BUTTON ON MOBILE */}
            <button
              onClick={saveFile}
              className="px-3 py-2 bg-emerald-500 text-black text-sm rounded-lg font-semibold flex items-center gap-1 hover:bg-emerald-400 sm:px-4 sm:py-2 sm:text-base w-full sm:w-auto justify-center"
            >
              <RiSaveLine size={16} />
              <span className="hidden sm:inline">Save</span>
              <span className="sm:hidden">Save</span>
            </button>
          </div>
        </header>

        {/* BODY */}
        <div className="flex flex-col lg:flex-row">

          {/* EDITOR */}
          <section className="flex-1 p-4">
            <div className="border border-emerald-700/40 rounded-xl overflow-hidden shadow-inner h-[60vh] sm:h-[70vh] lg:h-[75vh]">
              <Editor
                height="100%"
                theme="vs-dark"
                language={language}
                value={code[language]}
                onChange={(value) =>
                  setCode((prev) => ({ ...prev, [language]: value }))
                }
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  automaticLayout: true,
                }}
              />
            </div>

            {/* RUN + MESSAGE */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-3 gap-2">

              {message && (
                <p
                  className={`text-sm ${
                    messageType === "error"
                      ? "text-red-400"
                      : messageType === "success"
                      ? "text-emerald-400"
                      : "text-yellow-300"
                  }`}
                >
                  {message}
                </p>
              )}

              <button
                onClick={runCode}
                className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded-lg font-semibold flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                <RiPlayLine size={18} /> Run
              </button>
            </div>
          </section>

          {/* OUTPUT + RECENT FILES */}
          <aside className="w-full lg:w-[350px] border-t lg:border-l border-emerald-700/40 bg-gray-900/60 p-4">

            {/* OUTPUT */}
            <div className="border-b border-emerald-700/40 pb-3 mb-4">
              <h2 className="text-emerald-400 font-bold mb-3 flex items-center gap-2">
                Output
              </h2>

              <pre className="bg-gray-950 p-4 rounded-lg text-green-300 font-mono text-sm max-h-[250px] overflow-auto">
                {error ? (
                  <span className="text-red-400">{error}</span>
                ) : (
                  <>
                    {output}
                    {executionTime && (
                      <p className="text-emerald-400 font-bold mt-2">
                        Executed in {executionTime}
                      </p>
                    )}
                  </>
                )}
              </pre>
            </div>

            {/* RECENT FILES */}
            <div>
              <h3 className="text-emerald-400 font-semibold mb-3 flex items-center gap-2">
                <RiFolderOpenLine size={20} /> Recent Files
              </h3>

              {savedFiles.length === 0 ? (
                <p className="text-gray-400 text-center text-sm">No files saved yet</p>
              ) : (
                <ul className="space-y-2">
                  {savedFiles.slice(-5).map((file) => (
                    <li key={file._id}>
                      <button
                        onClick={() => loadFile(file)}
                        className="w-full text-left px-3 py-2 bg-gray-900 text-emerald-300 hover:bg-emerald-700/20 border border-emerald-800 rounded-lg text-sm flex items-center gap-2"
                      >
                        <RiFileCodeLine size={16} />
                        {file.fileName}
                        {file.language === "python" ? ".py" : ".js"}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
