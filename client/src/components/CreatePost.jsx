import { useState } from "react";
import { API_SERVER } from "../config";

const CreatePost = () => {
  const [text, setText] = useState("");
  const [sentiment, setSentiment] = useState("Neutral");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_SERVER}/api/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text, sentiment }),
      });

      if (!response.ok) throw new Error("Failed to create post");
      window.location.reload(); // Refresh posts after submission
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-gray-100 shadow rounded">
      <textarea
        className="w-full p-2 border rounded"
        placeholder="Write your post..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        required
      />
      <select className="mt-2 p-2 border rounded" value={sentiment} onChange={(e) => setSentiment(e.target.value)}>
        <option value="Neutral">Neutral</option>
        <option value="Positive">Positive</option>
        <option value="Negative">Negative</option>
      </select>
      <button type="submit" className="mt-4 bg-blue-500 text-white p-2 rounded">Post</button>
    </form>
  );
};

export default CreatePost;
