# ACADEMIA — Impacto C6 root fix canónico Hosting DEV remote PASS

**Fecha:** 2026-08-01  
**Estado:** pendiente incorporación en manuales/cursos después de validación humana.

## Contenidos que deben enseñarse
1. **Autoridad de fuentes:** HR para operación, perfil protegido para datos personales, Finanzas para liquidaciones/pagos, Auth para acceso y plataforma-origin para eventos propios reconciliados.
2. **Facetas canónicas:** Dashboard, fases, detalle, histórico, portal y Finanzas deben consumir la misma interpretación de estados.
3. **Identidad exacta:** shopperId, legacyShopperId, hrRowId, visitId, sourceTab/sourceRow y crosswalk; nunca parecido de nombre, teléfono o correo.
4. **Perfil completo real:** calcular por campos existentes y mostrar faltantes honestamente.
5. **Progresión financiera:** realizada, cuestionario, submitida, candidata de liquidación, cruce financiero, lote y pago confirmado son estados distintos.
6. **Refresh idempotente:** una revisión HR sin cambios no recompone ni mueve la interfaz; una revisión nueva se aplica una sola vez conservando contexto.
7. **Reservas fail-closed:** sin fuente backend real no se muestran fixtures/localStorage como datos conectados ni se habilitan mutaciones.
8. **Validación acumulativa:** un PASS técnico no reemplaza la revisión humana transversal antes del freeze.

## Rutas por rol
- **Admin/Operativo:** comparar KPIs, fases, Shoppers, perfiles, certificaciones, Finanzas, Liquidaciones y Reportes.
- **Shopper:** revisar identidad seleccionada, perfil, visitas activas/históricas, certificación y beneficios.
- **Cliente:** verificar que históricos y estados visibles correspondan al proyecto/periodo autorizado.

## Checklist de aprendizaje
- identificar la fuente responsable de cada dato;
- distinguir evidencia histórica de estado accionable;
- explicar por qué una visita submitida no equivale a pago;
- reconocer un conflicto de identidad que debe ir a review queue;
- comprobar que tres refresh no cambian conteos ni contexto;
- reconocer copy honesto cuando un proveedor aún no está conectado.

## Notificaciones y errores
Los mensajes futuros deben diferenciar:
- fuente pendiente;
- conflicto de identidad;
- revisión requerida;
- candidata de liquidación;
- pago no confirmado;
- operación bloqueada por ausencia de proveedor.

No presentar errores técnicos, nombres de adapters o estados internos a usuarios operativos.

## Estado
El contenido queda documentado, pero su publicación definitiva en manuales y cursos se realiza después del `APROBADO` visual y freeze de Corte6, incorporando capturas del build aprobado.
