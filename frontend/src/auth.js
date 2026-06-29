export const Auth = {
  isAuthenticated() {
    const token = localStorage.getItem('accessToken');
    return !!token;
  },

  getUser() {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      return null;
    }
  },

  async verifyAndRefresh() {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        return false;
      }
      return true;
    } catch (error) {
      return false;
    }
  },

  async logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = '/signin';
  }
};