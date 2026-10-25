# Visual smoke overlay fix

Fecha: 2026-07-06

Se reviso el run visual despues del fix de sesion.

Resultado:

- Admin ya navego correctamente Dashboard, Postulaciones, Reservas, Automatizaciones, Finanzas y Academia.
- `CX.shopperQuestionnaire` cargo correctamente.
- El fallo restante ocurrio al entrar como shopper y navegar a `visitas`.

Causa:

- Un overlay `.cx-ov` interceptaba los clics del smoke automatizado.
- El reporte no mostro errores de consola ni `pageerror`.
- Esto apunta a bloqueo del harness por overlay, no a ruptura de los modulos admin ya visitados.

Correccion:

- `tools/qa/tya-phase-a-visual-smoke.mjs` ahora limpia overlays antes de navegar.
- Desactiva banners en modo smoke.
- Navega modulos con `CX.router.nav(id)` despues de verificar que existe el item de rail.
- Mantiene captura y reportes JSON/MD.

Estado seguro: sin deploy, sin produccion, sin merge final, sin proveedores reales, sin imports y sin datos sensibles.

Siguiente paso: revisar nuevo run visual. Si falla, la causa deberia ser real de modulo/copy/consola y no bloqueo de overlay.
