# Guía de deploy en Render: demo testnet de Kosmovia

Para Roberto. Se publican dos Web Services desde el repo `github.com/kosmovia/kosmovia`: **kosmovia-core** (API y base de datos) y **kosmovia-app** (la UI oficial). Todo es **testnet**; no se usa dinero real.

## Regla de secretos (leer primero)
- **Nunca** subas un `.env` ni `.env.local` al repo. Las claves se escriben solo en el panel de Render (Environment).
- Las claves se pasan **por mensaje privado**, nunca por el grupo ni por el repo.
- Esta guía solo nombra variables; los valores te los da Alejandro en privado.

## 1. Requisitos y orden
- Cuenta de Render con créditos y acceso al repo `kosmovia/kosmovia` (conectar GitHub en Render).
- Valores en privado: URL de la base de prueba (ver paso 2), clave publicable de Pollar, `SESSION_SECRET`, `X_CHALLENGE_SECRET`.
- Orden: **primero core, después app** (la app necesita la URL pública de core al compilar).

## 2. Rotar la contraseña de la base de prueba (antes de publicar)
La contraseña actual se expuso en un chat, así que hay que cambiarla.
1. Render > **Dashboard** > tu base Postgres de pruebas > pestaña **Info** (o **Connect**) > sección de credenciales.
2. Rota la contraseña (opción de reset/rotate del usuario; si tu panel no la muestra, crea un usuario nuevo o recrea la base de pruebas, que es desechable).
3. Copia la nueva **Internal Database URL** (si core corre en Render, la misma región) o la **External Database URL** (para correr migraciones desde tu PC).
4. Pasa la nueva `DATABASE_URL` **solo** por variable de entorno en Render y por mensaje privado a Alejandro. Nunca al repo ni al grupo.

## 3. Servicio 1: kosmovia-core (Web Service)
**New > Web Service** > repo `kosmovia/kosmovia`, rama `main`.

| Campo | Valor |
| --- | --- |
| Name | `kosmovia-core` |
| Root Directory | `core` |
| Runtime | Node |
| Build Command | `npm ci && npm run build` |
| Start Command | `npm run start` |
| Health Check Path | `/api/communities` |
| Node | 22 (variable `NODE_VERSION=22`; `core/package.json` no fija `engines`) |

- `npm run start` ejecuta `next start`, que **lee `PORT` automáticamente** (Render lo define). No hace falta `-p`.
- `/api/communities` (GET) es pública y no pide sesión; responde rápido siempre que `DATABASE_URL` y `KOSMOVIA_DATA_BACKEND=api` estén bien. Si falta alguno, responde 503/404 y el health check falla, lo cual avisa de una mala configuración.

**Variables de entorno** (solo nombres; las marcadas son secretas):

| Variable | Secreta | Nota |
| --- | --- | --- |
| `KOSMOVIA_DATA_BACKEND` | no | `api` |
| `NEXT_PUBLIC_KOSMOVIA_DATA_BACKEND` | no | `api` (se incrusta al compilar) |
| `DATABASE_URL` | **sí** | la nueva, del paso 2 |
| `SESSION_SECRET` | **sí** | 32+ caracteres al azar |
| `NEXT_PUBLIC_POLLAR_PUBLISHABLE_KEY` | no (pública) | clave publicable de Pollar, testnet |
| `POLLAR_SECRET_KEY` | **sí** | **Opcional.** Solo si Pollar está en modo de fondeo *Deferred*. Con *Immediate* (el que usamos) va vacía |
| `X_CHALLENGE_SECRET` | **sí** | 16+ caracteres al azar |

Las variables de Supabase del `.env.example` de core (`NEXT_PUBLIC_SUPABASE_*`, `SUPABASE_JWT_*`) son del modo Supabase; en modo `api` van vacías.

**Migraciones (una sola vez, tras el primer deploy):**
- Desde el **Shell** del servicio en Render: `npm run db:migrate`, o
- desde tu PC, en `core/`, con la External URL solo en la sesión de terminal (no en un archivo versionado): `DATABASE_URL=... npm run db:migrate`.
- Comprobación opcional: `npm run db:check`.

Cuando termine el deploy, apunta la URL pública (`https://kosmovia-core-xxxx.onrender.com`).

## 4. Servicio 2: kosmovia-app (Web Service)
**New > Web Service**, mismo repo y rama.

| Campo | Valor |
| --- | --- |
| Name | `kosmovia-app` |
| Root Directory | `app` |
| Build Command | `npm ci && npm run build` |
| Start Command | `npm run start` |
| Node | 22 (`NODE_VERSION=22`) |

