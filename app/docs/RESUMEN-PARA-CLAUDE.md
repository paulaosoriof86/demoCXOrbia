# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-04  
**Estado vivo:** `SOURCE_STATIC_PASS__RUNTIME_MULTIROLE_PENDING__CLAUDE_PORTABLE_V4_HOLD__NO_PRODUCTION`

## 1. Baseline única

Continuar exclusivamente sobre:

- repo `paulaosoriof86/demoCXOrbia`;
- rama `docs-tya-v6-v71-audit`;
- PR #7 draft/open/no merge;
- árbol funcional `app/` exacto al source lock C6 desplegado `b908daa8c9cce0bd1c06cb05e3aceb9ff1b98beb`;
- manifest final `app/docs/MANIFEST-PHASE-A-COMPLETA-FINAL-COMPOSICION-20260804.json`.

No crear otra candidata, shell, rama, PR, Firebase, Hosting o metodología.

## 2. Auditoría forense y trazabilidad

La auditoría forense integral no debe repetirse mientras no cambie el árbol funcional fuera de un delta autorizado ni aparezca un P0 que invalide la autoridad.

Sus hallazgos ya están convertidos en decisiones, owners y gates mediante:

- `AUDITORIA-FOCAL-CLAUDE-LOGIN-PORTABLE-V4-20260804.md`;
- `MATRIZ-TRAZABILIDAD-FORENSE-A-IMPLEMENTACION-Y-CLAUDE-20260804.md`;
- manifest final Phase A;
- gate source/static;
- contratos Auth, HR, Finanzas, reportes y multi-país.

## 3. Autoridades cerradas

- RC Phase A smoke técnico y visual PASS;
- M1/Corte 1 frozen/aprobado;
- Corte 2A/V174 frozen/aprobado;
- Corte 3/V182 frozen active baseline;
- C6 entrada por perfiles, HR, Staff, Shopper, Cliente, Finanzas y Reservas técnicamente PASS;
- `29_UNIQUE_PRESERVE_OR_RECONCILE_DECISIONS_CLOSED__0_RESTORE_REQUIRED`;
- Ficha, Revisión, Documentos, Costos y `cliente-data.js` cerrados.

No restaurar versiones anteriores completas ni reescribir módulos aprobados.

## 4. Gate source/static

Ejecución controlada:

- request: `phase-a-final-composition-source-static-20260804-04`;
- run: `30910224561`;
- artifact: `8892730161`;
- request commit: `601f8acf2622852baaeb57951dd765c336741948`;
- decisión: `PASS_PHASE_A_COMPLETE_COMPOSITION_SOURCE_STATIC_GATE_WITH_DOCUMENTED_WARNINGS`;
- blobs críticos: `53/53`;
- repositorio después del gate: sin delta;
- provider/data writes: 0.

Causas raíces corregidas en el carril:

- nombres históricos de gates desalineados con el HEAD;
- archivo Auth local DEV correctamente clasificado como override opcional gitignored;
- escáner de secretos detectando sus propios patrones;
- unknown secret hits continúan siendo bloqueantes.

Warnings vivos:

- overlay A+B superseded todavía cargado;
- PDF puede omitir algunas gráficas;
- XLSX conserva presentación básica;
- override Auth DEV local no versionado por diseño.

## 5. Paquete Claude v4

Paquete auditado:

- `Prototype development request (20).zip`;
- SHA-256 `862e415df3d3a24be09ffbd48cb74f98779a59d2a2265587969c1880b48841c9`.

Decisión:

`HOLD_CLAUDE_LOGIN_PORTABLE_V4__NOT_READY_FOR_APPLY_DELTA_DIRECTLY`.

PASS portable:

- Login presentacional;
- marca producto `Gravicentra CX` y tenant dinámico;
- i18n;
- órbita;
- FAB visual;
- ficha shopper como especificación;
- inventario de marca;
- sin Auth/JWT/localStorage/PII URL.

Bloqueos:

1. `preview-mobile.png` mide `924×540`; no demuestra móvil;
2. selector 4–12+ países no cumple búsqueda/multiselect/+N/recientes;
3. `--gcx-navy-2` se usa y no está definido;
4. README fija un HEAD histórico;
5. no contiene ruta/bridge/single-login, por lo que no es candidata acumulativa.

Prompt correctivo:

`PROMPT-CLAUDE-CORRECCION-LOGIN-PORTABLE-V4-20260804.md`.

Claude no debe tocar GitHub ni backend.

## 6. Separación de responsabilidades

### Claude

- corregir Login portable;
- tokens;
- i18n;
- órbita;
- responsive con evidencia real;
- selector multi-país;
- FAB;
- mockup shopper;
- inventario de marca visible.

### ChatGPT

- bridge Firebase Auth;
- ruta e integración single-login;
- claims/scopes;
- `CX.data`/HR/adapters;
- Finanzas;
- report kit;
- overlay;
- runtime multirol;
- agosto;
- DEV/freeze/producción.

## 7. Report kit

Proveedor: `app/modules/cliente-extra.js` → `CX.reportKit`.

Consumidores:

- Admin `informes`;
- Shopper `mireportes`;
- Cliente `cli_reportes`;
- Finanzas `app/modules/finanzas.js`.

Formatos: PDF, XLSX y PPTX.

## 8. DEV actual

`https://cxorbia-backend-dev.web.app/index-backend-dev.html`

Clasificación:

`TECHNICAL_COMPARISON_BUILD__NOT_FINAL_PHASE_A_CANDIDATE`.

No solicitar todavía aprobación visual final.

## 9. Siguiente bloque exacto

En paralelo:

1. Claude corrige el paquete v4 según el prompt focal;
2. ChatGPT prepara y ejecuta el gate runtime multirol acumulativo sobre la candidata canónica actual.

Luego:

- auditoría única del delta Claude corregido;
- `APPLY_DELTA_DIRECTLY` únicamente con GO y sin P0;
- bridge seguro;
- gates acumulativos;
- único DEV si cambia `app/`;
- `CHECKPOINT_VISUAL_PHASE_A_COMPLETA`;
- freeze;
- agosto/disponibles/postulaciones;
- cutover autorizado.

## 10. Estado seguro

- Login Claude aplicado a `app/`: no;
- deploy: 0;
- Firestore/Auth/Rules/Storage/HR writes: 0;
- Make/Gemini/pagos: 0;
- merge: false;
- producción: intacta.
