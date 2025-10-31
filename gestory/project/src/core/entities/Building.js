export class Building {
  constructor({
    id,
    name,
    description,
    accessibility = false,
    floors = 1,
    media,
    availability = false,
    student_frequency = false,
    id_services = [],  // ← cambiar
    bathrooms = {},
    entrances = [],
    id_careers = [],   // ← cambiar
    subjects = [],     // ← cambiar
    last_updated = null,
  }) {
    this.id = id || id; // o geo_id si quieres
    this.name = name;
    this.description = description;
    this.accessibility = accessibility;
    this.floors = floors;
    this.media = media;
    this.availability = availability === true || availability === 'true' || availability === 1;
    this.student_frequency = student_frequency;
    this.bathrooms = bathrooms;
    this.entrances = entrances;
    // Mapear correctamente
    this.services = id_services.map(s => ({
      id: s._id || s.id,
      name: s.name
    }));
    this.careers = id_careers.map(c => ({
      id: c._id || c.id,
      name: c.name,
      code: c.code
    }));
    this.subject = subjects.map(sub => ({
      id: sub._id,
      name: sub.name,
      type: sub.id_subjects?.type,
      floor: sub.floor
    }));
    this.last_updated = last_updated;
  }

  isDisponible() {
    return this.availability;
  }
}
