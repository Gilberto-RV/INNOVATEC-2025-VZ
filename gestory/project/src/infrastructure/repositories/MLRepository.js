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
    
    try {
      const response = await httpClient.get(url);
      // Verificar que la respuesta tenga éxito y datos
      if (response?.data?.success === false) {
        const error = new Error(response.data.message || 'No se pudo obtener la predicción');
        error.status = response.status || 404;
        error.response = { status: response.status || 404, data: response.data };
        throw error;
      }
      return response.data;
    } catch (error) {
      // Si es un error 404 (Axios), preservar el status para que el componente lo maneje silenciosamente
      if (error?.response?.status === 404 || error?.status === 404) {
        const notFoundError = new Error(error.response?.data?.message || 'Edificio/Evento no encontrado');
        notFoundError.status = 404;
        notFoundError.response = error.response || { status: 404, data: { message: 'No encontrado' } };
        throw notFoundError;
      }
      // Para otros errores, re-lanzar normalmente
      throw error;
    }
  }

  /**
   * Verificar estado del ML Service
   */
  async checkMLServiceStatus() {
    const response = await httpClient.get('/bigdata/ml/status');
    return response.data;
  }

  /**
   * Obtener lista completa de edificios
   */
  async getAllBuildings() {
    const response = await httpClient.get('/buildings');
    // El backend devuelve directamente un array de edificios
    return response.data;
  }

  /**
   * Obtener lista completa de eventos
   */
  async getAllEvents() {
    const response = await httpClient.get('/events');
    // El backend devuelve { events: [...] }
    // Si la respuesta tiene la propiedad 'events', devolverla, si no, devolver data directamente
    if (response.data && response.data.events) {
      return response.data.events;
    }
    return response.data;
  }
}

