import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import './ConfidenceIndicator.scss';

export function ConfidenceIndicator({ confidence, showLabel = true, size = 'medium' }) {
  const percentage = Math.round(confidence * 100);
  const level = confidence >= 0.7 ? 'high' : confidence >= 0.5 ? 'medium' : 'low';
  
  const getIcon = () => {
    switch (level) {
      case 'high':
        return <CheckCircle2 size={size === 'small' ? 14 : 16} />;
      case 'medium':
        return <AlertTriangle size={size === 'small' ? 14 : 16} />;
      case 'low':
        return <XCircle size={size === 'small' ? 14 : 16} />;
      default:
        return null;
    }
  };

  return (
    <div className={`confidence-indicator confidence-${level} confidence-${size}`}>
      <div className="confidence-bar">
        <div 
          className={`confidence-fill confidence-fill-${level}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <span className="confidence-label">
          {getIcon()}
          <span className="confidence-percentage">{percentage}%</span>
        </span>
      )}
    </div>
  );
}

