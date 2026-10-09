# Ethereum Jakarta Hackathon 2026 — raw facts & sources

Researched: Tue 6 Oct 2026, ~14:15–15:00 WIB (UTC+7). Prepared for Fatih Maulana.

**How the data was obtained:** The HackQuest page was reachable with plain `curl`, no browser needed. All event data is embedded in the page's Next.js `self.__next_f` RSC payload (the `findUniqueHackathon` object). Raw copies are saved in `./raw/` (`page.html`, `nextf.txt`). Timestamps in that payload are UTC ISO strings with `timeZone: "Asia/Jakarta"`. I converted all of them to WIB below.

## Sources
- [S1] HackQuest page (primary): https://www.hackquest.io/hackathons/Ethereum-Jakarta-Hackathon-2026 (canonical https://hackquest.io/en/hackathons/Ethereum-Jakarta-Hackathon-2026)
- [S2] Luma event (organizer, ETHJKT): https://luma.com/mdpk1c0u (linked from https://ethjkt.com/events)
- [S3] ETHJKT site / events: https://ethjkt.com/ , https://ethjkt.com/events , https://ethjkt.com/about
- [S4] Aggregator: https://indonesiahackathons.com/en/events/ethereum-jakarta-hackathon-2026 (third party; seems to scrape Luma)
- [S5] Aggregator: https://devgrantsdaily.com/items/2026-09-22-ethereum-jakarta-hackathon-2026/ (third party; snapshot from 22 Sep, now partly out of date)
- [S6] HackQuest public GraphQL endpoint used by the site: https://api.hackquest.io/graphql (`globalSearch` query)

## 1. Overview
| Field | Value | Source |
|---|---|---|
| Name | Ethereum Jakarta Hackathon 2026 | S1 |
| Tagline / theme | "BUILD THE REAL WORLD ONCHAIN": entirely about **Real-World Assets (RWA)** | S1, S2 |
| Organizer / host | **Ethereum Jakarta (ETHJKT)**; HackQuest org account; contact mail@ethjkt.com; site https://ethjkt.com/ ; X https://x.com/ethjkt ; IG https://instagram.com/ethjkt ; Discord https://discord.gg/vqbKnhhSPR | S1 |
| Luma co-hosts | Ethereum Jakarta, "Rahmat - GarudaSpark", Jakarta Creative Hub | S2 |
| Mode | **HYBRID** (HackQuest `mode`). Day 1 offline, Day 2 fully online, Day 3 offline | S1 |
| Venue field (HackQuest) | "ETHJKT @Hub & Garuda Spark @GanaraArt" | S1 |
| Day 1 venue | **ETHJKT @ Hub — Jakarta Creative Hub** (12-hour offline build sprint) | S1, S2 |
| Day 3 venue | **Ganara Art — Jakarta** (Demo Day) per HackQuest/Luma description. Luma's location pin for the Oct 11 event: **Garuda Spark Innovation Hub - Jakarta, Jl. Jenderal Sudirman, RT.1/RW.3, Gelora, Kec. Tanah Abang, Jakarta Pusat 10270** | S1, S2 |
| Ecosystem / stack tags | Ethereum; tech stack "Solidity"; level tag "senior" | S1 |
| Eligibility | Open to developers, smart contract engineers, Web3 builders, product designers, founders, students, researchers, creators, innovators. "You don't need to be an experienced RWA or Ethereum developer." DevGrants says "Asia Pacific, ID" (not stated on S1) | S1, S5 |
| Team size | **Solo or group, min 1, max 4** (`ApplicationType: Solo or Group, minSize 1, maxSize 4`). `needGroup: true` | S1 |
| Registration form fields | Required: First and Last Name, Email. Also shown and flagged `optional:false` (so probably required): Gender, Resume upload, University, Phone, Telegram, Discord, GitHub. Optional: Bio, Location. `confirmDay: 4` (days to confirm participation after approval) | S1 |
| Registration status (6 Oct) | `currentStatus: REGISTER_CLOSE, SUBMIT_NOT_OPEN`; 133 participants; 469,706 page views; projectCount 1 | S1 |
| Cost | Free (Luma: `is_free: true`, `require_approval: false` for the Oct 11 Luma RSVP) | S2 |
| Tracks | **One track only: "RWA — Build the Real World Onchain"** (FAQ). Prize tracks in data: "BUILD THE REAL WORLD ONCHAIN" (ranked) + "Honorable Mention" | S1 |
| Suggested RWA use cases | Tokenization of RWAs; real estate & property; commodities; securities & financial assets; credit & lending; supply chain & trade finance; payments & stablecoins; ownership & asset management; identity, compliance & verification; onchain infra for traditional assets; other | S1 |
| Sponsors / bounties | **None listed.** HackQuest has no partners/sponsors section and no sponsor bounties. ethjkt.com/about says "supported by leaders in the Ethereum ecosystem" but names no one | S1, S3 |
| Chain requirement | No specific chain or testnet is mandated. "Meaningful use of **Ethereum or Ethereum-compatible onchain infrastructure**" | S1 |

