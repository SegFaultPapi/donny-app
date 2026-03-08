# Donny – Tap-to-Earn for Good

Juego tap-to-earn en CELO: pagas entrada (2 USDC), compites tappeando 24h, top 3 ganan premios y el 40% va a una charity verificada on-chain.

---

## Contrato desplegado (Celo Sepolia)

| | |
|--|--|
| **DonnyRound** | `0x1e36560137C8EF4baeE5CBF5ef8Ede6E6275B3e4` |
| **Red** | Celo Sepolia (chain id 11142220) |
| **Explorer** | [Blockscout](https://celo-sepolia.blockscout.com/address/0x1e36560137C8EF4baeE5CBF5ef8Ede6E6275B3e4) (contrato verificado) |

El frontend usa esta dirección si en `.env` está `NEXT_PUBLIC_DONNY_CONTRACT_ADDRESS=0x1e36560137C8EF4baeE5CBF5ef8Ede6E6275B3e4`.

---

## Desarrollo

```bash
npm install --legacy-peer-deps
npm run dev
```

Deploy del contrato en Celo Sepolia: ver [docs/deploy-alfajores.md](docs/deploy-alfajores.md). Comando rápido:

```bash
export PRIVATE_KEY=0x...   # y CUSD_ADDRESS, CHARITY_WALLET en .env
npm run deploy:sepolia
```

---

## Foundry

**Foundry** es el toolkit usado para compilar y desplegar los contratos.

- **Forge**: compilar y tests → `forge build`, `forge test`
- **Deploy**: `npm run deploy:sepolia` (Celo Sepolia)

Documentación: https://book.getfoundry.sh/

### Comandos útiles

```shell
forge build
forge test --match-path test/DonnyRound.t.sol
npm run deploy:sepolia   # Celo Sepolia
npm run deploy:celo      # CELO mainnet
```
