# Academia — impacto R17N FINAL materialización DEV

Fecha: 2026-07-30

## Estado
`PASS_R17N_FINAL_DEV_MATERIALIZATION` con 1,406 writes autorizados y readback 1,406/1,406.

## Contenido que Academia debe incorporar
1. **Fuente viva vs snapshot:** la HR vigente manda; snapshots viejos no se reactivan cuando la fuente cambia.
2. **Identidad real vs source-safe:** identidad real vive en backend protegido y se muestra por RBAC; hashes/placeholders protegen repo/log/evidencia.
3. **Stable keys:** nombre visible no equivale a llave de merge; los enlaces usan evidencia estable y conflictos quedan en revisión.
4. **Preflight fail-closed:** un desajuste detiene el write. En este bloque `live_identity_207` detuvo dos intentos con 0 writes hasta corregir la semántica del hash.
5. **Semántica compartida:** productor y consumidor de una referencia técnica deben usar exactamente el mismo algoritmo. R20 usa `trim + lowercase` antes del SHA y no colapsa espacios internos.
6. **Materialización exacta:** grupos/conteos se autorizan explícitamente y lo no autorizado queda fuera.
7. **Readback:** escribir no cierra el gate; se verifica cada documento materializado. Resultado 1,406/1,406.
8. **Certificación carryover:** conservar certificaciones útiles evita recertificación innecesaria.
9. **Liquidación ≠ pago:** se materializaron 572 controles de liquidación, pero pagos/lotes continuaron en 0.
10. **Post-write:** antes de Auth/RBAC y producción debe existir post-compare y smoke de CX.data/identidad real.

## Rutas por rol a actualizar después del smoke
- Admin/Superadmin: fuente, conflictos, identidad, certificaciones, liquidaciones y auditoría.
- Operativo: lectura HR, shopper real, visitas, estados y revisión.
- Shopper: perfil propio, visitas, certificación histórica y beneficios/liquidaciones.
- Cliente: solo alcance permitido, sin PII operativa no autorizada.

## Manuales/checklists
Agregar checklist de validación:
- fuente vigente;
- conteos esperados;
- identidad por stable key;
- no fallback demo;
- certificaciones correctas;
- liquidaciones sin inferir pagos;
- readback PASS;
- RBAC antes de exposición de PII.

## Clasificación
- Reusable CXOrbia: fuente viva, stable-key, preflight, readback, RBAC.
- Exclusivo TyA: 208 refs, Cinépolis, 77 certificaciones, 616 visitas, 572 controles.
- Claude/prototipo: no cambio inmediato; actualizar guías visuales solo después del smoke.

## Estado seguro
Este documento no activa Auth, Storage, HR writes, pagos, deploy, merge, producción, Make ni Gemini.
