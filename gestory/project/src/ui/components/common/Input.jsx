import { forwardRef } from 'react';
import './Input.scss';

export const Input = forwardRef(function Input({
  label,
  error,
  helper,
  icon,
  className = '',
  ...props
}, ref) {
  const inputClasses = [
    'input',
    error && 'input--error',
    icon && 'input--with-icon',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="input-group">
      {label && <label className="input-label">{label}</label>}
      <div className="input-wrapper">
        {icon && <span className="input-icon">{icon}</span>}
        <input
          ref={ref}
          className={inputClasses}
          {...props}
        />
      </div>
      {error && <span className="input-error">{error}</span>}
      {helper && !error && <span className="input-helper">{helper}</span>}
    </div>
  );
});