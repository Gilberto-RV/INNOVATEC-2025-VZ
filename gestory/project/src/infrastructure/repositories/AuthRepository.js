import { httpClient } from '../http/HttpClient.js';

export class AuthRepository {
  async login(credentials) {
    const response = await httpClient.post('/auth/login', credentials);
    return response.data;
  }

  async logout() {
    return Promise.resolve();
  }

  async getCurrentUser() {
    const response = await httpClient.get('/auth/me');
    return response.data;
  }

  async refreshToken() {
    const response = await httpClient.post('/auth/refresh');
    return response.data;
  }

  async updateProfile(userData) {
    const response = await httpClient.put('/auth/profile', userData);
    return response.data;
  }

  async changePassword(passwords) {
    return httpClient.put('/auth/change-password', passwords);
  }
}