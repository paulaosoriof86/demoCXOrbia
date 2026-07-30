# RESUMEN-PARA-CLAUDE.md

## ESTADO VIGENTE — 2026-07-29

### Baseline y cortes
- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- M1 / Corte 1 / Corte 2A: `FROZEN/APROBADO`.
- Corte 3: `FROZEN_ACTIVE_BASELINE`.
- Baseline: `CXORBIA-TYA-CORTE3-V182-20260729`.
- V182 empalmada; **no crear V183/R33**.

### Arquitectura prevalente
- Legacy actual a retirar: Firebase `tya-plataforma`; fuente de datos útiles y Hosting/URL pública a preservar para cutover.
- Backend DEV canónico: `cxorbia-backend-dev`; se reutiliza.
- `cxorbia-tya-dev-260729-c4`: sandbox técnico, no destino de materialización.
- No proponer otra base Firebase.

### Backend canónico confirmado
Read-only `cxorbia-backend-dev`:
- Auth 17;
- projects 29;
- visits 619;
- questionnaires 557;
- shoppers 215;
- liquidations 255;
- shopperBenefits 572;
- certifications 0.

### Legacy shoppers/certificaciones — PASS
La lectura autorizada se ejecutó directamente contra Firebase RTDB del proyecto actual `tya-plataforma`, nodo `tya_shoppers_extra`.

Resultado:
- 149 shoppers únicos;
- 120 profile create candidates;
- 22 stable-linked existing;
- 7 HOLD;
- 78 certificaciones útiles = 76 intentos + 2 markers;
- 30 recovery mirrors colapsados.

La evidencia GitHub está sanitizada. Eso **no significa** que la plataforma final deba ocultar identidad real.

### Lock de identidad real
Vigente `app/docs/ADDENDUM-IDENTIDAD-REAL-SHOPPER-PII-SOURCE-SAFE-VS-PLATAFORMA-20260729.md`.

Regla para frontend/producto:
- `source-safe` = hashes/placeholders solo en repo, logs, fixtures y evidencias;
- perfil operativo final = nombre e identidad real y datos útiles del shopper, bajo RBAC/Rules;
- Admin/Operativo debe ver identidad real autorizada;
- Shopper ve su propio perfil/historial permitido;
- Cliente ve solo alcance autorizado;
- DPI/banco/NDA/adjuntos únicamente si aplican y bajo protección;
- `Shopper protegido` no debe quedar como identidad permanente una vez exista perfil canónico real.

`no name-only automerge` se conserva exclusivamente para evitar fusiones incorrectas; no es anonimización.

### Visit-identity crosswalk — READ-ONLY PASS
Autorización ejecutada usando HR source-safe + visitas existentes de `cxorbia-backend-dev`; no visitas legacy; llaves `visitId`, `hrRowId`, `sourceSheet+sourceRow`.

Resultado v2:
- refs HR: 210;
- refs resueltas: 201;
- refs pendientes: 9;
- conflictos: 0;
- visitas HR con shopperRef: 616;
- visitas con identidad exacta recuperada: 571;
- visitas sin evidencia canónica exacta: 45;
- mapping hash: `9221098951aa03d34301273c3adc8f7773a410a39901432ec6f6e3040ce4720f`.

Primer intento 0/210: falso negativo del gate. La causa fue que el sanitizador rechazaba espacios de `sourceSheet/hrRowId`. Se corrigió separando identidad técnica de identidad operacional; rerun v2 PASS 201/210. No fue regresión frontend ni error de la HR.

### R17N
El R17N anterior conserva idempotencia PASS y writes autorizados=0, pero ya no es el corte final porque debe incorporar el crosswalk 201/210. Las 9 refs restantes siguen HOLD hasta reconciliar identidad real suficiente.

### Lo que Claude NO debe hacer ahora
- no preparar V183/R33;
- no reabrir Corte 3/Finanzas;
- no crear nueva base;
- no tocar backend/contracts/tools/workflows;
- no deduplicar/mergear por nombre solamente;
- no crear UI temporal para solucionar identidad;
- no pedir recertificación a shoppers con carryover válido;
- no mantener placeholders de identidad cuando el backend real ya exponga el perfil autorizado;
- no activar providers reales.

### Backlog frontend no bloqueante
- PDF sin gráfica visible al imprimir;
- Excel con formato básico;
- mejora transversal de `reportKit`;
- copy genérico de fuentes.

### Academia/manuales
Explicar claramente:
- privacidad por rol ≠ anonimización;
- perfil real vs referencia HR vs identidad Auth;
- PII en backend protegido vs source-safe en repo;
- certificación histórica/carryover;
- dedupe por evidencia y review de conflictos.

### Siguiente bloque exacto backend
`RECONCILIAR 9 SHOPPER REFS RESTANTES CON IDENTIDAD REAL AUTORIZADA SIN PII EN REPO → REBUILD R17N FINAL → IDEMPOTENCIA → AUTORIZACIÓN SOLO DE WRITES EXACTOS → MATERIALIZACIÓN DEV → SMOKE CX.data/Auth/RBAC → CORTES 6–8 → CUTOVER tya-plataforma`.

## Estado seguro
Legacy/Firestore/Auth/Storage/HR writes=0; deploy=0; merge=false; producción=false; pagos/lotes/Make/Gemini=0.
