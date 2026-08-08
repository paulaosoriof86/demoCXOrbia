# ADDENDUM MAESTRO — ANTIDESVIO, PRODUCCIÓN REAL, LEGACY ÚTIL Y CLAUDE

Proyecto: CXOrbia — Backend y migración a producción TyA  
Fecha: 2026-07-09  
Uso obligatorio: cargar como fuente formal del proyecto y leer antes de cada conversación, auditoría, cambio, empalme, plan o cierre de bloque.

## 1. Propósito

Este addendum refuerza una regla crítica: CXOrbia TyA no puede desviarse hacia infraestructura abstracta ni reiniciar análisis ya hechos. El objetivo principal es llegar a producción real Phase A lo más pronto posible, usando el trabajo ya realizado sobre TyA, Cinépolis, HR, plataforma actual, shoppers, certificaciones, liquidaciones, flujos y reglas operativas.

La migración se está haciendo con Cinépolis como primer proyecto TyA para ajustar el backend, pero Cinépolis no debe quedar hardcodeado ni tratado como lógica única. Debe quedar creado y operado como un proyecto normal configurable, igual que cualquier próximo proyecto TyA o próximo tenant.

## 2. Regla principal antidesvío

Antes de crear más contratos, adapters, gates, docs, prompts, empalmes o planes, se debe validar que el bloque avance directamente la salida a producción real Phase A.

Cada bloque debe responder claramente:

1. Qué dato real o fuente real/sanitizada de TyA ayuda a operar.
2. Qué módulo o flujo de producción desbloquea.
3. Qué parte del trabajo previo recupera.
4. Qué queda conectado, qué queda solo en preview y qué queda bloqueado.
5. Qué se documentó para Claude/prototipo y para backend reusable.

Si un bloque no ayuda a producción real, no es prioritario.

## 3. No partir de cero ni pedir de nuevo lo ya trabajado

Está prohibido pedir nuevamente a Paula la hoja de ruta, columnas, links, reglas HR, lógica Q1/Q2, shoppers, certificaciones, accesos, liquidaciones o flujos ya revisados sin antes leer y buscar en:

- Documento maestro vigente.
- Este addendum.
- Addenda recientes del proyecto.
- `app/docs/`.
- `CAMBIOS-BACKEND.md` o addenda de cambios.
- `RESUMEN-PARA-CLAUDE.md`.
- `PENDIENTES-PROTOTIPO.md`.
- Handoffs/prompts de continuidad.
- Herramientas en `tools/`, `tools/migration/`, `tools/contracts/`, `tools/hr-source/`.
- Archivos y fuentes cargadas en el proyecto.
- Repo/rama/PR activos.

Si después de revisar todo falta una fuente o archivo, se debe pedir solamente el insumo puntual faltante, explicando qué se revisó y qué no se encontró.

## 4. Trabajo TyA/Cinépolis ya conocido y vinculante

Debe asumirse como contexto ya trabajado, no como tema nuevo:

- TyA es el tenant actual.
- Cinépolis es el primer proyecto TyA, pero debe ser un proyecto normal configurable.
- TyA tendrá más proyectos; la plataforma debe estar lista para crearlos desde la UI.
- La HR de Cinépolis ya fue analizada en sesiones previas.
- Se trabajó mapeo de columnas HR.
- Se trabajaron reglas de Q1/Q2, franjas, quincenas, disponible desde, submitido, cuestionario, estados y restricciones.
- Se revisaron problemas de lectura de HR.
- Se revisaron lógicas de la plataforma actual para identificar qué servía y qué no.
- Se trabajaron shoppers históricos, accesos, postulaciones, certificaciones ya presentadas y flujos de visitas.
- Junio debe tratarse según la regla ya definida: visitas hasta junio ejecutadas; lo pendiente de junio es control de pagos/liquidaciones, no repetir visitas.
- Certificaciones aprobadas/presentadas deben conservarse para no pedirlas otra vez salvo regla explícita del proyecto.
- El origen/link de HR debe ser configurable por proyecto.
- El origen del cuestionario debe ser configurable por proyecto/visita: CXOrbia, TyAOnline, plataforma externa, link general o link por visita desde HR.

## 5. Plataforma actual / legacy: recuperar lógica útil, no copiar parches

La plataforma actual/anterior contiene aprendizaje operativo real, pero también parches, bugs, fixes acumulados y lógicas que no deben copiarse ciegamente.

Regla obligatoria:

1. Revisar lo ya extraído/documentado de la plataforma actual.
2. Recuperar reglas útiles comprobadas.
3. Recuperar flujos reales útiles.
4. Recuperar shoppers, certificaciones, accesos y estados que sean limpios y necesarios.
5. Recuperar lógica HR, lectura, asignación, estados, certificación, postulaciones, liquidaciones y pagos cuando esté validada.
6. No copiar arquitectura vieja.
7. No conectar base vieja.
8. No migrar datos sensibles crudos.
9. No traer parches o fixes defectuosos como si fueran arquitectura.
10. Documentar qué se reutiliza, qué se descarta y por qué.

Cada bloque que toque migración TyA debe decir explícitamente:

- Qué aprendizaje de la plataforma actual recupera.
- Qué parte se descarta por ser parche, bug o riesgo.
- Cómo queda expresado en el backend nuevo o en el prototipo.
- Qué queda pendiente para Claude si afecta UI/prototipo.

