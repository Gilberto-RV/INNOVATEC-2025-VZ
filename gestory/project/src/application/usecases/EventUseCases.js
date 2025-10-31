import { EventRepository } from '../../infrastructure/repositories/EventRepository.js';
import { Event } from '../../core/entities/Event.js';
import { BuildingRepository } from '../../infrastructure/repositories/BuildingRepository.js';
import { CategoryRepository } from '../../infrastructure/repositories/CategoryRepository.js';

export class EventUseCases {
  constructor() {
    this.eventRepository = new EventRepository();
    this.buildingRepository = new BuildingRepository();
    this.categoryRepository = new CategoryRepository();
  }

  async getBuildings() {
    return await this.buildingRepository.getAll();
  }

  async getCategories() {
    return await this.categoryRepository.getAll();
  }

  async getAllEvents(filters = {}) {
    const response = await this.eventRepository.getAll(filters);
    return response.events?.map(ev => new Event(ev)) || [];
  }

  async getEventById(id) {
    const response = await this.eventRepository.getById(id);
    return new Event(response.event);
  }

  async createEvent(eventData) {
    const response = await this.eventRepository.create(eventData);
    return new Event(response.event);
  }

  async updateEvent(id, eventData) {
    const response = await this.eventRepository.update(id, eventData);
    return new Event(response.event);
  }

  async deleteEvent(id) {
    return this.eventRepository.delete(id);
  }
}
