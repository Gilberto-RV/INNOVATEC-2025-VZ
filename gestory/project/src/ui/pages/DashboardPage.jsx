import { useState, useEffect } from 'react';
import { Calendar, Building2, Users, TrendingUp } from 'lucide-react';
import { Card } from '../components/common/Card.jsx';
import { EventUseCases } from '../../application/usecases/EventUseCases.js';
import { BuildingUseCases } from '../../application/usecases/BuildingUseCases.js';
import './DashboardPage.scss';

const eventoUseCases = new EventUseCases();
const buildingUseCases = new BuildingUseCases();

export function DashboardPage() {
  const [stats, setStats] = useState({
    totalEventos: 0,
    eventosProximos: 0,
    buildingsDisponibles: 0,
    ocupacionPromedio: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [eventosStats, buildings] = await Promise.all([
        eventoUseCases.getEstadisticas(),
        buildingUseCases.getAllBuildings()
      ]);

      // Debug para verificar disponibilidad
      buildings.forEach(b => console.log(b.name, b.availability, b.isDisponible()));

      const buildingsDisponibles = buildingUseCases.getBuildingDisponibles(buildings);

      setStats({
        totalEventos: eventosStats.total || 0,
        eventosProximos: eventosStats.proximos || 0,
        buildingsDisponibles: buildingsDisponibles.length,
        ocupacionPromedio: eventosStats.ocupacionPromedio || 0
      });
    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: 'Total de Eventos',
      value: stats.totalEventos,
      icon: <Calendar size={24} />,
      color: 'blue',
      change: '+12%'
    },
    {
      title: 'Eventos Próximos',
      value: stats.eventosProximos,
      icon: <TrendingUp size={24} />,
      color: 'green',
      change: '+8%'
    },
    {
      title: 'Edificios Disponibles',
      value: stats.buildingsDisponibles,
      icon: <Building2 size={24} />,
      color: 'purple',
      change: '+0%'
    },
    {
      title: 'Ocupación Promedio',
      value: `${stats.ocupacionPromedio}%`,
      icon: <Users size={24} />,
      color: 'orange',
      change: '+5%'
    }
  ];

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="page-header">
          <h1>Panel de Control</h1>
        </div>
        <div className="loading-message">Cargando estadísticas...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>Panel de Control</h1>
        <p>Resumen general del sistema de gestión de eventos</p>
      </div>

      <div className="stats-grid">
        {statsCards.map((stat, index) => (
          <Card key={index} className={`stat-card stat-card--${stat.color}`}>
            <div className="stat-content">
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-info">
                <h3 className="stat-value">{stat.value}</h3>
                <p className="stat-title">{stat.title}</p>
                <span className={`stat-change ${stat.change.startsWith('+') ? 'positive' : 'neutral'}`}>
                  {stat.change} vs mes anterior
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="dashboard-content">
        <div className="dashboard-row">
          <Card title="Eventos Recientes" className="recent-events">
            <div className="events-list">
              <p>Conectando con la API para mostrar eventos recientes...</p>
            </div>
          </Card>

          <Card title="Estado de Edificios" className="building-status">
            <div className="buildings-overview">
              <p>Conectando con la API para mostrar estado de edificios...</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
