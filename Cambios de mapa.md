# Cambios de mapa

Este documento resume la estrategia para sustituir `project/assets/geo/caminos.json` por el nuevo archivo `map ITA-V5.geojson` y garantizar que todo el ecosistema (backend, Big Data, ML y panel administrativo) trabaje con las referencias de edificios y entradas que aporta el nuevo mapeo.

## 1. Nuevo recurso base
- Copiar `map ITA-V5.geojson` dentro de `project/assets/geo/caminos.json` y mantenerlo como única fuente de verdad para cruces, entradas y edificios.
- Asegurarse de que, antes de la copia, las propiedades `conexiones` estén normalizadas como arrays (`JSON.parse`) y que `edificio_asociado` no sea la cadena `"null"` sino `null` o un string válido.

## 2. Backend y scripts
- `loadBuildingsFromGeoJSON.js`: adaptar el extractor para usar los campos `properties.id`, `name`, `tipo`, `conexiones` y `edificio_asociado` del nuevo geojson; crear o actualizar los edificios con `_id = properties.id` para mantener unicidad global.
- `generateSampleEvents.js`, `generateFakeBigData.js` y `verifyDataConsistency.js`: garantizar referencias a edificios válidos (`E-XX`). Si un cruce ya tiene `edificio_asociado`, usar esa misma clave para crear el documento `Building`.
- Evitar construir edificios “temporales”: si el mapa no aporta `edificio_asociado`, no generar uno adicional hasta que se tenga una referencia explícita.
- Actualizar los scripts ML (`backend/ml-service/*`) para que consulten edificios por los nuevos IDs y para que los logs generen `buildingId` usando `properties.id` o `edificio_asociado`.

## 3. Big Data, ML y visualizaciones
- Validar que los dashboards del panel y los endpoints de `bigData` consumen estas claves: `buildingId`, `eventId`, `entranceId`. Si ahora aparecen nuevos IDs (ej. `EE-23`, `CR-105`), extender las colecciones para soportarlos.
- Ajustar las predicciones y análisis de saturación para usar las relaciones `building_assigned` que vienen directamente del geojson (no inventar alianzas).
- Actualizar cualquier normalización de nombres para que el panel muestre exactamente `properties.name` del nuevo mapa.

## 4. Panel administrativo y documentación
- Cambiar el panel para cargar el listado de edificios desde el backend actualizado o desde un endpoint nuevo que devuelva los `_id` del geojson. Asegurar que los filtros de Big Data y ML respeten los `id` y `name`.
- Documentar el reemplazo del mapa en `README.md`, en `backend/README.md` y en una nota separada (este archivo) para que el equipo sepa cómo fue la migración.
- Considerar agregar una ruta de validación (por ejemplo, `/api/mapa`) que exponga la cartografía activa y permita diagnosticar si un `id` ya no existe.

## 5. Validaciones sugeridas post-migración
1. Ejecutar `npm run load-buildings` y verificar que la colección `buildings` contiene todos los `_id` listados en el nuevo geojson.
2. Generar datos ficticios (`generate-fake-data`) y revisar que los logs y analíticas referencian sólo IDs existentes.
3. Iniciar el ML Service (`start_ml_service.bat` o `.ps1`) y confirmar que carga modelos sin errores de referencia.
4. Abrir el panel admin y asegurarse de que todos los dashboards muestran nombres e IDs actualizados.

5. Borrar los datos sintéticos previos (por ejemplo `backend/ml-service/data/event_data_20251119.csv`) antes de generar nuevos, ya que referencian edificios antiguos.

Si necesitas ayuda con algún fragmento de código específico (parsers, normalización o endpoints), puedo avanzar con esos cambios cuando me digas por cuál parte empezar.

