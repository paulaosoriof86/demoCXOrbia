# PROTOCOLO DE VALIDACIÓN VISUAL ACUMULATIVA POR CHECKPOINTS

**Fecha:** 2026-08-02  
**Estado:** `VISUAL_VALIDATION_REQUIRED_PER_CUMULATIVE_CHECKPOINT__NO_TECHNICAL_PASS_SUBSTITUTION`  
**Rama única:** `docs-tya-v6-v71-audit`  
**PR:** #7 draft/open/no merge

## 1. Regla vinculante

La reconstrucción source-only puede identificar y ensamblar la mejor versión técnica de cada módulo, pero **ninguna familia queda aprobada funcionalmente sin validación visual expresa de Paula sobre el mismo build acumulativo**.

Un PASS de sintaxis, hashes, Auth, HR, contratos, conteos o gates remotos no sustituye la validación humana de la experiencia completa.

No se declarará `APROBADO`, `FROZEN` ni `LISTO PARA PRODUCCIÓN` con base exclusiva en pruebas técnicas.

## 2. Criterios: no son arbitrarios

Los criterios se recuperan de decisiones, capturas, rechazos y aprobaciones previas del proyecto. En particular:

- entrada humana única y directa por perfiles;
- ausencia de pantalla técnica paralela de Auth en el carril humano;
- Administración/Coordinación, Portal Cliente y Shopper/Evaluador visibles según el contrato aprobado;
- tenant TyA y proyecto Cinépolis correctos;
- Proyecto y Periodo separados;
- HR viva como autoridad operacional;
- ausencia de superficies `Demo comercial`, `Admin Demo`, `Cliente Demo`, `Proyecto Retail` o equivalentes en el carril TyA;
- datos, KPIs, hojas de ruta, hallazgos, porcentajes y scores sin fabricación;
- navegación completa por rol;
- sin pantallas blancas, recargas automáticas o estado degradado sin fallo real;
- misma revisión de fuente en Dashboard, operación, Finanzas y portales;
- identidad Shopper exacta y aislamiento de datos;
- modelo financiero delegado para `tya::cinepolis`, facturación local false y regalía 0;
- reportes con alcance, filas, periodo, marca y fuente coherentes;
- ningún shell reducido o composición fragmentada.

Un criterio nuevo solo puede agregarse por:

1. requisito ya documentado que faltaba trasladar;
2. regresión reproducible encontrada durante la reconstrucción;
3. condición técnica indispensable para evitar un P0.

Toda adición debe identificar su fuente y no puede reinterpretar silenciosamente una aprobación anterior.

## 3. Estrategia para avanzar rápido sin ocultar regresiones

No se hará un deploy por archivo ni por corrección mínima. Tampoco se esperará hasta el final de todos los módulos para mostrar el resultado.

Se utilizarán **checkpoints acumulativos**. En cada checkpoint:

- la candidata sigue siendo la misma rama y composición acumulativa;
- se agrega la siguiente familia sobre lo ya validado;
- Paula revisa módulo por módulo dentro del mismo build;
- las familias anteriores reciben un smoke visual abreviado antirretroceso;
- una falla se corrige sobre la misma candidata, sin abrir versión paralela.

## 4. Checkpoints visuales obligatorios

### Checkpoint Visual 1 — Base + prioridad de salida

Incluye Familias A y B:

- entrada/login/shell;
- tenant, proyecto, periodo y navegación;
- fuente y estado HR;
- CRM Ops Leads;
- Dashboard;
- hoja de ruta;
- Clientes, Comercial y Marketing cuando sean dependencias del CRM;
- indicadores y drilldowns.

Paula valida cada módulo de este checkpoint antes de que se considere cerrado. Este es el primer checkpoint porque CRM Ops Leads y control ejecutivo son la prioridad operativa indicada por Paula.

### Checkpoint Visual 2 — Operación + Shopper

Agrega Familias C y D:

- Proyectos, Periodos, HR e Histórico;
- Visitas, detalle/revisión, Postulaciones y Reservas;
- Shoppers y Novedades;
- Mi Día, Disponibles, Mis Visitas, Mi Perfil;
- cuestionario, Beneficios, Certificaciones, documentos y tablón.

Incluye revalidación abreviada de entrada, CRM, Dashboard y hoja de ruta sobre el nuevo build acumulativo.

### Checkpoint Visual 3 — Finanzas + Portales + Reportes

Agrega Familias E y F:

- Finanzas;
- Liquidaciones;
- Movimientos;
- Costos;
- pagos/lotes en su estado real;
- Portal Cliente;
- Portal Shopper;
- reportes Admin/Cliente/Shopper;
- PDF, XLSX y PPTX;
- branding, gráficas, alcance, periodo y fuente.

