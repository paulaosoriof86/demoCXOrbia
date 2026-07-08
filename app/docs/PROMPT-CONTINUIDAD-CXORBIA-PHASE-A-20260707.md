# Prompt continuidad CXOrbia Phase A

Fecha: 2026-07-07

## Bloque completado

Se deja prompt completo de continuidad porque la conversacion esta larga y el siguiente paso requiere conservar contexto sin reiniciar metodologia.

## Prompt para nueva conversacion

Estoy continuando CXOrbia TyA Backend/Migracion.

Antes de responder, planear, auditar, documentar o modificar, lee y aplica los documentos vivos del repo y los adjuntos del proyecto:

- `00-REGLAS-MAESTRAS-CONTEXTO-CONTINUIDAD-CXORBIA-TYA-ACTUALIZADO-20260704.md`
- `00-REGLAS-MAESTRAS-CONTEXTO-CONTINUIDAD-CXORBIA-TYA-COMPLETO.md`
- `ADDENDUM-MAESTRO-ACADEMIA-PROFUNDA-INTERACTIVA-CXORBIA-TYA-20260704.md`
- `ADDENDUM-MAESTRO-AVANCE-POR-BLOQUES-CXORBIA-TYA-20260704.md`
- `ADDENDUM-MAESTRO-PATRONES-REUTILIZABLES-CXORBIA-20260707.md`
- documentos recientes de `app/docs`.

Repo: `paulaosoriof86/demoCXOrbia`.

Rama activa: `docs-tya-v6-v71-audit`.

PR: #7, open, draft, no merged.

Base: `release/cxorbia-tya-rc-20260630`.

Head documentado reciente: `0b79bcd377f1de197a222f88e2a6a65d1d95da2d`.

Baseline viva reciente: V89 empalmada como candidata controlada. No asumir otra version por memoria.

Estado seguro:

- sin produccion real;
- sin merge final;
- sin Auth real;
- sin Firestore real;
- sin Storage real;
- sin imports reales;
- sin sincronizacion real;
- sin Make real;
- sin Gemini real;
- sin mensajes/correos reales;
- sin datos sensibles crudos.

Reglas:

- No redisenar ni reescribir arquitectura.
- No tocar modulos UI sin source lock, auditoria y decision.
- No conectar base vieja.
- No activar proveedores reales sin autorizacion explicita.
- No afirmar que un archivo bloqueado quedo creado.
- Documentar cada archivo creado, tocado o bloqueado.
- Clasificar cada bloque como Reusable CXOrbia, Exclusivo cliente, Claude/prototipo, Academia y Sin impacto Claude.

Avances clave acumulados:

- Empalme controlado post V89.
- Guard de copy seguro.
- Restauracion puntual de `app/modules/revision-admin.js`.
- Gates de smoke, visual smoke, predeploy, drift, staging y remote smoke.
- Backend config apagado con placeholders.
- Paquete Claude completo actualizado generado localmente.
- Indice Claude actualizado creado en repo: `app/docs/CLAUDE-PACKAGE-UPDATED-INDEX-PHASE-A-20260707.md`.
- Agilidad segura documentada: `app/docs/AGILIDAD-SEGURA-PHASE-A-CXORBIA-20260707.md`.

Paquete Claude actualizado descargable entregado:

- `PAQUETE-COMPLETO-ACTUALIZADO-CLAUDE-CXORBIA-PHASE-A-20260707.md`.

Prioridades Claude P0:

1. Certificaciones.
2. Postulaciones.
3. Asignaciones.
4. Visitas.
5. Beneficios/liquidaciones.
6. Notificaciones.
7. Importaciones.
8. Evidencias/archivos.
9. Academia.
10. Configuracion de proyecto.
11. Integraciones.

Prioridad transversal P1:

- filtros;
- acciones puntuales;
- razon obligatoria;
- revision humana;
- historial/auditoria;
- copy honesto por gate;
- badges de estado.

Bloques recientes que ya quedaron documentados:

- `NOTIFICATIONS-ADMIN-ACTIONS-CONTRACT-CXORBIA-20260707.md`
- `IMPORT-ADMIN-ACTIONS-CONTRACT-CXORBIA-20260707.md`
- `FIELD-FILES-ADMIN-ACTIONS-CONTRACT-CXORBIA-20260707.md`
- `ACADEMY-ADMIN-CONTRACT-CXORBIA-20260707.md`
- `CONTENT-SUGGESTIONS-REVIEW-CONTRACT-CXORBIA-20260707.md`
- `PROJECT-RUNTIME-CONTRACT-CXORBIA-20260707.md`
- `INTEGRATION-RUN-CONTRACT-CXORBIA-20260707.md`
- `CLAUDE-PACKAGE-UPDATED-INDEX-PHASE-A-20260707.md`
- `AGILIDAD-SEGURA-PHASE-A-CXORBIA-20260707.md`

Staging/gates:

- Workflow staging existe: `.github/workflows/cxorbia-rc-phase-a-staging-deploy.yml`.
- Workflow remote smoke existe: `.github/workflows/cxorbia-phase-a-remote-smoke.yml`.
- Staging requiere secret `FIREBASE_SERVICE_ACCOUNT_CXORBIA_BACKEND_DEV`.
- Staging usa project `cxorbia-backend-dev`, target `cxorbia-dev`, channel `rc-phase-a`.
- Remote smoke requiere `base_url` HTTPS y no acepta localhost.
- No afirmar staging validado sin URL real y artifact de smoke.

Siguiente paso exacto:

1. Verificar si existe URL real de staging/preview o ejecucion de workflow.
2. Si existe URL, ejecutar o documentar `CXOrbia Phase A Remote Smoke` con `base_url`.
3. Si no existe URL, mantener carril seguro y no subir riesgo.
4. No hacer merge, no production, no proveedores reales.

Metodologia para continuar:

- Avanzar por bloques largos.
- Reducir trabajo manual de Paula.
- Usar GitHub directo cuando sea posible.
- No pedir datos ya documentados.
- Si aparece bloqueo de herramienta, decirlo claramente.
- Si la conversacion vuelve a estar larga, entregar prompt actualizado antes de perder continuidad.
