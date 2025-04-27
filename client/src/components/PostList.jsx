import { useEffect, useState } from "react";

const PostList = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("https://sentimentanalysis-backend-bgrf.onrender.com/api/posts");
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold">Recent Posts</h2>
      {posts.map((post) => (
        <div key={post._id} className="bg-white p-4 shadow rounded my-4">
          <p className="text-gray-700">{post.text}</p>
          <p className="text-sm text-gray-500">Sentiment: {post.sentiment}</p>
          <p className="text-xs text-gray-400">By: {post.user?.username}</p>
        </div>
      ))}
    </div>
  );
};

export default PostList;
