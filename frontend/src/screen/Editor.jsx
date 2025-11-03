import React, { useState, useEffect, useContext } from "react";
import {
  RiSaveLine,
  RiFileCodeLine,
  RiPlayLine,
  RiArrowLeftLine,
  RiAlertLine,
  RiFolderOpenLine,
  RiHome4Line,
} from "react-icons/ri";
import { UserContext } from "../context/UserContext";
import axios from "../config/axios.js";
import { useNavigate, useLocation } from "react-router-dom";

export default function Editor() {
  const location = useLocation();
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState({
    python: "# Write Python code here\nprint('Hello, CodeRun!')",
    javascript: "// Write JavaScript code here\nconsole.log('Hello, CodeRun!');",
  });
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [executionTime, setExecutionTime] = useState("");
  const [fileName, setFileName] = useState("");
  const [savedFiles, setSavedFiles] = useState([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [file, setFile] = useState(location.state?.loadFile || null);
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !user) navigate("/login");
  }, [user, navigate]);

  useEffect(() => {
    axios
      .get("/code/submissions")
      .then((res) => setSavedFiles(res.data))
      .catch((err) => console.error("Error fetching files:", err));
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const runCode = () => {
    axios
      .post("/code/run", { language, code: code[language] })
      .then((res) => {

        setOutput(res.data.output);
        setExecutionTime(res.data.executionTime);
        setError(res.data.error);
        console.log(res.data)
      })
      .catch((err) => setOutput(err.response?.data?.error || "Execution error"));
  };

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
        executionTime:
          typeof executionTime === "string"
            ? parseFloat(executionTime.replace(" ms", "")) || 0
            : executionTime,
      })
      .then((res) => {
        const savedFile = res.data;
        setSavedFiles((prev) => [...prev, savedFile]);
        setMessage(`Saved "${savedFile.fileName}" (${savedFile.language})`);
        setMessageType("success");
        setFileName("");
      })
      .catch((err) => {
        console.error(err);
        setMessage(err.response?.data?.message || "Error saving file");
        setMessageType("error");
      });
  };

  useEffect(() => {
    if (file) {
      setLanguage(file.language);
      setCode((prev) => ({ ...prev, [file.language]: file.code }));
      setFileName(file.fileName);
    }
  }, [file]);

  const loadFile = (file) => {
    setLanguage(file.language.toLowerCase());
    setCode((prev) => ({ ...prev, [file.language.toLowerCase()]: file.code }));
    setFileName(file.fileName);
    setMessage(`Loaded "${file.fileName}" (${file.language})`);
    setMessageType("info");
  };

  return (
    <main className="min-h-screen bg-linear-to-tr from-gray-950 via-gray-900 to-emerald-950 p-3 sm:p-6">


      <div className="max-w-7xl mx-auto flex flex-col rounded-2xl sm:rounded-3xl shadow-2xl border border-emerald-700/40 bg-gray-900/70 backdrop-blur-xl overflow-hidden h-auto md:h-[90vh]">

        {/* HEADER */}
        <header className="flex flex-col sm:flex-row justify-between items-center px-4 sm:px-6 py-3 border-b border-emerald-600 bg-gray-800/70 gap-3">
          <div className="flex flex-wrap gap-2">
            {["python", "javascript"].map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${language === lang
                  ? "bg-emerald-500 text-black shadow-md"
                  : "text-emerald-400 hover:bg-gray-700 hover:text-emerald-300"
                  }`}
              >
                <RiFileCodeLine size={18} />
                {lang.charAt(0).toUpperCase() + lang.slice(1)}
              </button>
            ))}
          </div>

          {/*File name + buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="File name"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="rounded-md px-3 py-2 bg-gray-900 text-emerald-400 border border-emerald-700 focus:ring-2 focus:ring-emerald-400 outline-none flex-1 sm:w-56 text-sm"
            />
            <button
              onClick={saveFile}
              className="px-4 py-2 bg-emerald-500 text-gray-900 font-semibold rounded-lg shadow-md hover:bg-emerald-400 transition-all flex items-center gap-1 text-sm"
            >
              <RiSaveLine size={18} />
              Save
            </button>

          </div>
        </header>

        {/* EDITOR & OUTPUT */}
        <div className="flex flex-col md:flex-row flex-1">
          <section className="flex flex-col flex-1 p-4 sm:p-6">
            <textarea
              spellCheck={false}
              className="flex-1 resize-none bg-gray-950 text-emerald-300 font-mono text-sm sm:text-base rounded-lg p-4 sm:p-6 focus:ring-4 focus:ring-emerald-500/40 outline-none min-h-[250px]"
              value={code[language]}
              onChange={(e) =>
                setCode((prev) => ({ ...prev, [language]: e.target.value }))
              }
              placeholder={`Write ${language.toUpperCase()} code...`}
            />

            <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-2">
              {message && (
                <div
                  className={`flex items-center gap-2 text-sm ${messageType === "success"
                    ? "text-emerald-400"
                    : messageType === "error"
                      ? "text-red-400"
                      : "text-amber-400"
                    }`}
                >
                  {messageType === "error" ? (
                    <RiAlertLine size={18} />
                  ) : messageType === "success" ? (
                    <RiSaveLine size={18} />
                  ) : (
                    <RiFolderOpenLine size={18} />
                  )}
                  {message}
                </div>
              )}
              <button
                onClick={runCode}
                className="px-6 py-2 bg-emerald-500 text-gray-900 font-semibold rounded-lg shadow-md hover:bg-emerald-400 transition-all flex items-center gap-2 text-sm"
              >
                <RiPlayLine size={18} />
                Run
              </button>
            </div>
          </section>

          {/*OUTPUT PANEL */}
          <aside className="w-full md:w-[400px] bg-gray-850 border-t md:border-t-0 md:border-l border-emerald-700/50 flex flex-col">
            <div className="p-4 sm:p-6 border-b border-emerald-700/40">
              <h2 className="text-emerald-400 font-semibold mb-3 text-lg flex items-center gap-2">
                <RiFileCodeLine size={20} />
                {error || '' ? (
                  
                   <span className="text-red-400">Error!!</span>
                ) : (
                  <span>Output</span>
                )}

              </h2>
              <pre className="whitespace-pre-wrap text-green-300 bg-gray-950 p-4 rounded-lg border border-emerald-700 text-sm sm:text-base font-mono leading-relaxed min-h-[250px] max-h-[350px] overflow-auto">
                {output ? output : error}
          
                  {output? (
                     <b>Executed in {executionTime}</b>
                  ): <p></p>}
                 
             


              </pre>
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto flex-1">
              <h3 className="text-emerald-400 font-semibold mb-3 text-center text-base sm:text-lg flex items-center justify-center gap-2">
                <RiFolderOpenLine size={20} /> Recent Files
              </h3>
              {savedFiles.length === 0 ? (
                <p className="text-gray-400 text-sm text-center">
                  No files saved yet
                </p>
              ) : (
                <ul className="space-y-2">
                  {savedFiles.slice(-5).map((file) => (
                    <li key={file._id}>
                      <button
                        onClick={() => loadFile(file)}
                        className="w-full text-left px-3 py-2 bg-gray-900 hover:bg-emerald-600/20 rounded-lg transition text-emerald-300 text-sm truncate border border-emerald-800 flex items-center gap-2"
                      >
                        <RiFileCodeLine size={16} />
                        <span>
                          {file.fileName}
                          {file.language === "python" ? ".py" : ".js"}
                        </span>
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
