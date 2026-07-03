import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import API from '../api';
import { Auth } from '../auth';
import '../styles/Playlist.css';

// Backend playlist list shape (getUserPlaylists): { _id, name, description, videoCount, firstVideoThumbnail, createdAt }
// Backend playlist detail shape (getPlaylistById): { _id, name, description, videos: [{_id, title, thumbnail, ...}], owner, createdAt }

function Playlist() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [playlistToDelete, setPlaylistToDelete] = useState(null);

  useEffect(() => {
    const userData = Auth.getUser();
    setUser(userData);
    if (userData?._id) {
      fetchPlaylists(userData._id);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchPlaylists = async (userId) => {
    try {
      setLoading(true);
      const response = await API.getUserPlaylists(userId);
      if (response?.success && Array.isArray(response?.data)) {
        setPlaylists(response.data);
      }
    } catch (error) {
      console.error('Error fetching playlists:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) {
      alert('Please enter a playlist name');
      return;
    }

    try {
      const response = await API.createPlaylist(newPlaylistName.trim(), newPlaylistDesc.trim());
      if (response?.success) {
        setNewPlaylistName('');
        setNewPlaylistDesc('');
        setShowCreateModal(false);
        if (user?._id) await fetchPlaylists(user._id);
        alert('✅ Playlist created successfully!');
      } else {
        alert(response?.message || 'Failed to create playlist');
      }
    } catch (error) {
      console.error('Create playlist error:', error);
      alert(error?.message || 'Failed to create playlist');
    }
  };

  const confirmDeletePlaylist = (playlist) => {
    setPlaylistToDelete(playlist);
    setShowDeleteModal(true);
  };

  const handleDeletePlaylist = async () => {
    if (!playlistToDelete) return;
    try {
      const response = await API.deletePlaylist(playlistToDelete._id);
      if (response?.success) {
        setShowDeleteModal(false);
        setPlaylistToDelete(null);
        setSelectedPlaylist(null);
        if (user?._id) await fetchPlaylists(user._id);
        alert('🗑️ Playlist deleted!');
      } else {
        alert(response?.message || 'Failed to delete playlist');
      }
    } catch (error) {
      console.error('Delete playlist error:', error);
      alert(error?.message || 'Failed to delete playlist');
    }
  };

  const handleViewPlaylist = async (playlist) => {
    try {
      setDetailLoading(true);
      const response = await API.getPlaylistById(playlist._id);
      if (response?.success && response?.data) {
        setSelectedPlaylist(response.data);
      } else {
        alert(response?.message || 'Failed to load playlist');
      }
    } catch (error) {
      console.error('Get playlist error:', error);
      alert(error?.message || 'Failed to load playlist');
    } finally {
      setDetailLoading(false);
    }
  };

  const refreshSelectedPlaylist = async (playlistId) => {
    const response = await API.getPlaylistById(playlistId);
    if (response?.success && response?.data) {
      setSelectedPlaylist(response.data);
    }
  };

  const handleAddVideo = async (playlistId) => {
    const videoId = prompt('Paste the Video ID to add (from the video URL: /video/<id>):');
    if (!videoId || !videoId.trim()) return;

    try {
      const response = await API.addVideoToPlaylist(videoId.trim(), playlistId);
      if (response?.success) {
        await refreshSelectedPlaylist(playlistId);
        if (user?._id) await fetchPlaylists(user._id);
        alert('✅ Video added to playlist!');
      } else {
        alert(response?.message || 'Failed to add video');
      }
    } catch (error) {
      console.error('Add video error:', error);
      alert(error?.message || 'Failed to add video');
    }
  };

  const handleRemoveVideo = async (playlistId, videoId) => {
    try {
      const response = await API.removeVideoFromPlaylist(videoId, playlistId);
      if (response?.success) {
        await refreshSelectedPlaylist(playlistId);
        if (user?._id) await fetchPlaylists(user._id);
      } else {
        alert(response?.message || 'Failed to remove video');
      }
    } catch (error) {
      console.error('Remove video error:', error);
      alert(error?.message || 'Failed to remove video');
    }
  };

  if (loading) {
    return (
      <div className="playlist-container">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="main-wrapper">
          <Navbar user={user} onMenuClick={toggleSidebar} searchQuery="" onSearchChange={() => {}} onSearchSubmit={() => {}} />
          <div className="empty-playlists">
            <h2>Loading playlists...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="playlist-container">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-wrapper">
        <Navbar
          user={user}
          onMenuClick={toggleSidebar}
          searchQuery=""
          onSearchChange={() => {}}
          onSearchSubmit={() => {}}
        />

        <div className="playlist-header">
          <h1 className="playlist-title">Your Playlists</h1>
          <button className="create-playlist-btn" onClick={() => setShowCreateModal(true)}>
            <i className="fas fa-plus"></i> Create Playlist
          </button>
        </div>

        {selectedPlaylist ? (
          detailLoading ? (
            <div className="empty-playlist"><p>Loading playlist...</p></div>
          ) : (
            <div className="playlist-detail">
              <div className="playlist-detail-header">
                <button className="back-btn" onClick={() => setSelectedPlaylist(null)}>
                  <i className="fas fa-arrow-left"></i> Back to Playlists
                </button>
                <div className="playlist-detail-info">
                  <h2>{selectedPlaylist.name}</h2>
                  <p>{selectedPlaylist.description}</p>
                  <span className="playlist-video-count">{(selectedPlaylist.videos || []).length} videos</span>
                </div>
                <button className="add-video-btn" onClick={() => handleAddVideo(selectedPlaylist._id)}>
                  <i className="fas fa-plus"></i> Add Video
                </button>
              </div>

              {(selectedPlaylist.videos || []).length === 0 ? (
                <div className="empty-playlist">
                  <i className="fas fa-music" style={{ fontSize: '4rem', color: '#555' }}></i>
                  <p>No videos in this playlist yet</p>
                  <button className="add-video-btn" onClick={() => handleAddVideo(selectedPlaylist._id)}>
                    <i className="fas fa-plus"></i> Add your first video
                  </button>
                </div>
              ) : (
                <div className="playlist-videos-grid">
                  {selectedPlaylist.videos.map((video) => (
                    <div key={video._id} className="playlist-video-card">
                      <img
                        className="playlist-video-thumbnail"
                        src={video.thumbnail}
                        alt={video.title}
                        onClick={() => navigate(`/video/${video._id}`)}
                      />
                      <div className="playlist-video-info" onClick={() => navigate(`/video/${video._id}`)}>
                        <h4 className="playlist-video-title">{video.title}</h4>
                        {video.createdAt && (
                          <span className="playlist-video-added">
                            Added: {new Date(video.createdAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <button
                        className="remove-video-btn"
                        onClick={() => handleRemoveVideo(selectedPlaylist._id, video._id)}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        ) : (
          <div className="playlists-grid">
            {playlists.length === 0 ? (
              <div className="empty-playlists">
                <i className="fas fa-list" style={{ fontSize: '4rem', color: '#555' }}></i>
                <p>No playlists yet. Create your first playlist!</p>
                <button className="create-playlist-btn" onClick={() => setShowCreateModal(true)}>
                  <i className="fas fa-plus"></i> Create Playlist
                </button>
              </div>
            ) : (
              playlists.map((playlist) => (
                <div key={playlist._id} className="playlist-card">
                  {playlist.firstVideoThumbnail && (
                    <img
                      className="playlist-card-thumbnail"
                      src={playlist.firstVideoThumbnail}
                      alt={playlist.name}
                      onClick={() => handleViewPlaylist(playlist)}
                    />
                  )}
                  <div className="playlist-card-header">
                    <h3 className="playlist-card-title">{playlist.name}</h3>
                    <button className="delete-playlist-btn" onClick={() => confirmDeletePlaylist(playlist)}>
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                  <p className="playlist-card-desc">{playlist.description}</p>
                  <div className="playlist-card-stats">
                    <span><i className="fas fa-video"></i> {playlist.videoCount || 0} videos</span>
                    <span><i className="far fa-calendar-alt"></i> {new Date(playlist.createdAt).toLocaleDateString()}</span>
                  </div>
                  <button className="view-playlist-btn" onClick={() => handleViewPlaylist(playlist)}>
                    View Playlist <i className="fas fa-arrow-right"></i>
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        <footer>YouTube Clone · Playlist Manager</footer>
      </div>

      {/* Create Playlist Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Playlist</h2>
            <input
              type="text"
              className="modal-input"
              placeholder="Playlist name"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
            />
            <textarea
              className="modal-textarea"
              placeholder="Description (optional)"
              value={newPlaylistDesc}
              onChange={(e) => setNewPlaylistDesc(e.target.value)}
            />
            <div className="modal-actions">
              <button className="modal-cancel-btn" onClick={() => setShowCreateModal(false)}>Cancel</button>
              <button className="modal-create-btn" onClick={handleCreatePlaylist}>Create</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Playlist Modal */}
      {showDeleteModal && playlistToDelete && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Delete Playlist?</h2>
            <p>Are you sure you want to delete "<strong>{playlistToDelete.name}</strong>"?</p>
            <p style={{ color: '#ff6b6b', fontSize: '0.9rem' }}>This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="modal-cancel-btn" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="modal-delete-btn" onClick={handleDeletePlaylist}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Playlist;