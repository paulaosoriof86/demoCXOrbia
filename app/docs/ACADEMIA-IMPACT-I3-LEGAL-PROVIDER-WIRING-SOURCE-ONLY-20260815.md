# ACADEMIA — IMPACTO I3 LEGAL PROVIDER / V0.4 · 2026-08-16

## Estado

La V0.4 ya fue **materializada realmente en Firebase DEV** y el runtime legal + Hosting DEV ya fueron **desplegados realmente**. La aceptación humana todavía no ocurrió. Counsel GT/HN continúa diferido post-go-live y no debe presentarse como completado.

Materialización DEV: run `31961266066`, `PASS_COMMITTED_READBACK`, cuatro writes create-only, legalAcceptance `0`.

Runtime/Hosting DEV: run `31963932862`, job `95206055703`, `SUCCESS`; Cloud Run revision `cxorbia-live-hr-dev-00010-n78`; DEV root `https://cxorbia-backend-dev.web.app`; legalAcceptance durante deploy `0`; acceptance count `0 → 0`; automaticAcceptance=false.

Source lock vigente:
`SOURCE-LOCK-ITERATION3-LEGAL-V0.4-DEV-RUNTIME-DEPLOY-PASS-HUMAN-ACCEPTANCE-PENDING-20260816.md`.

## Conceptos que Academia debe separar

1. **Configuración legal editable no-code:** operador, contactos, dirección pública, nombre visible, retención, providers, políticas y proyecto.
2. **Publicación materializada:** snapshot provider-authoritative inmutable de una versión concreta.
3. **Runtime desplegado:** capacidad real de leer y mostrar esa versión al actor autenticado.
4. **Aceptación humana:** receipt ligado a identidad autenticada exacta + versión + digest + timestamp servidor.
5. **Revisión profesional:** estado independiente (`pendiente/completada`) que nunca se infiere de CI, publicación, deploy o aceptación.

Materialización y deploy técnicos **no equivalen a consentimiento**. El hecho de que el runtime esté vivo no autoriza a QA, scripts, IA ni administradores técnicos a aceptar por la persona.

## Aceptación humana

La UI DEV exige:
- Firebase ID token real;
- contenido legal completo;
- dos casillas no premarcadas;
- clic explícito en `Aceptar y continuar`;
- provider ACK y readback del receipt.

`legal.acceptance.record` es self-scoped/human-confirmed. El provider deriva la identidad del token verificado, usa server timestamp y conserva versión/digest exactos. `#bnOk`, navegación, localStorage o sessionStorage no son consentimiento.

El deploy dejó acceptance count `0 → 0`; por tanto existe evidencia de que la infraestructura no aceptó automáticamente.

## No-code y rebranding

Perfil mutable y versión publicada son distintos. Rebranding, correo o configuración posterior no reescriben una versión histórica. Marca visible, registro marcario y titular/licenciante son objetos separados.

Los valores TyA viven en provider DEV. Cambios posteriores que afecten contenido legal material deben producir una nueva versión en vez de alterar retroactivamente la aceptada.

## Por rol

**Shopper:** versión que acepta; confidencialidad; autenticidad de visita; evidencias según proyecto; seguridad de datos; incidentes.

**Admin/Operaciones:** mínimo privilegio; distinguir perfil editable, versión publicada, runtime desplegado y receipt; no sobrescribir historia; no fuzzy matching; no exponer domicilio/banco/documentos restringidos.

**Cliente:** confidencialidad recíproca; protección de identidad Shopper; uso limitado de resultados; obligaciones de datos/evidencias.

**Superadmin/tenant admin:** gestionar perfil no-code, Provider Registry, retención/evidencias y rebranding sin volver global una regla de tenant/proyecto.

## Evidencias y retención

Foto/video/audio/geolocalización/comprobantes pertenecen al proyecto. Audio/biometría/reconocimiento facial u otros tratamientos de alto impacto requieren controles adicionales cuando corresponda.

Para TyA: piso 60/default 90 días para evidencia cruda como regla operativa. Documentación empresarial, pagos, auditoría y receipts pueden tener plazos mayores o legal hold.

## Qué NO debe enseñar o simular

- que V0.4 fue revisada por abogado;
- que counsel post-go-live está cerrado;
- que materialización significa aceptación;
- que deploy significa aceptación;
- aceptación automatizada;
- `#bnOk`/localStorage/sessionStorage como consentimiento;
- domicilio restringido como público automático;
- marca no registrada como registrada;
- Cinépolis como regla global;
- cualquier clic como firma avanzada;
- arbitraje universal para todo usuario.

## Próximo impacto editorial

Después de la aceptación humana y su readback:
- actualizar ruta por rol de aceptación legal;
- manual `Legal y cumplimiento`;
- checklist `editar perfil → publicar versión → desplegar runtime → mostrar → aceptar → verificar receipt`;
- errores frecuentes: provider/readback fallido, aceptación faltante, versión nueva, cambio material;
- notificación de nueva versión/reaceptación;
- estado visible de counsel sin implicar aprobación falsa.

No incluir hashes, IDs de runs, credenciales, rutas privadas ni detalles de runner en Academia visible al usuario final.

Academia/Certificación del Shopper histórico permanecen diferidas y no se declaran PASS por este bloque.
