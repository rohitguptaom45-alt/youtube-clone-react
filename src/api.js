const API = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',

  async _request(endpoint, method = 'GET', body = null, requiresAuth = false) {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    };

    if (requiresAuth) {
      const token = localStorage.getItem('accessToken');
      if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
      } else {
        throw { statusCode: 401, message: 'No access token found' };
      }
    }

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const url = `${this.baseURL}${endpoint}`;
      console.log(`📡 API Request: ${method} ${url}`, body || '');
      
      const response = await fetch(url, options);
      const data = await response.json();
      
      console.log(`📡 API Response:`, data);

      if (!response.ok) {
        throw data;
      }
      
      return data;
    } catch (error) {
      console.error('❌ API Error:', error);
      
      if (error.statusCode === 401 && requiresAuth) {
        try {
          console.log('🔄 Refreshing token...');
          const refreshed = await this.refreshToken();
          if (refreshed.success) {
            const newToken = localStorage.getItem('accessToken');
            options.headers['Authorization'] = `Bearer ${newToken}`;
            const retryResponse = await fetch(`${this.baseURL}${endpoint}`, options);
            const retryData = await retryResponse.json();
            if (!retryResponse.ok) {
              throw retryData;
            }
            return retryData;
          }
        } catch (refreshError) {
          console.error('❌ Refresh failed:', refreshError);
          await this.logout();
          throw refreshError;
        }
      }
      throw error;
    }
  },

  // ============================================================
  // AUTH APIs
  // ============================================================
  async register(userData) {
    return this._request('/users/register', 'POST', userData, false);
  },

  async login(identifier, password) {
    try {
      const response = await this._request('/users/login', 'POST', { identifier, password }, false);
      if (response.success && response.data?.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        console.log('✅ Login successful, tokens stored');
      }
      return response;
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  },

  async getCurrentUser() {
    return this._request('/users/current-user', 'GET', null, true);
  },

  async refreshToken() {
    try {
      const response = await fetch(`${this.baseURL}/users/refresh-token`, {
        method: 'POST',
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success && data.data?.accessToken) {
        localStorage.setItem('accessToken', data.data.accessToken);
        console.log('✅ Token refreshed');
        return data;
      }
      throw data;
    } catch (error) {
      console.error('❌ Refresh token error:', error);
      throw error;
    }
  },

  async logout() {
    try {
      await this._request('/users/logout', 'POST', null, true);
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = '/signin';
  },

  // ============================================================
  // COMMENT APIs
  // ============================================================
  
  // POST /api/v1/comments/:videoId
  async addComment(videoId, content) {
    if (!videoId) throw { message: 'Video ID is required' };
    if (!content) throw { message: 'Comment content is required' };
    return this._request(`/comments/${videoId}`, 'POST', { content }, true);
  },

  // PATCH /api/v1/comments/c/:commentId
  async updateComment(commentId, content) {
    if (!commentId) throw { message: 'Comment ID is required' };
    if (!content) throw { message: 'Comment content is required' };
    return this._request(`/comments/c/${commentId}`, 'PATCH', { content }, true);
  },

  // DELETE /api/v1/comments/c/:commentId
  async deleteComment(commentId) {
    if (!commentId) throw { message: 'Comment ID is required' };
    return this._request(`/comments/c/${commentId}`, 'DELETE', null, true);
  },

  // GET /api/v1/comments/:videoId
  async getVideoComments(videoId) {
    if (!videoId) throw { message: 'Video ID is required' };
    return this._request(`/comments/${videoId}`, 'GET', null, false);
  },

  // ============================================================
  // LIKE APIs
  // ============================================================

  // POST /api/v1/likes/toggle/v/:videoId
  async toggleVideoLike(videoId) {
    if (!videoId) throw { message: 'Video ID is required' };
    return this._request(`/likes/toggle/v/${videoId}`, 'POST', null, true);
  },

  // POST /api/v1/likes/toggle/c/:commentId
  async toggleCommentLike(commentId) {
    if (!commentId) throw { message: 'Comment ID is required' };
    return this._request(`/likes/toggle/c/${commentId}`, 'POST', null, true);
  }
};

export default API;