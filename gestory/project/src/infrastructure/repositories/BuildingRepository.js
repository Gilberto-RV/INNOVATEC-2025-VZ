import { httpClient } from '../http/HttpClient.js';

export class BuildingRepository {
  async getAll() {
    const response = await httpClient.get('/buildings');
    return response.data;
  }

  async getById(id) {
    const response = await httpClient.get(`/buildings/${id}`);
    return response.data;
  }

  async update(id, edificio) {
    const response = await httpClient.put(`/buildings/${id}`, edificio);
    return response.data;
  }

  async uploadImage(id, formData) {
    const response = await httpClient.post(`/buildings/${id}/media`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }

  async getServices() {
    const response = await httpClient.get('/services');
    return response.data;
  }

  async getCareers() {
    const response = await httpClient.get('/careers');
    return response.data;
  }

  async getSubject() {
    const response = await httpClient.get('/subject');
    return response.data;
  }
}