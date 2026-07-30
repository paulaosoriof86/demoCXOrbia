# RESUMEN-PARA-CLAUDE.md

## ESTADO VIGENTE — 2026-07-30

**Estado:** `P0_PROVEN_C6_CREDENTIAL_CONTINUITY_GAP__AUTH_RULES_HOSTING_TECH_PASS__NO_PRODUCTION`

### Baseline no reabrir
- Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge.
- Corte 3 `CXORBIA-TYA-CORTE3-V182-20260729` FROZEN.
- R17N FINAL: 1,406/1,406 Firestore data writes/readback PASS; no repetir.
- Corte 5 `CX.data`: project=`cinepolis`, periods=14, visits=616, currentPeriod=`2026-07`, source=firestore/fallback=false PASS.
- No nueva candidata, base, Hosting, rama o PR por rutina.

### Corte 6 backend — PASS técnico preservado
- Firebase Auth/claims reales activos en DEV.
- claims 5/5 actualizados: 2 cliente +3 shopper exactos; cuarto shopper no vinculado no tocado.
- readiness: operador7, cliente2, shopper3.
- Firestore Rules canónicas desplegadas y verificadas.
- Firestore data writes Corte6: 0.
- Hosting DEV existente 1/1 consumido y verificado; no nuevo Firebase/Hosting.

### P0 nuevo demostrado — login/credenciales
La pantalla DEV actual muestra `Correo + Contraseña`, pero Paula confirmó que ese flujo nunca había sido el acceso operativo esperado. El backend hizo bien en exigir una identidad provider real, pero el identificador visible por email no debe reemplazar el contrato funcional existente.

Inventario backend read-only:
- `tenants/tya/shoppers`: `user/username/login`=0 y `pass/password`=0;
- `tenants/tya/users`: 0 docs;
- tenant profile: 0 claves de login;
- Firebase Auth: 17 cuentas técnicas, todas password provider con identificador email.

Conclusión: las credenciales legacy aún no fueron migradas al backend canónico. No crear `paula.osorio.f86@gmail.com` ni convertir cuentas DEV técnicas en modelo final.

Documento rector: `CORTE6-P0-CONTINUIDAD-CREDENCIALES-LEGACY-A-FIREBASE-20260730.md`.

### Claude — tarea focalizada, no nueva candidata
No reescribir módulos. La corrección frontend futura es únicamente el contrato de acceso/registro:
- preservar accesos configurables por rol/perfil;
- login visible `Usuario + Contraseña`, no correo obligatorio;
- Firebase Auth/claims siguen siendo la autoridad detrás del adapter;
- no guardar password/token en localStorage;
- recuperación/cambio de contraseña debe ser un flujo explícito;
- no exponer IDs provider, claims ni correos internos técnicos;
- registro/autogeneración de credenciales debe depender de una función real y validada, no de un helper inexistente.

No tocar `app/modules/*`. Si el adapter puede resolverlo desde core/backend, limitar Claude a copy/flujo visible y contrato de formulario.

### Backend antes de Claude visible
1. recuperar credenciales legacy únicamente por export/import controlado;
2. inventariar username/credencial/hash-type y conflictos sin publicar valores;
3. preparar import Auth idempotente y mapping `authUid`↔tenant/project/role/shopperId;
4. autorizar una sola ejecución provider;
5. readback;
6. después validar el login visible `Usuario + Contraseña`.

### Backlog P1/P2 preservado
- PDF/gráficas;
- Excel/formato;
- reportKit/exportaciones fuera de Dashboard;
- copy de fuentes/readiness.

### Agosto
Fuente actual llega a julio. `Agosto HN` continúa HOLD por inconsistencia país/tab. Después de cerrar/freeze Corte6: refresh HR → resolver HOLD → materializar solo delta agosto.

### Academia/manuales
Actualizar: identidad provider detrás del login, usuario ≠ email obligatorio, tenant/proyecto/rol, shopperId exacto, recuperación de acceso, mínimo privilegio y conflicto a revisión humana.

### Estado seguro
Auth claim writes5 ya autorizados; usuarios nuevos/password changes/deletes0; Firestore data writes0; Rules release1; Hosting DEV1/1; inventario credential-continuity provider writes0; Storage/HR/legacy0; pagos/Make/Gemini0; merge=false; producción=false; credenciales crudas repo/artifacts0.
