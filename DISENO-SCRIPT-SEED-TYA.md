# DISENO-SCRIPT-SEED-TYA.md

## Objetivo

Diseñar el script que, más adelante y solo con autorización, cargará el seed ficticio de T&A en Firebase DEV.

Este archivo es diseño. No ejecuta nada, no contiene credenciales y no carga datos.

## Archivo origen

```text
firebase/seed-tya-piloto.json
```

## Destino previsto

```text
Firebase DEV: cxorbia-backend-dev
Tenant: tya
Proyecto: tya-piloto
```

## Reglas de seguridad

1. No guardar llaves privadas en el repo.
2. No publicar credenciales en comentarios, issues ni PRs.
3. No ejecutar contra producción.
4. No cargar datos reales.
5. No crear usuarios reales.
6. No activar Storage.
7. No cambiar `CX.BACKEND.enabled` durante la carga del seed.

## Flujo esperado del script

1. Leer `firebase/seed-tya-piloto.json`.
2. Validar que el archivo sea JSON válido.
3. Confirmar que `tenantId` sea `tya`.
4. Confirmar que `projectId` sea `tya-piloto`.
5. Confirmar que todos los datos sean ficticios.
6. Preparar rutas Firestore bajo `/tenants/tya`.
7. Escribir tenant.
8. Escribir shoppers ficticios.
9. Escribir proyecto piloto.
10. Escribir visitas ficticias.
11. Escribir postulaciones ficticias.
12. Escribir cuestionario demo.
13. Calcular conteos finales.
14. Mostrar resumen de carga.

## Rutas Firestore esperadas

```text
/tenants/tya
/tenants/tya/shoppers/{shopperId}
/tenants/tya/projects/tya-piloto
/tenants/tya/projects/tya-piloto/visits/{visitId}
/tenants/tya/projects/tya-piloto/postulations/{postulationId}
/tenants/tya/projects/tya-piloto/questionnaires/{questionnaireId}
```

## Validaciones obligatorias antes de escribir

El script debe detenerse si detecta:

```text
tenant distinto de tya
projectId distinto de tya-piloto
correos reales
teléfonos reales
documentos reales
datos bancarios
rutas fuera de /tenants/tya
colecciones no esperadas
```

## Resumen esperado después de cargar

```text
Tenant creado/actualizado: 1
Proyecto creado/actualizado: 1
Shoppers ficticios: 4
Visitas ficticias: 8
Postulaciones ficticias: 3
Cuestionarios demo: 1
Datos reales detectados: 0
Rutas fuera de tenant: 0
```

## Modo dry-run

El script debe tener un modo de simulación antes de escribir.

Modo recomendado:

```text
DRY_RUN=true
```

En dry-run debe:

- leer el seed
- validar estructura
- mostrar rutas a escribir
- mostrar conteos
- no escribir en Firebase

## Modo escritura

Solo se permitirá escritura cuando:

```text
DRY_RUN=false
CONFIRM_TENANT=tya
CONFIRM_PROJECT=tya-piloto
```

Además debe existir autorización explícita de Paula.

## Resultado posterior

Después de cargar el seed ficticio, se debe ejecutar la validación documentada en:

```text
CASOS-PRUEBA-FIRESTORE.md
VALIDACION-TYA-PILOTO.md
PLAN-EJECUCION-SEED-TYA.md
```

## Pendiente

Crear el script real solo cuando se confirme:

1. Base frontend `main` aprobada.
2. PR #1 listo para sincronizar o estabilizado.
3. Método seguro de credenciales definido fuera del repo.
4. Autorización expresa de Paula.
