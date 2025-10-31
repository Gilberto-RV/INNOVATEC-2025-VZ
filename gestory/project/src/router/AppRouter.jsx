import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute.jsx';
import { LoginPage } from '../ui/pages/LoginPage.jsx';
import { AdminLayout } from '../ui/components/layout/AdminLayout.jsx';
import { DashboardPage } from '../ui/pages/DashboardPage.jsx';
import { BigDataDashboardPage } from '../ui/pages/BigDataDashboardPage.jsx';
import { EventosPage } from '../ui/pages/EventosPage.jsx';
import { EdificiosPage } from '../ui/pages/EdificiosPage.jsx';
import { CalendarioPage } from '../ui/pages/CalendarioPage.jsx';
import { AjustesPage } from '../ui/pages/AjustesPage.jsx';

export function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="bigdata" element={<BigDataDashboardPage />} />
          <Route path="eventos" element={<EventosPage />} />
          <Route path="edificios" element={<EdificiosPage />} />
          <Route path="calendario" element={<CalendarioPage />} />
          <Route path="ajustes" element={<AjustesPage />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </Router>
  );
}