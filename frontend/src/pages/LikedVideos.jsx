import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import API from '../api';
import { Auth } from '../auth';
import '../styles/LikedVideos.css';

// Backend video shape (from getLikedVideos): { _id, title, thumbnail, duration, views, owner: {fullName, username, avatar}, ... }
// Flattened here to match what this component renders with (id, title, channel, thumbnail).
function normalizeLikedVideo(v) {
  return {
    id: v._id || v.id,
    title: v.title,
    channel: v.owner?.fullName || v.owner?.username || v.channel || 'Unknown',
    thumbnail: v.thumbnail,
    duration: v.duration,
    views: v.views
  };
}

function LikedVideos() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [likedVideos, setLikedVideos] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = Auth.getUser();
    if (userData) {
      setUser(userData);
    }
    fetchLikedVideos();
  }, []);

  const fetchLikedVideos = async () => {
    try {
      setLoading(true);
      const response = await API.getLikedVideos();
      if (response?.success && response?.data) {
        const normalized = response.data.filter(Boolean).map(normalizeLikedVideo);
        setLikedVideos(normalized);
        setFilteredVideos(normalized);
      } else {
        loadLocalLiked();
      }
    } catch (error) {
      // Backend throws a 404 ApiError when the user hasn't liked any video yet -
      // treat that as an empty list rather than a real error.
      const msg = (error?.message || '').toLowerCase();
      if (error?.statusCode === 404 || msg.includes('no liked video')) {
        setLikedVideos([]);
        setFilteredVideos([]);
      } else {
        console.error('Fetch liked videos error:', error);
        loadLocalLiked();
      }
    } finally {
      setLoading(false);
    }
  };

  const loadLocalLiked = () => {
    const saved = JSON.parse(localStorage.getItem('likedVideos') || '[]');
    setLikedVideos(saved);
    setFilteredVideos(saved);
  };

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
      (item.channel || '').toLowerCase().includes(query.toLowerCase())
    );
    setFilteredVideos(filtered);
  };

  const handleRemove = async (videoId) => {
    if (!window.confirm('Remove this video from Liked Videos?')) return;

    try {
      // Un-liking is just toggling the like off again on the backend
      const response = await API.toggleVideoLike(videoId);
      if (response?.success) {
        await fetchLikedVideos();
        alert('🗑️ Removed from Liked Videos!');
      } else {
        const updated = likedVideos.filter(item => item.id !== videoId);
        setLikedVideos(updated);
        localStorage.setItem('likedVideos', JSON.stringify(updated));
        setFilteredVideos(updated);
        alert('🗑️ Removed from Liked Videos (local storage)!');
      }
    } catch (error) {
      console.error('Remove liked video error:', error);
      alert(error?.message || 'Failed to remove video');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear all Liked Videos?')) return;

    try {
      await Promise.all(likedVideos.map(item => API.toggleVideoLike(item.id)));
      setLikedVideos([]);
      setFilteredVideos([]);
      localStorage.setItem('likedVideos', JSON.stringify([]));
      alert('✅ All Liked Videos cleared!');
    } catch (error) {
      console.error('Clear all error:', error);
      alert(error?.message || 'Failed to clear all liked videos');
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
    navigate(`/watch/${video.id}`);
  };

  if (loading) {
    return (
      <div className="liked-container">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="main-wrapper">
          <Navbar user={user} onMenuClick={toggleSidebar} searchQuery="" onSearchChange={() => {}} onSearchSubmit={() => {}} />
          <div className="empty-liked">
            <h2>Loading liked videos...</h2>
          </div>
        </div>
      </div>
    );
  }

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