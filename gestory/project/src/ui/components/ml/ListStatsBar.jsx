import { Building2, Calendar, Zap, CheckCircle2, Search } from 'lucide-react';
import './ListStatsBar.scss';

export function ListStatsBar({ type, total, filtered, withPredictions }) {
  const Icon = type === 'building' ? Building2 : Calendar;
  const label = type === 'building' ? 'Edificios' : 'Eventos';
  
  return (
    <div className="list-stats-bar">
      <div className="stat-item primary">
        <Icon size={16} />
        <span className="stat-value">{total}</span>
        <span className="stat-label">{label} totales</span>
      </div>
      
      {filtered < total && (
        <div className="stat-item filtered">
          <Search size={16} />
          <span className="stat-value">{filtered}</span>
          <span className="stat-label">Filtrados</span>
        </div>
      )}
      
      <div className="stat-item predictions">
        <CheckCircle2 size={16} />
        <span className="stat-value">{withPredictions}</span>
        <span className="stat-label">Con predicción</span>
      </div>
      
      <div className="stat-item available">
        <Zap size={16} />
        <span className="stat-value">{filtered - withPredictions}</span>
        <span className="stat-label">Disponibles</span>
      </div>
    </div>
  );
}

