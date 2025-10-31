import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2 } from 'lucide-react';
import { Card } from '../components/common/Card.jsx';
import { Button } from '../components/common/Button.jsx';
import { Input } from '../components/common/Input.jsx';
import { Modal } from '../components/common/Modal.jsx';
import { EventUseCases } from '../../application/usecases/EventUseCases.js';
import { EventForm } from '../components/forms/EventForm.jsx';
import Swal from 'sweetalert2';
import './EventosPage.scss';

const eventUseCases = new EventUseCases();

export function EventosPage() {
  const [events, setEvents] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: ''
  });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [eventToEdit, setEventToEdit] = useState(null);

  useEffect(() => {
    setLoading(true);
    loadEvents();
  }, [filters]);

  const loadEvents = async () => {
    try {
      const eventsData = await eventUseCases.getAllEvents(filters); // ✅ en inglés
      setEvents(eventsData);
    } catch (error) {
      console.error('Error cargando eventos:', error);
      Swal.fire('Error', 'No se pudieron cargar los eventos', 'error');
    } finally {
      setLoading(false);
    }
  };


  const handleCreateEvent = () => {
    setEventToEdit(null);
    setShowModal(true);
  };

  const handleEditEvent = (event) => {
    setEventToEdit(event);
    setShowModal(true);
  };

  const handleDeleteEvent = async (event) => {
    const result = await Swal.fire({
      title: '¿Eliminar evento?',
      text: `¿Estás seguro de eliminar "${event.title}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await eventUseCases.deleteEvent(event.id);
        await loadEventos();
        Swal.fire('Eliminado', 'El evento ha sido eliminado', 'success');
      } catch (error) {
        console.error('Error eliminando evento:', error);
        Swal.fire('Error', 'No se pudo eliminar el evento', 'error');
      }
    }
  };

  const handleEventSaved = () => {
    setShowModal(false);
    loadEvents();
  };

  const getEstadoBadgeClass = (status) => {
    const classes = {
      programado: 'badge--info',
      en_curso: 'badge--success',
      finalizado: 'badge--secondary',
      cancelado: 'badge--danger'
    };
    return classes[status] || 'badge--secondary';
  };

  if (loading) {
    return (
      <div className="eventos-page">
        <div className="page-header">
          <h1>Eventos</h1>
        </div>
        <div className="loading-message">Cargando eventos...</div>
      </div>
    );
  }

  return (
    <div className="eventos-page">
      <div className="page-header">
        <div>
          <h1>Gestión de Eventos</h1>
          <p>Administra todos los eventos del sistema</p>
        </div>
        <Button
          icon={<Plus size={18} />}
          onClick={handleCreateEvent}
        >
          Nuevo Evento
        </Button>
      </div>

      <Card className="filters-card">
        <div className="filters-row">
          <Input
            placeholder="Buscar eventos..."
            icon={<Search size={18} />}
            value={filters.search}
            onChange={(e) => setFilters(prev => ({
              ...prev,
              search: e.target.value
            }))}
          />
          
          <select
            value={filters.category}
            onChange={(e) => setFilters(prev => ({
              ...prev,
              category: e.target.value
            }))}
          >
            <option value="">Todas las categorías</option>
            <option value="academico">Académico</option>
            <option value="cultural">Cultural</option>
            <option value="deportivo">Deportivo</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({
              ...prev,
              status: e.target.value
            }))}
          >
            <option value="">Todos los estados</option>
            <option value="programado">Programado</option>
            <option value="en_curso">En curso</option>
            <option value="finalizado">Finalizado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
      </Card>

      <Card>
        {events.length === 0 ? (
          <div className="empty-state">
            <p>No se encontraron eventos</p>
            <Button onClick={handleCreateEvent} variant="outline">
              Crear primer evento
            </Button>
          </div>
        ) : (
          <div className="eventos-table">
            <div className="table-header">
              <div>Título</div>
              <div>Edificio</div>
              <div>Fecha</div>
              <div>Estado</div>
              <div>Acciones</div>
            </div>
            
            {events.map((event) => (
              <div key={event.id} className="table-row">
                <div>
                  <strong>{event.title}</strong>
                  <p>{event.description}</p>
                  {event.media && (
                    <img
                      src={event.media}
                      alt={event.title}
                      style={{ width: "200px", borderRadius: "8px" }}
                    />
                  )}
                </div>
                <div>{event.building_assigned?.[0]?.name}</div>
                <div>
                  {new Date(event.date_time).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
                <div>
                  <span className={`badge ${getEstadoBadgeClass(event.estado)}`}>
                    {event.status}
                  </span>
                </div>
                <div className="table-actions">
                  <Button
                    variant="ghost"
                    size="small"
                    icon={<Edit size={16} />}
                    onClick={() => handleEditEvent(event)}
                  />
                  <Button
                    variant="ghost"
                    size="small"
                    icon={<Trash2 size={16} />}
                    onClick={() => handleDeleteEvent(event)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={eventToEdit  ? 'Editar Evento' : 'Nuevo Evento'}
        size="large"
      >
        <EventForm
          event={eventToEdit}   // ✅ se llama "event", no "evento"
          onSave={handleEventSaved}
          onCancel={() => setShowModal(false)}
        />
      </Modal>

    </div>
  );
}