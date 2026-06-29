import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ShortList.css';

const shortsData = [
  { id: "s1", title: "🔥 Hardest DSA question in 30 sec", views: "2.1M", thumbnail: "https://picsum.photos/id/20/200/350" },
  { id: "s2", title: "Indian wedding mashup 💥", views: "4.5M", thumbnail: "https://picsum.photos/id/29/200/350" },
  { id: "s3", title: "Arijit Singh magical voice", views: "1.8M", thumbnail: "https://picsum.photos/id/30/200/350" },
  { id: "s4", title: "Cricket celebration gone viral", views: "3.2M", thumbnail: "https://picsum.photos/id/31/200/350" },
  { id: "s5", title: "Thriller short film 🔪", views: "987K", thumbnail: "https://picsum.photos/id/33/200/350" },
  { id: "s6", title: "Bhojpuri cinema scene", views: "2.2M", thumbnail: "https://picsum.photos/id/35/200/350" },
  { id: "s7", title: "Coding is fun 😎", views: "1.1M", thumbnail: "https://picsum.photos/id/36/200/350" },
  { id: "s8", title: "PUBG one tap magic", views: "3.7M", thumbnail: "https://picsum.photos/id/37/200/350" }
];

function ShortList() {
  const navigate = useNavigate();

  const handleShortClick = (short) => {
    navigate(`/video/short_${short.id}`);
  };

  return (
    <div className="shorts-section">
      <div className="section-title">
        <i className="fas fa-fire" style={{ color: '#ff4d4d' }}></i> Shorts
      </div>
      <div className="shorts-scroll">
        {shortsData.map(short => (
          <div key={short.id} className="short-card" onClick={() => handleShortClick(short)}>
            <img className="short-thumb" src={short.thumbnail} alt="short" loading="lazy" />
            <div className="short-title">{short.title}</div>
            <div className="stats">{short.views} views</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ShortList;