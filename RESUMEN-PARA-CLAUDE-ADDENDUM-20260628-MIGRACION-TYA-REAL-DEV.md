# RESUMEN-PARA-CLAUDE-ADDENDUM-20260628-MIGRACION-TYA-REAL-DEV.md

## Contexto

Paula indicó que T&A debe quedar migrada, mientras Claude retoma mañana las mejoras pendientes del prototipo/frontend.

La decisión fue preparar el pipeline de migración real en DEV sin tocar producción y sin modificar módulos UI.

## Lo preparado

Se creó una ruta local y segura para trabajar el export limpio de T&A:

```text
firebase/private-input/tya-export-real.json
firebase/private-output/
```

Ambas rutas quedaron excluidas en `.gitignore` para que ningún dato operativo se suba a GitHub.

## Herramientas nuevas

### Validación local

```text
firebase/client-write-tools/validate-tya-real-export.mjs
```

Objetivo:

- Leer el export local.
- Validar JSON UTF-8 sin BOM.
- Contar colecciones.
- Detectar duplicados por llave natural.
- Detectar campos que no deben entrar al piloto.
- Generar reportes locales sin imprimir datos personales en consola.

No escribe Firestore.

### Transformación local

```text
firebase/client-write-tools/transform-tya-real-export.mjs
```

Objetivo:

- Convertir el export limpio al modelo Firestore `/tenants/tya`.
- Generar archivo local transformado en `firebase/private-output/tya-real-transformed-firestore.json`.
- No escribir Firestore.
- Por defecto omite contactos; puede enmascararlos o incluirlos solo con autorización separada.

### Carga piloto DEV

```text
firebase/client-write-tools/load-tya-real-pilot-firestore-dev-sdk.mjs
```

Objetivo:

- Cargar solo un piloto real limitado en Firestore DEV.
- Limitar inicialmente a 1 proyecto y máximo 20 visitas.
- Escribir únicamente en Firebase DEV `cxorbia-backend-dev`.
- Requiere autorización local explícita.

## Documentación nueva/actualizada

- `PLAN-MIGRACION-TYA-REAL-DEV.md`.
- `CAMBIOS-BACKEND-ADDENDUM-20260628-MIGRACION-TYA-REAL.md`.
- `MIGRACION-BASE-BUENA-TYA.md` actualizado.
- `.gitignore` actualizado.

## Estado que Claude debe respetar

- No modificar `/app/modules` desde el PR backend.
- No parchar UI desde backend.
- No hacer merge.
- No desplegar Hosting.
- No tocar producción.
- No activar adapter global todavía.
- No subir export real ni reportes locales con datos operativos al repo.

## Punto importante para Claude

El preview local controlado del adapter DEV abrió, pero visualmente mostró los 3 proyectos ficticios del prototipo. Por eso, tras cargar el piloto real T&A en DEV, se debe repetir:

1. Lectura Firestore DEV.
2. Validación adapter headless.
3. Preview local controlado.
4. Revisión visual por perfil.

## Pendiente operativo

Falta que Paula tenga/disponibilice el export limpio real de T&A en JSON UTF-8 sin BOM, guardado localmente como:

```text
firebase/private-input/tya-export-real.json
```

Después se ejecuta validación local. Solo si la validación queda limpia se transforma y se pide autorización expresa para carga piloto DEV.