### Submission requirements (due Day 2, 12:00 WIB, via HackQuest "official submission platform")
Each team submits: project description; problem & solution; **GitHub repository**; **demo / deployed application**; tech stack; RWA use case; **demo video or presentation materials**; team information. (S1, S2)
- A deployed contract is not explicitly required. However, "demo / deployed application" plus the 25% "Onchain Implementation" criterion make a testnet deployment effectively necessary.
- HackQuest custom submission track: disabled (S1).

### Judging (main track) — S1
1. Real-World Utility: 25%
2. Onchain Implementation: 25% ("Simply mentioning blockchain or using blockchain only as a database is not sufficient")
3. Innovation & Differentiation: 20%
4. Feasibility & Scalability: 20%
5. Demo & User Experience: 10%

Process: online submissions are reviewed by the judging panel, and **selected** teams advance to Demo Day for live demo/presentation. HackQuest built-in voting is **disabled** (`disableJudge: true`), so judging happens offline by the panel.

### Honorable Mention criteria — S1
Uniqueness & Creativity 30% · Effort & Execution 25% · Innovation & Potential Impact 20% · Mentor Feedback / Mentor Favorite 15% · Presentation & Demo 10%.

### Prizes (sources disagree; see notes)
- Description text (S1 and Luma S2): ~**IDR 30,000,000** total. Main Prize Pool **$1,500**: 1st **$600**, 2nd **$400**, 3rd **$300**. Honorable Mentions: **$500 worth** (may include ecosystem rewards, partner prizes, credits, grants, tools).
- Structured reward data (S1): "BUILD THE REAL WORLD ONCHAIN", RANK, USD, total 1500: 1st 600, 2nd 400, 3rd 300, **4th 120, 5th 80**. "Honorable Mention", OTHERS, **total 150**. Page-level `totalRewards: 1650`.
- DevGrants (S5): "$2K".
- => **Discrepancy:** 1st–3rd add up to $1,300, and the data adds 4th/5th places to reach $1,500. HM is $500 in the text and $150 in the data. Ask the organizers which is correct.

### Rules on prior work — S1
1. **Build from scratch** during the official hackathon period. Existing or previously launched products and substantially pre-built solutions are not eligible.
2. **Allowed beforehand:** preparing the dev environment, research, attending workshops, forming teams, discussing ideas.
3. Open-source tools, libraries, protocols, APIs, SDKs and infra may be used. If you build on an existing project, clearly identify what is new.
4. One submission per team. Members must be listed accurately.
5. GitHub repo (or equivalent) required. Judges may review code, docs and demo.
6. Attribute third-party code, APIs, datasets, models and assets. Plagiarism or misrepresentation leads to disqualification.
7. Code of conduct applies across workshops, sprint, online period and Demo Day. Organizer decisions are final.
8. FAQ: you don't have to finish within the 12-hour sprint and can keep building until the Day 2 deadline. Day 1 and Day 3 are the offline sessions. Day 2 is fully online.

