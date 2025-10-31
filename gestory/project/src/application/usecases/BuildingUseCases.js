import { BuildingRepository } from '../../infrastructure/repositories/BuildingRepository.js';
import { Building } from '../../core/entities/Building.js';

export class BuildingUseCases {
  constructor() {
    this.buildingRepository = new BuildingRepository();
  }

  async getAllBuildings() {
    const response = await this.buildingRepository.getAll();
    
    console.log('📦 Datos recibidos de getAllBuildings():', response);

    // Mapeamos directamente el array recibido
    return Array.isArray(response) ? response.map(building => new Building(building)) : [];
    
  }
  async getBuildingById(id) {
    const response = await this.buildingRepository.getById(id);
    return new Building(response.building);
  }

  async updateBuilding(id, edificioData) {
    const response = await this.buildingRepository.update(id, edificioData);
    return new Building(response.building);
  }

  async uploadImage(id, file) {
    const formData = new FormData();
    formData.append('media', file);
    return this.buildingRepository.uploadImage(id, formData);
  }

  getBuildingDisponibles(buildings) {
    console.log('Todos los edificios:', buildings);
    console.log('Disponibles:', buildingUseCases.getBuildingDisponibles(buildings));

    return buildings.filter(building => building.isDisponible());
  }
}