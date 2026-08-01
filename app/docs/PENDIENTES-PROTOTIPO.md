# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-01  
**Estado vivo:** `C6_DIRECT_ROLE_ENTRY_HOSTING_DEV_PASS__PENDING_HUMAN_VISUAL_ACCUMULATIVE__NO_PRODUCTION`

## 1. Cerrado técnicamente / no reabrir
- Corte 1/2A/3 FROZEN; R17N 1,406/1,406 no repetir.
- Corte 5: 14 periodos/616 visitas/current 2026-07 PASS.
- HR viva, histórico, shoppers, identidad, Finanzas/Liquidaciones, portal Shopper, Reportes y Reservas fail-closed preservados.
- Entrada humana directa por Administración, Cliente y Shopper: PASS local y remoto.
- Usuario + Contraseña en el carril humano: eliminado.
- Firebase Auth real aislado en carril técnico: PASS staff/shopper local y remoto.
- HR conserva 616 visitas después de Auth; Firestore funciona como overlay técnico protegido.
- Refresh y nueva pestaña preservan sesión/contexto en el carril técnico.
- Hosting DEV actualizado exactamente una vez.
- Autorización de deploy consumida con PASS.

Decisión:
`PASS_C6_HUMAN_DIRECT_ROLE_ENTRY_AND_ISOLATED_AUTH_EXISTING_HOSTING_DEV`.

## 2. Pendiente bloqueante inmediato — validación humana acumulativa
Abrir:
`https://cxorbia-backend-dev.web.app/index-backend-dev.html`

### Entrada
- deben aparecer directamente Administración / Coordinación, Portal del Cliente y Shopper / Evaluador;
- no deben aparecer campos de Usuario/Contraseña ni panel técnico;
- cada botón debe entrar directamente al perfil correspondiente.

### Dashboard, hoja de ruta y estados
- julio 44 total, GT 34/HN 10;
- 40 realizadas;
- 38 cuestionarios;
- 33 submitidas;
- 1 fuera de rango accionable;
- tiles, fases, drill-down y listados deben coincidir.

### Histórico y estabilidad
- comparativo MAY/JUN/JUL según fuente;
- tres refresh/focus sin crecimiento o reducción de visitas/shoppers;
- periodo, proyecto, vista, filtros, sidebar, modal y scroll estables.

### Shoppers y portales
- una identidad canónica por persona;
- perfil, certificación e histórico reales;
- Portal Cliente y Portal Shopper sin pérdida;
- Beneficios coherentes con Liquidaciones/pagos.

### Finanzas
- Dashboard financiero, Movimientos, Liquidaciones y Beneficios en el mismo periodo;
- 40 realizadas presentes;
- 33 submitidas no omitidas;
- sin fuente exacta no hay lote ni pago.

### Reportes y Reservas
- Reportes conserva datos, gráficas y funciones disponibles;
- Reservas muestra fuente pendiente/read-only;
- cero fixtures/localStorage presentados como backend;
- mutaciones bloqueadas.

Solo después corresponde `APROBADO C6 → FREEZE`.

## 3. Agosto y postulaciones — siguiente bloque operacional urgente
Después del freeze:
`FUENTE EXACTA AGOSTO → RECONCILIACIÓN HR/PLATAFORMA → DISPONIBLES → POSTULACIONES → GATE MULTIROL → AUTORIZACIÓN ESPECÍFICA DE WRITES/CUTOVER → READBACK → REMOTE SMOKE → PRODUCCIÓN`.

No copiar julio ni inventar visitas. La autorización DEV ya fue consumida y no cubre writes ni producción.

## 4. P1/P2 preservado
- PDF sin todas las gráficas finales.
- Excel sin formato final.
- reportKit/exportaciones transversales.
- copy de fuentes/readiness.

## 5. HOLD de identidad
Casos sin match canónico exacto permanecen en review queue. Nunca resolver por nombre, teléfono, correo o similitud visual.

## 6. Regla de continuidad
Todo cambio futuro debe pasar por separado:
- gate de entrada humana;
- gate técnico Auth;
- gate acumulativo de dominio/Finanzas/Shopper/Reportes.

Un PASS técnico no puede volver a redefinir la UX humana.

## 7. Siguiente secuencia
`VALIDACIÓN HUMANA ACUMULATIVA → APROBADO/FREEZE C6 → AGOSTO/DISPONIBLES/POSTULACIONES → CUTOVER/PRODUCCIÓN`.

## 8. Estado seguro
Hosting DEV PASS; producción intacta; cero writes no autorizados; merge=false; autorización de redeploy consumida.