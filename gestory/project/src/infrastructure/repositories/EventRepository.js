import { httpClient } from "../http/HttpClient.js";

export class EventRepository {
  async getAll(filters = {}) {
    const response = await httpClient.get("/events", { params: filters });
    return response.data; // backend ya devuelve { events }
  }

  async getById(id) {
    const response = await httpClient.get(`/events/${id}`);
    return response.data; // backend devuelve { event }
  }

  async create(eventData) {
    const response = await httpClient.post("/events", eventData);
    return response.data;
  }

  async update(id, eventData) {
    const response = await httpClient.put(`/events/${id}`, eventData);
    return response.data;
  }

  async delete(id) {
    const response = await httpClient.delete(`/events/${id}`);
    return response.data;
  }
}
