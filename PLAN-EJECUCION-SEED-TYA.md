# PLAN-EJECUCION-SEED-TYA.md

## Objetivo

Definir cómo se ejecutará el seed ficticio de T&A en Firebase DEV cuando corresponda, sin hacerlo todavía y sin exponer credenciales en el repositorio.

## Estado actual

- Seed ficticio: `firebase/seed-tya-piloto.json`.
- Proyecto Firebase DEV: `cxorbia-backend-dev`.
- Tenant piloto: `tya`.
- Proyecto piloto: `tya-piloto`.
- Adapter: desactivado.
- Producción: no tocar.
- Datos reales: no cargar.

## Precondiciones

No ejecutar el seed hasta cumplir:

1. Confirmar si `main` actual es la base aprobada del prototipo.
2. Mantener PR #1 como draft.
3. Validar `firestore.rules` con `CASOS-PRUEBA-FIRESTORE.md`.
4. Definir método seguro para credenciales DEV.
5. Confirmar que no se subirán llaves privadas al repo.
6. Confirmar que `CX.BACKEND.enabled` sigue en `false`.
7. Tener autorización expresa de Paula para crear usuarios DEV o cargar seed ficticio.

## Método seguro propuesto

Usar un proceso local controlado con Firebase Admin SDK, pero sin guardar credenciales en GitHub.

La credencial debe vivir solo en la máquina local o en un secreto temporal seguro. No debe quedar en:

```text
repo
commits
pull requests
issues
comentarios
capturas
archivos adjuntos públicos
```

## Qué cargará el seed

El seed ficticio debe crear solo datos demo bajo:

```text
/tenants/tya
/tenants/tya/shoppers
/tenants/tya/projects/tya-piloto
/tenants/tya/projects/tya-piloto/visits
/tenants/tya/projects/tya-piloto/postulations
/tenants/tya/projects/tya-piloto/questionnaires
```

No debe crear:

```text
datos bancarios reales
evidencias reales
NDA
documentos personales
datos de clientes reales
usuarios reales sin autorización
```

## Validaciones después de cargar seed

1. Confirmar conteos:
   - 1 tenant
   - 1 proyecto
   - 4 shoppers ficticios
   - 8 visitas ficticias
   - 3 postulaciones ficticias
   - 1 cuestionario demo
2. Confirmar que todas las rutas están bajo `/tenants/tya`.
3. Confirmar que no hay datos fuera de tenant.
4. Confirmar que reglas permiten lecturas/escrituras esperadas por rol.
5. Confirmar que reglas bloquean accesos de otro tenant.
6. Mantener adapter desactivado hasta validar datos.

## Activación posterior del adapter

Después del seed ficticio y validación de reglas:

1. Activar adapter solo en DEV o preview controlado.
2. Confirmar que `CX.data` mantiene la misma interfaz.
3. Revisar dashboard, visitas, shoppers, postulaciones y beneficios.
4. Documentar errores en `PENDIENTES-PROTOTIPO.md`.
5. No corregir frontend dentro del PR backend.

## Señal de avance

Solo después de validar seed ficticio y adapter con datos demo se podrá pasar al gate de base buena real descrito en:

```text
MIGRACION-BASE-BUENA-TYA.md
```

Hasta entonces, no pedir ni cargar export real de la plataforma anterior.
