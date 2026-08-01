# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-07-31  
**Estado vivo:** `C6_HUMAN_VISUAL_P0_PROVEN__CANONICAL_DOMAIN_AND_FINANCE_FIX_CODE_PASS__LIVE_HR_ROW_AUDIT_PASS__PENDING_DEV_DEPLOY__NO_PRODUCTION`

## 1. No reabrir
- Corte3 FROZEN; R17N1,406/1,406 no repetir.
- Corte5 cinepolis/14 periodos/616 visitas/current2026-07 PASS.
- Auth91/91; claims5/5; Rules PASS.
- HR live/auto-month PASS.
- Perfil protegido Firestore120 docs/329 campos WRITE+READBACK PASS.
- Finanzas/pagos canónicos source-safe preservados.
- PR#7 draft/open/no merge; producción intacta.

## 2. Human visual FAIL P0
El smoke anterior fue técnico, no semántico. Las capturas probaron:
- Dashboard44/40 correcto, pero fases con7 realizadas;
- comparativo MAY/JUN sin histórico;
- refresh moviendo contenido/sidebar;
- fuente210 shoppers frente a219 filas y personas divididas;
- perfiles “completos” sin credenciales, WA, certificación o histórico;
- portal Shopper Activas1/Historial0/Beneficios vacío;
- periodo MAY con contenido financiero JUL;
- Movimientos/Liquidaciones/Beneficios fragmentados;
-33 visitas submitidas omitidas de Liquidaciones.

Corte6 permanece FAIL; no se congela.

## 3. Causas que Claude no debe reintroducir
- máquinas de estado locales por módulo;
- dedupe visual o append de perfiles sin crosswalk exacto;
- completitud por flag heredado;
- selects DOM como segunda fuente de periodo;
- watchers que rerenderizan por timestamps;
- portal Shopper limitado a una visita por estado;
- finanzas separadas de identidad/periodo canónicos;
- liquidaciones derivadas de un `switch` que ignora estados posteriores;
- gates que solo validan sintaxis/assets.

## 4. Contratos backend reusable preparados
- `tya-cumulative-read-model-v2.js`: HR manda; perfil/certificación/finanzas enriquecen solo por llave exacta; unmatched va a review queue.
- `tya-canonical-state-semantics-v2.js`: evidencia histórica separada de estado accionable.
- `tya-live-source-refresh-watch-v2.js`: misma información=no render; cambio real=1 render; preserva content/rail/modelo.
- `tya-c6-domain-consistency-bridge.js`: validación DEV transversal sin modificar módulos/core.
- `tya-canonical-finance-read-model-v2.js`: toda visita realizada entra al ciclo de liquidación; fuente exacta conserva autoridad y ausencia de cruce bloquea lote/pago.

## 5. Máquina de estados única
Todos los módulos deben consumir:
`asignada → agendada → realizada → cuestionario → submitida → liquidada → pagada`.

Una visita submitida cuenta como realizada y con cuestionario, pero no permanece en colas pendientes anteriores.

Fuera de rango:
- evidencia histórica puede permanecer;
- KPI operativo solo cuenta casos no resueltos.

## 6. Identidad Shopper
- resolver por ID/crosswalk técnico exacto;
- no fusionar por nombre, teléfono o email;
- perfil sin crosswalk no entra como segunda fila operacional;
- histórico, credenciales, certificación y beneficios convergen en identidad canónica;
- perfil completo exige nombre+contacto+usuario+contraseña reales;
- WhatsApp nunca se inventa.

## 7. Finanzas y Liquidaciones
El prototipo debe:
- incluir las40 visitas realizadas de julio;
- reconocer33 submitidas,5 pendientes de submit y2 pendientes de cuestionario;
- no omitir `submitida`;
- mostrar sin fuente exacta como revisión, no como listo para lote/pago;
- conservar pago confirmado solo con evidencia source-safe/real;
- usar el mismo periodo e identidad en Dashboard Financiero, Movimientos, Liquidaciones y Beneficios.

## 8. Cambios nativos requeridos en prototipo
1. Dashboard/fases/drill/listados desde una sola máquina de estados.
2. Comparativo histórico desde resumen real.
3. Refresh sin saltos ni segundo estado DOM.
4. Shoppers con una fila por identidad canónica y review queue separada.
5. Perfil completo por campos y certificación visible.
6. Portal Shopper con todas las visitas activas/históricas.
7. Finanzas/Movimientos/Liquidaciones/Beneficios con periodo e identidad únicos.
8. Liquidaciones derivadas de facetas canónicas, no literales.
9. Gate de release que compare tile, drill, listado, portal y finanzas.

## 9. Gates PASS
Evidencia v4:
- `PASS_C6_CANONICAL_DOMAIN_CONSISTENCY`;
- `PASS_C6_CANONICAL_FINANCE_LIQUIDATION_COMPLETENESS`;
- `PASS_C6_LIVE_HR_ROW_LEVEL_CANONICAL_STATE`.

HR viva:
-14 periodos/616 visitas/208 shoppers;
-JUL44 GT34/HN10;
-realizadas40;
-cuestionario38;
-submitidas33;
-liquidationCandidates33;
-fuera de rango accionable1;
-evidencia histórica7;
-duplicados de llaves0.

## 10. Estado de publicación
El código v2 está en GitHub, no en Hosting DEV. La autorización anterior está consumida.

Gate siguiente:
`AUTORIZACIÓN FRESCA 1x HOSTING DEV → REMOTE/HUMAN SEMANTIC PASS → FREEZE C6 → AGOSTO`.

## 11. Documentación
- addendum P0/domain root fix;
- addendum Finanzas/Liquidaciones canónicas;
- Academia dominio/estados accionables;
- evidencias P0 y auditoría v4.

## 12. Seguridad
No se modificó `/app/modules/*` ni `/app/core/*`. Hosting/Cloud Run/data/provider writes0; merge=false; producción=false.
