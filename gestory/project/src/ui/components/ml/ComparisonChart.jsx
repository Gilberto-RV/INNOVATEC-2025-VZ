import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import './ComparisonChart.scss';

export function ComparisonChart({ 
  data = [], 
  type = 'line', // 'line' o 'bar'
  title = '',
  predictedKey = 'predicted',
  actualKey = 'actual',
  dateKey = 'date',
  showPredictionLine = true,
  showActualLine = true
}) {
  if (!data || data.length === 0) {
    return (
      <div className="comparison-chart-empty">
        <p>No hay datos disponibles para comparar</p>
      </div>
    );
  }

  // Preparar datos para el gráfico
  const chartData = data.map(item => ({
    date: item[dateKey] || item.date || 'N/A',
    predicted: item[predictedKey] || item.predicted || 0,
    actual: item[actualKey] || item.actual || null,
    // Calcular diferencia
    difference: item[actualKey] ? (item[actualKey] - (item[predictedKey] || 0)) : null,
    // Calcular porcentaje de error
    errorPercent: item[actualKey] && item[predictedKey] 
      ? Math.abs(((item[actualKey] - item[predictedKey]) / item[predictedKey]) * 100).toFixed(1)
      : null
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="comparison-tooltip">
          <p className="tooltip-date">{data.date}</p>
          {data.predicted !== null && (
            <p className="tooltip-predicted">
              Predicción: <strong>{data.predicted}</strong>
            </p>
          )}
          {data.actual !== null && (
            <p className="tooltip-actual">
              Real: <strong>{data.actual}</strong>
            </p>
          )}
          {data.difference !== null && (
            <p className={`tooltip-difference ${data.difference >= 0 ? 'positive' : 'negative'}`}>
              Diferencia: {data.difference > 0 ? '+' : ''}{data.difference}
            </p>
          )}
          {data.errorPercent !== null && (
            <p className="tooltip-error">
              Error: {data.errorPercent}%
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="comparison-chart">
      {title && <h4 className="chart-title">{title}</h4>}
      <ResponsiveContainer width="100%" height={300}>
        {type === 'line' ? (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 11 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {showPredictionLine && (
              <Line 
                type="monotone" 
                dataKey="predicted" 
                stroke="#8884d8" 
                strokeWidth={2}
                name="Predicción"
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            )}
            {showActualLine && (
              <Line 
                type="monotone" 
                dataKey="actual" 
                stroke="#82ca9d" 
                strokeWidth={2}
                name="Real"
                strokeDasharray="5 5"
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            )}
          </LineChart>
        ) : (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 11 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {showPredictionLine && (
              <Bar 
                dataKey="predicted" 
                fill="#8884d8" 
                name="Predicción"
                radius={[4, 4, 0, 0]}
              />
            )}
            {showActualLine && (
              <Bar 
                dataKey="actual" 
                fill="#82ca9d" 
                name="Real"
                radius={[4, 4, 0, 0]}
              />
            )}
          </BarChart>
        )}
      </ResponsiveContainer>
      
      {/* Estadísticas resumidas */}
      {chartData.some(d => d.actual !== null) && (
        <div className="comparison-stats">
          <div className="stat-item">
            <span className="stat-label">Precisión promedio:</span>
            <span className="stat-value">
              {(() => {
                const errors = chartData
                  .filter(d => d.actual !== null && d.predicted !== null)
                  .map(d => parseFloat(d.errorPercent));
                if (errors.length === 0) return 'N/A';
                const avgError = errors.reduce((a, b) => a + b, 0) / errors.length;
                return `${(100 - avgError).toFixed(1)}%`;
              })()}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Predicciones comparadas:</span>
            <span className="stat-value">
              {chartData.filter(d => d.actual !== null).length} de {chartData.length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

