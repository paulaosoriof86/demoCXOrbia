# Phase A human smoke single-run package TyA

Fecha: 2026-07-09
Repo: `paulaosoriof86/demoCXOrbia`
Rama: `docs-tya-v6-v71-audit`
PR: #7 draft/open/no merge
Contrato: `backend/contracts/phase-a-human-smoke-single-run-package-v1.json`

## Objetivo

Preparar un paquete unico y minimo para smoke humano/consola, sin pedir ejecucion todavia.

Este paquete existe porque la matriz GO DEV clasifico el estado como `need_local_evidence_before_ready_to_request_go_dev`.

## Estado actual

No se pide accion manual en este bloque.

No se activa DEV.
No se conecta base.
No se importa.
No se escribe.
No se despliega.
No se produce.

## Regla de uso

Este paquete solo se usa si la validacion local se vuelve el siguiente bloqueo real.

Si llega ese momento, la ejecucion debe ser una sola, focalizada y sin rutas alternativas.

## Precondiciones

Antes de ejecutar cualquier smoke futuro:

1. Confirmar que PR #7 sigue open/draft/no merge.
2. Usar solo URL actual de preview/validacion si esta disponible.
3. No cambiar codigo.
4. No hacer deploy.
5. No conectar proveedores.
6. No ingresar datos sensibles.
7. No ejecutar pagos.
8. No activar Make/Gemini/Auth/Storage/Firestore.

## Rutas minimas a revisar

1. Login/admin.
2. Navegacion base.
3. Dashboard.
4. Postulaciones.
5. Reservas.
6. Automatizaciones.
7. Cuestionario shopper.
8. Finanzas/liquidaciones/pagos.
9. Academia.
10. Diagnostico & Readiness.
11. Administrabilidad.

## Validaciones especificas de Academia

Academia debe:

- abrir sin pantalla blanca;
- mostrar acciones admin visibles: editar, duplicar, versionar, estado, archivar, auditoria/archivados;
- abrir Crear con IA;
- crear borrador preview o `in_review` sin prometer Gemini real activo.

## Validaciones de copy honesto

No debe verse copy que afirme como real:

- sync HR/plataforma;
- pago ejecutado;
- proveedor activo;
- Gemini activo;
- Make activo;
- import real ejecutado;
- envio real sin gate.

Debe decir preparado, pendiente, preview, requiere confirmacion o gate apagado cuando aplique.

## Validaciones de consola

No debe haber:

- pantalla blanca;
- error JS critico al abrir rutas;
- guard rompiendo render;
- bloqueo de navegacion base.

## Criterios GO

Puede pasar como GO o GO_WITH_WARNINGS si:

- rutas criticas abren;
- Academia abre;
- Diagnostico abre;
- Administrabilidad abre;
- Crear con IA funciona solo como preview/in_review;
- no hay errores JS criticos;
- copy de integraciones/pagos/imports es honesto.

## Criterios NO GO

Debe marcarse NO GO si aparece:

- pantalla blanca;
- error JS critico;
- navegacion base rota;
- guard rompe render;
- Academia no carga;
- Diagnostico o Administrabilidad no abren;
- Crear con IA falla o promete Gemini real activo;
- promesa visible de sync/pago/proveedor real sin gate;
- datos sensibles visibles;
- activacion de proveedor real sin gate.

## Reporte unico esperado si se ejecuta en el futuro

Si se solicita ejecutar el smoke, Paula solo debe devolver:

```text
Resultado: GO / GO_WITH_WARNINGS / NO_GO
URL o entorno usado:
Rutas que fallaron:
Errores de consola:
Problemas de copy:
Problemas Academia:
Notas:
```

## Interpretacion del resultado

- `GO`: se puede preparar solicitud GO DEV precisa.
- `GO_WITH_WARNINGS`: se revisan warnings; si no bloquean Phase A, se puede preparar GO DEV con advertencias.
- `NO_GO`: corregir solo causa raiz puntual, documentar y repetir validacion focalizada.

## Impacto Phase A real

Este paquete evita pedir a Paula pasos largos o improvisados. Convierte la posible validacion local en una ejecucion unica, corta y accionable.

Tambien evita que un fallo visual derive en reiniciar Level 0/1 o rehacer contratos ya preparados.

## Backend reusable

Patron reusable:

- smoke humano minimo;
- rutas criticas por rol/modulo;
- GO/NO GO con evidencia;
- copy honesto;
- proveedores gate-off;
- no pedir datos sensibles;
- no confundir preview con produccion.

## Claude/prototipo

Claude debe mantener la UI lista para una validacion clara:

- rutas identificables;
- estados honestos;
- Academia con acciones visibles;
- Crear con IA como preview/in_review si no hay Gemini real;
- no prometer pagos, import, sync o proveedores reales.

## Academia

Academia debe explicar:

- que es un smoke humano;
- que se valida y por que;
- que significa GO, GO_WITH_WARNINGS y NO_GO;
- que no se debe hacer durante un smoke;
- como reportar errores sin exponer datos sensibles.

## Necesidad de Paula

No necesito nada de Paula ahora.

Solo se pediria ejecutar este paquete si se vuelve el siguiente bloqueo real para avanzar hacia GO DEV.

## Estado final

Paquete unico de smoke humano preparado, no solicitado. Sin runtime, sin base conectada, sin import, sin writes, sin deploy y sin produccion.
