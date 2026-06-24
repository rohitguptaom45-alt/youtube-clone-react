import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Chips from '../components/Chips';
import ShortList from '../components/ShortList';
import VideoCard from '../components/VideoCard';
import { Auth } from '../auth';
import '../styles/Home.css';

const mockVideos = [
  { _id: "v1", title: "Mix - Rang Jo Lagyo | Ramaiya Vastavaiya | Girish Kumar, Shruti Haasan | Atif Aslam, Shreya Ghoshal", thumbnail: "https://picsum.photos/id/101/320/180", views: "2.3M", duration: "10:49", owner: { _id: "ch1", fullName: "T-Series", avatar: "https://picsum.photos/id/100/50/50" }, uploadedAt: "2 days ago", likes: "178K", comments: "4.2K" },
  { _id: "v2", title: "HOW I'D START DSA", thumbnail: "https://picsum.photos/id/26/320/180", views: "892K", duration: "15:32", owner: { _id: "ch2", fullName: "Code with Nagender", avatar: "https://picsum.photos/id/91/50/50" }, uploadedAt: "5 days ago", likes: "45K", comments: "1.2K" },
  { _id: "v3", title: "If I had to learn DSA again, I'd do this | Complete DSA", thumbnail: "https://picsum.photos/id/0/320/180", views: "1.1M", duration: "22:08", owner: { _id: "ch2", fullName: "Code with Nagender", avatar: "https://picsum.photos/id/91/50/50" }, uploadedAt: "1 week ago", likes: "67K", comments: "2.9K" },
  { _id: "v4", title: "Every Indian Trip Ever | My First Animated Vlog", thumbnail: "https://picsum.photos/id/15/320/180", views: "3.4M", duration: "8:15", owner: { _id: "ch3", fullName: "Indian Trips", avatar: "https://picsum.photos/id/22/50/50" }, uploadedAt: "2 weeks ago", likes: "210K", comments: "8.7K" },
  { _id: "v5", title: "POVA 8 - Delete Normal", thumbnail: "https://picsum.photos/id/76/320/180", views: "567K", duration: "6:42", owner: { _id: "ch4", fullName: "Tech Arena", avatar: "https://picsum.photos/id/77/50/50" }, uploadedAt: "3 days ago", likes: "23K", comments: "560" },
  { _id: "v6", title: "POVA 8 - Sponsored - POVA Mobile", thumbnail: "https://picsum.photos/id/95/320/180", views: "1.2M", duration: "4:20", owner: { _id: "ch4", fullName: "POVA Mobile", avatar: "https://picsum.photos/id/96/50/50" }, uploadedAt: "1 day ago", likes: "87K", comments: "3.1K" },
  { _id: "v7", title: "Pre-Book Now", thumbnail: "https://picsum.photos/id/42/320/180", views: "234K", duration: "0:45", owner: { _id: "ch5", fullName: "Gadget Hub", avatar: "https://picsum.photos/id/43/50/50" }, uploadedAt: "6 hours ago", likes: "9K", comments: "234" },
  { _id: "v8", title: "INDIAN TRIPS ONLINE FRIENDS (Podcast)", thumbnail: "https://picsum.photos/id/86/320/180", views: "876K", duration: "28:30", owner: { _id: "ch3", fullName: "Indian Trips", avatar: "https://picsum.photos/id/22/50/50" }, uploadedAt: "8 days ago", likes: "32K", comments: "1.9K" },
  { _id: "v9", title: "React JS Masterclass 2025", thumbnail: "https://picsum.photos/id/1/320/180", views: "1.5M", duration: "3:15:22", owner: { _id: "ch6", fullName: "CodeWithHarry", avatar: "https://picsum.photos/id/2/50/50" }, uploadedAt: "3 weeks ago", likes: "98K", comments: "4.1K" },
  { _id: "v10", title: "Top 10 Bollywood Songs 2025", thumbnail: "https://picsum.photos/id/3/320/180", views: "5.2M", duration: "12:45", owner: { _id: "ch1", fullName: "T-Series", avatar: "https://picsum.photos/id/100/50/50" }, uploadedAt: "1 month ago", likes: "412K", comments: "18K" },
  { _id: "v11", title: "IPL 2025 Highlights: Final Match", thumbnail: "https://picsum.photos/id/4/320/180", views: "9.8M", duration: "18:22", owner: { _id: "ch7", fullName: "IPL Official", avatar: "https://picsum.photos/id/5/50/50" }, uploadedAt: "2 weeks ago", likes: "890K", comments: "52K" },
  { _id: "v12", title: "PUBG Mobile New Update 3.5", thumbnail: "https://picsum.photos/id/6/320/180", views: "2.1M", duration: "8:30", owner: { _id: "ch8", fullName: "Dynamo Gaming", avatar: "https://picsum.photos/id/7/50/50" }, uploadedAt: "4 days ago", likes: "156K", comments: "9.2K" },
  { _id: "v13", title: "JavaScript in One Video", thumbnail: "https://picsum.photos/id/8/320/180", views: "3.3M", duration: "6:45:12", owner: { _id: "ch2", fullName: "Code with Nagender", avatar: "https://picsum.photos/id/91/50/50" }, uploadedAt: "2 months ago", likes: "276K", comments: "12K" },
  { _id: "v14", title: "Koffee With Karan S8 E1", thumbnail: "https://picsum.photos/id/9/320/180", views: "12M", duration: "52:18", owner: { _id: "ch9", fullName: "Disney+ Hotstar", avatar: "https://picsum.photos/id/10/50/50" }, uploadedAt: "1 week ago", likes: "1.2M", comments: "87K" },
  { _id: "v15", title: "Tesla Cybertruck Review India", thumbnail: "https://picsum.photos/id/11/320/180", views: "4.5M", duration: "19:45", owner: { _id: "ch10", fullName: "Carwale", avatar: "https://picsum.photos/id/12/50/50" }, uploadedAt: "5 days ago", likes: "234K", comments: "15K" },
  { _id: "v16", title: "Best Study Motivation 2025", thumbnail: "https://picsum.photos/id/13/320/180", views: "987K", duration: "5:20", owner: { _id: "ch11", fullName: "Motivation India", avatar: "https://picsum.photos/id/14/50/50" }, uploadedAt: "3 days ago", likes: "78K", comments: "3.1K" }
];

