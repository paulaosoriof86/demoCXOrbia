# Phase A human smoke precheck pack TyA

Fecha: 2026-07-09
Repo: `paulaosoriof86/demoCXOrbia`
Rama: `docs-tya-v6-v71-audit`
PR: #7 draft/open/no merge
Contrato: `backend/contracts/phase-a-human-smoke-precheck-pack-v1.json`

## Objetivo

Preparar el paquete de precheck para smoke humano/consola de RC Phase A controlada, sin pedir ejecucion todavia y sin activar runtime, imports, writes, deploy ni produccion.

Este bloque existe para que el siguiente paso de validacion sea corto, focalizado y no repita Level 0/1 ni reabra metodologia ya documentada.

## Estado seguro

- No se ejecuta smoke en este bloque.
- No se pide PowerShell ni computador.
- No se modifica `/app/modules`.
- No se modifica `/app/core`.
- No se conecta runtime.
- No se habilita adapter.
- No se ejecuta builder.
- No se importan datos.
- No se escribe Firestore/Auth/Storage.
- No se escribe HR.
- No se activa Make/Gemini.
- No se envian correos/WhatsApp reales.
- No se ejecutan pagos.
- No se hace deploy ni produccion.
- No se suben datos sensibles.

## Por que este bloque avanza Phase A real

Este precheck prepara el paso humano minimo antes de decidir si RC Phase A controlada puede avanzar. Se enfoca en produccion real controlada, no en infraestructura abstracta:

- confirma que rutas criticas abren;
- confirma que no hay pantalla blanca ni errores JS criticos;
- confirma que el copy no promete integraciones reales;
- confirma que Academia no queda superficial;
- confirma que Diagnostico/Readiness no se presenta como produccion lista;
- confirma que Finanzas/Mis beneficios no presenta pagos reales si solo hay control administrativo;
- confirma que Cinépolis sigue como proyecto configurable de TyA, no como logica global.

## Rutas criticas para smoke humano futuro

Cuando Paula autorice validacion, el smoke humano debe revisar solo estas rutas/areas:

1. Login/admin shell.
2. Navegacion base.
3. Dashboard.
4. Postulaciones/asignaciones.
5. Reservas/visitas.
6. Cuestionario shopper.
7. Finanzas / Mis beneficios / Liquidaciones.
8. Academia.
9. Diagnostico & Readiness.
10. Administrabilidad.

No se debe expandir a una auditoria completa salvo que aparezca NO GO real.

## Criterios GO

Puede considerarse GO tecnico para continuar preparacion RC controlada si:

- login/admin abre sin pantalla blanca;
- navegacion base responde;
- las rutas criticas abren;
- no hay errores JS criticos en consola al abrir rutas criticas;
- no se ve copy de envio/sync/import/pago real con gates apagados;
- Academia abre y muestra administrabilidad o pendiente honesto;
- Crear con IA, si aparece, se entiende como borrador/revision humana y no Gemini real publicado;
- Readiness/Diagnostico se muestra como preview/source-safe/gate-off;
- Finanzas/Mis beneficios separa liquidacion/control/pago y no afirma pago real;
- Cinépolis no aparece como logica global unica.

## Criterios NO GO

No avanzar si aparece cualquiera de estos puntos:

- pantalla blanca;
- error JS critico que impide navegar;
- ruta critica no abre;
- `production-copy-guard` rompe render;
- Academia no carga;
- Diagnostico/Readiness no abre;
- Administrabilidad no abre;
- Crear con IA promete Gemini real o publica sin revision humana;
- UI promete envio/sync/import/pago real sin gate activo;
- se detectan datos sensibles visibles o commiteados;
- se intenta activar Firestore/Auth/Storage/HR/Make/Gemini/correo/WhatsApp/pagos sin GO explicito;
- junio se trata como visitas pendientes en vez de liquidaciones/pagos;
- Cinépolis queda hardcodeado como producto global.

## Resultado esperado cuando se ejecute despues

El resultado del smoke humano futuro debe tener esta forma:

```json
{
  "verdict": "GO | NO_GO | GO_WITH_WARNINGS",
  "checkedAt": "ISO-8601",
  "environment": "local | preview | staging | production",
  "routes": [
    {
      "area": "dashboard",
      "status": "pass | warning | fail | blocked | not_checked",
      "consoleCriticalErrors": 0,
      "copyClaimsRealIntegration": false,
      "notes": ""
    }
  ],
  "blockers": [],
  "warnings": [],
  "nextAction": ""
}
```

Ese resultado no debe contener datos privados, HR cruda, nombres sensibles, capturas con datos sensibles ni tokens/URLs privadas.

## Impacto Claude/prototipo

Claude debe asegurar que las rutas criticas sean testeables y que los textos visibles sean honestos:

- preparado no es ejecutado;
- sync preparada no es HR sincronizada;
- borrador IA no es publicacion Gemini real;
- lote preparado no es pago real;
- readiness pass no es produccion lista;
- source-safe no es import real;
- `.tmp` no es fuente original ni repo.

## Impacto Academia

Academia debe incluir o quedar pendiente con precision:

- manual de smoke humano por rol admin/superadmin;
- leccion sobre GO/NO GO;
- guia sobre consola/errores criticos sin tecnicismos innecesarios;
- checklist de copy honesto;
- diferencia entre preview, gate, runtime, import y produccion;
- guia sobre no compartir datos privados;
- guia sobre revision humana en conflictos;
- guia sobre liquidaciones/pagos como control administrativo.

## Clasificacion

- Reusable CXOrbia: patron de smoke humano, GO/NO GO, copy honesto, rutas criticas testeables, verificacion multi-tenant y readiness source-safe.
- Exclusivo TyA: junio como liquidaciones/pagos, Cinépolis como primer proyecto TyA, boleto/combo si aparece en beneficios/liquidaciones.
- Claude/prototipo: rutas smokeables, estados visibles, copy honesto, Academia administrable, readiness no productivo.
- Academia: manuales, checklists, glosario, lecciones y notificaciones sobre smoke/GO-NO GO.
- Sin impacto Claude: contrato JSON backend documental y guardrails internos.

## Siguiente bloque sugerido

Preparar, si hace falta, un bloque unico futuro de validacion humana muy corto y seguro. No pedirlo todavia hasta que Paula indique que esta lista para validar en computador o entorno visible.

## Estado final

Precheck documentado. No ejecuta nada y no cambia runtime.
