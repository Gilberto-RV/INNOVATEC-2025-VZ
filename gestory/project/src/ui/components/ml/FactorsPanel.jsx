import { Info, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import './FactorsPanel.scss';

export function FactorsPanel({ factors = [], title = 'Factores que influyen en la predicción' }) {
  if (!factors || factors.length === 0) {
    return (
      <div className="factors-panel-empty">
        <p>No hay información de factores disponible</p>
      </div>
    );
  }

  // Ordenar factores por impacto (descendente)
  const sortedFactors = [...factors].sort((a, b) => {
    const impactOrder = { 'Alto': 3, 'Medio': 2, 'Bajo': 1 };
    return (impactOrder[b.impact] || 0) - (impactOrder[a.impact] || 0);
  });

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'Alto':
        return '#FF8042';
      case 'Medio':
        return '#FFBB28';
      case 'Bajo':
        return '#00C49F';
      default:
        return '#888';
    }
  };

  const getImpactIcon = (impact) => {
    switch (impact) {
      case 'Alto':
        return <TrendingUp size={16} />;
      case 'Medio':
        return <Minus size={16} />;
      case 'Bajo':
        return <TrendingDown size={16} />;
      default:
        return <Info size={16} />;
    }
  };

  return (
    <div className="factors-panel">
      {title && <h4 className="factors-title">{title}</h4>}
      <div className="factors-list">
        {sortedFactors.map((factor, index) => (
          <div key={index} className="factor-item">
            <div className="factor-header">
              <div className="factor-name">
                <span className="factor-icon">{getImpactIcon(factor.impact)}</span>
                <div className="factor-title-group">
                  <span className="factor-label">{factor.name}</span>
                  {factor.description && (
                    <p className="factor-description-short">{factor.description}</p>
                  )}
                </div>
              </div>
              <span 
                className={`factor-impact impact-${factor.impact?.toLowerCase()}`}
                style={{ 
                  color: getImpactColor(factor.impact),
                  backgroundColor: `${getImpactColor(factor.impact)}20`
                }}
              >
                {factor.impact || 'N/A'}
              </span>
            </div>
            
            <div className="factor-content">
              {factor.value !== undefined && (
                <div className="factor-value">
                  <div className="value-display">
                    <span className="value-number">{factor.value}</span>
                    {factor.unit && <span className="value-unit">{factor.unit}</span>}
                  </div>
                  <span className="value-label">Valor actual</span>
                </div>
              )}
              
              {factor.weight !== undefined && (
                <div className="factor-weight">
                  <div className="weight-header">
                    <span className="weight-label">Nivel de influencia</span>
                    <span className="weight-percentage">
                      {(factor.weight * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="weight-bar">
                    <div 
                      className="weight-fill"
                      style={{ 
                        width: `${Math.min(100, factor.weight * 100)}%`,
                        backgroundColor: getImpactColor(factor.impact)
                      }}
                    />
                  </div>
                  <div className="weight-explanation">
                    {factor.weight >= 0.3 && 'Factor muy influyente en la predicción'}
                    {factor.weight >= 0.2 && factor.weight < 0.3 && 'Factor moderadamente influyente'}
                    {factor.weight < 0.2 && 'Factor con menor influencia'}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

