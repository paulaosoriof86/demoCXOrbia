# CXOrbia Recovery — I3 | Readback focal Admin y source QA | 2026-11-02

**Carácter:** recibo adicional del carril único; no reemplaza la matriz, ledger, descriptor ni plan congelado. **Estado:** `HOLD`. **Producción:** `DO_NOT_TOUCH`. **I4:** no autorizado.

## Identidad y método

- Repositorio: `paulaosoriof86/demoCXOrbia`.
- Rama: `recovery/cxorbia-phase-a-20260831`.
- HEAD de control sometido a pruebas: `983776ee8465e49760c51e1c28f741a9c9f6b218`.
- Tree: `5038c7359ac15294a2063ee99d88b1f8c2fbf7e6`.
- Product source de descriptor V227: `1737051ae56238eb0f71a6e3a237a4651ab32073`.
- Matriz vigente: `RECOVERY-I3-MODULE-TRUTH-MATRIX-20261102-V227.json`, 5/21 MATCH; este recibo **no** modifica esa clasificación sin todo el contrato E2E/roles/ACK/humano.
- DEV Admin autenticado: `https://cxorbia-backend-dev.web.app/index-backend-dev.html` · `tya/cinepolis` · `OCT 2026`.
- Revisión HR ya publicada, observada en Hojas de Ruta: `2f02fe8613092f5e5b3e748085fce9db483e70c11974c39cf300b2506687cbde`. La navegación no realizó lectura directa nueva del proveedor.

## Pruebas realizadas sin escrituras

1. **Source QA:** seis grupos focales (identidad/revisión, Dashboard, país en Postulaciones, Shoppers, disponibilidad, etiquetas de Certificación): 30 comprobaciones PASS, 0 FAIL.
2. **Source QA transversal:** 98 pruebas PASS y 0 FAIL tras recuperar el historial Git necesario para una precondición del test D05/D04. La prueba D05/D04 contiene 106 aserciones internas PASS, pero sigue expresamente `SERVER_CLIENT_SOURCE_ONLY` con reglas E2E, runtime/Hosting, ciclo Shopper y aceptación humana pendientes. El fallo inicial `git merge-base` correspondió exclusivamente a `git clone --depth 1`; no es defecto funcional.
3. **Chrome Admin / periodo:** Dashboard, Visitas, Postulaciones, Hojas de Ruta, Periodos, Proyectos y Reportes coinciden en 44 visitas de octubre. GT 34, HN 10; 36 realizadas y 8 por realizar; reportes por país GT 26/34 y HN 10/10.
4. **Filtro real de Visitas:** HN muestra 10 filas visibles con honorario `L 200`; GT muestra 34 filas visibles con honorario `Q 60`. No se cambió ningún registro.
5. **Fuente histórica y ámbito:** Proyectos muestra un proyecto y 17 periodos con 748 visitas; Periodos clasifica 13 cerrados y 4 activos. Histórico excluye periodo activo por defecto.
6. **Shoppers:** 204 perfiles de tabla, 16 visibles con marca de revisión; aviso de 382 **expedientes técnicos**, no 382 fusiones. No se fusionó ninguna identidad.
7. **Recursos:** apertura de `Instructivo Shopper.pdf` en sesión Admin con estado `PDF visible en la plataforma` y paginación de 7 páginas; no demuestra por sí sola la lectura Shopper ni todos los controles de Storage.
8. **Certificación:** dos bancos (publicado y pendiente); 5 evidencias históricas y 4 aprobaciones legacy. No se ejecutó intento Shopper ni guardado Admin.
9. **Finanzas:** Dashboard y Liquidaciones separan GTQ y HNL; 35 registros requieren conciliación, 1 candidata GT para lote y 0 pagos confirmados. Se evitó registrar pagos o generar lotes.
10. **Otras superficies observadas en solo lectura:** Reservas, Cuestionarios, CRM, Academia, Clientes/configuración, Usuarios/Permisos, Administrabilidad, Recursos, Costos/Propuestas y otras pantallas Admin. La navegación no constituye certificación completa de sus respectivos dominios.

## Límites y hallazgos focales

- GitHub Actions run `41526146271` / `#2075`: `canonical-candidate-authority = success`; trabajos de certificación integrales listados en el run resultaron `skipped`. **No** llamar a ese run «21 módulos certificados».
- Cohorte aprobada por Paula el 2026-10-28: 139 pares / 83 grupos, digest `ac3e15184316d62aa53942359e857f2c34dec486a2ca41057e529a39f062d872`.
- Último ACK independiente documentado: 32/83 grupos cerrados provisionalmente, 51 pendientes. De estos, 3 `KEEPER_VERIFIED`, con 15 certificaciones a preservar; 36 con visitas del alias, 11 con varios HR canónicos y 1 keeper no verificado. **No** ejecutar nuevas fusiones sin revalidar revisión HR y siete dominios por grupo.
- Revisión HR aprobada anterior `4fc8def718fd1504f5d76a1fbc80b6901cbf711ec2b89f4dfc3a81ecbbca517a` no coincide con la revisión publicada actual. El preflight de las 139 decisiones sigue en `HOLD` hasta proof de equivalencia de fuente sobre los pares exactos, sin exigir nueva aprobación general de Paula.
- No se accedió con rol Shopper/Cliente ni se probó un ciclo de asignación, postulación, publicación, pago o fusión con ACK de proveedor. No convertir evidencia de lectura en escritura certificada.

## Siguiente bloque autorizado

1. Revalidar el subconjunto exacto 139/83 contra la HR vigente con lectura protegida en el carril actual, reportando diferencias de fuente sin reabrir la aprobación humana histórica.
2. Solo si el origen y keeper pasan, ejecutar secuencialmente los grupos seguros mediante el comando existente: ACK, readback independiente de los siete dominios y decremento real de 51; jamás volver a fusionar los 32 cerrados.
3. Ejecutar tests DEV de rol Shopper y Cliente y flujos con ACK para D06, B10, G03, HR/Visitas, Recursos/Beneficios y Finanzas; promover únicamente los dominios cuyo contrato completo pase, conservando aprobaciones históricas válidas.
4. Actualizar matriz, ledger, descriptor y puntero de la **misma** candidata tras cada cierre real. Gate20/21 permanecen `HOLD`, I3 `HOLD`, I4 no autorizado, hasta prueba terminal sobre un único artefacto y autorización explícita.

## Cambios físicos

Solo se agrega este recibo documental; **0** modificaciones funcionales, 0 fusiones, 0 escrituras HR/Auth/Firestore, 0 deploys DEV/productivos y 0 pagos.
