# Borrador: frontend de Victor + backend de core

Esta rama une la UI de `app/` (Victor) con el backend de `core/` (Alejandro), **sin cambiar las pantallas**: se cambió la instancia de la capa de servicios, como estaba pensada.

## Qué está conectado (modo `api`)
| Servicio | Antes (demo) | Ahora |
| --- | --- | --- |
| `authService` | localStorage | Login con **Pollar** (Google, email, Freighter) y sesión firmada con core. Perfil real (`/api/profile`) |
| `communityService` | localStorage | Comunidades, canales y miembros reales (`/api/communities…`) |
| `chatService` | localStorage + eventos | Mensajes reales con polling cada 2,5 s (`/api/channels/:id/messages`) |
| `walletService` | saldos inventados | Saldo real en Horizon testnet, historial (`/api/payments`) y **pagos reales con Pollar** a un `@usuario`, con la protección contra pagos dobles de core |
| `settlementService` | demo | Sigue en demo: core todavía no tiene cobros B2B |

Los avatares muestran el **Kosmonauta** de cada perfil.

## Cómo correrlo en local
1. `core` en el puerto **3001** (es la API):
   ```bash
   cd core
   npx next dev -p 3001
   ```
2. Esta app en el puerto **3000**: es el único origen autorizado en Pollar.
   ```bash
   cd app
   cp .env.example .env.local   # completa la clave publicable de Pollar
   npm install
   npm run dev
   ```
3. Abre http://localhost:3000/login, entra y ve a `/plataforma`.

`/api/*` lo reenvía `next.config.ts` a core (`KOSMOVIA_API_URL`). Sin `NEXT_PUBLIC_KOSMOVIA_SERVICES=api`, la app queda en modo demo como antes.

## Limitaciones del borrador
- **Copias:** las piezas de sesión y Pollar son copias de core (`lib/core/`, ver su README). La versión final debería compartir el código o vivir en una sola app.
- **Crear perfil:** si todavía no tienes perfil, créalo primero en core (`/perfil/nuevo`).
- **Comunidades:** se ven las comunidades donde eres miembro. Si no estás en ninguna, la app te une a la primera.
- **Pagos:** pagar un cobro B2B a un `#canal` sigue en demo. Si un pago queda sin confirmar, la UI de demo no lo retoma al recargar (core sí).
- Mientras carga lo real, se ven por un instante los datos de ejemplo.
