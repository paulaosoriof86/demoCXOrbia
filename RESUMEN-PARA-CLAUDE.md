# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-07-31  
**Estado vivo:** `C6_HUMAN_VISUAL_P0_PROVEN__CANONICAL_DOMAIN_FIX_CODE_PASS__LIVE_HR_ROW_AUDIT_PASS__PENDING_DEV_DEPLOY__NO_PRODUCTION`

## 1. No reabrir
- Corte3 FROZEN; R17N1,406/1,406 no repetir.
- Corte5 cinepolis/14 periodos/616 visitas/current2026-07 PASS.
- Auth91/91; claims5/5; Rules PASS.
- HR live/auto-month PASS.
- Perfil protegido Firestore120 docs/329 campos WRITE+READBACK PASS.
- Finanzas/pagos canónicos source-safe preservados.
- PR#7 draft/open/no merge; producción intacta.

## 2. Qué falló en la validación humana
El remote smoke anterior fue técnico, no semántico. Las capturas probaron:
- Dashboard:44/40 correctos, pero fases mostraban7 realizadas;
- comparativo MAY/JUN sin histórico;
- refresh moviendo contenido y sidebar;
- fuente210 shoppers frente a219 filas y personas divididas en dos identidades;
- perfiles “completos” sin username, contraseña, WhatsApp o histórico;
- certificación invisible para Admin;
- portal Shopper Activas1/Historial0/Beneficios vacío pese al histórico de Admin;
- periodo MAY visible con contenido financiero/liquidaciones JUL;
- Movimientos y Liquidaciones sin la misma fuente histórica del Dashboard Financiero.

Corte6 permanece FAIL; no se congela.

## 3. Causas raíz que Claude no debe reintroducir
- máquinas de estado locales por módulo;
- dedupe visual o append de perfiles sin crosswalk exacto;
- completitud por flag heredado;
- selects DOM como segunda fuente de periodo;
- watchers que rerenderizan por timestamps;
- portal Shopper que reduce historial a una visita por estado;
- finanzas separadas de identidad/periodo canónicos;
- gates que solo validan sintaxis/assets sin comparar tile, drill y portal.

## 4. Contrato backend reusable ya preparado
- `tya-cumulative-read-model-v2.js`: HR manda; identidad/perfil/certificación/finanzas enriquecen solo por llave exacta; unmatched va a review queue.
- `tya-canonical-state-semantics-v2.js`: estado accionable separado de evidencia histórica.
- `tya-live-source-refresh-watch-v2.js`: misma información=no render; cambio real=1 render; preserva content/rail/modelo.
- `tya-c6-domain-consistency-bridge.js`: validación DEV transversal sin modificar módulos/core.

## 5. Máquina de estados única
Todos los módulos deben consumir una sola faceta canónica:
`asignada → agendada → realizada → cuestionario → submitida → liquidada → pagada`.

Una visita submitida también cuenta como realizada y con cuestionario, pero no permanece en las colas pendientes anteriores.

Fuera de rango:
- evidencia histórica puede permanecer;
- KPI operativo solo cuenta casos todavía no resueltos.

## 6. Identidad Shopper
- resolver por ID/crosswalk técnico exacto;
- no fusionar por nombre, teléfono o email;
- perfil sin crosswalk no entra como segunda fila operacional;
- histórico, credenciales, certificación y beneficios convergen en la identidad canónica;
- “perfil completo” exige nombre+contacto+usuario+contraseña reales;
- WhatsApp nunca se inventa.

## 7. Cambios que corresponden al prototipo
Claude debe incorporar de forma nativa, no como hotfix:
1. Dashboard/fases/drill/listados desde una sola máquina de estados.
2. Comparativo histórico desde el resumen real de periodos; métricas no disponibles se muestran honestamente.
3. Refresh sin saltos y sin segundo estado DOM del periodo.
4. Shoppers con una fila por identidad canónica y review queue separada.
5. Perfil completo calculado por campos y certificación visible según rol.
6. Portal Shopper con todas las visitas activas/históricas y beneficios por la misma identidad.
7. Finanzas/Movimientos/Liquidaciones/Beneficios con periodo e identidad canónicos.
8. Gate de release que compare cifras entre tile, detalle, listado y portal.

## 8. Gate real HR viva — PASS
Sobre las616 visitas:
-14 periodos/208 shoppers HR;
-JUL44 GT34/HN10;
-realizadas40;
-cuestionario38;
-submitidas33;
-fuera de rango accionable1;
-evidencia fuera de rango7;
-duplicados de llaves0.

## 9. Estado de publicación
El código v2 está en GitHub, todavía no en Hosting DEV. No ejecutar otro deploy con la autorización consumida.

Gate siguiente:
`GATES FINALES → AUTORIZACIÓN FRESCA 1x HOSTING DEV → REMOTE/HUMAN SEMANTIC PASS → FREEZE C6 → AGOSTO`.

## 10. Documentación asociada
- `app/docs/CAMBIOS-BACKEND-ADDENDUM-C6-HUMAN-P0-CANONICAL-DOMAIN-ROOT-FIX-20260731.md`;
- `app/docs/ACADEMIA-IMPACTO-C6-DOMINIO-CANONICO-Y-ESTADOS-ACCIONABLES-20260731.md`;
- `app/docs/evidence/CORTE6-HUMAN-CUMULATIVE-VISUAL-P0-LATEST.json`;
- `app/docs/evidence/CORTE6-CANONICAL-DOMAIN-CONSISTENCY-GATE-LATEST.json`;
- `app/docs/evidence/CORTE6-LIVE-HR-DOMAIN-READONLY-AUDIT-LATEST.json`.

## 11. Seguridad
No se modificó `/app/modules/*` ni `/app/core/*` en este root fix. Hosting/Cloud Run/data/provider writes0; merge=false; producción=false.
