import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import { Auth } from '../auth';
import '../styles/Signin.css';

function Signin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    if (Auth.isAuthenticated()) {
      navigate('/');
    }
  }, [navigate]);

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validatePhone = (phone) => {
    const regex = /^[0-9]{10}$/;
    return regex.test(phone);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    const identifier = email.trim();
    const pass = password.trim();

    if (!identifier) {
      setMessage('Please enter an email or phone number');
      setIsError(true);
      return;
    }

    if (!pass) {
      setMessage('Please enter your password');
      setIsError(true);
      return;
    }

    if (pass.length < 6) {
      setMessage('Password must be at least 6 characters');
      setIsError(true);
      return;
    }

    setIsLoading(true);

    try {
      const response = await API.login(identifier, pass);
      if (response.success) {
        setMessage('✅ Signed in successfully! Redirecting...');
        setIsError(false);
        setTimeout(() => navigate('/'), 1000);
      } else {
        setMessage(response.message || 'Login failed. Please try again.');
        setIsError(true);
      }
    } catch (error) {
      setMessage(error.message || 'Network error. Please try again later.');
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccount = () => {
    setIsRegistering(true);
    setMessage('');
    setIsError(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    const emailVal = email.trim();
    const pass = password.trim();

    if (!emailVal) {
      setMessage('Please enter your email');
      setIsError(true);
      return;
    }

    if (!validateEmail(emailVal) && !validatePhone(emailVal)) {
      setMessage('Please enter a valid email or phone number');
      setIsError(true);
      return;
    }

    if (!pass) {
      setMessage('Please enter a password');
      setIsError(true);
      return;
    }

    if (pass.length < 6) {
      setMessage('Password must be at least 6 characters');
      setIsError(true);
      return;
    }

    const username = emailVal.split('@')[0] || 'user_' + Date.now();
    const fullName = prompt('Enter your full name:');
    if (!fullName) {
      setMessage('Full name is required');
      setIsError(true);
      return;
    }

    setIsLoading(true);

    try {
      const userData = { username, email: emailVal, fullName, password: pass };
      const response = await API.register(userData);
      if (response.success) {
        setMessage('✅ Account created successfully! Redirecting...');
        setIsError(false);
        setTimeout(() => navigate('/'), 1000);
      } else {
        setMessage(response.message || 'Registration failed. Please try again.');
        setIsError(true);
      }
    } catch (error) {
      setMessage(error.message || 'Error creating account');
      setIsError(true);
    } finally {
      setIsLoading(false);
      setIsRegistering(false);
    }
  };

  const handleCancelRegister = () => {
    setIsRegistering(false);
    setEmail('');
    setPassword('');
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
          {isRegistering ? 'Create Account' : 'Sign in'}
        </h1>
        <p className="signin-subtitle">
          {isRegistering 
            ? 'to continue to YouTube with your new account' 
            : 'to continue to YouTube'
          }
        </p>

        <form onSubmit={isRegistering ? handleRegister : handleLogin}>
          <div className="input-group">
            <div className="input-wrapper">
              <input
                type="text"
                className="input-field"
                placeholder="Email or phone number"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
              <label className="input-label">Email or phone</label>
            </div>
          </div>

          <div className="input-group">
            <div className="input-wrapper password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                className="input-field"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              <label className="input-label">Password</label>
              <i
                className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} toggle-password`}
                onClick={() => setShowPassword(!showPassword)}
              ></i>
            </div>
          </div>

          {!isRegistering && (
            <div className="forgot-link">
              <a href="#" onClick={(e) => { e.preventDefault(); setMessage('🔐 Password reset link sent to your recovery email.'); }}>
                Forgot password?
              </a>
            </div>
          )}

          {message && (
            <div className={`info-message ${isError ? 'error' : ''}`}>
              {message}
            </div>
          )}

          <div className="button-row">
            {isRegistering ? (
              <>
                <button 
                  type="button" 
                  className="cancel-btn" 
                  onClick={handleCancelRegister}
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="next-btn" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating...' : 'Create Account'}
                </button>
              </>
            ) : (
              <>
                <button 
                  type="button" 
                  className="create-account-btn" 
                  onClick={handleCreateAccount}
                  disabled={isLoading}
                >
                  Create account
                </button>
                <button 
                  type="submit" 
                  className="next-btn" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Next'}
                </button>
              </>
            )}
          </div>
        </form>

        {!isRegistering && (
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
                localStorage.setItem('user', JSON.stringify(dummyUser));
                localStorage.setItem('accessToken', 'mock_access_device');
                localStorage.setItem('refreshToken', 'mock_refresh_device');
                navigate('/');
              }}
            >
              <i className="fas fa-mobile-alt"></i> Use a linked device to sign in
            </button>
          </>
        )}

        <div className="help-section">
          <a href="#" className="help-link" onClick={(e) => { e.preventDefault(); setMessage('Visit YouTube Help Center or try account recovery.'); }}>
            Help
          </a>
          <span className="privacy-link" onClick={() => setMessage('🔒 Privacy policy (mock)')}>
            Privacy
          </span>
          <span className="terms-link" onClick={() => setMessage('📄 Terms of service (mock)')}>
            Terms
          </span>
        </div>
      </div>
    </div>
  );
}

export default Signin;