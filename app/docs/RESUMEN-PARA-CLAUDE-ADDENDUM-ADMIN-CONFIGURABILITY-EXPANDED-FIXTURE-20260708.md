# Resumen para Claude - Addendum Admin Configurability Expanded Fixture

Fecha: 2026-07-08  
Bloque: fixture ampliado admin configurability + integracion runner/bridge  
Estado: pendiente para prototipo, sin tocar UI desde backend.

## Bloque backend agregado

ChatGPT/backend agrego:

- `tools/contracts/cxorbia-admin-configurability-expanded-fixture.mjs`
- `app/docs/ADMIN-CONFIGURABILITY-EXPANDED-FIXTURE-CXORBIA-20260708.md`
- `app/docs/CAMBIOS-ADMIN-CONFIGURABILITY-EXPANDED-FIXTURE-CXORBIA-20260708.md`
- `app/docs/CAMBIOS-BACKEND-ADDENDUM-ADMIN-CONFIGURABILITY-EXPANDED-FIXTURE-20260708.md`

Y actualizo:

- `tools/contracts/cxorbia-synthetic-input-pack-runner.mjs`
- `tools/contracts/cxorbia-readiness-dashboard-bridge-runner.mjs`

## Que debe tomar Claude

Claude debe reflejar en UI, sin backend real, que todos los dominios son administrables por tenant/proyecto con:

- acciones visibles;
- roles/permisos;
- versionado;
- auditRef;
- gate cerrado;
- revision humana;
- estados honestos;
- motivo para acciones criticas.

## Dominios a representar

- proyectos;
- reglas;
- HR sources;
- cuestionarios;
- documentos;
- NDA;
- planes;
- evidencias;
- certificaciones;
- Academia;
- notificaciones;
- postulaciones;
- shoppers;
- visitas;
- reservas;
- asignaciones;
- reprogramaciones;
- cancelaciones;
- liquidaciones;
- pagos;
- integraciones;
- Make;
- Gemini;
- imports;
- reportes;
- roles/permisos;
- gates/auditoria.

## Academia obligatorio

Academia debe mostrar acciones visibles para cursos/manuales/checklists/glosario:

- crear;
- editar;
- archivar o borrar controlado;
- duplicar;
- versionar;
- asignar rol;
- asociar proyecto;
- pedir revision;
- publicar solo con revision humana.

## Prohibido mostrar

- provider activo;
- Make activo;
- Gemini activo;
- Storage activo;
- HR conectado;
- import real;
- envio real;
- pago real;
- produccion lista;
- deploy realizado.

## Academia contenido

Academia debe explicar administrabilidad por tenant/proyecto, ciclo de vida de cursos/manuales/checklists, NDA versionado, planes versionados, gates, revision humana y provider preparado vs provider activo.

## Estado seguro

No se tocaron modulos UI, no se activo backend real, no se hizo import real, no se hicieron pagos reales y no se agregaron datos sensibles.
