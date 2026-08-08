# Phase A real connection readiness gate TyA

Fecha: 2026-07-09
Repo: `paulaosoriof86/demoCXOrbia`
Rama: `docs-tya-v6-v71-audit`
PR: #7 draft/open/no merge

## Objetivo

Garantizar que todo lo preparado para Phase A TyA tenga impacto real cuando se conecte la fuente/base operativa, evitando que al conectar datos reales vuelvan a aparecer problemas de proyecto, periodo, HR, usuarios, cursos, certificaciones, shoppers, liquidaciones, pagos, reviewQueue, permisos y Academia.

Este bloque no conecta base real, no escribe Firestore, no activa Auth, no importa datos y no toca produccion. Crea un gate funcional que debe pasar antes de cualquier conexion real.

## Archivos agregados

- `backend/contracts/phase-a-real-connection-readiness-gate-v1.json`
- `backend/config/phase-a-real-connection-readiness-map.source-safe.json`
- `tools/release/tya-real-connection-readiness-gate-validate.mjs`

## Por que esto era necesario

Paula marco correctamente el riesgo: si ya estan documentadas las reglas y la informacion de TyA, no tiene sentido conectar la base/fuente real y volver a fallar en cosas conocidas como:

- proyecto vs periodo;
- lectura de hoja de ruta;
- creacion/configuracion de proyecto;
- usuarios, representantes, coordinadores, franquicia, cliente y shoppers;
- cursos y Academia;
- certificaciones ya presentadas;
- liquidaciones/pagos pendientes;
- reviewQueue y auditEvents;
- permisos y datos protegidos.

Este gate evita avanzar a conexion real si esos caminos no estan preparados.

## Que valida

El validador revisa:

- contrato de readiness en estado seguro;
- safeState sin base real, writes, Auth, imports, deploy ni produccion;
- existencia de contratos base;
- existencia de fuente HR source-safe;
- separacion proyecto/periodo;
- rutas backend por modulo;
- readiness map de proyectos, usuarios, Academia, certificaciones, shoppers, visitas, liquidaciones, outbox, reviewQueue y auditEvents;
- payload source-safe sin campos sensibles evidentes.

## Comando seguro

```bash
node tools/release/tya-real-connection-readiness-gate-validate.mjs --out .tmp/real-connection-readiness
```

El comando genera reporte JSON/MD y no llama Firebase, no llama Firestore, no llama Auth, no escribe datos, no importa y no despliega reglas.

## Regla Phase A desde este punto

Antes de cualquier GO real de conexion o escritura, debe poder contestarse afirmativamente:

1. Proyecto no es periodo.
2. Periodo filtra proyecto.
3. HR/source produce payload source-safe.
4. Fuente viva se transforma en candidatos protegidos antes de escribir.
5. Usuarios/personas/roles/scopes existen.
6. Claims futuros son pequenos y validables.
7. Cursos/Academia tienen ruta configurable.
8. Certificaciones tienen carryover path.
9. Liquidaciones/pagos tienen preview/review sin ejecucion real.
10. ReviewQueue existe antes de resolver conflictos.
11. AuditEvents existe antes de lecturas protegidas o cambios criticos.
12. No hay PII en preview publico.
13. Ningun gate de write/provider/produccion se activa sin GO explicito.

## Impacto Phase A TyA

Este bloque amarra el trabajo acumulado para que la conexion real no sea una improvisacion. Sirve como semaforo antes de conectar la base/fuente actual de TyA.

La meta operacional es que, cuando se active el carril real, la plataforma ya sepa manejar:

- tenant TyA;
- proyecto como entidad configurable;
- periodos como filtros/estados;
- HR/source viva;
- shoppers source-safe y protegidos;
- usuarios/personas/roles/scopes;
- cursos y Academia;
- certificaciones preservadas;
- visitas/asignaciones;
- liquidaciones y pagos controlados;
- reviewQueue;
- auditEvents.

## Impacto reusable CXOrbia

El patron es reusable para nuevos tenants/proyectos: ningun cliente nuevo debe conectarse a datos reales sin pasar primero por readiness gate equivalente.

## Impacto Claude/prototipo

Claude debe representar esto genericamente:

- wizard/configuracion que no permita avanzar si proyecto/periodo/source/roles/gates estan incompletos;
- estados honestos: `readiness pendiente`, `gate apagado`, `dry-run`, `source-safe`, `no escrito`;
- cursos/certificaciones/usuarios/proyectos como configurables;
- no hardcodear TyA ni un cliente;
- no mostrar que datos reales estan conectados si el gate no paso.

## Impacto Academia

Academia debe explicar:

- que es un readiness gate;
- por que proyecto y periodo no son lo mismo;
- como validar HR/source antes de importar;
- como usuarios/roles/scopes impactan permisos;
- como cursos/certificaciones se preparan antes de publicar;
- como liquidaciones se revisan antes de pago;
- por que reviewQueue y auditEvents evitan reprocesos y errores silenciosos.

## Estado seguro

Contrato/config/script validador solamente. No base real, no Auth real, no Firestore writes, no import real, no deploy, no produccion, no pagos, no HR writeback, no Make/Gemini y no datos sensibles.
