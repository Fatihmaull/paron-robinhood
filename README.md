<p align="center">
  <img alt="Paron" src="docs/paron-lockup.svg" width="484" />
</p>

Paron turns GPU capacity into collateral-backed compute units. Any verified data center can list in a few clicks, anyone can trade them, and code pays holders if a provider fails to deliver.

*Paron* means anvil: the block a smith strikes every blade on.

---

## The Compute Unit (CU) Standard

GPU hours that can actually be delivered are often still sold in opaque private deals. There is no public price discovery, and no verifiable bond that pays the holder when delivery fails. 

Paron lists a standard compute unit: **1 CU = 1 H100-SXM-80GB-equivalent GPU-hour**.

Before any unit is minted, the provider must lock a bond of at least **1.5× the primary price**. This bond acts as collateral. Anyone can trade CUs on the public order book, and anyone can claim the bond on behalf of the holder if a provider misses a delivery deadline.

## Core Mechanics

1. **KYB & Verification:** Data centers receive a cryptographic attestation (via EAS) from the verifier confirming their real-world capability. Only verified providers can list capacity.
2. **Bonding & Minting:** A provider defines a series (e.g., `CU-JKT-H100-2610`), sets a primary price, and deposits USDC as a bond. The Paron protocol mints the CUs.
3. **Primary & Secondary Markets:** Buyers purchase CUs directly from the provider at the primary price. Once bought, CUs can be traded freely on the on-chain order book (bids and asks).
4. **Redemption & Delivery:** A holder requests redemption for a specific time window. The provider acknowledges, provisions the cluster, and provides access. 
5. **Slashing (Default Claim):** If the provider misses the acknowledgment or delivery deadline, the redemption is in default. Any wallet can trigger `claimDefault`, which slashes the provider's bond and compensates the CU holder.

## Architecture

Paron is a full-stack decentralized application built on EVM:

- **Smart Contracts (`contracts/`):** Built with Foundry. Handles the `BondVault`, `PrimarySale`, `OrderBook`, `RedemptionManager`, and `Timelock`. Integrates with the Ethereum Attestation Service (EAS) for provider KYC/KYB.
- **Indexer & API (`indexer/`):** Built with Ponder and Hono. Indexes contract events into a Postgres database and serves a high-speed REST API (`/v1`) for the frontend. Calculates the on-chain VWAP index.
- **Web App (`web/`):** Built with Next.js, React, Tailwind, and viem/wagmi. Features role-based dashboards for Users (Markets, Trading, Portfolio), Providers (Capacity, Redemptions), and Operators (Verification, Timelock).
- **Off-chain Agents (`agents/`):** Node.js bots. The **Keeper** monitors redemption deadlines and automatically claims defaults on behalf of users. The **Trader Bot** provides automated liquidity.

## Live Deployments

Paron is deployed on the **Robinhood Chain Testnet** (Chain ID: 46630).
- **Web App:** [https://paron.vercel.app](https://paron.vercel.app) (Backup: [https://paron-bay.vercel.app](https://paron-bay.vercel.app))
- **API Health:** [Indexer Status](https://paron-robinhood-production.up.railway.app/v1/health)
- **Explorer:** [Robinhood Chain Testnet Explorer](https://explorer.testnet.chain.robinhood.com)

*Note: Paron is currently operating on testnet. All prices, bonds, and settlements use testnet USDC. Tokens have no monetary value.*

## Local Development

Paron is a monorepo managed with `pnpm`.

### Prerequisites
- Node.js 22+
- pnpm 9+
- Foundry (for smart contracts)

### Install Dependencies
```bash
pnpm install
```

### Smart Contracts
```bash
cd contracts
forge build
forge test
```

### Web App
```bash
cd web
cp .env.example .env.local
pnpm dev
```
The web app will be available at `http://localhost:3000`.

### Indexer
```bash
cd indexer
cp .env.example .env.local
pnpm dev
```
The indexer GraphQL playground will be available at `http://localhost:42069`.

### Cloud Agents
To run the automated keeper or trader bots:
```bash
cd agents
npm install
npm run keeper
```

## Built With

- **Smart Contracts:** Solidity, Foundry, OpenZeppelin, Ethereum Attestation Service (EAS)
- **Frontend:** Next.js, React, Tailwind CSS, viem, wagmi, RainbowKit, Lightweight Charts
- **Backend:** Ponder, Hono, PostgreSQL
- **Infrastructure:** Vercel (Web), Railway (Indexer)

## License

MIT License. Copyright Fatih Maulana.
