# CXOrbia I3 — recibo focal de decisiones Shopper y conteos de revisión (2026-11-02)

**Carácter:** addendum de evidencia al plan de choque I3 vigente, NO plan nuevo, NO reemplazo de la fuente 2026-10-28, NO aprobación I4. **Rama única:** `recovery/cxorbia-phase-a-20260831`. **Fuente producto canónica certificada al abrir este corte:** `bf60d57aa36fac08933d14f93d80f4c30e59a36c` (no confundir con HEAD de control `ecf06be00ce39c09481f4f82f0e31aea8c7d88f5`). **Estado:** I3 HOLD; producción DO_NOT_TOUCH.

## Autoridad humana recuperada y congelada

El archivo **`CXORBIA_I3_SHOPPERS_CONFIRMAR_IDENTIDADES_2026-10-28(1).xlsx`** aportado por Paula y conservado en su Biblioteca es el libro **COMPLETADO**, diferente de la plantilla original en blanco. Contiene:
- Hoja `Confirmar 66`: **66/66 SÍ**, sin NO/REVISAR/pendientes.
- Hoja `Revisar nombre`: **73/73 SÍ**, sin NO/REVISAR/pendientes.
- Hoja `Trazabilidad`: 139 correspondencias explícitas entre ID HR canónico e ID de cuenta técnica.
- 139 pares corresponden a **83 grupos de identidad** aprobados. No implican 139 personas ni 139 merges independientes.
- Digest semántico congelado de pares del preflight: `ac3e15184316d62aa53942359e857f2c34dec486a2ca41057e529a39f062d872`; autoridad HR original `4fc8def718fd1504f5d76a1fbc80b6901cbf711ec2b89f4dfc3a81ecbbca517a`. Una revisión HR posterior requiere readback de equivalencia; no reemplaza esta autoridad silenciosamente.
- El último cierre **histórico documental**, no readback independiente de este día, es **32/83 grupos consolidados provisionalmente y 51 pendientes**, tras R-026 PASS. R-053 continúa HOLD por drift de revisión HR. No refusionar los 32.
- Preservar UID/login/credencial keeper, aliases, crosswalk, origen HR, visitas, certificaciones, reservas, postulaciones, beneficios, liquidaciones e historial; siete dominios comprobados y ACK persistente por fusión. El teléfono es opcional/no bloqueante; el Shopper debe revisar datos al primer ingreso. Nunca fusionar por nombre o teléfono sin identidad exacta y autoridad humana.

## Lectura funcional de Chrome Admin autenticado — 2026-11-02

Misma Preview protegida DEV (`cxorbia-backend-dev.web.app/index-backend-dev.html`), Cinépolis, Admin; **cero acciones de escritura**:
- Aviso en barra lateral: **273** “identidades por confirmar”.
- KPI `Requieren revisión / decisión`: **359**.
- Tabla Shoppers actual: **206** filas, de las cuales **19** aparecen con `data-identity-review=required`.

**Diagnóstico de propietario de código reproducible:** `app/core/router.js::pendingShopperIdentityReviewCount()` cuenta conjuntos de expedientes de `__identityReviewQueue`. `app/modules/shoppers.js` cuenta el tamaño de un Set de IDs técnicos extraídos de casos (incluye alias y referencias fuera de tabla), pero al filtrar usa solamente IDs de filas visibles. **Estos tres universos son diferentes.** Los números son calculados desde el snapshot en memoria, no literales hardcodeados, pero no acreditan decremento correcto al ejecutar todas las fusiones ni equivalen a los 51 grupos aprobados pendientes. Clasificación: `MAPPING_FAILURE` de significado estadístico y `VISUAL_DEFECT` de etiqueta.

**Corrección focal preparada en workspace, no publicada ni compuesta**: distinguir “expedientes técnicos” en el rail y usar para el KPI la misma población de perfiles activos visibles del filtro; propietarios exactos `app/core/router.js`, `app/modules/shoppers.js`, QA `tools/qa/cxorbia-i3-shopper-identity-review-rail-notice.test.mjs`. Seis suites relacionadas PASS, `git diff --check` PASS. **No declarar cambiado en DEV** hasta empalme source successor → control único → prueba canónica → materialización exacta → Chrome E2E. No alterar directamente la cola duradera ni descartar avisos potencialmente válidos para simular un total reducido.

## Decisiones de ejecución congeladas

1. La lista SÍ de Paula **ya existe**; no pedirla otra vez ni pedir repetición manual de 139 decisiones.
2. No usar 273, 359 o 19 como saldo de la cohorte de 83. Mantener dos indicadores separados: progreso de grupos aprobados vía ACK independiente y expedientes técnicos potenciales del snapshot.
3. No delegar a Paula fusiones masivas: el saldo documentado contiene dependencias de alias/históricos/HR múltiple/keeper; las fusiones se hacen por el carril protegido, idempotente, con readback y sin interrumpir operación. Solo una nueva ambigüedad real, no cubierta en el Excel, puede requerir decisión humana.
4. Una corrección de contador no equivale a fusión efectuada ni cierre de módulo; `shoppers-mi-visitas-profile` y `canonical-hr-state-adapters` mantienen sus obligaciones hasta pruebas integrales.
5. Integrar el delta de fuente con la **misma** candidata y su matriz/ledger/puntero; prohibido nuevo carril de release, segundo producto, overlay, reimport o deploy productivo.
6. Próxima ejecución con efecto medible: readback protegido de la cohorte aprobada contra la revisión HR vigente, clasificación por grupos; ejecutar exclusivamente casos con keeper/7 dominios válidos, exigir ACK y no repetir grupos cerrados. En paralelo, transferir el fix semántico de contadores a DEV por gate canónico y certificar roles/funciones.
7. Estado global sigue **I3 HOLD, 5/21 MATCH (23.81 % de dominios certificados en la candidata), 16 pendientes**: 11 focales por roles/evidencia, 2 compuestos no acreditados en DEV y 3 P0 reales (adaptadores HR, Certificaciones D06, Finanzas). Gate 20/21 HOLD, I4 no autorizado.

Este recibo no reemplaza los documentos congelados ni modifica los 82 ítems/21 contratos. No se modificaron identidades, Auth, HR, Firestore, Finanzas, Hosting ni producción.
