import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const Home = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setUser(true); 
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 to-purple-200 text-white p-6">
      <motion.h1
        className="text-4xl md:text-5xl font-bold text-center mb-4"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        Sentiment Analysis
      </motion.h1>

      <motion.p
        className="text-lg text-center max-w-2xl mb-6"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        Discover the power of AI-driven sentiment analysis. Our model helps in
        understanding the emotions behind text, whether they are positive,
        negative, or neutral.
      </motion.p>

      <div className="bg-white text-gray-800 p-6 rounded-lg shadow-lg max-w-3xl">
        <h2 className="text-2xl font-semibold mb-3">📌 What is Sentiment Analysis?</h2>
        <p className="text-gray-600">
          Sentiment Analysis, also known as opinion mining, is a Natural Language
          Processing (NLP) technique used to determine the sentiment behind text.
          It is widely used in social media monitoring, customer feedback
          analysis, and market research.
        </p>

        <h3 className="text-xl font-semibold mt-4">🔹 How It Works:</h3>
        <ul className="list-disc pl-5 text-gray-600">
          <li>Collects and processes text data.</li>
          <li>Uses AI models to classify sentiments as Positive, Negative, or Neutral.</li>
          <li>Helps in decision-making for businesses and research purposes.</li>
        </ul>

     
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="text-center mt-6"
        >
          {user ? (
            <Link
            to="/sentiment"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-300 font-semibold"
          >
            Try Sentiment Analysis
          </Link>
          ) : (
            <button
            className="px-6 py-3 bg-gray-400 text-white rounded-lg shadow-md cursor-not-allowed"
            disabled
          >
            Sentiment Analysis (Disabled)
          </button>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Home;

