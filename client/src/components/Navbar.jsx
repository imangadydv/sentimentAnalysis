import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

const Navbar = () => {
  const [user, setUser] = useState(!!localStorage.getItem("token"));

  useEffect(() => {
    const checkAuth = () => {
      setUser(!!localStorage.getItem("token"));
    };

    window.addEventListener("storage", checkAuth);
    return () => {
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(false);
  };

  return (
    <nav className="bg-blue-600 p-4 text-white">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold hover:underline">
          <span className="text-black">X</span>
          <span className="text-white">Analysis</span>
        </Link>

        <ul className="flex space-x-4">
          <li>
            <Link
              to="/sentiment"
              className="bg-blue-500 px-3 py-1 rounded hover:bg-blue-700 transition"
            >
              Sentiment Analysis
            </Link>
          </li>

          {user ? (
            <>
              <li>
                <Link
                  to="/profile"
                  className="bg-blue-500 px-3 py-1 rounded hover:bg-blue-700 transition"
                >
                  Profile
                </Link>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="bg-blue-500 px-3 py-1 rounded hover:bg-blue-700 transition"
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
                  className="hover:underline"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="hover:underline"
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
