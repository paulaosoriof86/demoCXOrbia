# CAMBIOS-BACKEND.md

**SYNC_EPOCH:** `CXORBIA-20260819-PHASEA-PROTECTED-RUNTIME-CONVERGENCE-37`

**Avance formal del plan:** **60% / 40%**. Este número deja de rotularse como “listo para producción”: I4 vale 25 puntos indivisibles y I5 vale 15. Cierre real de I4 → **85%**; cierre de I5/go-live → **100%**.

## Corrección forense — el problema no era reconstruir módulos
Se revisó el HEAD vivo y los runs asociados para resolver la contradicción entre “artefacto completo” y la visualización real incompleta.

### Confirmado ya construido/reutilizable
- Finanzas: módulo, bridge `CX.data`, adapter financiero canónico y read model v2 ya existen y se cargan en `index-backend-dev.html`.
- Multi-proyecto/no-code: wizard, configuración, certificaciones, documentos, reservas/agendamiento y contratos por `tenantId + projectId` ya existen.
- Shopper/identidad: existen contrato de identidad exacta, composición acumulativa, membership wiring y portal canónico.
- Academia: ya existe; no se reconstruye por defecto.

## Causa metodológica identificada
Se estaban mezclando evidencias de tres carriles con significado distinto:

1. `app/index.html` / visual smoke de demo prueba shell y módulos con fixtures, no la experiencia provider-backed real.
2. El carril source-safe/R18D prueba datos sanitizados y deliberadamente mantiene Shoppers como referencias protegidas; por diseño no puede demostrar identidad completa.
3. `app/index-backend-dev.html` es el carril que debe cerrar Phase A real: Auth + claims/membership + identidad exacta + perfil protegido + HR viva + overlays canónicos + `CX.data` + módulos.

Por eso un módulo podía estar “hecho” y aun así mostrar datos incorrectos/incompletos al visualizarlo en un carril que no componía toda la autoridad real.

## Evidencia runtime/gates del HEAD revisado
- La lectura HR del run R18D produjo **15 periodos, 659 visitas y 217 shoppers**.
- El mismo R18D falló contra expectativas históricas `616` visitas y `44` visitas del periodo activo, por lo que esos fallos deben tratarse como drift de gate/expectativa hasta demostrar regresión real.
- R18D confirmó **217 protectedReferenceShoppers**: correcto para source-safe, insuficiente para validar identidad completa.
- R18D renderizó Shoppers, Finanzas y Certificación sin error de render, pero usó el overlay financiero antiguo y reportó `paidConfirmed:0`.
- El runtime canónico posterior ya contiene la verdad financiera histórica: Mayo **44/44** pagadas; Junio **2/44**, 42 pendientes y **Q451** confirmados.
- El visual smoke genérico pasa, pero corre sobre **Demo**, sin sesión/claims provider-backed; por tanto no es gate de producción.
- El `Phase A Live Execution Checkpoint` falló por `CURRENT_CHECKPOINT_MARKER_MISSING`, confirmando drift documental/checkpoint y no un fallo funcional en ese paso.
- Un workflow de reports falla porque `cliente-extra.js` no demuestra todavía exportación PDF/XLSX/PPTX; queda como brecha frontend/Claude a clasificar contra alcance Phase A, no como razón para reconstruir backend.

## Estado de bloques
- I4-C: source readiness preservado; Make runtime diferido.
- I4-D: `PASS_I4D_FINANCE_EXISTING_CXDATA_REUSE_CONFIRMED`.
- I4-E: `PASS_I4E_MULTI_PROJECT_NO_CODE_REUSE_AND_CONTRACT_ALIGNMENT`.
- I4-F Academia: no se abre como prioridad todavía; se alinea al final del cierre I4.

## Nueva frontera correcta
`I4_PROTECTED_RUNTIME_CONVERGENCE_AND_REAL_PHASE_A_E2E`

Objetivo: demostrar en **un solo runtime protegido y una misma build** que lo ya construido recibe y presenta la autoridad correcta, sin rehacer módulos.

Cierre requerido:
- Shopper real autenticado con identidad/perfil autorizado, histórico, certificaciones y pagos/beneficios correctos.
- Admin real con Auth/claims/membership correctos y vistas Shopper autorizadas; acciones persistibles solo con provider ACK y gate.
- Finanzas canónicas visibles con 44/44 mayo, 2/44 junio, 42 pendientes y Q451.
- Cero fallback demo/source-safe viejo.
- Conteos/gates derivados de fuente actual, no cifras históricas hard-codeadas.
- E2E visible real antes de congelar I4.

## Clasificación
- **Reusable CXOrbia:** convergencia Auth/identidad/HR/finanzas sobre `CX.data`; gates no hard-codeados.
- **Exclusivo TyA:** cifras Mayo/Junio y fuente HR Cinépolis.
- **Claude/prototipo:** no reconstruir módulos; revisar únicamente brechas visibles concretas como exports de Cliente si siguen dentro de Phase A.
- **Academia:** alinear después de cerrar runtime real; no enseñar estados que el runtime no haya demostrado.
- **Sin impacto Claude:** sincronización de checkpoints/gates/docs y eliminación de falsos positivos por expectativas obsoletas.

## Seguridad
0 payment execution, 0 payment-state writes, 0 Make/Gemini, 0 HR/Auth/Firestore/Rules/Storage writes en este bloque documental, 0 deploy, 0 merge, 0 producción.