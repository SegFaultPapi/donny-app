# PRD – Donny MVP: Tap-to-Earn for Good en CELO

## 1. Project Overview

### 1.1 Problema

Usuarios crypto-nativos en Farcaster no tienen una forma divertida, competitiva y rápida de:

- Jugar y competir por premios en stablecoins
- Donar a causas sociales de forma transparente y verificable on-chain
- Obtener “status moral” (“hice algo bueno hoy”) sin fricción ni culpa

Hoy existen juegos tap-to-earn sin propósito claro y, por otro lado, plataformas de donación que se sienten como “tarea moral” sin diversión. Donny busca mezclar ambos mundos: juego competitivo + impacto social verificable.

### 1.2 Objetivo del MVP

Lanzar un juego tap-to-earn en CELO integrado como Farcaster Frame donde:

- Usuarios pagan una entrada fija (2 cUSD)
- Compiten durante 24h tappeando un botón on-chain
- Top 3 ganan premios en cUSD
- 40% de las entradas va automáticamente a una charity verificada en CELO
- Todo es completamente transparente y rastreable en cadena

Éxito del MVP = probar que:

- Usuarios están dispuestos a pagar entrada para competir y donar
- El ciclo completo (conectar → verificar humanidad → pagar → tapear → recibir premios/donación) es fluido
- El impacto social on-chain se percibe como valor real (no solo una nota al pie)

### 1.3 Usuario Target (Personas)

#### Persona 1: Crypto Native de Farcaster con Conciencia Social

- Edad: 22–35
- Perfil: Dev/crypto power user, activo en Farcaster (/frames, /celo, /impact)
- Comportamiento:
  - Postea 2+ veces/semana
  - Ha probado frames de juegos y de defi
  - Se siente culpable de “no donar lo suficiente”
- Motivaciones:
  - Jugar algo rápido desde el feed
  - Ganar cUSD para reinvertir o gastar
  - Poder decir “doné” con prueba on-chain
- Frustraciones:
  - Juegos sin propósito (“solo perder tiempo”)
  - Donaciones que no puede auditar (“¿realmente llegó?”)

#### Persona 2: Builder/Founder en CELO/Farcaster

- Edad: 24–40
- Perfil: Builder, ecosystem participant
- Comportamiento:
  - Sigue proyectos de impacto
  - Le gusta apoyar experimentos cool en su ecosistema
- Motivaciones:
  - Probar productos nuevos de su ecosistema
  - Dar feedback
  - Mostrar liderazgo moral (“yo apoyé esto desde el día 1”)

#### Persona 3: Jugador Casual Web3

- Edad: 18–30
- Perfil: Tiene una wallet, juega juegos simples on-chain
- Comportamiento:
  - No es ultra activo en Farcaster, pero entra cuando ve algo viral
- Motivaciones:
  - Ganar premios rápido
  - Experimentar productos nuevos sin mucho setup
- Frustraciones:
  - Onboarding complicado
  - Reglas poco claras

---

## 2. User Stories & Acceptance Criteria

### 2.1 Core Onboarding

#### US-01 – Ver Frame y entender el juego

**User Story**  
Como usuario de Farcaster, quiero ver en un Frame un resumen simple de la ronda activa (premios, tiempo restante, causa) para decidir rápido si quiero entrar.

**Acceptance Criteria**

- AC1: El Frame muestra:
  - Nombre del juego (“Donny – Tap-to-Earn for Good”)
  - Pool de premios total (en cUSD)
  - Causa/charity actual (nombre corto)
  - Tiempo restante de la ronda (countdown)
  - Botón principal de acción (“Join & Tap” o similar)
- AC2: El copy del Frame explica en ≤2 líneas:
  - Entry fee = 2 cUSD
  - Split: premios / caridad
- AC3: Si no hay ronda activa, el Frame muestra un estado “No active round” con CTA de “Next round soon”.

#### US-02 – Conectar wallet y verificar humanidad

**User Story**  
Como usuario, quiero conectar mi wallet CELO y verificar mi humanidad vía WaaP para poder entrar a la ronda sin bots.

**Acceptance Criteria**

