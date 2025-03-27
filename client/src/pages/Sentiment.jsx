import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { useNavigate } from "react-router-dom";

const Sentiment = () => {
  const [text, setText] = useState("");
  const [results, setResults] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [image, setImage] = useState(null);
  const [imageSentiment, setImageSentiment] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const analyzeSentiment = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://127.0.0.1:5000/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();
      setResults(data.sentiments);
      setAccuracy({ VADER: 85, TextBlob: 78, "BERT Model": 92 });
    } catch (error) {
      console.error("Error analyzing sentiment:", error);
    }
  };

  const analyzeImageSentiment = async () => {
    if (!image) {
      alert("Please upload an image first.");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);

    try {
      const response = await fetch("http://127.0.0.1:5000/analyze-image", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setImageSentiment(data.sentiment);
    } catch (error) {
      console.error("Error analyzing image sentiment:", error);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">Sentiment Analysis</h1>

      {/* Text Sentiment Analysis */}
      <textarea
        className="w-96 h-32 p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 resize-none shadow-md"
        placeholder="Enter your text here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button
        className="mt-4 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-300 shadow-md"
        onClick={analyzeSentiment}
      >
        Analyze Text
      </button>

      {/* Image Sentiment Analysis */}
      <input
        type="file"
        accept="image/*"
        className="mt-4"
        onChange={(e) => setImage(e.target.files[0])}
      />

      <button
        className="mt-4 px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition duration-300 shadow-md"
        onClick={analyzeImageSentiment}
      >
        Analyze Image
      </button>

      {results && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Text Analysis Results</h2>
          <ul className="mb-6">
            {Object.entries(results).map(([model, sentiment]) => (
              <li key={model} className="mb-1">{model}: <span className="font-medium">{sentiment}</span></li>
            ))}
          </ul>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={Object.keys(results).map(model => ({ name: model, Sentiment: results[model] === "Positive" ? 1 : results[model] === "Negative" ? -1 : 0 }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="Sentiment" fill="#4A90E2" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {imageSentiment && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold">Image Sentiment</h2>
          <p className="text-xl">{imageSentiment}</p>
        </div>
      )}
    </div>
  );
};

export default Sentiment;
