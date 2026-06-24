import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';

function Navbar({ user, onMenuClick, searchQuery, onSearchChange, onSearchSubmit }) {
  const navigate = useNavigate();

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      onSearchSubmit();
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <i className="fas fa-bars menu-icon" onClick={onMenuClick}></i>
        <div className="youtube-logo" onClick={() => navigate('/')}>
          <i className="fab fa-youtube"></i> YouTube
        </div>
      </div>
      <div className="nav-center">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={onSearchChange}
            onKeyPress={handleSearchKeyPress}
          />
          <button className="search-btn" onClick={onSearchSubmit}>
            <i className="fas fa-search"></i>
          </button>
        </div>
        <div className="mic-icon"><i className="fas fa-microphone"></i></div>
      </div>
      <div className="nav-right">
        <i className="fas fa-video" onClick={() => alert('📹 Upload video (coming soon)')}></i>
        <i className="fas fa-bell" onClick={() => alert('🔔 Notifications (mock)')}></i>
        <div className="user-avatar" onClick={() => navigate('/channel')}>
          {user ? user.fullName.charAt(0) : 'N'}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;