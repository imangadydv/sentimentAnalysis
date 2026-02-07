import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { API_SERVER } from "../config";

const RECENT_KEY = "sentiment_recent";

function formatTime(ts) {
  const d = new Date(ts);
  const now = Date.now();
  const diff = now - d.getTime();
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function getInitials(username) {
  if (!username) return "?";
  const parts = String(username).trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return String(username).slice(0, 2).toUpperCase();
}

const Home = () => {
  const [user, setUser] = useState(null);
  const [recent, setRecent] = useState([]);
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setUser(true);
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      const list = raw ? JSON.parse(raw) : [];
      setRecent(list.slice(0, 5));
    } catch (_) {
      setRecent([]);
    }
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      setPostsLoading(true);
      try {
        const res = await fetch(`${API_SERVER}/api/posts`);
        const data = await res.json();
        if (Array.isArray(data)) setPosts(data);
      } catch (_) {
        setPosts([]);
      } finally {
        setPostsLoading(false);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-120px)] bg-[var(--color-surface)] text-[var(--color-text)] px-6 py-12">
      <motion.h1
        className="text-4xl md:text-5xl font-bold text-center mb-4 text-[var(--color-text)] tracking-tight"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        Sentiment Analysis
      </motion.h1>

      <motion.p
        className="text-lg text-center max-w-2xl mb-8 text-[var(--color-text-muted)]"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        Discover the power of AI-driven sentiment analysis. Our model helps in
        understanding the emotions behind text, whether they are positive,
        negative, or neutral.
      </motion.p>

      {user && recent.length > 0 && (
        <motion.div
          className="w-full max-w-3xl mb-6 bg-[var(--color-surface-elevated)] rounded-[var(--radius-lg)] border border-[var(--color-border)] p-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <h3 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-3">
            Recent activity
          </h3>
          <ul className="space-y-2">
            {recent.map((item, i) => (
              <li key={`${item.time}-${i}`} className="flex items-center gap-2 text-sm text-[var(--color-text)]">
                <span className="capitalize font-medium text-[var(--color-primary)]">{item.type}</span>
                <span className="text-[var(--color-text-muted)] truncate flex-1" title={item.label}>{item.label}</span>
                <span className="text-[var(--color-text-muted)] text-xs">{formatTime(item.time)}</span>
              </li>
            ))}
          </ul>
          <Link
            to="/sentiment"
            className="inline-block mt-3 text-sm font-medium text-[var(--color-primary)] hover:underline"
          >
            Open Analysis Hub →
          </Link>
        </motion.div>
      )}

      {/* Posts feed */}
      <div className="w-full max-w-3xl mb-8">
        <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">Recent posts</h2>
        {postsLoading ? (
          <div className="bg-[var(--color-surface-elevated)] rounded-[var(--radius-lg)] border border-[var(--color-border)] p-8 text-center">
            <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-[var(--color-text-muted)] mt-3">Loading posts…</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-[var(--color-surface-elevated)] rounded-[var(--radius-lg)] border border-[var(--color-border)] p-8 text-center">
            <p className="text-[var(--color-text-muted)]">No posts yet.</p>
            {user && (
              <Link to="/profile" className="inline-block mt-2 text-sm font-medium text-[var(--color-primary)] hover:underline">
                Create a post →
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <motion.article
                key={post._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[var(--color-surface-elevated)] rounded-[var(--radius-lg)] border border-[var(--color-border)] p-4 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-shadow"
              >
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-sm font-bold">
                    {getInitials(post.user?.username)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-[var(--color-text)]">{post.user?.username || "Someone"}</span>
                      <span className="text-[var(--color-text-muted)] text-sm">·</span>
                      <span className="text-[var(--color-text-muted)] text-sm">{formatTime(post.createdAt)}</span>
                    </div>
                    <p className="text-[var(--color-text)] mt-1 whitespace-pre-wrap break-words">{post.text}</p>
                    {post.image && (
                      <img
                        src={`${API_SERVER}${post.image}`}
                        alt=""
                        className="mt-2 rounded-[var(--radius)] max-h-72 w-full object-cover border border-[var(--color-border)]"
                      />
                    )}
                    {user && (
                      <Link
                        to="/profile"
                        className="inline-block mt-2 text-xs text-[var(--color-primary)] hover:underline"
                      >
                        View profile →
                      </Link>
                    )}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>

      <div className="bg-[var(--color-surface-elevated)] text-[var(--color-text)] p-8 rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] max-w-3xl w-full border border-[var(--color-border)]">
        <h2 className="text-2xl font-semibold mb-3 text-[var(--color-text)]">
          What is Sentiment Analysis?
        </h2>
        <p className="text-[var(--color-text-muted)] leading-relaxed">
          Sentiment Analysis, also known as opinion mining, is a Natural Language
          Processing (NLP) technique used to determine the sentiment behind text.
          It is widely used in social media monitoring, customer feedback
          analysis, and market research.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2 text-[var(--color-text)]">
          How It Works
        </h3>
        <ul className="list-disc pl-5 text-[var(--color-text-muted)] space-y-1">
          <li>Collects and processes text data.</li>
          <li>Uses AI models to classify sentiments as Positive, Negative, or Neutral.</li>
          <li>Helps in decision-making for businesses and research purposes.</li>
        </ul>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="text-center mt-8"
        >
          {user ? (
            <Link
              to="/sentiment"
              className="inline-block px-6 py-3 bg-[var(--color-primary)] text-white rounded-[var(--radius)] font-semibold shadow-[var(--shadow-md)] hover:bg-[var(--color-primary-hover)] transition duration-300"
            >
              Try Sentiment Analysis
            </Link>
          ) : (
            <button
              className="px-6 py-3 bg-stone-300 text-stone-500 rounded-[var(--radius)] cursor-not-allowed font-semibold"
              disabled
            >
              Sentiment Analysis (Login required)
            </button>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Home;
