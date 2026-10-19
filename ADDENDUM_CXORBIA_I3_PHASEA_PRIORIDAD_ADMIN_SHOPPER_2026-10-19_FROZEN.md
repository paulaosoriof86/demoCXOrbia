# CXOrbia I3 — decisión congelada de prioridad Phase A
Fecha: 2026-10-19
Estado: FROZEN / I3 HOLD / I4 BLOCKED
Tipo: precisión de secuencia del plan vigente V1.1; no crea otra iteración, producto, candidata ni plan.

Paula ratifica Admin y Shopper como prioridad inmediata de Fase A. El Portal Cliente conserva todos sus contratos Phase A y pendientes F09, pero no desplaza el recorrido operativo.

Secuencia prioritaria: A09/B11 para UID, identidad, país, periodos, visitas y HR externa independiente de la misma revisión; B10 para fuente de cuestionarios interna/externa scoped por proyecto y visita; B09/B13 y B05–B08 para check-in, asignaciones, postulaciones, agenda y notificaciones con ACK; C02–C10 para finanzas y beneficios; D05–D08 y demás tareas G/A/B/C/D/E del plan aprobado. Diseño transversal E01/E02/E03/E11 se valida por owner y por última autoridad visual aprobada, sin rehacer módulos ni reabrir PASS sin drift. Finalmente V01–V05, Gate20/Gate21, un solo artefacto y autorización I4 expresa.

No cambia la lista congelada de 82 tareas, 274 VRM, F01–F16, 21 dominios, gates ni observaciones humanas. Plan rector ejecutable V1.1 SHA-256: 83e8f2c0a6b190bab1d9dea32bf99158116f3164f419ae72e051fd791fd8576c.
HEAD de control previo: ec5e3af0fe4201c91ccf413faba7a3278a819e0f.
Source aprobada de trabajo: 273b8afb4b2ab0c5851c8cc82235639b44165927; tree ccb73184906e3cfb8a582f882aef0a7863f3dfd5.
DEV actual: RUN1796; E2E focal posterior RUN1797, sin aceptación humana global.
Ledger vigente: CXORBIA_I3_CANONICAL_CUMULATIVE_FINDINGS_LEDGER_FULL_V473_2026-10-18.json.
Matriz: RECOVERY-I3-MODULE-TRUTH-MATRIX-20261018-V145.json.

Reglas: un solo escritor, un solo carril de GitHub, correcciones P0 demostradas con owner exacto, tests, fingerprint y readback. No reimportar ni utilizar datos locales como fuente de verdad. Mantener producción https://tya-plataforma.web.app/ sin cambios hasta I3 GO, Gate20/21 PASS y autorización expresa I4. Ningún porcentaje es evidencia de GO.

Siguiente acción autorizada: diagnóstico focal read-only de A09/B11+B10, inicialmente sin build/deploy. Contrastar contra autoridad HR independiente; no presentar las tres visitas reportadas como comprobadas sin readback. Si el acceso al dato requiere un endpoint con efecto escritor, detener esa operación y clasificar la dependencia. Registrar cada siguiente resultado en receipt append-only. Este archivo queda congelado; no editarlo.
