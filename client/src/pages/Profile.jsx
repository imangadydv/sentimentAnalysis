import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaHeart, FaRegHeart, FaCommentAlt } from "react-icons/fa";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState(null);
  const [stories, setStories] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("https://sentimentanalysis-backend-bgrf.onrender.com/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok) {
          const postsWithState = data.stories?.map((story) => ({
            ...story,
            imageUrl: story.image ? `https://sentimentanalysis-backend-bgrf.onrender.com${story.image}` : "",
            liked: false,
            likeCount: story.likeCount || 0,
            comments: [],
            showCommentBox: false,
            commentText: "",
          })) || [];
          setUser(data);
          setStories(postsWithState);
        } else setError(data.message || "Failed to fetch profile.");
      } catch (err) {
        setError("Error loading profile.");
      }
    };
    fetchProfile();
  }, []);
  

  const handlePost = async () => {
    if (!caption.trim() && !image) {
      setMessage("Please add a caption or image.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("caption", caption);
      if (image) formData.append("image", image);

      const response = await fetch("https://sentimentanalysis-backend-bgrf.onrender.com/api/analyze-post", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();
      console.log("Response from analyze-post:", data);

      if (response.ok) {
        const imageUrl = data?.data?.image ? `https://sentimentanalysis-backend-bgrf.onrender.com${data.data.image}` : "";
        console.log("Returned imageUrl from backend:", imageUrl);

        const newPost = {
          caption,
          imageUrl,
          createdAt: new Date(),
          liked: false,
          likeCount: 0,
          comments: [],
          showCommentBox: false,
          commentText: "",
        };

        setStories([newPost, ...stories]);
        setCaption("");
        setImage(null);
        setMessage("Posted successfully!");
      } else {
        setMessage(data.message || "Post not allowed due to negative sentiment.");
      }
    } catch (err) {
      console.error("Error posting story:", err);
      setMessage("Error posting story.");
    }
  };

  const toggleLike = (index) => {
    const updatedStories = [...stories];
    const post = updatedStories[index];
    post.liked = !post.liked;
    post.likeCount += post.liked ? 1 : -1;
    setStories(updatedStories);
  };

  const toggleCommentBox = (index) => {
    const updatedStories = [...stories];
    updatedStories[index].showCommentBox = !updatedStories[index].showCommentBox;
    setStories(updatedStories);
  };

  const handleCommentChange = (index, value) => {
    const updatedStories = [...stories];
    updatedStories[index].commentText = value;
    setStories(updatedStories);
  };

  const postComment = (index) => {
    const updatedStories = [...stories];
    const post = updatedStories[index];
    if (post.commentText.trim()) {
      post.comments.push({
        text: post.commentText,
        time: new Date().toLocaleString(),
      });
      post.commentText = "";
      post.showCommentBox = false;
      setStories(updatedStories);
    }
  };

  if (error) return <p className="text-center text-red-600 mt-8">{error}</p>;
  if (!user) return <p className="text-center text-gray-600 mt-8">Loading...</p>;

  return (
    <div className="bg-gradient-to-br from-blue-200 to-purple-200 min-h-screen px-4 py-6 flex flex-col items-center">
      <div className="bg-white w-full max-w-xl p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800">@{user.username}</h2>
        <p className="text-sm text-gray-500">{user.email}</p>
        <p className="text-sm text-gray-400">Joined on {new Date(user.createdAt).toDateString()}</p>
      </div>

      <div className="bg-white w-full max-w-xl mt-6 p-6 rounded-lg shadow-md">
        <textarea
          rows="3"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="What's happening?"
          className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
        />
        <div className="flex items-center justify-between mt-3">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            className="text-sm text-gray-600"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePost}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold"
          >
            Post
          </motion.button>
        </div>
        {message && <p className="text-sm text-center text-red-500 mt-2">{message}</p>}
      </div>

      <div className="w-full max-w-xl mt-6 space-y-4">
        {stories.length === 0 ? (
          <p className="text-center text-gray-500">No posts yet.</p>
        ) : (
          stories.map((story, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white p-4 rounded-lg shadow-md"
            >
              {story.caption && <p className="text-gray-800 mb-2">{story.caption}</p>}
              {story.imageUrl && (
                <img
                  src={story.imageUrl}
                  alt="post"
                  className="rounded-lg max-h-60 object-cover w-full mb-2"
                />
              )}
              <div className="text-sm text-gray-500 mb-2">
                {new Date(story.createdAt).toLocaleString()}
              </div>

              <div className="flex items-center gap-6">
                <button onClick={() => toggleLike(idx)} className="flex items-center gap-1 text-pink-600">
                  {story.liked ? <FaHeart /> : <FaRegHeart />}
                  <span>{story.likeCount}</span>
                </button>
                <button onClick={() => toggleCommentBox(idx)} className="flex items-center gap-1 text-blue-600">
                  <FaCommentAlt />
                  <span>{story.comments.length}</span>
                </button>
              </div>

              {story.showCommentBox && (
                <div className="mt-3">
                  <input
                    type="text"
                    placeholder="Write a comment..."
                    value={story.commentText}
                    onChange={(e) => handleCommentChange(idx, e.target.value)}
                    className="w-full p-2 border rounded-lg mt-1"
                  />
                  <button
                    onClick={() => postComment(idx)}
                    className="bg-blue-500 text-white px-3 py-1 rounded-md mt-2 float-right"
                  >
                    Comment
                  </button>
                </div>
              )}

              {story.comments.length > 0 && (
                <div className="mt-3 border-t pt-2 text-sm space-y-2">
                  {story.comments.map((c, i) => (
                    <div key={i} className="text-gray-700">
                      <span className="block">{c.text}</span>
                      <span className="text-xs text-gray-400">{c.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default Profile;
