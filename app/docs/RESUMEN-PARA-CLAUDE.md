# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-01  
**Estado vivo:** `C6_CANONICAL_ROOT_FIX_HOSTING_DEV_REMOTE_PASS__PENDING_HUMAN_VISUAL_ACCUMULATIVE__NO_PRODUCTION`

## 1. No reabrir
- Repo/rama/PR: `paulaosoriof86/demoCXOrbia` / `docs-tya-v6-v71-audit` / PR#7 draft/open/no merge.
- Corte3 FROZEN; R17N1,406/1,406 no repetir.
- Corte5:14 periodos/616 visitas/current2026-07 PASS.
- Auth/claims/Rules PASS; HR live/auto-month PASS; perfil protegido y finanzas canónicas preservados.
- Producción `tya-plataforma` intacta.

## 2. P0 visual que no debe reintroducirse
El build anterior mostró KPIs/fases contradictorios, comparativo vacío, refresh con saltos, identidades Shopper divididas, perfil/histórico/certificación incompletos, portal Shopper parcial, periodo financiero divergente,33 submitidas omitidas de Liquidaciones y Reservas apoyadas en localStorage/fixtures.

Este P0 es evidencia histórica y originó el root fix canónico. No debe reinterpretarse como tareas frontend aisladas ni corregirse recreando reglas dentro de módulos.

## 3. Root fix publicado en Hosting DEV
Autorización one-shot consumida. Deploy ejecutado1/1 sobre el Hosting DEV existente `cxorbia-backend-dev`, target `cxorbia-dev`.

Decisión remota:
`PASS_C6_CANONICAL_ROOT_FIX_EXISTING_HOSTING_DEV_REMOTE_SMOKE`.

El Hosting sirve exactamente:
- `tya-cumulative-read-model-v2.js`;
- `tya-canonical-state-semantics-v2.js`;
- `tya-live-source-refresh-watch-v2.js`;
- `tya-c6-domain-consistency-bridge.js`;
- `tya-canonical-finance-read-model-v2.js`;
- `tya-canonical-shopper-portal-v2.js`;
- `tya-canonical-reservations-guard-v2.js`;
- `index-backend-dev.html` con wiring v2.

No pedir otro deploy antes de la validación humana del build actual.

## 4. Contratos de producto que Claude debe incorporar nativamente
- HR es autoridad para periodos, visitas y estado operativo.
- Una sola faceta canónica alimenta Dashboard, fases, detalle, histórico, portal y Finanzas.
- Identidad Shopper solo por llaves técnicas exactas y crosswalk auditable.
- Conflictos sin match exacto pasan a review queue; nunca dedupe por nombre, teléfono o email.
- Perfil completo se calcula por campos reales.
- Portal Shopper muestra todas las visitas e histórico de la identidad canónica, no una visita por estado.
- Toda visita realizada entra a Liquidaciones; sin cruce financiero exacto no hay lote ni pago.
- Refresh de la misma revisión no aplica, no recompone y no rerenderiza.
- Periodo, proyecto, vista, filtros y scroll se preservan desde el modelo.
- Reservas usa fuente backend configurable o queda fail-closed; localStorage/fixtures nunca se presentan como backend.

## 5. Baseline técnica
HR:14 periodos/616 visitas/208 shoppers; JUL44=GT34+HN10; realizadas40; cuestionario38; submitidas33; liquidationCandidates33; fuera de rango accionable1; evidencia histórica7; duplicados técnicos0.

## 6. Regla frontend
`/app/modules/*` y `/app/core/*` no fueron modificados por el root fix. Claude debe consumir el read model estable y no duplicar semántica HR, identidad o Finanzas en módulos.

## 7. Validación humana pendiente
Comprobar acumulativamente:
- Dashboard y fases coherentes44/40/38/33/1;
- comparativo histórico visible;
- tres refresh/focus sin crecimiento ni salto de scroll/periodo;
- una identidad Shopper por persona;
- perfil, certificación, histórico y beneficios coherentes por identidad;
- Finanzas, Movimientos y Liquidaciones en el mismo periodo e incluyendo40 realizadas/33 submitidas;
- Reportes sin pérdida de información;
- Reservas read-only/fuente pendiente, sin datos demo ni mutaciones.

Solo con `APROBADO` se congela Corte6.

## 8. Agosto y Reservas
Después del freeze, conectar la fuente exacta de agosto y/o la fuente real de Reservas según prioridad. No copiar julio, inventar IDs/ubicaciones/estados ni activar writes sin autorización y gate específicos.

## 9. Academia/manuales
Actualizar manuales y cursos con autoridad de fuentes, facetas canónicas, identidad exacta, diferencia entre realizada/submitida/liquidable/pagada, refresh idempotente y comportamiento fail-closed de Reservas.

## 10. Estado seguro
Hosting DEV deploy1; Cloud Run deploys0; Firestore/Auth/Rules/Storage/HR/legacy/Make/Gemini/pagos/reservas writes0; nuevos Firebase/Hosting0; merge=false; producción=false.
