import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Chips from '../components/Chips';
import ShortList from '../components/ShortList';
import VideoCard from '../components/VideoCard';
import API from '../api';
import { Auth } from '../auth';
import '../styles/Home.css';

function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const userData = Auth.getUser();
    if (userData) {
      setUser(userData);
    }
    fetchVideos();
  }, [page]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await API.getAllVideos(page, 5, 'views', 'asc', searchQuery);
      if (response?.success && response?.data?.videos) {
        setVideos(response.data.videos);
      } else {
        setVideos([]);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoClick = (video) => {
    const history = JSON.parse(localStorage.getItem('watchHistory') || '[]');
    const newEntry = {
      id: video._id,
      title: video.title,
      channel: video.owner?.fullName || 'Unknown',
      thumbnail: video.thumbnail,
      watchedAt: new Date().toISOString()
    };
    const filtered = history.filter(item => item.id !== video._id);
    const updated = [newEntry, ...filtered];
    localStorage.setItem('watchHistory', JSON.stringify(updated));
    navigate(`/video/${video._id}`);
  };

  const handleSearch = async () => {
    if (searchQuery.trim() === '') {
      await fetchVideos();
      return;
    }
    try {
      setLoading(true);
      const response = await API.getAllVideos(1, 5, 'views', 'asc', searchQuery);
      if (response?.success && response?.data?.videos) {
        setVideos(response.data.videos);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChipClick = (chipName) => {
    if (chipName === 'All') {
      setSearchQuery('');
      fetchVideos();
    } else {
      setSearchQuery(chipName);
      fetchVideos();
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (loading) {
    return (
      <div className="home-container">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="main-wrapper">
          <Navbar user={user} onMenuClick={toggleSidebar} searchQuery="" onSearchChange={() => {}} onSearchSubmit={() => {}} />
          <div className="loading-state">Loading videos...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="home-container">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-wrapper">
        <Navbar 
          user={user}
          onMenuClick={toggleSidebar}
          searchQuery={searchQuery}
          onSearchChange={(e) => setSearchQuery(e.target.value)}
          onSearchSubmit={handleSearch}
        />
        <Chips onChipClick={handleChipClick} />
        <ShortList />
        <div className="video-grid">
          {videos.length === 0 ? (
            <div className="no-videos">No videos available</div>
          ) : (
            videos.map(video => (
              <VideoCard 
                key={video._id} 
                video={video} 
                onVideoClick={handleVideoClick}
              />
            ))
          )}
        </div>
        <footer>YouTube Clone · API Integration</footer>
      </div>
    </div>
  );
}

export default Home;