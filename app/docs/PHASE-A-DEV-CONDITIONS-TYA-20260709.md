# Phase A DEV conditions TyA

Fecha: 2026-07-09
Repo: `paulaosoriof86/demoCXOrbia`
Rama: `docs-tya-v6-v71-audit`
PR: #7 draft/open/no merge
Contrato: `backend/contracts/phase-a-dev-conditions-v1.json`

## Objetivo

Preparar condiciones para un paso DEV futuro de Phase A TyA, empezando por Cinépolis como proyecto configurable.

Este documento no activa nada. Solo define que tendria que estar listo antes de pedir o aceptar una autorizacion explicita de Paula para una conexion DEV controlada.

## Confirmacion de foco

Seguimos sin desvio:

- Phase A sigue siendo el plan activo.
- TyA sigue siendo el tenant operativo.
- Cinépolis sigue siendo el primer proyecto configurable, no logica global.
- HR sigue siendo fuente operacional.
- La informacion TyA se trata como real o source-safe, no fixture como fuente final.
- Junio se mantiene como control de liquidaciones/pagos, no visitas pendientes por ejecutar.
- Certificaciones ya presentadas deben preservarse.
- Shoppers historicos deben conservarse y no recrearse por coincidencia visual.
- Conflictos se mandan a revision humana.

## Estado actual

Este bloque es documental.

- No cambia `/app/modules`.
- No cambia `/app/core`.
- No activa conexion DEV.
- No ejecuta builder.
- No importa datos.
- No escribe proveedores.
- No toca HR.
- No activa Make/Gemini.
- No hace deploy.
- No produccion.
- No pagos.
- No datos sensibles.

## Condiciones antes de un futuro DEV

Antes de cualquier paso DEV controlado deben estar claras estas condiciones:

1. Decision previa de smoke humano en estado aceptable.
2. Autorizacion explicita de Paula para DEV.
3. Base nueva y limpia confirmada.
4. Secrets fuera del repo.
5. Punto unico de cambio `CX.data` documentado.
6. Sin reescritura backend de `/app/modules` ni `/app/core`.
7. Fuente TyA source-safe disponible localmente o marcada como pendiente.
8. Cinépolis configurado como proyecto, no como regla global.
9. Contrato HR respetado como fuente operacional.
10. Junio marcado como liquidaciones/pagos.
11. Regla de certificaciones preservadas documentada.
12. Make y Gemini se mantienen apagados hasta autorizacion separada.
13. Plan de rollback documentado.
14. Plan de auditoria documentado.
15. Impacto Claude documentado.
16. Impacto Academia documentado.

## Lo que este bloque no autoriza

Este documento no autoriza:

- merge final;
- deploy;
- produccion;
- importacion;
- escrituras masivas;
- escrituras HR;
- proveedores live;
- pagos;
- copiar base vieja;
- subir datos sensibles;
- reescribir UI/core desde backend.

## Backend replicable

El patron replicable para CXOrbia es:

- tenant y proyecto separados;
- decision DEV separada de smoke;
- base nueva por tenant;
- secrets fuera del repo;
- `CX.data` como contrato estable;
- gates antes de proveedores;
- estados honestos;
- rollback y auditoria antes de activar;
- no usar fuente temporal como fuente original.

## Pendientes para Claude

Claude debe representar este estado asi:

- DEV pendiente, no conectado.
- Firestore/Auth/Storage pendientes, no activos.
- HR preparada como fuente operacional, no sincronizada live.
- Make/Gemini pendientes, no activos.
- Cinépolis como proyecto configurable.
- Junio como liquidaciones/pagos.
- Datos TyA como source-safe o pendiente, no importado.
- Warnings y blockers visibles si aplica.

## Academia

Academia debe cubrir:

- diferencia DEV, staging y produccion;
- por que una base nueva no copia la vieja;
- que significa `CX.data` como punto unico;
- que son gates;
- que significa fuente source-safe;
- como se preservan certificaciones;
- como se revisan conflictos;
- como se controla junio como liquidaciones/pagos;
- que no deben compartirse datos privados en cursos, capturas o manuales.

## Siguiente bloque sugerido

Preparar plan documental de rollback/auditoria DEV Phase A, sin ejecutar nada.

## Estado final

Condiciones DEV documentadas. No se activa runtime ni se cambia UI/core.
