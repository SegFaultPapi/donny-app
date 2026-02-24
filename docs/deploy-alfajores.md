# Deploy en CELO Alfajores (testnet)

**Migración a Foundry en curso.** Las instrucciones de deploy y verificación usarán Forge cuando se complete la configuración.

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
- **CUSD_ADDRESS**: en Alfajores es `0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1` (ya viene en `.env.example`).
- **CHARITY_WALLET**: dirección que recibirá el 40% de donaciones (puedes usar tu misma wallet para pruebas).

## 3. Deploy (con Foundry)

Cuando Foundry esté configurado:

```bash
forge script script/Deploy.s.sol --rpc-url $ALFAJORES_RPC_URL --broadcast --private-key $PRIVATE_KEY
```

O usando `forge create` para un deploy mínimo. La documentación se actualizará con el script y las variables exactas.

## 4. Verificar contrato en Celoscan

Con Foundry:

```bash
forge verify-contract --chain-id 44787 CONTRACT_ADDRESS src/DonnyRound.sol:DonnyRound --constructor-args $(cast abi-encode "constructor(address,address)" $CUSD_ADDRESS $CHARITY_WALLET)
```

---

## Tests

Los tests de contratos se ejecutarán con Foundry:

```bash
forge test
```

(O el comando equivalente según la versión de `forge verify-contract` y la ruta de los contratos.)

## 5. Variables de entorno (resumen)

| Variable           | Uso con keystore     | Uso con private key |
|--------------------|----------------------|----------------------|
| `ETH_RPC_URL`      | Sí                   | Sí                   |
| `CUSD_ADDRESS`     | Sí (Alfajores: ver arriba) | Sí          |
| `CHARITY_WALLET`   | Sí                   | Sí                   |
| `KEYSTORE_PASSWORD` o `--password-file` | Sí (para keystore) | No  |
| `PRIVATE_KEY`      | No                   | Sí                   |
| `CELOSCAN_API_KEY` | Opcional (verificación) | Opcional         |

Ver `.env.example` para una plantilla.
