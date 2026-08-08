# Synthetic Runner - Conflict Expanded Integration CXOrbia

Fecha: 2026-07-08  
Bloque: integrar fixture ampliado conflict review/import readiness al runner y bridge  
Estado: preview-only, sin runtime real.

## 1. Objetivo

Este bloque integra el fixture ampliado de conflict review/import readiness al `synthetic input pack runner` y al `readiness dashboard bridge runner`.

La finalidad es que el diagnostico agregado ya incluya escenarios ampliados de conflicto antes de cualquier fuente real, import real, pagos reales, Make, Gemini, Storage o HR real.

## 2. Archivos tecnicos actualizados

- `tools/contracts/cxorbia-synthetic-input-pack-runner.mjs`
- `tools/contracts/cxorbia-readiness-dashboard-bridge-runner.mjs`

## 3. Que se agrego al runner

Se agrego el contrato/fixture:

- `conflict-review-import-readiness-expanded`

El runner ahora valida tambien el manifest sintetico ampliado que cubre:

- conflicto de asignacion HR/plataforma;
- identidad shopper ambigua;
- estatus de pago en revision;
- readiness por proyectos, visitas, shoppers, asignaciones, certificaciones, liquidaciones, pagos y rutas de cuestionario.

## 4. Que se agrego al bridge

El bridge ahora mapea:

- `conflict-review-import-readiness-expanded` -> `conflict_review_import_readiness`

Y lo expone como:

- `human_review_required`;
- `pendiente revision humana`;
- gate `review_required`;
- sourceRef opaca;
- sin write/deploy/real activation.

## 5. Impacto Phase A

Este bloque agiliza Phase A porque permite diagnosticar de forma agregada escenarios de conflicto relevantes antes de conectar fuentes reales:

- asignaciones HR/plataforma;
- shopper identity review;
- pagos/liquidaciones en revision;
- import readiness bloqueado por conflictos.

## 6. Impacto Claude/prototipo

Claude debe reflejar esto si implementa readiness/conflict UI:

- el item ampliado debe mostrarse como revision humana requerida;
- no debe mostrarse como listo para import real;
- debe mostrar que hay blocker/warning y que los gates reales siguen apagados;
- debe conservar sourceRefs opacas;
- no debe deduplicar visualmente ni auto resolver.

## 7. Impacto Academia

Academia debe explicar:

- por que un runner puede pasar validacion y aun asi requerir revision humana;
- como un conflicto blocker bloquea import real;
- como un warning requiere revision antes de activar;
- por que pago en revision no equivale a pago real;
- por que sourceRef opaca no significa fuente real conectada.

## 8. Relacion con hallazgo Academia

Se mantiene documentado para la proxima candidata que Academia debe tener acciones visibles y auditables para cursos/manuales/checklists/glosario:

- borrar controlado o archivar;
- duplicar;
- versionar;
- cambiar estado;
- auditar motivo;
- aplicar permisos.

## 9. Clasificacion obligatoria

- Reusable CXOrbia: si. El runner/bridge ahora soportan escenarios ampliados de conflicto reusable.
- Exclusivo cliente: no. Los escenarios son sinteticos y no contienen datos TyA reales.
- Claude/prototipo: si. Readiness/conflict UI debe mostrar revision humana y blockers.
- Academia: si. Requiere contenido sobre runner, bridge, conflictos y administracion de Academia.
- Sin impacto Claude: no toca UI directamente, pero genera tareas de prototipo.

## 10. Estado seguro

Sin cambios en `/app/modules`.  
Sin cambios en `/app/core`.  
Sin runtime real.  
Sin deploy.  
Sin produccion.  
Sin Firestore/Auth/Storage real.  
Sin HR writes reales.  
Sin Make/Gemini real.  
Sin correos/WhatsApp reales.  
Sin pagos reales.  
Sin import real.  
Sin datos sensibles.
