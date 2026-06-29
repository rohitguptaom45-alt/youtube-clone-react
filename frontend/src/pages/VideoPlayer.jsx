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
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [showMenu, setShowMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [commentCount, setCommentCount] = useState(0);

  useEffect(() => {
    const userData = Auth.getUser();
    if (userData) {
      setUser(userData);
    }
    fetchVideoData();
    fetchComments();
  }, [videoId]);

  const fetchVideoData = async () => {
    try {
      setLoading(true);
      const response = await API.getVideoById(videoId);
      if (response?.success && response?.data) {
        setVideo(response.data);
        const likes = response.data.likes || [];
        setLikeCount(likes.length);
        if (user && likes.includes(user._id)) {
          setIsLiked(true);
        } else {
          setIsLiked(false);
        }
      }
    } catch (error) {
      console.error('Error fetching video:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await API.getVideoComments(videoId);
      if (response?.success) {
        setComments(response.data || []);
        setCommentCount(response.data?.length || 0);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      setComments([]);
      setCommentCount(0);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      alert('Please write a comment!');
      return;
    }

    try {
      const response = await API.addComment(videoId, newComment.trim());
      if (response?.success) {
        setNewComment('');
        await fetchComments();
      } else {
        alert(response?.message || 'Failed to add comment');
      }
    } catch (error) {
      alert(error?.message || 'Failed to add comment');
    }
  };

  const handleUpdateComment = async (commentId) => {
    if (!editContent.trim()) {
      alert('Please write something!');
      return;
    }

    try {
      const response = await API.updateComment(commentId, editContent.trim());
      if (response?.success) {
        setEditingComment(null);
        setEditContent('');
        setShowMenu(null);
        await fetchComments();
      } else {
        alert(response?.message || 'Failed to update comment');
      }
    } catch (error) {
      alert(error?.message || 'Failed to update comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      const response = await API.deleteComment(commentId);
      if (response?.success) {
        setShowMenu(null);
        await fetchComments();
      } else {
        alert(response?.message || 'Failed to delete comment');
      }
    } catch (error) {
      alert(error?.message || 'Failed to delete comment');
    }
  };

  const handleToggleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
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

  const handleToggleCommentLike = async (commentId) => {
    try {
      const response = await API.toggleCommentLike(commentId);
      if (response?.success) {
        await fetchComments();
      } else {
        alert(response?.message || 'Failed to like comment');
      }
    } catch (error) {
      alert(error?.message || 'Failed to like comment');
    }
  };

  const handleSubscribe = () => {
    setIsSubscribed(!isSubscribed);
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

  const getTimeAgo = (dateStr) => {
    const now = new Date();
    const diff = now - new Date(dateStr);
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`;
    if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return `${seconds} second${seconds > 1 ? 's' : ''} ago`;
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
                src={video.videoFile}
                poster={video.thumbnail}
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
              <h1 className="video-title">{video.title}</h1>
              <div className="video-meta">
                <div className="video-owner">
                  <img className="video-owner-avatar" src={video.owner?.avatar} alt={video.owner?.fullName} />
                  <div className="video-owner-info">
                    <span className="video-owner-name">{video.owner?.fullName}</span>
                    <span className="video-owner-subs">{video.owner?.subscribers?.toLocaleString()} subscribers</span>
                  </div>
                  <button className={`subscribe-btn ${isSubscribed ? 'subscribed' : ''}`} onClick={handleSubscribe}>
                    {isSubscribed ? 'Subscribed' : 'Subscribe'}
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
                  <span className="video-views">{formatViews(video.views)} views</span>
                  <span className="video-date">
                    {new Date(video.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <p className="video-description">{video.description}</p>
            </div>

            <div className="comments-section">
              <div className="comments-header">
                <h3 className="comments-title">
                  <i className="fas fa-comments"></i> Comments ({commentCount})
                </h3>
              </div>

              {user ? (
                <div className="comment-input-wrapper">
                  <img className="comment-user-avatar" src={user.avatar} alt={user.fullName} />
                  <textarea
                    className="comment-input"
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows="2"
                  />
                  <button className="comment-submit" onClick={handleAddComment}>
                    <i className="fas fa-paper-plane"></i> Post
                  </button>
                </div>
              ) : (
                <p className="comment-login-prompt">
                  <a href="/signin">Sign in</a> to comment
                </p>
              )}

              <div className="comments-list">
                {comments.length === 0 ? (
                  <p className="no-comments">No comments yet. Be the first to comment!</p>
                ) : (
                  comments.map(comment => (
                    <div key={comment._id} className="comment-item">
                      <img className="comment-avatar" src={comment.owner?.avatar} alt={comment.owner?.fullName} />
                      <div className="comment-content">
                        <div className="comment-header">
                          <span className="comment-owner">{comment.owner?.fullName}</span>
                          <span className="comment-time">{getTimeAgo(comment.createdAt)}</span>
                          {comment.updatedAt !== comment.createdAt && (
                            <span className="comment-edited">(edited)</span>
                          )}
                          {user && user._id === comment.owner?._id && (
                            <div className="comment-menu">
                              <button 
                                className="comment-menu-btn"
                                onClick={() => setShowMenu(showMenu === comment._id ? null : comment._id)}
                              >
                                <i className="fas fa-ellipsis-v"></i>
                              </button>
                              {showMenu === comment._id && (
                                <div className="comment-menu-dropdown">
                                  <button onClick={() => {
                                    setEditingComment(comment._id);
                                    setEditContent(comment.content);
                                    setShowMenu(null);
                                  }}>
                                    <i className="fas fa-edit"></i> Edit
                                  </button>
                                  <button onClick={() => handleDeleteComment(comment._id)}>
                                    <i className="fas fa-trash"></i> Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        {editingComment === comment._id ? (
                          <div className="comment-edit-wrapper">
                            <textarea
                              className="comment-edit-input"
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              rows="2"
                            />
                            <div className="comment-edit-actions">
                              <button className="comment-edit-cancel" onClick={() => {
                                setEditingComment(null);
                                setEditContent('');
                                setShowMenu(null);
                              }}>
                                Cancel
                              </button>
                              <button className="comment-edit-save" onClick={() => handleUpdateComment(comment._id)}>
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="comment-text">{comment.content}</p>
                        )}
                        <div className="comment-actions">
                          <button 
                            className={`comment-like-btn ${(comment.likes || []).includes(user?._id) ? 'liked' : ''}`}
                            onClick={() => handleToggleCommentLike(comment._id)}
                          >
                            <i className="fas fa-heart"></i>
                            <span>{(comment.likes || []).length}</span>
                          </button>
                          <button className="comment-reply-btn">
                            <i className="fas fa-reply"></i> Reply
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <footer>YouTube Clone · Video Player</footer>
      </div>
    </div>
  );
}

export default VideoPlayer;