Variables de entorno:

| Variable | Secreta | Valor |
| --- | --- | --- |
| `NEXT_PUBLIC_KOSMOVIA_SERVICES` | no | `api` |
| `NEXT_PUBLIC_KOSMOVIA_DATA_BACKEND` | no | `api` |
| `NEXT_PUBLIC_POLLAR_PUBLISHABLE_KEY` | no (pública) | la misma clave publicable que core |
| `KOSMOVIA_API_URL` | no | URL pública de kosmovia-core, **sin barra final** |

- Las `NEXT_PUBLIC_*` y la regla `rewrites` de `next.config.ts` se fijan **al compilar**. Si cambias alguna, hay que hacer **Manual Deploy > Clear build cache & deploy**.
- En producción, `/api/*` de la app se reenvía a `KOSMOVIA_API_URL`; para el navegador es el mismo origen.
- Al terminar, apunta la URL pública de la app (`https://kosmovia-app-xxxx.onrender.com`): esa es la que se abre en la demo.

## 5. Pollar: autorizar el dominio
En **dashboard.pollar.xyz > Build > Domains**, agrega la URL pública de **kosmovia-app** en:
- **Allowed origins**
- **Allowed redirect URIs** (necesario para el login con Google)

En **Treasury** revisa también (sin esto, las wallets de Google/email fallan con `SDK_WALLET_NOT_READY`):
- **Funding Mode = Immediate** (la wallet queda lista al entrar, sin backend).
- La **funding wallet** y la **gas wallet** con XLM de testnet (50+ y 10+). En testnet se cargan con friendbot.stellar.org.
- **Tokens & Trustlines**: USDC de testnet habilitado.

`http://localhost:3000` se queda para desarrollo local. La cookie de sesión funciona por el mismo origen gracias al rewrite, así que core **no** necesita su propio dominio en Pollar, salvo que alguien abra core directamente.

## 6. Plan gratis y créditos
Los Web Services gratis de Render se duermen tras un rato sin tráfico y la primera visita tarda (a veces un minuto o más). Antes de la demo, abre la app y el `/api/communities` de core unos minutos antes, o usa una instancia de pago con los créditos (recomendado para la demo). Recuerda que la base Postgres gratis de Render también tiene límite de vigencia.

## 7. Verificación final
- [ ] `https://<core>/api/communities` devuelve JSON con `communities` y `mine`.
- [ ] `https://<app>/login` carga y el login con Google funciona.
- [ ] `/plataforma` muestra las comunidades.
- [ ] **Mi Wallet** muestra el saldo.
- [ ] Enviar 0,01 USDC a otro miembro (`@usuario`) sale bien.
- [ ] El historial muestra el pago.

Prueba siempre entrando por la URL de la app, no por la de core.

## 8. Si algo falla
| Síntoma | Causa probable y arreglo |
| --- | --- |
| Pagos con wallets de Google/email fallan: `SDK_WALLET_NOT_READY` | Pollar no pudo crear la wallet: Funding Mode no está en Immediate o la funding/gas wallet no tiene XLM (paso 5). Corregir y volver a entrar. |
| "Could not load sign-in options" | El dominio de la app no está autorizado en Pollar (paso 5), o falta `NEXT_PUBLIC_POLLAR_PUBLISHABLE_KEY` y se necesita redeploy. |
| `403 bad_origin` ("Origen no permitido") | Se está entrando por una URL distinta a la que sirve las rutas, o por core directo con un `Origin` de otro host. Entra por la URL de la app. |
| `503 db_not_configured` | Falta `DATABASE_URL` en **core** (o es incorrecta). Revísala y redeploy. |
| `503 session_not_configured` | Falta `SESSION_SECRET` (32+ caracteres) en core. |
| `404 backend_disabled` ("No encontrado") | Falta `KOSMOVIA_DATA_BACKEND=api` en core. |
| `/api/*` da 404 o HTML en la app | Faltó `NEXT_PUBLIC_KOSMOVIA_SERVICES=api` o `KOSMOVIA_API_URL` al compilar: corrige y redeploy con limpieza de caché. |
| Errores de tablas inexistentes (500) | No se corrieron las migraciones (paso 3). |
| `401 session_required` / `session_invalid` | Sesión vencida o `SESSION_SECRET` cambió: vuelve a entrar. |
| Primera carga muy lenta | El servicio estaba dormido (paso 6). |

Para ver el detalle de un error, usa **Logs** del servicio en Render. Los logs de core muestran códigos, no valores.
