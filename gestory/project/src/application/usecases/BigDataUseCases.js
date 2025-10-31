import { BigDataRepository } from '../../infrastructure/repositories/BigDataRepository.js';

export class BigDataUseCases {
  constructor() {
    this.repository = new BigDataRepository();
  }

  /**
   * Obtener dashboard completo de Big Data
   */
  async getDashboardStats(startDate = null, endDate = null) {
    try {
      const result = await this.repository.getDashboardStats(startDate, endDate);
      return result.data;
    } catch (error) {
      console.error('Error obteniendo dashboard de Big Data:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de usuarios
   */
  async getUserActivityStats(filters = {}) {
    try {
      const result = await this.repository.getUserActivityStats(filters);
      return result.data;
    } catch (error) {
      console.error('Error obteniendo estadísticas de usuarios:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de edificios
   */
  async getBuildingStats(filters = {}) {
    try {
      const result = await this.repository.getBuildingStats(filters);
      return result.data;
    } catch (error) {
      console.error('Error obteniendo estadísticas de edificios:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de eventos
   */
  async getEventStats(filters = {}) {
    try {
      const result = await this.repository.getEventStats(filters);
      return result.data;
    } catch (error) {
      console.error('Error obteniendo estadísticas de eventos:', error);
      throw error;
    }
  }

  /**
   * Ejecutar procesamiento por lotes
   */
  async runBatchProcessing() {
    try {
      const result = await this.repository.runBatchProcessing();
      return result;
    } catch (error) {
      console.error('Error ejecutando procesamiento por lotes:', error);
      throw error;
    }
  }
}

