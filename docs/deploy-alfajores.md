# Deploy en CELO: Celo Sepolia (testnet) y CELO mainnet

Instrucciones para desplegar el contrato **DonnyRound** en CELO con Foundry.

## 1. Requisitos

- **Foundry** instalado (`forge --version`). Si no: `curl -L https://foundry.paradigm.xyz | bash` y `foundryup`.
- Wallet con **CELO** para gas:
  - **Celo Sepolia (testnet, recomendado)**: faucet activo en https://faucet.celo.org/celo-sepolia o https://cloud.google.com/application/web3/faucet/celo/sepolia  
  - **Alfajores**: faucet a veces caído; solo si necesitas esa red.  
  - **Mainnet**: CELO real en tu wallet.

## 2. Configurar entorno

```bash
cp .env.example .env
```

Edita `.env`:

| Variable | Celo Sepolia (testnet) | Alfajores | CELO mainnet |
|----------|------------------------|-----------|--------------|
| `PRIVATE_KEY` | Tu clave (con `0x`) | Igual | Igual |
| `CUSD_ADDRESS` | `0x01C5C0122039549AD1493B8220cABEdD739BC44E` (USDC) | `0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1` | `0x765DE816845861e75A25fCA122bb6bEB168b3DF4` |
| `CHARITY_WALLET` | Dirección que recibe el 40% | Igual | Igual |

El frontend usa **Celo Sepolia** por defecto (chain id 11142220). Para mainnet pon `NEXT_PUBLIC_CHAIN=mainnet`.

## 3. Compilar y probar

```bash
npm run forge:build
npm run forge:test
```

## 4. Desplegar

**Celo Sepolia (testnet, con faucet):**

1. Fondear la wallet en https://faucet.celo.org/celo-sepolia (pega tu dirección).
2. En `.env` deja `CUSD_ADDRESS=0x01C5C0122039549AD1493B8220cABEdD739BC44E`.
3. Ejecutar:

```bash
export PRIVATE_KEY=0x...   # o: export $(grep -v '^#' .env | xargs)
npm run deploy:sepolia
```

**Alfajores (alternativa):**

```bash
# En .env: CUSD_ADDRESS=0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1
export PRIVATE_KEY=0x...
npm run deploy:alfajores
```

**CELO mainnet:**

En `.env`: `CUSD_ADDRESS=0x765DE816845861e75A25fCA122bb6bEB168b3DF4`. Luego:

```bash
export PRIVATE_KEY=0x...
npm run deploy:celo
```

Tras el deploy, configura el frontend:

```bash
NEXT_PUBLIC_DONNY_CONTRACT_ADDRESS=0x...   # la dirección que imprimió forge
NEXT_PUBLIC_CHARITY_WALLET=0x...            # la misma que CHARITY_WALLET
```

## 5. Verificar contrato (opcional)

**Celo Sepolia** (chain-id 11142220, Blockscout):

```bash
export CONTRACT_ADDRESS=0x...
export CUSD=0x01C5C0122039549AD1493B8220cABEdD739BC44E
export CHARITY=0x...

forge verify-contract --chain-id 11142220 $CONTRACT_ADDRESS src/DonnyRound.sol:DonnyRound \
  --constructor-args $(cast abi-encode "constructor(address,address)" $CUSD $CHARITY)
```

**Alfajores** (chain-id 44787):

```bash
export CUSD=0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1
forge verify-contract --chain-id 44787 $CONTRACT_ADDRESS src/DonnyRound.sol:DonnyRound \
  --constructor-args $(cast abi-encode "constructor(address,address)" $CUSD $CHARITY)
```

**Mainnet** (chain-id 42220):

```bash
export CUSD=0x765DE816845861e75A25fCA122bb6bEB168b3DF4
forge verify-contract --chain-id 42220 $CONTRACT_ADDRESS src/DonnyRound.sol:DonnyRound \
  --constructor-args $(cast abi-encode "constructor(address,address)" $CUSD $CHARITY) \
  --etherscan-api-key $CELOSCAN_API_KEY
```

## 6. Resumen

| Acción | Comando |
|--------|---------|
| Compilar | `npm run forge:build` |
| Tests | `npm run forge:test` |
| **Deploy Celo Sepolia** | Fondear en [faucet.celo.org/celo-sepolia](https://faucet.celo.org/celo-sepolia) → `npm run deploy:sepolia` |
| Deploy Alfajores | `npm run deploy:alfajores` |
| Deploy CELO mainnet | `CUSD_ADDRESS=0x765...` en .env + `npm run deploy:celo` |

**Deploy con verificación:** `deploy:sepolia` ya lleva `--verify`: tras desplegar, Foundry envía el contrato a Blockscout para verificación automática. Si falla la verificación, puedes hacerla a mano (sección 5).

**Faucet Celo Sepolia:** https://faucet.celo.org/celo-sepolia
