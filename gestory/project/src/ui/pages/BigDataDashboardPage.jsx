import { useState, useEffect } from 'react';
import { 
  Users, 
  Building2, 
  Calendar, 
  TrendingUp,
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
  const [peakHoursData, setPeakHoursData] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState('all'); // 'all' o ID del edificio
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null
  });
  const [processingBatch, setProcessingBatch] = useState(false);

  useEffect(() => {
    loadDashboardData();
    loadPeakHoursData();
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

  const loadPeakHoursData = async () => {
    try {
      const data = await bigDataUseCases.getBuildingPeakHours({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        limit: 13
      });
      setPeakHoursData(data || []);
      console.log('Peak Hours cargadas:', data);
    } catch (error) {
      console.error('Error cargando horas pico:', error);
      setPeakHoursData([]);
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
  const buildingStats = dashboardData?.buildings || [];
  const eventStats = dashboardData?.events || [];

  // Función para truncar texto largo
  const truncateText = (text, maxLength = 25) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

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

  // Calcular totales
  const totalBuildingViews = buildingStats.reduce((sum, item) => sum + (item.totalViews || 0), 0);
  const totalUniqueBuildingVisitors = buildingStats.reduce((sum, item) => sum + (item.totalUniqueVisitors || 0), 0);
  const totalEventViews = eventStats.reduce((sum, item) => sum + (item.totalViews || 0), 0);
  const totalUniqueEventVisitors = eventStats.reduce((sum, item) => sum + (item.totalUniqueVisitors || 0), 0);
  
  // Calcular horas pico de edificios desde el nuevo endpoint
  const getPeakHoursChartData = () => {
    const hourCounts = Array(24).fill(0);
    
    if (selectedBuilding === 'all') {
      // Vista general: sumar todos los edificios
      peakHoursData.forEach(building => {
        if (building.peakHours && Array.isArray(building.peakHours)) {
          building.peakHours.forEach(ph => {
            if (ph.hour >= 0 && ph.hour < 24) {
              hourCounts[ph.hour] += ph.count || 0;
            }
          });
        }
      });
    } else {
      // Vista específica: solo el edificio seleccionado
      const building = peakHoursData.find(b => b.buildingId === selectedBuilding);
      if (building && building.peakHours && Array.isArray(building.peakHours)) {
        building.peakHours.forEach(ph => {
          if (ph.hour >= 0 && ph.hour < 24) {
            hourCounts[ph.hour] = ph.count || 0;
          }
        });
      }
    }
    
    return hourCounts.map((count, hour) => ({ hour, count }));
  };
  
  // Obtener nombre del edificio seleccionado para el título
  const getSelectedBuildingName = () => {
    if (selectedBuilding === 'all') return 'Todos los Edificios';
    const building = peakHoursData.find(b => b.buildingId === selectedBuilding);
    return building?.buildingName || 'Edificio Desconocido';
  };

  return (
    <div className="bigdata-dashboard-page">
      <div className="page-header">
        <div>
          <h1>Dashboard de Big Data</h1>
          <p>Métricas de edificios y analíticas de eventos</p>
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

        <Card className="stat-card stat-card--blue">
          <div className="stat-content">
            <div className="stat-icon">
              <Users size={24} />
            </div>
            <div className="stat-info">
              <h3 className="stat-value">{totalUniqueBuildingVisitors.toLocaleString()}</h3>
              <p className="stat-title">Visitantes Únicos (Edificios)</p>
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
              <p className="stat-title">Visualizaciones de Eventos</p>
            </div>
          </div>
        </Card>

        <Card className="stat-card stat-card--green">
          <div className="stat-content">
            <div className="stat-icon">
              <TrendingUp size={24} />
            </div>
            <div className="stat-info">
              <h3 className="stat-value">{totalUniqueEventVisitors.toLocaleString()}</h3>
              <p className="stat-title">Visitantes Únicos (Eventos)</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="charts-grid">
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
        <Card title="Top 10 Eventos Más Populares" className="chart-card">
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
                <Bar dataKey="vistas" fill="#FF8042" name="Visualizaciones" />
                <Bar dataKey="visitantes" fill="#FFBB28" name="Visitantes Únicos" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data-message">No hay datos de eventos disponible</div>
          )}
        </Card>

        {/* Gráfico de horas pico de edificios */}
        <Card title="Horas Pico de Visitas a Edificios" className="chart-card">
          {peakHoursData.length > 0 ? (
            <>
              {/* Selector de edificios */}
              <div style={{ marginBottom: '20px', padding: '0 20px' }}>
                <label style={{ marginRight: '10px', fontWeight: 'bold' }}>
                  Edificio:
                </label>
                <select 
                  value={selectedBuilding}
                  onChange={(e) => setSelectedBuilding(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                    fontSize: '14px',
                    minWidth: '200px',
                    cursor: 'pointer'
                  }}
                >
                  <option value="all">📊 Todos los Edificios (Consolidado)</option>
                  {peakHoursData.map(building => (
                    <option key={building.buildingId} value={building.buildingId}>
                      {building.buildingName}
                    </option>
                  ))}
                </select>
                <span style={{ marginLeft: '15px', color: '#666', fontSize: '14px' }}>
                  Mostrando: <strong>{getSelectedBuildingName()}</strong>
                </span>
              </div>

              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={getPeakHoursChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="hour" 
                    label={{ value: 'Hora del día', position: 'insideBottom', offset: -5 }}
                    tickFormatter={(hour) => `${hour}:00`}
                  />
                  <YAxis label={{ value: 'Visitas', angle: -90, position: 'insideLeft' }} />
                  <Tooltip 
                    formatter={(value) => [value, 'Visitas']}
                    labelFormatter={(hour) => `Hora: ${hour}:00`}
                  />
                  <Legend />
                  <Bar 
                    dataKey="count" 
                    fill={selectedBuilding === 'all' ? '#8884D8' : '#00C49F'} 
                    name={selectedBuilding === 'all' ? 'Total de Visitas (Todos)' : `Visitas a ${getSelectedBuildingName()}`}
                  />
                </BarChart>
              </ResponsiveContainer>
            </>
          ) : (
            <div className="no-data-message">No hay datos de horas pico disponibles. Los datos se generarán en el próximo procesamiento por lotes.</div>
          )}
        </Card>
      </div>

      {/* Tablas de datos */}
      <div className="tables-grid">
        <Card title="Resumen de Edificios" className="table-card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Edificio</th>
                  <th>Vistas Totales</th>
                  <th>Visitantes Únicos</th>
                  <th>Duración Promedio</th>
                  <th>Hora Pico</th>
                </tr>
              </thead>
              <tbody>
                {buildingStats.length > 0 ? (
                  buildingStats.slice(0, 15).map((item, index) => {
                    // Encontrar la hora pico del edificio desde peakHoursData
                    let peakHour = 'N/A';
                    
                    // Buscar el edificio en peakHoursData por nombre o ID
                    const buildingPeakData = peakHoursData.find(
                      b => b.buildingName === item.buildingName || b.buildingId === item._id
                    );
                    
                    if (buildingPeakData && buildingPeakData.peakHours && 
                        Array.isArray(buildingPeakData.peakHours) && 
                        buildingPeakData.peakHours.length > 0) {
                      // Encontrar la hora con más visitas
                      const maxPeak = buildingPeakData.peakHours.reduce((max, ph) => 
                        (ph.count || 0) > (max.count || 0) ? ph : max, 
                        buildingPeakData.peakHours[0]
                      );
                      peakHour = `${maxPeak.hour.toString().padStart(2, '0')}:00`;
                    }
                    
                    return (
                      <tr key={index}>
                        <td>{item.buildingName || 'N/A'}</td>
                        <td>{item.totalViews || 0}</td>
                        <td>{item.totalUniqueVisitors || 0}</td>
                        <td>{item.avgViewDuration ? `${Math.round(item.avgViewDuration)}s` : 'N/A'}</td>
                        <td>{peakHour}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="no-data">No hay datos disponibles</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Resumen de Eventos por Popularidad" className="table-card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Evento</th>
                  <th>Visualizaciones</th>
                  <th>Visitantes Únicos</th>
                  <th>Score de Popularidad</th>
                </tr>
              </thead>
              <tbody>
                {eventStats.length > 0 ? (
                  eventStats.slice(0, 15).map((item, index) => (
                    <tr key={index}>
                      <td>{truncateText(item.eventTitle || 'Evento sin título', 40)}</td>
                      <td>{item.totalViews || 0}</td>
                      <td>{item.totalUniqueVisitors || 0}</td>
                      <td>{item.popularityScore ? Math.round(item.popularityScore) : 'N/A'}</td>
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

