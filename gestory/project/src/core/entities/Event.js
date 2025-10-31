export class Event {
  constructor({
    _id,
    title,
    description,
    building_assigned,
    classroom,
    date_time,
    organizer,
    category,
    status = 'programado',
    media
  }) {
    this.id = _id;
    this.title = title;
    this.description = description;
    this.building_assigned = building_assigned; 
    this.classroom = classroom;
    this.date_time = date_time;
    this.organizer = organizer;
    this.category = category;
    this.status = status; 
    this.media = media || null;// programado, en_curso, finalizado, cancelado
  }

  getStatusClass() {
    const states = {
      programado: 'programado',
      en_curso: 'en curso',
      finalizado: 'finalizado',
      cancelado: 'cancelado'
    };
    return states[this.status] || '';
  }
}