## 6. Producción real Phase A como prioridad

Phase A no es solo una maqueta visual ni una colección de contratos. Debe permitir operar el ciclo base con datos reales/sanitizados y controlados.

Antes de producción se debe poder demostrar:

1. Tenant TyA definido.
2. Proyecto Cinépolis creado como proyecto normal configurable.
3. Periodos/quincenas/países/monedas correctos.
4. HR real o export sanitizado real leído o importado en dry-run.
5. Visitas reales mapeadas con llaves estables.
6. Shoppers históricos mapeados o creados sin datos sensibles crudos.
7. Certificaciones ya presentadas conservadas.
8. Postulaciones/asignaciones y flujos base funcionando o listos para validación inmediata.
9. Liquidaciones/pagos de junio representados como control de pago, no como visitas pendientes.
10. Cuestionario configurable por proyecto/visita.
11. Make/HR sync preparado con gates, sin duplicar.
12. Gemini/certificaciones preparado con revisión humana.
13. UI validada en URL real verificada o entorno de validación claro.
14. Sin data demo como fuente final de producción.

## 7. Proyecto configurable y backend reusable

Todo lo que se haga para TyA/Cinépolis debe convertirse en patrón reutilizable de CXOrbia.

La plataforma debe permitir que desde la UI se configure un próximo proyecto o tenant con:

- Tenant.
- Proyecto.
- Cliente.
- Países.
- Monedas.
- Periodos/quincenas/rondas.
- Origen de HR.
- Link/origen de HR.
- Mapeo de columnas HR.
- Reglas de agendamiento.
- Reglas de reprogramación/cancelación.
- Reglas de visitas previas/franjas.
- Documentos e instructivos.
- Certificación y banco de preguntas.
- Cuestionario/origen/link.
- Pagos/liquidaciones.
- Make/automatizaciones.
- Storage/evidencias.
- Auth/roles.
- Auditoría y conflictos.

Cinépolis sirve como primera implementación real, pero no debe contaminar el producto con reglas hardcodeadas.

## 8. Prototipo y Claude

El backend no debe modificar módulos UI directamente salvo autorización puntual y documentada. Si un ajuste mejora el prototipo o debe pasar a la versión comercializable, debe documentarse para Claude.

Reglas para Claude/prototipo:

1. Todo hotfix local o patch temporal debe documentarse.
2. Toda mejora local que deba quedar en el producto debe documentarse.
3. Todo pendiente visual, copy, UX, flujo o módulo debe ir a `RESUMEN-PARA-CLAUDE.md` y/o `PENDIENTES-PROTOTIPO.md` o addendum equivalente.
4. Separar claramente backend reusable vs frontend/prototipo.
5. No enviar a Claude listas gigantes si tiene poca capacidad; preparar paquetes de 3 a 5 tareas críticas y accionables.
6. Claude debe incorporar al prototipo comercializable lo que backend haya resuelto como patrón útil.
7. Claude debe mantener copy honesto: preparado/pendiente no es enviado; sync preparada no es HR sincronizada; lote preparado no es pagado; borrador IA no es final publicado.
8. Claude debe evitar que la UI prometa integraciones reales si siguen bloqueadas por gates.
9. Claude debe respetar proyecto configurable y no hardcodear Cinépolis.
10. Academia, manuales, certificaciones, rutas por rol, notificaciones y estados deben revisarse con cada cambio relevante.

## 9. Documentación obligatoria

Si no está documentado, no se hizo.

Cada bloque debe actualizar o crear documentación que indique:

- Archivos tocados/creados.
- Qué se hizo.
- Impacto en producción Phase A.
- Impacto en backend reusable.
- Impacto en TyA/Cinépolis.
- Impacto en Claude/prototipo.
- Impacto en Academia/certificaciones/manuales.
- Qué se recuperó de trabajo previo o legacy útil.
- Qué queda pendiente.
- Qué bloqueo existe.
- Qué sigue.
- Si se requiere algo de Paula.

## 10. Gate de datos reales antes de producción

Producción debe bloquearse si:

- La app sigue usando data demo/genérica como fuente final.
- No se ha recuperado o validado fuente real/export sanitizado de TyA.
- No se demuestra que Cinépolis está como proyecto normal configurable.
- No se demuestran periodos, HR, visitas, shoppers, certificaciones y liquidaciones/pagos.
- No existe smoke visual sobre URL real verificada.
- Hay integraciones reales activadas sin gate.
- Hay datos sensibles crudos en repo.

## 11. Cierre obligatorio de cada bloque

Cada respuesta o bloque largo debe cerrar con:

1. Qué hice.
2. Impacto real en Phase A/producción.
3. Qué recuperé de trabajo previo o legacy útil.
4. Qué quedó documentado para Claude/prototipo.
5. Qué sigue.
6. Qué está bloqueado.
7. Qué necesito de Paula, solo si realmente falta.

## 12. Instrucción corta recomendada para instrucciones formales del proyecto

Usar esta frase corta en las instrucciones formales:

“Antes de continuar CXOrbia TyA, prioriza producción real Phase A: no reinicies ni pidas HR/reglas/shoppers/certificaciones ya trabajadas sin revisar maestro, addenda, repo y fuentes. Recupera lógica útil de la plataforma actual sin copiar parches ni base vieja. Cinépolis debe quedar como proyecto normal configurable y todo patrón backend debe documentarse para prototipo/Claude y futuros tenants.”
