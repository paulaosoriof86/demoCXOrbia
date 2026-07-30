# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-07-30  
**Estado vivo:** `R17N_FINAL_DEV_MATERIALIZED_1406__C5_CXDATA_PERIOD_MODEL_FIXED__READONLY_RESMOKE_PASS__OPERATIONAL_VISUAL_PENDING`

## 1. Cerrado / no reabrir
- M1 / Corte 1 / Corte 2A: FROZEN/APROBADO.
- Corte 3: `CXORBIA-TYA-CORTE3-V182-20260729` FROZEN.
- No V183/R33; no nueva candidata por rutina.
- HR actual hasta julio: 14 periodos /616 visitas /208 refs.
- Identidad shopper actual: 208/208 con target, resolviendo a 194 perfiles canónicos únicos.
- R17N FINAL materialización DEV: 1,406 writes autorizados y 1,406/1,406 readback PASS.
- Post-compare proveedor/identidad: PASS.
- P0 backend `P0_C5_CXDATA_PERIOD_MODEL_MISMATCH`: corregido técnicamente y re-smoke read-only PASS.

## 2. Backend materializado
Grupos existentes ahora en `cxorbia-backend-dev` bajo topología canónica:
- foundation 16;
- perfiles legacy 120;
- perfiles HR actuales 5;
- certificaciones 77;
- visitas 616;
- controles de liquidación 572.

Identidad:
- 616/616 visitas tienen nombre real y target shopper existente;
- 194/194 perfiles canónicos únicos referenciados tienen nombre real;
- 77/77 certificaciones apuntan a shopper existente;
- source-safe sigue siendo solo protección de repo/log/evidencia.

## 3. Corte 5 — consumidor CX.data
P0 corregido en `app/core/backend-firebase.js`:
- proyecto padre `cinepolis` separado de periodos;
- `CX.data.periods` lee la subcolección canónica `projects/cinepolis/periods`;
- no transforma los 30 documentos raíz de proyectos en periodos;
- `currentPeriodId` stale/no canónico se reemplaza por periodo canónico.

Re-smoke final:
- source=firestore;
- fallback=false;
- projects=1;
- periods=14;
- visits=616;
- currentProjectId=cinepolis;
- currentPeriodId=2026-07;
- period IDs exactos contra provider;
- read-only/writeMode disabled;
- blockers=0.

## 4. Pendiente inmediato — validación operativa/visual
No hay P0 técnico abierto por el modelo de periodos.

Siguiente gate, no tarea Claude por rutina:
`BIND DEV READ-ONLY A cxorbia-backend-dev → UN ÚNICO HOSTING DEV CONTROLADO → VALIDACIÓN VISUAL/OPERATIVA CON DATOS REALES`.

En pantalla se debe comprobar como mínimo:
- proyecto `Cinépolis` como proyecto padre y selector de periodos con exactamente los 14 periodos canónicos;
- periodo actual coherente (`2026-07` al snapshot actual) y cambio de periodo sin convertir meses en proyectos;
- 616 visitas accesibles según periodo/rol;
- identidad real visible en Admin/Operativo donde corresponda;
- Shopper limitado a su propia identidad y alcance;
- 77 certificaciones carryover visibles según reglas;
- liquidaciones como control, sin presentar pago confirmado donde no existe;
- cero fallback demo/localStorage;
- cero `Shopper protegido` como identidad permanente cuando el perfil real existe;
- no exposición indebida de PII por rol.

Solo un P0 visual reproducible y localizado justifica corrección frontend. Si no aparece, no pedir nueva candidata.

## 5. HOLD preservado
No resolver silenciosamente desde frontend:
- tenant update 1;
- existing profile updates 22;
- legacy profile holds 7;
- certification hold 1;
- Agosto HN por inconsistencia país/tab;
- deletes;
- pagos/lotes;
- Auth/RBAC changes hasta Corte 6;
- Make/Gemini/Storage reales.

## 6. Backlog P1/P2 no bloqueante
- PDF: gráfica/impresión de reportes.
- Excel: formato básico.
- `reportKit`: consistencia transversal.
- copy de fuentes/estados honestos.
- equivalencia de alcance entre exportaciones.

Estos puntos no reabren Corte 3 ni bloquean por sí solos el freeze de Corte 5 si no impiden operación Phase A.

## 7. Academia/manuales
Pendiente actualizar rutas/contenido con:
- snapshot vs HR viva;
- perfil real vs referencia HR vs Auth;
- source-safe vs PII protegida;
- proyecto padre vs periodo;
- stable keys y review de conflictos;
- materialización + readback + smoke consumidor;
- certificación carryover;
- liquidación/control de pago ≠ pago confirmado;
- validación visual por rol.

## 8. Estado seguro
R17N: Firestore writes autorizados ejecutados 1,406. Fix/re-smoke: provider reads únicamente; Firestore/Auth/Storage/HR/legacy writes=0; deletes=0; pagos/lotes=0; deploy=0; merge=false; producción=false; Make/Gemini=0.
