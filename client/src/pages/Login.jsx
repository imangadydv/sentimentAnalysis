import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_SERVER } from "../config";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_SERVER}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.token);
        navigate("/");
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Server error. Please try again later.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-120px)] bg-[var(--color-surface)] px-4">
      <div className="bg-[var(--color-surface-elevated)] p-8 rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] w-full max-w-md border border-[var(--color-border)]">
        <h1 className="text-2xl font-bold text-center text-[var(--color-text)] mb-6">
          Welcome back
        </h1>

        {error && (
          <p className="text-red-600 text-sm text-center mb-4 bg-red-50 py-2 px-3 rounded-lg">
            {error}
          </p>
        )}

        <form className="space-y-4" onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 border border-[var(--color-border)] rounded-[var(--radius)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent bg-[var(--color-surface)]"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-[var(--color-border)] rounded-[var(--radius)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent bg-[var(--color-surface)]"
          />

          <button
            type="submit"
            className="w-full bg-[var(--color-primary)] text-white py-3 rounded-[var(--radius)] hover:bg-[var(--color-primary-hover)] transition duration-300 font-semibold"
          >
            Login
          </button>
        </form>

        <p className="text-center text-[var(--color-text-muted)] mt-5 text-sm">
          Don&apos;t have an account?{" "}
          <Link
            to="/register"
            className="text-[var(--color-primary)] font-semibold hover:underline"
          >
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
