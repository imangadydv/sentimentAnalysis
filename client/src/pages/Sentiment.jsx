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
    if (!dataset) {
      alert("Please upload a dataset file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", dataset);

    try {
      const response = await fetch("http://127.0.0.1:5000/analyze_dataset", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Dataset analysis failed");
      }

      navigate("/result", { state: { datasetResults: data } });
    } catch (error) {
      console.error("Error analyzing dataset:", error);
      alert("Dataset analysis failed. Please check your file and try again.");
    }
  };

  const analyzeImageSentiment = async () => {
    if (!image) {
      alert("Please upload an image.");
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
      if (!response.ok) {
        throw new Error(data.error || "Image analysis failed");
      }

      navigate("/result", { state: { imageSentiment: data } });
    } catch (error) {
      console.error("Error analyzing image sentiment:", error);
      alert("Image sentiment analysis failed. Please try again.");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-blue-700 mb-2">🧠 Sentiment Analysis</h1>
          <p className="text-gray-600">Upload text datasets or images to analyze emotions and sentiments using AI.</p>
        </div>

        {/* Dataset Card */}
        <div className="bg-white shadow-xl rounded-2xl p-6 mb-10">
          <h2 className="text-2xl font-semibold text-purple-700 mb-2">📄 Upload Dataset</h2>
          <p className="text-sm text-gray-600 mb-4">
            Supported formats: <strong>.csv</strong>, <strong>.txt</strong>
          </p>
          <input
            type="file"
            accept=".csv,.txt"
            className="mb-4 w-full"
            onChange={(e) => setDataset(e.target.files[0])}
          />
          <button
            onClick={analyzeDataset}
            className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition"
          >
            Analyze Dataset
          </button>
        </div>

        {/* Image Card */}
        <div className="bg-white shadow-xl rounded-2xl p-6">
          <h2 className="text-2xl font-semibold text-green-700 mb-2">🖼️ Upload Image</h2>
          <p className="text-sm text-gray-600 mb-4">
            Upload a face image to analyze emotional sentiment.
          </p>
          <input
            type="file"
            accept="image/*"
            className="mb-4 w-full"
            onChange={handleImageChange}
          />
          {imagePreview && (
            <div className="mb-4">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-lg border mx-auto"
              />
            </div>
          )}
          <button
            onClick={analyzeImageSentiment}
            className="w-full py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition"
          >
            Analyze Image
          </button>
        </div>

        {/* Note */}
        <p className="mt-8 text-xs text-center text-gray-500">
          ⚠️ For best results, upload high-quality content with clear context or facial expressions.
        </p>
      </div>
    </div>
  );
};

export default Sentiment;
