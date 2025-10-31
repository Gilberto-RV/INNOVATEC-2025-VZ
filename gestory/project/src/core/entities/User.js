// core/entities/user.js
export class User {
  constructor({ id, email, role = 'estudiante', avatar = null, createdAt = new Date(), configuracion = {} }) {
    this.id = id;
    this.email = email;
    this.role = role;
    this.avatar = avatar;
    this.createdAt = createdAt;
    this.configuracion = configuracion;
  }

  isAdmin() {
    return this.role === 'administrador';
  }

  getSessionTimeout() {
    return this.configuracion.tiempo_sesion || 30;
  }
}
