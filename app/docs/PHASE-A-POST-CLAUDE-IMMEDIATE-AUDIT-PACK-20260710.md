# Phase A post-Claude immediate audit pack

Fecha: 2026-07-10
Repo: `paulaosoriof86/demoCXOrbia`
Rama: `docs-tya-v6-v71-audit`
PR: #7 draft/open/no merge

## Objetivo

Continuar el plan Phase A mientras Claude trabaja, dejando listo un paquete de auditoria inmediata para la siguiente candidata de prototipo.

El objetivo es que cuando Claude entregue V93/nueva candidata no se audite superficialmente ni solo visualmente, sino contra la candidata actual, el paquete FULL enviado, la reauditoria V92, los hallazgos acumulados, las mejoras backend post-paquete y los requisitos Phase A TyA/reusable CXOrbia.

## Archivos agregados

- `backend/contracts/phase-a-post-claude-immediate-audit-pack-v1.json`
- `backend/config/phase-a-post-claude-immediate-audit-pack.source-safe.json`
- `tools/release/tya-post-claude-immediate-audit-pack.mjs`

## Que problema resuelve

En auditorias anteriores se corrio el riesgo de subestimar cambios de Claude o marcar como faltante algo que si estaba hecho. Este bloque reduce ese riesgo porque obliga a revisar inventario, delta, semantica, paquetes enviados y trabajo posterior antes de preparar respuesta para Claude.

## Entradas obligatorias para auditar

- candidata actual o baseline viva;
- nueva candidata Claude;
- paquete FULL generico enviado a Claude;
- reauditoria profunda V92;
- respuesta P0/P1 enviada a Claude;
- contratos/adapters/gates creados despues del paquete;
- requisitos Phase A TyA;
- requisitos de prototipo reusable CXOrbia.

## Ejes obligatorios

- archivos agregados/modificados/eliminados;
- delta semantico por modulo;
- frontera prototipo/backend;
- proyecto vs periodo;
- configuracion tenant/proyecto;
- HR/source enmascarado;
- roles/personas/scopes;
- Auth/gates/datos protegidos;
- Academia/cursos/manuales por rol;
- certificaciones/carryover;
- shopper protected profile;
- visitas/asignaciones/agendamiento;
- liquidaciones/pagos/review;
- reviewQueue/auditEvents;
- Make/Gemini/pagos gate-off;
- PWA/branding/manifest dinamico;
- switch `CX.data` backend;
- TyA especifico vs reusable;
- regresiones contra V92 y hallazgos anteriores;
- que pedirle ahora a Claude mientras tenga capacidad.

## Comando seguro

```bash
node tools/release/tya-post-claude-immediate-audit-pack.mjs --current <ruta-candidata-actual-extraida> --candidate <ruta-candidata-nueva-extraida> --out .tmp/post-claude-immediate-audit
```

El comando prepara inventario y ejes de auditoria. No despliega, no escribe datos, no llama Firebase/Auth/Firestore/proveedores y no toca produccion.

## Buckets de respuesta

- `PreserveDoneWell`: cosas que Claude si hizo y no deben rehacerse.
- `P0AskClaudeNow`: bloqueantes que debe corregir mientras tenga capacidad.
- `P1AskIfCapacity`: mejoras importantes no bloqueantes.
- `BackendPreparedRepresentOnly`: backend ya preparo contrato/adapter/gate; Claude solo debe representarlo honestamente.
- `DoNotAskClaude`: no pedir a Claude porque causaria reproceso o corresponde backend posterior.
- `TyAConfigOnly`: logica particular de TyA que debe quedar como configuracion/seed, no hardcode.
- `ReusablePrototypePattern`: patron reusable que debe quedar configurable.
- `NeedsBackendLater`: pendiente backend posterior, no prototipo.

## Reglas anti-reproceso

- No declarar faltante sin revisar archivo y comportamiento semantico.
- No auditar solo visualmente.
- No auditar solo contra la candidata actual; tambien contra paquete y post-paquete.
- No pedirle a Claude rehacer trabajo backend ya preparado.
- No convertir TyA en hardcode del prototipo generico.
- Preservar avances utiles y pedir solo correcciones/gaps/regresiones.

## Impacto Phase A TyA

Permite que la proxima candidata se evalue rapido y profundo para decidir si acerca o aleja la conexion real de TyA sin romper proyecto, periodo, HR, usuarios, cursos, certificaciones, shoppers, liquidaciones, permisos, reviewQueue o auditEvents.

## Impacto reusable CXOrbia

El mismo paquete de auditoria servira para nuevos tenants/proyectos porque separa configuracion especifica del cliente de patrones del producto.

## Impacto Claude/prototipo

Claude debe recibir una respuesta corta pero precisa basada en esta auditoria: conservar lo correcto, corregir P0, atender P1 si queda capacidad y no rehacer backend preparado.

## Impacto Academia

Academia debe explicar que las auditorias de candidatos no son revision visual simple: comparan baseline, paquetes, backend acumulado, configurabilidad y gates para evitar reprocesos.

## Estado seguro

Contrato/config/script solamente. No auditoria real de nueva candidata aun, no deploy, no produccion, no datos sensibles, no Firestore, no Auth, no Make/Gemini, no pagos.
