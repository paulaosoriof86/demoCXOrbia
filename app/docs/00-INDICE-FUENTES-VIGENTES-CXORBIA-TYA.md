# 00 - INDICE DE FUENTES VIGENTES CXORBIA TyA

Fecha: 2026-07-21
Estado: ACTIVO Y OBLIGATORIO

- Rama `docs-tya-v6-v71-audit`.
- PR #7 draft/open/no merge.
- V161C/R21 continúa como baseline de seguridad hasta aprobación visual.
- V164 y Corte 1A están integrados.
- Candidata V172: SHA-256 `2c7c7dec3a04847cb5b9a04456ebefca49f16ea037a24956dc7661cf67e99fd5`.
- Commit runtime V172 parcial que debe permanecer como ancestro: `0ca607f430ac97ca022687419df688bccfd66e19`.
- Estado actual: `VISUAL_NO_GO_FIX_PACKAGE_READY`.
- Paula reprodujo en URL pública e incógnito: HR anterior, `Conectado · Degradado`, recargas con pantalla blanca, Reportes Admin/Cliente antiguos y Shopper sin `Mis Reportes`.
- Causa raíz 1: se aplicaron solo cuatro archivos V172 contra V171b, pero V171b no estaba empalmada; faltan 14 archivos acumulados V165–V171.
- Causa raíz 2: `fresh=1` no omitía TTL, el watcher ejecutaba `location.reload()` y el fast trigger repetía el ciclo cada 15 segundos.
- Fuente vigente: `DIAGNOSTICO-RAIZ-V172-EMPALME-ACUMULADO-HR-INPLACE-20260721.md`.
- Paquete exacto: `PAQUETE_EJECUCION_CODEX_CXORBIA_V172_HR_INPLACE_20260721.zip`.
- SHA-256 final: `eaadd16ef78539bfd45c60ad8eed9dc0507a385b80583640fb3f1666f4f9eb15`.
- Gate local: `PASS_TYA_LIVE_HR_INPLACE_REFRESH_GATE`; 21 JS/MJS con sintaxis PASS.

Lectura obligatoria: reglas maestras, addendum canónico de empalme file-aware, plan Phase A, checkpoint vigente, diagnóstico raíz V172, CAMBIOS, resumen, pendientes, Academia y PR #7.

## Método obligatorio

`RESOLVER HEAD_BEFORE ACTUAL → VERIFICAR ANCESTRO 0ca607f → APLICAR PAQUETE EXACTO → COMMIT/PUSH ATÓMICO → MANIFEST/BUILD-LOCK/VERIFICADOR → GATES → CLOUD RUN DEV/HOSTING DEV → VALIDACIÓN VISUAL → FREEZE`

No Contents API archivo por archivo, blobs/trees, workflow transportador, nueva rama/PR, nueva candidata, Claude ni trabajo manual para Paula.

## Siguiente acción exacta

`CODEX APLICA SOLO files/ DEL PAQUETE → COMMIT/PUSH ATÓMICO → DEPLOY DEV → DEMOSTRAR CAMBIO HR YA EXISTENTE SIN RECARGA → VALIDAR ADMIN/CLIENTE/SHOPPER`

Corte 1 continúa abierto. Corte 2 continúa bloqueado.