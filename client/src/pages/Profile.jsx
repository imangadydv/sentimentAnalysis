import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaHeart,
  FaRegHeart,
  FaCommentAlt,
  FaTrash,
  FaSyncAlt,
  FaImage,
  FaCamera,
  FaPen,
} from "react-icons/fa";
import { API_SERVER } from "../config";

const CAPTION_MAX = 500;
const BIO_MAX = 160;

function relativeTime(date) {
  const d = new Date(date);
  const now = Date.now();
  const diff = now - d.getTime();
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: d.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined });
}

function memberSince(createdAt) {
  const d = new Date(createdAt);
  return d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

function getInitials(username) {
  if (!username) return "?";
  const parts = username.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return username.slice(0, 2).toUpperCase();
}

const Profile = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [stories, setStories] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [editingBio, setEditingBio] = useState(false);
  const [bioDraft, setBioDraft] = useState("");
  const [savingBio, setSavingBio] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [savingAvatar, setSavingAvatar] = useState(false);
  const avatarInputRef = useRef(null);
  const bioInputRef = useRef(null);

  const fetchProfile = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    else setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_SERVER}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        const postsWithState = (data.stories || []).map((story) => ({
          ...story,
          id: story._id || story.id || `s-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          imageUrl: story.image ? `${API_SERVER}${story.image}` : "",
          liked: false,
          likeCount: story.likeCount || 0,
          comments: [],
          showCommentBox: false,
          commentText: "",
        }));
        setUser(data);
        setStories(postsWithState);
        setBioDraft(data.bio || "");
        setError("");
      } else setError(data.message || "Failed to fetch profile.");
    } catch (err) {
      setError("Error loading profile.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(""), 4000);
    return () => clearTimeout(t);
  }, [message]);

  useEffect(() => {
    if (editingBio && bioInputRef.current) bioInputRef.current.focus();
  }, [editingBio]);

  const updateProfile = async (updates) => {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    if (updates.avatar instanceof File) formData.append("avatar", updates.avatar);
    if (updates.bio !== undefined) formData.append("bio", updates.bio);
    const response = await fetch(`${API_SERVER}/api/profile`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!response.ok) throw new Error("Update failed");
    return response.json();
  };

  const handleAvatarClick = () => avatarInputRef.current?.click();
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarFile(file);
    setSavingAvatar(true);
    try {
      const updated = await updateProfile({ avatar: file, bio: user?.bio ?? bioDraft });
      setUser((u) => (u ? { ...u, ...updated } : updated));
      setAvatarFile(null);
      setAvatarPreview("");
    } catch (_) {
      setMessage("Failed to update photo.");
    } finally {
      setSavingAvatar(false);
      e.target.value = "";
    }
  };

  const saveBio = async () => {
    const trimmed = bioDraft.slice(0, BIO_MAX).trim();
    setSavingBio(true);
    try {
      const updated = await updateProfile({ bio: trimmed });
      setUser((u) => (u ? { ...u, bio: updated.bio } : u));
      setEditingBio(false);
    } catch (_) {
      setMessage("Failed to update bio.");
    } finally {
      setSavingBio(false);
    }
  };

  const handlePost = async () => {
    if (!caption.trim() && !image) {
      setMessage("Please add a caption or image.");
      return;
    }
    setPosting(true);
    setMessage("");
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("caption", caption);
      if (image) formData.append("image", image);

      const response = await fetch(`${API_SERVER}/api/analyze-post`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json();

      if (response.ok) {
        const d = data?.data || {};
        const imageUrl = d.image ? `${API_SERVER}${d.image}` : "";
        setStories((prev) => [
          {
            id: d._id,
            _id: d._id,
            caption: d.caption ?? caption,
            imageUrl,
            createdAt: d.createdAt ? new Date(d.createdAt) : new Date(),
            liked: false,
            likeCount: 0,
            comments: [],
            showCommentBox: false,
            commentText: "",
          },
          ...prev,
        ]);
        setCaption("");
        setImage(null);
        setImagePreviewUrl("");
        setMessage("Posted!");
      } else {
        setMessage(data.message || "Post not allowed due to negative sentiment.");
      }
    } catch (err) {
      setMessage("Something went wrong.");
    } finally {
      setPosting(false);
    }
  };

  const removeImage = () => {
    setImage(null);
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setImagePreviewUrl("");
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setImage(file);
    setImagePreviewUrl(URL.createObjectURL(file));
  };

  const deletePost = async (id) => {
    if (!window.confirm("Remove this post?")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_SERVER}/api/posts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setStories((prev) => prev.filter((p) => (p.id || p._id) !== id));
      } else {
        const data = await res.json().catch(() => ({}));
        setMessage(data.message || "Could not delete post.");
      }
    } catch (_) {
      setMessage("Could not delete post.");
    }
  };

  const toggleLike = (id) => {
    setStories((prev) =>
      prev.map((p) =>
        (p.id || p._id) === id
          ? { ...p, liked: !p.liked, likeCount: (p.likeCount || 0) + (p.liked ? -1 : 1) }
          : p
      )
    );
  };

  const toggleCommentBox = (id) => {
    setStories((prev) =>
      prev.map((p) => ((p.id || p._id) === id ? { ...p, showCommentBox: !p.showCommentBox } : p))
    );
  };

  const handleCommentChange = (id, value) => {
    setStories((prev) =>
      prev.map((p) => ((p.id || p._id) === id ? { ...p, commentText: value } : p))
    );
  };

  const postComment = (id) => {
    setStories((prev) =>
      prev.map((p) => {
        if ((p.id || p._id) !== id || !p.commentText?.trim()) return p;
        return {
          ...p,
          comments: [...(p.comments || []), { text: p.commentText, time: new Date().toLocaleString() }],
          commentText: "",
          showCommentBox: false,
        };
      })
    );
  };

  if (error && !user) {
    return (
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => fetchProfile()}
            className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-full font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (loading && !user) {
    return (
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const avatarUrl = user.avatar ? `${API_SERVER}${user.avatar}` : null;
  const displayAvatar = avatarPreview || avatarUrl;

  return (
    <div className="min-h-[calc(100vh-120px)] bg-[var(--color-surface)]">
      {/* Cover / Banner */}
      <div
        className="h-40 sm:h-52 w-full bg-gradient-to-br from-[var(--color-primary)] via-indigo-600 to-[var(--color-accent)]"
        style={{ backgroundImage: user.cover ? `url(${API_SERVER}${user.cover})` : undefined, backgroundSize: "cover", backgroundPosition: "center" }}
      />

      <div className="max-w-2xl mx-auto px-4 -mt-20 sm:-mt-24 relative">
        {/* Avatar */}
        <div className="relative inline-block">
          <button
            type="button"
            onClick={handleAvatarClick}
            disabled={savingAvatar}
            className="block rounded-full w-32 h-32 sm:w-36 sm:h-36 border-4 border-[var(--color-surface-elevated)] overflow-hidden bg-[var(--color-surface-elevated)] shadow-[var(--shadow-lg)] hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 focus:ring-offset-[var(--color-surface)]"
          >
            {displayAvatar ? (
              <img src={displayAvatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-[var(--color-primary)] bg-[var(--color-surface)]">
                {getInitials(user.username)}
              </div>
            )}
            {savingAvatar && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </button>
          <span
            className="absolute bottom-0 right-0 flex items-center justify-center w-9 h-9 rounded-full bg-[var(--color-primary)] text-white border-2 border-[var(--color-surface-elevated)]"
            title="Change photo"
          >
            <FaCamera className="text-sm" />
          </span>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>

        {/* Name, handle, bio, meta */}
        <div className="mt-4 flex justify-between items-start">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-text)]">
              {user.username}
            </h1>
            <p className="text-[var(--color-text-muted)]">@{user.username}</p>
          </div>
          <button
            type="button"
            onClick={() => fetchProfile(true)}
            disabled={refreshing}
            className="p-2 rounded-full text-[var(--color-text-muted)] hover:bg-[var(--color-surface-elevated)] transition"
            title="Refresh"
          >
            <FaSyncAlt className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>

        {editingBio ? (
          <div className="mt-3">
            <textarea
              ref={bioInputRef}
              value={bioDraft}
              onChange={(e) => setBioDraft(e.target.value.slice(0, BIO_MAX))}
              placeholder="Add a bio"
              rows={3}
              className="w-full p-3 rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] text-[var(--color-text)] resize-none"
            />
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-[var(--color-text-muted)]">{bioDraft.length}/{BIO_MAX}</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setEditingBio(false); setBioDraft(user.bio || ""); }}
                  className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveBio}
                  disabled={savingBio}
                  className="text-sm font-medium text-[var(--color-primary)]"
                >
                  {savingBio ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div
            className="mt-2 text-[var(--color-text)] min-h-[1.5rem] cursor-pointer group flex items-center gap-2"
            onClick={() => setEditingBio(true)}
          >
            {(user.bio || "").trim() ? (
              <span className="whitespace-pre-wrap">{(user.bio || "").trim()}</span>
            ) : (
              <span className="text-[var(--color-text-muted)]">Add a bio</span>
            )}
            <FaPen className="text-xs text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition" />
          </div>
        )}

        <p className="mt-2 text-sm text-[var(--color-text-muted)] flex items-center gap-1">
          <span>Joined {memberSince(user.createdAt)}</span>
        </p>

        <div className="flex gap-6 mt-3 text-sm">
          <span className="text-[var(--color-text)]">
            <strong className="text-[var(--color-text)]">{stories.length}</strong>{" "}
            <span className="text-[var(--color-text-muted)]">Posts</span>
          </span>
        </div>

        {/* Composer - Tweet style */}
        <div className="mt-6 bg-[var(--color-surface-elevated)] rounded-2xl border border-[var(--color-border)] overflow-hidden shadow-[var(--shadow-sm)]">
          <div className="flex gap-3 p-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden bg-[var(--color-primary)] text-white flex items-center justify-center text-sm font-bold">
              {displayAvatar ? (
                <img src={displayAvatar} alt="" className="w-full h-full object-cover" />
              ) : (
                getInitials(user.username)
              )}
            </div>
            <div className="flex-1 min-w-0">
              <textarea
                rows={3}
                value={caption}
                onChange={(e) => setCaption(e.target.value.slice(0, CAPTION_MAX))}
                placeholder="What's happening? Posts are checked for sentiment."
                className="w-full p-0 border-0 bg-transparent text-[var(--color-text)] placeholder-[var(--color-text-muted)] resize-none focus:outline-none focus:ring-0"
                maxLength={CAPTION_MAX}
              />
              {imagePreviewUrl && (
                <div className="mt-2 relative rounded-2xl overflow-hidden inline-block">
                  <img src={imagePreviewUrl} alt="" className="max-h-48 object-cover rounded-2xl" />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-black/80"
                  >
                    <FaTrash className="text-xs" />
                  </button>
                </div>
              )}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--color-border)]">
                <label className="flex items-center gap-1 text-[var(--color-primary)] cursor-pointer hover:underline text-sm">
                  <FaImage />
                  <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                  Photo
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--color-text-muted)]">{caption.length}/{CAPTION_MAX}</span>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handlePost}
                    disabled={posting || (!caption.trim() && !image)}
                    className="px-4 py-2 rounded-full bg-[var(--color-primary)] text-white text-sm font-semibold hover:bg-[var(--color-primary-hover)] disabled:opacity-50 transition"
                  >
                    {posting ? "Posting…" : "Post"}
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
          {message && (
            <p className={`px-4 pb-3 text-sm ${message.includes("!") ? "text-green-600" : "text-red-600"}`}>
              {message}
            </p>
          )}
        </div>

        {/* Posts - Tweet cards */}
        <div className="mt-4 space-y-0">
          {stories.length === 0 ? (
            <div className="py-12 text-center text-[var(--color-text-muted)] rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)]">
              <p className="font-medium text-[var(--color-text)]">No posts yet</p>
              <p className="text-sm mt-1">Share your first post above.</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {stories.map((story) => {
                const id = story.id || story._id;
                const isLong = story.caption && story.caption.length > 120;
                const expanded = expandedIds.has(id);
                const captionShow = isLong && !expanded ? story.caption.slice(0, 120) + "…" : story.caption;
                const toggleExpanded = () =>
                  setExpandedIds((prev) => {
                    const next = new Set(prev);
                    if (next.has(id)) next.delete(id);
                    else next.add(id);
                    return next;
                  });
                return (
                  <motion.article
                    key={id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex gap-3 py-4 px-4 border-b border-[var(--color-border)] hover:bg-[var(--color-surface)]/50 transition"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden bg-[var(--color-primary)] text-white flex items-center justify-center text-sm font-bold">
                      {displayAvatar ? (
                        <img src={displayAvatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        getInitials(user.username)
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-[var(--color-text)]">{user.username}</span>
                        <span className="text-[var(--color-text-muted)] text-sm">@{user.username}</span>
                        <span className="text-[var(--color-text-muted)] text-sm">·</span>
                        <span className="text-[var(--color-text-muted)] text-sm">{relativeTime(story.createdAt)}</span>
                        <button
                          type="button"
                          onClick={() => deletePost(id)}
                          className="ml-auto p-1 text-[var(--color-text-muted)] hover:text-red-600 rounded"
                          title="Delete"
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      </div>
                      {story.caption && (
                        <p className="text-[var(--color-text)] mt-0.5 whitespace-pre-wrap">
                          {captionShow}
                          {isLong && (
                            <button
                              type="button"
                              onClick={toggleExpanded}
                              className="ml-1 text-[var(--color-primary)] text-sm"
                            >
                              {expanded ? " Show less" : " Read more"}
                            </button>
                          )}
                        </p>
                      )}
                      {story.imageUrl && (
                        <img
                          src={story.imageUrl}
                          alt=""
                          className="mt-2 rounded-2xl max-h-80 w-full object-cover border border-[var(--color-border)]"
                        />
                      )}
                      <div className="flex items-center gap-6 mt-2 text-[var(--color-text-muted)]">
                        <button
                          onClick={() => toggleLike(id)}
                          className="flex items-center gap-1.5 hover:text-pink-600 transition"
                        >
                          {story.liked ? <FaHeart className="text-pink-600" /> : <FaRegHeart />}
                          <span>{story.likeCount || 0}</span>
                        </button>
                        <button
                          onClick={() => toggleCommentBox(id)}
                          className="flex items-center gap-1.5 hover:text-[var(--color-primary)] transition"
                        >
                          <FaCommentAlt />
                          <span>{story.comments?.length || 0}</span>
                        </button>
                      </div>
                      {story.showCommentBox && (
                        <div className="mt-3 flex gap-2">
                          <input
                            type="text"
                            placeholder="Reply..."
                            value={story.commentText || ""}
                            onChange={(e) => handleCommentChange(id, e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && postComment(id)}
                            className="flex-1 px-3 py-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-sm"
                          />
                          <button
                            onClick={() => postComment(id)}
                            className="px-3 py-2 rounded-full bg-[var(--color-primary)] text-white text-sm font-medium"
                          >
                            Reply
                          </button>
                        </div>
                      )}
                      {(story.comments?.length || 0) > 0 && (
                        <div className="mt-3 space-y-2 pl-2 border-l-2 border-[var(--color-border)]">
                          {story.comments.map((c, i) => (
                            <div key={i} className="text-sm">
                              <span className="text-[var(--color-text)]">{c.text}</span>
                              <span className="text-xs text-[var(--color-text-muted)] block">{c.time}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
