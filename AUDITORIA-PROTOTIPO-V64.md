# AUDITORIA-PROTOTIPO-V64.md

Estado: auditoria inicial del ZIP `Prototype development request CXOrbia V64.zip`.

Fecha: 2026-07-01
Repo destino: paulaosoriof86/demoCXOrbia
Rama destino: release/cxorbia-tya-rc-20260630

## Resultado inicial

El ZIP contiene 85 archivos bajo `app/`.

Validaciones realizadas antes de aplicar:

- Estructura: correcta, carpeta raiz `app/`.
- UTF-8: sin errores de decodificacion y sin mojibake detectado en archivos de texto auditados.
- JavaScript: `node --check` OK en los 55 archivos `.js` del ZIP.
- Backend protegido: el ZIP no incluye `app/index-backend-dev.html`, no incluye `app/core/backend*.js`, no incluye `firebase.json`, `.firebaserc`, `firestore.rules`, `firebase/seeds/*` ni `firebase/client-write-tools/*`.
- Riesgo detectado: incluye `app/docs/RESUMEN-PARA-CHATGPT-BACKEND.md`, que es documento protegido de backend y no debe sobrescribirse.
- `modules/rutas.js` existe en el ZIP, pero `app/index.html` no lo carga. Esto evita reintroducir el bug de HR donde `rutas.js` simple sobrescribia `operacion-extra.js`.

## Pendientes que V64 declara como resueltos

V64 declara como resueltos y verificados muchos pendientes acumulados, entre ellos:

- IA multi-proveedor y llamadas `CX.ai.ask`.
- PWA auto-install y favicon white-label.
- Login white-label, logo cliente en topbar y propuestas.
- Roles franquicia/coordinador/aliado/representante y permisos por rol.
- Mis Visitas y Mis Beneficios filtrados por shopper autenticado.
- Acciones operativas persistibles y bitacora de auditoria en prototipo.
- Postulaciones con solicitar ajuste, gestion de aprobadas, reasignar con buscador y perfil real.
- Reservas/asignacion con cruce reserva-postulacion.
- Dashboard operativo con KPIs vivos, avance real vs ideal por pais y sin hardcode de mes.
- Finanzas con CxC/CxP clickeables, pago de lote por shopper, financiamiento con concepto, presupuesto mensual y analisis critico.
- CRM completo estilo Orbit, ficha 360, clientes/cuentas sincronizados, propuestas, marketing IA.
- Academia, manuales, certificacion, documentos, reportes y soporte ampliados.
- Configuracion, usuarios, setup inteligente, NDA/legal, modo demo/piloto, impresion limpia y add-ons.

## Pendientes vigentes declarados por V64

- Submodulo `Periodos`: crear, cerrar, archivar, duplicar y comparar periodos de un programa.
- Vista de Historico consultable sin mezclarse con operacion activa.
- Deteccion de periodo en importador HR: proyecto nuevo/existente, periodo nuevo/existente, duplicados y panel de confirmacion.
- Centro de Actualizaciones/Novedades SaaS multi-tenant.
- Sincronia de filtros proyecto/periodo/pais entre todos los modulos.
- Estados honestos para correo, automatizaciones, integraciones e IA.
- Fichas ampliadas: periodo, visita y sucursal.
- Profundidad adicional en academia y analitica financiera/portal cliente.

## Dictamen

V64 puede aplicarse por fast-track preservando backend protegido, pero excluyendo `app/docs/RESUMEN-PARA-CHATGPT-BACKEND.md`.

Despues de aplicar se debe actualizar el documento vivo de pendientes para no reprocesar items que V64 ya declara atendidos.
