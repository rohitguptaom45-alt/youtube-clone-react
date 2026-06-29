import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth } from '../auth';
import '../styles/Sidebar.css';

function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();

  const handleItemClick = (page) => {
    if (page === 'home') {
      navigate('/');
    } else if (page === 'channel') {
      navigate('/channel');
    } else if (page === 'playlist') {
      navigate('/playlist');
    } else if (page === 'history') {
      navigate('/history');
    } else if (page === 'library') {
      navigate('/library');
    } else if (page === 'watchlater') {
      navigate('/watchlater');
    } else if (page === 'liked') {
      navigate('/liked');
    } else if (page === 'yourvideos') {
      navigate('/yourvideos');
    } else if (page === 'settings') {
      navigate('/settings');
    } else if (page === 'help') {
      navigate('/help');
    } else if (page === 'talk') {
      navigate('/talk');
    } else if (page === 'signout') {
      Auth.logout();
    } else {
      alert(`📍 ${page} (mock)`);
    }
    if (window.innerWidth <= 768) {
      onClose();
    }
  };

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}></div>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo"><i className="fab fa-youtube"></i> YouTube</div>
          <button className="sidebar-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <nav className="sidebar-nav">
          <div className="sidebar-item active" onClick={() => handleItemClick('home')}>
            <i className="fas fa-home"></i><span>Home</span>
          </div>
          <div className="sidebar-item" onClick={() => handleItemClick('explore')}>
            <i className="fas fa-compass"></i><span>Explore</span>
          </div>
          <div className="sidebar-item" onClick={() => handleItemClick('shorts')}>
            <i className="fas fa-film"></i><span>Shorts</span>
          </div>
          <div className="sidebar-item" onClick={() => handleItemClick('subscriptions')}>
            <i className="fas fa-bell"></i><span>Subscriptions</span>
          </div>
          <div className="sidebar-divider"></div>
          <div className="sidebar-item" onClick={() => handleItemClick('library')}>
            <i className="fas fa-folder"></i><span>Library</span>
          </div>
          <div className="sidebar-item" onClick={() => handleItemClick('playlist')}>
            <i className="fas fa-list"></i><span>Playlists</span>
          </div>
          <div className="sidebar-item" onClick={() => handleItemClick('history')}>
            <i className="fas fa-history"></i><span>History</span>
          </div>
          <div className="sidebar-item" onClick={() => handleItemClick('watchlater')}>
            <i className="fas fa-clock"></i><span>Watch later</span>
          </div>
          <div className="sidebar-item" onClick={() => handleItemClick('liked')}>
            <i className="fas fa-thumbs-up"></i><span>Liked videos</span>
          </div>
          <div className="sidebar-item" onClick={() => handleItemClick('yourvideos')}>
            <i className="fas fa-play-circle"></i><span>Your videos</span>
          </div>
          <div className="sidebar-divider"></div>
          <div className="sidebar-item" onClick={() => handleItemClick('channel')}>
            <i className="fas fa-user-circle"></i><span>Your channel</span>
          </div>
          <div className="sidebar-item" onClick={() => handleItemClick('talk')}>
            <i className="fas fa-comment-dots"></i><span>Talk/Tweet</span>
          </div>
          <div className="sidebar-item" onClick={() => handleItemClick('settings')}>
            <i className="fas fa-cog"></i><span>Settings</span>
          </div>
          <div className="sidebar-item" onClick={() => handleItemClick('help')}>
            <i className="fas fa-question-circle"></i><span>Help</span>
          </div>
          <div className="sidebar-divider"></div>
          <div className="sidebar-item" onClick={() => handleItemClick('signout')}>
            <i className="fas fa-sign-out-alt"></i><span>Sign out</span>
          </div>
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;