Incluye smoke antirretroceso de A–D.

### Checkpoint Visual 4 — Administración + cierre acumulativo

Agrega Familia G y ejecuta revisión final:

- Configuración;
- Administrabilidad;
- Importador;
- Integraciones;
- Automatizaciones;
- Correo;
- Soporte;
- Marca;
- Diagnóstico;
- Academia.

Academia se valida y documenta, pero no bloquea la prioridad operativa salvo P0 demostrado.

Este checkpoint termina con revisión acumulativa completa antes del freeze y cutover.

## 5. Formato obligatorio de evidencia visual

Cada checkpoint debe registrar:

- build ID;
- commit SHA funcional;
- manifest SHA;
- URL DEV exacta;
- fecha/hora;
- rol utilizado;
- proyecto y periodo visibles;
- módulo revisado;
- criterio esperado;
- resultado `APROBADO`, `HALLAZGO` o `NO APROBADO`;
- captura o referencia de la evidencia;
- observación de Paula;
- corrección aplicada, si existe;
- revalidación del mismo módulo sobre el mismo linaje acumulativo.

La aprobación se vincula al build exacto. No se transfiere automáticamente a otro deploy o a otro SHA.

## 6. Estados visuales permitidos

- `PENDING_HUMAN_VISUAL`: reconstrucción técnica lista, todavía no revisada por Paula.
- `HUMAN_VISUAL_APPROVED_FOR_BUILD`: aprobada por Paula para el build exacto.
- `HUMAN_VISUAL_FINDING`: observación reproducible pendiente.
- `HUMAN_VISUAL_NO_GO`: regresión/P0 que impide avanzar el checkpoint.
- `SUPERSEDED_BY_NEW_CUMULATIVE_BUILD`: aprobación anterior requiere smoke antirretroceso porque cambió el build acumulativo.
- `FINAL_HUMAN_VISUAL_APPROVED`: revisión final acumulativa aprobada antes de freeze.

No se permite convertir `BEST_TECHNICAL_PENDING_VISUAL` en `APPROVED_AND_PRESENT` sin evidencia humana.

## 7. Qué debe revisar Paula y qué no se le traslada

Paula revisa la experiencia visible y confirma si corresponde al mejor estado esperado.

No se le traslada:

- decidir SHAs;
- comparar código;
- reconstruir versiones;
- ejecutar PowerShell;
- identificar dependencias técnicas;
- recordar qué candidata contenía cada mejora;
- repetir capturas ya válidas sin cambio del área correspondiente.

Cuando se solicite una validación, se entregará:

- una sola URL;
- el build exacto;
- una ruta corta por módulos;
- qué debe observar;
- qué ya fue validado técnicamente;
- qué cambió desde el checkpoint anterior.

## 8. Regla de no avance ciego

No se avanzará de un checkpoint visual al siguiente bajo la afirmación de que “los gates pasaron” si Paula no ha revisado el checkpoint vigente.

Durante el inventario source-only sí se puede continuar reconstruyendo proveniencia, porque aún no se declara aprobación funcional ni se despliega una candidata nueva. La aplicación funcional acumulativa se organizará para que el primer build visible contenga A+B y priorice CRM Ops Leads.

## 9. Tratamiento de hallazgos

Si Paula encuentra un defecto:

1. se registra contra build, rol y módulo exactos;
2. se clasifica como pérdida acumulativa, integración, dato/fuente, UX o P1/P2;
3. se corrige en la misma rama y candidata acumulativa;
4. se ejecutan gates focales y acumulativos;
5. se publica un único build de reemplazo cuando esté autorizado;
6. se revalida el módulo afectado y el smoke antirretroceso relacionado.

No se pide nueva candidata ni se reinicia la metodología por rutina.

## 10. Estado seguro

Este protocolo es documental:

- cambios funcionales: 0;
- Hosting deploy: 0;
- Cloud Run: 0;
- Firestore/Auth/HR/Rules/Storage writes: 0;
- Make/Gemini/pagos: 0;
- merge: false;
- producción: false.

## 11. Clasificación

- **Reusable CXOrbia:** aprobación visual vinculada a build, checkpoints acumulativos y smoke antirretroceso.
- **Exclusivo cliente:** rutas, datos y criterios TyA/Cinépolis.
- **Claude/prototipo:** no afirmar aprobación visual por pruebas técnicas; preservar el mejor diseño aceptado.
- **Academia:** manuales y cursos deben corresponder al build visualmente aprobado.
- **Sin impacto Claude:** SHAs, manifests, gates y trazabilidad de evidencia.