import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_SERVER } from "../config";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_SERVER}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("Registration successful! Redirecting...");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setMessage(data.message);
      }
    } catch (err) {
      setMessage("Server error. Please try again later.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-120px)] bg-[var(--color-surface)] px-4">
      <div className="bg-[var(--color-surface-elevated)] p-8 rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] w-full max-w-md border border-[var(--color-border)]">
        <h1 className="text-2xl font-bold text-center text-[var(--color-text)] mb-6">
          Create an account
        </h1>

        {message && (
          <p
            className={`text-center text-sm mb-4 py-2 px-3 rounded-lg ${
              message.includes("successful") ? "text-green-700 bg-green-50" : "text-red-600 bg-red-50"
            }`}
          >
            {message}
          </p>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 border border-[var(--color-border)] rounded-[var(--radius)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent bg-[var(--color-surface)]"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            Register
          </button>
        </form>

        <p className="text-center text-[var(--color-text-muted)] mt-5 text-sm">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-[var(--color-primary)] font-semibold hover:underline"
          >
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
