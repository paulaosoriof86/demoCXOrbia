# PLAN-VALIDACION-REGLAS-DEV.md

## Objetivo

Preparar la validación de `firestore.rules` en DEV o Rules Playground sin publicar reglas todavía.

## Estado actual

```text
Reglas creadas: sí
Validación estática: sí
Validación real: pendiente
Reglas publicadas: no
Seed escrito: no
Usuarios DEV creados: no
Claims asignados: no
Adapter activo: no
Producción tocada: no
```

## Insumos

```text
firestore.rules
CASOS-PRUEBA-FIRESTORE.md
MATRIZ-ROLES-FIRESTORE.md
PLAN-AUTH-CLAIMS-DEV.md
firebase/seed-tya-piloto.json
```

## Orden de validación

```text
1. acceso sin sesión
2. aislamiento por tenant
3. admin
4. ops
5. shopper propio
6. shopper sin proyecto
7. cliente
8. finance
9. auditLogs
10. registro de resultados
```

## Casos P0

```text
sin sesión no lee tenant
otro tenant no lee tya
shopper no lee otro shopper
shopper lee visita disponible solo si tiene proyecto
cliente no lee finance
cliente no lee postulations
ops no lee finance
auditLogs no permite cambios posteriores
```

## Datos ficticios de referencia

```text
tenantId: tya
projectId: tya-piloto
shopper propio: eval-01
shopper ajeno: eval-02
visita disponible: tya-piloto-v01
finance demo: m01
```

## Resultado esperado

Solo avanzar a usuarios DEV o escritura de seed si los casos P0 pasan.

## No autorizado por este documento

```text
publicar reglas
crear usuarios
asignar claims
cargar seed
activar adapter
desplegar hosting
tocar producción
```

## Registro posterior

Después de validar, registrar resultados en:

```text
RESULTADO-VALIDACION-REGLAS-DEV.md
```
