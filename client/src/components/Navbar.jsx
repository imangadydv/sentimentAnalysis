import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

const THEME_KEY = "sentiment_theme";

const Navbar = () => {
  const location = useLocation();
  const [user, setUser] = useState(!!localStorage.getItem("token"));
  const [dark, setDark] = useState(() => localStorage.getItem(THEME_KEY) === "dark");

  useEffect(() => {
    const value = dark ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", value);
    localStorage.setItem(THEME_KEY, value);
  }, [dark]);

  // Re-check auth when route changes (e.g. after login/register) so Navbar updates without refresh
  useEffect(() => {
    setUser(!!localStorage.getItem("token"));
  }, [location.pathname]);

  // Also listen for storage events (e.g. logout in another tab)
  useEffect(() => {
    const checkAuth = () => setUser(!!localStorage.getItem("token"));
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(false);
  };

  const toggleTheme = () => setDark((d) => !d);

  return (
    <nav className="bg-[var(--color-nav)] text-white shadow-[var(--shadow-md)]">
      <div className="container mx-auto flex justify-between items-center px-4 py-3 max-w-6xl">
        <Link
          to="/"
          className="text-lg font-bold tracking-tight hover:opacity-90 transition-opacity"
        >
          <span className="text-amber-300">Sentiment</span>
          <span className="text-white"> Analysis</span>
        </Link>

        <ul className="flex items-center gap-1 sm:gap-2">
          <li>
            <button
              type="button"
              onClick={toggleTheme}
              className="px-2 py-1.5 rounded-lg text-sm font-medium text-white/90 hover:bg-white/10 transition"
              title={dark ? "Switch to light" : "Switch to dark"}
              aria-label="Toggle theme"
            >
              {dark ? "☀️" : "🌙"}
            </button>
          </li>
          <li>
            <Link
              to="/sentiment"
              className="px-3 py-2 rounded-lg text-sm font-medium text-white/90 hover:bg-white/10 hover:text-white transition"
            >
              Analysis
            </Link>
          </li>

          {user ? (
            <>
              <li>
                <Link
                  to="/profile"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-white/90 hover:bg-white/10 hover:text-white transition"
                >
                  Profile
                </Link>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-white/90 hover:bg-white/10 hover:text-white transition"
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link
                  to="/login"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-white/90 hover:bg-white/10 hover:text-white transition"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="px-3 py-2 rounded-lg text-sm font-semibold bg-amber-400 text-[var(--color-nav)] hover:bg-amber-300 transition"
                >
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
