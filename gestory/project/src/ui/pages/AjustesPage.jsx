import { useState, useEffect } from 'react';
import { User, Lock, Clock, Info } from 'lucide-react';
import { Card } from '../components/common/Card.jsx';
import { Button } from '../components/common/Button.jsx';
import { Input } from '../components/common/Input.jsx';
import { AuthUseCases } from '../../application/usecases/AuthUseCases.js';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import './AjustesPage.scss';

const authUseCases = new AuthUseCases();

export function AjustesPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('perfil');
  const [loading, setLoading] = useState(false);

  const { register: registerProfile, handleSubmit: handleSubmitProfile, formState: { errors: errorsProfile } } = useForm();
  const { register: registerPassword, handleSubmit: handleSubmitPassword, formState: { errors: errorsPassword }, reset: resetPassword } = useForm();

  useEffect(() => {
    const user = authUseCases.getCurrentUser();
    setCurrentUser(user);
  }, []);

  const onSubmitProfile = async (data) => {
    setLoading(true);
    try {
      const updatedUser = await authUseCases.updateProfile(data);
      setCurrentUser(updatedUser);
      Swal.fire('Éxito', 'Perfil actualizado correctamente', 'success');
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      Swal.fire('Error', 'No se pudo actualizar el perfil', 'error');
    } finally {
      setLoading(false);
    }
  };

  const onSubmitPassword = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      Swal.fire('Error', 'Las contraseñas no coinciden', 'error');
      return;
    }

    setLoading(true);
    try {
      await authUseCases.changePassword(data.currentPassword, data.newPassword);
      resetPassword();
      Swal.fire('Éxito', 'Contraseña cambiada correctamente', 'success');
    } catch (error) {
      console.error('Error cambiando contraseña:', error);
      Swal.fire('Error', 'No se pudo cambiar la contraseña', 'error');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'perfil', label: 'Perfil', icon: <User size={18} /> },
    { id: 'seguridad', label: 'Seguridad', icon: <Lock size={18} /> },
    { id: 'sesion', label: 'Sesión', icon: <Clock size={18} /> },
    { id: 'sistema', label: 'Sistema', icon: <Info size={18} /> }
  ];

  if (!currentUser) {
    return (
      <div className="ajustes-page">
        <div className="loading-message">Cargando configuración...</div>
      </div>
    );
  }

  return (
    <div className="ajustes-page">
      <div className="page-header">
        <h1>Configuración</h1>
        <p>Gestiona tu perfil y configuración del sistema</p>
      </div>

      <div className="ajustes-content">
        <Card className="tabs-card">
          <div className="tabs-nav">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <div className="tab-content">
            {activeTab === 'perfil' && (
              <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="settings-form">
                <h3>Información del Perfil</h3>

                <div className="avatar-preview">
                  <img 
                    src={currentUser.avatar || 'https://via.placeholder.com/100'} 
                    alt="Avatar" 
                    style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover' }}
                  />
                </div>

                <Input
                  label="Correo electrónico"
                  type="email"
                  defaultValue={currentUser.email}
                  error={errorsProfile.email?.message}
                  {...registerProfile('email', {
                    required: 'El correo es requerido',
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: 'Formato de correo inválido'
                    }
                  })}
                />

                <Input
                  label="Avatar URL"
                  defaultValue={currentUser.avatar || ''}
                  {...registerProfile('avatar')}
                />

                <Button
                  type="submit"
                  loading={loading}
                  className="save-btn"
                >
                  Guardar Cambios
                </Button>
              </form>
            )}


            {activeTab === 'seguridad' && (
              <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="settings-form">
                <h3>Cambiar Contraseña</h3>
                
                <Input
                  label="Contraseña actual"
                  type="password"
                  error={errorsPassword.currentPassword?.message}
                  {...registerPassword('currentPassword', {
                    required: 'La contraseña actual es requerida'
                  })}
                />

                <Input
                  label="Nueva contraseña"
                  type="password"
                  error={errorsPassword.newPassword?.message}
                  {...registerPassword('newPassword', {
                    required: 'La nueva contraseña es requerida',
                    minLength: {
                      value: 6,
                      message: 'Mínimo 6 caracteres'
                    }
                  })}
                />

                <Input
                  label="Confirmar nueva contraseña"
                  type="password"
                  error={errorsPassword.confirmPassword?.message}
                  {...registerPassword('confirmPassword', {
                    required: 'Confirma la nueva contraseña'
                  })}
                />

                <Button
                  type="submit"
                  loading={loading}
                  className="save-btn"
                >
                  Cambiar Contraseña
                </Button>
              </form>
            )}

            {activeTab === 'sesion' && (
              <div className="settings-form">
                <h3>Configuración de Sesión</h3>
                
                <div className="setting-item">
                  <label>Tiempo de sesión (minutos)</label>
                  <select defaultValue={currentUser.getSessionTimeout()}>
                    <option value={15}>15 minutos</option>
                    <option value={30}>30 minutos</option>
                    <option value={60}>1 hora</option>
                    <option value={120}>2 horas</option>
                    <option value={480}>8 horas</option>
                  </select>
                </div>

                <div className="setting-item">
                  <label>
                    <input type="checkbox" defaultChecked />
                    Recordar sesión en este dispositivo
                  </label>
                </div>

                <Button className="save-btn">
                  Guardar Configuración
                </Button>
              </div>
            )}

            {activeTab === 'sistema' && (
              <div className="settings-form">
                <h3>Información del Sistema</h3>
                
                <div className="info-grid">
                  <div className="info-item">
                    <strong>Versión:</strong>
                    <span>1.0.0</span>
                  </div>
                  <div className="info-item">
                    <strong>Correo:</strong>
                    <span>{currentUser.email}</span>
                  </div>
                  <div className="info-item">
                    <strong>Rol:</strong>
                    <span className="badge badge--primary">{currentUser.role}</span>
                  </div>
                  <div className="info-item">
                    <strong>Último acceso:</strong>
                    <span>{new Date().toLocaleString('es-ES')}</span>
                  </div>
                </div>

                <div className="system-stats">
                  <h4>Estadísticas de uso</h4>
                  <p>Total de eventos gestionados: <strong>0</strong></p>
                  <p>Edificios administrados: <strong>0</strong></p>
                  <p>Sesiones iniciadas: <strong>1</strong></p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}