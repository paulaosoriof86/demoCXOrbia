# Visual smoke session fix

Fecha: 2026-07-06

Se reviso el segundo run de visual smoke.

Resultado observado:

- El reporte ya se genero estructurado.
- El script cargo la app, pero no encontro nav de admin.
- Luego intento volver a login y encontro `#login` oculto por sesion persistida.

Diagnostico:

- La falla estaba en el harness de smoke visual.
- El smoke dependia demasiado del flujo manual de login/logout.
- La sesion demo podia quedar persistida entre navegaciones.
- Esto causaba `missing_nav` y luego timeout esperando login visible.

Correccion:

- `tools/qa/tya-phase-a-visual-smoke.mjs` ahora prepara sesion deterministica.
- Limpia `cx_session` y `sessionStorage` antes de entrar por rol.
- Parchea confidencialidad para no bloquear el smoke automatico.
- Entra por rol usando `CX.app.selectRole(role)`.
- Espera nav real con `#rail .nav-i`.
- Ya no depende del boton de logout.

Estado seguro: sin deploy, sin produccion, sin merge final, sin proveedores reales, sin imports y sin datos sensibles.

Siguiente paso: revisar nuevo run de visual smoke. Si falla, deberia traer una causa real de app o copy visible, no del harness.
