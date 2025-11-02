import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../config/axios.js";
import { UserContext } from "../context/UserContext.jsx";

export default function Register() {
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit =(e) => {
    e.preventDefault();

    axios
      .post("/user/register", { username, email, password })
      .then(async (res) => {
        localStorage.setItem("token", res.data.token);
      await setUser(res.data.user);
       setTimeout(() => navigate("/"), 100);
      })
      .catch((err) => {
        setMessage(err.response?.data?.message || "Registration failed");
      });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-tr from-gray-950 via-gray-900 to-emerald-950 px-4 sm:px-6 lg:px-8">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-gray-900/80 border border-emerald-700/50 rounded-3xl shadow-2xl p-6 sm:p-8 backdrop-blur-md"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-emerald-400">
          Create Account
        </h2>

        {message && (
          <div className="text-red-400 text-center mb-3 text-sm sm:text-base">
            {message}
          </div>
        )}

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full mb-4 p-3 rounded-md bg-gray-950 border border-emerald-700 text-emerald-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm sm:text-base"
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 p-3 rounded-md bg-gray-950 border border-emerald-700 text-emerald-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm sm:text-base"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-6 p-3 rounded-md bg-gray-950 border border-emerald-700 text-emerald-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm sm:text-base"
          required
        />

        <button
          type="submit"
          className="w-full py-3 bg-emerald-500 text-gray-900 font-semibold rounded-lg shadow-md hover:bg-emerald-400 transition-all text-sm sm:text-base"
        >
          Sign Up
        </button>

        <p className="text-center text-sm sm:text-base mt-5 text-gray-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-emerald-400 hover:underline font-medium"
          >
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
