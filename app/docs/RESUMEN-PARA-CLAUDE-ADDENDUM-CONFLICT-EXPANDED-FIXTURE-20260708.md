# Resumen para Claude - Addendum conflict review/import readiness expanded fixture

Fecha: 2026-07-08  
Motivo: el intento de reemplazar `RESUMEN-PARA-CLAUDE.md` fue bloqueado por el conector. Este addendum conserva la instruccion sin workaround.

## Bloque backend agregado

ChatGPT/backend agrego:

- `tools/contracts/cxorbia-conflict-review-import-readiness-expanded-fixture.mjs`
- `app/docs/CONFLICT-REVIEW-IMPORT-READINESS-EXPANDED-FIXTURE-CXORBIA-20260708.md`
- `app/docs/CAMBIOS-CONFLICT-REVIEW-IMPORT-READINESS-EXPANDED-FIXTURE-CXORBIA-20260708.md`
- `app/docs/NEXT-CANDIDATE-AUDIT-ACADEMIA-ADMIN-ACTIONS-20260708.md`

## Que debe tomar Claude

El fixture ampliado cubre:

- conflicto de asignacion HR/plataforma;
- identidad shopper ambigua;
- estatus de pago en revision;
- readiness por proyectos, visitas, shoppers, asignaciones, certificaciones, liquidaciones, pagos y rutas de cuestionario.

Claude debe reflejar estos escenarios como bandeja de conflictos/readiness:

- severidad;
- estado de cola;
- sourceRefs opacas;
- stable keys no sensibles;
- razon de revision;
- bloqueo de import si hay blocker;
- revision humana obligatoria.

## Prohibido para Claude

- No deduplicar visualmente.
- No auto-merge.
- No resolver automaticamente.
- No mostrar import real.
- No mostrar pago real.
- No mostrar sync real.
- No mostrar provider activo.
- No mostrar fuente real conectada.

## Academia

Academia debe explicar:

- cola de conflictos;
- blocker vs warning;
- sourceRefs opacas;
- stable keys;
- pago en revision vs pago real;
- revision humana;
- administracion completa de Academia.

## Hallazgo obligatorio para proxima candidata

Academia debe mostrar o documentar acciones para:

- borrar controlado o archivar;
- duplicar;
- versionar;
- cambiar estado;
- auditar motivo;
- aplicar permisos;
- conservar trazabilidad de cursos/manuales/checklists/glosario.

## Estado seguro

No se tocaron modulos UI, no se activo backend real, no se hizo import real, no se hicieron pagos reales y no se agregaron datos sensibles.
