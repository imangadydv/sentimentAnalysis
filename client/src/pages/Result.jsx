import React from "react";
import { useLocation } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

const Result = () => {
  const location = useLocation();
  const datasetResults = location.state?.datasetResults || [];
  const imageSentiment = location.state?.imageSentiment || null;

  const downloadCSV = () => {
    const csv = [
      ["Sentence", "VADER", "", "TextBlob", "", "BERT", ""],
      ...datasetResults.map((row) => [
        row.Text || "N/A",
        row["VADER Sentiment"] || "N/A",
        "",
        row["TextBlob Sentiment"] || "N/A",
        "",
        row["BERT Model"] || "N/A",
        "",
      ]),
    ]
      .map((e) => e.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "sentiment_results.csv";
    link.click();
  };

  const extractSentiment = (str) => str?.split(" ")[0]?.toLowerCase();

  const sentimentValue = (sentimentStr) => {
    const sentiment = extractSentiment(sentimentStr);
    switch (sentiment) {
      case "positive":
        return 1;
      case "negative":
        return -1;
      case "neutral":
        return 0;
      default:
        return 0;
    }
  };

  const chartData = datasetResults.map((item, index) => ({
    name: `S${index + 1}`,
    VADER: sentimentValue(item["VADER Sentiment"]),
    TextBlob: sentimentValue(item["TextBlob Sentiment"]),
    // BERT: sentimentValue(item["BERT Model"]),
  }));

  return (
    <div className="p-6 max-w-6xl bg-gradient-to-br from-blue-200 to-purple-200 mx-auto">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">Analysis Results</h1>

      {datasetResults.length > 0 && (
        <div className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Dataset Sentiment Analysis</h2>
            <button
              onClick={downloadCSV}
              className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
            >
              Download CSV
            </button>
          </div>

          <div className="overflow-x-auto mb-6">
            <table className="w-full table-auto border border-gray-300 rounded-lg shadow-md">
              <thead>
                <tr className="bg-blue-100 text-left">
                  <th className="px-4 py-2">#</th>
                  <th className="px-4 py-2">Sentence</th>
                  <th className="px-4 py-2">VADER</th>
                  <th className="px-4 py-2">TextBlob</th>
                </tr>
              </thead>
              <tbody>
                {datasetResults.map((item, index) => (
                  <tr key={index} className="border-t">
                    <td className="px-4 py-2">{index + 1}</td>
                    <td className="px-4 py-2">{item.Text}</td>
                    <td className="px-4 py-2">{item["VADER Sentiment"]}</td>
                    <td className="px-4 py-2">{item["TextBlob Sentiment"]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis
                domain={[-1, 1]}
                tickFormatter={(value) => {
                  if (value === 1) return "Positive";
                  if (value === -1) return "Negative";
                  return "Neutral";
                }}
              />
              <Tooltip />
              <Legend />
              <Bar dataKey="VADER" fill="#4A90E2" />
              <Bar dataKey="TextBlob" fill="#50E3C2" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

{imageSentiment && (
  <div className="flex flex-col items-center justify-center mt-10">
    <div className="bg-white shadow-lg p-6 rounded-xl space-y-6 w-full max-w-3xl text-center">
      <h2 className="text-3xl font-bold text-purple-700">Image Sentiment Result</h2>

      {/* Explanatory Section */}
      <div className="bg-purple-50 p-4 rounded-lg text-left text-gray-700">
        <h3 className="text-xl font-semibold mb-2 text-purple-600">How Image Sentiment is Analyzed:</h3>
        <ul className="list-disc list-inside space-y-2 text-sm">
          <li><strong>Facial Emotion Detection:</strong> Deep learning models analyze facial expressions (like smiles, frowns, etc.) to detect emotions such as <em>happy</em>, <em>sad</em>, <em>angry</em>, <em>fear</em>, and others.</li>
          <li><strong>Dominant Emotion:</strong> The emotion with the highest confidence is selected as the <em>primary emotion</em>.</li>
          <li><strong>Sentiment Mapping:</strong> Emotions are grouped into sentiments:
            <ul className="list-disc ml-6">
              <li><strong>Positive:</strong> Happy</li>
              <li><strong>Negative:</strong> Sad, Angry, Fear, Disgust</li>
              <li><strong>Neutral:</strong> Neutral, Surprise</li>
            </ul>
          </li>
          <li><strong>Confidence Score:</strong> Indicates how confident the model is in its prediction (higher = more accurate).</li>
          <li><strong>Dominant Colors:</strong> The top 3 colors found in the image, which can reflect tone or aesthetic mood.</li>
          <li><strong>Final Suggestion:</strong> Based on the sentiment, we suggest whether the image is suitable for posting.</li>
        </ul>
      </div>

      {/* Final Result */}
      <div className="bg-blue-50 p-6 rounded-lg shadow-inner">
        <p className="text-lg font-medium mb-2">
          <span className="text-gray-800">Primary Emotion:</span>{" "}
          <span className="text-green-600 font-semibold">{imageSentiment.emotion || "Not Detected"}</span>
        </p>

        <p className="text-lg font-medium mb-2">
          <span className="text-gray-800">Sentiment:</span>{" "}
          <span className="text-blue-600 font-semibold">{imageSentiment.sentiment || "Not Available"}</span>
        </p>

        <p className="text-sm text-gray-600 mb-4">
          Confidence Score: {imageSentiment.confidence ? `${(imageSentiment.confidence * 100).toFixed(2)}%` : "N/A"}
        </p>

        <div className="mb-4">
          <h3 className="font-semibold text-md">Top Predictions:</h3>
          <ul className="list-disc list-inside text-sm text-gray-700">
            {Array.isArray(imageSentiment.predictions) && imageSentiment.predictions.length > 0 ? (
              imageSentiment.predictions.map((item, idx) => (
                <li key={idx}>
                  {item.emotion}: {(item.confidence * 100).toFixed(2)}%
                </li>
              ))
            ) : (
              <li>No predictions available</li>
            )}
          </ul>
        </div>

        <div className="mb-4">
          <h3 className="font-semibold text-md mb-1">Dominant Colors:</h3>
          <div className="flex justify-center space-x-2">
            {Array.isArray(imageSentiment.colors) && imageSentiment.colors.length > 0 ? (
              imageSentiment.colors.map((color, idx) => (
                <div
                  key={idx}
                  className="w-6 h-6 rounded-full border"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))
            ) : (
              <p className="text-sm text-gray-500">No colors detected</p>
            )}
          </div>
        </div>

        <p className="italic text-sm text-gray-700 mb-1">
          Suggestion: {imageSentiment.suggestion || "No suggestion provided"}
        </p>

        <p className="text-xs text-gray-400">
          Processed in: {imageSentiment.processed_in || "N/A"}
        </p>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default Result;
