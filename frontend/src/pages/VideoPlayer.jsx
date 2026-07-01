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
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const userData = Auth.getUser();
    if (userData) {
      setUser(userData);
    }
    fetchVideoData();
  }, [videoId]);

  const fetchVideoData = async () => {
    try {
      setLoading(true);
      const response = await API.getVideoById(videoId);
      console.log("Fetched video response:", response);
      if (response?.success && response?.data) {
        setVideo(response.data);
        // console.log("videos bu setvideo",video)
        console.log("Fetched video:", response.data);
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
      {console.log("video data in return",video)}
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
                  <span className="video-views">{formatViews(video[0].views)} views</span>
                  <span className="video-date">
                    {new Date(video[0].createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <p className="video-description">{video[0].description}</p>
            </div>
          </div>
        </div>

        <footer>YouTube Clone · Video Player</footer>
      </div>
    </div>
  );
}

export default VideoPlayer;