- AC1: Al hacer tap en “Join & Tap”:
  - Se dispara flujo de wallet connect compatible con Farcaster (Wagmi / miniapp)
- AC2: Si el usuario no está verificado con WaaP:
  - Se muestra pantalla de verificación (phone input / flow WaaP)
- AC3: Una vez verificado:
  - El smart contract registra `isHuman = true` (asociado al wallet/phone hash) o se almacena prueba off-chain pero se valida antes de permitir entry.
- AC4: Un número de teléfono solo puede asociarse a 1 wallet para esa ronda.

#### US-03 – Pagar la entrada (2 cUSD)

**User Story**  
Como usuario verificado, quiero pagar una entrada fija de 2 cUSD para participar en la ronda actual.

**Acceptance Criteria**

- AC1: Tras verificación, se muestra:
  - Monto a pagar: 2 cUSD
  - Breakdown: 60% premios, 40% charity
- AC2: Al confirmar, la wallet muestra transacción en CELO L2 con:
  - To: contract de la ronda
  - Amount: 2 cUSD
- AC3: La ronda inicia en T0 cuando el primer usuario paga.
- AC4: Una vez pagado:
  - El usuario ve confirmación y pasa a la pantalla de tap (no puede volver a pagar en la misma ronda con el mismo wallet/phone).

### 2.2 Gameplay (Tapping)

#### US-04 – Tappear durante la ronda

**User Story**  
Como jugador, quiero poder tappear repetidamente durante la ventana de 24h para acumular taps y subir en el leaderboard.

**Acceptance Criteria**

- AC1: Tras pagar:
  - El usuario ve un botón grande de “Tap” en el Frame / MiniApp.
- AC2: Cada tap:
  - Hace una llamada a `tap()` en el smart contract.
- AC3: Rate limiting:
  - Máximo 600 taps/min por wallet.
  - El contrato rechaza taps que excedan este límite (revert con mensaje claro).
- AC4: Cooldown mínimo:
  - 100 ms entre taps del mismo wallet (implementado en contrato o UI).
- AC5: Si el usuario intenta tapear después de que la ronda terminó:
  - La transacción falla y el UI muestra “Round finished”.

#### US-05 – Ver el leaderboard en tiempo real

**User Story**  
Como jugador, quiero ver el leaderboard casi en tiempo real para entender mi posición y motivarme a tappear más.

**Acceptance Criteria**

- AC1: El UI muestra:
  - Top 10 wallets (o nombres cortos / alias) ordenados por nº de taps.
  - Nº de taps por cada uno.
