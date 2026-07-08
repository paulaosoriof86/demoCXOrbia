# Reusable Backend to Claude Coverage Contract CXOrbia

Fecha: 2026-07-08  
Bloque: garantizar que patrones backend reutilizables se entreguen a Claude/prototipo y Academia  
Archivos tecnicos:

- `tools/contracts/cxorbia-reusable-backend-to-claude-coverage-contract.mjs`
- `tools/contracts/cxorbia-synthetic-input-pack-runner.mjs`
- `tools/contracts/cxorbia-readiness-dashboard-bridge-runner.mjs`

Estado: preview-only, sin runtime real.

## 1. Objetivo

Este contrato existe para cerrar una brecha metodologica: todo patron backend reusable que deba reflejarse en prototipo, Academia o configuracion para otro cliente debe quedar explicitamente traducido en instrucciones para Claude.

No basta documentar un contrato backend. El contrato debe indicar:

- artefactos backend;
- instruccion Claude/prototipo;
- impacto Academia;
- aplicabilidad a nuevo cliente;
- criterio GO/NO GO;
- estado seguro.

## 2. Problema que resuelve

Cuando un bloque backend es reusable, puede quedar demasiado tecnico y no bajar a UX, copy, Academia o configuracion visual. Eso genera riesgo de que Claude no implemente o no documente lo que deberia repetirse para otro cliente.

Este contrato bloquea ese riesgo: valida que cada patron reusable tenga handoff claro.

## 3. Patrones requeridos

El contrato exige cobertura para:

- multi tenant project config;
- admin configurability;
- academy admin actions;
- conflict review/import readiness;
- readiness dashboard source-safe;
- synthetic input pack runner;
- questionnaire routing;
- visit lifecycle;
- settlement/payment eligibility;
- evidence storage gate;
- historical import clean;
- assignment sync HR/plataforma;
- notification outbox gates;
- rule versioning/changelog;
- sensitive data policy;
- provider agnostic integrations.

## 4. Que valida por patron

Cada patron debe declarar:

- `patternId`;
- nombre;
- `reusableCxorbia = true`;
- artefactos backend;
- instrucciones Claude/prototipo;
- instrucciones Academia;
- aplicabilidad a tenant/proyecto y nuevos clientes;
- expectativa de entrega Claude;
- criterio GO/NO GO;
- safeState sin runtime real.

## 5. Integracion al synthetic runner

Se agrego `reusable-backend-to-claude-coverage` al synthetic input pack runner.

Esto significa que el reporte agregado ya no solo valida contratos tecnicos, sino tambien que los patrones reutilizables se traduzcan a Claude, Academia y candidatas futuras.

## 6. Integracion al readiness bridge

El readiness dashboard bridge mapea:

- `reusable-backend-to-claude-coverage` -> `academy`.

Y lo expone como:

- `human_review_required`;
- `pendiente revision humana`;
- gate `review_required`;
- sourceRef opaca;
- sin write/deploy/real activation.

## 7. Impacto Claude/prototipo

Claude debe recibir estos patrones como instrucciones operativas, no como notas tecnicas:

- cada patron reusable debe estar en el paquete Claude;
- cada patron debe tener impacto UI/copy/estado si aplica;
- cada patron debe tener criterio GO/NO GO;
- cada patron debe estar auditado cuando llegue una nueva candidata;
- cada patron debe tener Academia/manual/checklist cuando aplique.

## 8. Impacto Academia

Academia debe explicar los patrones reutilizables, no solo el caso TyA:

- multi-tenant;
- configuracion por proyecto;
- gates;
- preview vs real;
- sourceRefs opacas;
- revision humana;
- administrabilidad;
- readiness;
- conflictos;
- datos sensibles;
- integraciones provider-agnostic.

## 9. Impacto nuevo cliente

Para configurar otro cliente, Claude debe poder reutilizar estos patrones sin copiar logica TyA:

- cambiar tenant/proyecto;
- cambiar pais/moneda;
- cambiar reglas;
- cambiar fuentes;
- cambiar rutas de cuestionario;
- cambiar documentos/evidencias;
- cambiar notificaciones;
- cambiar planes/NDA;
- conservar gates, auditRef, roles, source-safe y revision humana.

## 10. Relacion con Academia acciones administrativas

El patron `academy_admin_actions` obliga a que la ausencia visual detectada por Paula no vuelva a quedar en abstracto. Para cualquier cliente, Academia debe tener o documentar:

- crear;
- editar;
- archivar/soft-delete;
- duplicar;
- versionar;
- cambiar estado;
- asignar rol/proyecto;
- pedir revision;
- publicar solo con revision humana.

## 11. Clasificacion obligatoria

- Reusable CXOrbia: si. Este bloque existe precisamente para garantizar transferencia de patrones reutilizables.
- Exclusivo cliente: no. TyA queda como implementacion actual, no como logica unica.
- Claude/prototipo: si. Cada patron debe convertirse en instruccion UI/copy/estado/GO-NO GO.
- Academia: si. Cada patron reusable debe tener curso/manual/checklist cuando aplique.
- Sin impacto Claude: no toca UI directamente, pero obliga a handoff Claude completo.

## 12. Estado seguro

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
