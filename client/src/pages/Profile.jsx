import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [story, setStory] = useState("");
  const [stories, setStories] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Unauthorized. Please login.");
          return;
        }

        const response = await fetch("http://localhost:5000/api/profile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (response.ok) {
          setUser(data);
          setStories(data.stories || []);
        } else {
          setError(data.message || "Failed to load profile.");
        }
      } catch (err) {
        setError("Failed to fetch profile.");
      }
    };
    fetchProfile();
  }, []);

  const handleSubmitStory = async () => {
    if (!story.trim()) {
      setMessage("Story cannot be empty.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/analyze-story", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: story }),
      });

      const data = await response.json();

      if (response.ok) {
        setStories([...stories, { text: story, createdAt: new Date() }]);
        setStory(""); // Clear input after submission
        setMessage("Story posted successfully!");
      } else {
        setMessage(data.message || "Cannot post due to negative feedback.");
      }
    } catch (err) {
      setMessage("Error analyzing story.");
    }
  };

  if (error) return <p className="text-red-500 text-center">{error}</p>;
  if (!user) return <p className="text-gray-500 text-center">Loading...</p>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-4">Profile</h1>
        <p className="text-gray-600"><strong>Username:</strong> {user.username}</p>
        <p className="text-gray-600"><strong>Email:</strong> {user.email}</p>
        <p className="text-gray-600"><strong>Joined:</strong> {new Date(user.createdAt).toDateString()}</p>
      </motion.div>

      {/* Story Information Section */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="bg-white p-6 rounded-lg shadow-lg w-96 mt-6 text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-3">How Story Posting Works?</h2>
        <p className="text-gray-600">Write your story and submit it. Our system will analyze its sentiment, and if it's positive or neutral, it will be posted. Otherwise, you'll get a message explaining why it can't be posted.</p>
      </motion.div>

      {/* Story Input Section */}
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="bg-white p-6 rounded-lg shadow-lg w-96 mt-6">
        <h2 className="text-xl font-bold text-gray-800 mb-3">Add a Story</h2>
        <textarea className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-300" rows="3" placeholder="Write your story here..." value={story} onChange={(e) => setStory(e.target.value)}></textarea>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleSubmitStory} className="bg-blue-500 text-white px-4 py-2 mt-2 rounded-lg w-full">
          Submit Story
        </motion.button>
        {message && <p className="text-center text-red-500 mt-2">{message}</p>}
      </motion.div>

      {/* Story Display Section */}
      <div className="w-96 mt-6">
        <h2 className="text-xl font-bold text-gray-800 mb-3">Stories</h2>
        {stories.length === 0 ? (
          <p className="text-gray-500">No stories yet.</p>
        ) : (
          stories.map((s, index) => (
            <motion.div key={index} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="bg-white p-4 rounded-lg shadow-lg mb-3">
              <p className="text-gray-700">{s.text}</p>
              <p className="text-gray-500 text-sm">{new Date(s.createdAt).toLocaleString()}</p>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default Profile;