## 2. Timeline (original zone: HackQuest timeline `timeZone: Asia/Jakarta`, stored as UTC)
| Event | Original value | WIB (UTC+7) | Source |
|---|---|---|---|
| Registration open | 2026-09-21T05:00Z | **Mon 21 Sep 2026, 12:00 WIB** | S1 |
| Registration close | 2026-10-03T05:00Z | **Sat 3 Oct 2026, 12:00 WIB** (DevGrants' older snapshot said 30 Sep 17:00, so the deadline seems to have been extended. Either way it is **closed now**) | S1, S5 |
| Pre-hackathon workshops | "October 5–7, 2026" (no times/venues published) | **Mon 5 – Wed 7 Oct 2026**, times TBC | S1, S2 |
| Day 1: offline 12-hour build sprint / submission opens | submissionOpen 2026-10-09T02:00Z | **Fri 9 Oct 2026, 09:00 WIB** submission opens. Sprint hours not published (aggregator S4 lists 10:00–21:00 WIB daily, unconfirmed) | S1, S4 |
| Day 2: online submission deadline | submissionClose 2026-10-10T05:00Z; text "12:00 PM (WIB)" | **Sat 10 Oct 2026, 12:00 WIB** | S1, S2 |
| Day 3: Demo Day (selected teams) | Luma start/end 2026-10-11T03:00Z–14:00Z | **Sun 11 Oct 2026, 10:00–21:00 WIB** | S2 |
| Judging end ("rewardTime") | 2026-10-11T08:00Z | **Sun 11 Oct 2026, 15:00 WIB** | S1 |
| Winners announcement | Not published (HackQuest `announce: false`, `winnerCount: 0`) | Unconfirmed; presumably Demo Day | S1 |
| Shortlist for Demo Day announced | Not published | Unconfirmed (between Sat 12:00 and Sun) | — |

Build window = Fri 09:00 → Sat 12:00 WIB, which is **27 hours** (12 of them in the offline sprint).

## 3. Developer resources
**On the HackQuest page:** no docs/resources links, no to-dos, no Idea Bank. Only community links (Discord https://discord.gg/vqbKnhhSPR, X https://x.com/ethjkt, https://ethjkt.com/). ETHJKT docs site: https://docs.ethjkt.com/ (general; no hackathon-specific docs found). No sponsor SDKs because no sponsors are listed.

**Essential Ethereum stack (I checked that every URL returns HTTP 200 on 6 Oct 2026):**
- Scaffolding: Scaffold-ETH 2 https://scaffoldeth.io / https://docs.scaffoldeth.io ; Speedrun Ethereum (practice) https://speedrunethereum.com
- Contracts / tooling: Foundry https://getfoundry.sh , https://book.getfoundry.sh ; Hardhat https://hardhat.org/docs ; OpenZeppelin Contracts 5.x https://docs.openzeppelin.com/contracts/5.x/ ; OZ Wizard https://wizard.openzeppelin.com ; Tenderly (debug/simulate) https://docs.tenderly.co
- Frontend: viem https://viem.sh ; wagmi https://wagmi.sh ; Reown AppKit https://docs.reown.com/appkit/overview
- Wallets / account abstraction: ERC-4337 https://eips.ethereum.org/EIPS/eip-4337 ; EIP-7702 https://eips.ethereum.org/EIPS/eip-7702 ; MetaMask Smart Accounts Kit https://docs.metamask.io/smart-accounts-kit ; Privy https://docs.privy.io ; Pimlico https://docs.pimlico.io ; Safe https://docs.safe.global ; EIP-712 typed signatures https://eips.ethereum.org/EIPS/eip-712
- RWA token standards: ERC-3643 (permissioned/compliant tokens) https://eips.ethereum.org/EIPS/eip-3643 , https://docs.erc3643.org ; ERC-4626 vaults https://eips.ethereum.org/EIPS/eip-4626 ; ERC-7540 async vaults (RWA redemptions) https://eips.ethereum.org/EIPS/eip-7540 ; ERC-1155 https://ethereum.org/en/developers/docs/standards/tokens/erc-1155/ ; ERC20Permit https://docs.openzeppelin.com/contracts/5.x/api/token/erc20#ERC20Permit
- Identity / attestations: Ethereum Attestation Service https://docs.attest.org , explorer https://easscan.org
- Oracles: Chainlink Data Feeds https://docs.chain.link/data-feeds ; Proof of Reserve https://docs.chain.link/data-feeds/proof-of-reserve ; Chainlink Functions https://docs.chain.link/chainlink-functions ; Pyth https://docs.pyth.network
- Indexing / storage: Ponder https://ponder.sh ; The Graph https://thegraph.com/docs/en/ ; Pinata/IPFS https://docs.pinata.cloud
- Networks (any EVM chain is fine; ETHJKT has recently run workshops with Arbitrum, Scroll, Lisk, Celo and MetaMask, per their Luma history): Base https://docs.base.org (faucets https://docs.base.org/base-chain/tools/network-faucets) ; Arbitrum https://docs.arbitrum.io ; Scroll https://docs.scroll.io ; Lisk https://docs.lisk.com ; Celo https://docs.celo.org
- Sepolia faucets / explorers: Google Cloud https://cloud.google.com/application/web3/faucet/ethereum/sepolia ; Alchemy https://www.alchemy.com/faucets/ethereum-sepolia ; Etherscan https://sepolia.etherscan.io ; Blockscout https://docs.blockscout.com
- Indonesia-relevant: IDRX (IDR-pegged stable token) https://idrx.co , https://docs.idrx.co (check docs for supported chains/testnets before relying on it)
- RWA market data for pitch research: https://rwa.xyz
- Learning: HackQuest learning tracks https://www.hackquest.io/learning-track ; ethereum.org developer docs https://ethereum.org/en/developers/docs/

## 4. Fatih's HackQuest profile
- HackQuest site search `https://www.hackquest.io/search?keyword=Fatih%20Maulana`: server-rendered result list is **empty** (`"list":[]`).
- HackQuest public GraphQL `globalSearch` (S6) for "Fatih Maulana" and "Fatih": **0 projects, 0 hackathons**. The same query for "Ethereum Jakarta" does return the hackathon, so the search itself works.
- HackQuest has no public people search. Profile URLs (`/user/<username>`) render client-side, and the profile API (`findUserProfileByUsername`) returned `null` even for a known organizer username, so guessing usernames (maul, fatihmaulana, fatih-maulana, fatih_maulana) is **inconclusive**. A WebSearch summary claimed a HackQuest username "maul", but no source backed it up, so I **discarded** it.
- **Conclusion: no publicly findable HackQuest builder profile or project for "Fatih Maulana".** If he has an account, he can share his profile URL (Profile → share) for verification.
- Context from public LinkedIn search snippets (https://linkedin.com/in/fatihmaulana): CS student; Bandung Builders Lead at BlockDevId; previously Technical Writer at IBUNDA.ID, Frontend Engineer at StudentsxCEOs, GRC (non-tech) member at Wo-Men In Tech Security. I used this only to tailor ideas.

## Unconfirmed / conflicting items
- Exact prize split: $1,300 (top 3) vs $1,500 incl. 4th $120 / 5th $80. HM $500 (text) vs $150 (data). Total $1,650 (HackQuest header) vs "$2K" (DevGrants) vs "~IDR 30M" (text).
- Demo Day venue: "Ganara Art" (text) vs Luma pin "Garuda Spark Innovation Hub, Jl. Jend. Sudirman, Gelora". The HackQuest address "Garuda Spark @GanaraArt" suggests they are the same site, but that is unconfirmed.
- Day 1 sprint start/end times (12 hours, exact hours unpublished). Aggregator says 10:00–21:00 WIB.
- Pre-hackathon workshop schedule (Oct 5–7): no times, venues or RSVP links found on HackQuest, Luma or ethjkt.com.
- Demo Day shortlist size/announcement time; winner announcement time; prize payout method/currency.
- Whether late registration or walk-ins are accepted (HackQuest status: REGISTER_CLOSE).
- Whether Fatih is registered (needs his login; I can't check).
- Interpretation of registration fields flagged `optional:false` (probably required).
- Geographic eligibility ("Asia Pacific, ID" is only from DevGrants).
- No sponsors, sponsor bounties, sponsor SDKs, judges or mentors are named anywhere.
