import { Info, HelpCircle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import './InfoTooltip.scss';

export function InfoTooltip({ 
  content, 
  title,
  type = 'info', // 'info', 'help', 'warning', 'success'
  position = 'top', // 'top', 'bottom', 'left', 'right'
  size = 'medium', // 'small', 'medium', 'large'
  children,
  className = ''
}) {
  const [isVisible, setIsVisible] = useState(false);

  const getIcon = () => {
    switch (type) {
      case 'warning':
        return <AlertCircle size={14} />;
      case 'success':
        return <CheckCircle2 size={14} />;
      case 'help':
        return <HelpCircle size={14} />;
      default:
        return <Info size={14} />;
    }
  };

  const getTypeClass = () => {
    return `tooltip-${type}`;
  };

  return (
    <div 
      className={`info-tooltip-wrapper ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children || (
        <button 
          type="button"
          className={`tooltip-trigger tooltip-trigger--${size} ${getTypeClass()}`}
          aria-label="Información adicional"
        >
          {getIcon()}
        </button>
      )}
      
      {isVisible && (
        <div className={`tooltip-content tooltip-content--${position} tooltip-content--${size} ${getTypeClass()}`}>
          {title && (
            <div className="tooltip-header">
              <span className="tooltip-icon">{getIcon()}</span>
              <h5 className="tooltip-title">{title}</h5>
            </div>
          )}
          <div className="tooltip-body">
            {typeof content === 'string' ? (
              <p>{content}</p>
            ) : (
              content
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function PredictionTooltip({ prediction, children }) {
  const content = (
    <div className="prediction-tooltip-content">
      <div className="tooltip-section">
        <strong>Valor Predicho:</strong> {prediction?.prediction || prediction?.value || 'N/A'}
      </div>
      {prediction?.confidence !== undefined && (
        <div className="tooltip-section">
          <strong>Confianza:</strong> {Math.round(prediction.confidence * 100)}%
          <div className="confidence-bar-mini">
            <div 
              className="confidence-fill-mini"
              style={{ width: `${prediction.confidence * 100}%` }}
            />
          </div>
        </div>
      )}
      {prediction?.modelType && (
        <div className="tooltip-section">
          <strong>Modelo:</strong> {prediction.modelType}
        </div>
      )}
      {prediction?.date && (
        <div className="tooltip-section">
          <strong>Fecha:</strong> {new Date(prediction.date).toLocaleDateString()}
        </div>
      )}
      {prediction?.factors && prediction.factors.length > 0 && (
        <div className="tooltip-section">
          <strong>Factores clave:</strong>
          <ul className="factors-list">
            {prediction.factors.slice(0, 3).map((factor, index) => (
              <li key={index}>{factor}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  return (
    <InfoTooltip
      content={content}
      title="Detalles de la Predicción"
      type="info"
      size="large"
    >
      {children}
    </InfoTooltip>
  );
}

export function SaturationTooltip({ saturation, children }) {
  const getLevelColor = (level) => {
    switch (level) {
      case 3: return '#FF0000'; // Alta
      case 2: return '#FF8042'; // Media
      case 1: return '#FFBB28'; // Baja
      default: return '#00C49F'; // Normal
    }
  };

  const getLevelDescription = (level) => {
    switch (level) {
      case 3: return 'Saturación alta. Se recomienda tomar medidas urgentes.';
      case 2: return 'Saturación media. Monitorear de cerca.';
      case 1: return 'Saturación baja. Condiciones normales.';
      default: return 'Saturación normal. No se requiere acción.';
    }
  };

  const content = (
    <div className="saturation-tooltip-content">
      <div className="tooltip-section">
        <strong>Nivel:</strong> 
        <span 
          className="level-badge"
          style={{ 
            color: getLevelColor(saturation?.saturationLevel),
            backgroundColor: `${getLevelColor(saturation?.saturationLevel)}20`
          }}
        >
          {saturation?.saturationLabel || 'Normal'}
        </span>
      </div>
      <div className="tooltip-section">
        <p>{getLevelDescription(saturation?.saturationLevel)}</p>
      </div>
      {saturation?.confidence !== undefined && (
        <div className="tooltip-section">
          <strong>Confianza:</strong> {Math.round(saturation.confidence * 100)}%
        </div>
      )}
      {saturation?.predictedVisitors && (
        <div className="tooltip-section">
          <strong>Visitantes previstos:</strong> {saturation.predictedVisitors}
        </div>
      )}
    </div>
  );

  return (
    <InfoTooltip
      content={content}
      title="Información de Saturación"
      type={saturation?.saturationLevel >= 2 ? 'warning' : 'info'}
      size="large"
    >
      {children}
    </InfoTooltip>
  );
}

