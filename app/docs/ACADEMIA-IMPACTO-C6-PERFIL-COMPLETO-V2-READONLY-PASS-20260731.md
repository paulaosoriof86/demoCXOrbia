# Academia — impacto Corte 6 perfil Shopper completo V2/V3 READ-ONLY PASS

**Fecha:** 2026-07-31

## Contenido reusable para Academia
- separar fuente de perfil actual de fuentes canónicas de histórico/certificación;
- transportar PII/credenciales cifradas y descifrarlas solo en memoria;
- validar identidad por llave estable antes de cualquier write;
- usar bridges secundarios únicamente si también son reproducibles: llave técnica exacta/única o UID Auth determinístico + custom claim validado;
- tratar nombre/teléfono/email como señales de revisión, no como identidad automática;
- hacer provider compare read-only y write-plan cuantificado antes de autorizar mutaciones;
- mantener missing identities en HOLD en lugar de inventar vínculos;
- distinguir password legado visible para continuidad operativa de Firebase Auth como autoridad real de autenticación;
- documentar que un PASS técnico no reemplaza validación visual humana.

## Caso Corte6
V2 terminó PASS con151 registros fuente,120 matches exactos,31 sin canonical,0 ambiguos y329 valores de perfil. V3 comprobó que los31 tampoco tienen match por llaves técnicas exactas/únicas ni por Auth determinístico + claim:0 resueltos. El breakdown Auth fue2 sin username,10 username duplicado y19 sin Auth user determinístico.

En los120 exactos,118 requieren cambios de campos y2 únicamente marcador de procedencia; por ello el write gate máximo sigue siendo120 documentos. Esto muestra por qué el write-plan debe distinguir cambios funcionales de metadata de trazabilidad.

El primer intento V2 falló por checksum antes del provider; se corrigió el transporte exacto y se reintentó con request aún no consumida. Provider writes0 en el FAIL.

## Impacto en manuales/cursos/rutas
- Admin/operación: perfil protegido completo y diferencia entre credencial legacy y login Auth.
- Shopper: identidad por claims/shopperId; no selector anónimo.
- Backend: encrypted handoff → read-only compare → identity bridge reproducible → plan → autorización exacta → write → readback.
- Seguridad: ningún valor PII/password en repo, logs o evidencia source-safe.
- Migración: un registro sin vínculo exacto pasa a alta/conciliación explícita, no a deduplicación heurística.

No implica cambios de UI, provider writes ni producción en este bloque.
