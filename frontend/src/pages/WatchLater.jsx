import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Auth } from '../auth';
import '../styles/WatchLater.css';

function WatchLater() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [watchLater, setWatchLater] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);

  useEffect(() => {
    const userData = Auth.getUser();
    if (userData) {
      setUser(userData);
    }
    const saved = JSON.parse(localStorage.getItem('watchLater') || '[]');
    setWatchLater(saved);
    setFilteredItems(saved);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredItems(watchLater);
      return;
    }
    const filtered = watchLater.filter(item =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.channel.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredItems(filtered);
  };

  const handleRemove = (videoId) => {
    const updated = watchLater.filter(item => item.id !== videoId);
    setWatchLater(updated);
    localStorage.setItem('watchLater', JSON.stringify(updated));
    setFilteredItems(updated);
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all Watch Later videos?')) {
      setWatchLater([]);
      localStorage.setItem('watchLater', JSON.stringify([]));
      setFilteredItems([]);
    }
  };

  const handleMarkAsWatched = (video) => {
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
    
    handleRemove(video.id);
    alert('✅ Marked as watched and moved to History!');
  };

  const handlePlayVideo = (video) => {
    alert(`🎬 Now playing: ${video.title}`);
  };

  const getTimeAgo = (dateStr) => {
    const now = new Date();
    const diff = now - new Date(dateStr);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="watchlater-container">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-wrapper">
        <Navbar 
          user={user}
          onMenuClick={toggleSidebar}
          searchQuery=""
          onSearchChange={() => {}}
          onSearchSubmit={() => {}}
        />

        <div className="watchlater-header">
          <div className="watchlater-title-section">
            <h1 className="watchlater-title">
              <i className="fas fa-clock" style={{ color: '#3ea6ff' }}></i> Watch Later
            </h1>
            {watchLater.length > 0 && (
              <button className="clear-all-btn" onClick={handleClearAll}>
                <i className="fas fa-trash"></i> Clear all
              </button>
            )}
          </div>
          
          <div className="watchlater-search-bar">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search watch later"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
            {searchQuery && (
              <button className="clear-search-btn" onClick={() => { setSearchQuery(''); setFilteredItems(watchLater); }}>
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
        </div>

        {watchLater.length === 0 ? (
          <div className="empty-watchlater">
            <i className="fas fa-clock" style={{ fontSize: '4rem', color: '#555' }}></i>
            <h2>Watch Later is empty</h2>
            <p>Save videos to watch them later</p>
            <button className="browse-btn" onClick={() => navigate('/')}>
              Browse Videos
            </button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="empty-watchlater">
            <i className="fas fa-search" style={{ fontSize: '4rem', color: '#555' }}></i>
            <h2>No results found</h2>
            <p>Try adjusting your search</p>
            <button className="browse-btn" onClick={() => { setSearchQuery(''); setFilteredItems(watchLater); }}>
              Clear Search
            </button>
          </div>
        ) : (
          <div className="watchlater-list">
            <div className="watchlater-count">
              {filteredItems.length} {filteredItems.length === 1 ? 'video' : 'videos'}
            </div>
            <div className="watchlater-items">
              {filteredItems.map(item => (
                <div key={item.id} className="watchlater-item">
                  <img 
                    className="watchlater-thumbnail" 
                    src={item.thumbnail} 
                    alt={item.title}
                    onClick={() => handlePlayVideo(item)}
                  />
                  <div className="watchlater-item-info" onClick={() => handlePlayVideo(item)}>
                    <h4 className="watchlater-item-title">{item.title}</h4>
                    <p className="watchlater-item-channel">{item.channel}</p>
                    <span className="watchlater-item-added">
                      <i className="fas fa-clock"></i> Added {getTimeAgo(item.addedAt)}
                    </span>
                  </div>
                  <div className="watchlater-item-actions">
                    <button 
                      className="watch-btn"
                      onClick={() => handleMarkAsWatched(item)}
                      title="Mark as watched"
                    >
                      <i className="fas fa-check"></i>
                    </button>
                    <button 
                      className="remove-btn"
                      onClick={() => handleRemove(item.id)}
                      title="Remove from Watch Later"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <footer>YouTube Clone · Watch Later</footer>
      </div>
    </div>
  );
}

export default WatchLater;