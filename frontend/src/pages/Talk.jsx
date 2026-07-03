import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import API from '../api';
import { Auth } from '../auth';
import '../styles/Talk.css';

// Backend Tweet document shape: { _id, content, owner: { _id, username, fullName, avatar }, createdAt, updatedAt }
// This flattens it to match what this component renders with (id, userId, username, fullName, avatar, content...)
// Also works fine for local-storage fallback tweets which are already flat.
function normalizeTweet(t) {
  return {
    id: t._id || t.id,
    userId: t.owner?._id || t.userId,
    username: t.owner?.username || t.username || 'user',
    fullName: t.owner?.fullName || t.fullName || 'User',
    avatar: t.owner?.avatar || t.avatar || 'https://randomuser.me/api/portraits/men/32.jpg',
    content: t.content,
    likes: t.likes || [],
    createdAt: t.createdAt,
    parentId: t.parentId || null
  };
}

function Talk() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tweets, setTweets] = useState([]);
  const [newTweet, setNewTweet] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showNewTweetModal, setShowNewTweetModal] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    const userData = Auth.getUser();
    if (userData) {
      setUser(userData);
    }
    fetchTweets();
  }, []);

  const fetchTweets = async () => {
    try {
      setLoading(true);
      const response = await API.getTweets();
      if (response?.success && response?.data) {
        const normalized = response.data.map(normalizeTweet);
        setTweets(normalized.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      } else {
        const savedTweets = JSON.parse(localStorage.getItem('tweets') || '[]');
        setTweets(savedTweets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      }
    } catch (error) {
      console.error('Error fetching tweets:', error);
      const savedTweets = JSON.parse(localStorage.getItem('tweets') || '[]');
      setTweets(savedTweets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } finally {
      setLoading(false);
    }
  };

  const handleTweet = async () => {
    if (!newTweet.trim()) {
      alert('Please write something to tweet!');
      return;
    }

    try {
      const response = await API.createTweet({ content: newTweet.trim() });
      if (response?.success) {
        setNewTweet('');
        setReplyTo(null);
        setShowNewTweetModal(false);
        await fetchTweets();
        alert('✅ Tweet posted successfully!');
      } else {
        const newTweetObj = {
          id: 'tweet_' + Date.now(),
          userId: user?._id || 'unknown',
          username: user?.username || 'user',
          fullName: user?.fullName || 'User',
          avatar: user?.avatar || 'https://randomuser.me/api/portraits/men/32.jpg',
          content: newTweet.trim(),
          likes: [],
          replies: [],
          createdAt: new Date().toISOString(),
          parentId: replyTo || null
        };
        const updatedTweets = [newTweetObj, ...tweets];
        setTweets(updatedTweets);
        localStorage.setItem('tweets', JSON.stringify(updatedTweets));
        setNewTweet('');
        setReplyTo(null);
        setShowNewTweetModal(false);
        alert('✅ Tweet posted (local storage)!');
      }
    } catch (error) {
      console.error('Tweet error:', error);
      alert(error?.message || 'Failed to post tweet');
    }
  };

  const handleReply = async (tweetId) => {
    if (!replyText.trim()) {
      alert('Please write a reply!');
      return;
    }

    try {
      const replyData = {
        content: replyText.trim(),
        parentId: tweetId
      };

      const response = await API.createTweet(replyData);
      if (response?.success) {
        setReplyText('');
        setReplyTo(null);
        await fetchTweets();
        alert('✅ Reply posted successfully!');
      } else {
        const newReply = {
          id: 'reply_' + Date.now(),
          userId: user?._id || 'unknown',
          username: user?.username || 'user',
          fullName: user?.fullName || 'User',
          avatar: user?.avatar || 'https://randomuser.me/api/portraits/men/32.jpg',
          content: replyText.trim(),
          likes: [],
          replies: [],
          createdAt: new Date().toISOString(),
          parentId: tweetId
        };
        const updatedTweets = [newReply, ...tweets];
        setTweets(updatedTweets);
        localStorage.setItem('tweets', JSON.stringify(updatedTweets));
        setReplyText('');
        setReplyTo(null);
        alert('✅ Reply posted (local storage)!');
      }
    } catch (error) {
      console.error('Reply error:', error);
      alert(error?.message || 'Failed to post reply');
    }
  };

  const handleLike = async (tweetId) => {
    try {
      const response = await API.toggleTweetLike(tweetId);
      if (response?.success) {
        await fetchTweets();
      } else {
        const updatedTweets = tweets.map(tweet => {
          if (tweet.id === tweetId) {
            const likeIndex = tweet.likes.indexOf(user?._id);
            if (likeIndex > -1) {
              tweet.likes.splice(likeIndex, 1);
            } else {
              tweet.likes.push(user?._id);
            }
          }
          return tweet;
        });
        setTweets(updatedTweets);
        localStorage.setItem('tweets', JSON.stringify(updatedTweets));
      }
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  const handleDelete = async (tweetId) => {
    if (!window.confirm('Are you sure you want to delete this tweet?')) return;

    try {
      const response = await API.deleteTweet(tweetId);
      if (response?.success) {
        await fetchTweets();
        alert('🗑️ Tweet deleted!');
      } else {
        const updatedTweets = tweets.filter(tweet => tweet.id !== tweetId);
        setTweets(updatedTweets);
        localStorage.setItem('tweets', JSON.stringify(updatedTweets));
        alert('🗑️ Tweet deleted (local storage)!');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert(error?.message || 'Failed to delete tweet');
    }
  };

  // ---- Edit tweet ----

  const startEdit = (tweet) => {
    setEditingId(tweet.id);
    setEditText(tweet.content);
    setReplyTo(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleUpdate = async (tweetId) => {
    if (!editText.trim()) {
      alert('Tweet cannot be empty!');
      return;
    }

    try {
      const response = await API.updateTweet(tweetId, editText.trim());
      if (response?.success) {
        setEditingId(null);
        setEditText('');
        await fetchTweets();
        alert('✅ Tweet updated successfully!');
      } else {
        const updatedTweets = tweets.map(tweet =>
          tweet.id === tweetId ? { ...tweet, content: editText.trim() } : tweet
        );
        setTweets(updatedTweets);
        localStorage.setItem('tweets', JSON.stringify(updatedTweets));
        setEditingId(null);
        setEditText('');
        alert('✅ Tweet updated (local storage)!');
      }
    } catch (error) {
      console.error('Update error:', error);
      alert(error?.message || 'Failed to update tweet');
    }
  };

  const getReplies = (tweetId) => {
    return tweets.filter(tweet => tweet.parentId === tweetId);
  };

  const getTimeAgo = (dateStr) => {
    const now = new Date();
    const diff = now - new Date(dateStr);
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}m`;
    return `${seconds}s`;
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const filteredTweets = () => {
    if (activeTab === 'all') {
      return tweets.filter(t => !t.parentId);
    }
    if (activeTab === 'mine') {
      return tweets.filter(t => !t.parentId && t.userId === user?._id);
    }
    if (activeTab === 'following') {
      return tweets.filter(t => !t.parentId && t.userId !== user?._id);
    }
    return tweets.filter(t => !t.parentId);
  };

  if (loading) {
    return (
      <div className="talk-container">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="main-wrapper">
          <Navbar user={user} onMenuClick={toggleSidebar} searchQuery="" onSearchChange={() => {}} onSearchSubmit={() => {}} />
          <div className="loading-state">Loading tweets...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="talk-container">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-wrapper">
        <Navbar
          user={user}
          onMenuClick={toggleSidebar}
          searchQuery=""
          onSearchChange={() => {}}
          onSearchSubmit={() => {}}
        />

        <div className="talk-header">
          <h1 className="talk-title"><i className="fas fa-comment-dots"></i> Talk/Tweet</h1>
          <button className="new-tweet-btn" onClick={() => setShowNewTweetModal(true)}>
            <i className="fas fa-feather-alt"></i> New Tweet
          </button>
        </div>

        <div className="talk-tabs">
          <button
            className={`talk-tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            <i className="fas fa-globe"></i> All
          </button>
          <button
            className={`talk-tab ${activeTab === 'following' ? 'active' : ''}`}
            onClick={() => setActiveTab('following')}
          >
            <i className="fas fa-users"></i> Others
          </button>
          <button
            className={`talk-tab ${activeTab === 'mine' ? 'active' : ''}`}
            onClick={() => setActiveTab('mine')}
          >
            <i className="fas fa-user"></i> My Tweets
          </button>
        </div>

        <div className="talk-feed">
          {filteredTweets().length === 0 ? (
            <div className="empty-tweets">
              <i className="fas fa-feather-alt" style={{ fontSize: '4rem', color: '#555' }}></i>
              <h2>No tweets yet</h2>
              <p>Be the first to tweet something!</p>
              <button className="new-tweet-btn" onClick={() => setShowNewTweetModal(true)}>
                <i className="fas fa-feather-alt"></i> Tweet Now
              </button>
            </div>
          ) : (
            filteredTweets().map(tweet => (
              <div key={tweet.id} className="tweet-card">
                <div className="tweet-header">
                  <img className="tweet-avatar" src={tweet.avatar} alt={tweet.username} />
                  <div className="tweet-user-info">
                    <span className="tweet-fullname">{tweet.fullName}</span>
                    <span className="tweet-username">@{tweet.username}</span>
                    <span className="tweet-time">· {getTimeAgo(tweet.createdAt)}</span>
                  </div>
                  {tweet.userId === user?._id && (
                    <div className="tweet-owner-actions">
                      <button className="tweet-edit-btn" onClick={() => startEdit(tweet)}>
                        <i className="fas fa-pen"></i>
                      </button>
                      <button className="tweet-delete" onClick={() => handleDelete(tweet.id)}>
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  )}
                </div>

                {editingId === tweet.id ? (
                  <div className="tweet-edit-box">
                    <textarea
                      className="edit-input"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      maxLength="280"
                      autoFocus
                    />
                    <div className="edit-actions">
                      <span className="tweet-char-count">{editText.length}/280</span>
                      <div>
                        <button className="edit-cancel" onClick={cancelEdit}>Cancel</button>
                        <button className="edit-save" onClick={() => handleUpdate(tweet.id)}>
                          <i className="fas fa-check"></i> Save
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="tweet-content">
                    <p>{tweet.content}</p>
                  </div>
                )}

                <div className="tweet-actions">
                  <button
                    className="tweet-action-btn like-btn"
                    onClick={() => handleLike(tweet.id)}
                  >
                    <i className={`fas fa-heart ${(tweet.likes || []).includes(user?._id) ? 'liked' : ''}`}></i>
                    <span>{(tweet.likes || []).length}</span>
                  </button>
                  <button
                    className="tweet-action-btn reply-btn"
                    onClick={() => setReplyTo(replyTo === tweet.id ? null : tweet.id)}
                  >
                    <i className="fas fa-reply"></i>
                    <span>{getReplies(tweet.id).length}</span>
                  </button>
                </div>

                {replyTo === tweet.id && (
                  <div className="tweet-reply-box">
                    <textarea
                      className="reply-input"
                      placeholder="Write a reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                    />
                    <div className="reply-actions">
                      <button className="reply-cancel" onClick={() => setReplyTo(null)}>Cancel</button>
                      <button className="reply-send" onClick={() => handleReply(tweet.id)}>
                        <i className="fas fa-paper-plane"></i> Reply
                      </button>
                    </div>
                  </div>
                )}

                {getReplies(tweet.id).length > 0 && (
                  <div className="tweet-replies">
                    {getReplies(tweet.id).map(reply => (
                      <div key={reply.id} className="tweet-reply">
                        <div className="tweet-reply-header">
                          <img className="tweet-reply-avatar" src={reply.avatar} alt={reply.username} />
                          <div className="tweet-reply-user-info">
                            <span className="tweet-reply-fullname">{reply.fullName}</span>
                            <span className="tweet-reply-username">@{reply.username}</span>
                            <span className="tweet-reply-time">· {getTimeAgo(reply.createdAt)}</span>
                          </div>
                          {reply.userId === user?._id && (
                            <button className="tweet-reply-delete" onClick={() => handleDelete(reply.id)}>
                              <i className="fas fa-times"></i>
                            </button>
                          )}
                        </div>
                        <div className="tweet-reply-content">
                          <p>{reply.content}</p>
                        </div>
                        <div className="tweet-reply-actions">
                          <button
                            className="tweet-action-btn like-btn"
                            onClick={() => handleLike(reply.id)}
                          >
                            <i className={`fas fa-heart ${(reply.likes || []).includes(user?._id) ? 'liked' : ''}`}></i>
                            <span>{(reply.likes || []).length}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <footer>YouTube Clone · Talk/Tweet</footer>
      </div>

      {showNewTweetModal && (
        <div className="modal-overlay" onClick={() => setShowNewTweetModal(false)}>
          <div className="modal-content tweet-modal" onClick={(e) => e.stopPropagation()}>
            <div className="tweet-modal-header">
              <h2><i className="fas fa-feather-alt"></i> New Tweet</h2>
              <button className="modal-close" onClick={() => setShowNewTweetModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="tweet-modal-body">
              <div className="tweet-modal-user">
                <img className="tweet-modal-avatar" src={user?.avatar || 'https://randomuser.me/api/portraits/men/32.jpg'} alt="avatar" />
                <div className="tweet-modal-user-info">
                  <span className="tweet-modal-fullname">{user?.fullName}</span>
                  <span className="tweet-modal-username">@{user?.username}</span>
                </div>
              </div>
              <textarea
                className="tweet-modal-textarea"
                placeholder="What's happening?"
                value={newTweet}
                onChange={(e) => setNewTweet(e.target.value)}
                maxLength="280"
              />
              <div className="tweet-modal-footer">
                <span className="tweet-char-count">{newTweet.length}/280</span>
                <button className="tweet-modal-submit" onClick={handleTweet}>
                  <i className="fas fa-feather-alt"></i> Tweet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Talk;