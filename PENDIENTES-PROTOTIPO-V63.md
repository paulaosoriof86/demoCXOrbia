# PENDIENTES-PROTOTIPO-V63

Fecha: 2026-07-01
Base: Prototype development request CXOrbia V63.zip
Alcance: pendientes de frontend/prototipo para Claude. No incluye backend real, Firestore real, Make real, WhatsApp real, correo real, Gemini backend, Storage real, reglas, credenciales ni producción.

## Pendientes cerrados o mejorados por V63

1. Eliminación de `app/modules/aprendizaje.js` huérfano.
2. `academia.js` registra `aprendizaje` dentro del módulo correcto.
3. `index.html` deja de cargar `modules/rutas.js`.
4. Liquidación clasifica cuestionario sin submit como `pendiente_submitir`.
5. Router y configuración agregan matriz visual de permisos y `roleCanAccess`.
6. Dashboard agrega confirmación antes de eliminar visita.
7. Dashboard agrega detalles/drill visual en buckets.
8. Configuración agrega modo demo/cliente y selector de proyecto inicial.
9. UTF-8 y sintaxis JS se mantienen correctos en auditoría estática.

## Pendientes acumulados que siguen vigentes para Claude

### P0 - Centro de actualizaciones / Novedades / Release Management

V63 no incluye todavía el módulo visual requerido.

Claude debe agregar una experiencia visual llamada `Centro de actualizaciones` o `Novedades`, con dos vistas:

1. Vista interna administrativa:
   - versiones publicadas;
   - ficha de release;
   - mejoras incluidas;
   - bugs corregidos;
   - módulos impactados;
   - clientes/tenants impactados;
   - países y planes impactados;
   - feature flags relacionadas;
   - estado por cliente: pendiente, aplicado, fallido, pausado, revertido;
   - botones visuales: notificar cliente, marcar aplicado, pausar, revertir, ver historial;
   - confirmación de lectura;
   - historial de avisos enviados.

2. Vista amigable para usuarios/clientes:
   - banner de nueva actualización;
   - historial de mejoras aplicadas;
   - detalle en lenguaje comercial/operativo;
   - confirmación de lectura cuando aplique;
   - sin lenguaje técnico como Firestore, deploy, branch, commit, GitHub, backend o reglas.

Claude no debe implementar Firestore real ni migraciones reales; solo UI honesta con datos ficticios.

### P0 - Separación demo vs cliente/piloto TyA

- El modo demo/cliente existe, pero todavía puede quedar mezcla visual con datos demo.
- TyA/Cinépolis debe abrir con configuración de tenant/proyecto clara.
- Retail, banca, food o restaurantes no deben parecer datos operativos reales de TyA.
- La UI debe indicar de forma honesta si está mostrando datos ficticios, piloto o reales.

### P0 - HR TyA visual y reglas operativas

- Mostrar GT/HN, quincena, franja, sucursal, shopper, estado, disponible desde, fechas, cuestionario, submitido, liquidación, reembolsos y evidencias.
- Representar reglas Q1/Q2 de forma visual y comprensible.
- Evitar duplicados y estados contradictorios.
- Mantener fechas en presente/pasado cuando aplique.

### P0 - Dashboard/KPIs/drill

- Los KPIs deben tener detalle debajo o modal amplio.
- No mezclar moneda, país o estado.
- Evitar conteos duplicados.
- Evitar liquidadas multiplicadas por 100.
- Mostrar criterios de cada KPI.

### P1 - Postulaciones, reservas y asignaciones

- Mostrar todas las postulaciones, no solo pendientes.
- Trazabilidad de reserva/asignación.
- Evitar doble asignación visual.
- Estados claros y filtros reales.

### P1 - Flujo shopper y perfil shopper

- Flujo completo desde postulación hasta cuestionario y revisión.
- Perfil con visitas, certificaciones, beneficios, documentos, NDA e historial.
- Estados visuales claros para pendientes, confirmaciones y evidencias.

### P1 - Beneficios, finanzas y liquidaciones UI

- Separar honorarios y reembolsos.
- Separar país, moneda, lote, fecha estimada y fecha pagada.
- Acciones visuales para pagada/reprogramar cuando aplique.
- Mostrar beneficios del shopper de forma clara.

### P1 - Certificaciones, Academia y Documentos

- Mayor profundidad en certificaciones.
- Manuales y capacitación organizados por rol/proyecto.
- Documentos con estado honesto y flujos claros.

### P2 - Portal cliente, soporte, reportes e integraciones

- Portal cliente coherente por tenant/proyecto.
- Soporte con bandeja viva o estado honesto.
- Reportes configurables y descargables desde UI.
- Integraciones, automatizaciones, correo y marketing con estados honestos.

## Pendientes que NO son de Claude y pasan a backend

- Persistencia Firestore real.
- Auth real y roles reales.
- Reglas Firestore.
- Storage evidencias.
- Make/WhatsApp/correo real.
- Gemini/IA segura.
- Importación persistente.
- Migraciones de datos reales.
- Release Management real con colecciones, feature flags, rollout y lecturas.

## Regresiones prohibidas

- Tocar o eliminar backend protegido.
- Reintroducir módulos huérfanos.
- Volver a cargar `modules/rutas.js` si sobrescribe HR.
- Mostrar datos demo como si fueran backend real.
- Mostrar lenguaje técnico al cliente final.
- Romper UTF-8.
- Perder módulos ya existentes.
- Usar datos reales.
