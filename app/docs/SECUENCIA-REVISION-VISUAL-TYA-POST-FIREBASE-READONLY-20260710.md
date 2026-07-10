# Secuencia bloqueada — revisión visual TyA después de Firebase read-only

Fecha: 2026-07-10  
Repo: `paulaosoriof86/demoCXOrbia`  
Rama: `docs-tya-v6-v71-audit`  
PR: #7 draft/open/no merge

## Regla de continuidad

La revisión visual humana de la plataforma adaptada para TyA no se sustituye por los smokes automatizados ni por la preparación Auth/Firestore.

El runtime post-V96 ya está empalmado, validado y documentado, pero la revisión visual humana debe realizarse sobre ese runtime desplegado de forma controlada en DEV, antes de activar usuarios, claims, reglas, imports, writes o el switch real de `CX.data`.

## Orden exacto

1. Ejecutar la verificación Firebase DEV estrictamente read-only, con autorización explícita separada.
2. Si el resultado es limpio o revisado como apto, ejecutar deploy Hosting DEV manual-only del runtime post-V96 empalmado, con autorización explícita separada.
3. Realizar revisión visual humana completa en la plataforma DEV adaptada para TyA.
4. Revisar por rol y módulo: admin, coordinador, aliado, custom, cliente y shopper; dashboard, HR, visitas, postulaciones, reservas/asignaciones, shoppers, certificaciones, Academia, liquidaciones/pagos, cliente multi-proyecto, configuración y Diagnóstico/Readiness.
5. Comparar contra la documentación acumulada, pendientes Claude, mejoras locales y source lock, sin pedir nuevamente información ya entregada.
6. Corregir regresiones o pendientes frontend por el carril Claude/prototipo y documentar cada hallazgo.
7. Solo después de GO visual humano preparar y ejecutar dry-run de identidades opacas.
8. Usuarios Auth, claims, reglas, protected reads, imports y writes requieren autorizaciones separadas y permanecen bloqueados hasta ese GO visual.

## Qué ya está disponible

- source lock post-V96 empalmado;
- información y reglas TyA acumuladas;
- HR como fuente operacional;
- shoppers históricos;
- certificaciones carryover;
- liquidaciones y pagos de junio;
- Cinépolis como proyecto configurable;
- multi-proyecto;
- matriz de roles/scopes;
- pendientes Claude/prototipo;
- impacto Academia;
- gates de source lock, drift, smoke, predeploy y Auth preactivation.

No se debe reiniciar metodología ni solicitar de nuevo esos datos.

## Aclaración técnica

El `Phase A Visual Smoke` automatizado valida render básico y ausencia de fallas críticas, pero no reemplaza la revisión visual y operativa de Paula en el DEV desplegado.

La URL DEV no debe darse por actualizada al runtime post-V96 hasta ejecutar el deploy Hosting manual-only correspondiente.

## Estado seguro

- sin deploy nuevo;
- sin producción;
- sin Auth real;
- sin usuarios o claims;
- sin Firestore/Storage/Functions reales;
- sin imports o writes;
- sin HR writeback;
- sin Make/Gemini;
- sin pagos reales.
