import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Auth } from '../auth';
import '../styles/LikedVideos.css';

function LikedVideos() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [likedVideos, setLikedVideos] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredVideos, setFilteredVideos] = useState([]);

  useEffect(() => {
    const userData = Auth.getUser();
    if (userData) {
      setUser(userData);
    }
    const saved = JSON.parse(localStorage.getItem('likedVideos') || '[]');
    setLikedVideos(saved);
    setFilteredVideos(saved);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredVideos(likedVideos);
      return;
    }
    const filtered = likedVideos.filter(item =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.channel.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredVideos(filtered);
  };

  const handleRemove = (videoId) => {
    if (window.confirm('Remove this video from Liked Videos?')) {
      const updated = likedVideos.filter(item => item.id !== videoId);
      setLikedVideos(updated);
      localStorage.setItem('likedVideos', JSON.stringify(updated));
      setFilteredVideos(updated);
      alert('🗑️ Removed from Liked Videos!');
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all Liked Videos?')) {
      setLikedVideos([]);
      localStorage.setItem('likedVideos', JSON.stringify([]));
      setFilteredVideos([]);
      alert('✅ All Liked Videos cleared!');
    }
  };

  const handlePlayVideo = (video) => {
    const history = JSON.parse(localStorage.getItem('watchHistory') || '[]');
    const newEntry = {
      id: video.id,
      title: video.title,
      channel: video.channel,
      thumbnail: video.thumbnail,
      watchedAt: new Date().toISOString()
    };
    const filtered = history.filter(item => item.id !== video.id);
    const updated = [newEntry, ...filtered];
    localStorage.setItem('watchHistory', JSON.stringify(updated));
    alert(`🎬 Now playing: ${video.title}`);
  };

  return (
    <div className="liked-container">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-wrapper">
        <Navbar 
          user={user}
          onMenuClick={toggleSidebar}
          searchQuery=""
          onSearchChange={() => {}}
          onSearchSubmit={() => {}}
        />

        <div className="liked-header">
          <div className="liked-title-section">
            <h1 className="liked-title">
              <i className="fas fa-thumbs-up" style={{ color: '#ffd93d' }}></i> Liked Videos
            </h1>
            {likedVideos.length > 0 && (
              <button className="clear-all-btn" onClick={handleClearAll}>
                <i className="fas fa-trash"></i> Clear all
              </button>
            )}
          </div>
          
          <div className="liked-search-bar">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search liked videos"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
            {searchQuery && (
              <button className="clear-search-btn" onClick={() => { setSearchQuery(''); setFilteredVideos(likedVideos); }}>
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
        </div>

        {likedVideos.length === 0 ? (
          <div className="empty-liked">
            <i className="fas fa-thumbs-up" style={{ fontSize: '4rem', color: '#555' }}></i>
            <h2>No liked videos</h2>
            <p>Videos you like will appear here</p>
            <button className="browse-btn" onClick={() => navigate('/')}>
              Browse Videos
            </button>
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="empty-liked">
            <i className="fas fa-search" style={{ fontSize: '4rem', color: '#555' }}></i>
            <h2>No results found</h2>
            <p>Try adjusting your search</p>
            <button className="browse-btn" onClick={() => { setSearchQuery(''); setFilteredVideos(likedVideos); }}>
              Clear Search
            </button>
          </div>
        ) : (
          <div className="liked-list">
            <div className="liked-count">
              {filteredVideos.length} {filteredVideos.length === 1 ? 'video' : 'videos'}
            </div>
            <div className="liked-items">
              {filteredVideos.map(item => (
                <div key={item.id} className="liked-item">
                  <img 
                    className="liked-thumbnail" 
                    src={item.thumbnail} 
                    alt={item.title}
                    onClick={() => handlePlayVideo(item)}
                  />
                  <div className="liked-item-info" onClick={() => handlePlayVideo(item)}>
                    <h4 className="liked-item-title">{item.title}</h4>
                    <p className="liked-item-channel">{item.channel}</p>
                  </div>
                  <button 
                    className="remove-liked-btn"
                    onClick={() => handleRemove(item.id)}
                    title="Remove from Liked Videos"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <footer>YouTube Clone · Liked Videos</footer>
      </div>
    </div>
  );
}

export default LikedVideos;