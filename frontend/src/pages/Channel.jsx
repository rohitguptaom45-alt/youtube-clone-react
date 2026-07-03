import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import API from '../api';
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
    description: ''
  });

  // Avatar / Banner file upload state (real backend upload)
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);

  const [newVideo, setNewVideo] = useState({
    title: '',
    description: ''
  });
  const [newVideoFile, setNewVideoFile] = useState(null);
  const [newThumbnailFile, setNewThumbnailFile] = useState(null);
  const [newThumbnailPreview, setNewThumbnailPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Edit existing video (title/description/thumbnail)
  const [showEditVideoModal, setShowEditVideoModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [editVideoData, setEditVideoData] = useState({ title: '', description: '' });
  const [editThumbnailFile, setEditThumbnailFile] = useState(null);
  const [editThumbnailPreview, setEditThumbnailPreview] = useState(null);

  useEffect(() => {
    const userData = Auth.getUser();
    if (userData) {
      setUser(userData);
      fetchChannelData(userData.username);
    }
  }, []);

  // Runs once channelData (and its ownerId) is known
  useEffect(() => {
    if (channelData?.ownerId) {
      fetchChannelVideos(channelData.ownerId);
    }
  }, [channelData?.ownerId]);

  const fetchChannelVideos = async (ownerId) => {
    try {
      const response = await API.getAllVideos(1, 50, 'createdAt', 'desc', '', ownerId);
      if (response?.success && response?.data?.video) {
        const normalized = response.data.video.map(v => ({
          id: v._id,
          title: v.title,
          description: v.description,
          thumbnail: v.thumbnail,
          videoFile: v.videoFile,
          views: v.views || 0,
          likes: v.likesCount || 0,
          uploadedAt: v.createdAt
        }));
        setChannelVideos(normalized);
      } else {
        const videos = JSON.parse(localStorage.getItem('channelVideos') || '[]');
        setChannelVideos(videos);
      }
    } catch (error) {
      console.error('Fetch channel videos error:', error);
      const videos = JSON.parse(localStorage.getItem('channelVideos') || '[]');
      setChannelVideos(videos);
    }
  };

  // Real backend data: fullName, username, avatar, coverImage, subscribersCount, isSubscribed, email
  // description/createdAt aren't in the backend schema, so they're kept locally per-username.
  const fetchChannelData = async (username) => {
    try {
      const response = await API.getUserProfile(username);
      if (response?.success && response?.data) {
        const backendChannel = response.data;
        const localExtra = JSON.parse(localStorage.getItem('channelExtra_' + username) || '{}');
        setChannelData({
          ownerId: backendChannel._id,
          name: backendChannel.fullName,
          handle: '@' + backendChannel.username,
          email: backendChannel.email,
          subscribers: backendChannel.subscribersCount || 0,
          avatar: backendChannel.avatar,
          banner: backendChannel.coverImage || 'https://picsum.photos/id/129/1600/300',
          description: localExtra.description || 'Welcome to my YouTube channel! I create amazing content.',
          createdAt: localExtra.createdAt || new Date().toISOString()
        });
        setIsSubscribed(backendChannel.isSubscribed || false);
      } else {
        loadLocalChannel();
      }
    } catch (error) {
      console.error('Fetch channel error:', error);
      loadLocalChannel();
    }
  };

  const loadLocalChannel = () => {
    const userData = Auth.getUser();
    if (!userData) return;
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
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSubscribe = async () => {
    if (!channelData?.ownerId) return;
    try {
      const response = await API.toggleSubscription(channelData.ownerId);
      if (response?.success) {
        const nowSubscribed = !isSubscribed;
        setIsSubscribed(nowSubscribed);
        setChannelData(prev => ({
          ...prev,
          subscribers: prev.subscribers + (nowSubscribed ? 1 : -1)
        }));
        alert(nowSubscribed ? '✅ Subscribed to channel!' : '❌ Unsubscribed from channel');
      }
    } catch (error) {
      console.error('Subscribe error:', error);
      alert(error?.message || 'Failed to update subscription');
    }
  };

  const handleEditChannel = () => {
    setEditData({
      name: channelData.name,
      description: channelData.description
    });
    setAvatarFile(null);
    setAvatarPreview(null);
    setBannerFile(null);
    setBannerPreview(null);
    setShowEditModal(true);
  };

  const handleAvatarFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleBannerFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveChannel = async () => {
    if (!editData.name.trim()) {
      alert('Channel name is required');
      return;
    }

    try {
      // Update fullName (send current email too so backend doesn't null it out)
      const nameResponse = await API.updateAccountDetails(editData.name.trim(), channelData.email);

      let updatedAvatar = channelData.avatar;
      let updatedBanner = channelData.banner;

      if (avatarFile) {
        const avatarResponse = await API.updateUserAvatar(avatarFile);
        if (avatarResponse?.success) {
          updatedAvatar = avatarResponse.data.avatar;
        }
      }

      if (bannerFile) {
        const bannerResponse = await API.updateUserCoverImage(bannerFile);
        if (bannerResponse?.success) {
          updatedBanner = bannerResponse.data.coverImage;
        }
      }

      const updatedChannel = {
        ...channelData,
        name: nameResponse?.data?.fullName || editData.name.trim(),
        avatar: updatedAvatar,
        banner: updatedBanner,
        description: editData.description || 'No description'
      };

      // description/createdAt aren't backend fields - persist locally per-username
      localStorage.setItem(
        'channelExtra_' + channelData.handle.replace('@', ''),
        JSON.stringify({ description: updatedChannel.description, createdAt: channelData.createdAt })
      );

      setChannelData(updatedChannel);
      setShowEditModal(false);
      setAvatarFile(null);
      setAvatarPreview(null);
      setBannerFile(null);
      setBannerPreview(null);
      alert('✅ Channel updated successfully!');
    } catch (error) {
      console.error('Save channel error:', error);
      alert(error?.message || 'Failed to update channel');
    }
  };

  const handleNewVideoFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setNewVideoFile(file);
  };

  const handleNewThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewThumbnailFile(file);
      setNewThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleUploadVideo = async () => {
    if (!newVideo.title.trim()) {
      alert('Please enter a video title');
      return;
    }
    if (!newVideo.description.trim()) {
      alert('Please enter a video description');
      return;
    }
    if (!newThumbnailFile) {
      alert('Please choose a thumbnail image');
      return;
    }
    if (!newVideoFile) {
      alert('Please choose a video file');
      return;
    }

    try {
      setUploading(true);
      const response = await API.publishAVideo({
        title: newVideo.title.trim(),
        description: newVideo.description.trim(),
        videoFile: newVideoFile,
        thumbnail: newThumbnailFile
      });
      if (response?.success) {
        await fetchChannelVideos(channelData.ownerId);
        setShowUploadModal(false);
        setNewVideo({ title: '', description: '' });
        setNewVideoFile(null);
        setNewThumbnailFile(null);
        setNewThumbnailPreview(null);
        alert('✅ Video uploaded successfully!');
      } else {
        alert(response?.message || 'Failed to upload video');
      }
    } catch (error) {
      console.error('Publish video error:', error);
      alert(error?.message || 'Failed to upload video');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm('Delete this video?')) return;
    try {
      const response = await API.deleteVideo(videoId);
      if (response?.success) {
        setChannelVideos(prev => prev.filter(v => v.id !== videoId));
        alert('🗑️ Video deleted!');
      } else {
        alert(response?.message || 'Failed to delete video');
      }
    } catch (error) {
      console.error('Delete video error:', error);
      alert(error?.message || 'Failed to delete video');
    }
  };

  // ---- Edit video (title/description + optional thumbnail change) ----

  const startEditVideo = (video) => {
    setEditingVideo(video);
    setEditVideoData({ title: video.title, description: video.description });
    setEditThumbnailFile(null);
    setEditThumbnailPreview(null);
    setShowEditVideoModal(true);
  };

  const handleEditThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditThumbnailFile(file);
      setEditThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveVideoEdit = async () => {
    if (!editingVideo) return;
    if (!editVideoData.title.trim() && !editVideoData.description.trim()) {
      alert('Title or description is required');
      return;
    }

    try {
      const detailResponse = await API.updateVideoDetail(editingVideo.id, {
        title: editVideoData.title.trim(),
        description: editVideoData.description.trim()
      });

      let updatedThumbnail = editingVideo.thumbnail;
      if (editThumbnailFile) {
        const thumbResponse = await API.updateVideoThumbnail(editingVideo.id, editThumbnailFile);
        if (thumbResponse?.success) {
          updatedThumbnail = thumbResponse.data.thumbnail;
        }
      }

      if (detailResponse?.success) {
        setChannelVideos(prev => prev.map(v =>
          v.id === editingVideo.id
            ? { ...v, title: editVideoData.title.trim(), description: editVideoData.description.trim(), thumbnail: updatedThumbnail }
            : v
        ));
        setShowEditVideoModal(false);
        setEditingVideo(null);
        alert('✅ Video updated successfully!');
      } else {
        alert(detailResponse?.message || 'Failed to update video');
      }
    } catch (error) {
      console.error('Update video error:', error);
      alert(error?.message || 'Failed to update video');
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
                      <div className="video-owner-actions">
                        <button className="edit-video-btn" onClick={() => startEditVideo(video)}>
                          <i className="fas fa-pen"></i>
                        </button>
                        <button className="delete-video-btn" onClick={() => handleDeleteVideo(video.id)}>
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
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

              {/* Real backend avatar upload */}
              <div className="form-group">
                <label>Avatar</label>
                <div className="modal-image-row">
                  <img
                    className="modal-avatar-preview"
                    src={avatarPreview || channelData.avatar}
                    alt="avatar preview"
                  />
                  <label className="modal-file-btn">
                    <i className="fas fa-image"></i> Choose Image
                    <input type="file" accept="image/*" hidden onChange={handleAvatarFileChange} />
                  </label>
                </div>
              </div>

              {/* Real backend cover/banner upload */}
              <div className="form-group">
                <label>Banner</label>
                <div className="modal-image-row">
                  <img
                    className="modal-banner-preview"
                    src={bannerPreview || channelData.banner}
                    alt="banner preview"
                  />
                  <label className="modal-file-btn">
                    <i className="fas fa-image"></i> Choose Image
                    <input type="file" accept="image/*" hidden onChange={handleBannerFileChange} />
                  </label>
                </div>
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
        <div className="modal-overlay" onClick={() => !uploading && setShowUploadModal(false)}>
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
                <label>Description *</label>
                <textarea
                  className="modal-textarea"
                  placeholder="Enter video description"
                  value={newVideo.description}
                  onChange={(e) => setNewVideo({ ...newVideo, description: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Thumbnail *</label>
                <div className="modal-image-row">
                  {newThumbnailPreview && (
                    <img className="modal-banner-preview" src={newThumbnailPreview} alt="thumbnail preview" />
                  )}
                  <label className="modal-file-btn">
                    <i className="fas fa-image"></i> Choose Thumbnail
                    <input type="file" accept="image/*" hidden onChange={handleNewThumbnailChange} />
                  </label>
                </div>
              </div>
              <div className="form-group">
                <label>Video File *</label>
                <label className="modal-file-btn">
                  <i className="fas fa-file-video"></i> {newVideoFile ? newVideoFile.name : 'Choose Video'}
                  <input type="file" accept="video/*" hidden onChange={handleNewVideoFileChange} />
                </label>
              </div>
            </div>
            <div className="modal-actions">
              <button className="modal-cancel-btn" disabled={uploading} onClick={() => setShowUploadModal(false)}>Cancel</button>
              <button className="modal-upload-btn" disabled={uploading} onClick={handleUploadVideo}>
                <i className="fas fa-upload"></i> {uploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditVideoModal && editingVideo && (
        <div className="modal-overlay" onClick={() => setShowEditVideoModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2><i className="fas fa-pen"></i> Edit Video</h2>
            <div className="modal-form">
              <div className="form-group">
                <label>Video Title</label>
                <input
                  type="text"
                  className="modal-input"
                  value={editVideoData.title}
                  onChange={(e) => setEditVideoData({ ...editVideoData, title: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  className="modal-textarea"
                  value={editVideoData.description}
                  onChange={(e) => setEditVideoData({ ...editVideoData, description: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Thumbnail</label>
                <div className="modal-image-row">
                  <img
                    className="modal-banner-preview"
                    src={editThumbnailPreview || editingVideo.thumbnail}
                    alt="thumbnail preview"
                  />
                  <label className="modal-file-btn">
                    <i className="fas fa-image"></i> Change Thumbnail
                    <input type="file" accept="image/*" hidden onChange={handleEditThumbnailChange} />
                  </label>
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button className="modal-cancel-btn" onClick={() => setShowEditVideoModal(false)}>Cancel</button>
              <button className="modal-save-btn" onClick={handleSaveVideoEdit}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Channel;