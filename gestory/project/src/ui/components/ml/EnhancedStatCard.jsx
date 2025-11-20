import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card } from '../common/Card.jsx';
import './EnhancedStatCard.scss';

export function EnhancedStatCard({ 
  title, 
  value, 
  previous, 
  trend, 
  icon, 
  color,
  subtitle 
}) {
  // Calcular cambio porcentual si hay valor previo
  const change = previous !== undefined && previous !== null && previous !== 0
    ? ((value - previous) / previous * 100).toFixed(1)
    : null;
  
  const isPositive = trend === 'up' || (change !== null && change > 0);
  const isNeutral = trend === 'neutral' || (change !== null && Math.abs(change) < 1);
  
  return (
    <Card className={`stat-card stat-card--${color}`}>
      <div className="stat-content">
        <div className="stat-icon">
          {icon}
        </div>
        <div className="stat-info">
          <div className="stat-header">
            <h3 className="stat-value">{value}</h3>
            {change !== null && (
              <span className={`trend-indicator ${isPositive ? 'up' : isNeutral ? 'neutral' : 'down'}`}>
                {isPositive ? (
                  <TrendingUp size={16} />
                ) : isNeutral ? (
                  <Minus size={16} />
                ) : (
                  <TrendingDown size={16} />
                )}
                <span className="trend-percentage">
                  {Math.abs(change)}%
                </span>
              </span>
            )}
          </div>
          <p className="stat-title">{title}</p>
          {previous !== undefined && previous !== null && (
            <p className="stat-comparison">
              vs. anterior: {previous}
            </p>
          )}
          {subtitle && (
            <p className="stat-subtitle">{subtitle}</p>
          )}
        </div>
      </div>
    </Card>
  );
}

