import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  Building2, 
  Calendar, 
  TrendingUp,
  Activity,
  RefreshCw,
  Filter
} from 'lucide-react';
import { Card } from '../components/common/Card.jsx';
import { Button } from '../components/common/Button.jsx';
import { BigDataUseCases } from '../../application/usecases/BigDataUseCases.js';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import './BigDataDashboardPage.scss';

const bigDataUseCases = new BigDataUseCases();

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export function BigDataDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null
  });
  const [processingBatch, setProcessingBatch] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [dateRange]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await bigDataUseCases.getDashboardStats(
        dateRange.startDate,
        dateRange.endDate
      );
      setDashboardData(data);
    } catch (error) {
      console.error('Error cargando dashboard de Big Data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRunBatchProcessing = async () => {
    try {
      setProcessingBatch(true);
      await bigDataUseCases.runBatchProcessing();
      // Recargar datos después del procesamiento
      await loadDashboardData();
      alert('Procesamiento por lotes completado exitosamente');
    } catch (error) {
      console.error('Error ejecutando procesamiento:', error);
      alert('Error al ejecutar procesamiento por lotes');
    } finally {
      setProcessingBatch(false);
    }
  };

  const setLast7Days = () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    setDateRange({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    });
  };

  const setLast30Days = () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    setDateRange({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    });
  };

  const resetFilters = () => {
    setDateRange({ startDate: null, endDate: null });
  };

  if (loading) {
    return (
      <div className="bigdata-dashboard-page">
        <div className="page-header">
          <h1>Dashboard de Big Data</h1>
        </div>
        <div className="loading-message">Cargando datos de analíticas...</div>
      </div>
    );
  }

  // Preparar datos para gráficos
  const userActivityData = dashboardData?.userActivity || [];
  const buildingStats = dashboardData?.buildings || [];
  const eventStats = dashboardData?.events || [];

  // Función para traducir acciones a español
  const translateAction = (action) => {
    const translations = {
      'login': 'Iniciar Sesión',
      'logout': 'Cerrar Sesión',
      'view_building': 'Ver Edificio',
      'view_event': 'Ver Evento',
      'search_building': 'Buscar Edificio',
      'create_event': 'Crear Evento (Admin)',
      'update_event': 'Actualizar Evento (Admin)',
      'delete_event': 'Eliminar Evento (Admin)',
      'view_profile': 'Ver Perfil',
      'update_profile': 'Actualizar Perfil'
    };
    return translations[action] || action?.replace('_', ' ').toUpperCase() || 'N/A';
  };

  // Función para truncar texto largo
  const truncateText = (text, maxLength = 25) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Gráfico de actividad de usuarios (con nombres truncados para display)
  const activityChartData = userActivityData.map(item => ({
    name: translateAction(item.action),
    nameDisplay: truncateText(translateAction(item.action), 20),
    nameFull: translateAction(item.action),
    cantidad: item.count || 0,
    usuarios: item.uniqueUsersCount || 0
  }));

  // Gráfico de edificios más visitados (top 10)
  const topBuildingsData = buildingStats
    .slice(0, 10)
    .map(item => ({
      name: item.buildingName || 'Unknown',
      vistas: item.totalViews || 0,
      visitantes: item.totalUniqueVisitors || 0
    }));

  // Gráfico de eventos más populares (top 10)
  const topEventsData = eventStats
    .slice(0, 10)
    .map(item => ({
      name: item.eventTitle || 'Evento sin título',
      nameDisplay: truncateText(item.eventTitle || 'Evento sin título', 25),
      nameFull: item.eventTitle || 'Evento sin título',
      vistas: item.totalViews || 0,
      visitantes: item.totalUniqueVisitors || 0
    }));

  // Gráfico circular por rol de usuarios
  const roleDistributionData = userActivityData.reduce((acc, item) => {
    // Simplificado - en producción deberías tener datos más específicos
    return acc;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const totalUserActions = userActivityData.reduce((sum, item) => sum + (item.count || 0), 0);
  const totalBuildingViews = buildingStats.reduce((sum, item) => sum + (item.totalViews || 0), 0);
  const totalEventViews = eventStats.reduce((sum, item) => sum + (item.totalViews || 0), 0);
  const totalUniqueUsers = new Set(
    userActivityData.flatMap(item => item.uniqueUsers || [])
  ).size;

  return (
    <div className="bigdata-dashboard-page">
      <div className="page-header">
        <div>
          <h1>Dashboard de Big Data</h1>
          <p>Análisis y visualización de datos del sistema</p>
        </div>
        <div className="header-actions">
          <Button 
            onClick={handleRunBatchProcessing}
            disabled={processingBatch}
            className="btn-secondary"
          >
            <RefreshCw size={16} className={processingBatch ? 'spinning' : ''} />
            {processingBatch ? 'Procesando...' : 'Ejecutar Procesamiento'}
          </Button>
        </div>
      </div>

      {/* Filtros de fecha */}
      <div className="filters-section">
        <div className="filter-buttons">
          <button onClick={setLast7Days} className="filter-btn">Últimos 7 días</button>
          <button onClick={setLast30Days} className="filter-btn">Últimos 30 días</button>
          <button onClick={resetFilters} className="filter-btn">Todos los datos</button>
        </div>
        {dateRange.startDate && dateRange.endDate && (
          <div className="date-range-display">
            <Filter size={16} />
            <span>
              {new Date(dateRange.startDate).toLocaleDateString()} - {new Date(dateRange.endDate).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>

      {/* Tarjetas de resumen */}
      <div className="stats-grid">
        <Card className="stat-card stat-card--blue">
          <div className="stat-content">
            <div className="stat-icon">
              <Activity size={24} />
            </div>
            <div className="stat-info">
              <h3 className="stat-value">{totalUserActions.toLocaleString()}</h3>
              <p className="stat-title">Acciones de Usuarios</p>
            </div>
          </div>
        </Card>

        <Card className="stat-card stat-card--green">
          <div className="stat-content">
            <div className="stat-icon">
              <Users size={24} />
            </div>
            <div className="stat-info">
              <h3 className="stat-value">{totalUniqueUsers}</h3>
              <p className="stat-title">Usuarios Únicos</p>
            </div>
          </div>
        </Card>

        <Card className="stat-card stat-card--purple">
          <div className="stat-content">
            <div className="stat-icon">
              <Building2 size={24} />
            </div>
            <div className="stat-info">
              <h3 className="stat-value">{totalBuildingViews.toLocaleString()}</h3>
              <p className="stat-title">Vistas de Edificios</p>
            </div>
          </div>
        </Card>

        <Card className="stat-card stat-card--orange">
          <div className="stat-content">
            <div className="stat-icon">
              <Calendar size={24} />
            </div>
            <div className="stat-info">
              <h3 className="stat-value">{totalEventViews.toLocaleString()}</h3>
              <p className="stat-title">Vistas de Eventos</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="charts-grid">
        {/* Gráfico de actividad de usuarios - Horizontal para mejor legibilidad */}
        <Card title="Actividad de Usuarios por Acción" className="chart-card">
          {activityChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={activityChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis 
                  dataKey="nameDisplay" 
                  type="category" 
                  width={180}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  formatter={(value, name) => [value, name]}
                  labelFormatter={(label) => {
                    const fullName = activityChartData.find(item => item.nameDisplay === label)?.nameFull || label;
                    return fullName;
                  }}
                />
                <Legend />
                <Bar dataKey="cantidad" fill="#0088FE" name="Total Acciones" />
                <Bar dataKey="usuarios" fill="#00C49F" name="Usuarios Únicos" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data-message">No hay datos de actividad disponible</div>
          )}
        </Card>

        {/* Gráfico de edificios más visitados */}
        <Card title="Top 10 Edificios Más Visitados" className="chart-card">
          {topBuildingsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={topBuildingsData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={150}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip />
                <Legend />
                <Bar dataKey="vistas" fill="#8884D8" name="Vistas Totales" />
                <Bar dataKey="visitantes" fill="#82CA9D" name="Visitantes Únicos" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data-message">No hay datos de edificios disponible</div>
          )}
        </Card>

        {/* Gráfico de eventos más populares - Cambiado a barras horizontales para mejor legibilidad */}
        <Card title="Top 10 Eventos Más Populares" className="chart-card chart-card--fullwidth">
          {topEventsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={topEventsData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis 
                  dataKey="nameDisplay" 
                  type="category" 
                  width={200}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip 
                  formatter={(value, name) => [value, name]}
                  labelFormatter={(label) => {
                    const fullName = topEventsData.find(item => item.nameDisplay === label)?.nameFull || label;
                    return fullName;
                  }}
                />
                <Legend />
                <Bar dataKey="vistas" fill="#FF8042" name="Vistas Totales" />
                <Bar dataKey="visitantes" fill="#FFBB28" name="Visitantes Únicos" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data-message">No hay datos de eventos disponible</div>
          )}
        </Card>
      </div>

      {/* Tablas de datos */}
      <div className="tables-grid">
        <Card title="Resumen de Actividad de Usuarios" className="table-card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Acción</th>
                  <th>Total</th>
                  <th>Usuarios Únicos</th>
                </tr>
              </thead>
              <tbody>
                {userActivityData.length > 0 ? (
                  userActivityData.map((item, index) => (
                    <tr key={index}>
                      <td>{translateAction(item.action)}</td>
                      <td>{item.count || 0}</td>
                      <td>{item.uniqueUsersCount || 0}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="no-data">No hay datos disponibles</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Resumen de Edificios" className="table-card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Edificio</th>
                  <th>Vistas Totales</th>
                  <th>Visitantes Únicos</th>
                  <th>Duración Promedio</th>
                </tr>
              </thead>
              <tbody>
                {buildingStats.length > 0 ? (
                  buildingStats.slice(0, 10).map((item, index) => (
                    <tr key={index}>
                      <td>{item.buildingName || 'N/A'}</td>
                      <td>{item.totalViews || 0}</td>
                      <td>{item.totalUniqueVisitors || 0}</td>
                      <td>{item.avgViewDuration ? `${Math.round(item.avgViewDuration)}s` : 'N/A'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="no-data">No hay datos disponibles</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

