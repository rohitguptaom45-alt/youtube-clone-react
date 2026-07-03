import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import API from '../api';
import { Auth } from '../auth';
import '../styles/YourVideos.css';

function YourVideos() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [yourVideos, setYourVideos] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newVideo, setNewVideo] = useState({
    title: '',
    description: '',
    thumbnail: '',
    videoFile: '',
    visibility: 'public'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = Auth.getUser();
    if (userData) {
      setUser(userData);
    }
    fetchYourVideos();
  }, []);

  const fetchYourVideos = async () => {
    try {
      setLoading(true);
      const response = await API.getYourVideos();
      if (response?.success) {
        setYourVideos(response.data || []);
        setFilteredVideos(response.data || []);
      } else {
        const saved = JSON.parse(localStorage.getItem('yourVideos') || '[]');
        setYourVideos(saved);
        setFilteredVideos(saved);
      }
    } catch (error) {
      console.error('Error fetching your videos:', error);
      const saved = JSON.parse(localStorage.getItem('yourVideos') || '[]');
      setYourVideos(saved);
      setFilteredVideos(saved);
    } finally {
      setLoading(false);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredVideos(yourVideos);
      return;
    }
    const filtered = yourVideos.filter(item =>
      item.title?.toLowerCase().includes(query.toLowerCase()) ||
      item.description?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredVideos(filtered);
  };

  const handleUpload = async () => {
    if (!newVideo.title.trim()) {
      alert('Please enter a video title');
      return;
    }
    if (!newVideo.thumbnail) {
      alert('Please enter a thumbnail URL');
      return;
    }
    if (!newVideo.videoFile) {
      alert('Please enter a video URL');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', newVideo.title);
      formData.append('description', newVideo.description || '');
      formData.append('thumbnail', newVideo.thumbnail);
      formData.append('videoFile', newVideo.videoFile);
      formData.append('visibility', newVideo.visibility);

      const response = await API.uploadVideo(formData);
      if (response?.success) {
        await fetchYourVideos();
        setShowUploadModal(false);
        setNewVideo({ title: '', description: '', thumbnail: '', videoFile: '', visibility: 'public' });
        alert('✅ Video uploaded successfully!');
      } else {
        const videoData = {
          id: 'video_' + Date.now(),
          title: newVideo.title,
          description: newVideo.description || 'No description',
          thumbnail: newVideo.thumbnail,
          videoFile: newVideo.videoFile,
          visibility: newVideo.visibility,
          views: Math.floor(Math.random() * 1000),
          uploadedAt: new Date().toISOString(),
          owner: user ? user.fullName : 'Unknown'
        };
        const updated = [videoData, ...yourVideos];
        setYourVideos(updated);
        localStorage.setItem('yourVideos', JSON.stringify(updated));
        setFilteredVideos(updated);
        setShowUploadModal(false);
        setNewVideo({ title: '', description: '', thumbnail: '', videoFile: '', visibility: 'public' });
        alert('✅ Video uploaded successfully!');
      }
    } catch (error) {
      alert(error?.message || 'Failed to upload video');
    }
  };

  const handleDelete = async (videoId) => {
    if (!window.confirm('Are you sure you want to delete this video?')) return;

    try {
      const response = await API.deleteVideo(videoId);
      if (response?.success) {
        await fetchYourVideos();
        alert('🗑️ Video deleted!');
      } else {
        const updated = yourVideos.filter(item => item.id !== videoId && item._id !== videoId);
        setYourVideos(updated);
        localStorage.setItem('yourVideos', JSON.stringify(updated));
        setFilteredVideos(updated);
        alert('🗑️ Video deleted!');
      }
    } catch (error) {
      alert(error?.message || 'Failed to delete video');
    }
  };

  const handleEdit = (video) => {
    const newTitle = prompt('Enter new title:', video.title);
    if (newTitle && newTitle.trim()) {
      const updated = yourVideos.map(item => {
        const itemId = item.id || item._id;
        const videoId = video.id || video._id;
        if (itemId === videoId) {
          return { ...item, title: newTitle.trim() };
        }
        return item;
      });
      setYourVideos(updated);
      localStorage.setItem('yourVideos', JSON.stringify(updated));
      setFilteredVideos(updated);
      alert('✅ Video updated!');
    }
  };

  const handlePlayVideo = (video) => {
    const videoId = video._id || video.id;
    navigate(`/video/${videoId}`);
  };

  const getTimeAgo = (dateStr) => {
    if (!dateStr) return 'Recently';
    const now = new Date();
    const diff = now - new Date(dateStr);
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor(diff / 60000);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  if (loading) {
    return (
      <div className="yourvideos-container">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="main-wrapper">
          <Navbar user={user} onMenuClick={toggleSidebar} searchQuery="" onSearchChange={() => {}} onSearchSubmit={() => {}} />
          <div className="loading-state">Loading your videos...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="yourvideos-container">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-wrapper">
        <Navbar 
          user={user}
          onMenuClick={toggleSidebar}
          searchQuery=""
          onSearchChange={() => {}}
          onSearchSubmit={() => {}}
        />

        <div className="yourvideos-header">
          <div className="yourvideos-title-section">
            <h1 className="yourvideos-title">
              <i className="fas fa-play-circle" style={{ color: '#6bcb77' }}></i> Your Videos
            </h1>
            <button className="upload-btn" onClick={() => setShowUploadModal(true)}>
              <i className="fas fa-upload"></i> Upload Video
            </button>
          </div>
          
          <div className="yourvideos-search-bar">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search your videos"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
            {searchQuery && (
              <button className="clear-search-btn" onClick={() => { setSearchQuery(''); setFilteredVideos(yourVideos); }}>
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
        </div>

        {yourVideos.length === 0 ? (
          <div className="empty-yourvideos">
            <i className="fas fa-play-circle" style={{ fontSize: '4rem', color: '#555' }}></i>
            <h2>No videos uploaded yet</h2>
            <p>Upload your first video to share with the world</p>
            <button className="upload-btn-large" onClick={() => setShowUploadModal(true)}>
              <i className="fas fa-upload"></i> Upload Video
            </button>
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="empty-yourvideos">
            <i className="fas fa-search" style={{ fontSize: '4rem', color: '#555' }}></i>
            <h2>No results found</h2>
            <p>Try adjusting your search</p>
            <button className="browse-btn" onClick={() => { setSearchQuery(''); setFilteredVideos(yourVideos); }}>
              Clear Search
            </button>
          </div>
        ) : (
          <div className="yourvideos-list">
            <div className="yourvideos-count">
              {filteredVideos.length} {filteredVideos.length === 1 ? 'video' : 'videos'}
            </div>
            <div className="yourvideos-grid">
              {filteredVideos.map(item => {
                const itemId = item._id || item.id;
                return (
                  <div key={itemId} className="yourvideo-card">
                    <div className="yourvideo-thumbnail-wrapper" onClick={() => handlePlayVideo(item)}>
                      <img className="yourvideo-thumbnail" src={item.thumbnail} alt={item.title} />
                      <div className="yourvideo-play-overlay">
                        <i className="fas fa-play-circle"></i>
                      </div>
                    </div>
                    <div className="yourvideo-info">
                      <h4 className="yourvideo-title">{item.title}</h4>
                      <p className="yourvideo-description">{item.description}</p>
                      <div className="yourvideo-stats">
                        <span><i className="fas fa-eye"></i> {item.views || 0} views</span>
                        <span><i className="far fa-calendar-alt"></i> {getTimeAgo(item.uploadedAt || item.createdAt)}</span>
                        <span className={`visibility-badge ${item.visibility || 'public'}`}>
                          {item.visibility === 'public' ? <i className="fas fa-globe"></i> : <i className="fas fa-lock"></i>}
                          {item.visibility || 'public'}
                        </span>
                      </div>
                    </div>
                    <div className="yourvideo-actions">
                      <button className="edit-btn" onClick={() => handleEdit(item)}>
                        <i className="fas fa-edit"></i>
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete(itemId)}>
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <footer>YouTube Clone · Your Videos</footer>
      </div>

      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2><i className="fas fa-upload"></i> Upload Video</h2>
            <div className="modal-form">
              <div className="form-group">
                <label>Video Title *</label>
                <input
                  type="text"
                  className="modal-input"
                  placeholder="Enter video title"
                  value={newVideo.title}
                  onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  className="modal-textarea"
                  placeholder="Enter video description"
                  value={newVideo.description}
                  onChange={(e) => setNewVideo({ ...newVideo, description: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Thumbnail URL *</label>
                <input
                  type="text"
                  className="modal-input"
                  placeholder="https://example.com/thumbnail.jpg"
                  value={newVideo.thumbnail}
                  onChange={(e) => setNewVideo({ ...newVideo, thumbnail: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Video URL *</label>
                <input
                  type="text"
                  className="modal-input"
                  placeholder="https://example.com/video.mp4"
                  value={newVideo.videoFile}
                  onChange={(e) => setNewVideo({ ...newVideo, videoFile: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Visibility</label>
                <select
                  className="modal-select"
                  value={newVideo.visibility}
                  onChange={(e) => setNewVideo({ ...newVideo, visibility: e.target.value })}
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option value="unlisted">Unlisted</option>
                </select>
              </div>
            </div>
            <div className="modal-actions">
              <button className="modal-cancel-btn" onClick={() => setShowUploadModal(false)}>Cancel</button>
              <button className="modal-upload-btn" onClick={handleUpload}>
                <i className="fas fa-upload"></i> Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default YourVideos;