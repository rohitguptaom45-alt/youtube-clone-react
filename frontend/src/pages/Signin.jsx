import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import { Auth } from '../auth';
import '../styles/Signin.css';

function Signin() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [avatar, setAvatar] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [coverPreview, setCoverPreview] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    if (Auth.isAuthenticated()) {
      navigate('/');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value || ''
    }));
    setMessage('');
    setIsError(false);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    const { email, password } = formData;

    if (!email || !password) {
      setMessage('Please fill in all fields');
      setIsError(true);
      return;
    }

    if (password.length < 6) {
      setMessage('Password must be at least 6 characters');
      setIsError(true);
      return;
    }

    setIsLoading(true);

    try {
      const response = await API.login(email, password);
      if (response?.success) {
        setMessage('Login successful! Redirecting...');
        setIsError(false);
        setTimeout(() => navigate('/'), 1000);
      } else {
        setMessage(response?.message || 'Login failed');
        setIsError(true);
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage(error?.message || 'Network error. Please try again.');
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    const { fullName, username, email, password, confirmPassword } = formData;

    if (!fullName || !username || !email || !password || !confirmPassword) {
      setMessage('Please fill in all fields');
      setIsError(true);
      return;
    }

    if (!validateEmail(email)) {
      setMessage('Please enter a valid email address');
      setIsError(true);
      return;
    }

    if (password.length < 6) {
      setMessage('Password must be at least 6 characters');
      setIsError(true);
      return;
    }

    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      setIsError(true);
      return;
    }

    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('fullName', fullName);
      formDataToSend.append('username', username);
      formDataToSend.append('email', email);
      formDataToSend.append('password', password);
      if (avatar) {
        formDataToSend.append('avatar', avatar);
      }
      if (coverImage) {
        formDataToSend.append('coverImage', coverImage);
      }

      const response = await API.register(formDataToSend);
      
      if (response?.success) {
        setMessage('✅ Registration successful! Redirecting...');
        setIsError(false);
        setTimeout(() => navigate('/'), 1500);
      } else {
        setMessage(response?.message || 'Registration failed');
        setIsError(true);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setMessage(error?.message || 'Network error. Please try again.');
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      fullName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    setAvatar(null);
    setCoverImage(null);
    setAvatarPreview('');
    setCoverPreview('');
    setMessage('');
    setIsError(false);
  };

  return (
    <div className="signin-wrapper">
      <div className="signin-card">
        <div className="yt-icon-large">
          <i className="fab fa-youtube"></i>
        </div>

        <h1 className="signin-title">
          {isLogin ? 'Sign in' : 'Create Account'}
        </h1>
        <p className="signin-subtitle">
          {isLogin ? 'to continue to YouTube' : 'to start your YouTube journey'}
        </p>

        <form onSubmit={isLogin ? handleLogin : handleRegister}>
          {!isLogin && (
            <>
              <div className="input-group">
                <div className="input-wrapper">
                  <input
                    type="text"
                    name="fullName"
                    className="input-field"
                    placeholder="Full Name"
                    value={formData.fullName || ''}
                    onChange={handleChange}
                    disabled={isLoading}
                    required
                  />
                  <label className="input-label">Full Name</label>
                </div>
              </div>

              <div className="input-group">
                <div className="input-wrapper">
                  <input
                    type="text"
                    name="username"
                    className="input-field"
                    placeholder="Username"
                    value={formData.username || ''}
                    onChange={handleChange}
                    disabled={isLoading}
                    required
                  />
                  <label className="input-label">Username</label>
                </div>
              </div>
            </>
          )}

          <div className="input-group">
            <div className="input-wrapper">
              <input
                type="text"
                name="email"
                className="input-field"
                placeholder="Email"
                value={formData.email || ''}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
              <label className="input-label">Email</label>
            </div>
          </div>

          {!isLogin && (
            <div className="input-group">
              <div className="input-wrapper password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className="input-field"
                  placeholder="Password"
                  value={formData.password || ''}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
                <label className="input-label">Password</label>
                <i
                  className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} toggle-password`}
                  onClick={() => setShowPassword(!showPassword)}
                ></i>
              </div>
            </div>
          )}

          {!isLogin && (
            <div className="input-group">
              <div className="input-wrapper">
                <input
                  type="password"
                  name="confirmPassword"
                  className="input-field"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword || ''}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
                <label className="input-label">Confirm Password</label>
              </div>
            </div>
          )}

          {isLogin && (
            <div className="input-group">
              <div className="input-wrapper password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className="input-field"
                  placeholder="Password"
                  value={formData.password || ''}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
                <label className="input-label">Password</label>
                <i
                  className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} toggle-password`}
                  onClick={() => setShowPassword(!showPassword)}
                ></i>
              </div>
            </div>
          )}

          {!isLogin && (
            <>
              <div className="input-group file-input-group">
                <label className="file-label">
                  <i className="fas fa-user-circle"></i> Avatar
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    disabled={isLoading}
                  />
                </label>
                {avatarPreview && (
                  <div className="file-preview">
                    <img src={avatarPreview} alt="Avatar Preview" />
                  </div>
                )}
              </div>

              <div className="input-group file-input-group">
                <label className="file-label">
                  <i className="fas fa-image"></i> Cover Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverChange}
                    disabled={isLoading}
                  />
                </label>
                {coverPreview && (
                  <div className="file-preview">
                    <img src={coverPreview} alt="Cover Preview" />
                  </div>
                )}
              </div>
            </>
          )}

          {isLogin && (
            <div className="remember-me">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
            </div>
          )}

          {message && (
            <div className={`info-message ${isError ? 'error' : ''}`}>
              {message}
            </div>
          )}

          <div className="button-row">
            <button
              type="button"
              className="toggle-mode-btn"
              onClick={toggleMode}
              disabled={isLoading}
            >
              {isLogin ? 'Create account' : 'Back to sign in'}
            </button>
            <button
              type="submit"
              className="next-btn"
              disabled={isLoading}
            >
              {isLoading
                ? isLogin
                  ? 'Signing in...'
                  : 'Creating account...'
                : isLogin
                ? 'Sign in'
                : 'Create account'}
            </button>
          </div>
        </form>

        {isLogin && (
          <>
            <div className="divider-section">
              <div className="divider-line"></div>
              <span className="divider-text">or</span>
              <div className="divider-line"></div>
            </div>

            <button
              className="linked-device-btn"
              onClick={() => {
                const dummyUser = {
                  _id: 'device_user',
                  username: 'device_user',
                  email: 'device@example.com',
                  fullName: 'Linked Device User',
                  avatar: 'https://randomuser.me/api/portraits/men/45.jpg'
                };
                document.cookie = `user=${encodeURIComponent(JSON.stringify(dummyUser))}; path=/; max-age=604800`;
                document.cookie = `accessToken=mock_access_device; path=/; max-age=604800; secure; samesite=lax`;
                navigate('/');
              }}
            >
              <i className="fas fa-mobile-alt"></i> Use a linked device to sign in
            </button>
          </>
        )}

        <div className="help-section">
          <a href="#" className="help-link" onClick={(e) => { e.preventDefault(); setMessage('Visit YouTube Help Center'); }}>
            Help
          </a>
          <span className="privacy-link" onClick={() => setMessage('Privacy policy')}>
            Privacy
          </span>
          <span className="terms-link" onClick={() => setMessage('Terms of service')}>
            Terms
          </span>
        </div>
      </div>
    </div>
  );
}

export default Signin;