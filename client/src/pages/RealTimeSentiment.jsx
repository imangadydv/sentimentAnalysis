import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";

const RealTimeSentiment = () => {
  const webcamRef = useRef(null);
  const [liveSentiment, setLiveSentiment] = useState(null);
  const navigate = useNavigate();

  const captureAndAnalyze = async () => {
    if (!webcamRef.current) return;

    const imageSrc = webcamRef.current.getScreenshot();

    if (!imageSrc) return;

    try {
      const response = await fetch("http://127.0.0.1:5000/start-detecting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageSrc }),
      });

      const data = await response.json();
      if (response.ok) {
        setLiveSentiment(data.emotion || "No emotion detected");
      } else {
        throw new Error(data.error || "Failed to detect emotion");
      }
    } catch (error) {
      console.error("Real-time analysis error:", error);
      setLiveSentiment("Error analyzing emotion.");
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      captureAndAnalyze();
    }, 1000); // analyze every 3 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 to-purple-200 text-white flex flex-col items-center justify-center gap-6 px-4 py-10">
      <h1 className="text-3xl font-bold">🎥 Real-Time Sentiment Detection</h1>
      
      <Webcam
        ref={webcamRef}
        audio={false}
        screenshotFormat="image/jpeg"
        videoConstraints={{
          width: 640,
          height: 480,
          facingMode: "user",
        }}
        className="rounded-lg border w-80 h-60"
      />

      <p className="text-lg">
        Sentiment: <span className="font-semibold text-green-400">{liveSentiment || "Detecting..."}</span>
      </p>

      <button
        onClick={() => navigate("/sentiment")}
        className="mt-4 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg"
      >
        Go Back
      </button>
    </div>
  );
};

export default RealTimeSentiment;
