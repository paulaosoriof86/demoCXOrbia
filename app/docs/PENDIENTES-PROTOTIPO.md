# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-04  
**Estado vivo:** `SOURCE_STATIC_PASS__RUNTIME_MULTIROLE_PENDING__CLAUDE_PORTABLE_V4_HOLD__NO_PRODUCTION`

## 1. Bloqueante actual real

El gate source/static ya fue ejecutado sobre checkout autenticado y obtuvo:

`PASS_PHASE_A_COMPLETE_COMPOSITION_SOURCE_STATIC_GATE_WITH_DOCUMENTED_WARNINGS`.

Evidencia:

- run `30910224561`;
- artifact `8892730161`;
- 53/53 blobs críticos;
- repositorio sin delta después del gate;
- cero provider/data writes.

El bloqueante actual pasa a:

`RUNTIME_MULTIROLE_ACCUMULATIVE_GATE_NOT_EXECUTED`.

No corresponde solicitar aprobación visual final antes de ese runtime.

## 2. Causas raíces del carril ya cerradas

- runner histórico referenciaba gates renombrados;
- override `backend-dev-auth.local.js` fue confundido con asset obligatorio aunque está gitignored por diseño;
- el escáner de secretos detectaba sus propios patrones;
- se instaló clasificación exacta de fixtures conocidos sin permitir hits desconocidos;
- la solicitud exitosa quedó desactivada después de una ejecución.

Esto evita repetir el mismo ciclo de FAIL por causas instrumentales.

## 3. Logros cerrados

- RC Phase A smoke técnico y visual/consola PASS preservado;
- M1/Corte 1 FROZEN/APROBADO preservado;
- Corte 2A/V174 FROZEN/APROBADO preservado;
- Corte 3/V182 `FROZEN_ACTIVE_BASELINE` preservado;
- C6 entrada/HR/Staff/Shopper/Cliente/Finanzas/Reservas preservado;
- 29 decisiones únicas cerradas;
- 0 restauraciones requeridas;
- Ficha, Revisión, Documentos, Costos y `cliente-data.js` cerrados;
- report kit inventariado;
- manifest final creado;
- gate source/static PASS.

## 4. Pendiente inmediato

1. preparar gate runtime multirol acumulativo;
2. ejecutar Admin, Cliente y Shopper con tenant/proyecto/periodo/sourceRevision coherentes;
3. validar login/sesión, recarga y nueva pestaña;
4. validar Dashboard, Mi Día, Histórico, Visitas, Ficha, Revisión, Postulaciones y Reservas;
5. validar Shoppers, Perfil, Certificación, Cuestionario, Documentos, Beneficios y reportes;
6. validar Finanzas y portales;
7. decidir overlay A+B solo con prueba de no pérdida;
8. integrar Login Claude únicamente después de un paquete corregido GO;
9. único DEV si cambia `app/`;
10. `CHECKPOINT_VISUAL_PHASE_A_COMPLETA`;
11. freeze;
12. agosto/disponibles/postulaciones;
13. cutover autorizado.

## 5. Claude portable v4

Paquete:

`Prototype development request (20).zip`  
SHA-256: `862e415df3d3a24be09ffbd48cb74f98779a59d2a2265587969c1880b48841c9`.

Decisión:

`HOLD_CLAUDE_LOGIN_PORTABLE_V4__NOT_READY_FOR_APPLY_DELTA_DIRECTLY`.

Bloqueos documentados:

- evidencia móvil no válida: `preview-mobile.png` es `924×540`;
- selector multi-país incompleto;
- token `--gcx-navy-2` indefinido;
- README con HEAD obsoleto;
- paquete no contiene integración, bridge ni ruta canónica.

Fuentes:

- `AUDITORIA-FOCAL-CLAUDE-LOGIN-PORTABLE-V4-20260804.md`;
- `PROMPT-CLAUDE-CORRECCION-LOGIN-PORTABLE-V4-20260804.md`;
- `MATRIZ-TRAZABILIDAD-FORENSE-A-IMPLEMENTACION-Y-CLAUDE-20260804.md`.

No aplicar archivos del paquete actual a `app/`.

## 6. Phase A que debe cubrir el runtime

### Base

- entrada y single-login;
- tenant/proyecto/periodo;
- Auth/claims/scopes;
- HR viva y refresh in-place;
- `CX.data` canónico;
- build-lock, PWA y service worker.

### Operación

- Dashboard Operativo y drilldowns;
- Mi Día/hoja de ruta;
- Proyectos, Periodos, HR e Histórico;
- Visitas, Ficha y Revisión Admin;
- Postulaciones;
- Reservas;
- Shoppers;
- notificaciones.

### Shopper/perfiles

- Disponibles;
- Mis Visitas;
- Reservas;
- Mi Día;
- Mi Perfil;
- cuestionario;
- certificaciones históricas/presentadas;
- documentos;
- beneficios;
- reportes Shopper.

### Finanzas

- Dashboard Financiero;
- Liquidaciones;
- Movimientos;
- Costos;
- CxP/CxC;
- lotes/pagos en estado real;
- multi-país/multi-moneda;
- revisión, conciliación y pago separados;
- modelo delegado, `localBilling=false`, regalía 0, Q60/L200.

### Portales/reportes

- Portal Cliente;
- Portal Shopper;
- Reportes Admin/Cliente/Shopper;
- PDF/XLSX/PPTX;
- branding, periodo, alcance, fuente y filas coherentes;
- cero métricas fabricadas.

## 7. Overlay pendiente de decisión

`app/adapters/tya-ab-cumulative-composition-v1.js`

Clasificación:

`P1_SUPERSEDED_LOADED_OVERLAY__NOT_P0_PROVEN`.

No remover sin runtime acumulativo.

## 8. Auth y seguridad pendientes

- claims completos tenant/persona/proyecto/país;
- activación/reset seguro;
- eliminar dependencia productiva de patrón predecible;
- Firebase Auth como autoridad;
- no JWT Emergent;
- no PII/rol en URL;
- no token en localStorage;
- rotar/revocar la cuenta de servicio expuesta en Emergent;
- Storage sensible solo con rules/auditoría;
- pagos reales bloqueados.

## 9. Multi-país

Falta probar:

- 1 país;
- 2–3 países;
- 10–12 países;
- búsqueda/multiselect;
- scope autorizado;
- monedas separadas;
- sin sumar monedas incompatibles.

Claude corrige la UI portable. ChatGPT valida y aplica scopes reales.

## 10. P1/P2 vivos

- overlay A+B superseded;
- PDF sin algunas gráficas;
- Excel con formato básico;
- override Auth DEV local no versionado por diseño.

## 11. Estado seguro

- Login Claude aplicado: no;
- deploy nuevo: 0;
- provider writes: 0;
- Make/Gemini/pagos: 0;
- merge: false;
- producción: intacta.
