import API from './api';

export const Auth = {
  isAuthenticated() {
    return !!localStorage.getItem('accessToken');
  },

  getUser() {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error parsing user:', error);
      return null;
    }
  },

  async verifyAndRefresh() {
    try {
      await API.getCurrentUser();
      return true;
    } catch (error) {
      console.log('Token verification failed, trying refresh...');
      try {
        await API.refreshToken();
        return true;
      } catch (refreshError) {
        console.log('Refresh failed, logging out...');
        await this.logout();
        return false;
      }
    }
  },

  async logout() {
    await API.logout();
  }
};