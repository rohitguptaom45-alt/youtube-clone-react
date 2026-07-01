import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Channel from './pages/Channel';
import Playlist from './pages/Playlist';
import History from './pages/History';
import Library from './pages/Library';
import WatchLater from './pages/WatchLater';
import LikedVideos from './pages/LikedVideos';
import YourVideos from './pages/YourVideos';
import Settings from './pages/Settings';
import Help from './pages/Help';
import Talk from './pages/Talk';
import VideoPlayer from './pages/VideoPlayer';
import Signin from './pages/Signin';
import { Auth } from './auth';
import './App.css';

function App() {
  useEffect(() => {
    const isAuth = Auth.isAuthenticated();
    if (!isAuth && window.location.pathname !== '/signin') {
      window.location.href = '/signin';
    }
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/channel" element={<Channel />} />
      <Route path="/playlist" element={<Playlist />} />
      <Route path="/history" element={<History />} />
      <Route path="/library" element={<Library />} />
      <Route path="/watchlater" element={<WatchLater />} />
      <Route path="/liked" element={<LikedVideos />} />
      <Route path="/yourvideos" element={<YourVideos />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/help" element={<Help />} />
      <Route path="/talk" element={<Talk />} />
      <Route path="/video/:videoId" element={<VideoPlayer />} />
      <Route path="/signin" element={<Signin />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;