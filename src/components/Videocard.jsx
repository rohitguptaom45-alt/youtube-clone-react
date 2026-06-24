import React from 'react';
import '../styles/VideoCard.css';

function VideoCard({ video, onVideoClick }) {
  const handleClick = () => {
    if (onVideoClick) {
      onVideoClick(video);
    } else {
      alert(`🎬 Now playing: ${video.title}`);
    }
  };

  return (
    <div className="video-card" onClick={handleClick}>
      <img className="thumbnail" src={video.thumbnail} alt="thumbnail" loading="lazy" />
      <div className="video-details">
        <img className="channel-avatar" src={video.owner.avatar} alt="channel" />
        <div className="video-meta">
          <div className="video-title">
            {video.title.length > 60 ? video.title.slice(0, 57) + '...' : video.title}
          </div>
          <div className="channel-name">{video.owner.fullName}</div>
          <div className="stats">{video.views} views • {video.uploadedAt}</div>
          <div className="stats" style={{ fontSize: '0.7rem' }}>
            <i className="fas fa-thumbs-up"></i> {video.likes} &nbsp;
            <i className="fas fa-comment"></i> {video.comments}
          </div>
        </div>
      </div>
    </div>
  );
}

export default VideoCard;