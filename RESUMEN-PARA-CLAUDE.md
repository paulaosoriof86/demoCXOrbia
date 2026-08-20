# RESUMEN-PARA-CLAUDE.md

**SYNC_EPOCH:** `CXORBIA-20260820-I5-G2A-PRODUCTION-READONLY-PASS-48`  
**PLAN_ID:** `CXORBIA-PHASE-A-GO-LIVE-DEFINITIVE-RC-CLOSURE`  
**currentIteration:** `I5-G2`  
**ACTIVE_BLOCKER: `NONE`**  
**PREPROD_PROJECT_CREATOR_ROUTE: `SUPERSEDED`**

## Estado único
`I5_G2A_PASS__G2B_P0_WRITEPATH_PROVEN__CORRECTION_AUTHORIZED_PENDING_DEPLOY__98_2`.

Producción canónica: `https://cxorbia-backend-dev.web.app`. G2-A permanece PASS/FROZEN. Durante el preflight G2-B se demostró un P0 nuevo y reproducible: el runtime productivo tenía la persistencia canónica cerrada (`enableCommandWrites` sin habilitar), no activaba el transporte HTTP y Cloud Run no exponía la ruta lifecycle necesaria. No se creó ningún dato sintético para demostrarlo.

## Corrección P0 autorizada
Paula autorizó expresamente corregir únicamente la ruta productiva de escrituras canónicas y desplegar esa corrección en `cxorbia-backend-dev`, sin merge, HR externa, datos/credenciales reales, pagos, Make ni Gemini.

Corrección fuente en curso, sin rediseño UI ni cambios en `/app/modules`:
- wrapper backend `cxorbia-g2b-synthetic-visit-provider-v1.mjs`: reutiliza el provider lifecycle existente y agrega firewall servidor por prefijo/tag `CXORBIA_E2E_SYNTH_*`;
- runtime `g2b-synthetic-runtime.mjs`: endpoint autenticado Firebase/RBAC, tenant `tya`, project `cinepolis`, sintético-only;
- `hr-live-service/server.mjs`: enruta únicamente ese endpoint nuevo, preservando HR viva read-only y legal runtime;
- Dockerfile: empaqueta los providers/runtimes anteriores;
- `cxorbia-canonical-write-firewall-v1.js`: activa el transporte canónico solo con el flag G2-B exacto en el host productivo; la producción normal permanece write-disabled;
- workflow existente de deploy: extensión narrow para un solo Cloud Run + un solo Hosting, con readback que exige cero business/Auth writes durante el deploy. El carril I3 histórico queda congelado.

## G2-B después del deploy
La autorización sintética original continúa vigente. Después del PASS del deploy se ejecutará `STAGE_AND_TEST` en la misma plataforma, se dejará el escenario visible para Paula y solo después de sus observaciones se hará cleanup + post-clean readback. No marcar 100% antes.

## Claude/prototipo
No hay rediseño ni tarea visual para Claude por esta corrección. Si las pruebas visibles posteriores demuestran un defecto de UI real, documentarlo por módulo; no inferirlo desde este P0 de persistencia.

## Academia
La corrección no cambia contenidos académicos por sí sola. Ajustar manuales/cursos únicamente si G2-B visible demuestra una diferencia funcional real.
