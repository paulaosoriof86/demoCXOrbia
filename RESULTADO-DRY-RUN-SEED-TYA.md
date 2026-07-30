# RESULTADO-DRY-RUN-SEED-TYA.md

## Objetivo

Registrar el resultado de la simulación del seed ficticio T&A sin escribir en Firebase.

## Alcance

Esta validación fue solo lectura sobre el archivo:

```text
firebase/seed-tya-piloto.json
```

No se ejecutó script, no se usaron credenciales, no se conectó Firebase, no se escribió en Firestore y no se tocó producción.

## Resultado general

Dry-run documental: aprobado para estructura inicial.

## Conteos detectados

```text
Tenant: 1
Proyectos: 1
Shoppers ficticios: 4
Visitas ficticias: 8
Postulaciones ficticias: 3
Cuestionarios demo: 1
Preguntas demo: 3
```

## IDs principales

```text
tenantId: tya
projectId: tya-piloto
```

## Rutas Firestore previstas

```text
/tenants/tya
/tenants/tya/shoppers/eval-01
/tenants/tya/shoppers/eval-02
/tenants/tya/shoppers/eval-03
/tenants/tya/shoppers/eval-04
/tenants/tya/projects/tya-piloto
/tenants/tya/projects/tya-piloto/visits/tya-piloto-v01
/tenants/tya/projects/tya-piloto/visits/tya-piloto-v02
/tenants/tya/projects/tya-piloto/visits/tya-piloto-v03
/tenants/tya/projects/tya-piloto/visits/tya-piloto-v04
/tenants/tya/projects/tya-piloto/visits/tya-piloto-v05
/tenants/tya/projects/tya-piloto/visits/tya-piloto-v06
/tenants/tya/projects/tya-piloto/visits/tya-piloto-v07
/tenants/tya/projects/tya-piloto/visits/tya-piloto-v08
/tenants/tya/projects/tya-piloto/postulations/post-01
/tenants/tya/projects/tya-piloto/postulations/post-02
/tenants/tya/projects/tya-piloto/postulations/post-03
/tenants/tya/projects/tya-piloto/questionnaires/q-demo-01
```

## Validaciones correctas

- Todos los registros principales están bajo tenant `tya`.
- El proyecto está bajo `tya-piloto`.
- Los shoppers usan nombres ficticios `Evaluador 01` a `Evaluador 04`.
- Los correos usan dominio demo `demo.cxorbia`.
- Las sucursales son demo.
- No hay datos bancarios.
- No hay evidencias reales.
- No hay documentos personales.
- No hay NDA.
- No hay base buena real.

## Observaciones

Los teléfonos usan formato demo con prefijo real de país y ceros. Son aceptables como datos ficticios para DEV, pero pueden mantenerse como placeholder explícito o cambiarse más adelante por `0000-0000` sin prefijo si se desea evitar cualquier confusión.

## Estado posterior

```text
Firebase escrito: no
Credenciales usadas: no
Producción tocada: no
Seed cargado: no
Adapter activado: no
CX.BACKEND.enabled: false
```

## Próximo paso

El siguiente avance sensible ya no es documental. Para escribir el seed en Firebase DEV se requiere autorización separada, credencial local segura y validación previa de reglas.
