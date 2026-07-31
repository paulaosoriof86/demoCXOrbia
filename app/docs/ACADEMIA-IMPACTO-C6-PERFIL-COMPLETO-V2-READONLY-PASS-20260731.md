# Academia — impacto Corte 6 perfil Shopper completo V2 READ-ONLY PASS

**Fecha:** 2026-07-31

## Contenido reusable para Academia
- separar fuente de perfil actual de fuentes canónicas de histórico/certificación;
- transportar PII/credenciales cifradas y descifrarlas solo en memoria;
- validar identidad por llave estable antes de cualquier write;
- hacer provider compare read-only y generar un write-plan cuantificado antes de autorizar mutaciones;
- mantener conflictos/missing identities en HOLD en lugar de deduplicar por nombre;
- distinguir password legado visible para continuidad operativa de Firebase Auth como autoridad real de autenticación;
- documentar que un PASS técnico no reemplaza validación visual humana.

## Caso Corte6
El gate V2 final terminó PASS con151 registros fuente,120 matches exactos,31 missing canonical en HOLD,0 ambiguos y329 valores de perfil planificados sobre120 documentos existentes.

El primer intento falló por checksum de un chunk cifrado antes del provider; se corrigió el transporte exacto y se reintentó sin reutilizar una autorización consumida, porque la request read-only aún no había sido consumida y no existió provider mutation.

## Impacto en manuales/cursos/rutas
- Admin/operación: perfil protegido completo y diferencia entre credencial legacy y login Auth.
- Shopper: identidad se resuelve por Auth/claims/shopperId; no selector anónimo.
- Backend: read-only compare → plan → autorización exacta → write → readback.
- Seguridad: ningún valor PII/password en repo, logs o evidencia source-safe.

No implica cambios de UI ni producción en este bloque.
