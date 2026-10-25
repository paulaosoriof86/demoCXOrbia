# Empalme controlado V89 sin capacidad Claude - CXOrbia TyA

Fecha: 2026-07-06
Repo: `paulaosoriof86/demoCXOrbia`
Rama: `docs-tya-v6-v71-audit`
PR: #7 draft/open/no merge
Fuente: `Prototype development request CXOrbia V89.zip`

## Contexto

Claude ya no tiene capacidad para producir una V90. Paula autoriza continuar con la candidata V89 como base operativa de trabajo, reauditarla y empezar a documentar los siguientes pendientes y modificaciones desde ChatGPT/Codex.

## Decisión de continuidad

V89 se toma como **candidata de empalme controlado / working candidate**, no como source lock final.

Esto significa:

- Se conserva lo útil de V89 como referencia inmediata.
- No se declara production ready.
- No se declara backlog 100% cerrado.
- No se activa backend real, Firestore, Auth, Storage, Make, Gemini, WhatsApp, correo real ni deploy.
- Las correcciones posteriores deben documentarse como modificaciones post-V89, no como trabajo de Claude.

## Reauditoría rápida V89

Validado nuevamente sobre el ZIP local:

- SHA256: `c9a50f0c1edc1b1b7db4ebc5b17edfbf44d26d3fb9350f4f29e5f058b87fcb74`.
- 97 archivos.
- `node --check`: 61 JS OK / 0 FAIL.
- `index.html`: 61 scripts; sin scripts locales faltantes.
- `tools/` ausente del ZIP.
- `app/contracts/` ausente del ZIP.
- Academia V89 corrige IDs nuevos: `a_backend_prepared` y `a_ops_conflicts_route`.
- Persisten residuos de textos honestos: enviado/sincronizado/en vivo/Make/WhatsApp/correo/HR donde no hay proveedor real activo.

## Alcance del empalme

El empalme debe hacerse de forma controlada y trazable:

1. No reemplazar backend ni documentación viva acumulada del PR.
2. No copiar `app/docs` del ZIP encima de la documentación ya mantenida por ChatGPT/backend.
3. Empalmar solo archivos frontend del candidato cuando el cambio sea seguro y documentado.
4. Cada modificación post-V89 debe registrarse en `CAMBIOS-BACKEND.md`, `RESUMEN-PARA-CLAUDE.md` y `PENDIENTES-PROTOTIPO.md` o en addendum específico.
5. Si se corrige directamente un módulo de frontend por falta de Claude, debe quedar documentado como `modificación local post-V89`, con motivo, riesgo, validación y pendiente para incorporar al prototipo comercializable.

## Archivos candidatos de empalme V89

Según auditoría V89, los archivos relevantes son:

- `app/core/automations.js`
- `app/core/liquidacion.js`
- `app/modules/academia.js`
- `app/modules/postulaciones.js`

No se deben sobreescribir documentos backend ni contratos.

## Pendientes vivos post-V89

Los siguientes pendientes quedan vivos y pasan a trabajo directo de ChatGPT/Codex si Paula autoriza corrección local:

- Postulaciones: reemplazar textos `WhatsApp enviado`, `HR sincronizada`, `shopper notificado` por estados preparados/pendientes backend.
- Dashboard: reemplazar `Correo enviado` y `WhatsApp enviado (Make)` por borrador/preparado/fallback/manual/pendiente backend.
- Automatizaciones: reemplazar `Registro de disparos (Make)`, `eventos enviados`, `Payload enviado`, `Disparo enviado` por preview/evento preparado/pendiente backend.
- Cuestionario Shopper: reemplazar `cuestionario enviado` por `cuestionario realizado` o `cuestionario completado`.
- Reservas: reemplazar `shopper notificado` por `notificación preparada`.
- Correo/Topbar: distinguir correo real conectado vs borrador/preparado.
- Finanzas/Importador/Operación Extra/Academia/Manuales: revisar residuos `sincronizado`, `en vivo`, `lee y escribe`, `egreso automático`, `pagada` sin cruce real.

## Estado seguro

Sin deploy, sin producción, sin import real, sin Firestore/Auth/Storage reales, sin HR writes, sin Make/Gemini/WhatsApp/correo real, sin datos sensibles y sin merge.
