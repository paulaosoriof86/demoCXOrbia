# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-01  
**Estado vivo:** `P0_PROVEN__DIRECT_ROLE_ENTRY_REPLACED_BY_TECHNICAL_AUTH_FORM__DEV_BLOCKED__NO_PRODUCTION`

## 1. Cerrado técnicamente / no reabrir
- Corte 1/2A/3 FROZEN; R17N 1,406/1,406 no repetir.
- Corte 5: 14 periodos/616 visitas/current 2026-07 PASS.
- HR viva, histórico, shoppers, identidad, Finanzas/Liquidaciones, portal Shopper y Reservas fail-closed preservados.
- E2E técnico con cuentas DEV existentes staff y shopper PASS local y remoto.
- HR conserva 616 visitas después de Auth; Firestore funciona como overlay protegido.
- Refresh y nueva pestaña preservan sesión y contexto en el carril técnico.

## 2. P0 bloqueante inmediato — restaurar entrada directa por perfiles
La pantalla actual Usuario + Contraseña es una regresión.

El acceso humano aprobado debe mostrar directamente:
- Administración / Coordinación;
- Portal del Cliente;
- Shopper / Evaluador;
- roles adicionales configurados cuando corresponda.

La causa está localizada en `app/adapters/tya-dev-entry-auth-gate-v1.js`, que elimina `.role-btn` y sustituye el selector nativo de `app/app.js` por `cxDevEntryAuth`.

### Corrección exacta
- conservar `app/app.js` como autoridad visual;
- no modificar `app/modules/*` ni `app/core/*`;
- hacer que el adapter técnico no se ejecute en el carril humano;
- habilitar Usuario + Contraseña solo con un gate técnico E2E explícito;
- smoke humano: perfiles directos visibles y cero campos de credenciales;
- E2E técnico: credenciales reales, claims, HR 616, refresh y nueva pestaña.

## 3. Validación humana acumulativa después del root fix
Abrir:
`https://cxorbia-backend-dev.web.app/index-backend-dev.html`

Debe aparecer el selector directo aprobado. Después revisar:
- Dashboard/hoja de ruta: julio 44, GT 34, HN 10, realizadas 40, cuestionario 38, submitidas 33 y fuera de rango accionable 1;
- histórico MAY/JUN/JUL;
- tres refresh/focus sin crecimiento, reducción ni salto;
- Shoppers, perfil, certificación e histórico;
- Portal Cliente y Portal Shopper;
- Finanzas, Movimientos, Liquidaciones y Beneficios;
- Reportes;
- Reservas read-only/fuente pendiente.

Solo después de esa revisión corresponde `APROBADO → FREEZE C6`.

## 4. Agosto y postulaciones — siguiente bloque operacional urgente
Después del freeze:
`FUENTE EXACTA AGOSTO → RECONCILIACIÓN HR/PLATAFORMA → DISPONIBLES → POSTULACIONES → GATE MULTIROL → AUTORIZACIÓN ESPECÍFICA → READBACK → REMOTE SMOKE → PRODUCCIÓN`.

No copiar julio ni inventar visitas. La autorización anterior de Hosting DEV quedó consumida y no cubre este root fix, writes ni producción.

## 5. P1/P2 preservado
- PDF sin todas las gráficas finales.
- Excel sin formato final.
- reportKit/exportaciones transversales.
- copy de fuentes/readiness.

## 6. HOLD de identidad
Casos sin match canónico exacto permanecen en review queue. Nunca resolver por nombre, teléfono, correo o similitud visual.

## 7. Regla de continuidad
El PASS técnico no puede volver a redefinir la UX humana. Todo cambio parte de la misma baseline acumulativa y pasa gates separados de entrada humana, Auth técnico y dominio transversal.

## 8. Siguiente secuencia
`ROOT FIX ENTRADA DIRECTA → QA LOCAL → AUTORIZACIÓN DEV → REDEPLOY ÚNICO → VALIDACIÓN HUMANA → FREEZE C6 → AGOSTO/POSTULACIONES`.

## 9. Estado seguro
Hosting DEV actual bloqueado por el P0 visible; producción intacta; sin writes nuevos, merge ni producción.