# Deploy en CELO Alfajores (testnet)

Instrucciones para desplegar el contrato DonnyRound en Celo Alfajores con Foundry.

## 1. Wallet para deploy

Necesitas una wallet con:

- **CELO** (para gas) en Alfajores. Conseguir en: https://faucet.celo.org/alfajores  
- Opcional: **cUSD** si quieres probar el flujo completo (el contrato usa la dirección de cUSD de la red).

## 2. Variables de entorno

Copia el ejemplo y rellena los valores:

```bash
cp .env.example .env
```

Edita `.env`:

- **PRIVATE_KEY**: clave privada de la wallet (con `0x`). Solo para deploy; no la compartas ni la subas a git.
- **CUSD_ADDRESS**: en Alfajores es `0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1`.
- **CHARITY_WALLET**: dirección que recibirá el 40% de donaciones (puedes usar tu wallet para pruebas).

## 3. Deploy (Foundry)

RPC de Alfajores (puedes usar la URL pública o una de Alchemy/QuickNode):

```bash
export ALFAJORES_RPC_URL=https://alfajores-forno.celo-testnet.org
export PRIVATE_KEY=0x...
export CUSD_ADDRESS=0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1
export CHARITY_WALLET=0x...
```

Desplegar:

```bash
forge script script/Deploy.s.sol:DeployScript --rpc-url $ALFAJORES_RPC_URL --broadcast --private-key $PRIVATE_KEY
```

Tras el deploy, copia la dirección del contrato e indica al frontend:

```bash
# En .env (o en tu plataforma de deploy)
NEXT_PUBLIC_DONNY_CONTRACT_ADDRESS=0x...   # dirección impresa por forge script
NEXT_PUBLIC_CHARITY_WALLET=0x...           # misma que CHARITY_WALLET si quieres mostrarla en UI
```

## 4. Verificar contrato en Celoscan

Tras el deploy, verifica el contrato en [alfajores.celoscan.io](https://alfajores.celoscan.io) (opcional):

```bash
export CONTRACT_ADDRESS=0x...   # la dirección desplegada
export CUSD_ADDRESS=0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1
export CHARITY_WALLET=0x...

forge verify-contract --chain-id 44787 $CONTRACT_ADDRESS src/DonnyRound.sol:DonnyRound \
  --constructor-args $(cast abi-encode "constructor(address,address)" $CUSD_ADDRESS $CHARITY_WALLET)
```

Si Celoscan pide API key, configura `CELOSCAN_API_KEY` en `.env` y usa `--etherscan-api-key $CELOSCAN_API_KEY`.

## 5. Tests

Ejecutar tests de DonnyRound:

```bash
forge test --match-path test/DonnyRound.t.sol -vv
```

Todos los tests del proyecto:

```bash
forge test
```

## 6. Variables de entorno (resumen)

| Variable           | Uso con keystore     | Uso con private key |
|--------------------|----------------------|----------------------|
| `ETH_RPC_URL`      | Sí                   | Sí                   |
| `CUSD_ADDRESS`     | Sí (Alfajores: ver arriba) | Sí          |
| `CHARITY_WALLET`   | Sí                   | Sí                   |
| `KEYSTORE_PASSWORD` o `--password-file` | Sí (para keystore) | No  |
| `PRIVATE_KEY`      | No                   | Sí                   |
| `CELOSCAN_API_KEY` | Opcional (verificación) | Opcional         |

Ver `.env.example` para una plantilla.
