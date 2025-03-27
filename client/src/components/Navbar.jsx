import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { color } from "framer-motion";

const Navbar = () => {
  const [user, setUser] = useState(!!localStorage.getItem("token"));

  useEffect(() => {
    const checkAuth = () => {
      setUser(!!localStorage.getItem("token")); // Update when token changes
    };

    window.addEventListener("storage", checkAuth); // Listen for changes

    return () => {
      window.removeEventListener("storage", checkAuth); // Cleanup
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(false); // Update state without reloading
  };

  return (
    <nav className="bg-blue-600 p-4 text-white">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo or Home Link */}
        <Link to="/" className="text-xl font-bold hover:underline">
  <span className="text-black">X</span>
  <span className="text-white">Analysis</span>
</Link>


        {/* Navigation Links */}
        <ul className="flex space-x-4">
          <li><Link to="/sentiment" className="hover:underline">Sentiment Analysis</Link></li>

          {user ? (
            <>
              <li><Link to="/profile" className="hover:underline">Profile</Link></li>
              <li>
                <button
                  onClick={handleLogout}
                  className="hover:underline bg-blue-500 px-3 py-1 rounded"
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li><Link to="/login" className="hover:underline">Login</Link></li>
              <li><Link to="/register" className="hover:underline">Register</Link></li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
