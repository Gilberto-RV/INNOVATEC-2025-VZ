import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { Card } from '../components/common/Card.jsx';
import { Button } from '../components/common/Button.jsx';
import { Modal } from '../components/common/Modal.jsx';
import { EventForm } from '../components/forms/EventForm.jsx';
import { EventUseCases } from '../../application/usecases/EventUseCases.js';
import { Plus } from 'lucide-react';
import './CalendarioPage.scss';
import 'react-calendar/dist/Calendar.css';

const eventUseCases = new EventUseCases();

export function CalendarioPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [eventsDay, setEventsDay] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    filterEventsDate(selectedDate);
  }, [selectedDate, events]);

  const loadEvents = async () => {
    try {
      // Asegúrate que EventUseCases tenga un método getAll (o cambia el nombre si es distinto)
      const eventsData = await eventUseCases.getAllEvents();
      setEvents(eventsData);
    } catch (error) {
      console.error('Error cargando eventos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterEventsDate = (date) => {
    const fechaStr = date.toDateString();
    const filters = events.filter(
      (evento) => new Date(evento.fecha_hora).toDateString() === fechaStr
    );
    setEventsDay(filters);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleCreateEvent = () => {
    setShowModal(true);
  };

  const handleEventoSaved = () => {
    setShowModal(false);
    loadEvents();
  };

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const fechaStr = date.toDateString();
      const eventsInDate = events.filter(
        (event) => new Date(event.date_time ).toDateString() === fechaStr
      );
      if (eventsInDate.length > 0) {
        return (
          <div className="calendar-events-indicator">
            <span className="events-count">{eventsInDate.length}</span>
          </div>
        );
      }
    }
    return null;
  };

  if (loading) {
    return (
      <div className="calendario-page">
        <div className="page-header">
          <h1>Calendario</h1>
        </div>
        <div className="loading-message">Cargando calendario...</div>
      </div>
    );
  }

  return (
    <div className="calendario-page">
      <div className="page-header">
        <div>
          <h1>Calendario de Eventos</h1>
          <p>Visualiza y gestiona eventos por fecha</p>
        </div>
        <Button icon={<Plus size={18} />} onClick={handleCreateEvent}>
          Nuevo Evento
        </Button>
      </div>

      <div className="calendario-content">
        <Card className="calendario-card">
          <Calendar
            onChange={handleDateChange}
            value={selectedDate}
            tileContent={tileContent}
            locale="es-ES"
          />
        </Card>

        <Card
          title={`Eventos del ${selectedDate.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}`}
          className="eventos-dia-card"
        >
          {eventsDay.length === 0 ? (
            <div className="no-eventos">
              <p>No hay eventos programados para esta fecha</p>
              <Button onClick={handleCreateEvent} variant="outline" size="small">
                Agregar evento
              </Button>
            </div>
          ) : (
            <div className="eventos-lista">
              {eventsDay.map((event) => (
                <div key={event._id} className="evento-item">
                  <div className="evento-time">
                    {new Date(event.date_time).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                  <div className="evento-info">
                    <h4>{event.title}</h4>
                    <p>{event.description}</p>
                    <div className="evento-detalles">
                      <span>📍 {event.building_assigned}</span>
                      {event.classroom && <span>🚪 {event.classroom}</span>}
                    </div>
                  </div>
                  <div className={`evento-estado ${event.status}`}>
                    {event.status}
                  </div>
                  {event.media && (
                    <div className="evento-media">
                      <img
                        src={event.media}
                        alt="Imagen del evento"
                        className="evento-media-img"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Nuevo Evento"
        size="large"
      >
        <EventForm
          fechaInicial={selectedDate}
          onSave={handleEventoSaved}
          onCancel={() => setShowModal(false)}
        />
      </Modal>
    </div>
  );
}
