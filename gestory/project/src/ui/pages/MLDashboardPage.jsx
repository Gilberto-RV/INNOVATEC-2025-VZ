import { useState, useEffect } from 'react';
import { 
  Brain,
  Users, 
  Building2, 
  Calendar, 
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Activity,
  Zap
} from 'lucide-react';
import { Card } from '../components/common/Card.jsx';
import { Button } from '../components/common/Button.jsx';
import { MLUseCases } from '../../application/usecases/MLUseCases.js';
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
import './MLDashboardPage.scss';

const mlUseCases = new MLUseCases();
const bigDataUseCases = new BigDataUseCases();

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
const SATURATION_COLORS = {
  'Normal': '#00C49F',
  'Baja': '#FFBB28',
  'Media': '#FF8042',
  'Alta': '#FF0000'
};

export function MLDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [mlStatus, setMLStatus] = useState(null);
  const [buildingStats, setBuildingStats] = useState([]);
  const [eventStats, setEventStats] = useState([]);
  const [predictions, setPredictions] = useState({
    attendances: [],
    mobilities: [],
    saturations: []
  });

  useEffect(() => {
    loadMLData();
  }, []);

  const loadMLData = async () => {
    try {
      setLoading(true);
      
      // Verificar estado del ML Service
      const status = await mlUseCases.checkMLServiceStatus();
      setMLStatus(status);
      
      // Cargar estadísticas de edificios y eventos para predicciones
      const dashboardData = await bigDataUseCases.getDashboardStats();
      setBuildingStats(dashboardData.buildings || []);
      setEventStats(dashboardData.events || []);
      
      // Cargar predicciones de saturación para los top 10 edificios y eventos
      await loadSaturationPredictions(dashboardData.buildings || [], dashboardData.events || []);
      
    } catch (error) {
      console.error('Error cargando datos ML:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSaturationPredictions = async (buildings, events) => {
    try {
      const saturationPredictions = [];
      
      // Predecir saturaciones para top 5 edificios
      for (const building of buildings.slice(0, 5)) {
        try {
          const prediction = await mlUseCases.getSaturationPrediction('building', building._id || building.buildingId);
          saturationPredictions.push({
            type: 'building',
            id: building._id || building.buildingId,
            name: building.buildingName,
            saturationLevel: prediction.saturationLevel,
            saturationLabel: prediction.saturationLabel,
            confidence: prediction.confidence
          });
        } catch (error) {
          console.error(`Error prediciendo saturación para edificio ${building.buildingName}:`, error);
        }
      }
      
      // Predecir saturaciones para top 5 eventos
      for (const event of events.slice(0, 5)) {
        try {
          const prediction = await mlUseCases.getSaturationPrediction('event', event._id || event.eventId);
          saturationPredictions.push({
            type: 'event',
            id: event._id || event.eventId,
            name: event.eventTitle,
            saturationLevel: prediction.saturationLevel,
            saturationLabel: prediction.saturationLabel,
            confidence: prediction.confidence
          });
        } catch (error) {
          console.error(`Error prediciendo saturación para evento ${event.eventTitle}:`, error);
        }
      }
      
      setPredictions(prev => ({ ...prev, saturations: saturationPredictions }));
    } catch (error) {
      console.error('Error cargando predicciones de saturación:', error);
    }
  };

  const handlePredictMobility = async (buildingId) => {
    try {
      const prediction = await mlUseCases.getMobilityPrediction(buildingId);
      setPredictions(prev => ({
        ...prev,
        mobilities: [...prev.mobilities.filter(m => m.buildingId !== buildingId), prediction]
      }));
    } catch (error) {
      console.error('Error prediciendo movilidad:', error);
      alert('Error al obtener predicción de movilidad');
    }
  };

  const handlePredictAttendance = async (eventId) => {
    try {
      const prediction = await mlUseCases.getAttendancePrediction(eventId);
      setPredictions(prev => ({
        ...prev,
        attendances: [...prev.attendances.filter(a => a.eventId !== eventId), prediction]
      }));
    } catch (error) {
      console.error('Error prediciendo asistencia:', error);
      alert('Error al obtener predicción de asistencia');
    }
  };

  if (loading) {
    return (
      <div className="ml-dashboard-page">
        <div className="page-header">
          <h1>Machine Learning Dashboard</h1>
        </div>
        <div className="loading-message">Cargando predicciones ML...</div>
      </div>
    );
  }

  // Preparar datos para gráficos
  const saturationChartData = predictions.saturations.map(item => ({
    name: item.name?.substring(0, 20) || 'N/A',
    level: item.saturationLevel,
    label: item.saturationLabel,
    confidence: (item.confidence * 100).toFixed(0)
  }));

  const mobilityChartData = predictions.mobilities.map(item => ({
    name: item.buildingName?.substring(0, 20) || 'N/A',
    demand: item.prediction || 0,
    confidence: (item.confidence * 100).toFixed(0)
  }));

  const attendanceChartData = predictions.attendances.map(item => ({
    name: item.eventTitle?.substring(0, 20) || 'N/A',
    attendance: item.prediction || 0,
    confidence: (item.confidence * 100).toFixed(0)
  }));

  // Agrupar saturaciones por nivel
  const saturationDistribution = predictions.saturations.reduce((acc, item) => {
    const label = item.saturationLabel || 'Normal';
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});

  const saturationPieData = Object.entries(saturationDistribution).map(([label, value]) => ({
    name: label,
    value: value
  }));

  return (
    <div className="ml-dashboard-page">
      <div className="page-header">
        <div>
          <h1>Machine Learning Dashboard</h1>
          <p>Predicciones inteligentes de demandas, asistencias y saturaciones</p>
        </div>
        <div className="header-actions">
          <Button 
            onClick={loadMLData}
            className="btn-secondary"
          >
            <RefreshCw size={16} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Estado del ML Service */}
      {mlStatus && (
        <div className={`ml-status ${mlStatus.available ? 'available' : 'unavailable'}`}>
          <div className="status-content">
            <Brain size={20} />
            <div>
              <h3>ML Service: {mlStatus.available ? 'Disponible' : 'No Disponible'}</h3>
              <p>
                {mlStatus.available ? (
                  <>
                    Modelos cargados: 
                    {mlStatus.modelsLoaded?.attendance && ' ✅ Asistencia'}
                    {mlStatus.modelsLoaded?.mobility && ' ✅ Movilidad'}
                    {mlStatus.modelsLoaded?.saturation && ' ✅ Saturación'}
                  </>
                ) : (
                  'El servicio ML no está disponible. Usando cálculos de fallback.'
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tarjetas de resumen */}
      <div className="stats-grid">
        <Card className="stat-card stat-card--blue">
          <div className="stat-content">
            <div className="stat-icon">
              <Calendar size={24} />
            </div>
            <div className="stat-info">
              <h3 className="stat-value">{predictions.attendances.length}</h3>
              <p className="stat-title">Predicciones de Asistencia</p>
            </div>
          </div>
        </Card>

        <Card className="stat-card stat-card--green">
          <div className="stat-content">
            <div className="stat-icon">
              <Activity size={24} />
            </div>
            <div className="stat-info">
              <h3 className="stat-value">{predictions.mobilities.length}</h3>
              <p className="stat-title">Predicciones de Movilidad</p>
            </div>
          </div>
        </Card>

        <Card className="stat-card stat-card--orange">
          <div className="stat-content">
            <div className="stat-icon">
              <AlertTriangle size={24} />
            </div>
            <div className="stat-info">
              <h3 className="stat-value">{predictions.saturations.length}</h3>
              <p className="stat-title">Análisis de Saturaciones</p>
            </div>
          </div>
        </Card>

        <Card className="stat-card stat-card--purple">
          <div className="stat-content">
            <div className="stat-icon">
              <TrendingUp size={24} />
            </div>
            <div className="stat-info">
              <h3 className="stat-value">
                {predictions.saturations.filter(s => s.saturationLevel >= 2).length}
              </h3>
              <p className="stat-title">Saturaciones Media/Alta</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="charts-grid">
        {/* Gráfico de distribución de saturaciones */}
        {saturationPieData.length > 0 && (
          <Card title="Distribución de Niveles de Saturación" className="chart-card">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={saturationPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {saturationPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={SATURATION_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Gráfico de demandas de movilidad */}
        {mobilityChartData.length > 0 && (
          <Card title="Predicciones de Demanda de Movilidad" className="chart-card">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mobilityChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="demand" fill="#8884D8" name="Demanda Predicha" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Gráfico de asistencias predichas */}
        {attendanceChartData.length > 0 && (
          <Card title="Predicciones de Asistencia a Eventos" className="chart-card">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={attendanceChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="attendance" fill="#00C49F" name="Asistencia Predicha" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>

      {/* Tablas de predicciones */}
      <div className="tables-grid">
        {/* Predicciones de saturación */}
        <Card title="Análisis de Saturaciones" className="table-card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Nombre</th>
                  <th>Nivel de Saturación</th>
                  <th>Confianza</th>
                </tr>
              </thead>
              <tbody>
                {predictions.saturations.length > 0 ? (
                  predictions.saturations
                    .sort((a, b) => b.saturationLevel - a.saturationLevel)
                    .map((item, index) => (
                    <tr key={index}>
                      <td>
                        <span className={`type-badge ${item.type}`}>
                          {item.type === 'building' ? <Building2 size={14} /> : <Calendar size={14} />}
                          {item.type === 'building' ? ' Edificio' : ' Evento'}
                        </span>
                      </td>
                      <td>{item.name || 'N/A'}</td>
                      <td>
                        <span className={`saturation-badge level-${item.saturationLevel}`}>
                          {item.saturationLabel}
                        </span>
                      </td>
                      <td>{(item.confidence * 100).toFixed(0)}%</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="no-data">No hay predicciones de saturación disponibles</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Predicciones de asistencia */}
        <Card title="Predicciones de Asistencia a Eventos" className="table-card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Evento</th>
                  <th>Asistencia Predicha</th>
                  <th>Confianza</th>
                  <th>Modelo</th>
                </tr>
              </thead>
              <tbody>
                {predictions.attendances.length > 0 ? (
                  predictions.attendances
                    .sort((a, b) => (b.prediction || 0) - (a.prediction || 0))
                    .map((item, index) => (
                    <tr key={index}>
                      <td>{item.eventTitle || 'N/A'}</td>
                      <td><strong>{item.prediction || 0}</strong> personas</td>
                      <td>{(item.confidence * 100).toFixed(0)}%</td>
                      <td>{item.modelType || 'N/A'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="no-data">
                      No hay predicciones disponibles. Selecciona eventos para predecir asistencias.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Predicciones de movilidad */}
        <Card title="Predicciones de Demanda de Movilidad" className="table-card table-card--fullwidth">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Edificio</th>
                  <th>Demanda Predicha</th>
                  <th>Confianza</th>
                  <th>Modelo</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {predictions.mobilities.length > 0 ? (
                  predictions.mobilities
                    .sort((a, b) => (b.prediction || 0) - (a.prediction || 0))
                    .map((item, index) => (
                    <tr key={index}>
                      <td><Building2 size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />{item.buildingName || 'N/A'}</td>
                      <td><strong>{item.prediction || 0}</strong> visitantes</td>
                      <td>{(item.confidence * 100).toFixed(0)}%</td>
                      <td>{item.modelType || 'N/A'}</td>
                      <td>{item.date ? new Date(item.date).toLocaleDateString() : 'Hoy'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="no-data">
                      No hay predicciones disponibles. Selecciona edificios para predecir demanda de movilidad.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Sección de acciones rápidas */}
      <div className="quick-actions">
        <Card title="Acciones Rápidas" className="actions-card">
          <div className="actions-grid">
            <div className="action-section">
              <h4>Predecir Movilidad</h4>
              <p>Selecciona un edificio para predecir su demanda de movilidad</p>
              <div className="buildings-list">
                {buildingStats.slice(0, 5).map((building, index) => (
                  <Button
                    key={index}
                    onClick={() => handlePredictMobility(building._id || building.buildingId)}
                    className="btn-secondary btn-small"
                  >
                    <Zap size={14} />
                    {building.buildingName || `Edificio ${index + 1}`}
                  </Button>
                ))}
              </div>
            </div>

            <div className="action-section">
              <h4>Predecir Asistencia</h4>
              <p>Selecciona un evento para predecir su asistencia</p>
              <div className="events-list">
                {eventStats.slice(0, 5).map((event, index) => (
                  <Button
                    key={index}
                    onClick={() => handlePredictAttendance(event._id || event.eventId)}
                    className="btn-secondary btn-small"
                  >
                    <Users size={14} />
                    {event.eventTitle || `Evento ${index + 1}`}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

