import { Tooltip } from 'recharts';
import './HoursHeatmap.scss';

export function HoursHeatmap({ 
  data = [], 
  title = '',
  subtitle = '',
  hourLabels = Array.from({ length: 24 }, (_, i) => i),
  dayLabels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
  colorScale = {
    min: '#f0f9ff',
    low: '#bae6fd',
    medium: '#7dd3fc',
    high: '#0ea5e9',
    max: '#0369a1'
  }
}) {
  if (!data || data.length === 0) {
    return (
      <div className="heatmap-empty">
        <p>No hay datos disponibles para el heatmap</p>
      </div>
    );
  }

  // Preparar datos para el heatmap (24 horas x 7 días = 168 celdas)
  const heatmapData = Array.from({ length: 7 }, (_, dayIndex) => {
    return Array.from({ length: 24 }, (_, hourIndex) => {
      const cellData = data.find(d => {
        const itemDay = d.dayOfWeek !== undefined ? d.dayOfWeek : (d.day !== undefined ? d.day : -1);
        const itemHour = d.hour !== undefined ? d.hour : -1;
        return itemDay === dayIndex && itemHour === hourIndex;
      });
      
      return {
        day: dayIndex,
        hour: hourIndex,
        value: cellData?.value || cellData?.count || cellData?.demand || 0,
        label: cellData?.label || null,
        rawData: cellData || null
      };
    });
  });

  // Calcular valores min y max para la escala de colores
  const allValues = heatmapData.flat().map(cell => cell.value);
  const minValue = Math.min(...allValues.filter(v => v > 0));
  const maxValue = Math.max(...allValues);

  // Función para obtener el color según el valor
  const getColor = (value) => {
    if (value === 0) return '#f8f9fa';
    if (value === null || value === undefined) return '#ffffff';
    
    const percentage = maxValue > 0 ? (value - minValue) / (maxValue - minValue) : 0;
    
    if (percentage < 0.2) return colorScale.min;
    if (percentage < 0.4) return colorScale.low;
    if (percentage < 0.6) return colorScale.medium;
    if (percentage < 0.8) return colorScale.high;
    return colorScale.max;
  };

  // Función para obtener el color del texto (negro o blanco según el fondo)
  const getTextColor = (value) => {
    if (value === 0) return '#999';
    const percentage = maxValue > 0 ? (value - minValue) / (maxValue - minValue) : 0;
    return percentage > 0.5 ? '#ffffff' : '#1a1a1a';
  };

  return (
    <div className="hours-heatmap">
      {title && <h4 className="heatmap-title">{title}</h4>}
      {subtitle && <p className="heatmap-subtitle">{subtitle}</p>}
      
      <div className="heatmap-container">
        {/* Leyenda de días (vertical) */}
        <div className="heatmap-days">
          <div className="heatmap-corner"></div>
          {dayLabels.map((label, index) => (
            <div key={index} className="day-label">
              {label}
            </div>
          ))}
        </div>

        {/* Contenedor principal del heatmap */}
        <div className="heatmap-content">
          {/* Leyenda de horas (horizontal) */}
          <div className="heatmap-hours">
            {hourLabels.map((hour, index) => (
              <div key={index} className="hour-label">
                {hour.toString().padStart(2, '0')}:00
              </div>
            ))}
          </div>

          {/* Celdas del heatmap */}
          <div className="heatmap-cells">
            {heatmapData.map((dayRow, dayIndex) => (
              <div key={dayIndex} className="heatmap-row">
                {dayRow.map((cell, hourIndex) => (
                  <div
                    key={`${dayIndex}-${hourIndex}`}
                    className="heatmap-cell"
                    style={{
                      backgroundColor: getColor(cell.value),
                      color: getTextColor(cell.value)
                    }}
                    title={`${dayLabels[dayIndex]}, ${hourIndex.toString().padStart(2, '0')}:00 - Valor: ${cell.value}`}
                  >
                    <div className="cell-value">{cell.value > 0 ? cell.value : ''}</div>
                    {cell.label && (
                      <div className="cell-label">{cell.label}</div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Leyenda de colores */}
      <div className="heatmap-legend">
        <span className="legend-label">Menor</span>
        <div className="legend-gradient">
          <div className="legend-color" style={{ backgroundColor: colorScale.min }}></div>
          <div className="legend-color" style={{ backgroundColor: colorScale.low }}></div>
          <div className="legend-color" style={{ backgroundColor: colorScale.medium }}></div>
          <div className="legend-color" style={{ backgroundColor: colorScale.high }}></div>
          <div className="legend-color" style={{ backgroundColor: colorScale.max }}></div>
        </div>
        <span className="legend-label">Mayor</span>
        {maxValue > 0 && (
          <span className="legend-values">
            ({minValue} - {maxValue})
          </span>
        )}
      </div>
    </div>
  );
}

