import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Sentiment = () => {
  const [dataset, setDataset] = useState(null);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const analyzeDataset = async () => {
    if (!dataset) return alert("Please upload a dataset file.");
    const formData = new FormData();
    formData.append("file", dataset);

    try {
      const response = await fetch("http://127.0.0.1:5000/analyze_dataset", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      navigate("/result", { state: { datasetResults: data } });
    } catch (error) {
      console.error("Error analyzing dataset:", error);
      alert("Dataset analysis failed.");
    }
  };

  const analyzeImageSentiment = async () => {
    if (!image) return alert("Please upload an image.");
    const formData = new FormData();
    formData.append("image", image);

    try {
      const response = await fetch("http://127.0.0.1:5000/analyze-image", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      navigate("/result", { state: { imageSentiment: data } });
    } catch (error) {
      console.error("Error analyzing image sentiment:", error);
      alert("Image analysis failed.");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) setImagePreview(URL.createObjectURL(file));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 to-purple-200 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-gray-800 mb-4">🧠 Sentiment Analysis Hub</h1>
          <p className="text-gray-700 text-lg">Choose a method to analyze emotion: upload data, images, or use your camera!</p>
        </div>

        {/* Card Grid */}
        <div className="grid gap-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {/* Dataset Upload */}
          <div className="bg-white shadow-lg rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-semibold text-purple-700 mb-4">📄 Upload Dataset</h2>
              <input
                type="file"
                accept=".csv,.txt"
                onChange={(e) => setDataset(e.target.files[0])}
                className="mb-4 w-full border border-purple-300 rounded-md p-2"
              />
            </div>
            <button
              onClick={analyzeDataset}
              className="w-full mt-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
            >
              Analyze Dataset
            </button>
          </div>

          {/* Image Upload */}
          <div className="bg-white shadow-lg rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-semibold text-green-700 mb-4">🖼️ Upload Image</h2>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="mb-4 w-full border border-green-300 rounded-md p-2"
              />
              {imagePreview && (
                <div className="mb-4 text-center">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg border mx-auto"
                  />
                </div>
              )}
            </div>
            <button
              onClick={analyzeImageSentiment}
              className="w-full mt-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
            >
              Analyze Image
            </button>
          </div>

          {/* Real-Time Analysis Redirect */}
          <div className="bg-white shadow-lg rounded-2xl p-6 flex flex-col justify-between text-center">
            <div>
              <h2 className="text-xl font-semibold text-red-700 mb-4">🎥 Real-Time Detection</h2>
              <p className="text-sm text-gray-600 mb-4">
                Click below to activate your webcam and detect your live facial expression.
              </p>
            </div>
            <button
              onClick={() => navigate("/realtime-detection")}
              className="mt-auto px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
            >
              Start Real-Time Detection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sentiment;
