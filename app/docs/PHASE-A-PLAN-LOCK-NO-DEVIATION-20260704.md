# Phase A plan lock no deviation

Fecha: 2026-07-04

## Decision

Se mantiene el plan de trabajo Phase A como eje principal. No se debe desviar el trabajo hacia hardening completo, rediseño frontend, produccion, integraciones reales o nuevos alcances, salvo que sea necesario para complementar, corregir o mejorar Phase A sin romper continuidad.

## Eje Phase A

Phase A debe seguir enfocada en salida operativa controlada TyA:

- V79 como candidata viva empalmada.
- Backend preparado sin runtime real.
- HR como fuente operacional.
- Import historico limpio.
- Shoppers historicos conservados.
- Certificaciones historicas conservadas.
- Postulaciones, asignacion, agenda, reprogramacion, cancelacion, visita realizada, cuestionario, revision y liquidacion.
- Multi-proyecto desde el inicio.
- Cuestionario configurable por proyecto y visita.
- Make y Gemini solo como gates preparados, no activados sin autorizacion.

## Trabajo permitido

Se permite avanzar en:

- contratos;
- readiness;
- validadores;
- reglas documentales;
- adapter route map;
- correcciones P0/P1 de V79 que bloqueen Phase A;
- documentacion acumulada para Claude;
- mejoras pequenas y directas si reducen riesgo o destraban Phase A.

## Trabajo no permitido salvo autorizacion expresa

- Redisenar frontend.
- Rehacer modulos.
- Cambiar estrategia a otra fase.
- Activar produccion.
- Publicar reglas Firestore.
- Ejecutar import real.
- Activar Auth real.
- Activar Make/Gemini/WhatsApp API real.
- Conectar runtime backend real.
- Cambiar a otro candidato sin auditoria/source lock.

## Criterio para complementar o mejorar

Una mejora se puede hacer si cumple al menos uno:

- cierra un P0/P1 de Phase A;
- evita regresion de V79;
- conserva flujo shopper/admin;
- mejora configurabilidad multi-proyecto;
- mejora honestidad visual de integraciones;
- reduce riesgo de datos sensibles;
- prepara backend sin activar runtime;
- documenta pendiente para Claude.

## Pendientes vivos priorizados

1. Revision admin funcional.
2. Submitido HR-driven/configurable.
3. Wizard Phase A completo.
4. Readiness de reglas/claims Auth.
5. Validadores de import y sync sin escritura real.
6. Paquete acumulado Claude cuando Paula lo pida.

## Estado seguro

- Sin deploy.
- Sin produccion.
- Sin Firestore writes reales.
- Sin runtime backend conectado.
- Sin Make/Gemini/WhatsApp API real.

## Nota de continuidad

La conversacion esta larga. Mantener avance solo en bloques acotados. Preparar prompt completo de continuidad cuando Paula lo pida o antes de un bloque que implique riesgo alto de contexto.
