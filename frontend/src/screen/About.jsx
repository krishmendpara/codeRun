import React from "react";

export default function About() {
  return (
    <main className="min-h-screen bg-linear-to-tr from-gray-900 via-gray-800 to-emerald-900 py-10 px-4 sm:px-8 md:px-12 flex items-center justify-center">
      <div className="w-full max-w-4xl bg-gray-900/90 backdrop-blur-md border border-emerald-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 shadow-lg text-gray-300">
        {/* Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-center text-emerald-400 mb-8">
          About <span className="text-teal-300">CodeRun</span>
        </h1>

        {/* What is CodeRun */}
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-teal-400 mb-2">
            What is CodeRun?
          </h2>
          <p className="leading-relaxed text-gray-300 text-sm sm:text-base">
            CodeRun is a browser-based coding platform that lets you instantly run
            Python and JavaScript code. It’s designed to be a fast, convenient tool
            for learning, prototyping, and sharing small code examples — no setup
            required.
          </p>
        </section>

        {/* Key Features */}
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-teal-400 mb-2">
            Key Features
          </h2>
          <ul className="list-disc list-inside text-gray-300 space-y-1 text-sm sm:text-base">
            <li>In-browser code execution for Python and JavaScript</li>
            <li>Clean, distraction-free interface with dark mode</li>
            <li>Syntax-highlighted editor using Monaco/CodeMirror</li>
            <li>Shareable links for code snippets (coming soon)</li>
          </ul>
        </section>

        {/* Technologies */}
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-teal-400 mb-2">
            Technologies Used
          </h2>
          <p className="leading-relaxed text-gray-300 text-sm sm:text-base">
            CodeRun is built with <span className="text-emerald-400 font-semibold">React</span>, 
            <span className="text-emerald-400 font-semibold"> Tailwind CSS</span>, and a
            custom backend for secure code execution and data persistence. It
            focuses on speed, simplicity, and modern UX principles.
          </p>
        </section>

        {/* Help Section */}
        <section>
          <h2 className="text-xl sm:text-2xl font-semibold text-teal-400 mb-2">
            Need Help?
          </h2>
          <p className="leading-relaxed text-gray-300 text-sm sm:text-base">
            Have feedback or questions? Reach out via the contact form or email us below.
            We appreciate your support in making CodeRun better!
          </p>
          <p className="mt-3 font-mono text-teal-300 text-sm sm:text-base break-all">
            contact@coderun.example
          </p>
        </section>
      </div>
    </main>
  );
}
