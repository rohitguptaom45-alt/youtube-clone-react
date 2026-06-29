import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Auth } from '../auth';
import '../styles/Library.css';

function Library() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [historyCount, setHistoryCount] = useState(0);
  const [playlistCount, setPlaylistCount] = useState(0);
  const [likedVideos, setLikedVideos] = useState([]);
  const [yourVideos, setYourVideos] = useState([]);
  const [activeTab, setActiveTab] = useState('history');

  useEffect(() => {
    const userData = Auth.getUser();
    if (userData) {
      setUser(userData);
    }

    const history = JSON.parse(localStorage.getItem('watchHistory') || '[]');
    setHistoryCount(history.length);

    const playlists = JSON.parse(localStorage.getItem('playlists') || '[]');
    setPlaylistCount(playlists.length);

    const liked = JSON.parse(localStorage.getItem('likedVideos') || '[]');
    setLikedVideos(liked);

    const videos = JSON.parse(localStorage.getItem('yourVideos') || '[]');
    setYourVideos(videos);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleClearHistory = () => {
    if (window.confirm('Clear all watch history?')) {
      localStorage.setItem('watchHistory', JSON.stringify([]));
      setHistoryCount(0);
    }
  };

  const handleRemoveLiked = (videoId) => {
    const updated = likedVideos.filter(v => v.id !== videoId);
    setLikedVideos(updated);
    localStorage.setItem('likedVideos', JSON.stringify(updated));
  };

  const handleRemoveVideo = (videoId) => {
    const updated = yourVideos.filter(v => v.id !== videoId);
    setYourVideos(updated);
    localStorage.setItem('yourVideos', JSON.stringify(updated));
  };

  const libraryItems = [
    {
      id: 'history',
      icon: 'fas fa-history',
      label: 'History',
      count: historyCount,
      color: '#3ea6ff',
      onClick: () => navigate('/history')
    },
    {
      id: 'playlists',
      icon: 'fas fa-list',
      label: 'Playlists',
      count: playlistCount,
      color: '#ff6b6b',
      onClick: () => navigate('/playlist')
    },
    {
      id: 'liked',
      icon: 'fas fa-thumbs-up',
      label: 'Liked videos',
      count: likedVideos.length,
      color: '#ffd93d',
      onClick: () => setActiveTab('liked')
    },
    {
      id: 'yourvideos',
      icon: 'fas fa-play-circle',
      label: 'Your videos',
      count: yourVideos.length,
      color: '#6bcb77',
      onClick: () => setActiveTab('yourvideos')
    }
  ];

  return (
    <div className="library-container">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-wrapper">
        <Navbar 
          user={user}
          onMenuClick={toggleSidebar}
          searchQuery=""
          onSearchChange={() => {}}
          onSearchSubmit={() => {}}
        />

        <div className="library-header">
          <h1 className="library-title">Library</h1>
        </div>

        <div className="library-grid">
          {libraryItems.map(item => (
            <div 
              key={item.id} 
              className="library-card" 
              onClick={item.onClick}
              style={{ borderLeft: `4px solid ${item.color}` }}
            >
              <div className="library-card-icon" style={{ color: item.color }}>
                <i className={item.icon}></i>
              </div>
              <div className="library-card-info">
                <h3 className="library-card-label">{item.label}</h3>
                <span className="library-card-count">{item.count} items</span>
              </div>
              <i className="fas fa-chevron-right library-card-arrow"></i>
            </div>
          ))}
        </div>

        {activeTab === 'liked' && (
          <div className="library-detail">
            <div className="library-detail-header">
              <h2><i className="fas fa-thumbs-up" style={{ color: '#ffd93d' }}></i> Liked Videos</h2>
              {likedVideos.length === 0 && <p>No liked videos yet</p>}
            </div>
            {likedVideos.length > 0 && (
              <div className="library-videos-list">
                {likedVideos.map(video => (
                  <div key={video.id} className="library-video-item">
                    <img className="library-video-thumb" src={video.thumbnail} alt={video.title} />
                    <div className="library-video-info">
                      <h4>{video.title}</h4>
                      <p>{video.channel}</p>
                    </div>
                    <button 
                      className="library-remove-btn"
                      onClick={() => handleRemoveLiked(video.id)}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'yourvideos' && (
          <div className="library-detail">
            <div className="library-detail-header">
              <h2><i className="fas fa-play-circle" style={{ color: '#6bcb77' }}></i> Your Videos</h2>
              {yourVideos.length === 0 && <p>No videos uploaded yet</p>}
            </div>
            {yourVideos.length > 0 && (
              <div className="library-videos-list">
                {yourVideos.map(video => (
                  <div key={video.id} className="library-video-item">
                    <img className="library-video-thumb" src={video.thumbnail} alt={video.title} />
                    <div className="library-video-info">
                      <h4>{video.title}</h4>
                      <p>{video.views} views • {video.uploadedAt}</p>
                    </div>
                    <button 
                      className="library-remove-btn"
                      onClick={() => handleRemoveVideo(video.id)}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <footer>YouTube Clone · Library</footer>
      </div>
    </div>
  );
}

export default Library;