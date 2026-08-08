# Cambios - Phase A human smoke precheck pack TyA

Fecha: 2026-07-09
Rama: `docs-tya-v6-v71-audit`
PR: #7 draft/open/no merge

## Archivos creados

- `backend/contracts/phase-a-human-smoke-precheck-pack-v1.json`
- `app/docs/PHASE-A-HUMAN-SMOKE-PRECHECK-PACK-TYA-20260709.md`
- `app/docs/CAMBIOS-PHASE-A-HUMAN-SMOKE-PRECHECK-PACK-TYA-20260709.md`

## Que se hizo

Se preparo un paquete documental de precheck para smoke humano/consola de RC Phase A controlada.

El paquete define:

- rutas criticas a revisar;
- criterios GO;
- criterios NO GO;
- forma esperada del resultado futuro;
- hard stops;
- impacto Claude/prototipo;
- impacto Academia;
- clasificacion reusable/exclusivo TyA/Claude/Academia/sin impacto Claude.

## Por que se hizo

Para que el siguiente paso de validacion humana sea focalizado, corto y seguro, sin repetir Level 0/1, sin pedir informacion ya documentada y sin expandirse a auditoria completa salvo que aparezca NO GO real.

## Impacto Phase A

Avanza la preparacion de RC Phase A controlada porque deja listo el filtro humano minimo antes de decidir GO/NO GO:

- login/navegacion;
- modulos Phase A criticos;
- copy honesto;
- Academia;
- Diagnostico/Readiness;
- Finanzas/liquidaciones/pagos;
- proyecto configurable y no hardcode Cinépolis.

## Impacto backend reusable

Crea patron reusable para futuros tenants/proyectos:

- smoke humano controlado;
- resultado GO/NO GO estructurado;
- verificacion de copy honesto;
- verificacion de gates apagados;
- revision de configurabilidad multi-tenant.

## Impacto TyA/Cinépolis

Refuerza que:

- Cinépolis es primer proyecto TyA configurable;
- junio se valida como liquidaciones/pagos, no visitas pendientes;
- boleto/combo se revisa solo como control administrativo si aparece en beneficios/liquidaciones;
- HR sigue como fuente operacional, pero no se lee ni se pide en este bloque.

## Impacto Claude/prototipo

Claude debe mantener rutas smokeables, copy honesto, estados de revision humana, readiness no productivo y Academia profunda/administrable.

No se le autoriza tocar backend/contracts/tools/gates, ni activar integraciones reales.

## Impacto Academia

Academia debe incluir o dejar pendiente:

- manual de smoke humano;
- checklist GO/NO GO;
- guia de errores criticos de consola;
- copy honesto;
- diferencia entre preview/gate/runtime/import/produccion;
- revision humana;
- liquidaciones/pagos como control administrativo.

## Estado seguro

- Sin cambios en `/app/modules`.
- Sin cambios en `/app/core`.
- Smoke no ejecutado.
- No se pidio PowerShell.
- No se pidio computador.
- Runtime no conectado.
- Adapter no habilitado.
- Builder no ejecutado.
- Sin imports.
- Sin Firestore/Auth/Storage writes.
- Sin HR writes.
- Sin Make/Gemini live.
- Sin correo/WhatsApp real.
- Sin pagos reales.
- Sin deploy.
- Sin produccion.
- Sin datos sensibles.

## Siguiente bloque

Preparar solo si Paula lo indica un bloque unico futuro de validacion humana. Mientras tanto, continuar con documentacion/contratos seguros que acerquen Phase A real sin activar runtime ni pedir datos privados.
