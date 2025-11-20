import './SkeletonLoader.scss';

export function SkeletonLoader({ 
  type = 'card', // 'card', 'table', 'chart', 'stat'
  count = 1 
}) {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className="skeleton skeleton-card">
            <div className="skeleton-header">
              <div className="skeleton-line skeleton-title" />
            </div>
            <div className="skeleton-content">
              <div className="skeleton-line skeleton-large" />
              <div className="skeleton-line skeleton-medium" />
              <div className="skeleton-line skeleton-small" />
            </div>
          </div>
        );
      
      case 'stat':
        return (
          <div className="skeleton skeleton-stat">
            <div className="skeleton-icon" />
            <div className="skeleton-info">
              <div className="skeleton-line skeleton-large" />
              <div className="skeleton-line skeleton-small" />
            </div>
          </div>
        );
      
      case 'table':
        return (
          <div className="skeleton skeleton-table">
            <div className="skeleton-table-header">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="skeleton-line skeleton-header-cell" />
              ))}
            </div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton-table-row">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="skeleton-line skeleton-cell" />
                ))}
              </div>
            ))}
          </div>
        );
      
      case 'chart':
        return (
          <div className="skeleton skeleton-chart">
            <div className="skeleton-line skeleton-title" />
            <div className="skeleton-chart-area" />
          </div>
        );
      
      default:
        return (
          <div className="skeleton skeleton-default">
            <div className="skeleton-line" />
            <div className="skeleton-line" />
            <div className="skeleton-line" />
          </div>
        );
    }
  };

  if (count === 1) {
    return renderSkeleton();
  }

  return (
    <div className="skeleton-container">
      {[...Array(count)].map((_, index) => (
        <div key={index}>{renderSkeleton()}</div>
      ))}
    </div>
  );
}

