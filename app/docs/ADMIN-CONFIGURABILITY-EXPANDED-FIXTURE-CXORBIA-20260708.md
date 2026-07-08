# Admin Configurability Expanded Fixture CXOrbia

Fecha: 2026-07-08  
Bloque: fixture ampliado admin configurability + integracion runner/bridge  
Archivos tecnicos:

- `tools/contracts/cxorbia-admin-configurability-expanded-fixture.mjs`
- `tools/contracts/cxorbia-synthetic-input-pack-runner.mjs`
- `tools/contracts/cxorbia-readiness-dashboard-bridge-runner.mjs`

Estado: preview-only, sin runtime real.

## 1. Objetivo

Este bloque prepara e integra un fixture sintetico/sanitizado ampliado para validar administrabilidad por tenant/proyecto en todos los dominios requeridos por Phase A y por el producto CXOrbia reusable.

La finalidad es cubrir de forma mas completa que todo sea administrable desde plataforma, sin tocar UI ni activar backend real.

## 2. Dominios cubiertos

El fixture cubre todos los dominios requeridos por el contrato:

- projects;
- rules;
- hr_sources;
- questionnaires;
- documents;
- nda_templates;
- plans;
- evidence;
- certifications;
- academy;
- notifications;
- applications;
- shoppers;
- visits;
- reservations;
- assignments;
- rescheduling;
- cancellations;
- settlements;
- payments;
- integrations;
- make;
- gemini;
- imports;
- reports;
- roles_permissions;
- gates_audit.

## 3. Que valida

El fixture valida que cada dominio sea:

- editable;
- versionado;
- limitado por roles;
- auditado con `auditRef`;
- protegido por gate;
- preview-only;
- sin provider real activo;
- sin writes reales;
- sin datos sensibles;
- sin publish/import/payment/notification real.

## 4. Academia como hallazgo transversal

El dominio `academy` incluye acciones esperadas para cursos/manuales/checklists/glosario:

- crear;
- editar;
- archivar o soft-delete;
- duplicar;
- versionar;
- asignar rol;
- asociar proyecto;
- pedir revision;
- publicar solo como preview hasta revision humana.

Esto complementa el hallazgo de la captura donde no se veian acciones de borrar/archivar/duplicar/versionar cursos.

## 5. NDA y planes

El fixture refuerza:

- NDA editable/versionado;
- reaceptacion por cambio de version;
- no modificar aceptaciones ya presentadas;
- no incluir NDA firmado en repo;
- planes operativos/proyecto/certificacion/pagos/evidencias/automatizaciones/Academia;
- estados draft, in_review, approved, active, paused, replaced y archived.

## 6. Integracion al runner

Se agrego `admin-configurability-expanded` al synthetic input pack runner.

El runner ahora valida el manifest ampliado y lo incluye en coverage como:

- `admin_configurability_expanded`.

## 7. Integracion al readiness bridge

El readiness dashboard bridge ahora mapea:

- `admin-configurability-expanded` -> `admin_configurability`.

Y lo expone como:

- `human_review_required`;
- `pendiente revision humana`;
- gate `review_required`;
- sourceRef opaca;
- sin write/deploy/real activation.

## 8. Impacto Phase A

Este bloque avanza Phase A porque prepara administrabilidad operativa para:

- proyectos;
- reglas;
- HR source refs;
- cuestionarios;
- documentos;
- NDA;
- planes;
- evidencias;
- certificaciones;
- Academia;
- postulaciones;
- shoppers;
- visitas;
- reservas;
- asignaciones;
- liquidaciones;
- pagos;
- integraciones;
- roles y gates.

## 9. Impacto Claude/prototipo

Claude debe reflejar este patron en UI sin tocar backend:

- todo dominio administrable debe tener acciones claras;
- las acciones criticas deben pedir motivo;
- cambios de version deben conservar historial;
- provider preparado no significa provider activo;
- Academia debe mostrar acciones administrativas visibles;
- estados deben ser honestos: preview, gate cerrado, revision humana, no ejecucion real.

## 10. Impacto Academia

Academia debe explicar:

- administrabilidad por tenant/proyecto;
- diferencias entre crear, editar, archivar, duplicar y versionar;
- ciclo de vida de cursos/manuales/checklists;
- NDA versionado y reaceptacion;
- planes versionados;
- gates y revision humana;
- provider preparado vs provider activo;
- por que preview no equivale a produccion.

## 11. Clasificacion obligatoria

- Reusable CXOrbia: si. Patron reusable de administrabilidad completa por tenant/proyecto.
- Exclusivo cliente: no. No contiene datos TyA reales ni HR real.
- Claude/prototipo: si. Debe reflejarse en pantallas admin, Academia y readiness.
- Academia: si. Requiere cursos/manuales/checklists y rutas por rol.
- Sin impacto Claude: no toca UI directamente, pero genera tareas de prototipo.

## 12. Estado seguro

Sin cambios en `/app/modules`.  
Sin cambios en `/app/core`.  
Sin runtime real.  
Sin deploy.  
Sin produccion.  
Sin Firestore/Auth/Storage real.  
Sin HR writes reales.  
Sin Make/Gemini real.  
Sin correos/WhatsApp reales.  
Sin pagos reales.  
Sin import real.  
Sin datos sensibles.
