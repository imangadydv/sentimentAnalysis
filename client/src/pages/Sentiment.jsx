import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ML_API } from "../config";

const RECENT_KEY = "sentiment_recent";
const MAX_RECENT = 10;

function addRecent(type, label) {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const list = raw ? JSON.parse(raw) : [];
    list.unshift({ type, label: label || type, time: Date.now() });
    localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, MAX_RECENT)));
  } catch (_) {}
}

const Sentiment = () => {
  const [dataset, setDataset] = useState(null);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [quickText, setQuickText] = useState("");
  const [loadingDataset, setLoadingDataset] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
  const [loadingText, setLoadingText] = useState(false);
  const [errorDataset, setErrorDataset] = useState("");
  const [errorImage, setErrorImage] = useState("");
  const [errorText, setErrorText] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const analyzeDataset = async () => {
    setErrorDataset("");
    if (!dataset) {
      setErrorDataset("Please upload a dataset file (CSV with a 'text' column).");
      return;
    }
    setLoadingDataset(true);
    const formData = new FormData();
    formData.append("file", dataset);
    try {
      const response = await fetch(`${ML_API}/analyze_dataset`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Analysis failed");
      addRecent("dataset", dataset.name);
      navigate("/result", { state: { datasetResults: data } });
    } catch (err) {
      setErrorDataset(err.message || "Dataset analysis failed.");
    } finally {
      setLoadingDataset(false);
    }
  };

  const analyzeImageSentiment = async () => {
    setErrorImage("");
    if (!image) {
      setErrorImage("Please upload an image.");
      return;
    }
    setLoadingImage(true);
    const formData = new FormData();
    formData.append("image", new File([image], image.name, { type: image.type }));
    try {
      const response = await fetch(`${ML_API}/analyze-image`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Analysis failed");
      addRecent("image", image.name);
      navigate("/result", { state: { imageSentiment: data } });
    } catch (err) {
      setErrorImage(err.message || "Image analysis failed.");
    } finally {
      setLoadingImage(false);
    }
  };

  const analyzeQuickText = async () => {
    setErrorText("");
    const text = (quickText || "").trim();
    if (!text) {
      setErrorText("Please enter some text to analyze.");
      return;
    }
    setLoadingText(true);
    try {
      const response = await fetch(`${ML_API}/analyze-text`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Analysis failed");
      addRecent("text", text.slice(0, 40) + (text.length > 40 ? "…" : ""));
      navigate("/result", { state: { datasetResults: data } });
    } catch (err) {
      setErrorText(err.message || "Text analysis failed.");
    } finally {
      setLoadingText(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setErrorImage("");
    if (file) setImagePreview(URL.createObjectURL(file));
  };

  return (
    <div className="min-h-[calc(100vh-120px)] bg-[var(--color-surface)] py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-text)] mb-3">
            Sentiment Analysis Hub
          </h1>
          <p className="text-[var(--color-text-muted)] text-lg max-w-2xl mx-auto">
            Analyze emotion from text, datasets, images, or live webcam.
          </p>
        </div>

        <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {/* Quick Text */}
          <div className="bg-[var(--color-surface-elevated)] rounded-[var(--radius-lg)] p-6 flex flex-col border border-[var(--color-border)] shadow-[var(--shadow-md)]">
            <h2 className="text-xl font-semibold text-[var(--color-text)] mb-3">
              Quick Text
            </h2>
            <textarea
              value={quickText}
              onChange={(e) => { setQuickText(e.target.value); setErrorText(""); }}
              placeholder="Type or paste text..."
              rows={4}
              className="w-full border border-[var(--color-border)] rounded-[var(--radius)] p-3 text-sm bg-[var(--color-surface)] resize-none mb-2"
            />
            {errorText && <p className="text-red-600 text-sm mb-2">{errorText}</p>}
            <button
              onClick={analyzeQuickText}
              disabled={loadingText}
              className="mt-auto py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:opacity-60 text-white rounded-[var(--radius)] font-semibold transition"
            >
              {loadingText ? "Analyzing…" : "Analyze Text"}
            </button>
          </div>

          {/* Dataset */}
          <div className="bg-[var(--color-surface-elevated)] rounded-[var(--radius-lg)] p-6 flex flex-col border border-[var(--color-border)] shadow-[var(--shadow-md)]">
            <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">
              Upload Dataset
            </h2>
            <p className="text-xs text-[var(--color-text-muted)] mb-2">CSV with a <code className="bg-[var(--color-surface)] px-1 rounded">text</code> column</p>
            <input
              type="file"
              accept=".csv,.txt"
              onChange={(e) => { setDataset(e.target.files[0]); setErrorDataset(""); }}
              className="mb-2 w-full border border-[var(--color-border)] rounded-[var(--radius)] p-3 text-sm bg-[var(--color-surface)]"
            />
            {errorDataset && <p className="text-red-600 text-sm mb-2">{errorDataset}</p>}
            <button
              onClick={analyzeDataset}
              disabled={loadingDataset}
              className="w-full mt-auto py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:opacity-60 text-white rounded-[var(--radius)] font-semibold transition"
            >
              {loadingDataset ? "Analyzing…" : "Analyze Dataset"}
            </button>
          </div>

          {/* Image */}
          <div className="bg-[var(--color-surface-elevated)] rounded-[var(--radius-lg)] p-6 flex flex-col border border-[var(--color-border)] shadow-[var(--shadow-md)]">
            <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">
              Upload Image
            </h2>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="mb-2 w-full border border-[var(--color-border)] rounded-[var(--radius)] p-3 text-sm bg-[var(--color-surface)]"
            />
            {imagePreview && (
              <div className="mb-2 text-center">
                <img src={imagePreview} alt="Preview" className="w-28 h-28 object-cover rounded-[var(--radius)] border border-[var(--color-border)] mx-auto" />
              </div>
            )}
            {errorImage && <p className="text-red-600 text-sm mb-2">{errorImage}</p>}
            <button
              onClick={analyzeImageSentiment}
              disabled={loadingImage}
              className="w-full mt-auto py-3 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] disabled:opacity-60 text-white rounded-[var(--radius)] font-semibold transition"
            >
              {loadingImage ? "Analyzing…" : "Analyze Image"}
            </button>
          </div>

          {/* Real-Time */}
          <div className="bg-[var(--color-surface-elevated)] rounded-[var(--radius-lg)] p-6 flex flex-col justify-between text-center border border-[var(--color-border)] shadow-[var(--shadow-md)]">
            <div>
              <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">
                Real-Time
              </h2>
              <p className="text-sm text-[var(--color-text-muted)] mb-4">
                Use your webcam for live facial emotion detection.
              </p>
            </div>
            <button
              onClick={() => navigate("/realtime-detection")}
              className="mt-auto px-6 py-3 bg-[var(--color-nav)] hover:bg-indigo-900 text-white rounded-[var(--radius)] font-semibold transition"
            >
              Start Webcam
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sentiment;
