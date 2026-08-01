# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-07-31  
**Estado vivo:** `C6_HUMAN_VISUAL_P0_PROVEN__DOMAIN_FINANCE_SHOPPER_PORTAL_FIX_PASS__LIVE_HR_AUDIT_PASS__PENDING_DEV_DEPLOY__NO_PRODUCTION`

## 1. No reabrir
- Corte3 FROZEN; R17N1,406/1,406 no repetir.
- Corte5:14 periodos/616 visitas/current2026-07 PASS.
- Auth91/91; claims5/5; Rules PASS.
- HR live/auto-month PASS.
- Perfil protegido Firestore120 docs/329 campos WRITE+READBACK PASS.
- Finanzas/pagos canónicos source-safe preservados.

## 2. FAIL humano que el prototipo no puede repetir
- Dashboard44/40 y fases7;
- comparativo histórico vacío;
- refresh con saltos;
- fuente210 shoppers/listado219;
- identidad, perfil, credenciales, WA, certificación e histórico divididos;
- portal Shopper Activas1/Historial0/Beneficios vacío;
- periodo financiero incoherente;
-33 submitidas omitidas de Liquidaciones.

## 3. Causas raíz
- máquinas de estado por módulo;
- append/dedupe sin crosswalk exacto;
- completitud por flag;
- select DOM como segunda fuente de periodo;
- watcher por timestamps/scroll incorrecto;
- portal con `.find()` por estado;
- switch financiero que no reconocía estados posteriores.

## 4. Contratos backend preparados
- `tya-cumulative-read-model-v2.js`: HR manda; overlay exacto; unmatched a review queue.
- `tya-canonical-state-semantics-v2.js`: evidencia histórica vs estado accionable.
- `tya-live-source-refresh-watch-v2.js`: mismo contenido=no render; cambio real=1 render.
- `tya-c6-domain-consistency-bridge.js`: consistencia transversal DEV.
- `tya-canonical-finance-read-model-v2.js`:40 realizadas/33 submitidas presentes en Liquidaciones; sin fuente exacta, review y bloqueo de pago.
- `tya-canonical-shopper-portal-v2.js`: sesión exacta, perfil/certificación/acceso e histórico completo.

## 5. Reglas nativas para Claude
1. Una sola máquina:
`asignada → agendada → realizada → cuestionario → submitida → liquidada → pagada`.
2. Tile, fase, drill, listado, portal y finanzas deben sumar lo mismo.
3. Perfil sin crosswalk exacto no entra como segunda fila operacional.
4. No fusionar por nombre/teléfono/email.
5. Perfil completo exige nombre+contacto+usuario+contraseña reales.
6. Portal Shopper usa todas las visitas; no una por estado.
7. Certificación visible según rol.
8. Periodo único desde el modelo, nunca desde select DOM independiente.
9. Liquidaciones derivadas de facetas, no de literales.
10. Gate de release semántico y acumulativo, incluyendo Reportes y Reservas.

## 6. Datos faltantes
Username/password pueden derivarse en lectura solo para identidad exacta mediante el patrón configurable. WhatsApp no se inventa. Persistir/complementar perfil o Auth requiere write plan y autorización específica.

## 7. Gates PASS
Evidencia v5:
- `PASS_C6_CANONICAL_DOMAIN_CONSISTENCY`;
- `PASS_C6_CANONICAL_FINANCE_LIQUIDATION_COMPLETENESS`;
- `PASS_C6_CANONICAL_SHOPPER_PORTAL_CONTRACT`;
- `PASS_C6_LIVE_HR_ROW_LEVEL_CANONICAL_STATE`.

HR:14 periodos/616 visitas/208 shoppers; JUL44 GT34/HN10; realizadas40; cuestionario38; submitidas33; fuera de rango accionable1; evidencia histórica7; duplicados0.

## 8. Publicación
El código está en GitHub, no en Hosting DEV. Autorización anterior consumida.

`AUTORIZACIÓN FRESCA 1x HOSTING DEV → REMOTE/HUMAN SEMANTIC PASS → FREEZE C6 → AGOSTO`.

## 9. Seguridad
`/app/modules/*` y `/app/core/*` intactos. Hosting/Cloud Run/data/provider writes0; merge=false; producción=false.
