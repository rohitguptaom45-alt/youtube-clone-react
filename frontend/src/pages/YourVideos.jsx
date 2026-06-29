const API = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',

  _getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  },

  _setCookie(name, value, days = 7) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; secure; samesite=lax`;
  },

  _clearCookie(name) {
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  },

  async register(formData) {
    try {
      const url = `${this.baseURL}/users/register`;
      console.log('Registering user...', url);
      
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw errorData;
      }
      
      const data = await response.json();
      console.log('Register response:', data);
      
      if (data.success && data.data?.accessToken) {
        this._setCookie('accessToken', data.data.accessToken, 7);
        this._setCookie('refreshToken', data.data.refreshToken, 7);
        this._setCookie('user', JSON.stringify(data.data.user), 7);
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.data.user));
      }
      
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  async login(email, password) {
    try {
      const url = `${this.baseURL}/users/login`;
      console.log('Logging in...', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw errorData;
      }
      
      const data = await response.json();
      console.log('Login response:', data);
      
      if (data.success && data.data?.accessToken) {
        this._setCookie('accessToken', data.data.accessToken, 7);
        this._setCookie('refreshToken', data.data.refreshToken, 7);
        this._setCookie('user', JSON.stringify(data.data.user), 7);
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.data.user));
      }
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async getCurrentUser() {
    const userCookie = this._getCookie('user');
    if (userCookie) {
      try {
        return {
          success: true,
          data: JSON.parse(decodeURIComponent(userCookie))
        };
      } catch (e) {}
    }
    return this._request('/users/current-user', 'GET', null, true);
  },

  async refreshToken() {
    try {
      const refreshToken = this._getCookie('refreshToken') || localStorage.getItem('refreshToken');
      const response = await fetch(`${this.baseURL}/users/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken }),
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success && data.data?.accessToken) {
        this._setCookie('accessToken', data.data.accessToken, 7);
        localStorage.setItem('accessToken', data.data.accessToken);
        return data;
      }
      throw data;
    } catch (error) {
      throw error;
    }
  },

  async logout() {
    try {
      await this._request('/users/logout', 'POST', null, true);
    } catch (error) {}
    this._clearCookie('accessToken');
    this._clearCookie('refreshToken');
    this._clearCookie('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = '/signin';
  },

  async _request(endpoint, method = 'GET', body = null, requiresAuth = false, isFormData = false) {
    const options = {
      method,
      credentials: 'include'
    };

    if (isFormData) {
      options.body = body;
    } else {
      options.headers = {
        'Content-Type': 'application/json'
      };
      if (body) {
        options.body = JSON.stringify(body);
      }
    }

    if (requiresAuth) {
      let token = this._getCookie('accessToken');
      if (!token) {
        token = localStorage.getItem('accessToken');
      }
      if (token) {
        options.headers = options.headers || {};
        options.headers['Authorization'] = `Bearer ${token}`;
      } else {
        throw { statusCode: 401, message: 'No access token found' };
      }
    }

    try {
      const url = `${this.baseURL}${endpoint}`;
      console.log(`API Request: ${method} ${url}`);
      
      const response = await fetch(url, options);
      const data = await response.json();
      
      console.log(`API Response:`, data);

      if (!response.ok) {
        throw data;
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      
      if (error.statusCode === 401 && requiresAuth) {
        try {
          const refreshed = await this.refreshToken();
          if (refreshed.success) {
            const newToken = refreshed.data?.accessToken;
            if (newToken) {
              this._setCookie('accessToken', newToken, 7);
              options.headers['Authorization'] = `Bearer ${newToken}`;
              const retryResponse = await fetch(`${this.baseURL}${endpoint}`, options);
              const retryData = await retryResponse.json();
              if (!retryResponse.ok) {
                throw retryData;
              }
              return retryData;
            }
          }
        } catch (refreshError) {
          await this.logout();
          throw refreshError;
        }
      }
      throw error;
    }
  },

  async getAllVideos(page = 1, limit = 10) {
    try {
      return await this._request(`/videos?page=${page}&limit=${limit}`, 'GET', null, false);
    } catch (error) {
      console.warn('getAllVideos failed, using mock:', error);
      return this._getMockVideos();
    }
  },

  async getVideoById(videoId) {
    try {
      return await this._request(`/videos/${videoId}`, 'GET', null, false);
    } catch (error) {
      console.warn('getVideoById failed, using mock:', error);
      return this._getMockVideo(videoId);
    }
  },

  async searchVideos(query) {
    try {
      return await this._request(`/videos/search?q=${encodeURIComponent(query)}`, 'GET', null, false);
    } catch (error) {
      console.warn('searchVideos failed, using mock:', error);
      return this._getMockVideos();
    }
  },

  async uploadVideo(formData) {
    return this._request('/videos', 'POST', formData, true, true);
  },

  async deleteVideo(videoId) {
    return this._request(`/videos/${videoId}`, 'DELETE', null, true);
  },

  async addComment(videoId, content) {
    if (!videoId) throw { message: 'Video ID is required' };
    if (!content) throw { message: 'Comment content is required' };
    try {
      return await this._request(`/comments/${videoId}`, 'POST', { content }, true);
    } catch (error) {
      console.warn('addComment failed, using mock:', error);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const newComment = {
        _id: 'mock_' + Date.now(),
        content: content,
        video: videoId,
        owner: {
          _id: user._id || 'mock_user',
          fullName: user.fullName || 'User',
          avatar: user.avatar || 'https://randomuser.me/api/portraits/men/32.jpg'
        },
        likes: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const comments = JSON.parse(localStorage.getItem('comments') || '{}');
      if (!comments[videoId]) comments[videoId] = [];
      comments[videoId].push(newComment);
      localStorage.setItem('comments', JSON.stringify(comments));
      return {
        success: true,
        data: newComment,
        message: 'Comment added (mock)'
      };
    }
  },

  async updateComment(commentId, content) {
    if (!commentId) throw { message: 'Comment ID is required' };
    if (!content) throw { message: 'Comment content is required' };
    try {
      return await this._request(`/comments/c/${commentId}`, 'PATCH', { content }, true);
    } catch (error) {
      console.warn('updateComment failed, using mock:', error);
      const comments = JSON.parse(localStorage.getItem('comments') || '{}');
      for (const videoId in comments) {
        const comment = comments[videoId].find(c => c._id === commentId);
        if (comment) {
          comment.content = content;
          comment.updatedAt = new Date().toISOString();
          localStorage.setItem('comments', JSON.stringify(comments));
          return {
            success: true,
            data: comment,
            message: 'Comment updated (mock)'
          };
        }
      }
      return {
        success: false,
        data: null,
        message: 'Comment not found'
      };
    }
  },

  async deleteComment(commentId) {
    if (!commentId) throw { message: 'Comment ID is required' };
    try {
      return await this._request(`/comments/c/${commentId}`, 'DELETE', null, true);
    } catch (error) {
      console.warn('deleteComment failed, using mock:', error);
      const comments = JSON.parse(localStorage.getItem('comments') || '{}');
      for (const videoId in comments) {
        const index = comments[videoId].findIndex(c => c._id === commentId);
        if (index !== -1) {
          comments[videoId].splice(index, 1);
          localStorage.setItem('comments', JSON.stringify(comments));
          return {
            success: true,
            data: {},
            message: 'Comment deleted (mock)'
          };
        }
      }
      return {
        success: false,
        data: null,
        message: 'Comment not found'
      };
    }
  },

  async getVideoComments(videoId) {
    if (!videoId) throw { message: 'Video ID is required' };
    try {
      return await this._request(`/comments/${videoId}`, 'GET', null, false);
    } catch (error) {
      console.warn('getVideoComments failed, using mock:', error);
      const comments = JSON.parse(localStorage.getItem('comments') || '{}');
      return {
        success: true,
        data: comments[videoId] || [],
        message: 'Comments fetched (mock)'
      };
    }
  },

  async toggleVideoLike(videoId) {
    if (!videoId) throw { message: 'Video ID is required' };
    try {
      return await this._request(`/likes/toggle/v/${videoId}`, 'POST', null, true);
    } catch (error) {
      console.warn('toggleVideoLike failed, using mock:', error);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const likes = JSON.parse(localStorage.getItem('videoLikes') || '{}');
      if (!likes[videoId]) likes[videoId] = [];
      const index = likes[videoId].indexOf(user._id);
      if (index !== -1) {
        likes[videoId].splice(index, 1);
      } else {
        likes[videoId].push(user._id);
      }
      localStorage.setItem('videoLikes', JSON.stringify(likes));
      return {
        success: true,
        data: {
          video: videoId,
          likedBy: user._id || 'mock_user',
          _id: 'mock_' + Date.now(),
          createdAt: new Date().toISOString()
        },
        message: 'Like toggled (mock)'
      };
    }
  },

  async toggleCommentLike(commentId) {
    if (!commentId) throw { message: 'Comment ID is required' };
    try {
      return await this._request(`/likes/toggle/c/${commentId}`, 'POST', null, true);
    } catch (error) {
      console.warn('toggleCommentLike failed, using mock:', error);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const commentLikes = JSON.parse(localStorage.getItem('commentLikes') || '{}');
      if (!commentLikes[commentId]) commentLikes[commentId] = [];
      const index = commentLikes[commentId].indexOf(user._id);
      if (index !== -1) {
        commentLikes[commentId].splice(index, 1);
      } else {
        commentLikes[commentId].push(user._id);
      }
      localStorage.setItem('commentLikes', JSON.stringify(commentLikes));
      return {
        success: true,
        data: {
          comment: commentId,
          likedBy: user._id || 'mock_user',
          _id: 'mock_' + Date.now(),
          createdAt: new Date().toISOString()
        },
        message: 'Comment like toggled (mock)'
      };
    }
  },

  _getMockVideos() {
    return {
      success: true,
      data: {
        videos: [
          {
            _id: "v1",
            videoFile: "https://www.w3schools.com/html/mov_bbb.mp4",
            thumbnail: "https://picsum.photos/id/101/320/180",
            title: "Big Buck Bunny - Sample Video",
            description: "This is a sample video for testing. Big Buck Bunny is a short animated film.",
            duration: 634,
            views: 2300000,
            isPublished: true,
            owner: {
              _id: "ch1",
              username: "sample",
              fullName: "Sample Channel",
              avatar: "https://picsum.photos/id/100/50/50"
            },
            likes: ["user1", "user2", "user3"],
            comments: [],
            createdAt: "2026-06-27T10:00:00.000Z",
            updatedAt: "2026-06-27T10:00:00.000Z"
          },
          {
            _id: "v2",
            videoFile: "https://www.w3schools.com/html/mov_bbb.mp4",
            thumbnail: "https://picsum.photos/id/26/320/180",
            title: "HOW I'D START DSA",
            description: "Complete DSA roadmap for beginners",
            duration: 932,
            views: 892000,
            isPublished: true,
            owner: {
              _id: "ch2",
              username: "nagender",
              fullName: "Code with Nagender",
              avatar: "https://picsum.photos/id/91/50/50"
            },
            likes: ["user4", "user5"],
            comments: [],
            createdAt: "2026-06-26T10:00:00.000Z",
            updatedAt: "2026-06-26T10:00:00.000Z"
          },
          {
            _id: "v3",
            videoFile: "https://www.w3schools.com/html/mov_bbb.mp4",
            thumbnail: "https://picsum.photos/id/0/320/180",
            title: "If I had to learn DSA again, I'd do this",
            description: "Complete DSA roadmap for placements",
            duration: 1328,
            views: 1100000,
            isPublished: true,
            owner: {
              _id: "ch2",
              username: "nagender",
              fullName: "Code with Nagender",
              avatar: "https://picsum.photos/id/91/50/50"
            },
            likes: ["user6", "user7", "user8", "user9"],
            comments: [],
            createdAt: "2026-06-25T10:00:00.000Z",
            updatedAt: "2026-06-25T10:00:00.000Z"
          },
          {
            _id: "v4",
            videoFile: "https://www.w3schools.com/html/mov_bbb.mp4",
            thumbnail: "https://picsum.photos/id/15/320/180",
            title: "Every Indian Trip Ever",
            description: "Funny animated vlog about Indian trips",
            duration: 495,
            views: 3400000,
            isPublished: true,
            owner: {
              _id: "ch3",
              username: "indiantrips",
              fullName: "Indian Trips",
              avatar: "https://picsum.photos/id/22/50/50"
            },
            likes: ["user10", "user11", "user12"],
            comments: [],
            createdAt: "2026-06-24T10:00:00.000Z",
            updatedAt: "2026-06-24T10:00:00.000Z"
          }
        ],
        total: 4,
        page: 1,
        limit: 10,
        totalPages: 1
      },
      message: "Mock videos with details (API fallback)"
    };
  },

  _getMockVideo(videoId) {
    const mockVideos = this._getMockVideos().data.videos;
    const video = mockVideos.find(v => v._id === videoId) || mockVideos[0];
    return {
      success: true,
      data: video,
      message: "Mock video (API fallback)"
    };
  }
};

export default API;