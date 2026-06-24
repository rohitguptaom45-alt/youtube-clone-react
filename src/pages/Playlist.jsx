import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Auth } from '../auth';
import '../styles/Playlist.css';

function Playlist() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const userData = Auth.getUser();
    if (userData) {
      setUser(userData);
    }
    // Load playlists from localStorage
    const savedPlaylists = JSON.parse(localStorage.getItem('playlists') || '[]');
    setPlaylists(savedPlaylists);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleCreatePlaylist = () => {
    if (!newPlaylistName.trim()) {
      alert('Please enter a playlist name');
      return;
    }

    const newPlaylist = {
      id: 'playlist_' + Date.now(),
      name: newPlaylistName.trim(),
      description: newPlaylistDesc.trim() || 'No description',
      videos: [],
      createdAt: new Date().toISOString(),
      owner: user ? user.fullName : 'Unknown'
    };

    const updatedPlaylists = [newPlaylist, ...playlists];
    setPlaylists(updatedPlaylists);
    localStorage.setItem('playlists', JSON.stringify(updatedPlaylists));

    setNewPlaylistName('');
    setNewPlaylistDesc('');
    setShowCreateModal(false);
    alert('✅ Playlist created successfully!');
  };

  const handleDeletePlaylist = (playlistId) => {
    const updatedPlaylists = playlists.filter(p => p.id !== playlistId);
    setPlaylists(updatedPlaylists);
    localStorage.setItem('playlists', JSON.stringify(updatedPlaylists));
    setShowDeleteModal(false);
    setSelectedPlaylist(null);
    alert('🗑️ Playlist deleted!');
  };

  const handleViewPlaylist = (playlist) => {
    setSelectedPlaylist(playlist);
  };

  const handleAddVideo = (playlistId) => {
    const videoTitle = prompt('Enter video title to add:');
    if (!videoTitle) return;
    
    const videoThumbnail = prompt('Enter video thumbnail URL (or press Enter for default):');
    
    const updatedPlaylists = playlists.map(p => {
      if (p.id === playlistId) {
        return {
          ...p,
          videos: [
            ...p.videos,
            {
              id: 'video_' + Date.now(),
              title: videoTitle,
              thumbnail: videoThumbnail || 'https://picsum.photos/id/' + Math.floor(Math.random() * 100) + '/320/180',
              addedAt: new Date().toISOString()
            }
          ]
        };
      }
      return p;
    });
    
    setPlaylists(updatedPlaylists);
    localStorage.setItem('playlists', JSON.stringify(updatedPlaylists));
    alert('✅ Video added to playlist!');
  };

  const handleRemoveVideo = (playlistId, videoId) => {
    const updatedPlaylists = playlists.map(p => {
      if (p.id === playlistId) {
        return {
          ...p,
          videos: p.videos.filter(v => v.id !== videoId)
        };
      }
      return p;
    });
    
    setPlaylists(updatedPlaylists);
    localStorage.setItem('playlists', JSON.stringify(updatedPlaylists));
  };

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
          <div className="playlist-detail">
            <div className="playlist-detail-header">
              <button className="back-btn" onClick={() => setSelectedPlaylist(null)}>
                <i className="fas fa-arrow-left"></i> Back to Playlists
              </button>
              <div className="playlist-detail-info">
                <h2>{selectedPlaylist.name}</h2>
                <p>{selectedPlaylist.description}</p>
                <span className="playlist-video-count">{selectedPlaylist.videos.length} videos</span>
              </div>
              <button className="add-video-btn" onClick={() => handleAddVideo(selectedPlaylist.id)}>
                <i className="fas fa-plus"></i> Add Video
              </button>
            </div>

            {selectedPlaylist.videos.length === 0 ? (
              <div className="empty-playlist">
                <i className="fas fa-music" style={{ fontSize: '4rem', color: '#555' }}></i>
                <p>No videos in this playlist yet</p>
                <button className="add-video-btn" onClick={() => handleAddVideo(selectedPlaylist.id)}>
                  <i className="fas fa-plus"></i> Add your first video
                </button>
              </div>
            ) : (
              <div className="playlist-videos-grid">
                {selectedPlaylist.videos.map(video => (
                  <div key={video.id} className="playlist-video-card">
                    <img className="playlist-video-thumbnail" src={video.thumbnail} alt={video.title} />
                    <div className="playlist-video-info">
                      <h4 className="playlist-video-title">{video.title}</h4>
                      <span className="playlist-video-added">Added: {new Date(video.addedAt).toLocaleDateString()}</span>
                    </div>
                    <button className="remove-video-btn" onClick={() => handleRemoveVideo(selectedPlaylist.id, video.id)}>
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
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
              playlists.map(playlist => (
                <div key={playlist.id} className="playlist-card">
                  <div className="playlist-card-header">
                    <h3 className="playlist-card-title">{playlist.name}</h3>
                    <button className="delete-playlist-btn" onClick={() => {
                      setSelectedPlaylist(playlist);
                      setShowDeleteModal(true);
                    }}>
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                  <p className="playlist-card-desc">{playlist.description}</p>
                  <div className="playlist-card-stats">
                    <span><i className="fas fa-video"></i> {playlist.videos.length} videos</span>
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
      {showDeleteModal && selectedPlaylist && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Delete Playlist?</h2>
            <p>Are you sure you want to delete "<strong>{selectedPlaylist.name}</strong>"?</p>
            <p style={{ color: '#ff6b6b', fontSize: '0.9rem' }}>This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="modal-cancel-btn" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="modal-delete-btn" onClick={() => handleDeletePlaylist(selectedPlaylist.id)}>
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