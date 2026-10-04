# lib/core: copia de `core/` (borrador de integración)

Estos archivos son **copias** de `core/lib`, `core/hooks` y `core/components/SessionBridge.tsx`, para que el frontend de `app/` use el mismo login con Pollar, la misma sesión (cookie httpOnly firmada con SEP-53) y los mismos pagos que `core`.

- No se editan aquí: el cambio se hace en `core/` y se vuelve a copiar.
- Cuando el equipo decida dónde vive el frontend final, esto se reemplaza por un paquete compartido o se mueve todo a una sola app.
