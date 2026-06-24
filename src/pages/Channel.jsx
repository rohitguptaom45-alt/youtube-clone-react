import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Auth } from '../auth';
import '../styles/Channel.css';

function Channel() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [channelData, setChannelData] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [activeTab, setActiveTab] = useState('videos');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [channelVideos, setChannelVideos] = useState([]);
  const [editData, setEditData] = useState({
    name: '',
    description: '',
    avatar: '',
    banner: ''
  });
  const [newVideo, setNewVideo] = useState({
    title: '',
    description: '',
    thumbnail: '',
    videoFile: ''
  });

  useEffect(() => {
    const userData = Auth.getUser();
    if (userData) {
      setUser(userData);
      
      const savedChannel = JSON.parse(localStorage.getItem('channelData') || 'null');
      if (savedChannel && savedChannel.ownerId === userData._id) {
        setChannelData(savedChannel);
      } else {
        const defaultChannel = {
          ownerId: userData._id,
          name: userData.fullName + "'s Channel",
          handle: '@' + userData.username,
          subscribers: Math.floor(Math.random() * 100000) + 100,
          avatar: userData.avatar || 'https://randomuser.me/api/portraits/men/32.jpg',
          banner: 'https://picsum.photos/id/129/1600/300',
          description: 'Welcome to my YouTube channel! I create amazing content.',
          createdAt: new Date().toISOString()
        };
        localStorage.setItem('channelData', JSON.stringify(defaultChannel));
        setChannelData(defaultChannel);
      }

      const videos = JSON.parse(localStorage.getItem('channelVideos') || '[]');
      setChannelVideos(videos);
    }
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSubscribe = () => {
    setIsSubscribed(!isSubscribed);
    if (!isSubscribed) {
      const updatedChannel = {
        ...channelData,
        subscribers: channelData.subscribers + 1
      };
      setChannelData(updatedChannel);
      localStorage.setItem('channelData', JSON.stringify(updatedChannel));
      alert('✅ Subscribed to channel!');
    } else {
      const updatedChannel = {
        ...channelData,
        subscribers: channelData.subscribers - 1
      };
      setChannelData(updatedChannel);
      localStorage.setItem('channelData', JSON.stringify(updatedChannel));
      alert('❌ Unsubscribed from channel');
    }
  };

  const handleEditChannel = () => {
    setEditData({
      name: channelData.name,
      description: channelData.description,
      avatar: channelData.avatar,
      banner: channelData.banner
    });
    setShowEditModal(true);
  };

  const handleSaveChannel = () => {
    if (!editData.name.trim()) {
      alert('Channel name is required');
      return;
    }
    const updatedChannel = {
      ...channelData,
      name: editData.name,
      description: editData.description || 'No description',
      avatar: editData.avatar || 'https://randomuser.me/api/portraits/men/32.jpg',
      banner: editData.banner || 'https://picsum.photos/id/129/1600/300'
    };
    setChannelData(updatedChannel);
    localStorage.setItem('channelData', JSON.stringify(updatedChannel));
    setShowEditModal(false);
    alert('✅ Channel updated successfully!');
  };

  const handleUploadVideo = () => {
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

    const videoData = {
      id: 'video_' + Date.now(),
      title: newVideo.title,
      description: newVideo.description || 'No description',
      thumbnail: newVideo.thumbnail,
      videoFile: newVideo.videoFile,
      views: Math.floor(Math.random() * 1000),
      likes: Math.floor(Math.random() * 100),
      comments: Math.floor(Math.random() * 50),
      uploadedAt: new Date().toISOString(),
      owner: channelData.name
    };

    const updatedVideos = [videoData, ...channelVideos];
    setChannelVideos(updatedVideos);
    localStorage.setItem('channelVideos', JSON.stringify(updatedVideos));
    setShowUploadModal(false);
    setNewVideo({ title: '', description: '', thumbnail: '', videoFile: '' });
    alert('✅ Video uploaded successfully!');
  };

  const handleDeleteVideo = (videoId) => {
    if (window.confirm('Delete this video?')) {
      const updated = channelVideos.filter(v => v.id !== videoId);
      setChannelVideos(updated);
      localStorage.setItem('channelVideos', JSON.stringify(updated));
      alert('🗑️ Video deleted!');
    }
  };

  const getTimeAgo = (dateStr) => {
    const now = new Date();
    const diff = now - new Date(dateStr);
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor(diff / 60000);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  };

  const channelShorts = [
    { id: "s1", title: "⚽️ insane nutmeg 😱", views: "3.2M", thumbnail: "https://picsum.photos/id/139/200/350" },
    { id: "s2", title: "dubai night vibe", views: "2.1M", thumbnail: "https://picsum.photos/id/140/200/350" },
    { id: "s3", title: "quick Q&A with fans", views: "1.5M", thumbnail: "https://picsum.photos/id/141/200/350" },
    { id: "s4", title: "house tour snippet", views: "4.0M", thumbnail: "https://picsum.photos/id/142/200/350" },
    { id: "s5", title: "world cup prep", views: "2.8M", thumbnail: "https://picsum.photos/id/143/200/350" }
  ];

  if (!channelData) {
    return <div className="loading">Loading channel...</div>;
  }

  return (
    <div className="channel-container">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-wrapper">
        <Navbar 
          user={user}
          onMenuClick={toggleSidebar}
          searchQuery=""
          onSearchChange={() => {}}
          onSearchSubmit={() => {}}
        />
        
        <div className="channel-banner">
          <img src={channelData.banner} alt="Banner" />
        </div>

        <div className="channel-info-section">
          <div className="channel-main-info">
            <img className="channel-avatar-large" src={channelData.avatar} alt="Channel" />
            <div className="channel-meta">
              <div className="channel-name">
                {channelData.name} 
                <span className="channel-handle">{channelData.handle}</span>
                {user && user._id === channelData.ownerId && (
                  <button className="edit-channel-btn" onClick={handleEditChannel}>
                    <i className="fas fa-edit"></i>
                  </button>
                )}
              </div>
              <div className="subscriber-stats">
                {channelData.subscribers.toLocaleString()} subscribers • {channelVideos.length} videos
              </div>
              <div className="channel-description">
                {channelData.description}
              </div>
            </div>
            <div className="channel-actions">
              {user && user._id === channelData.ownerId ? (
                <button className="upload-video-btn" onClick={() => setShowUploadModal(true)}>
                  <i className="fas fa-upload"></i> Upload Video
                </button>
              ) : (
                <button className={`subscribe-btn ${isSubscribed ? 'subscribed' : ''}`} onClick={handleSubscribe}>
                  {isSubscribed ? 'Subscribed' : 'Subscribe'}
                </button>
              )}
            </div>
          </div>

          <div className="channel-tabs">
            <div className={`tab ${activeTab === 'videos' ? 'active-tab' : ''}`} onClick={() => setActiveTab('videos')}>
              <i className="fas fa-video"></i> Videos
            </div>
            <div className={`tab ${activeTab === 'shorts' ? 'active-tab' : ''}`} onClick={() => setActiveTab('shorts')}>
              <i className="fas fa-bolt"></i> Shorts
            </div>
            <div className={`tab ${activeTab === 'analytics' ? 'active-tab' : ''}`} onClick={() => setActiveTab('analytics')}>
              <i className="fas fa-chart-bar"></i> Analytics
            </div>
            <div className={`tab ${activeTab === 'about' ? 'active-tab' : ''}`} onClick={() => setActiveTab('about')}>
              <i className="fas fa-info-circle"></i> About
            </div>
          </div>
        </div>

        {activeTab === 'videos' && (
          <div className="video-grid">
            {channelVideos.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-video" style={{ fontSize: '4rem', color: '#555' }}></i>
                <h3>No videos uploaded yet</h3>
                <p>Upload your first video to share with your audience</p>
                {user && user._id === channelData.ownerId && (
                  <button className="upload-video-btn" onClick={() => setShowUploadModal(true)}>
                    <i className="fas fa-upload"></i> Upload Video
                  </button>
                )}
              </div>
            ) : (
              channelVideos.map(video => (
                <div key={video.id} className="video-card">
                  <div className="video-thumbnail-wrapper">
                    <img className="thumbnail" src={video.thumbnail} alt={video.title} />
                    <div className="video-duration">{Math.floor(Math.random() * 15) + 1}:{String(Math.floor(Math.random() * 60)).padStart(2, '0')}</div>
                  </div>
                  <div className="video-info">
                    <h4 className="video-title">{video.title}</h4>
                    <p className="video-stats">{video.views} views • {getTimeAgo(video.uploadedAt)}</p>
                    {user && user._id === channelData.ownerId && (
                      <button className="delete-video-btn" onClick={() => handleDeleteVideo(video.id)}>
                        <i className="fas fa-trash"></i>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'shorts' && (
          <div className="shorts-section">
            <div className="section-title"><i className="fas fa-bolt"></i> Shorts</div>
            <div className="shorts-scroll">
              {channelShorts.map(short => (
                <div key={short.id} className="short-card">
                  <img className="short-thumb" src={short.thumbnail} alt="short" loading="lazy" />
                  <div className="short-title">{short.title}</div>
                  <div className="short-stats">{short.views} views</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="analytics-section">
            <h2 className="analytics-title"><i className="fas fa-chart-bar"></i> Channel Analytics</h2>
            <div className="analytics-grid">
              <div className="analytics-card">
                <i className="fas fa-users" style={{ color: '#3ea6ff' }}></i>
                <div className="analytics-number">{channelData.subscribers.toLocaleString()}</div>
                <div className="analytics-label">Subscribers</div>
              </div>
              <div className="analytics-card">
                <i className="fas fa-eye" style={{ color: '#6bcb77' }}></i>
                <div className="analytics-number">{channelVideos.reduce((sum, v) => sum + (v.views || 0), 0).toLocaleString()}</div>
                <div className="analytics-label">Total Views</div>
              </div>
              <div className="analytics-card">
                <i className="fas fa-video" style={{ color: '#ffd93d' }}></i>
                <div className="analytics-number">{channelVideos.length}</div>
                <div className="analytics-label">Total Videos</div>
              </div>
              <div className="analytics-card">
                <i className="fas fa-thumbs-up" style={{ color: '#ff6b6b' }}></i>
                <div className="analytics-number">{channelVideos.reduce((sum, v) => sum + (v.likes || 0), 0).toLocaleString()}</div>
                <div className="analytics-label">Total Likes</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="about-section">
            <h2 className="about-title"><i className="fas fa-info-circle"></i> About</h2>
            <div className="about-card">
              <div className="about-item">
                <span className="about-label">Channel Name</span>
                <span className="about-value">{channelData.name}</span>
              </div>
              <div className="about-item">
                <span className="about-label">Handle</span>
                <span className="about-value">{channelData.handle}</span>
              </div>
              <div className="about-item">
                <span className="about-label">Description</span>
                <span className="about-value">{channelData.description}</span>
              </div>
              <div className="about-item">
                <span className="about-label">Subscribers</span>
                <span className="about-value">{channelData.subscribers.toLocaleString()}</span>
              </div>
              <div className="about-item">
                <span className="about-label">Total Videos</span>
                <span className="about-value">{channelVideos.length}</span>
              </div>
              <div className="about-item">
                <span className="about-label">Joined</span>
                <span className="about-value">{new Date(channelData.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
              </div>
            </div>
          </div>
        )}

        <footer>YouTube Clone · Your Channel</footer>
      </div>

      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2><i className="fas fa-edit"></i> Edit Channel</h2>
            <div className="modal-form">
              <div className="form-group">
                <label>Channel Name *</label>
                <input
                  type="text"
                  className="modal-input"
                  placeholder="Enter channel name"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  className="modal-textarea"
                  placeholder="Enter channel description"
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Avatar URL</label>
                <input
                  type="text"
                  className="modal-input"
                  placeholder="https://example.com/avatar.jpg"
                  value={editData.avatar}
                  onChange={(e) => setEditData({ ...editData, avatar: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Banner URL</label>
                <input
                  type="text"
                  className="modal-input"
                  placeholder="https://example.com/banner.jpg"
                  value={editData.banner}
                  onChange={(e) => setEditData({ ...editData, banner: e.target.value })}
                />
              </div>
            </div>
            <div className="modal-actions">
              <button className="modal-cancel-btn" onClick={() => setShowEditModal(false)}>Cancel</button>
              <button className="modal-save-btn" onClick={handleSaveChannel}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

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
            </div>
            <div className="modal-actions">
              <button className="modal-cancel-btn" onClick={() => setShowUploadModal(false)}>Cancel</button>
              <button className="modal-upload-btn" onClick={handleUploadVideo}>
                <i className="fas fa-upload"></i> Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Channel;