import { Navigate } from 'react-router-dom';
import { AuthUseCases } from '../application/usecases/AuthUseCases.js';

const authUseCases = new AuthUseCases();

export function ProtectedRoute({ children }) {
  const isAuthenticated = authUseCases.isAuthenticated();
  const currentUser = authUseCases.getCurrentUser();
  
  if (!isAuthenticated || !currentUser?.isAdmin()) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}