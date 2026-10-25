# Academia — impacto DEV Hosting R17

Fecha: 2026-07-13

## Concepto central

Academia debe diferenciar cuatro estados:

1. **Build local/source lock:** código aprobado y verificable.
2. **Hosting DEV source-safe:** aplicación accesible remotamente con datos sanitizados.
3. **Backend materializado/autenticado:** Firestore/Auth activos mediante gates separados.
4. **Producción:** operación real autorizada, monitoreada y con rollback.

El paso 2 ya fue completado. Los pasos 3 y 4 permanecen pendientes.

## Evidencia operativa TyA

- URL DEV accesible;
- 14 periodos;
- 616 visitas;
- 210 shoppers live source-safe;
- 13/13 rutas por rol;
- 0 errores de consola o página;
- junio 44/44 con evidencia;
- gap shopper 210/213 en revisión.

## Checklist por rol

### Admin/Superadmin

- confirmar etiqueta DEV/source-safe;
- distinguir preview de materialización;
- revisar warnings sin resolver identidades por nombre;
- no interpretar deploy Hosting como producción.

### Operativo

- validar visitas y rutas;
- interpretar junio como liquidaciones/pagos, no visitas pendientes;
- mantener conflictos en reviewQueue.

### Shopper/Cliente

- reconocer que los datos son source-safe;
- no interpretar estados financieros como pagos ejecutados;
- no asumir que Auth o certificaciones reales ya fueron activados.

## Error frecuente que debe cubrir Academia

Un sitio remoto que funciona no significa que Firestore fue importado, Auth activado, Make/Gemini conectados o producción autorizada.

## Clasificación

- **Reusable CXOrbia:** modelo de madurez local → Hosting DEV → backend → producción.
- **Exclusivo cliente:** cifras TyA/Cinépolis.
- **Claude/prototipo:** futuro contenido visual/administrable, sin P0 actual.
- **Academia:** contenido completo de este documento.
- **Sin impacto Claude:** hashes, artifacts y credenciales sanitizadas.

## Estado editorial

Backfill documental. No modifica el módulo Academia, no publica cursos y no activa Gemini.
