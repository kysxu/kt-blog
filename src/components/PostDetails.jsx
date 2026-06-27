import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../lib/api";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { ArrowLeft, Heart, Link2, Facebook, Linkedin, Twitter, MessageSquare, Send } from "lucide-react";

const authorImage = "https://res.cloudinary.com/dcbpjtd1r/image/upload/v1728449784/my-blog-post/xgfy0xnvyemkklcqodkg.jpg";

export default function PostDetails() {
  const { postId } = useParams();
  const navigate = useNavigate();
  
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState("");
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Load user session
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await api.getCurrentUser();
        if (user) {
          setIsLoggedIn(true);
          setCurrentUser(user);
        }
      } catch (err) {
        setIsLoggedIn(false);
        setCurrentUser(null);
      }
    };
    checkAuth();
  }, []);

  // Fetch post details
  useEffect(() => {
    const loadPost = async () => {
      setIsLoading(true);
      try {
        const fetchedPost = await api.fetchPostById(postId);
        setPost(fetchedPost);
        setLikes(fetchedPost.likes || 0);

        // Load comments from localStorage or initialize with default
        const localComments = localStorage.getItem(`comments_${postId}`);
        if (localComments) {
          setComments(JSON.parse(localComments));
        } else {
          // Default mock comments
          const defaultComments = [
            {
              id: 1,
              authorName: "John Doe",
              content: "This was an amazing read! Very helpful insights.",
              date: "12 September 2024",
            }
          ];
          setComments(defaultComments);
          localStorage.setItem(`comments_${postId}`, JSON.stringify(defaultComments));
        }
      } catch (error) {
        console.error("Failed to load post:", error);
        navigate("/404");
      } finally {
        setIsLoading(false);
      }
    };
    loadPost();
  }, [postId, navigate]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-40 text-lg font-medium text-muted-foreground animate-pulse">
        Loading...
      </div>
    );
  }

  if (!post) return null;

  // Handle Likes
  const handleLike = () => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }

    if (hasLiked) {
      setLikes(prev => prev - 1);
      setHasLiked(false);
      // Persist in localStorage fallback
      updatePostLikes(post.id, likes - 1);
    } else {
      setLikes(prev => prev + 1);
      setHasLiked(true);
      updatePostLikes(post.id, likes + 1);
    }
  };

  const updatePostLikes = (id, newLikesCount) => {
    try {
      api.updateAdminPost(id, { likes: newLikesCount });
    } catch (e) {
      console.warn("Could not save likes count:", e);
    }
  };

  // Copy Link
  const handleCopyLink = () => {
    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl)
      .then(() => {
        toast.success("Copied! This article has been copied to your clipboard.");
      })
      .catch(() => {
        toast.error("Failed to copy link.");
      });
  };

  // Social Share URLs
  const encodedUrl = encodeURIComponent(window.location.href);
  const facebookShareUrl = `https://www.facebook.com/share.php?u=${encodedUrl}`;
  const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
  const twitterShareUrl = `https://www.twitter.com/share?url=${encodedUrl}`;

  // Handle Add Comment
  const handleAddComment = (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }

    if (!commentInput.trim()) return;

    const newComment = {
      id: Date.now(),
      authorName: currentUser.username || currentUser.email,
      content: commentInput,
      date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }),
    };

    const updatedComments = [newComment, ...comments];
    setComments(updatedComments);
    localStorage.setItem(`comments_${postId}`, JSON.stringify(updatedComments));
    setCommentInput("");
    toast.success("Comment posted successfully!");
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Back Navigation */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-muted-foreground hover:text-foreground mb-6 font-medium transition-colors cursor-pointer gap-2"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Main Post Content */}
      <article className="flex flex-col gap-6 mb-16">
        <div className="flex">
          <span className="bg-green-200 text-green-700 rounded-full px-3 py-1 text-sm font-semibold mb-2">
            {post.category}
          </span>
        </div>
        
        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground leading-tight">
          {post.title}
        </h1>

        <div className="flex items-center justify-between border-y border-border py-4 my-2 text-sm">
          <div className="flex items-center">
            <img
              className="w-10 h-10 rounded-full mr-3"
              src={authorImage}
              alt={post.author}
            />
            <div>
              <p className="font-bold text-foreground">{post.author}</p>
              <p className="text-muted-foreground text-xs">{new Date(post.date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            {/* Likes */}
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 cursor-pointer transition-colors ${
                hasLiked ? "text-red-500 font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Heart className={`w-5 h-5 ${hasLiked ? "fill-red-500" : ""}`} />
              <span>{likes}</span>
            </button>
          </div>
        </div>

        {/* Thumbnail Image */}
        {post.image && (
          <div className="w-full h-[250px] sm:h-[450px] overflow-hidden rounded-md my-4">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Markdown Rendered Content */}
        <div className="prose dark:prose-invert max-w-none my-6">
          <ReactMarkdown className="markdown text-foreground leading-relaxed">
            {post.content}
          </ReactMarkdown>
        </div>

        {/* Copy Link & Share Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6 mt-6">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 border border-border px-4 py-2.5 rounded-full text-sm font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <Link2 className="w-4 h-4" /> Copy link
          </button>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground font-medium">Share:</span>
            <a
              href={facebookShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-full border border-border text-muted-foreground hover:text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <Facebook className="w-4 h-4" />
            </a>
            <a
              href={linkedinShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-full border border-border text-muted-foreground hover:text-blue-700 hover:bg-blue-50 transition-colors"
            >
              <Linkedin className="w-4 h-4" />
            </a>
            <a
              href={twitterShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-full border border-border text-muted-foreground hover:text-sky-500 hover:bg-sky-50 transition-colors"
            >
              <Twitter className="w-4 h-4" />
            </a>
          </div>
        </div>
      </article>

      {/* Comments Section */}
      <section className="border-t border-border pt-10 mb-20">
        <h3 className="text-xl font-bold mb-6 text-foreground flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-muted-foreground" /> Comments ({comments.length})
        </h3>

        {/* Comment input form */}
        <form onSubmit={handleAddComment} className="flex flex-col gap-3 mb-10">
          <textarea
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            placeholder="What are your thoughts?"
            rows={4}
            className="w-full p-4 border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground bg-white"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-foreground text-background font-semibold rounded-md hover:opacity-90 transition-opacity cursor-pointer"
            >
              <Send className="w-4 h-4" /> Send
            </button>
          </div>
        </form>

        {/* Comments List */}
        <div className="flex flex-col gap-6">
          {comments.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4">No comments yet. Be the first to share your thoughts!</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3 pb-6 border-b border-border last:border-b-0">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-xs shrink-0">
                  {comment.authorName ? comment.authorName.substring(0, 2).toUpperCase() : "U"}
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-foreground">{comment.authorName}</span>
                    <span className="text-muted-foreground text-xs">{comment.date}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Alert Dialog (Custom Modal for Authentication Block) */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-border rounded-lg shadow-lg w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
            <h4 className="text-lg font-bold text-foreground mb-2">Login Required</h4>
            <p className="text-sm text-muted-foreground mb-6">
              You must log in to like articles or leave a comment. Would you like to log in now?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowAuthModal(false)}
                className="px-4 py-2 border border-border rounded-md text-sm text-foreground hover:bg-muted font-medium cursor-pointer"
              >
                Cancel
              </button>
              <Link
                to="/login"
                onClick={() => setShowAuthModal(false)}
                className="px-4 py-2 bg-foreground text-background rounded-md text-sm hover:opacity-90 font-semibold cursor-pointer"
              >
                Go to Login
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
