# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-01  
**Estado vivo:** `P0_DATOS_DIRECT_ROLE_ROOT_FIX_APPLIED_PENDING_CUMULATIVE_GATES_AND_SINGLE_DEV_REDEPLOY__NO_PRODUCTION`

## 1. P0 bloqueante actual
El build Hosting DEV anterior muestra entrada directa, pero puede abrir un shell sin proyectos, periodos ni datos. El PASS previo queda supersedido.

No continuar validación funcional del build anterior.

## 2. Root fix aplicado y pendiente de gates
- separar humano source-safe de técnico protegido;
- eliminar `cxProtectedRuntime` de la URL humana;
- preservar 14 periodos/616 visitas/208 shoppers;
- mantener watcher HR humano;
- fallback seguro si falla el overlay protegido;
- gate browser después del clic y tras tres recargas;
- E2E técnico separado.

## 3. Resultado requerido
`PASS_C6_HUMAN_DIRECT_ROLE_AND_CANONICAL_DATA_14_616_208_EXISTING_HOSTING_DEV`.

Debe demostrar:
- roles directos visibles;
- credenciales técnicas ausentes;
- 14/616/208;
- proyecto/periodo activos;
- datasource ready;
- cero shell vacío;
- tres recargas estables;
- staff/shopper E2E técnico PASS;
- un único deploy DEV;
- cero writes/merge/producción.

## 4. Validación humana posterior
Solo con evidencia remota PASS se solicita revisar Dashboard 44/40/38/33/1, histórico, Shoppers, portales, Finanzas, Reportes y Reservas. `APROBADO C6` congela la baseline.

## 5. Agosto y postulaciones
Bloque posterior al freeze:
`FUENTE EXACTA AGOSTO → RECONCILIACIÓN → DISPONIBLES → POSTULACIONES → GATE MULTIROL → AUTORIZACIÓN DE WRITES/CUTOVER → PRODUCCIÓN`.

## 6. P1/P2 preservado
- PDF sin todas las gráficas finales.
- Excel sin formato final.
- exportaciones transversales.
- copy de fuentes/readiness.

## 7. Estado seguro
Producción intacta; sin writes de Auth, Firestore, Rules, Cloud Run, HR, Storage, Make, Gemini, pagos o Reservas; merge=false.
