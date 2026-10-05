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

## Arreglos de funcionamiento (sin tocar el diseño)
- **Mi Wallet:** el botón dice "Mi Wallet" con el saldo chico debajo, y otro clic la cierra. Al abrirla se actualizan saldo e historial. El formulario empieza vacío con 0,01 (el mínimo), espera el resultado real del pago y muestra el error si falla. El QR de "Recibir" es real.
- **Cobros B2B en el chat:** se pagan **a quien emitió el cobro** (antes iban a un `#canal`, que no existe en la red). Quedan marcados como pagados solo si el pago salió, no se puede pagar el propio cobro y el mínimo es 0,01.
- **Perfil:** abre con tus datos reales, no con los de ejemplo (antes podía guardar la bio de Victor en tu perfil). Guarda y avisa si falla. Las wallets externas dicen "Próximamente" en lugar de simular la conexión, y el KYC muestra tu nivel real (0 wallet, 1 X verificado, 2 empresa).
- **Canales:** el nombre se limpia a lo que acepta el servidor (sin tildes ni espacios). Si no eres owner o admin, se ve el error.
- **Mensajes:** si no se pueden enviar (por ejemplo, en #anuncios sin ser admin), se ve el error.
- **Carga:** no se muestran los datos de ejemplo mientras llegan los reales. Si no tienes perfil, lo creas ahí mismo con un @usuario espacial y un Kosmonauta.
- **Miembros:** solo tú sales "en línea" (todavía no hay presencia en tiempo real), y sin la etiqueta de rol falsa en cada mensaje.

## Limitaciones del borrador
- **Copias:** las piezas de sesión y Pollar son copias de core (`lib/core/`, ver su README). La versión final debería compartir el código o vivir en una sola app.
- **Comunidades:** se ven las comunidades donde eres miembro. Si no estás en ninguna, la app te une a la primera. Todavía no hay botón para crear ni para unirse a otras.
- **Cobros B2B:** las liquidaciones (fee 0,5 %, lotes) siguen en demo.
- **Pagos:** si un pago queda sin confirmar, esta UI no lo retoma al recargar (core sí).
- **@usuario y Kosmonauta:** el editor completo para cambiarlos sigue en core.
