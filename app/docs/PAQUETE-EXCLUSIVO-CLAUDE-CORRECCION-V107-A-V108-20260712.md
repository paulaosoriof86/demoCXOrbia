# Paquete exclusivo Claude — corrección V107 interna a V108

Fecha: 2026-07-12  
Proyecto: CXOrbia TyA  
Estado: paquete preparado para corrección frontend/prototipo; sin empalme, sin merge, sin deploy.

## Candidata base

- Archivo entregado: `Prototype development request CXOrbia V106.zip`.
- Identidad interna comprobada: V107.
- Próxima entrega solicitada: V108 consistente en ZIP, build lock, manifest, reporte y verificador.

## Decisión

- No overlay completo.
- No source lock.
- Sí corrección selectiva por Claude sobre la V107 interna.
- Después de la entrega V108 se hará auditoría y empalme selectivo contra el HEAD real.

## Alcance exclusivo Claude

1. Portal Cliente: excluir `score:null` de clasificación, distribución y drills; mantener pendientes de fuente separados.
2. Academia: KPIs y progreso sobre la misma colección visible por scope; scopes con catálogos e IDs; actores por `userId` real o preview deshabilitado y honesto.
3. Finanzas: lotes con `paymentBatchId` o llave estable multi-país/multi-moneda; no mezclar GT/HN ni GTQ/HNL; no confundir preparado con pagado.
4. Responsive: eliminar overflow nativo en Dashboard, Finanzas, Postulaciones, Reservas y Academia a 360/390/412 px.
5. Manifest/build lock/verificador V108 reproducibles con cero diferencias y exit code 0.

## Mejoras que deben conservarse

- Portal Cliente no sintetiza score/NPS/responsable fuera de demo.
- Cache separado por proyecto y modo demo/real.
- Beneficios sin fallback `sh1`; sin `shopperId` no muestra datos ajenos.
- Certificaciones mantienen copy honesto y no activan Make/backend.
- Academia conserva el concepto de scope, corrigiendo métricas y controles.

## No corresponde a Claude

- backend;
- contratos;
- adapters;
- importadores;
- gates/workflows;
- Firebase/Firestore/Auth/Storage;
- Make/Gemini;
- datos HR source-safe;
- pagos reales;
- certificaciones reales;
- información sensible.

## Entrega requerida

- `Prototype development request CXOrbia V108.zip`;
- `app/docs/REPORTE-CORRECCION-V108.md`;
- `app/docs/MANIFEST-V108.json`;
- `app/docs/verify-manifest.mjs`;
- `app/docs/smoke-v108-native/` con pruebas y capturas;
- lista exacta de archivos modificados;
- checklist PASS/FAIL/PENDING;
- pendientes honestos.

## Criterio de cierre

No declarar listo para empalme si persiste cualquiera de estos puntos:

- manifest inconsistente;
- overflow móvil;
- scores nulos clasificados;
- KPIs de Academia fuera de scope;
- roles usados como personas;
- lotes que mezclan país o moneda;
- beneficios de otro shopper;
- copy que prometa envío, pago o sincronización real;
- errores de consola;
- versión externa/interna inconsistente.

El paquete descargable completo generado para Paula contiene el prompt ejecutable, checklist y auditoría forense completa.