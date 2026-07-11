# Paquete Claude — prototipo genérico post empalme

Fecha: 2026-07-11

## Decisión

Se aprovecha la capacidad recuperada de Claude ahora. No se espera a acumular más porque existen bloqueadores P0 del prototipo que condicionan la producción visual y el siguiente empalme.

## Fuente obligatoria

El paquete se derivó de la última baseline ya auditada y empalmada. No usa una candidata anterior.

Para mantener separación estricta:

- incluye únicamente el subconjunto de prototipo genérico;
- excluye archivos de backend, adapters, snapshots y datos reales;
- neutraliza etiquetas residuales de un cliente histórico dentro del importador genérico;
- no contiene nombres ni reglas de clientes reales;
- preserva arquitectura, navegación, persistencia, scopes, Academia y PWA ya resueltas.

## Prioridad de ejecución

1. indicador único de origen de datos;
2. aislamiento real de fixtures demo por modo;
3. integraciones y automatizaciones sin conexiones ficticias;
4. permisos por acción con tenant, proyecto y scope;
5. workflow honesto de Academia y Certificación.

El backlog acumulado completo viaja en el paquete, pero no debe reabrir capacidades ya cerradas.

## Validaciones del paquete

- 63 scripts locales declarados;
- 0 scripts faltantes;
- 0 scripts duplicados;
- todos los JavaScript pasan `node --check`;
- ZIP íntegro;
- escaneo sin nombres específicos de clientes/proyectos;
- SHA-256 del ZIP: `d5a8f73a6fe4eb635ed7a89145b092f32604014a5f002880ef935a28c19ccc5f`.

## Contrato de retorno

Claude debe devolver un ZIP completo e incremental del prototipo genérico y reporte forense. Después se auditará contra esta baseline, se preservará el backend vigente y se realizará un nuevo empalme integral antes de aceptar otra baseline o desplegar.

## Estado seguro

Sin merge, deploy, producción, datos reales, Auth, reglas, proveedores ni pagos.