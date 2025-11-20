import { useState, useEffect, useMemo } from 'react';
import { 
  Brain,
  Users, 
  Building2, 
  Calendar, 
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Activity,
  Zap,
  Filter,
  Search,
  X,
  Info,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { Card } from '../components/common/Card.jsx';
import { Button } from '../components/common/Button.jsx';
import { EnhancedStatCard } from '../components/ml/EnhancedStatCard.jsx';
import { ConfidenceIndicator } from '../components/ml/ConfidenceIndicator.jsx';
import { ComparisonChart } from '../components/ml/ComparisonChart.jsx';
import { FactorsPanel } from '../components/ml/FactorsPanel.jsx';
import { SkeletonLoader } from '../components/ml/SkeletonLoader.jsx';
import { HoursHeatmap } from '../components/ml/HoursHeatmap.jsx';
import { InfoTooltip, PredictionTooltip, SaturationTooltip } from '../components/ml/InfoTooltip.jsx';
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
import '../components/ml/EnhancedStatCard.scss';
import '../components/ml/ConfidenceIndicator.scss';
import '../components/ml/ComparisonChart.scss';
import '../components/ml/FactorsPanel.scss';
import '../components/ml/SkeletonLoader.scss';
import '../components/ml/HoursHeatmap.scss';
import '../components/ml/InfoTooltip.scss';

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
  const [heatmapData, setHeatmapData] = useState([]);
  const [error, setError] = useState(null);
  
  // Filtros para tablas
  const [filters, setFilters] = useState({
    saturation: {
      search: '',
      type: 'all', // 'all', 'building', 'event'
      level: 'all' // 'all', '0', '1', '2', '3'
    },
    attendance: {
      search: ''
    },
    mobility: {
      search: ''
    }
  });

  useEffect(() => {
    loadMLData();
  }, []);

  const loadMLData = async () => {
    try {
      setLoading(true);
      setError(null);
      
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
      setError('Error al cargar los datos del dashboard. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const loadSaturationPredictions = async (buildings, events) => {
    try {
      const saturationPredictions = [];
      
      // Predecir saturaciones para top 5 edificios
      // Solo intentar con edificios que tengan ID válido
      for (const building of buildings.slice(0, 5)) {
        const buildingId = building._id || building.buildingId;
        // Validar que el ID existe y no es undefined/null
        if (!buildingId) {
          continue; // Saltar si no hay ID
        }
        
        try {
          const prediction = await mlUseCases.getSaturationPrediction('building', buildingId);
          if (prediction) {
            saturationPredictions.push({
              type: 'building',
              id: buildingId,
              name: building.buildingName,
              saturationLevel: prediction.saturationLevel,
              saturationLabel: prediction.saturationLabel,
              confidence: prediction.confidence
            });
          }
        } catch (error) {
          // Solo registrar errores 404 de forma silenciosa (edificio no encontrado)
          // Otros errores se registran normalmente
          if (error?.response?.status !== 404 && error?.status !== 404) {
            console.warn(`Error prediciendo saturación para edificio ${building.buildingName}:`, error.message);
          }
          // Ignorar silenciosamente errores 404 (edificio no existe en BD)
        }
      }
      
      // Predecir saturaciones para top 5 eventos
      // Solo intentar con eventos que tengan ID válido
      for (const event of events.slice(0, 5)) {
        const eventId = event._id || event.eventId;
        // Validar que el ID existe y no es undefined/null
        if (!eventId) {
          continue; // Saltar si no hay ID
        }
        
        try {
          const prediction = await mlUseCases.getSaturationPrediction('event', eventId);
          if (prediction) {
            saturationPredictions.push({
              type: 'event',
              id: eventId,
              name: event.eventTitle,
              saturationLevel: prediction.saturationLevel,
              saturationLabel: prediction.saturationLabel,
              confidence: prediction.confidence
            });
          }
        } catch (error) {
          // Solo registrar errores 404 de forma silenciosa (evento no encontrado)
          // Otros errores se registran normalmente
          if (error?.response?.status !== 404 && error?.status !== 404) {
            console.warn(`Error prediciendo saturación para evento ${event.eventTitle}:`, error.message);
          }
          // Ignorar silenciosamente errores 404 (evento no existe en BD)
        }
      }
      
      setPredictions(prev => ({ ...prev, saturations: saturationPredictions }));
    } catch (error) {
      console.error('Error cargando predicciones de saturación:', error);
    }
  };

  const handlePredictMobility = async (buildingId, e) => {
    e?.stopPropagation(); // Evitar que el click se propague al card
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

  const handleRemoveMobility = (buildingId, e) => {
    e?.stopPropagation(); // Evitar que el click se propague al card
    setPredictions(prev => ({
      ...prev,
      mobilities: prev.mobilities.filter(m => m.buildingId !== buildingId)
    }));
  };

  const handlePredictAttendance = async (eventId, e) => {
    e?.stopPropagation(); // Evitar que el click se propague al card
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

  const handleRemoveAttendance = (eventId, e) => {
    e?.stopPropagation(); // Evitar que el click se propague al card
    setPredictions(prev => ({
      ...prev,
      attendances: prev.attendances.filter(a => a.eventId !== eventId)
    }));
  };

  const loadHeatmapData = async (buildings) => {
    try {
      // Obtener datos de peakHours de los edificios para los últimos 7 días
      const heatmapDataArray = [];
      
      for (const building of buildings.slice(0, 3)) { // Top 3 edificios
        try {
          // En una implementación real, aquí obtendrías los datos de BuildingAnalytics
          // Por ahora, generamos datos de ejemplo basados en el patrón esperado
          const buildingId = building._id || building.buildingId;
          
          // Simular datos de peakHours para cada día de la semana
          for (let day = 0; day < 7; day++) {
            for (let hour = 0; hour < 24; hour++) {
              // Simular distribución de actividad (mayor actividad entre 8-18h en días laborables)
              const isWeekday = day < 5;
              const isBusinessHours = hour >= 8 && hour <= 18;
              const baseActivity = isWeekday && isBusinessHours ? Math.random() * 50 + 20 : Math.random() * 10;
              
              heatmapDataArray.push({
                dayOfWeek: day,
                hour: hour,
                value: Math.round(baseActivity),
                buildingId: buildingId,
                buildingName: building.buildingName || 'Edificio'
              });
            }
          }
        } catch (error) {
          console.error(`Error cargando datos para heatmap de edificio ${building.buildingName}:`, error);
        }
      }
      
      setHeatmapData(heatmapDataArray);
    } catch (error) {
      console.error('Error cargando datos del heatmap:', error);
    }
  };

  // Preparar datos para gráficos (ANTES de cualquier return)
  const saturationChartData = useMemo(() => {
    return predictions.saturations.map(item => ({
      name: item.name?.substring(0, 20) || 'N/A',
      level: item.saturationLevel,
      label: item.saturationLabel,
      confidence: (item.confidence * 100).toFixed(0)
    }));
  }, [predictions.saturations]);

  const mobilityChartData = useMemo(() => {
    return predictions.mobilities.map(item => ({
      name: item.buildingName?.substring(0, 20) || 'N/A',
      demand: item.prediction || 0,
      confidence: (item.confidence * 100).toFixed(0)
    }));
  }, [predictions.mobilities]);

  const attendanceChartData = useMemo(() => {
    return predictions.attendances.map(item => ({
      name: item.eventTitle?.substring(0, 20) || 'N/A',
      attendance: item.prediction || 0,
      confidence: (item.confidence * 100).toFixed(0)
    }));
  }, [predictions.attendances]);

  // Agrupar saturaciones por nivel
  const saturationDistribution = useMemo(() => {
    return predictions.saturations.reduce((acc, item) => {
      const label = item.saturationLabel || 'Normal';
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    }, {});
  }, [predictions.saturations]);

  const saturationPieData = useMemo(() => {
    return Object.entries(saturationDistribution).map(([label, value]) => ({
      name: label,
      value: value
    }));
  }, [saturationDistribution]);

  // Filtrar predicciones de saturación
  const filteredSaturations = useMemo(() => {
    return predictions.saturations.filter(item => {
      const matchesSearch = !filters.saturation.search || 
        (item.name || '').toLowerCase().includes(filters.saturation.search.toLowerCase());
      const matchesType = filters.saturation.type === 'all' || item.type === filters.saturation.type;
      const matchesLevel = filters.saturation.level === 'all' || 
        item.saturationLevel?.toString() === filters.saturation.level;
      return matchesSearch && matchesType && matchesLevel;
    });
  }, [predictions.saturations, filters.saturation]);

  // Filtrar predicciones de asistencia
  const filteredAttendances = useMemo(() => {
    return predictions.attendances.filter(item => {
      return !filters.attendance.search || 
        (item.eventTitle || '').toLowerCase().includes(filters.attendance.search.toLowerCase());
    });
  }, [predictions.attendances, filters.attendance]);

  // Filtrar predicciones de movilidad
  const filteredMobilities = useMemo(() => {
    return predictions.mobilities.filter(item => {
      return !filters.mobility.search || 
        (item.buildingName || '').toLowerCase().includes(filters.mobility.search.toLowerCase());
    });
  }, [predictions.mobilities, filters.mobility]);

  // Calcular valores previos simulados (en producción vendrían de historial)
  const previousValues = useMemo(() => {
    return {
      attendances: Math.max(0, Math.round(predictions.attendances.length * 0.9)),
      mobilities: Math.max(0, Math.round(predictions.mobilities.length * 0.85)),
      saturations: Math.max(0, Math.round(predictions.saturations.length * 0.88)),
      highSaturations: Math.max(0, Math.round(predictions.saturations.filter(s => s.saturationLevel >= 2).length * 0.92))
    };
  }, [predictions.attendances.length, predictions.mobilities.length, predictions.saturations.length]);

  // Retornos condicionales DESPUÉS de todos los hooks
  if (loading) {
    return (
      <div className="ml-dashboard-page">
        <div className="page-header">
          <h1>Machine Learning Dashboard</h1>
          <p>Predicciones inteligentes de demandas, asistencias y saturaciones</p>
        </div>
        <div className="loading-skeletons">
          <div className="stats-grid">
            <SkeletonLoader type="stat" count={4} />
          </div>
          <div className="charts-grid">
            <SkeletonLoader type="chart" />
            <SkeletonLoader type="chart" />
          </div>
          <div className="tables-grid">
            <SkeletonLoader type="table" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ml-dashboard-page">
        <div className="page-header">
          <h1>Machine Learning Dashboard</h1>
        </div>
        <div className="error-message" style={{ 
          padding: '2rem', 
          textAlign: 'center', 
          color: '#FF0000',
          background: '#fff5f5',
          border: '1px solid #ffcccc',
          borderRadius: '8px',
          margin: '2rem 0'
        }}>
          <AlertTriangle size={24} style={{ marginBottom: '1rem' }} />
          <p>{error}</p>
          <Button onClick={loadMLData} className="btn-secondary" style={{ marginTop: '1rem' }}>
            <RefreshCw size={16} />
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

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

      {/* Tarjetas de resumen mejoradas */}
      <div className="stats-grid">
        <EnhancedStatCard
          title="Predicciones de Asistencia"
          value={predictions.attendances.length}
          previous={previousValues.attendances}
          trend={predictions.attendances.length > previousValues.attendances ? 'up' : predictions.attendances.length < previousValues.attendances ? 'down' : 'neutral'}
          icon={<Calendar size={24} />}
          color="blue"
          subtitle={predictions.attendances.length > 0 ? 'Predicciones activas' : 'Sin predicciones aún'}
        />

        <EnhancedStatCard
          title="Predicciones de Movilidad"
          value={predictions.mobilities.length}
          previous={previousValues.mobilities}
          trend={predictions.mobilities.length > previousValues.mobilities ? 'up' : predictions.mobilities.length < previousValues.mobilities ? 'down' : 'neutral'}
          icon={<Activity size={24} />}
          color="green"
          subtitle={predictions.mobilities.length > 0 ? 'Edificios analizados' : 'Sin predicciones aún'}
        />

        <EnhancedStatCard
          title="Análisis de Saturaciones"
          value={predictions.saturations.length}
          previous={previousValues.saturations}
          trend={predictions.saturations.length > previousValues.saturations ? 'up' : predictions.saturations.length < previousValues.saturations ? 'down' : 'neutral'}
          icon={<AlertTriangle size={24} />}
          color="orange"
          subtitle={`${predictions.saturations.filter(s => s.saturationLevel >= 2).length} niveles altos`}
        />

        <EnhancedStatCard
          title="Saturaciones Media/Alta"
          value={predictions.saturations.filter(s => s.saturationLevel >= 2).length}
          previous={previousValues.highSaturations}
          trend={predictions.saturations.filter(s => s.saturationLevel >= 2).length > previousValues.highSaturations ? 'up' : predictions.saturations.filter(s => s.saturationLevel >= 2).length < previousValues.highSaturations ? 'down' : 'neutral'}
          icon={<TrendingUp size={24} />}
          color="purple"
          subtitle="Requieren atención"
        />
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

        {/* Gráfico de demandas de movilidad - Fijo */}
        <Card title="Predicciones de Demanda de Movilidad" className="chart-card">
          {mobilityChartData.length > 0 ? (
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
          ) : (
            <div className="no-data-message" style={{ padding: '3rem', textAlign: 'center', color: '#999' }}>
              No hay predicciones de movilidad disponibles. Selecciona edificios para predecir demanda.
            </div>
          )}
        </Card>

        {/* Gráfico de asistencias predichas - Fijo */}
        <Card title="Predicciones de Asistencia a Eventos" className="chart-card">
          {attendanceChartData.length > 0 ? (
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
          ) : (
            <div className="no-data-message" style={{ padding: '3rem', textAlign: 'center', color: '#999' }}>
              No hay predicciones de asistencia disponibles. Selecciona eventos para predecir asistencia.
            </div>
          )}
        </Card>

        {/* Gráfico comparativo de movilidad - Fijo */}
        <Card title="Comparación: Predicción vs Real (Movilidad)" className="chart-card">
          {predictions.mobilities.length > 0 ? (
            <ComparisonChart
              data={predictions.mobilities.map(item => ({
                date: item.buildingName?.substring(0, 15) || 'Edificio',
                predicted: item.prediction || 0,
                actual: item.actual || null
              }))}
              type="bar"
              showPredictionLine={true}
              showActualLine={false}
            />
          ) : (
            <div className="no-data-message" style={{ padding: '3rem', textAlign: 'center', color: '#999' }}>
              No hay predicciones de movilidad para comparar. Selecciona edificios para predecir demanda.
            </div>
          )}
        </Card>
      </div>

      {/* Heatmap de horarios */}
      {heatmapData.length > 0 && (
        <Card title="Heatmap de Actividad por Horarios" className="heatmap-card">
          <HoursHeatmap
            data={heatmapData}
            title="Patrones de Demanda por Día y Hora"
            subtitle="Visualización de la actividad esperada en las diferentes horas del día y días de la semana"
          />
        </Card>
      )}

      {/* Tablas de predicciones */}
      <div className="tables-grid">
        {/* Predicciones de saturación */}
        <Card 
          title="Análisis de Saturaciones" 
          className="table-card"
          header={
            <div className="table-filters">
              <div className="filter-group">
                <div className="search-input">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Buscar por nombre..."
                    value={filters.saturation.search}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      saturation: { ...prev.saturation, search: e.target.value }
                    }))}
                  />
                  {filters.saturation.search && (
                    <button
                      className="clear-search"
                      onClick={() => setFilters(prev => ({
                        ...prev,
                        saturation: { ...prev.saturation, search: '' }
                      }))}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                <select
                  value={filters.saturation.type}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    saturation: { ...prev.saturation, type: e.target.value }
                  }))}
                  className="filter-select"
                >
                  <option value="all">Todos los tipos</option>
                  <option value="building">Edificios</option>
                  <option value="event">Eventos</option>
                </select>
                <select
                  value={filters.saturation.level}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    saturation: { ...prev.saturation, level: e.target.value }
                  }))}
                  className="filter-select"
                >
                  <option value="all">Todos los niveles</option>
                  <option value="0">Normal</option>
                  <option value="1">Baja</option>
                  <option value="2">Media</option>
                  <option value="3">Alta</option>
                </select>
              </div>
            </div>
          }
        >
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
                {filteredSaturations.length > 0 ? (
                  filteredSaturations
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
                        <SaturationTooltip saturation={item}>
                          <span className={`saturation-badge level-${item.saturationLevel} enhanced`}>
                            {item.saturationLabel}
                          </span>
                        </SaturationTooltip>
                      </td>
                      <td>
                        <ConfidenceIndicator confidence={item.confidence || 0} size="small" />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="no-data">
                      {predictions.saturations.length === 0 
                        ? 'No hay predicciones de saturación disponibles' 
                        : 'No hay resultados que coincidan con los filtros'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Panel de Factores Influentes - Mostrar para la primera predicción con datos */}
        {predictions.attendances.length > 0 && (
          <Card title="Factores que influyen en las predicciones" className="table-card">
            <FactorsPanel
              factors={[
                {
                  name: 'Hora del día',
                  impact: 'Alto',
                  description: 'El horario del evento tiene una influencia significativa en la asistencia esperada',
                  value: predictions.attendances[0]?.hour || 14,
                  unit: 'hrs',
                  weight: 0.35
                },
                {
                  name: 'Día de la semana',
                  impact: 'Medio',
                  description: 'Indica qué día de la semana es el evento. Los días laborables (lunes-viernes) suelen tener mayor asistencia que los fines de semana. Este valor (0-6) representa: 0=Lunes, 1=Martes, 2=Miércoles, 3=Jueves, 4=Viernes, 5=Sábado, 6=Domingo. Afecta la disponibilidad de las personas para asistir.',
                  value: predictions.attendances[0]?.dayOfWeek !== undefined 
                    ? ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'][predictions.attendances[0]?.dayOfWeek] || predictions.attendances[0]?.dayOfWeek
                    : 'No disponible',
                  unit: '',
                  weight: 0.28
                },
                {
                  name: 'Vistas previas',
                  impact: 'Alto',
                  description: 'Número de visualizaciones del evento indica interés previo',
                  value: predictions.attendances[0]?.viewCount || 0,
                  unit: 'vistas',
                  weight: 0.25
                },
                {
                  name: 'Visitantes únicos',
                  impact: 'Medio',
                  description: 'Personas únicas que han mostrado interés en el evento',
                  value: predictions.attendances[0]?.uniqueVisitors || 0,
                  unit: 'personas',
                  weight: 0.22
                },
                {
                  name: 'Score de popularidad',
                  impact: 'Bajo',
                  description: 'Métrica calculada automáticamente que combina múltiples factores: número de vistas del evento, visitantes únicos, y vistas recientes (últimas 24 horas). Un score más alto indica mayor interés previo. Se calcula como: (Vistas × 1) + (Visitantes Únicos × 2) + (Vistas Recientes × 3). Valores más altos sugieren mayor asistencia esperada.',
                  value: Math.round(predictions.attendances[0]?.popularityScore || 0),
                  unit: 'puntos',
                  weight: 0.15
                }
              ]}
            />
          </Card>
        )}

        {/* Predicciones de asistencia */}
        <Card 
          title="Predicciones de Asistencia a Eventos" 
          className="table-card"
          header={
            <div className="table-filters">
              <div className="search-input">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Buscar evento..."
                  value={filters.attendance.search}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    attendance: { ...prev.attendance, search: e.target.value }
                  }))}
                />
                {filters.attendance.search && (
                  <button
                    className="clear-search"
                    onClick={() => setFilters(prev => ({
                      ...prev,
                      attendance: { ...prev.attendance, search: '' }
                    }))}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          }
        >
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
                {filteredAttendances.length > 0 ? (
                  filteredAttendances
                    .sort((a, b) => (b.prediction || 0) - (a.prediction || 0))
                    .map((item, index) => (
                    <tr key={index}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {item.eventTitle || 'N/A'}
                          <PredictionTooltip prediction={item}>
                            <Info size={14} style={{ cursor: 'help', color: '#666' }} />
                          </PredictionTooltip>
                        </div>
                      </td>
                      <td><strong>{item.prediction || 0}</strong> personas</td>
                      <td>
                        <ConfidenceIndicator confidence={item.confidence || 0} size="small" />
                      </td>
                      <td>{item.modelType || 'N/A'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="no-data">
                      {predictions.attendances.length === 0
                        ? 'No hay predicciones disponibles. Selecciona eventos para predecir asistencias.'
                        : 'No hay resultados que coincidan con los filtros'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Predicciones de movilidad */}
        <Card 
          title="Predicciones de Demanda de Movilidad" 
          className="table-card table-card--fullwidth"
          header={
            <div className="table-filters">
              <div className="search-input">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Buscar edificio..."
                  value={filters.mobility.search}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    mobility: { ...prev.mobility, search: e.target.value }
                  }))}
                />
                {filters.mobility.search && (
                  <button
                    className="clear-search"
                    onClick={() => setFilters(prev => ({
                      ...prev,
                      mobility: { ...prev.mobility, search: '' }
                    }))}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          }
        >
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
                {filteredMobilities.length > 0 ? (
                  filteredMobilities
                    .sort((a, b) => (b.prediction || 0) - (a.prediction || 0))
                    .map((item, index) => (
                    <tr key={index}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Building2 size={16} />
                          {item.buildingName || 'N/A'}
                          <PredictionTooltip prediction={item}>
                            <Info size={14} style={{ cursor: 'help', color: '#666' }} />
                          </PredictionTooltip>
                        </div>
                      </td>
                      <td><strong>{item.prediction || 0}</strong> visitantes</td>
                      <td>
                        <ConfidenceIndicator confidence={item.confidence || 0} size="small" />
                      </td>
                      <td>{item.modelType || 'N/A'}</td>
                      <td>{item.date ? new Date(item.date).toLocaleDateString() : 'Hoy'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="no-data">
                      {predictions.mobilities.length === 0
                        ? 'No hay predicciones disponibles. Selecciona edificios para predecir demanda de movilidad.'
                        : 'No hay resultados que coincidan con los filtros'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Sección de acciones rápidas - Mejorada */}
      <div className="quick-actions">
        {/* Edificios para predicción de movilidad */}
        <Card title="Predicción de Demanda de Movilidad" className="quick-actions-card">
          <p className="section-description">
            Selecciona un edificio para obtener una predicción de su demanda de visitantes basada en patrones históricos
          </p>
          <div className="quick-action-items">
            {buildingStats.slice(0, 5).map((building, index) => {
              const hasPrediction = predictions.mobilities.some(m => 
                (m.buildingId === building._id || m.buildingId === building.buildingId)
              );
              const existingPrediction = predictions.mobilities.find(m => 
                (m.buildingId === building._id || m.buildingId === building.buildingId)
              );
              
              return (
                <div 
                  key={index} 
                  className={`quick-action-item ${hasPrediction ? 'has-prediction' : ''}`}
                >
                  <div className="item-icon">
                    <Building2 size={24} />
                  </div>
                  <div className="item-content">
                    <div className="item-header">
                      <h4 className="item-title">{building.buildingName || `Edificio ${index + 1}`}</h4>
                      {hasPrediction && (
                        <span className="prediction-badge">
                          <CheckCircle2 size={14} />
                          Predicción disponible
                        </span>
                      )}
                    </div>
                    <div className="item-stats">
                      {building.totalViews && (
                        <span className="stat-item">
                          <Activity size={12} />
                          {building.totalViews.toLocaleString()} vistas
                        </span>
                      )}
                      {building.uniqueVisitors && (
                        <span className="stat-item">
                          <Users size={12} />
                          {building.uniqueVisitors.toLocaleString()} visitantes
                        </span>
                      )}
                    </div>
                    {existingPrediction && (
                      <div className="item-prediction">
                        <span className="prediction-label">Predicción actual:</span>
                        <span className="prediction-value">
                          {existingPrediction.prediction || 0} visitantes
                        </span>
                        <ConfidenceIndicator 
                          confidence={existingPrediction.confidence || 0} 
                          size="small" 
                        />
                      </div>
                    )}
                  </div>
                  <div className="item-actions">
                    {hasPrediction ? (
                      <button
                        className="item-action-btn remove"
                        onClick={(e) => handleRemoveMobility(building._id || building.buildingId, e)}
                        title="Quitar predicción"
                      >
                        <Trash2 size={18} />
                      </button>
                    ) : (
                      <button
                        className="item-action-btn predict"
                        onClick={(e) => handlePredictMobility(building._id || building.buildingId, e)}
                        title="Predecir demanda"
                      >
                        <Zap size={20} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Eventos para predicción de asistencia */}
        <Card title="Predicción de Asistencia a Eventos" className="quick-actions-card">
          <p className="section-description">
            Selecciona un evento para obtener una predicción de asistencia basada en interés previo y patrones históricos
          </p>
          <div className="quick-action-items">
            {eventStats.slice(0, 5).map((event, index) => {
              const hasPrediction = predictions.attendances.some(a => 
                (a.eventId === event._id || a.eventId === event.eventId)
              );
              const existingPrediction = predictions.attendances.find(a => 
                (a.eventId === event._id || a.eventId === event.eventId)
              );
              
              return (
                <div 
                  key={index} 
                  className={`quick-action-item ${hasPrediction ? 'has-prediction' : ''}`}
                >
                  <div className="item-icon">
                    <Calendar size={24} />
                  </div>
                  <div className="item-content">
                    <div className="item-header">
                      <h4 className="item-title">{event.eventTitle || `Evento ${index + 1}`}</h4>
                      {hasPrediction && (
                        <span className="prediction-badge">
                          <CheckCircle2 size={14} />
                          Predicción disponible
                        </span>
                      )}
                    </div>
                    <div className="item-stats">
                      {event.totalViews && (
                        <span className="stat-item">
                          <Activity size={12} />
                          {event.totalViews.toLocaleString()} vistas
                        </span>
                      )}
                      {event.popularityScore && (
                        <span className="stat-item popularity">
                          <TrendingUp size={12} />
                          Score: {Math.round(event.popularityScore)}
                        </span>
                      )}
                      {event.date && (
                        <span className="stat-item">
                          <Calendar size={12} />
                          {new Date(event.date).toLocaleDateString('es-ES', { 
                            day: 'numeric', 
                            month: 'short' 
                          })}
                        </span>
                      )}
                    </div>
                    {existingPrediction && (
                      <div className="item-prediction">
                        <span className="prediction-label">Predicción actual:</span>
                        <span className="prediction-value">
                          {existingPrediction.prediction || 0} personas
                        </span>
                        <ConfidenceIndicator 
                          confidence={existingPrediction.confidence || 0} 
                          size="small" 
                        />
                      </div>
                    )}
                  </div>
                  <div className="item-actions">
                    {hasPrediction ? (
                      <button
                        className="item-action-btn remove"
                        onClick={(e) => handleRemoveAttendance(event._id || event.eventId, e)}
                        title="Quitar predicción"
                      >
                        <Trash2 size={18} />
                      </button>
                    ) : (
                      <button
                        className="item-action-btn predict"
                        onClick={(e) => handlePredictAttendance(event._id || event.eventId, e)}
                        title="Predecir asistencia"
                      >
                        <Users size={20} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}

