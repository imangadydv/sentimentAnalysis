import React from "react";
import { useLocation, Link } from "react-router-dom";
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
  }));

  return (
    <div className="p-6 max-w-6xl mx-auto bg-[var(--color-surface)] min-h-[calc(100vh-120px)]">
      <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-text)] mb-6">
        Analysis Results
      </h1>

      {datasetResults.length > 0 && (
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <h2 className="text-xl font-semibold text-[var(--color-text)]">
              {datasetResults.length === 1 ? "Text Sentiment Analysis" : "Dataset Sentiment Analysis"}
            </h2>
            <button
              onClick={downloadCSV}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-[var(--radius)] font-medium transition"
            >
              Download CSV
            </button>
          </div>

          <div className="overflow-x-auto mb-6 rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-[var(--shadow-sm)]">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-[var(--color-nav)] text-white text-left">
                  <th className="px-4 py-3 font-medium">#</th>
                  <th className="px-4 py-3 font-medium">Sentence</th>
                  <th className="px-4 py-3 font-medium">VADER</th>
                  <th className="px-4 py-3 font-medium">TextBlob</th>
                </tr>
              </thead>
              <tbody>
                {datasetResults.map((item, index) => (
                  <tr
                    key={index}
                    className="border-t border-[var(--color-border)] bg-[var(--color-surface-elevated)] even:bg-[var(--color-surface)]"
                  >
                    <td className="px-4 py-3 text-[var(--color-text-muted)]">{index + 1}</td>
                    <td className="px-4 py-3 text-[var(--color-text)]">{item.Text}</td>
                    <td className="px-4 py-3 text-[var(--color-text)]">{item["VADER Sentiment"]}</td>
                    <td className="px-4 py-3 text-[var(--color-text)]">{item["TextBlob Sentiment"]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-[var(--color-surface-elevated)] p-4 rounded-[var(--radius-lg)] border border-[var(--color-border)]">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8e6e3" />
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
                <Bar dataKey="VADER" fill="#4338ca" />
                <Bar dataKey="TextBlob" fill="#0d9488" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {imageSentiment && (
        <div className="flex flex-col items-center justify-center mt-10">
          <div className="bg-[var(--color-surface-elevated)] shadow-[var(--shadow-lg)] p-6 rounded-[var(--radius-lg)] border border-[var(--color-border)] w-full max-w-3xl text-center space-y-6">
            <h2 className="text-2xl font-bold text-[var(--color-text)]">
              Image Sentiment Result
            </h2>

            <div className="bg-stone-50 p-4 rounded-[var(--radius)] text-left text-[var(--color-text-muted)] border border-[var(--color-border)]">
              <h3 className="text-lg font-semibold mb-2 text-[var(--color-text)]">
                How Image Sentiment is Analyzed
              </h3>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>
                  <strong>Facial Emotion Detection:</strong> Deep learning models analyze facial expressions to detect emotions such as <em>happy</em>, <em>sad</em>, <em>angry</em>, <em>fear</em>, and others.
                </li>
                <li>
                  <strong>Dominant Emotion:</strong> The emotion with the highest confidence is selected as the <em>primary emotion</em>.
                </li>
                <li>
                  <strong>Sentiment Mapping:</strong> Emotions are grouped into sentiments:
                  <ul className="list-disc ml-6 mt-1">
                    <li><strong>Positive:</strong> Happy</li>
                    <li><strong>Negative:</strong> Sad, Angry, Fear, Disgust</li>
                    <li><strong>Neutral:</strong> Neutral, Surprise</li>
                  </ul>
                </li>
                <li><strong>Confidence Score:</strong> Indicates how confident the model is (higher = more accurate).</li>
                <li><strong>Dominant Colors:</strong> The top 3 colors found in the image.</li>
                <li><strong>Final Suggestion:</strong> Based on sentiment, we suggest whether the image is suitable for posting.</li>
              </ul>
            </div>

            <div className="bg-stone-50 p-6 rounded-[var(--radius)] border border-[var(--color-border)] text-left">
              <p className="text-base font-medium mb-2">
                <span className="text-[var(--color-text-muted)]">Primary Emotion:</span>{" "}
                <span className="text-[var(--color-accent)] font-semibold">{imageSentiment.emotion || "Not Detected"}</span>
              </p>

              <p className="text-base font-medium mb-2">
                <span className="text-[var(--color-text-muted)]">Sentiment:</span>{" "}
                <span className="text-[var(--color-primary)] font-semibold">{imageSentiment.sentiment || "Not Available"}</span>
              </p>

              <p className="text-sm text-[var(--color-text-muted)] mb-4">
                Confidence Score: {imageSentiment.confidence ? `${(imageSentiment.confidence * 100).toFixed(2)}%` : "N/A"}
              </p>

              <div className="mb-4">
                <h3 className="font-semibold text-[var(--color-text)] text-sm mb-1">Top Predictions</h3>
                <ul className="list-disc list-inside text-sm text-[var(--color-text-muted)]">
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
                <h3 className="font-semibold text-[var(--color-text)] text-sm mb-2">Dominant Colors</h3>
                <div className="flex justify-center gap-2 flex-wrap">
                  {Array.isArray(imageSentiment.colors) && imageSentiment.colors.length > 0 ? (
                    imageSentiment.colors.map((color, idx) => (
                      <div
                        key={idx}
                        className="w-8 h-8 rounded-full border-2 border-[var(--color-border)]"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))
                  ) : (
                    <p className="text-sm text-[var(--color-text-muted)]">No colors detected</p>
                  )}
                </div>
              </div>

              <p className="italic text-sm text-[var(--color-text-muted)] mb-1">
                Suggestion: {imageSentiment.suggestion || "No suggestion provided"}
              </p>

              <p className="text-xs text-[var(--color-text-muted)] opacity-80">
                Processed in: {imageSentiment.processed_in || "N/A"}
              </p>
            </div>
          </div>
        </div>
      )}

      {datasetResults.length === 0 && !imageSentiment && (
        <div className="text-center py-12 bg-[var(--color-surface-elevated)] rounded-[var(--radius-lg)] border border-[var(--color-border)]">
          <p className="text-[var(--color-text-muted)] mb-4">No results to show. Run an analysis first.</p>
          <Link to="/sentiment" className="text-[var(--color-primary)] font-medium hover:underline">
            Go to Analysis Hub →
          </Link>
        </div>
      )}
    </div>
  );
};

export default Result;
