# PENDIENTES PROTOTIPO — POST CORRECCIÓN METODOLOGÍA ORBIT DIRECTA

Fecha: 2026-07-17

## Pendiente inmediato único

Aplicar directamente el delta auditado de V156 sobre `docs-tya-v6-v71-audit`, preservar backend y overlays, generar manifest/build-lock/verificador, documentar, crear commit/push y ejecutar gates post-empalme.

## Validación posterior

Después del empalme verificar:

- inicio de la app y ausencia de errores críticos;
- selección explícita de tenant/proyecto;
- proyecto vs periodo;
- 14 periodos y 616 visitas source-safe;
- 44 visitas por periodo;
- históricos diferenciados;
- junio ejecutado con pagos pendientes;
- país y moneda por proyecto;
- HR y llaves estables;
- shoppers históricos y certificaciones preservadas;
- liquidaciones y pagos como control;
- smoke Admin, Shopper y Cliente;
- Academia, manuales, rutas por rol y notificaciones;
- ausencia de promesas falsas de integraciones reales.

## No pendientes

No son pendientes válidos:

- crear carpeta `incoming/`;
- preparar `EMPALME-V156.json`;
- ejecutar `.cmd` o PowerShell;
- instalar integrador local;
- crear workflow, rama o PR;
- pedir otra candidata;
- repetir auditoría general;
- diseñar una nueva metodología.

## Clasificación

- **Reusable CXOrbia:** validación post-empalme y control antidesvío.
- **Exclusivo cliente:** cifras y reglas TyA/Cinépolis.
- **Claude/prototipo:** solo P1/P2 visuales comprobados después del empalme.
- **Academia:** actualización posterior según módulos efectivamente modificados.
- **Sin impacto Claude:** contrato, validador y eliminación del carril revocado.

## Estado seguro

Sin merge, deploy, producción, imports reales, writes, Make/Gemini live, Storage real ni pagos.