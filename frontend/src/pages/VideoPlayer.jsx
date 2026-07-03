import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import API from '../api';
import { Auth } from '../auth';
import '../styles/VideoPlayer.css';

function VideoPlayer() {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);

  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [video, setVideo] = useState(null);

  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  // ---- Comment section state ----
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [postingComment, setPostingComment] = useState(false);
  const [totalComments, setTotalComments] = useState(0);
  const [likedCommentIds, setLikedCommentIds] = useState(new Set());
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');

  useEffect(() => {
    const userData = Auth.getUser();
    if (userData) {
      setUser(userData);
    }
    fetchAllData(userData);
  }, [videoId]);

  // ---- Fetch video, comments, and the user's subscribed-channels list all at once ----
  // Using Promise.allSettled so that if ONE call fails (e.g. subscriptions),
  // the other two (video, comments) still work instead of the whole page breaking.
  const fetchAllData = async (userData) => {
    setLoading(true);
    setCommentsLoading(true);
    try {
      const results = await Promise.allSettled([
        API.getVideoById(videoId),
        API.getVideoComments(videoId, 1, 20),
        userData && typeof API.getSubscribedChannels === 'function'
          ? API.getSubscribedChannels(userData._id)
          : Promise.resolve(null)
      ]);

      const videoRes = results[0].status === 'fulfilled' ? results[0].value : null;
      const commentsRes = results[1].status === 'fulfilled' ? results[1].value : null;
      const subsRes = results[2].status === 'fulfilled' ? results[2].value : null;

      if (results[0].status === 'rejected') console.error('Video fetch failed:', results[0].reason);
      if (results[1].status === 'rejected') console.error('Comments fetch failed:', results[1].reason);
      if (results[2].status === 'rejected') console.error('Subscribed channels fetch failed:', results[2].reason);

      console.log('Video Response:', videoRes);
      console.log('Comments Response:', commentsRes);
      console.log('Subscribed Channels Response:', subsRes);

      // ---- Video ----
      if (videoRes?.success && videoRes?.data) {
        const videoData = videoRes.data;
        setVideo(videoData);

        const likes = videoData[0]?.likes || [];
        setLikeCount(likes.length);
        setIsLiked(!!(userData && likes.includes(userData._id)));

        // ---- Subscription status (compare channel owner against fetched list) ----
        const channelId = videoData[0]?.owner?._id;
        if (subsRes?.success && Array.isArray(subsRes?.data) && channelId) {
          const subscribed = subsRes.data.some(
            (item) => item?.chennels?._id?.toString() === channelId.toString()
          );
          setIsSubscribed(subscribed);
        }
      }

      // ---- Comments ----
      if (commentsRes?.success && commentsRes?.data) {
        setComments(commentsRes.data.comments || []);
        setTotalComments(commentsRes.data.totalComments || 0);
      }
    } catch (error) {
      console.error('Error loading video page data:', error);
    } finally {
      setLoading(false);
      setCommentsLoading(false);
    }
  };

  // ---- Comment handlers ----
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    if (!user) {
      alert('Please sign in to comment');
      return;
    }

    try {
      setPostingComment(true);
      const response = await API.addComment(videoId, commentText.trim());
      if (response?.success && response?.data) {
        setComments((prev) => [response.data, ...prev]);
        setTotalComments((prev) => prev + 1);
        setCommentText('');
      } else {
        alert(response?.message || 'Failed to post comment');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      alert(error?.message || 'Failed to post comment');
    } finally {
      setPostingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const response = await API.deleteComment(commentId);
      if (response?.success) {
        setComments((prev) => prev.filter((c) => c._id !== commentId));
        setTotalComments((prev) => Math.max(prev - 1, 0));
      } else {
        alert(response?.message || 'Failed to delete comment');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert(error?.message || 'Failed to delete comment');
    }
  };

  const handleToggleCommentLike = async (commentId) => {
    if (!user) {
      alert('Please sign in to like comments');
      return;
    }
    try {
      const response = await API.toggleCommentLike(commentId);
      if (response?.success) {
        setLikedCommentIds((prev) => {
          const next = new Set(prev);
          if (next.has(commentId)) {
            next.delete(commentId);
          } else {
            next.add(commentId);
          }
          return next;
        });
      } else {
        alert(response?.message || 'Failed to toggle comment like');
      }
    } catch (error) {
      console.error('Comment like error:', error);
      alert(error?.message || 'Failed to toggle comment like');
    }
  };

  const startEditComment = (comment) => {
    setEditingCommentId(comment._id);
    setEditCommentText(comment.content);
  };

  const cancelEditComment = () => {
    setEditingCommentId(null);
    setEditCommentText('');
  };

  const handleUpdateComment = async (commentId) => {
    if (!editCommentText.trim()) {
      alert('Comment cannot be empty');
      return;
    }
    try {
      const response = await API.updateComment(commentId, editCommentText.trim());
      if (response?.success && response?.data) {
        setComments((prev) =>
          prev.map((c) => (c._id === commentId ? { ...c, content: response.data.content } : c))
        );
        setEditingCommentId(null);
        setEditCommentText('');
      } else {
        alert(response?.message || 'Failed to update comment');
      }
    } catch (error) {
      console.error('Error updating comment:', error);
      alert(error?.message || 'Failed to update comment');
    }
  };

  const formatCommentDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString();
  };

  const handleToggleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      alert('Please sign in to like this video');
      return;
    }

    try {
      const response = await API.toggleVideoLike(videoId);
      if (response?.success) {
        const newLikedState = !isLiked;
        setIsLiked(newLikedState);
        setLikeCount(newLikedState ? likeCount + 1 : likeCount - 1);
      } else {
        alert(response?.message || 'Failed to toggle like');
      }
    } catch (error) {
      console.error('Like error:', error);
      alert(error?.message || 'Failed to toggle like');
    }
  };

  // ---- Subscribe handler (real backend call) ----
  const handleToggleSubscribe = async () => {
    if (!user) {
      alert('Please sign in to subscribe');
      return;
    }

    const channelId = video?.[0]?.owner?._id;
    if (!channelId) {
      console.error('Channel ID not found on video owner, cannot subscribe.');
      return;
    }

    try {
      setSubscribing(true);
      const response = await API.toggleSubscription(channelId);
      if (response?.success) {
        setIsSubscribed((prev) => !prev);
      } else {
        alert(response?.message || 'Failed to toggle subscription');
      }
    } catch (error) {
      console.error('Subscribe error:', error);
      alert(error?.message || 'Failed to toggle subscription');
    } finally {
      setSubscribing(false);
    }
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration || 1;
      setProgress((current / total) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    if (videoRef.current) {
      videoRef.current.currentTime = x * videoRef.current.duration;
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatViews = (views) => {
    if (views >= 1000000) return (views / 1000000).toFixed(1) + 'M';
    if (views >= 1000) return (views / 1000).toFixed(1) + 'K';
    return views?.toString() || '0';
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (loading) {
    return (
      <div className="video-player-container">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="main-wrapper">
          <Navbar user={user} onMenuClick={toggleSidebar} searchQuery="" onSearchChange={() => {}} onSearchSubmit={() => {}} />
          <div className="loading-state">Loading video...</div>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="video-player-container">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="main-wrapper">
          <Navbar user={user} onMenuClick={toggleSidebar} searchQuery="" onSearchChange={() => {}} onSearchSubmit={() => {}} />
          <div className="error-state">Video not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="video-player-container">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-wrapper">
        <Navbar
          user={user}
          onMenuClick={toggleSidebar}
          searchQuery=""
          onSearchChange={() => {}}
          onSearchSubmit={() => {}}
        />

        <div className="video-player-content">
          <div className="video-player-main">
            <div className="video-player-wrapper">
              <video
                ref={videoRef}
                className="video-player"
                src={video[0].videoFile}
                poster={video[0].thumbnail}
                onClick={handlePlayPause}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                controls
                preload="metadata"
              />
              <div className="video-controls">
                <div className="video-progress-bar" onClick={handleSeek}>
                  <div className="video-progress-fill" style={{ width: `${progress}%` }}></div>
                </div>
                <div className="video-controls-bottom">
                  <button className="video-control-btn" onClick={handlePlayPause}>
                    <i className={`fas fa-${isPlaying ? 'pause' : 'play'}`}></i>
                  </button>
                  <span className="video-time">
                    {formatTime(videoRef.current?.currentTime)} / {formatTime(duration)}
                  </span>
                  <button className="video-control-btn">
                    <i className="fas fa-volume-up"></i>
                  </button>
                  <button className="video-control-btn">
                    <i className="fas fa-expand"></i>
                  </button>
                </div>
              </div>
            </div>

            <div className="video-info-section">
              <h1 className="video-title">{video[0].title}</h1>
              <div className="video-meta">
                <div className="video-owner">
                  <img className="video-owner-avatar" src={video[0].owner?.avatar} alt={video[0].owner?.fullName} />
                  <div className="video-owner-info">
                    <span className="video-owner-name">{video[0].owner?.fullName}</span>
                    <span className="video-owner-subs">{video[0].owner?.subscribers?.toLocaleString()} subscribers</span>
                  </div>
                  <button
                    className={`subscribe-btn ${isSubscribed ? 'subscribed' : ''}`}
                    onClick={handleToggleSubscribe}
                    disabled={subscribing}
                  >
                    {subscribing ? '...' : isSubscribed ? 'Subscribed' : 'Subscribe'}
                  </button>
                </div>
                <div className="video-stats">
                  <button
                    className={`like-btn ${isLiked ? 'liked' : ''}`}
                    onClick={handleToggleLike}
                    type="button"
                  >
                    <i className={`fas fa-heart ${isLiked ? 'liked' : ''}`}></i>
                    <span>{likeCount}</span>
                  </button>
                  <span className="video-views">{formatViews(video[0].views)} views</span>
                  <span className="video-date">
                    {new Date(video[0].createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <p className="video-description">{video[0].description}</p>
            </div>

            {/* ---- Comment Section ---- */}
            <div className="comments-section">
              <h3 className="comments-heading">{totalComments} Comments</h3>

              <form className="comment-form" onSubmit={handleAddComment}>
                <img
                  className="comment-form-avatar"
                  src={user?.avatar || 'https://via.placeholder.com/40'}
                  alt={user?.fullName || 'You'}
                />
                <input
                  type="text"
                  className="comment-input"
                  placeholder={user ? 'Add a comment...' : 'Sign in to comment'}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  disabled={!user || postingComment}
                />
                <button
                  type="submit"
                  className="comment-submit-btn"
                  disabled={!user || postingComment || !commentText.trim()}
                >
                  {postingComment ? 'Posting...' : 'Comment'}
                </button>
              </form>

              {commentsLoading ? (
                <div className="comments-loading">Loading comments...</div>
              ) : comments.length === 0 ? (
                <div className="comments-empty">No comments yet. Be the first to comment!</div>
              ) : (
                <div className="comments-list">
                  {comments.map((comment) => {
                    const isOwner = user && comment.owner?.toString() === user._id?.toString();
                    return (
                      <div className="comment-item" key={comment._id}>
                        <img
                          className="comment-avatar"
                          src={comment.owner?.avatar || 'https://via.placeholder.com/36'}
                          alt="user"
                        />
                        <div className="comment-body">
                          <div className="comment-header">
                            <span className="comment-author">
                              {comment.owner?.fullName || comment.owner?.username || 'User'}
                            </span>
                            <span className="comment-date">{formatCommentDate(comment.createdAt)}</span>
                          </div>

                          {editingCommentId === comment._id ? (
                            <div className="comment-edit-box">
                              <input
                                type="text"
                                className="comment-edit-input"
                                value={editCommentText}
                                onChange={(e) => setEditCommentText(e.target.value)}
                                autoFocus
                              />
                              <div className="comment-edit-actions">
                                <button
                                  type="button"
                                  className="comment-edit-cancel"
                                  onClick={cancelEditComment}
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  className="comment-edit-save"
                                  onClick={() => handleUpdateComment(comment._id)}
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="comment-content">{comment.content}</p>
                          )}

                          <button
                            className={`comment-like-btn ${likedCommentIds.has(comment._id) ? 'liked' : ''}`}
                            onClick={() => handleToggleCommentLike(comment._id)}
                            type="button"
                          >
                            <i className={`fas fa-heart ${likedCommentIds.has(comment._id) ? 'liked' : ''}`}></i>
                          </button>
                        </div>
                        {isOwner && editingCommentId !== comment._id && (
                          <div className="comment-owner-actions">
                            <button
                              className="comment-edit-btn"
                              onClick={() => startEditComment(comment)}
                              title="Edit comment"
                              type="button"
                            >
                              <i className="fas fa-pen"></i>
                            </button>
                            <button
                              className="comment-delete-btn"
                              onClick={() => handleDeleteComment(comment._id)}
                              title="Delete comment"
                              type="button"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <footer>YouTube Clone · Video Player</footer>
      </div>
    </div>
  );
}

export default VideoPlayer;