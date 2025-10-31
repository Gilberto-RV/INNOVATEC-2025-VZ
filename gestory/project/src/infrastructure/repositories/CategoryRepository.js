// repositories/CategoryRepository.js
import { httpClient } from '../http/HttpClient.js';

export class CategoryRepository {
  async getAll() {
    const response = await httpClient.get('/categories');
    return response.data;
  }
}