function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [videos, setVideos] = useState(mockVideos);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const userData = Auth.getUser();
    if (userData) {
      setUser(userData);
    }
  }, []);

  const handleVideoClick = (video) => {
    const history = JSON.parse(localStorage.getItem('watchHistory') || '[]');
    const newEntry = {
      id: video._id,
      title: video.title,
      channel: video.owner.fullName,
      thumbnail: video.thumbnail,
      watchedAt: new Date().toISOString()
    };
    const filtered = history.filter(item => item.id !== video._id);
    const updated = [newEntry, ...filtered];
    localStorage.setItem('watchHistory', JSON.stringify(updated));

    const watchLaterConfirm = window.confirm(`⏰ Save "${video.title}" to Watch Later?`);
    if (watchLaterConfirm) {
      const watchLater = JSON.parse(localStorage.getItem('watchLater') || '[]');
      if (!watchLater.find(v => v.id === video._id)) {
        watchLater.push({
          id: video._id,
          title: video.title,
          channel: video.owner.fullName,
          thumbnail: video.thumbnail,
          addedAt: new Date().toISOString()
        });
        localStorage.setItem('watchLater', JSON.stringify(watchLater));
        alert('✅ Added to Watch Later!');
      } else {
        alert('⚠️ Already in Watch Later!');
      }
    }

    const likeConfirm = window.confirm(`❤️ Like "${video.title}"?`);
    if (likeConfirm) {
      const liked = JSON.parse(localStorage.getItem('likedVideos') || '[]');
      if (!liked.find(v => v.id === video._id)) {
        liked.push({
          id: video._id,
          title: video.title,
          channel: video.owner.fullName,
          thumbnail: video.thumbnail
        });
        localStorage.setItem('likedVideos', JSON.stringify(liked));
        alert('✅ Added to Liked Videos!');
      } else {
        alert('⚠️ Already in Liked Videos!');
      }
    }

    const addToPlaylist = window.confirm(`📋 Add "${video.title}" to a playlist?`);
    if (addToPlaylist) {
      const playlists = JSON.parse(localStorage.getItem('playlists') || '[]');
      if (playlists.length === 0) {
        alert('No playlists found! Create one from Playlist page.');
      } else {
        const playlistNames = playlists.map((p, i) => `${i + 1}. ${p.name}`);
        const choice = prompt(`Select playlist:\n${playlistNames.join('\n')}\n\nEnter number:`);
        const index = parseInt(choice) - 1;
        if (index >= 0 && index < playlists.length) {
          const selectedPlaylist = playlists[index];
          if (!selectedPlaylist.videos.find(v => v.id === video._id)) {
            selectedPlaylist.videos.push({
              id: video._id,
              title: video.title,
              thumbnail: video.thumbnail,
              addedAt: new Date().toISOString()
            });
            localStorage.setItem('playlists', JSON.stringify(playlists));
            alert(`✅ Added to "${selectedPlaylist.name}"!`);
          } else {
            alert('⚠️ Already in this playlist!');
          }
        } else {
          alert('Invalid selection!');
        }
      }
    }

    navigate(`/video/${video._id}`);
  };

  const handleSearch = () => {
    if (searchQuery.trim() === '') {
      setVideos(mockVideos);
      return;
    }
    const filtered = mockVideos.filter(v => 
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.owner.fullName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setVideos(filtered);
  };

  const handleChipClick = (chipName) => {
    if (chipName === 'All') {
      setVideos(mockVideos);
    } else if (chipName === 'Music') {
      const filtered = mockVideos.filter(v => 
        v.title.toLowerCase().includes('mix') ||
        v.title.toLowerCase().includes('arijit') ||
        v.title.toLowerCase().includes('bollywood')
      );
      setVideos(filtered);
    } else {
      setVideos(mockVideos.slice(0, 6));
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

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
          {videos.map(video => (
            <VideoCard 
              key={video._id} 
              video={video} 
              onVideoClick={handleVideoClick}
            />
          ))}
        </div>
        <footer>YouTube Clone · React + Vite · Mock API ready</footer>
      </div>
    </div>
  );
}

export default Home;