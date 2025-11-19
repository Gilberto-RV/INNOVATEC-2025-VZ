import { httpClient } from '../http/HttpClient.js';

export class MLRepository {
  /**
   * Obtener predicción de asistencia para un evento
   */
  async getAttendancePrediction(eventId) {
    const response = await httpClient.get(`/bigdata/predict/attendance/${eventId}`);
    return response.data;
  }

  /**
   * Obtener predicciones para múltiples eventos
   */
  async getBatchPredictions(eventIds) {
    const response = await httpClient.post('/bigdata/predict/batch', { eventIds });
    return response.data;
  }

  /**
   * Obtener predicción de demanda de movilidad para un edificio
   */
  async getMobilityPrediction(buildingId, date = null) {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    
    const queryString = params.toString();
    const url = `/bigdata/predict/mobility/${buildingId}${queryString ? `?${queryString}` : ''}`;
    
    const response = await httpClient.get(url);
    return response.data;
  }

  /**
   * Obtener predicción de saturación para un edificio o evento
   */
  async getSaturationPrediction(type, id, date = null) {
    // type: 'building' o 'event'
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    
    const queryString = params.toString();
    const url = `/bigdata/predict/saturation/${type}/${id}${queryString ? `?${queryString}` : ''}`;
    
    const response = await httpClient.get(url);
    return response.data;
  }

  /**
   * Verificar estado del ML Service
   */
  async checkMLServiceStatus() {
    const response = await httpClient.get('/bigdata/ml/status');
    return response.data;
  }
}

