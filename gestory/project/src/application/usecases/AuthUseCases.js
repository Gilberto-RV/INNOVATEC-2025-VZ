import { AuthRepository } from '../../infrastructure/repositories/AuthRepository.js';
import { User } from '../../core/entities/User.js';
import { setAuthToken } from '../../infrastructure/http/HttpClient.js';

export class AuthUseCases {
  constructor() {
    this.authRepository = new AuthRepository();
  }

  async login(email, password) {
  const response = await this.authRepository.login({ email, password });
  
  if (response.token && response.user) {
    const user = new User(response.user);
    
    if (!user.isAdmin()) {
      throw new Error('Acceso denegado. Se requieren permisos de administrador.');
    }

    localStorage.setItem('authToken', response.token);
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    // Actualiza token global de httpClient
    setAuthToken(response.token);

    return user;
  }
  
  throw new Error('Credenciales inválidas');
}

  async logout() {
    await this.authRepository.logout();
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');

    // Elimina token global de httpClient
    setAuthToken(null);
  }


  getCurrentUser() {
    const userData = localStorage.getItem('currentUser');
    return userData ? new User(JSON.parse(userData)) : null;
  }

  isAuthenticated() {
    return !!localStorage.getItem('authToken');
  }

  async updateProfile(userData) {
    const response = await this.authRepository.updateProfile(userData);
    const updatedUser = new User(response.user);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    return updatedUser;
  }

  async changePassword(currentPassword, newPassword) {
    return this.authRepository.changePassword({
      currentPassword,
      newPassword
    });
  }
}