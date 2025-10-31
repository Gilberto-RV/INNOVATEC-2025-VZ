import './Card.scss';

export function Card({ 
  title, 
  children, 
  className = '', 
  header,
  footer,
  padding = true 
}) {
  const cardClasses = [
    'card',
    !padding && 'card--no-padding',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClasses}>
      {(title || header) && (
        <div className="card-header">
          {title && <h3 className="card-title">{title}</h3>}
          {header}
        </div>
      )}
      <div className="card-content">
        {children}
      </div>
      {footer && (
        <div className="card-footer">
          {footer}
        </div>
      )}
    </div>
  );
}