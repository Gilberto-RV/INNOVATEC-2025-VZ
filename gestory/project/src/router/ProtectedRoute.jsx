import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AuthUseCases } from '../application/usecases/AuthUseCases.js';

const authUseCases = new AuthUseCases();

export function ProtectedRoute({ children }) {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const authenticated = authUseCases.isAuthenticated();
        const currentUser = authUseCases.getCurrentUser();
        
        // Debug: Ver qué está pasando
        if (!authenticated) {
          console.log('🔒 No hay token de autenticación');
          setIsAuthorized(false);
          setIsChecking(false);
          return;
        }

        if (!currentUser) {
          console.log('🔒 No se encontró usuario en localStorage');
          setIsAuthorized(false);
          setIsChecking(false);
          return;
        }

        console.log('👤 Usuario encontrado:', {
          email: currentUser.email,
          role: currentUser.role,
          isAdmin: currentUser.isAdmin()
        });

        if (!currentUser.isAdmin()) {
          console.log('❌ Usuario no es administrador');
          setIsAuthorized(false);
          setIsChecking(false);
          return;
        }

        setIsAuthorized(true);
        setIsChecking(false);
      } catch (error) {
        console.error('❌ Error verificando autenticación:', error);
        setIsAuthorized(false);
        setIsChecking(false);
      }
    };

    checkAuth();
  }, []);

  if (isChecking) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        Verificando autenticación...
      </div>
    );
  }

  if (!isAuthorized) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}