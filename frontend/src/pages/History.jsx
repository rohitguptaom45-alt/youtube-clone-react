import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Auth } from '../auth';
import '../styles/History.css';

function History() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    const userData = Auth.getUser();
    if (userData) {
      setUser(userData);
    }
    const savedHistory = JSON.parse(localStorage.getItem('watchHistory') || '[]');
    setHistory(savedHistory);
    setFilteredHistory(savedHistory);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      filterHistory(selectedFilter);
      return;
    }
    const filtered = history.filter(item =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.channel.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredHistory(filtered);
  };

  const filterHistory = (filter) => {
    setSelectedFilter(filter);
    const now = new Date();
    let filtered = [...history];

    if (filter === 'today') {
      filtered = filtered.filter(item => {
        const date = new Date(item.watchedAt);
        return date.toDateString() === now.toDateString();
      });
    } else if (filter === 'week') {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter(item => new Date(item.watchedAt) > weekAgo);
    } else if (filter === 'month') {
      const monthAgo = new Date(now);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      filtered = filtered.filter(item => new Date(item.watchedAt) > monthAgo);
    }

    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.channel.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredHistory(filtered);
  };

  const handleRemoveVideo = (videoId) => {
    const updatedHistory = history.filter(item => item.id !== videoId);
    setHistory(updatedHistory);
    localStorage.setItem('watchHistory', JSON.stringify(updatedHistory));
    filterHistory(selectedFilter);
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all watch history?')) {
      setHistory([]);
      localStorage.setItem('watchHistory', JSON.stringify([]));
      setFilteredHistory([]);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    filterHistory(selectedFilter);
  };

  const handlePlayVideo = (video) => {
    alert(`🎬 Now playing: ${video.title}`);
    const updatedHistory = [
      {
        id: video.id,
        title: video.title,
        channel: video.channel,
        thumbnail: video.thumbnail,
        watchedAt: new Date().toISOString()
      },
      ...history.filter(item => item.id !== video.id)
    ];
    setHistory(updatedHistory);
    localStorage.setItem('watchHistory', JSON.stringify(updatedHistory));
    filterHistory(selectedFilter);
  };

  const groupHistoryByDate = (items) => {
    const groups = {};
    items.forEach(item => {
      const date = new Date(item.watchedAt);
      const key = date.toDateString();
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
    });
    return groups;
  };

  const getDateLabel = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  const groupedHistory = groupHistoryByDate(filteredHistory);

  return (
    <div className="history-container">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-wrapper">
        <Navbar 
          user={user}
          onMenuClick={toggleSidebar}
          searchQuery=""
          onSearchChange={() => {}}
          onSearchSubmit={() => {}}
        />

        <div className="history-header">
          <div className="history-title-section">
            <h1 className="history-title">Watch History</h1>
            {history.length > 0 && (
              <button className="clear-all-btn" onClick={handleClearAll}>
                <i className="fas fa-trash"></i> Clear all
              </button>
            )}
          </div>
          
          <div className="history-search-bar">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search watch history"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
            {searchQuery && (
              <button className="clear-search-btn" onClick={handleClearSearch}>
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>

          <div className="history-filters">
            <button 
              className={`filter-btn ${selectedFilter === 'all' ? 'active' : ''}`}
              onClick={() => filterHistory('all')}
            >
              All
            </button>
            <button 
              className={`filter-btn ${selectedFilter === 'today' ? 'active' : ''}`}
              onClick={() => filterHistory('today')}
            >
              Today
            </button>
            <button 
              className={`filter-btn ${selectedFilter === 'week' ? 'active' : ''}`}
              onClick={() => filterHistory('week')}
            >
              This Week
            </button>
            <button 
              className={`filter-btn ${selectedFilter === 'month' ? 'active' : ''}`}
              onClick={() => filterHistory('month')}
            >
              This Month
            </button>
          </div>
        </div>

        {history.length === 0 ? (
          <div className="empty-history">
            <i className="fas fa-history" style={{ fontSize: '4rem', color: '#555' }}></i>
            <h2>Watch history is empty</h2>
            <p>Videos you watch will appear here</p>
            <button className="browse-btn" onClick={() => navigate('/')}>
              Browse Videos
            </button>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="empty-history">
            <i className="fas fa-search" style={{ fontSize: '4rem', color: '#555' }}></i>
            <h2>No results found</h2>
            <p>Try adjusting your search or filter</p>
            <button className="browse-btn" onClick={() => { setSearchQuery(''); filterHistory('all'); }}>
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="history-list">
            {Object.keys(groupedHistory).map(dateKey => (
              <div key={dateKey} className="history-group">
                <h3 className="history-date-label">{getDateLabel(dateKey)}</h3>
                <div className="history-items">
                  {groupedHistory[dateKey].map(item => (
                    <div key={item.id} className="history-item" onClick={() => handlePlayVideo(item)}>
                      <img className="history-thumbnail" src={item.thumbnail} alt={item.title} />
                      <div className="history-item-info">
                        <h4 className="history-item-title">{item.title}</h4>
                        <p className="history-item-channel">{item.channel}</p>
                        <span className="history-item-time">
                          {new Date(item.watchedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <button 
                        className="remove-history-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveVideo(item.id);
                        }}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <footer>YouTube Clone · Watch History</footer>
      </div>
    </div>
  );
}

export default History;