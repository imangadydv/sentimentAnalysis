import { useEffect, useState } from "react";
import { API_SERVER } from "../config";

const PostList = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`${API_SERVER}/api/posts`);
        const data = await response.json();
        setPosts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold text-[var(--color-text)] mb-4">Recent Posts</h2>
      {posts.length === 0 ? (
        <p className="text-[var(--color-text-muted)]">No posts yet.</p>
      ) : (
        posts.map((post) => (
          <div
            key={post._id}
            className="bg-[var(--color-surface-elevated)] p-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-[var(--shadow-sm)] my-4"
          >
            <p className="text-sm text-[var(--color-text-muted)]">@{post.user?.username}</p>
            <p className="text-[var(--color-text)] mt-1">{post.text}</p>
            {post.image && (
              <img
                src={`${API_SERVER}${post.image}`}
                alt=""
                className="mt-2 rounded-[var(--radius)] max-h-72 w-full object-cover"
              />
            )}
            {post.sentiment && (
              <p className="text-sm text-[var(--color-text-muted)] mt-2">Sentiment: {post.sentiment}</p>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default PostList;
