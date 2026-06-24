import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Auth } from '../auth';
import '../styles/Help.css';

function Help() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('help');
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { 
      id: 1, 
      sender: 'bot', 
      message: '👋 Hello! I\'m your 24/7 YouTube Assistant. How can I help you today?',
      timestamp: new Date().toISOString()
    }
  ]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    const userData = Auth.getUser();
    if (userData) {
      setUser(userData);
    }
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const helpCategories = [
    {
      id: 'account',
      icon: 'fas fa-user',
      title: 'Account & Login',
      description: 'Manage your account, password, and login issues',
      questions: [
        { q: 'How do I change my password?', a: 'Go to Settings > Account > Change Password. Enter your current password and new password.' },
        { q: 'How do I update my profile?', a: 'Go to Settings > Account. You can update your full name, username, email, bio, and location.' },
        { q: 'How do I delete my account?', a: 'Go to Settings > Danger Zone > Delete Account. This action is permanent and cannot be undone.' },
        { q: 'How do I sign out?', a: 'Go to Settings > Danger Zone > Sign Out. You will be redirected to the sign-in page.' },
        { q: 'How do I recover my password?', a: 'Click on "Forgot password?" on the sign-in page. We will send a recovery link to your email.' }
      ]
    },
    {
      id: 'video',
      icon: 'fas fa-video',
      title: 'Videos & Uploads',
      description: 'Upload, edit, and manage your videos',
      questions: [
        { q: 'How do I upload a video?', a: 'Go to Your Channel > Upload Video. Enter title, description, thumbnail URL, and video URL.' },
        { q: 'How do I edit my video?', a: 'Go to Your Videos > Click the Edit button (pencil icon) next to your video. Enter a new title.' },
        { q: 'How do I delete a video?', a: 'Go to Your Videos > Click the Delete button (trash icon) next to your video.' },
        { q: 'How do I add videos to playlists?', a: 'Click on any video > Select "Add to playlist" > Choose your playlist.' },
        { q: 'How do I watch later?', a: 'Click on any video > Select "Save to Watch Later" option.' }
      ]
    },
    {
      id: 'playlist',
      icon: 'fas fa-list',
      title: 'Playlists',
      description: 'Create and manage your playlists',
      questions: [
        { q: 'How do I create a playlist?', a: 'Go to Playlists > Click "Create Playlist". Enter a name and description.' },
        { q: 'How do I delete a playlist?', a: 'Go to Playlists > Click the trash icon on the playlist you want to delete.' },
        { q: 'How do I add videos to a playlist?', a: 'Click on any video > Select "Add to playlist" > Choose your playlist.' },
        { q: 'How do I remove videos from a playlist?', a: 'Go to Playlist > Click the X button next to the video you want to remove.' }
      ]
    },
    {
      id: 'history',
      icon: 'fas fa-history',
      title: 'History',
      description: 'Manage your watch history',
      questions: [
        { q: 'How do I clear my watch history?', a: 'Go to History > Click "Clear all". This will remove all your watch history.' },
        { q: 'How do I remove a single video from history?', a: 'Go to History > Click the X button next to the video you want to remove.' },
        { q: 'Can I search my watch history?', a: 'Yes! Go to History > Use the search bar to find specific videos.' },
        { q: 'How do I filter history by date?', a: 'Go to History > Use the filters: Today, This Week, This Month, or All.' }
      ]
    },
    {
      id: 'liked',
      icon: 'fas fa-thumbs-up',
      title: 'Liked Videos',
      description: 'Manage your liked videos',
      questions: [
        { q: 'How do I like a video?', a: 'Click on any video > Select "Like" option when prompted.' },
        { q: 'How do I remove a like?', a: 'Go to Liked Videos > Click the X button next to the video to remove it from liked videos.' },
        { q: 'Where can I see all my liked videos?', a: 'Go to Liked Videos page from the sidebar. All your liked videos will appear there.' }
      ]
    },
    {
      id: 'channel',
      icon: 'fas fa-user-circle',
      title: 'Your Channel',
      description: 'Manage your channel settings',
      questions: [
        { q: 'How do I edit my channel?', a: 'Go to Your Channel > Click the edit button (pencil icon) next to your channel name.' },
        { q: 'How do I add a channel description?', a: 'Go to Your Channel > Click edit button > Add description in the modal.' },
        { q: 'How do I change my channel avatar?', a: 'Go to Your Channel > Click edit button > Change avatar URL.' },
        { q: 'How do I change my channel banner?', a: 'Go to Your Channel > Click edit button > Change banner URL.' },
        { q: 'How do I see channel analytics?', a: 'Go to Your Channel > Click "Analytics" tab to see subscribers, views, videos, and likes.' }
      ]
    }
  ];

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;

    const userMessage = {
      id: Date.now() + 1,
      sender: 'user',
      message: chatInput.trim(),
      timestamp: new Date().toISOString()
    };
    setChatMessages([...chatMessages, userMessage]);
    setChatInput('');

    const botResponse = getBotResponse(chatInput.trim().toLowerCase());
    const botMessage = {
      id: Date.now() + 2,
      sender: 'bot',
      message: botResponse,
      timestamp: new Date().toISOString()
    };
    setTimeout(() => {
      setChatMessages(prev => [...prev, botMessage]);
    }, 600);
  };

  const getBotResponse = (query) => {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('hello') || lowerQuery.includes('hi') || lowerQuery.includes('hey')) {
      return '👋 Hello! Welcome to YouTube Support. How can I assist you today?';
    }
    if (lowerQuery.includes('help') || lowerQuery.includes('support')) {
      return '🤝 I\'m here to help! You can ask me about:\n• Account & Login\n• Videos & Uploads\n• Playlists\n• History\n• Liked Videos\n• Your Channel\n\nJust ask your question!';
    }
    if (lowerQuery.includes('password') || lowerQuery.includes('change password') || lowerQuery.includes('reset password')) {
      return '🔑 To change your password:\n1. Go to Settings > Account\n2. Click "Change Password"\n3. Enter current password\n4. Enter new password (min 6 chars)\n5. Confirm and save';
    }
    if (lowerQuery.includes('delete account') || lowerQuery.includes('remove account')) {
      return '⚠️ To delete your account:\n1. Go to Settings > Danger Zone\n2. Click "Delete Account"\n3. Confirm the action\n\n⚠️ This is PERMANENT and cannot be undone!';
    }
    if (lowerQuery.includes('upload video') || lowerQuery.includes('upload')) {
      return '📹 To upload a video:\n1. Go to Your Channel\n2. Click "Upload Video"\n3. Enter title, description\n4. Add thumbnail URL\n5. Add video URL\n6. Click "Upload"';
    }
    if (lowerQuery.includes('playlist') || lowerQuery.includes('create playlist')) {
      return '📋 To create a playlist:\n1. Go to Playlists page\n2. Click "Create Playlist"\n3. Enter name and description\n4. Click "Create"\n\nTo add videos, click on any video and select "Add to playlist".';
    }
    if (lowerQuery.includes('history') || lowerQuery.includes('watch history')) {
      return '📜 To manage watch history:\n• View: Go to History page\n• Search: Use search bar\n• Filter: Use Today, Week, Month filters\n• Remove: Click X on any video\n• Clear all: Click "Clear all" button';
    }
    if (lowerQuery.includes('like') || lowerQuery.includes('liked video')) {
      return '❤️ To manage liked videos:\n• Like: Click on any video > Select "Like"\n• View: Go to Liked Videos page\n• Remove: Click X on any liked video';
    }
    if (lowerQuery.includes('channel') || lowerQuery.includes('my channel')) {
      return '📺 To manage your channel:\n• Edit: Go to Your Channel > Click edit icon\n• Upload: Click "Upload Video"\n• Analytics: Click "Analytics" tab\n• About: Click "About" tab';
    }
    if (lowerQuery.includes('thank')) {
      return '🙂 You\'re welcome! If you need more help, just ask.';
    }
    if (lowerQuery.includes('bye') || lowerQuery.includes('goodbye')) {
      return '👋 Goodbye! Come back if you need more help. Have a great day!';
    }

    return '🤔 I\'m not sure about that. Could you please rephrase your question? I can help with:\n• Account & Login\n• Videos & Uploads\n• Playlists\n• History\n• Liked Videos\n• Your Channel\n\nOr check the help categories below!';
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(selectedCategory === category.id ? null : category.id);
  };

  const handleQuestionClick = (question) => {
    const botMessage = {
      id: Date.now() + 1,
      sender: 'bot',
      message: question.a,
      timestamp: new Date().toISOString()
    };
    setChatMessages(prev => [...prev, botMessage]);
  };

  return (
    <div className="help-container">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-wrapper">
        <Navbar 
          user={user}
          onMenuClick={toggleSidebar}
          searchQuery=""
          onSearchChange={() => {}}
          onSearchSubmit={() => {}}
        />

        <div className="help-header">
          <h1 className="help-title"><i className="fas fa-question-circle"></i> Help & Support</h1>
          <div className="help-tabs">
            <button 
              className={`help-tab ${activeTab === 'help' ? 'active' : ''}`}
              onClick={() => setActiveTab('help')}
            >
              <i className="fas fa-life-ring"></i> Help Center
            </button>
            <button 
              className={`help-tab ${activeTab === 'chatbot' ? 'active' : ''}`}
              onClick={() => setActiveTab('chatbot')}
            >
              <i className="fas fa-robot"></i> AI Chatbot 24/7
            </button>
            <button 
              className={`help-tab ${activeTab === 'about' ? 'active' : ''}`}
              onClick={() => setActiveTab('about')}
            >
              <i className="fas fa-info-circle"></i> About Us
            </button>
          </div>
        </div>

        {activeTab === 'help' && (
          <div className="help-categories">
            {helpCategories.map(category => (
              <div key={category.id} className="help-category">
                <div 
                  className={`help-category-header ${selectedCategory === category.id ? 'active' : ''}`}
                  onClick={() => handleCategoryClick(category)}
                >
                  <div className="help-category-icon">
                    <i className={category.icon}></i>
                  </div>
                  <div className="help-category-info">
                    <h3>{category.title}</h3>
                    <p>{category.description}</p>
                  </div>
                  <i className={`fas fa-chevron-${selectedCategory === category.id ? 'up' : 'down'}`}></i>
                </div>
                {selectedCategory === category.id && (
                  <div className="help-category-questions">
                    {category.questions.map((item, index) => (
                      <div 
                        key={index} 
                        className="help-question"
                        onClick={() => handleQuestionClick(item)}
                      >
                        <i className="fas fa-question-circle"></i>
                        <span>{item.q}</span>
                        <button className="help-answer-btn">
                          <i className="fas fa-arrow-right"></i> Get Answer
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'chatbot' && (
          <div className="chatbot-container">
            <div className="chatbot-header">
              <div className="chatbot-status">
                <i className="fas fa-robot"></i>
                <h2>AI Assistant</h2>
                <span className="status-badge online">
                  <i className="fas fa-circle"></i> Online 24/7
                </span>
              </div>
              <button 
                className="chatbot-clear"
                onClick={() => {
                  setChatMessages([
                    { 
                      id: 1, 
                      sender: 'bot', 
                      message: '👋 Hello! I\'m your 24/7 YouTube Assistant. How can I help you today?',
                      timestamp: new Date().toISOString()
                    }
                  ]);
                }}
              >
                <i className="fas fa-trash"></i> Clear Chat
              </button>
            </div>
            <div className="chatbot-messages">
              {chatMessages.map(msg => (
                <div key={msg.id} className={`chat-message ${msg.sender}`}>
                  <div className="chat-avatar">
                    {msg.sender === 'bot' ? <i className="fas fa-robot"></i> : <i className="fas fa-user"></i>}
                  </div>
                  <div className="chat-bubble">
                    <p>{msg.message}</p>
                    <span className="chat-time">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="chatbot-input">
              <input
                type="text"
                placeholder="Ask me anything..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button className="chat-send-btn" onClick={handleSendMessage}>
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="about-section">
            <div className="about-card">
              <div className="about-header">
                <i className="fab fa-youtube"></i>
                <h2>YouTube Clone</h2>
                <p>Version 2.0.0</p>
              </div>
              <div className="about-content">
                <h3>About This Project</h3>
                <p>This is a fully functional YouTube clone built with React, Vite, and modern web technologies.</p>
                <p>All features are designed to replicate the real YouTube experience with a clean, professional interface.</p>
                
                <div className="about-features">
                  <h4>✨ Features</h4>
                  <ul>
                    <li><i className="fas fa-check-circle"></i> User Authentication (Sign In / Sign Up)</li>
                    <li><i className="fas fa-check-circle"></i> Home Feed with Video Grid</li>
                    <li><i className="fas fa-check-circle"></i> Video Search & Filter (Chips)</li>
                    <li><i className="fas fa-check-circle"></i> Shorts Section</li>
                    <li><i className="fas fa-check-circle"></i> Watch Later</li>
                    <li><i className="fas fa-check-circle"></i> Watch History</li>
                    <li><i className="fas fa-check-circle"></i> Liked Videos</li>
                    <li><i className="fas fa-check-circle"></i> Playlists (Create, Add Videos)</li>
                    <li><i className="fas fa-check-circle"></i> Your Channel (Customizable)</li>
                    <li><i className="fas fa-check-circle"></i> Upload Videos</li>
                    <li><i className="fas fa-check-circle"></i> Channel Analytics</li>
                    <li><i className="fas fa-check-circle"></i> Settings (Account, Privacy, Appearance)</li>
                    <li><i className="fas fa-check-circle"></i> 24/7 AI Chatbot Support</li>
                    <li><i className="fas fa-check-circle"></i> Responsive Design (Mobile & Desktop)</li>
                  </ul>
                </div>

                <div className="about-tech">
                  <h4>🛠️ Technologies Used</h4>
                  <div className="tech-tags">
                    <span className="tech-tag">React</span>
                    <span className="tech-tag">Vite</span>
                    <span className="tech-tag">React Router</span>
                   
                    <span className="tech-tag">CSS</span>
                    <span className="tech-tag">LocalStorage</span>
                    
                  </div>
                </div>

                <div className="about-team">
                  <h4>👨‍💻 Created By</h4>
                  <p><strong>Rohit Gupta</strong></p>
                  <p className="about-email">📧 rohitgupta0m45@gmail.com</p>
                  <p className="about-role">Full Stack Developer</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <footer>YouTube Clone · Help & Support</footer>
      </div>
    </div>
  );
}

export default Help;