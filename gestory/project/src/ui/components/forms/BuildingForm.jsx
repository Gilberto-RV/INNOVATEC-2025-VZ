import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '../common/Input.jsx';
import { Button } from '../common/Button.jsx';
import { BuildingUseCases } from '../../../application/usecases/BuildingUseCases.js';
import { Upload } from 'lucide-react';
import Swal from 'sweetalert2';

const buildingUseCases = new BuildingUseCases();

export function BuildingForm({ building, allServices = [], allCareers = [], onSave, onCancel }) {
  const [loading, setLoading] = useState(false); 
  const [servicesOptions, setServicesOptions] = useState(allServices);
  const [careersOptions, setCareersOptions] = useState(allCareers);
  const [imagePreview, setImagePreview] = useState(building?.media || null);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: building || {
      name: '',
      description: '',
      accessibility: false,
      floors: 1,
      availability: true,
      student_frequency: '',
      services: [],
      bathrooms: '',
      entrances: '',
      careers: [],
      subject: []
    }
  });

  useEffect(() => {
    setServicesOptions(allServices);
    setCareersOptions(allCareers);
  }, [allServices, allCareers]);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const formData = {
        ...data,
        services: data.services ? data.services.split(',').map(s => s.trim()) : [],
        careers: data.careers ? data.careers.split(',').map(c => c.trim()) : [],
        bathrooms: data.bathrooms ? data.bathrooms.split(',').map(b => b.trim()) : [],
        entrances: data.entrances ? data.entrances.split(',').map(e => e.trim()) : []
      };

      await buildingUseCases.updateBuilding(building.id, formData);

      const imageFile = document.querySelector('input[type="file"]')?.files[0];
      if (imageFile) {
        await buildingUseCases.uploadImage(building.id, imageFile);
      }

      Swal.fire('Éxito', 'Edificio actualizado correctamente', 'success');
      onSave();
    } catch (error) {
      console.error('Error updating building:', error);
      Swal.fire('Error', 'No se pudo actualizar el edificio', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="building-form">
      <div className="form-row">
        <Input
          label="Nombre del edificio"
          error={errors.name?.message}
          {...register('name', { required: 'El nombre es obligatorio' })}
        />
      </div>

      <div className="form-row">
        <label className="form-label">Descripción</label>
        <textarea
          className="form-textarea"
          rows={3}
          {...register('description')}
        />
      </div>

      <div className="form-row">
        <div className="image-upload">
          <label className="form-label">Imagen del edificio</label>
          <div className="image-preview">
            {imagePreview ? (
              <img src={imagePreview} alt="Vista previa" />
            ) : (
              <div className="image-placeholder">
                <Upload size={32} />
                <p>Seleccionar imagen</p>
              </div>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="file-input"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-col">
          <Input
            label="Número de pisos"
            type="number"
            min="1"
            error={errors.floors?.message}
            {...register('floors', {
              required: 'El número de pisos es obligatorio',
              min: { value: 1, message: 'Debe tener al menos 1 piso' }
            })}
          />
        </div>

        <div className="form-col">
          <Input
            label="Frecuencia de estudiantes"
            placeholder="Ej: Alta, Media, Baja"
            {...register('student_frequency')}
          />
        </div>
      </div>

      <div className="form-row">
        <label className="checkbox-label">
          <input type="checkbox" {...register('accessibility')} />
          Edificio accesible
        </label>
      </div>

      <div className="form-row">
        <label className="checkbox-label">
          <input type="checkbox" {...register('availability')} />
          Edificio disponible
        </label>
      </div>

      <div className="form-row">
        <Input
          label="Servicios disponibles"
          placeholder="Separados por comas: Biblioteca, Cafetería, WiFi"
          {...register('services')}
        />
      </div>

      <div className="form-row">
        <Input
          label="Baños (por piso)"
          placeholder="Separados por comas: Piso 1, Piso 2"
          {...register('bathrooms')}
        />
      </div>

      <div className="form-row">
        <Input
          label="Entradas principales"
          placeholder="Separadas por comas: Entrada norte, Entrada sur"
          {...register('entrances')}
        />
      </div>

      <div className="form-row">
        <Input
          label="Carreras que usan el edificio"
          placeholder="Separadas por comas: Ingeniería, Medicina, Derecho"
          {...register('careers')}
        />
      </div>

      <div className="form-actions">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" loading={loading}>
          Guardar cambios
        </Button>
      </div>
    </form>
  );
}
