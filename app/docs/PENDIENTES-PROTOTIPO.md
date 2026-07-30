# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-07-30  
**Estado vivo:** `R17N_FINAL_DEV_MATERIALIZED_1406__READBACK_PASS__POST_COMPARE_SMOKE_PENDING`

## 1. Cerrado / no reabrir
- M1 / Corte 1 / Corte 2A: FROZEN/APROBADO.
- Corte 3: `CXORBIA-TYA-CORTE3-V182-20260729` FROZEN.
- No V183/R33; no nueva candidata por rutina.
- HR actual hasta julio: 14 periodos /616 visitas /208 refs.
- Identidad shopper actual: 208/208 con target.
- R17N FINAL materialización DEV: 1,406 writes autorizados y 1,406/1,406 readback PASS.

## 2. Backend materializado
Grupos existentes ahora en `cxorbia-backend-dev` bajo topología canónica:
- foundation 16;
- perfiles legacy 120;
- perfiles HR actuales 5;
- certificaciones 77;
- visitas 616;
- controles de liquidación 572.

Identidad:
- 201/201 shoppers canónicos existentes ya exponen nombre real visible;
- 120+5 perfiles nuevos fueron creados con identidad real aplicable desde fuente;
- source-safe sigue siendo solo protección del repo/log/evidencia.

## 3. Pendiente backend inmediato — no es tarea Claude
`POST-COMPARE READ-ONLY → SMOKE CX.data CANÓNICO + IDENTIDAD REAL → VALIDACIÓN OPERATIVA`.

Validar en el smoke:
- única topología canónica activa;
- 14 periodos /616 visitas hasta julio;
- proyectos/periodos no confundidos;
- shopperRef → perfil real correcto;
- 77 certificaciones y carryover correcto;
- 572 controles de liquidación;
- 196 links financieros exactos preservados;
- pagos no inferidos;
- sin fallback demo/localStorage;
- sin fuga de PII por rol.

## 4. HOLD preservado
No resolver silenciosamente desde frontend:
- tenant update 1;
- existing profile updates 22;
- legacy profile holds 7;
- certification hold 1;
- Agosto HN por inconsistencia país/tab;
- deletes;
- pagos/lotes;
- Auth/RBAC changes hasta su corte;
- Make/Gemini/Storage reales.

## 5. Próxima intervención de Claude
Ninguna por rutina.

Solo intervenir si el smoke demuestra P0 reproducible y localizado por archivo/módulo. Si no hay P0, continuar con backend/Auth/RBAC sin nueva candidata.

Cuando se valide UI, asegurar:
- Admin/Operativo ve identidad real autorizada;
- Shopper ve su propio perfil/historial;
- Cliente solo alcance permitido;
- `Shopper protegido` no queda como identidad permanente;
- Cinépolis sigue configurable, no hardcodeado.

## 6. Backlog P1/P2 no bloqueante
- PDF: gráfica/impresión de reportes.
- Excel: formato básico.
- `reportKit`: consistencia transversal.
- copy de fuentes/estados honestos.
- equivalencia de alcance entre exportaciones.

## 7. Academia/manuales
Pendiente actualizar rutas/contenido con:
- snapshot vs HR viva;
- perfil real vs referencia HR vs Auth;
- source-safe vs PII protegida;
- stable keys y review de conflictos;
- preflight fail-closed;
- materialización + readback;
- certificación carryover;
- liquidación/control de pago ≠ pago confirmado.

## 8. Estado seguro
Firestore writes autorizados ejecutados: 1,406. Auth/Storage/HR/legacy writes=0; deletes=0; pagos/lotes=0; deploy=0; merge=false; producción=false; Make/Gemini=0.
