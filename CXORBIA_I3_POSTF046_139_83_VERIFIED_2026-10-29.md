# CXOrbia Recovery · I3 · Postflight F-046 (READ-ONLY)

**Corte local Guatemala:** 28 de octubre de 2026, noche. **Ejecución UTC:** 29 de octubre de 2026.

## Identidad inmutable y alcance

- Repositorio: `paulaosoriof86/demoCXOrbia`; rama: `recovery/cxorbia-phase-a-20260831`.
- DEV: `cxorbia-backend-dev`, tenant `tya`, programa `cinepolis`.
- HR viva exacta: `4fc8def718fd1504f5d76a1fbc80b6901cbf711ec2b89f4dfc3a81ecbbca517a`.
- Excel humano aprobado: 139 parejas SÍ, 83 grupos, digest `ac3e15184316d62aa53942359e857f2c34dec486a2ca41057e529a39f062d872`.
- Las columnas de **Trazabilidad** del Excel son D = ID HR canónico, E = ID cuenta técnica. No inferir identidad por prefijos.
- No se usaron similitudes de nombre, mayúsculas/minúsculas o tildes como autoridad suficiente para fusionar. Se aplicó normalización únicamente para el cotejo.

## F-046: canario multicolección protegido

1. Primera ejecución [#40816634595](https://github.com/paulaosoriof86/demoCXOrbia/actions/runs/40816634595): `HOLD_F046_CANARY_PREWRITE` tras invertir accidentalmente las dos columnas; ninguna escritura. Se corrigió el mapeo siguiendo los encabezados reales.
2. Preflight independiente [#40816935808](https://github.com/paulaosoriof86/demoCXOrbia/actions/runs/40816935808): **SUCCESS** y `PASS_F046_EXACT_READONLY_PREFLIGHT`; HR canónico exactamente uno, alias ausente de HR, keeper técnica aprobada y autenticada, exactamente una visita y una certificación del alias, cero referencias en los otros cinco dominios, identidad/HR/revisión consistentes.
3. Fusión en DEV [#40817081883](https://github.com/paulaosoriof86/demoCXOrbia/actions/runs/40817081883): **SUCCESS**, `PASS_F046_CANARY_PROVIDER_AND_SHOPPER_UI`. Proveedor protegido ACK, readback Auth/Firestore, idempotencia y Shopper UI `true`; 11 escrituras protegidas del proveedor, una referencia de visita y una de certificación reasignadas a HR canónico; IDs y demás contenido de ambos documentos preservados; alias residual cero; sin escrituras directas, sin HR ni LIVE.

## Reconciliación independiente 139/83 posterior

GitHub Actions [#40817352657](https://github.com/paulaosoriof86/demoCXOrbia/actions/runs/40817352657), **ambos jobs SUCCESS**. Commit que disparó únicamente el trabajo READ-ONLY: `bb154719c9bf87c4a946640aebbef6eaf3b218d4`.

| Bucket canónico | Grupos | Regla |
| --- | ---: | --- |
| ALREADY_CONSOLIDATED_AND_VERIFIED | 29 | Cerrado; no repetir |
| HOLD_ALIAS_OWNED_VISITS | 36 | Migración exacta multicolección con readback |
| HOLD_MULTIPLE_HR_CANONICAL | 11 | Resolver destino HR exacto y titular antes de escribir |
| KEEPER_VERIFIED | 6 | Preflight propio; revisar credencial/contacto, no copiar canario fuerte |
| HOLD_KEEPER_NOT_VERIFIED | 1 | No fusionar hasta acreditar acceso |
| **Total** | **83** | **54 pendientes** |

**Postflight:** revisión HR invariable, 139 pares, 83 grupos, 66 fuertes y 73 débiles; Auth/Firestore/HR/external writes=0, merges=0, credentialResets=0, production=false.

## Próxima clasificación — no autorizada para escritura por este checkpoint

- `R-020` · GT · 0 visitas de alias, 1 certificación, keeper `Técnica`, **SÍ** confirmado por Paula, `KEEPER_VERIFIED`. Coincidencia de contacto no exacta: requiere preflight específico de fuente humana aprobada, Auth/keeper, país, historial de certificación y resguardo de contenido. No relajar reglas ni auto-fusionar por nombre.
- Variantes fuertes por validar después: `F-014/R-013` GT o `F-064/R-070` HN, cada una 1 visita + 1 liquidación y dos casos de alias; exigir preservación de montos, estados y soportes financieros además de identidad.

**Gate:** I3 HOLD, Gate20/21 HOLD e I4 no autorizado hasta cerrar matriz y pruebas integrales. La producción `tya-plataforma.web.app` permanece intacta. No reabrir ni repetir los 29 PASS.
