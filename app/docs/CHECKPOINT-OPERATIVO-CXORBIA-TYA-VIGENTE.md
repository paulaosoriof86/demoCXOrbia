# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-01  
**Estado:** `C6_CANONICAL_ROOT_FIX_HOSTING_DEV_REMOTE_PASS__PENDING_HUMAN_VISUAL_ACCUMULATIVE__NO_PRODUCTION`

## 1. Estado protegido
- Repo `paulaosoriof86/demoCXOrbia`; rama viva `docs-tya-v6-v71-audit`; PR#7 draft/open/no merge.
- Corte3 FROZEN y R17N1,406/1,406 no se repiten.
- Corte5 14 periodos/616 visitas PASS.
- Auth/claims/Rules PASS; HR live/auto-month PASS; perfil protegido120/329 PASS; finanzas/pagos canónicos preservados.
- Producción `tya-plataforma` intacta.

## 2. P0 humano histórico — no borrar
La visual anterior probó KPIs/fases contradictorios, comparativo vacío, refresh con saltos, identidades Shopper divididas, perfiles falsamente completos, portal Shopper incompleto, periodo financiero divergente,33 submitidas omitidas de Liquidaciones y Reservas usando fuente local/demo.

Ese P0 originó el root fix canónico. Sigue siendo evidencia histórica; no se declara resuelto visualmente hasta la revisión humana del build actual.

## 3. Root fix canónico publicado en Hosting DEV
Autorización fresca de Paula consumida una sola vez.

- proyecto DEV existente: `cxorbia-backend-dev`;
- Hosting site: `cxorbia-backend-dev`;
- target: `cxorbia-dev`;
- deploy Hosting ejecutado: `1/1`;
- Cloud Run deploys:0;
- nuevos Firebase/Hosting:0.

Decisión remota:
`PASS_C6_CANONICAL_ROOT_FIX_EXISTING_HOSTING_DEV_REMOTE_SMOKE`.

Evidencia:
`app/docs/evidence/CORTE6-CANONICAL-ROOT-FIX-HOSTING-LATEST.json`.

## 4. Paridad remota comprobada
El Hosting DEV sirve exactamente:
- `tya-cumulative-read-model-v2.js`;
- `tya-canonical-state-semantics-v2.js`;
- `tya-live-source-refresh-watch-v2.js`;
- `tya-c6-domain-consistency-bridge.js`;
- `tya-canonical-finance-read-model-v2.js`;
- `tya-canonical-shopper-portal-v2.js`;
- `tya-canonical-reservations-guard-v2.js`;
- `index-backend-dev.html` con el wiring v2.

Remote smoke confirmó gates de dominio, Finanzas/Liquidaciones, portal Shopper y Reservas fail-closed. HR provider continúa source-safe, fresca y con616 visitas; el acceso full-profile sin autorización permanece bloqueado401.

## 5. Contratos activos
- HR manda periodos, visitas y estado operativo.
- Una faceta canónica alimenta Dashboard, fases, detalle, histórico, portal y Finanzas.
- Identidad solo por llaves técnicas exactas; conflictos a review queue.
- Perfil completo por campos reales, no por flag heredado.
- Toda visita realizada entra a Liquidaciones; sin cruce financiero exacto no hay lote/pago.
- Mismo contenido HR no produce apply/compose/rerender adicional.
- Periodo, proyecto, vista y scroll se preservan desde el modelo.
- Reservas no usa localStorage ni fixtures como backend y queda fail-closed hasta proveedor real.

## 6. Baseline técnica vigente
HR:14 periodos/616 visitas/208 shoppers; JUL44=GT34+HN10; realizadas40; cuestionario38; submitidas33; liquidationCandidates33; fuera de rango accionable1; evidencia histórica7; duplicados técnicos0.

## 7. Pendiente exacto para cerrar Corte6
Ejecutar validación visual humana acumulativa sobre el build ya publicado:
1. Dashboard y flujo por fases deben coincidir en44/40/38/33/1.
2. Comparativo debe conservar periodos históricos.
3. Tres refresh/focus consecutivos no deben mover scroll, cambiar periodo ni incrementar visitas/shoppers.
4. Administración→Shoppers debe mostrar una sola identidad canónica por persona y datos faltantes honestos.
5. Portal Shopper debe mostrar todas las visitas e histórico de la identidad seleccionada, certificación y beneficios cuando existan.
6. Finanzas, Movimientos, Liquidaciones y Beneficios deben usar el mismo periodo e incluir las40 realizadas y33 submitidas sin afirmar pagos inexistentes.
7. Reportes debe conservar datos y gráficas disponibles.
8. Reservas debe mostrar fuente pendiente/read-only, sin datos demo ni mutaciones.

Solo con resultado humano `APROBADO` se congela Corte6.

## 8. Después del freeze
Conectar fuente exacta de agosto y/o Reservas real según prioridad operativa, mediante contratos y gates separados. No copiar julio, inventar visitas ni activar writes sin autorización específica.

## 9. Seguridad
En el deploy ejecutado: Firestore/Auth/Rules/Storage/HR/legacy/Make/Gemini/pagos/reservas writes0; Cloud Run deploys0; merge=false; producción=false.
