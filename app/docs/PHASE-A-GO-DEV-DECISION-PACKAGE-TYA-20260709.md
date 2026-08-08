# Phase A GO DEV decision package TyA

Fecha: 2026-07-09
Repo: `paulaosoriof86/demoCXOrbia`
Rama: `docs-tya-v6-v71-audit`
PR: #7 draft/open/no merge
Contrato: `backend/contracts/phase-a-go-dev-decision-package-v1.json`

## Objetivo

Preparar el paquete de decision GO DEV sin pedir autorizacion todavia.

Este bloque ordena que estaria listo, que falta validar, que requiere GO de Paula, que seguiria bloqueado aun con GO DEV y que no debe confundirse con produccion.

## Decision actual

Estado: `not_requested`.

No se pide GO DEV en este bloque.
No se activa DEV.
No se conecta base.
No se ejecuta import.
No se escribe.
No se despliega.
No se produce.

## Que ya esta listo como base documental

No se reabre desde cero:

- baseline V91 y auditoria;
- checkpoints de continuidad;
- auditoria de efectuado/pendiente;
- ruta por carriles;
- `CX.data` adapter plan;
- domain mapping source-safe;
- readiness pack;
- builder y comando futuro;
- smoke precheck;
- GO/NO GO decision pack;
- DEV conditions;
- rollback/auditoria;
- reviewQueue/conflictos;
- guardrail anti-regreso.

## Que debe estar claro antes de pedir GO DEV

Antes de pedir GO DEV, debe estar clara esta frontera:

1. PR #7 sigue open/draft/no merge.
2. No hay produccion autorizada.
3. La base debe ser nueva y limpia.
4. Secrets quedan fuera del repo.
5. `CX.data` tiene punto unico de switch.
6. La interfaz existente de `CX.data` no se rompe.
7. El input TyA debe ser source-safe o quedar explicitamente pendiente.
8. El primer import debe ser dry-run.
9. ReviewQueue y auditEvents aplican antes de writes reales.
10. Rollback/disable path existe antes de activar.
11. Claude/prototipo queda informado.
12. Academia queda informada.
13. GO DEV no equivale a produccion.

## Opciones de decision

- `hold`: no pedir GO porque falta claridad o hay bloqueo.
- `need_local_evidence`: pedir un unico bloque manual porque GitHub no puede validar algo necesario.
- `ready_to_request_go_dev`: ya se puede pedir GO DEV de forma precisa.
- `go_dev_authorized`: Paula autorizo GO DEV explicitamente.
- `blocked`: existe hard stop.

## Que pedir a Paula solo si hace falta

Pedir unicamente:

- GO DEV explicito;
- fuente TyA source-safe si no esta disponible;
- smoke/consola si GitHub no puede resolver una duda bloqueante;
- decision operativa no documentada.

No pedir de nuevo:

- reglas HR ya documentadas;
- shoppers ya trabajados;
- certificaciones ya presentadas;
- regla de junio como liquidaciones/pagos;
- adapter, builder o readiness desde cero.

## Si Paula autoriza GO DEV

Solo se podria avanzar en DEV a:

- preparar recursos backend limpios de DEV;
- conectar adapter `CX.data` en modo DEV controlado;
- correr dry-run import source-safe;
- escribir registros DEV si el gate lo permite;
- registrar auditEvents;
- poblar reviewQueue DEV.

## Lo que GO DEV no autoriza

GO DEV no autoriza:

- merge final;
- deploy produccion;
- produccion;
- pagos reales;
- copiar base vieja;
- commitear datos sensibles;
- sobrescribir HR silenciosamente;
- hardcodear Cinépolis como logica global.

## Impacto Phase A real

Este bloque mueve Phase A de preparacion general a frontera de decision precisa. Evita pedir pasos manuales sin necesidad y evita confundir DEV con produccion.

Tambien mantiene el foco operativo TyA:

- HR como fuente operacional;
- Cinépolis como proyecto configurable;
- shoppers historicos conservados;
- certificaciones presentadas preservadas;
- junio como liquidaciones/pagos;
- conflictos por reviewQueue.

## Backend reusable

Patron reutilizable para CXOrbia:

- decision DEV separada de produccion;
- GO explicito por carril;
- base limpia obligatoria;
- adapter por punto unico;
- dry-run antes de import;
- auditEvents y reviewQueue antes de writes;
- gates para proveedores;
- no hardcodear cliente/proyecto.

## Claude/prototipo

Claude debe representar estados separados:

- preparado;
- pendiente evidencia local;
- listo para pedir GO DEV;
- GO DEV autorizado;
- DEV activo;
- bloqueado;
- no produccion.

Claude no debe mostrar sync/import/pago/proveedor real si el gate no esta activo.

## Academia

Academia debe explicar por rol:

- que es GO DEV;
- diferencia DEV vs produccion;
- por que la base es nueva;
- por que no se copia base vieja;
- por que el primer import es dry-run;
- por que hay reviewQueue;
- por que los pagos reales requieren otro GO;
- que hacer si aparece bloqueo.

## Necesidad de Paula

No necesito nada de Paula para este bloque.

El siguiente punto donde si podria necesitarla seria para autorizar GO DEV o para ejecutar una validacion local si aparece una duda que GitHub no puede resolver.

## Estado final

Paquete de decision GO DEV preparado. Decision actual: `not_requested`. Sin runtime, sin base conectada, sin import, sin writes, sin deploy y sin produccion.
