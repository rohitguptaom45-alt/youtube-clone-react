import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Auth } from '../auth';
import '../styles/Settings.css';

function Settings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('account');
  const [settings, setSettings] = useState({
    theme: 'dark',
    notifications: true,
    autoplay: true,
    privacy: 'public',
    language: 'en',
    saveHistory: true,
    showSubscribers: true,
    showLikes: true
  });
  const [accountData, setAccountData] = useState({
    fullName: '',
    email: '',
    username: '',
    bio: '',
    location: ''
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  useEffect(() => {
    const userData = Auth.getUser();
    if (userData) {
      setUser(userData);
      setAccountData({
        fullName: userData.fullName || '',
        email: userData.email || '',
        username: userData.username || '',
        bio: userData.bio || '',
        location: userData.location || ''
      });
    }
    const savedSettings = JSON.parse(localStorage.getItem('settings') || 'null');
    if (savedSettings) {
      setSettings(savedSettings);
    }
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSaveAccount = () => {
    const updatedUser = {
      ...user,
      fullName: accountData.fullName,
      email: accountData.email,
      username: accountData.username,
      bio: accountData.bio,
      location: accountData.location
    };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    alert('✅ Account settings saved successfully!');
  };

  const handleChangePassword = () => {
    if (passwordData.new !== passwordData.confirm) {
      alert('❌ Passwords do not match!');
      return;
    }
    if (passwordData.new.length < 6) {
      alert('❌ Password must be at least 6 characters!');
      return;
    }
    alert('✅ Password changed successfully!');
    setShowPasswordModal(false);
    setPasswordData({ current: '', new: '', confirm: '' });
  };

  const handleSaveSettings = () => {
    localStorage.setItem('settings', JSON.stringify(settings));
    alert('✅ Settings saved successfully!');
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      Auth.logout();
      navigate('/signin');
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm('⚠️ Are you sure you want to delete your account? This cannot be undone!')) {
      localStorage.removeItem('user');
      localStorage.removeItem('users');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('watchHistory');
      localStorage.removeItem('likedVideos');
      localStorage.removeItem('watchLater');
      localStorage.removeItem('playlists');
      localStorage.removeItem('channelData');
      localStorage.removeItem('channelVideos');
      alert('🗑️ Account deleted successfully!');
      navigate('/signin');
    }
  };

  const settingsCategories = {
    account: {
      icon: 'fas fa-user',
      label: 'Account',
      component: (
        <div className="settings-section">
          <h2 className="settings-section-title"><i className="fas fa-user"></i> Account Settings</h2>
          <div className="settings-form">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                className="settings-input"
                value={accountData.fullName}
                onChange={(e) => setAccountData({ ...accountData, fullName: e.target.value })}
                placeholder="Enter your full name"
              />
            </div>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                className="settings-input"
                value={accountData.username}
                onChange={(e) => setAccountData({ ...accountData, username: e.target.value })}
                placeholder="Enter username"
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                className="settings-input"
                value={accountData.email}
                onChange={(e) => setAccountData({ ...accountData, email: e.target.value })}
                placeholder="Enter email"
              />
            </div>
            <div className="form-group">
              <label>Bio</label>
              <textarea
                className="settings-textarea"
                value={accountData.bio}
                onChange={(e) => setAccountData({ ...accountData, bio: e.target.value })}
                placeholder="Tell something about yourself"
                rows="3"
              />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                className="settings-input"
                value={accountData.location}
                onChange={(e) => setAccountData({ ...accountData, location: e.target.value })}
                placeholder="Enter your location"
              />
            </div>
            <div className="settings-actions">
              <button className="settings-btn save-btn" onClick={handleSaveAccount}>
                <i className="fas fa-save"></i> Save Changes
              </button>
              <button className="settings-btn password-btn" onClick={() => setShowPasswordModal(true)}>
                <i className="fas fa-key"></i> Change Password
              </button>
            </div>
          </div>
        </div>
      )
    },
    privacy: {
      icon: 'fas fa-lock',
      label: 'Privacy',
      component: (
        <div className="settings-section">
          <h2 className="settings-section-title"><i className="fas fa-lock"></i> Privacy & Security</h2>
          <div className="settings-options">
            <div className="settings-option">
              <div className="option-info">
                <h4>Account Visibility</h4>
                <p>Choose who can see your channel and videos</p>
              </div>
              <select
                className="settings-select"
                value={settings.privacy}
                onChange={(e) => setSettings({ ...settings, privacy: e.target.value })}
              >
                <option value="public">Public</option>
                <option value="unlisted">Unlisted</option>
                <option value="private">Private</option>
              </select>
            </div>
            <div className="settings-option">
              <div className="option-info">
                <h4>Show Subscribers Count</h4>
                <p>Display your subscriber count publicly</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.showSubscribers}
                  onChange={(e) => setSettings({ ...settings, showSubscribers: e.target.checked })}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <div className="settings-option">
              <div className="option-info">
                <h4>Show Likes on Videos</h4>
                <p>Display like counts on your videos</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.showLikes}
                  onChange={(e) => setSettings({ ...settings, showLikes: e.target.checked })}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <div className="settings-option">
              <div className="option-info">
                <h4>Save Watch History</h4>
                <p>Keep track of your watched videos</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.saveHistory}
                  onChange={(e) => setSettings({ ...settings, saveHistory: e.target.checked })}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
      )
    },
    appearance: {
      icon: 'fas fa-palette',
      label: 'Appearance',
      component: (
        <div className="settings-section">
          <h2 className="settings-section-title"><i className="fas fa-palette"></i> Appearance</h2>
          <div className="settings-options">
            <div className="settings-option">
              <div className="option-info">
                <h4>Theme</h4>
                <p>Choose your preferred theme</p>
              </div>
              <div className="theme-options">
                <button
                  className={`theme-btn ${settings.theme === 'dark' ? 'active' : ''}`}
                  onClick={() => setSettings({ ...settings, theme: 'dark' })}
                >
                  <i className="fas fa-moon"></i> Dark
                </button>
                <button
                  className={`theme-btn ${settings.theme === 'light' ? 'active' : ''}`}
                  onClick={() => setSettings({ ...settings, theme: 'light' })}
                >
                  <i className="fas fa-sun"></i> Light
                </button>
              </div>
            </div>
            <div className="settings-option">
              <div className="option-info">
                <h4>Language</h4>
                <p>Select your preferred language</p>
              </div>
              <select
                className="settings-select"
                value={settings.language}
                onChange={(e) => setSettings({ ...settings, language: e.target.value })}
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
              </select>
            </div>
          </div>
        </div>
      )
    },
    notifications: {
      icon: 'fas fa-bell',
      label: 'Notifications',
      component: (
        <div className="settings-section">
          <h2 className="settings-section-title"><i className="fas fa-bell"></i> Notifications</h2>
          <div className="settings-options">
            <div className="settings-option">
              <div className="option-info">
                <h4>Enable Notifications</h4>
                <p>Receive notifications for updates</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <div className="settings-option">
              <div className="option-info">
                <h4>Auto-Play Videos</h4>
                <p>Automatically play next video</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.autoplay}
                  onChange={(e) => setSettings({ ...settings, autoplay: e.target.checked })}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
      )
    },
    danger: {
      icon: 'fas fa-exclamation-triangle',
      label: 'Danger Zone',
      component: (
        <div className="settings-section danger-zone">
          <h2 className="settings-section-title"><i className="fas fa-exclamation-triangle"></i> Danger Zone</h2>
          <div className="danger-actions">
            <div className="danger-item">
              <div className="danger-info">
                <h4>Sign Out</h4>
                <p>Sign out of your account on this device</p>
              </div>
              <button className="danger-btn logout-btn" onClick={handleLogout}>
                <i className="fas fa-sign-out-alt"></i> Sign Out
              </button>
            </div>
            <div className="danger-item">
              <div className="danger-info">
                <h4>Delete Account</h4>
                <p>Permanently delete your account and all data</p>
              </div>
              <button className="danger-btn delete-btn" onClick={handleDeleteAccount}>
                <i className="fas fa-trash"></i> Delete Account
              </button>
            </div>
          </div>
        </div>
      )
    }
  };

  return (
    <div className="settings-container">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-wrapper">
        <Navbar 
          user={user}
          onMenuClick={toggleSidebar}
          searchQuery=""
          onSearchChange={() => {}}
          onSearchSubmit={() => {}}
        />

        <div className="settings-header">
          <h1 className="settings-title"><i className="fas fa-cog"></i> Settings</h1>
          <button className="settings-save-all" onClick={handleSaveSettings}>
            <i className="fas fa-save"></i> Save All
          </button>
        </div>

        <div className="settings-body">
          <div className="settings-sidebar">
            {Object.entries(settingsCategories).map(([key, value]) => (
              <div
                key={key}
                className={`settings-sidebar-item ${activeTab === key ? 'active' : ''}`}
                onClick={() => setActiveTab(key)}
              >
                <i className={value.icon}></i>
                <span>{value.label}</span>
              </div>
            ))}
          </div>
          <div className="settings-content">
            {settingsCategories[activeTab].component}
          </div>
        </div>

        <footer>YouTube Clone · Settings</footer>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2><i className="fas fa-key"></i> Change Password</h2>
            <div className="modal-form">
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  className="modal-input"
                  placeholder="Enter current password"
                  value={passwordData.current}
                  onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  className="modal-input"
                  placeholder="Enter new password (min 6 chars)"
                  value={passwordData.new}
                  onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  className="modal-input"
                  placeholder="Confirm new password"
                  value={passwordData.confirm}
                  onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                />
              </div>
            </div>
            <div className="modal-actions">
              <button className="modal-cancel-btn" onClick={() => setShowPasswordModal(false)}>Cancel</button>
              <button className="modal-save-btn" onClick={handleChangePassword}>Change Password</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Settings;