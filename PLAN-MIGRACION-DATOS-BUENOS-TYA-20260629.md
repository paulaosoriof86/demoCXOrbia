# PLAN-MIGRACION-DATOS-BUENOS-TYA-20260629

## Decision

Se continuara backend/migracion sin esperar cambios del prototipo. Cuando el prototipo se actualice, se repetira la prueba contra los datos T&A ya preparados en DEV.

## Objetivo

Migrar solo datos utiles de T&A a Firestore DEV, sin depender de tableros o calculos antiguos que no sean confiables.

## Datos a conservar

- Shoppers y campos operativos necesarios.
- Visitas realizadas.
- Referencia de HR compartida como fuente operativa.
- Cuestionarios marcados como realizados.
- Certificaciones realizadas para no repetir certificacion a shoppers ya aprobados.
- Registro de visitas de semanas recientes.

## Datos no confiables como fuente

- Dashboard antiguo y KPIs.
- Calculos agregados que no leen correctamente.
- Modulos incompletos.
- Evidencias y archivos hasta resolver Storage.
- Campos privados en claro.

## Enfoque

1. Inventario de campos del export sin mostrar datos personales.
2. Deteccion de campos de estado, fechas, shopper, HR, cuestionario y certificacion.
3. Mapeo desde origen a Firestore DEV.
4. Transformacion de datos utiles.
5. Carga controlada en DEV.
6. Validacion por conteos y preview local.
7. Ampliacion por lote completo si la validacion coincide.

## Sobre capturas

Las capturas ayudan a confirmar el significado visual de estados y columnas, pero la migracion debe basarse en export de datos, no en screenshots.

## Restricciones

- No Hosting.
- No merge.
- No produccion.
- No adapter global.
- No Storage.
- No cambios en `/app/modules`.
