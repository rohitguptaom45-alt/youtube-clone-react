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
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

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
      const mockVideo = {
        _id: videoId,
        title: 'Sample Video Title',
        description: 'This is a sample video description.',
        videoFile: 'https://www.w3schools.com/html/mov_bbb.mp4',
        thumbnail: 'https://picsum.photos/id/101/320/180',
        views: 1234,
        owner: {
          _id: 'owner123',
          fullName: 'Channel Name',
          username: 'channelname',
          avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
          subscribers: 5000
        },
        likes: [],
        createdAt: new Date().toISOString()
      };
      setVideo(mockVideo);
      setLikeCount(mockVideo.likes?.length || 0);
      if (user && mockVideo.likes) {
        setIsLiked(mockVideo.likes.includes(user._id));
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
      if (response.success) {
        setComments(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      setComments([]);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      alert('Please write a comment!');
      return;
    }

    try {
      const response = await API.addComment(videoId, newComment.trim());
      if (response.success) {
        setNewComment('');
        await fetchComments();
      } else {
        alert(response.message || 'Failed to add comment');
      }
    } catch (error) {
      alert(error.message || 'Failed to add comment');
    }
  };

  const handleUpdateComment = async (commentId) => {
    if (!editContent.trim()) {
      alert('Please write something!');
      return;
    }

    try {
      const response = await API.updateComment(commentId, editContent.trim());
      if (response.success) {
        setEditingComment(null);
        setEditContent('');
        await fetchComments();
      } else {
        alert(response.message || 'Failed to update comment');
      }
    } catch (error) {
      alert(error.message || 'Failed to update comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      const response = await API.deleteComment(commentId);
      if (response.success) {
        await fetchComments();
      } else {
        alert(response.message || 'Failed to delete comment');
      }
    } catch (error) {
      alert(error.message || 'Failed to delete comment');
    }
  };

  const handleToggleLike = async () => {
    try {
      const response = await API.toggleVideoLike(videoId);
      if (response.success) {
        setIsLiked(!isLiked);
        setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
      } else {
        alert(response.message || 'Failed to toggle like');
      }
    } catch (error) {
      alert(error.message || 'Failed to toggle like');
    }
  };

  const handleToggleCommentLike = async (commentId) => {
    try {
      const response = await API.toggleCommentLike(commentId);
      if (response.success) {
        await fetchComments();
      } else {
        alert(response.message || 'Failed to like comment');
      }
    } catch (error) {
      alert(error.message || 'Failed to like comment');
    }
  };

  const handleSubscribe = () => {
    setIsSubscribed(!isSubscribed);
    alert(isSubscribed ? '❌ Unsubscribed from channel' : '✅ Subscribed to channel!');
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
                <div className="video-owner" onClick={() => navigate(`/channel/${video.owner?._id}`)}>
                  <img className="video-owner-avatar" src={video.owner?.avatar} alt={video.owner?.fullName} />
                  <div className="video-owner-info">
                    <span className="video-owner-name">{video.owner?.fullName}</span>
                    <span className="video-owner-subs">{video.owner?.subscribers?.toLocaleString()} subscribers</span>
                  </div>
                </div>
                <div className="video-actions">
                  <button className={`subscribe-btn ${isSubscribed ? 'subscribed' : ''}`} onClick={handleSubscribe}>
                    {isSubscribed ? 'Subscribed' : 'Subscribe'}
                  </button>
                  <button className={`like-btn ${isLiked ? 'liked' : ''}`} onClick={handleToggleLike}>
                    <i className={`fas fa-heart ${isLiked ? 'liked' : ''}`}></i>
                    <span>{likeCount}</span>
                  </button>
                  <span className="video-views">{video.views} views</span>
                  <span className="video-date">
                    {new Date(video.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <p className="video-description">{video.description}</p>
            </div>

            <div className="comments-section">
              <h3 className="comments-title">
                <i className="fas fa-comments"></i> Comments ({comments.length})
              </h3>

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
                          <span className="comment-time">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
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
                              <button className="comment-edit-cancel" onClick={() => setEditingComment(null)}>
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
                            className="comment-like-btn"
                            onClick={() => handleToggleCommentLike(comment._id)}
                          >
                            <i className="fas fa-heart"></i>
                            <span>{comment.likes?.length || 0}</span>
                          </button>
                          {user && user._id === comment.owner?._id && !editingComment && (
                            <>
                              <button className="comment-edit-btn" onClick={() => {
                                setEditingComment(comment._id);
                                setEditContent(comment.content);
                              }}>
                                <i className="fas fa-edit"></i> Edit
                              </button>
                              <button className="comment-delete-btn" onClick={() => handleDeleteComment(comment._id)}>
                                <i className="fas fa-trash"></i> Delete
                              </button>
                            </>
                          )}
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