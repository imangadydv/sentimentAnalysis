import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import { ML_API } from "../config";

const RealTimeSentiment = () => {
  const webcamRef = useRef(null);
  const [liveSentiment, setLiveSentiment] = useState(null);
  const navigate = useNavigate();

  const captureAndAnalyze = async () => {
    if (!webcamRef.current) return;

    const imageSrc = webcamRef.current.getScreenshot();

    if (!imageSrc) return;

    try {
      const response = await fetch(`${ML_API}/start-detecting`, {
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
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-[calc(100vh-120px)] bg-[var(--color-surface)] flex flex-col items-center justify-center gap-6 px-4 py-10">
      <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-text)]">
        Real-Time Sentiment Detection
      </h1>

      <div className="rounded-[var(--radius-lg)] overflow-hidden border-2 border-[var(--color-border)] shadow-[var(--shadow-lg)]">
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          videoConstraints={{
            width: 640,
            height: 480,
            facingMode: "user",
          }}
          className="w-80 h-60 object-cover block"
        />
      </div>

      <p className="text-lg text-[var(--color-text)]">
        Sentiment:{" "}
        <span className="font-semibold text-[var(--color-accent)]">
          {liveSentiment || "Detecting..."}
        </span>
      </p>

      <button
        onClick={() => navigate("/sentiment")}
        className="px-5 py-2.5 bg-[var(--color-nav)] hover:bg-indigo-900 text-white rounded-[var(--radius)] font-medium transition"
      >
        Go Back
      </button>
    </div>
  );
};

export default RealTimeSentiment;