- AC2: Se actualiza al menos cada 30 segundos (read on-chain o desde indexer ligero).
- AC3: El usuario ve su propia posición aunque esté fuera del top 10 (p.ej. “You are #23 with 310 taps”).
- AC4: Si no hay suficientes jugadores, se muestra el top actual con placeholders vacíos ocultos.

### 2.3 Resultados, premios y donación

#### US-06 – Cierre automático de la ronda y cálculo de ganadores

**User Story**  
Como sistema, quiero cerrar la ronda automáticamente a las 24h desde T0, determinar ganadores y disparar distribución de premios/donaciones sin intervención manual.

**Acceptance Criteria**

- AC1: La ronda se considera cerrada cuando `block.timestamp >= startTime + 24h`.
- AC2: Nadie puede hacer `tap()` ni `enterRound()` después del cierre.
- AC3: Una función `settleRound()`:
  - Puede ser llamada por cualquiera (o por un cron/back-end), pero:
  - Solo se ejecuta una vez por ronda.
- AC4: `settleRound()`:
  - Determina top 3 wallets por nº de taps.
  - Calcula amounts de premios:
    - 1er lugar: 50% de pool de premios
    - 2do lugar: 30% de pool de premios
    - 3er lugar: 20% de pool de premios
  - Envía 40% del total de entries a la wallet de charity.

#### US-07 – Recibir premios en la wallet

**User Story**  
Como ganador, quiero recibir mis premios automáticamente en mi wallet para no tener que reclamar manualmente.

**Acceptance Criteria**

- AC1: Tras ejecución de `settleRound()`:
  - Los ganadores tienen sus cUSD depositados en su wallet.
- AC2: No existe función de “claim”; todo es push.
- AC3: Si hay menos de 3 participantes:
  - Reglas definidas (p.ej. si hay 1 jugador, se lleva 100% del pool de premios; si hay 2, 70% y 30%).
- AC4: El contrato no deja fondos “colgados” tras el settlement (no hay leftover en premios).

#### US-08 – Visualizar donación y transparencia

**User Story**  
Como jugador, quiero ver claramente cuánto se donó, a qué charity y tener el tx hash para verificarlo en Celoscan.

**Acceptance Criteria**

- AC1: El Frame (post-ronda) muestra:
  - Monto total donado (en cUSD).
  - Wallet de la charity (abreviada, con opción “View on Celoscan”).
- AC2: Se muestra el tx hash de la transacción de donación con link a Celoscan.
- AC3: El texto refuerza “100% transparente y on-chain”.

### 2.4 Social & share

#### US-09 – Compartir victoria en Farcaster

**User Story**  
Como ganador, quiero poder compartir fácilmente un post en Farcaster con mi victoria y el impacto generado para sentir orgullo y generar FOMO.

**Acceptance Criteria**

- AC1: Al mostrar resultados a un ganador:
  - Se ofrece botón “Share on Farcaster”.
- AC2: El share genera un texto pre-llenado, por ejemplo:
  - “Acabo de ganar la ronda de Donny 🥇, donamos X cUSD a [Charity] on-chain. ¿Te unes a la siguiente? #TapForGood”
- AC3: El share incluye link al Frame de la siguiente ronda (o al proyecto).
- AC4: Solo ganadores ven este CTA especial, aunque cualquier usuario pueda sharear manualmente.

### 2.5 Anti-bot & fairness

#### US-10 – Prevención básica de bots/sybil

**User Story**  
Como sistema, quiero limitar bots y multi-cuentas para que la competencia se sienta justa y legítima.

**Acceptance Criteria**

- AC1: Cada participante debe pasar verificación WaaP (phone).
- AC2: 1 phone = 1 wallet por ronda.
- AC3: Rate limit on-chain estricto (600 taps/min).
- AC4: Cualquier intento de bypass (más taps/min) produce revert en el contrato.

---

## 3. UI/UX Requirements

### 3.1 Pantallas / States clave (wireframes descriptivos)

#### Pantalla 1 – Frame / Landing de ronda activa

- Elementos:
  - Header: “Donny – Tap-to-Earn for Good”
  - Subheader corto explicativo (~2 líneas).
  - Card con:
    - Pool de premios (ej. “Prize Pool: 120 cUSD”)
    - Charity: nombre + pequeño icono
    - Countdown (reloj/tiempo restante)
  - Botón principal:
    - Estado 1: “Join & Tap (2 cUSD)” si no ha entrado.
    - Estado 2: “Continue Tapping” si ya es participante.
  - Footer: pequeño texto “40% de tu entrada se dona on-chain a [Charity]”.

#### Pantalla 2 – Conexión de wallet + WaaP

- Paso 1:
  - Módulo estándar de wallet connect (wagmi) dentro del contexto Frame/MiniApp.
- Paso 2:
  - Card simple con:
    - “Verifica tu humanidad con tu número de teléfono”
    - Input de número.
    - CTA “Verify with WaaP”.
  - Estado loading mientras se procesa la verificación.
  - Mensajes claros de error si falla.

#### Pantalla 3 – Confirmación de entrada

- Card:
  - “Entry Fee: 2 cUSD”
  - Breakdown: “60% premios, 40% caridad”
  - Resumen de la ronda (pool actual, tiempo restante).
  - Botón “Pay 2 cUSD”.
- Tras confirmación de wallet:
  - Mensaje “You’re in! Start tapping”.

#### Pantalla 4 – Gameplay / Tap + Leaderboard

- Layout vertical:
  - Arriba: Countdown grande + pool actualizado.
  - Centro: Botón circular grande “Tap”.
  - Debajo:
    - Tu contador de taps (“You: 257 taps”).
    - Pequeño texto con rate limit (“Max 600 taps/min, 100ms min between taps”).
  - Aba jo: Leaderboard scrollable top 10:
    - Posición, wallet truncated, nº de taps.
    - “You are #X” resaltado.

#### Pantalla 5 – Resultados post-ronda

- Card principal:
  - “Round Finished”
  - Lista de ganadores (1º, 2º, 3º) con premios.
  - Monto total donado a charity.
  - Link “View donation on Celoscan”.
- Si el usuario es ganador:
  - Mensaje “You won X cUSD 🎉 deposited in your wallet”.
  - Botón “Share on Farcaster”.
- Si no:
  - Mensaje “Gracias, donaste X cUSD a [Charity]. Tu impacto es real.”

### 3.2 User Flows

#### Flow A – First-time user → Play

1. Ve el Frame en Farcaster.
2. Tappea “Join & Tap”.
3. Conecta wallet CELO.
4. Verifica su teléfono vía WaaP.
5. Confirma pago de 2 cUSD.
6. Llega a pantalla de tap.
7. Tap repeated until finish.
8. Ve resultados y, si ganó, sharea.

#### Flow B – Returning user (same ronda)

1. Ve el Frame.
2. Detectamos que su wallet ya pagó.
3. CTA muestra “Continue Tapping”.
4. Va directo a pantalla de tap/leaderboard.

#### Flow C – Post-ronda

1. Usuario entra al Frame después de cierre.
2. Ve pantalla de resultados (ganadores + donación).
3. Si es ganador, ve confirmación de premio.
4. Puede sharear.

### 3.3 UX Guidelines

- Lenguaje simple, directo, con énfasis en:
  - “Competir”
  - “Ganar”
  - “Donar transparente”
- Minimizar pasos:
  - Conectar + verificar + pagar → en máximo 3 pantallas.
- Siempre mostrar:
  - Tiempo restante
  - Incentivos claros (premios + impacto).

---

## 4. Technical Requirements

### 4.1 Stack

- Frontend:
  - Next.js 14 + TypeScript
  - Farcaster MiniApp / Frame HTML
  - wagmi para wallet connect
  - Farcaster developer tooling (frames / miniapps SDK)
- Smart Contracts:
  - Solidity ^0.8.x
  - Despliegue en CELO L2 (mainnet para producción, Alfajores para test)
  - OpenZeppelin (Ownable, ReentrancyGuard, SafeERC20)
- Verificación:
  - WaaP (Wallet-as-a-Phone) SDK de CELO
- Infra opcional:
  - Lectura directa on-chain desde frontend.
  - Indexer ligero / Cloudflare Worker solo si se necesita optimización futura.

### 4.2 Smart Contract – Diseño de alto nivel

#### Contract: DonnyRound

Responsabilidades:

- Manejar entradas de usuarios (2 cUSD)
- Registrar taps por wallet
- Enforcear rate limit
- Calcular y distribuir premios
- Enviar donación a charity wallet fija

##### State variables clave

- `address public charityWallet;`
- `uint256 public entryFee = 2 * 1e18; // 2 cUSD`
- `uint256 public roundStartTime;`
- `uint256 public roundEndTime; // start + 24h`
- `bool public roundSettled;`
- `mapping(address => bool) public hasEntered;`
- `mapping(address => uint256) public taps;`
- `mapping(address => uint256) public lastTapTimestamp;`
- `mapping(address => uint256) public tapsInCurrentMinute;`
- `uint256 public currentMinute;`
- `uint256 public totalEntries;`  // nº de jugadores
- `uint256 public prizePool;`     // 60% de entradas acumuladas
- `uint256 public donationPool;`  // 40% de entradas acumuladas

> Nota: Uso de cUSD ERC-20 en CELO (address del token inyectado en constructor).

##### Funciones clave

- `enterRound()`:
  - Requerir:
    - Ronda no terminada.
    - `hasEntered[msg.sender] == false`.
    - Validación off-chain de WaaP (probablemente mediante firma/verificación previa).
  - Transferir 2 cUSD desde el usuario al contrato.
  - Si es el primer usuario:
    - Setear `roundStartTime = block.timestamp;`
    - `roundEndTime = roundStartTime + 24h;`
  - Actualizar pools:
    - `prizePool += entryFee * 60%`
    - `donationPool += entryFee * 40%`
  - Marcar `hasEntered[msg.sender] = true;`
  - Incrementar `totalEntries`.

- `tap()`:
  - Requerir:
    - `hasEntered[msg.sender] == true`.
    - Ronda activa (`block.timestamp < roundEndTime`).
  - Rate limiting:
    - Normalizar minuto actual (p.ej. `block.timestamp / 60`).
    - Si `currentMinute != minutoActual` → reset `tapsInCurrentMinute[msg.sender]`.
    - Requerir `tapsInCurrentMinute[msg.sender] < 600`.
    - Requerir `block.timestamp - lastTapTimestamp[msg.sender] >= 100ms`.
  - Incrementar:
    - `taps[msg.sender]++`
    - `tapsInCurrentMinute[msg.sender]++`
    - `lastTapTimestamp[msg.sender] = block.timestamp;`

- `settleRound()`:
  - Requerir:
    - `block.timestamp >= roundEndTime`.
    - `roundSettled == false`.
  - Determinar top 3:
    - Por simplicidad del MVP, se puede:
      - Mantener array de participantes en memoria durante la ronda (p.ej. `address[] participants`).
      - Iterar en settle (limitado por nº razonable de participantes).
  - Calcular payouts:
    - `p1 = prizePool * 50%`
    - `p2 = prizePool * 30%`
    - `p3 = prizePool * 20%`
  - Enviar cUSD:
    - A top1, top2, top3.
    - A `charityWallet` la `donationPool`.
  - Marcar `roundSettled = true;`.

- Opcional: `startNewRound()` o nuevo contrato por ronda (para MVP, una sola ronda a la vez es suficiente; nueva ronda puede requerir redeploy o método claro).

### 4.3 Integraciones

- CELO WaaP:
  - Del lado frontend, se obtiene prueba de verificación (token/attestation).
  - El backend o contrato se asegura de que la address que llama `enterRound()` esté asociada a un phone verificado (validación off-chain con una lista de wallets permitidos o hash de phone).

- Farcaster:
  - Frame endpoint configurable con diferentes estados (antes-después de ronda).
  - `Share on Farcaster` usando actions del cliente / intents.

### 4.4 Constraints & Consideraciones

- Performance:
  - CELO L2 soporta el TPS requerido por el modelo de taps.
  - Gas por tap debe ser suficientemente bajo para que la experiencia sea aceptable.
- Seguridad:
  - Usar OpenZeppelin para manejo de ERC-20 y protecciones básicas.
  - ReentrancyGuard en funciones críticas (`settleRound`).
- Limitaciones MVP:
  - Una sola charity fija (hard-coded).
  - Una sola ronda viva a la vez.
  - Sin histórico de rondas en UI (solo la ronda actual).

---

## 5. Success Metrics

### 5.1 Product/Engagement

- **Onboarding Completion Rate**  
  % de usuarios que ven el Frame y terminan el flujo hasta pagar entrada.  
  Target: ≥ 30% (para tráfico cualificado de Farcaster).

- **Tap Engagement**  
  % de participantes que alcanzan al menos 100 taps.  
  Target: ≥ 70%.

- **Avg Taps per User**  
  Número promedio de taps por participante.  
  Target: ≥ 300 taps/user en la primera ronda exitosa.

### 5.2 Economic / Revenue

- **Ronda Sostenible**  
  Nº de participantes por ronda.  
  Target: ≥ 10 en primeras rondas, escalando a 30+.

- **Ingresos de plataforma**  
  10% de las entradas (en versiones posteriores) o cualquier fee definido.  
  Para MVP, foco en validar loop, no maximizar ingresos.

### 5.3 Social Impact

- **Donation Transparency Rate**  
  % de donaciones que tienen tx hash visible en UI y rastreable en Celoscan.  
  Target: 100%.

- **Total Donado (MVP)**  
  Monto acumulado donado tras X rondas (ej. 1 mes).  
  Target inicial: p.ej. ≥ 50–100 cUSD.

### 5.4 Virality / Social

- **Share Rate de Ganadores**  
  % de ganadores que hacen share de su victoria en Farcaster usando CTA.  
  Target: ≥ 40%.

- **Posts generados por ronda**  
  Nº de posts orgánicos mencionando Donny por ronda.  
  Meta cualitativa: al menos 3–5 posts en primeras rondas.

### 5.5 Sistema / Fiabilidad

- **Auto-distribution Success**  
  % de rondas donde premios y donaciones se distribuyen sin intervención manual ni fallo.  
  Target: 100%.

- **Uptime**  
  Disponibilidad del Frame / backend durante las rondas activas.  
  Target: ≥ 99% durante ventanas de ronda.

---

## 6. Implementation Roadmap

### 6.1 Fases y Prioridades

#### Fase 1 – Smart Contract Core (Semana 1)

Objetivo: Tener contrato que maneje entradas, taps y settlement en testnet.

- Tareas:
  - Diseñar e implementar `DonnyRound` con:
    - `enterRound()`
    - `tap()`
    - `settleRound()`
  - Añadir rate limit y cooldown.
  - Integrar cUSD token address y charity wallet.
  - Pruebas unitarias:
    - Entrada de múltiples usuarios.
    - Rate limit correcto (600/min).
    - Cálculo correcto de top 3.
    - Distribución correcta de 60/40 (premios/charity).
  - Deploy en CELO testnet (Alfajores).

Prioridad: Must-have.

#### Fase 2 – Frame + Wallet + WaaP (Semana 2)

Objetivo: Flujo “Join & Tap” funcionando end-to-end en testnet.

- Tareas:
  - Crear endpoint de Frame básico:
    - Mostrar info de ronda (hard-coded al inicio).
    - CTA para “Join & Tap”.
  - Integrar wallet connect (wagmi) en contexto MiniApp.
  - Integrar WaaP:
    - Pantalla de verificación.
    - Asociar wallet ↔ phone verificado via backend ligero (ej. Cloudflare Worker) o tabla simple.
  - Conectar `enterRound()` al UI:
    - Confirmaciones correctas.
    - Manejo de errores (insufficient funds, etc.).

Prioridad: Must-have.

#### Fase 3 – Tapping UI + Leaderboard (Semana 3)

Objetivo: Experiencia de juego completa.

- Tareas:
  - Implementar pantalla de tap:
    - Botón grande.
    - Contador de taps del usuario.
  - Conectar `tap()` on-chain desde UI con feedback (loading, error).
  - Implementar lectura del leaderboard:
    - Directamente del contrato (simple loop / view).
    - Actualización periódica (cada 30s).
  - Mostrar countdown y pool dinámico.

Prioridad: Must-have.

#### Fase 4 – Results + Share + Polishing (Semana 4)

Objetivo: Cerrar loop y preparar launch.

- Tareas:
  - Implementar flujo de `settleRound()`:
    - Cron manual (llamado desde script/admin) para MVP.
    - UI para resultados (ganadores + donación).
  - Mostrar tx hash de donación y link a Celoscan.
  - Implementar botón de “Share on Farcaster” para ganadores:
    - Pre-fill de texto.
  - QA end-to-end:
    - 2–3 rondas simuladas en testnet con amigos.
  - Deploy a CELO mainnet.

Prioridad: Must-have para MVP público.

### 6.2 Backlog Post-MVP (Nice-to-have)

- Historial de rondas y perfil de usuario.
- Múltiples charities con selección/voting.
- Animaciones y gamificación extra (progress bars, streaks).
- Anti-bot avanzado (Human Passport, etc.).
- Indexer propio para analytics.

---

Este PRD está diseñado para que un dev pueda:

- Crear epics: `Smart Contract Core`, `Frame + Onboarding`, `Gameplay + Leaderboard`, `Results + Social`.
- Derivar tickets atómicos (funciones del contrato, pantallas específicas, flows de verificación).
- Asignar story points por fase y comenzar sprint planning inmediatamente. 
