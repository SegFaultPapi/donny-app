# Mapeo contrato DonnyRound ↔ frontend

Objetivo: que cada función del contrato esté bien usada en el front para un flujo completo y consistente.

---

## Contrato DonnyRound – funciones

| Función | Tipo | Uso en frontend |
|--------|------|------------------|
| `enterRound()` | write | Modal de entrada: tras `approve(USDC, ENTRY_FEE)` → llamar al contrato. |
| `tap()` | write | Pantalla tapping: cada tap envía una tx. |
| `settleRound()` | write | Cualquiera puede llamar cuando la ronda termina; opcional: botón “Cerrar ronda” o cron. |
| `getRoundInfo()` | read | Home, tapping, results: pool, tiempos, `isActive`, `isSettled`, `totalEntries`. |
| `hasEntered(address)` | read | Home: decidir CTA “Join” vs “Continue Tapping” y si mostrar modal de entrada. |
| `getUserTaps(address)` | read | Tapping y results: taps del usuario. |
| `getTopPlayers(topN)` | read | Tapping: leaderboard top 10. Results: top 3 ganadores y premios derivados. |

---

## Pantallas y qué leer/escribir

### 1. Home (`app/page.tsx`)

- **Leer:** `getRoundInfo()` → prize pool, donation pool, total entries, countdown, `isActive`, `isSettled`.  
  `hasEntered(userAddress)` → si ya entró en la ronda.
- **Lógica:**
  - Si no hay ronda activa (`!isActive && roundStartTime === 0`) → “No active round” / “Next round soon”.
  - Si ronda terminada y settled → redirigir o enlazar a `/results`.
  - Si `hasEntered` → CTA “Continue Tapping” → `/tapping`.
  - Si no `hasEntered` y ronda activa (o aún no empezada) → CTA “Join current round” → abrir Entry modal.
- **Copy:** Entry fee 2 USDC (no 5). Premios 50/30/20 % del pool.

### 2. Entry modal (`components/entry-modal.tsx`)

- **Escribir (en orden):**
  1. `approve(entryToken, DONNY_GAME_ADDRESS, ENTRY_FEE)` con el token de la red actual (Celo Sepolia = USDC).
  2. `enterRound()` en DonnyRound.
- **Token por red:** Celo Sepolia → `USDC_ADDRESS_CELO_SEPOLIA`. Alfajores → cUSD. Mainnet → cUSD.
- **Tras éxito:** cerrar modal, toast, `router.push("/tapping")`.

### 3. Tapping (`app/tapping/page.tsx`)

- **Leer:** `getRoundInfo()` (countdown, isActive, isSettled, prizePool, donationPool, totalEntries), `getUserTaps(address)`, `getTopPlayers(10)`.
- **Escribir:** `tap()` en cada tap.
- **Lógica:** Si `!isActive` o `isSettled` → deshabilitar tap y/o ofrecer ir a `/results`. Refrescar datos tras cada tap (refetch).

### 4. Results (`app/results/page.tsx`)

- **Leer:** `getRoundInfo()` → `isSettled`, `donationPool`; `getTopPlayers(3)` → ganadores y taps; `getUserTaps(address)` → taps del usuario.
- **Derivar:** Premios 50/30/20 % del `prizePool` (o usar misma lógica que el contrato para 1 o 2 jugadores).
- **Opcional:** Enlace a Blockscout del contrato o de la tx de `settleRound` (si se guarda el hash).

### 5. Frame / API (`app/api/frame/route.ts`)

- **Leer:** `getRoundInfo()` (ya usado) para OG y estado de la ronda.

---

## Estado actual

| Pantalla | Estado |
|----------|--------|
| Home | Conectado: `getRoundInfo`, `hasEntered`. Datos reales (pool, jugadores, countdown). CTA: "Join" / "Continue Tapping" / "View results" / "Be the first". |
| Entry modal | `approve` + `enterRound`. Token por red: Celo Sepolia (USDC), Alfajores (cUSD), Mainnet (cUSD). |
| Tapping | Conectado: `getRoundInfo`, `getUserTaps`, `getTopPlayers(10)`, `tap()`. |
| Results | Conectado: `getRoundInfo`, `getTopPlayers(3)`, `getUserTaps`. Premios 50/30/20 derivados. Link a Blockscout del contrato. |

---

## Redes y tokens

- **Celo Sepolia (11142220):** USDC `0x01C5C0122039549AD1493B8220cABEdD739BC44E`.
- **Alfajores (44787):** cUSD `0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1`.
- **CELO mainnet (42220):** cUSD `0x765DE816845861e75A25fCA122bb6bEB168b3DF4`.

El front por defecto usa Celo Sepolia; el entry modal debe elegir el token según `chainId`.
