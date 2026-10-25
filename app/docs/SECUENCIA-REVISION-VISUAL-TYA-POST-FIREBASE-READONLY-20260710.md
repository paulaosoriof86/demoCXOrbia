# Secuencia obligatoria — operabilidad TyA y revisión visual humana

Fecha: 2026-07-10  
Repo: `paulaosoriof86/demoCXOrbia`  
Rama: `docs-tya-v6-v71-audit`  
PR: #7 draft/open/no merge

## Corrección de rumbo

La revisión visual humana de la plataforma adaptada para TyA no puede hacerse sobre una plataforma que solo conserve el runtime post-V96 y data demo. Tampoco puede sustituirse por smokes automatizados, contratos o documentación.

El objetivo operativo sigue siendo que Paula pueda ver y operar TyA/Cinépolis con la información ya trabajada: HR, visitas, shoppers históricos, certificaciones carryover, postulaciones/asignaciones, liquidaciones y pagos de junio, proyecto configurable y multi-proyecto.

Por tanto, la revisión visual debe ocurrir después de conectar una visualización controlada real-data/source-safe en el único punto de `CX.data`, y antes de activar Auth real, claims, rules, imports definitivos o writes.

## Orden exacto corregido

1. Ejecutar la verificación Firebase DEV estrictamente read-only, con autorización explícita separada.
2. Si el entorno es limpio o revisado como apto, ejecutar el real-data proof y dry-run con las fuentes TyA ya trabajadas, sin pedir nuevamente HR, reglas, shoppers, certificaciones o liquidaciones.
3. Validar conteos y mapping source-safe de:
   - tenant TyA;
   - proyecto Cinépolis configurable;
   - GT/HN, monedas, periodos y quincenas;
   - visitas y asignaciones HR;
   - shoppers históricos;
   - certificaciones ya presentadas;
   - liquidaciones/pagos de junio;
   - conflictos para reviewQueue;
   - cuestionario/origen por proyecto/visita.
4. Conectar preview real-data no destructivo en el único punto de `CX.data`, preservando exactamente su interfaz y manteniendo writes/providers apagados.
5. Ejecutar deploy Hosting DEV manual-only del runtime post-V96 con ese preview operativo, con autorización explícita separada.
6. Realizar revisión visual y operativa humana completa de Paula en la URL DEV verificada.
7. Revisar por rol y módulo: admin, coordinador, aliado, custom, cliente y shopper; dashboard, HR, visitas, postulaciones, reservas/asignaciones, shoppers, certificaciones, Academia, liquidaciones/pagos, cliente multi-proyecto, configuración y Diagnóstico/Readiness.
8. Comparar contra la documentación acumulada, mejoras de Claude, pendientes, reglas TyA y legacy útil, sin reiniciar levantamientos.
9. Corregir regresiones o pendientes frontend por el carril Claude/prototipo y registrar impacto en Academia, manuales, rutas por rol y notificaciones.
10. Solo después del GO visual humano continuar con dry-run de identidades opacas, usuarios Auth de prueba, claims, protected reads, rules e imports controlados, cada uno con autorización separada.

## Qué ya está disponible y no debe pedirse de nuevo

- source lock post-V96 empalmado;
- mejoras Claude incorporadas y auditadas;
- información y reglas TyA acumuladas;
- lectura y mapping HR multi-tab;
- reglas Cinépolis Q1/Q2, franjas, quincenas, disponible desde, submitido y cuestionario;
- shoppers históricos y referencias de revisión;
- certificaciones carryover;
- visitas hasta junio ejecutadas;
- liquidaciones y pagos de junio como pendiente operativo;
- Cinépolis como proyecto configurable;
- multi-proyecto;
- contratos de `CX.data`, HR, import, reviewQueue, Auth/RBAC, Firestore, Storage, Make y Gemini;
- matriz de roles/scopes;
- pendientes Claude/prototipo;
- impacto Academia;
- gates de source lock, drift, smoke, predeploy y Auth preactivation.

## Qué falta realmente para la revisión visual

No falta rediseñar de nuevo la plataforma ni volver a pedir la información TyA.

Falta ejecutar el carril operativo ya preparado:

1. clean-state read-only;
2. real-data proof/dry-run;
3. preview TyA en `CX.data`;
4. deploy DEV manual-only;
5. revisión visual humana completa.

## Aclaración técnica

El `Phase A Visual Smoke` automatizado valida render básico y ausencia de fallas críticas. No confirma que todos los datos TyA aparezcan correctamente ni sustituye la revisión operativa de Paula.

La URL DEV no debe darse por adaptada a TyA real/source-safe hasta que el preview de datos esté conectado y se ejecute el deploy Hosting manual-only correspondiente.

## Estado seguro

- sin deploy nuevo;
- sin producción;
- sin Auth real;
- sin usuarios o claims;
- sin Firestore/Storage/Functions reales;
- sin imports definitivos o writes;
- sin HR writeback;
- sin Make/Gemini activos;
- sin pagos reales.
