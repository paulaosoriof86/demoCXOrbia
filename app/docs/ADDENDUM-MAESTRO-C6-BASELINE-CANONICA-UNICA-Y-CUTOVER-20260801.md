# ADDENDUM MAESTRO — C6 baseline canónica única y carril de cutover

**Fecha:** 2026-08-01  
**Estado:** ACTIVO, OBLIGATORIO Y PREVALENTE  
**Estado vivo:** `C6_REAL_STAFF_SHOPPER_E2E_HOSTING_DEV_PASS__PENDING_HUMAN_VISUAL_ACCUMULATIVE__NO_PRODUCTION`

## 1. Propósito
Este addendum impide que CXOrbia/TyA vuelva a fragmentarse en versiones aisladas por módulo, etapa, fuente o conversación. Desde este corte existe una sola baseline acumulativa autorizada para continuar.

## 2. Baseline canónica única
La única baseline válida es el build publicado en el Hosting DEV existente `cxorbia-backend-dev/cxorbia-dev` que obtuvo:

`PASS_C6_REAL_STAFF_SHOPPER_E2E_EXISTING_HOSTING_DEV`.

Ese build contiene acumulativamente:
- frontend aprobado vigente;
- login único Usuario + Contraseña;
- claims derivados para namespace, rol, tenant y proyecto;
- HR viva como autoridad operacional;
- Firestore/Auth como principal y overlay protegido, nunca reemplazo de HR;
- read model canónico v2;
- máquina única de estados y periodo;
- Dashboard, hoja de ruta, fases, detalle e histórico;
- identidad Shopper y portal canónicos;
- Finanzas, Movimientos, Liquidaciones y Beneficios coherentes;
- Reportes preservados;
- Reservas fail-closed;
- refresh y nueva pestaña idempotentes;
- 14 periodos/616 visitas/208 shoppers como baseline histórica vigente.

## 3. Prevalencia de evidencia
Orden obligatorio para determinar el estado:
1. request/execute consumidos con decisión PASS;
2. `evidence/CORTE6-REAL-USERS-E2E-HOSTING-LATEST.json`;
3. checkpoint e índice vigentes;
4. este addendum y lock de estabilidad acumulativa;
5. evidencias históricas anteriores.

Un trigger duplicado posterior a un PASS consumido no puede degradar el estado del producto. `CORTE6-REAL-USERS-E2E-FAILURE-LATEST.json` está clasificado como evento supersedido y no sustituye la evidencia PASS.

## 4. Operaciones prohibidas
Queda prohibido:
- crear otra plataforma, candidata, rama, PR, Firebase o Hosting para continuar Phase A;
- restaurar una sección desde una versión anterior;
- seleccionar “la mejor pantalla” y copiarla fuera del build canónico;
- aprobar una sección o smoke de carcasa como release completo;
- permitir que Auth/Firestore reemplace HR;
- recalcular estados, KPIs, identidad o Finanzas de forma separada en módulos UI;
- deduplicar identidad por nombre, correo, teléfono o similitud visual;
- saltar el gate acumulativo por urgencia;
- reutilizar una autorización consumida;
- publicar agosto o producción sin fuente y gate específicos.

## 5. Regla para todo cambio futuro
Todo cambio parte del HEAD vivo y de esta baseline. Debe clasificarse como delta focal y pasar, como mínimo:

`SINTAXIS/CONTRATO → DOMINIO CANÓNICO → FINANZAS → SHOPPER/IDENTIDAD → REPORTES → REFRESH/SESIÓN → E2E REAL SEGÚN ALCANCE → VALIDACIÓN HUMANA`.

Una regresión en cualquier superficie bloquea el cambio completo. No se crea un segundo carril funcional para resolverla.

## 6. Freeze de Corte6
El único pendiente para congelar Corte6 es la validación humana acumulativa del build publicado:
- entrada y restauración de sesión;
- Dashboard/hoja de ruta y KPIs 44/40/38/33/1;
- detalle e histórico/comparativo;
- tres refresh/focus;
- Shoppers, perfiles, certificación y portal;
- Finanzas, Movimientos, Liquidaciones y Beneficios;
- Reportes;
- Reservas read-only.

Resultado requerido:
`APROBADO → C6_BASELINE_CANONICA_ACUMULATIVA_FROZEN`.

## 7. Carril urgente de agosto y postulaciones
Después del freeze, el siguiente bloque exacto es:

`FUENTE EXACTA AGOSTO O VISITAS PLATFORM-ORIGIN → IDENTIDAD/MAPPING → DISPONIBLES → POSTULACIONES → GATE MULTIROL → WRITE PLAN → AUTORIZACIÓN ESPECÍFICA → READBACK → REMOTE SMOKE → CUTOVER`.

Objetivo operacional: permitir que los shoppers consulten visitas de agosto y se postulen sin duplicar HR, sin inventar datos y sin degradar el histórico.

La autorización de Hosting DEV consumida en Corte6 no autoriza writes, apertura de postulaciones, merge ni producción.

## 8. Invariantes mínimas
- julio 44 = GT 34 + HN 10;
- realizadas 40;
- cuestionario 38;
- submitidas 33;
- fuera de rango accionable 1;
- 40 realizadas en Liquidaciones;
- 33 submitidas no omitidas;
- HR interna 616 para staff y shopper autenticado;
- portal Shopper filtra por identidad canónica sin destruir el dataset interno;
- cero duplicados técnicos;
- Reportes sin pérdida;
- Reservas sin mutaciones mientras no exista fuente real.

## 9. Documentación obligatoria por bloque
Cada bloque debe actualizar:
- `CAMBIOS-BACKEND.md` o addendum;
- `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
- `RESUMEN-PARA-CLAUDE.md`;
- `PENDIENTES-PROTOTIPO.md`;
- impacto Academia/manuales;
- PR #7 mediante cuerpo o comentario autoritativo;
- evidencia source-safe reproducible.

Si un commit, gate, deploy o herramienta falla, se declara. No se afirma éxito sin evidencia.

## 10. Clasificación
- **Reusable CXOrbia:** baseline acumulativa única, ownership de fuente, evidencia prevalente y gate transversal.
- **Exclusivo TyA:** conteos y operación Cinépolis/agosto.
- **Claude/prototipo:** consumir contratos canónicos sin reimplementar lógica.
- **Academia:** versionado acumulativo, trazabilidad, source ownership y validación E2E real.
- **Sin impacto Claude:** runners, credenciales privadas y consumo one-shot.

## 11. Estado seguro
Hosting DEV deploy 1; usuarios creados 0; Auth/Firestore/HR/Rules/Storage/legacy/Make/Gemini/pagos/Reservas writes 0; Cloud Run deploys 0; nuevos proyectos/sites 0; credenciales/tokens exportados 0; merge=false; producción=false.
