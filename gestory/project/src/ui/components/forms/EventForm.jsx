import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '../common/Input.jsx';
import { Button } from '../common/Button.jsx';
import { EventUseCases } from '../../../application/usecases/EventUseCases.js';
import { BuildingUseCases } from '../../../application/usecases/BuildingUseCases.js';
import Swal from 'sweetalert2';

const eventUseCases = new EventUseCases();
const buildingUseCases = new BuildingUseCases();

export function EventForm({ event, initialDate, onSave, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [buildings, setBuildings] = useState([]);
  const [categories, setCategories] = useState([]);
  
  const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm({
    defaultValues: event || {
      title: '',
      description: '',
      building_assigned: [],
      classroom: '',
      date_time: '',
      organizer: '',
      category: [],
      status: 'programado',
      media: ''
    }
  });

  useEffect(() => {
    loadFormData();

    if (initialDate) {
      const formattedDate = initialDate.toISOString().slice(0, 16);
      setValue('date_time', formattedDate);
    }

    if (event) {
      // Ajustamos los valores iniciales si estamos en modo edición
      reset({
        ...event,
        building_assigned: event.building_assigned?.map(b => b._id) || [],
        category: event.category?.map(c => c._id) || []
      });
    }
  }, [initialDate, setValue, event, reset]);

  const loadFormData = async () => {
    try {
      const [buildingsData, categoriesData] = await Promise.all([
        buildingUseCases.getAllBuildings(),
        eventUseCases.getCategories()
      ]);

      setBuildings(buildingsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('❌ Error cargando datos del formulario:', error);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // aseguramos arrays
      if (!Array.isArray(data.building_assigned)) data.building_assigned = [data.building_assigned];
      if (!Array.isArray(data.category)) data.category = [data.category];

      if (event) {
        await eventUseCases.updateEvent(event.id, data);
        Swal.fire('Éxito', 'Evento actualizado correctamente', 'success');
      } else {
        await eventUseCases.createEvent(data);
        Swal.fire('Éxito', 'Evento creado correctamente', 'success');
      }
      onSave();
    } catch (error) {
      console.error('❌ Error guardando evento:', error);
      Swal.fire('Error', 'No se pudo guardar el evento', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="event-form">

      {/* Título */}
      <div className="form-row">
        <Input
          label="Título del Evento"
          error={errors.title?.message}
          {...register('title', { required: 'El título es obligatorio' })}
        />
      </div>

      {/* Descripción */}
      <div className="form-row">
        <label className="form-label">Descripción</label>
        <textarea
          className="form-textarea"
          rows={4}
          {...register('description', { required: 'La descripción es obligatoria' })}
        />
        {errors.description && <span className="form-error">{errors.description.message}</span>}
      </div>

      {/* Edificio y Aula */}
      <div className="form-row">
        <div className="form-col">
          <label className="form-label">Edificio</label>
          <select
            className="form-select"
            multiple
            {...register('building_assigned', { required: 'Seleccione al menos un edificio' })}
          >
            {buildings.map((b) => (
              <option key={b._id} value={b._id}>{b.name}</option>
            ))}
          </select>
          {errors.building_assigned && <span className="form-error">{errors.building_assigned.message}</span>}
        </div>

        <div className="form-col">
          <Input
            label="Aula"
            placeholder="Ej: A-101"
            {...register('classroom')}
          />
        </div>
      </div>

      {/* Fecha y hora */}
      <div className="form-row">
        <Input
          label="Fecha y Hora"
          type="datetime-local"
          error={errors.date_time?.message}
          {...register('date_time', { required: 'La fecha y hora son obligatorias' })}
        />
      </div>

      {/* Organizador y Categoría */}
      <div className="form-row">
        <div className="form-col">
          <Input
            label="Organizador"
            error={errors.organizer?.message}
            {...register('organizer', { required: 'El organizador es obligatorio' })}
          />
        </div>

        <div className="form-col">
          <label className="form-label">Categoría</label>
          <select
            className="form-select"
            multiple
            {...register('category', { required: 'Seleccione al menos una categoría' })}
          >
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>{cat.nombre}</option>
            ))}
          </select>
          {errors.category && <span className="form-error">{errors.category.message}</span>}
        </div>
      </div>

      {/* Estado */}
      <div className="form-row">
        <label className="form-label">Estado</label>
        <select className="form-select" {...register('status')}>
          <option value="programado">Programado</option>
          <option value="en_curso">En curso</option>
          <option value="finalizado">Finalizado</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>

      {/* Media */}
      <div className="form-row">
        <Input
          label="Link de Imagen"
          placeholder="URL de la imagen del evento"
          {...register('media')}
        />
      </div>

      {/* Botones */}
      <div className="form-actions">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" loading={loading}>{event ? 'Actualizar' : 'Crear'} Evento</Button>
      </div>
    </form>
  );
}
