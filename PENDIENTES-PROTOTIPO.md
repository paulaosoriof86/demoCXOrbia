# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-07-31  
**Estado vivo:** `C6_P0_OPEN__PROTECTED_READONLY_PASS__USERNAME88_READY__PASSWORD68_PATTERN_VERIFIED_20_NONPATTERN__RUNTIME_FIX_PREPARED__NO_WRITE__NO_DEPLOY__NO_PRODUCTION`

## 1. Cerrado / no reabrir
- Corte1/2A/3 FROZEN; R17N1,406/1,406 no repetir.
- Corte5 cinepolis/14 periodos/616 visitas/current2026-07 PASS.
- Auth91/91, claims5/5, Rules PASS; no reimportar/resetear por rutina.
- HR live/auto-month PASS.
- último one-shot Cloud Run+Hosting consumido; no reutilizar.

## 2. P0 Shopper/perfil
La visual anterior falló porque Shopper quedó sin shopperId y Admin estaba usando display-only source-safe.

Read-only protegido confirma que 91/91 shopper claims resuelven perfil real. La nueva visual debe usar Auth/claims/Rules protected runtime.

## 3. Datos ya existentes
Firestore shoppers340:
- phone123;
- email39;
- username0;
- documento0;
- banco/pago0.

Teléfono/email deben aparecer sin migración adicional cuando protected runtime sea publicado.

## 4. Histórico/KPI
- 616/616 visitas con shopperId;
- 194 perfiles referenciados194/194;
- submitida545, cuestionario61, agendada4, realizada3, fuera_rango3.

Runtime fix preparado para que `submitida` no desaparezca del histórico/KPI. No rediseñar módulo.

## 5. Username
Dry-run exacto desde bundle cifrado:
- 109 registros shopper;
- 88 exactos stable-ID + Auth claim;
- username fill-missing88;
- conflictos0;
- 21 sin perfil exacto HOLD.

Plan Firestore disabled; requiere autorización específica.

## 6. Password
Verificación hash/patrón:
- exactos88;
- `Nombre123*` equivalente verificado para68;
- 20 no siguen ese patrón.

No mostrar contraseña universal falsa. Firebase Auth no devuelve plaintext vigente. Para 20 preservar credencial histórica o reset controlado bajo autorización Auth.

## 7. Datos extra de plataforma vigente
`tya_shoppers_extra` contiene datos adicionales reales; recuperar desde el export ya entregado por export/import seguro y match estable. No conectar legacy.

File Library está fallando temporalmente al recuperar el archivo; no pedir reenvío todavía.

## 8. P1/P2 preservado
- PDF/gráficas;
- Excel/formato;
- reportKit/exportaciones;
- copy/readiness.

## 9. Agosto
No ejecutar delta agosto hasta cerrar P0 y congelar Corte6.

## 10. Siguiente bloque
`RECUPERAR/RECONCILIAR EXPORT PERFIL EXTRA → COMBINAR DELTA CON USERNAME88 → AUTORIZACIÓN EXACTA → READBACK → REDEPLOY DEV → VISUAL PROTEGIDA`.

Producción/merge siguen bloqueados.
