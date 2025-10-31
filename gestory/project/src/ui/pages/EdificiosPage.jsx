import { useState, useEffect } from 'react';
import { Search, Edit, Building2 } from 'lucide-react';
import { Card } from '../components/common/Card.jsx';
import { Button } from '../components/common/Button.jsx';
import { Input } from '../components/common/Input.jsx';
import { Modal } from '../components/common/Modal.jsx';
import { BuildingUseCases } from '../../application/usecases/BuildingUseCases.js';
import { BuildingForm } from '../components/forms/BuildingForm.jsx';
import Swal from 'sweetalert2';
import './EdificiosPage.scss';

const buildingUseCases = new BuildingUseCases();

export function EdificiosPage() {
  const [buildings, setBuildings] = useState([]);
  const [filters, setFilters] = useState({
    busqueda: ''
  });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [buildingEdit, setbuildingEdit] = useState(null);

  useEffect(() => {
    loadBuildings();
  }, []);

  const loadBuildings = async () => {
    try {
      const buildingsData = await buildingUseCases.getAllBuildings();
      console.log("📦 Datos recibidos de getAllBuildings() en interfaz:", buildingsData);
      if (Array.isArray(buildingsData)) {
        setBuildings(buildingsData);
      } else if (Array.isArray(buildingsData.data)) {
        setBuildings(buildingsData.data);
      } else {
        console.warn("Formato inesperado de respuesta");
        setBuildings([]);
      }
    } catch (error) {
      console.error('Error cargando edificios:', error);
      Swal.fire('Error', 'No se pudieron cargar los edificios', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditBuilding = (building) => {
    setbuildingEdit(building);
    setShowModal(true);
  };

  const handleBuildingSaved = () => {
    setShowModal(false);
    loadBuildings();
  };

  const buildingsFilters = buildings.filter(b =>
    b.name?.toLowerCase().includes(filters.busqueda.toLowerCase()) ||
    b.description?.toLowerCase().includes(filters.busqueda.toLowerCase())
  );



  if (loading) {
    return (
      <div className="edificios-page">
        <div className="page-header">
          <h1>Edificios</h1>
        </div>
        <div className="loading-message">Cargando edificios...</div>
      </div>
    );
  }

  return (
    <div className="edificios-page">
      <div className="page-header">
        <div>
          <h1>Gestión de Edificios</h1>
          <p>Administra la información de los edificios del campus</p>
        </div>
      </div>

      <Card className="filters-card">
        <Input
          placeholder="Buscar edificios..."
          icon={<Search size={18} />}
          value={filters.busqueda}
          onChange={(e) => setFilters(prev => ({
            ...prev,
            busqueda: e.target.value
          }))}
        />
      </Card>

      {buildingsFilters.length === 0 ? (
        <Card>
          <div className="empty-state">
            <p>No se encontraron edificios</p>
          </div>
        </Card>
      ) : (
        <div className="edificios-grid">
          {buildingsFilters.map((b) => (
            <Card key={b._id} className="edificio-card">
              {/* Imagen del edificio */}
              <div className="edificio-image">
                {b.media ? (
                  <img src={b.media} alt={b.name} />
                ) : (
                  <div className="edificio-placeholder">
                    <Building2 size={48} />
                  </div>
                )}
              </div>

              <div className="edificio-info">
                <h3>{b.name}</h3>
                <p>{b.description}</p>

                {/* Detalles principales */}
                <div className="edificio-detalles">
                  {b.floors && (
                    <div className="detalle-item">
                      <strong>Pisos:</strong> {b.floors} {b.floors === 1 ? 'planta' : 'plantas'}
                    </div>
                  )}

                  <div className="detalle-item">
                    <strong>Accesibilidad:</strong>
                    <span className={`badge ${b.accessibility ? 'badge--success' : 'badge--secondary'}`}>
                      {b.accessibility ? 'Sí' : 'No'}
                    </span>
                  </div>

                  <div className="detalle-item">
                    <strong>Estado:</strong>
                    <span className={`badge ${b.availability ? 'badge--success' : 'badge--danger'}`}>
                      {b.availability ? 'Disponible' : 'No disponible'}
                    </span>
                  </div>

                  {b.student_frequency && (
                    <div className="detalle-item">
                      <strong>Frecuencia estudiantil:</strong>
                      <span className={`badge ${
                        b.student_frequency === 'high' ? 'badge--danger' :
                        b.student_frequency === 'medium' ? 'badge--warning' :
                        'badge--success'
                      }`}>
                        {b.student_frequency === 'high' && 'Alta'}
                        {b.student_frequency === 'medium' && 'Media'}
                        {b.student_frequency === 'low' && 'Baja'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Baños por piso */}
                {b.bathrooms &&
                  Object.keys(b.bathrooms)
                    .filter(key => /^floor_\d+$/.test(key) && b.bathrooms[key] === true) // solo floor_ seguido de número
                    .map(floor => (
                      <div key={floor} className="detalle-item">
                        <strong>Baños disponibles en: </strong>
                        <span>Planta {floor.replace('floor_', '')}</span>
                      </div>
                    ))
                }




                {/* Servicios */}
                {b.services && b.services.length > 0 && (
                  <div className="edificio-section">
                    <strong>Servicios:</strong>
                    {b.services.map((service, i) => (
                      <div key={i} className="detalle-item">
                        {typeof service === 'string' ? service : service.name}
                      </div>
                    ))}
                  </div>
                )}

                
                {/* Carreras */}
                {b.careers && b.careers.length > 0 && (
                  <div className="edificio-section">
                    <strong>Carreras asignadas:</strong>
                    {b.careers.map((career, i) => (
                      <div key={i} className="detalle-item">{career.name}</div>
                    ))}
                  </div>
                )}

                {/* Entradas */}
                {b.entrances && b.entrances.length > 0 && (
                  <div className="edificio-section">
                    <strong>{b.entrances.length === 1 ? 'Entrada:' : 'Entradas:'}</strong>
                    {b.entrances.map((e, i) => (
                      <div key={i} className="detalle-item">
                        {e.description && <div>• {e.description}</div>}
                        {e.location_hint && <div>Ubicado {e.location_hint}</div>}
                      </div>
                    ))}
                  </div>
                )}

                {/* Espacios académicos */}
                {b.subject && b.subject.length > 0 && (
                  <div className="edificio-section">
                    <strong>Espacios académicos:</strong>
                    {Array.from(
                      b.subject.reduce((map, item) => {
                        if (!map.has(item.type)) map.set(item.type, []);
                        map.get(item.type).push(item);
                        return map;
                      }, new Map())
                    ).map(([type, rooms], idx) => (
                      <div key={idx} className="detalle-item">
                        {rooms.map((room, i) => (
                          <div key={i}>
                            • {room.name} ({room.floor === 5 ? 'Distribuidos' : `Piso ${room.floor}`})
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Botón editar */}
              <div className="edificio-actions">
                <Button
                  variant="outline"
                  icon={<Edit size={16} />}
                  onClick={() => handleEditBuilding(b)}
                >
                  Editar
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={`Editar Edificio: ${buildingEdit?.name}`}
        size="large"
      >
        <BuildingForm
          building={buildingEdit}
          allServices={buildings.flatMap(b => b.services || [])}
          allCareers={buildings.flatMap(b => b.careers || [])}
          onSave={handleBuildingSaved}
          onCancel={() => setShowModal(false)}
        />

      </Modal>
    </div>
  );
}