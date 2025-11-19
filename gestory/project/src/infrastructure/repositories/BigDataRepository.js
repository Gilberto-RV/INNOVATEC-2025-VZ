import { httpClient } from '../http/HttpClient.js';

export class BigDataRepository {
  /**
   * Obtener dashboard general de Big Data
   */
  async getDashboardStats(startDate = null, endDate = null) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const queryString = params.toString();
    const url = `/bigdata/dashboard${queryString ? `?${queryString}` : ''}`;
    
    const response = await httpClient.get(url);
    return response.data;
  }

  /**
   * Obtener estadísticas de edificios
   */
  async getBuildingStats(filters = {}) {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.buildingId) params.append('buildingId', filters.buildingId);
    
    const queryString = params.toString();
    const url = `/bigdata/stats/buildings${queryString ? `?${queryString}` : ''}`;
    
    const response = await httpClient.get(url);
    return response.data;
  }

  /**
   * Obtener estadísticas de eventos
   */
  async getEventStats(filters = {}) {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.status) params.append('status', filters.status);
    
    const queryString = params.toString();
    const url = `/bigdata/stats/events${queryString ? `?${queryString}` : ''}`;
    
    const response = await httpClient.get(url);
    return response.data;
  }

  /**
   * Ejecutar procesamiento por lotes manualmente
   */
  async runBatchProcessing() {
    const response = await httpClient.post('/bigdata/batch/process');
    return response.data;
  }
}

