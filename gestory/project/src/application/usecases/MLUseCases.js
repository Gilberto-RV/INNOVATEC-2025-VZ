import { MLRepository } from '../../infrastructure/repositories/MLRepository.js';

export class MLUseCases {
  constructor() {
    this.repository = new MLRepository();
  }

  /**
   * Obtener predicción de asistencia para un evento
   */
  async getAttendancePrediction(eventId) {
    try {
      const result = await this.repository.getAttendancePrediction(eventId);
      return result.data;
    } catch (error) {
      console.error('Error obteniendo predicción de asistencia:', error);
      throw error;
    }
  }

  /**
   * Obtener predicciones para múltiples eventos
   */
  async getBatchPredictions(eventIds) {
    try {
      const result = await this.repository.getBatchPredictions(eventIds);
      return result.data;
    } catch (error) {
      console.error('Error obteniendo predicciones batch:', error);
      throw error;
    }
  }

  /**
   * Obtener predicción de demanda de movilidad
   */
  async getMobilityPrediction(buildingId, date = null) {
    try {
      const result = await this.repository.getMobilityPrediction(buildingId, date);
      return result.data;
    } catch (error) {
      console.error('Error obteniendo predicción de movilidad:', error);
      throw error;
    }
  }

  /**
   * Obtener predicción de saturación
   */
  async getSaturationPrediction(type, id, date = null) {
    try {
      const result = await this.repository.getSaturationPrediction(type, id, date);
      // Verificar que la respuesta sea exitosa y tenga datos
      if (!result || !result.data) {
        throw new Error('No se pudo obtener la predicción de saturación');
      }
      return result.data;
    } catch (error) {
      // Re-lanzar el error para que el componente pueda manejarlo
      // No registrar errores 404 aquí, se manejan en el componente
      if (error?.response?.status !== 404 && error?.status !== 404) {
        console.error('Error obteniendo predicción de saturación:', error.message);
      }
      throw error;
    }
  }

  /**
   * Verificar estado del ML Service
   */
  async checkMLServiceStatus() {
    try {
      const result = await this.repository.checkMLServiceStatus();
      return result.data;
    } catch (error) {
      console.error('Error verificando ML Service:', error);
      throw error;
    }
  }

  /**
   * Obtener lista completa de edificios
   */
  async getAllBuildings() {
    try {
      const result = await this.repository.getAllBuildings();
      return result.data || result;
    } catch (error) {
      console.error('Error obteniendo lista de edificios:', error);
      throw error;
    }
  }

  /**
   * Obtener lista completa de eventos
   */
  async getAllEvents() {
    try {
      const result = await this.repository.getAllEvents();
      return result.data || result;
    } catch (error) {
      console.error('Error obteniendo lista de eventos:', error);
      throw error;
    }
  }
}

