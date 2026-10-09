/** Encode and send the phase 1–2 seed. Signers come from SEED_SIGNER_ENV. Keys are not logged. */

import { readEnvKey, SEED_SIGNER_ENV } from "./key.mjs";

export const ACTOR_ENV = {
  "W-P-JKT": "W_P_JKT",
  "W-P-BTM": "W_P_BTM",
  "W-P-SGP": "W_P_SGP",
  "W-BUY": "W_BUY",
  "W-BUY2": "W_BUY2",
  "W-TRD": "W_TRD",
  "W-VERIFIER": "W_VERIFIER",
  "W-FEED": "W_FEED",
};

const ZERO_BYTES32 = `0x${"00".repeat(32)}`;

export function seedArtifactNames(actions) {
  const names = ["MockUSDC", "EAS", "EASGate", "ProviderRegistry", "SeriesFactory", "PrimarySale", "OrderBook", "CUToken"];
  if (actions.some((action) => action.step?.action === "pushReference")) names.push("ReferenceFeed");
  return names;
}

export function countryToBytes2(code) {
  if (typeof code !== "string" || code.length !== 2) {
    throw new Error("Country must be a 2-letter code. Nothing was sent.");
  }
  return `0x${Buffer.from(code, "utf8").toString("hex")}`;
}

export function actorAddress(label, env, deployer) {
  if (label === "W-DEP") return deployer;
  const name = ACTOR_ENV[label];
  if (!name) throw new Error(`No address variable for ${label}. Nothing was sent.`);
  const value = env[name];
  if (typeof value !== "string" || !/^0x[0-9a-fA-F]{40}$/.test(value)) {
    throw new Error(`Set ${name} to an address before seed. Nothing was sent.`);
  }
  return value;
}

export async function runSeed({
  mode,
  viem,
  privateKeyToAccount,
  client,
  wallet,
  deployerAccount,
  actions,
  env,
  loader,
  infra,
  label,
}) {
  const usdc = infra?.mockUsdc?.address;
  const eas = infra?.eas?.address;
  const schema = infra?.schemas?.ParticipantVerified?.uid;
  if (!usdc || !eas || !schema) {
    throw new Error("Run mock-usdc and eas-schema first. Nothing was sent.");
  }
  const gate = label?.contracts?.EASGate?.address;
  if (!gate) throw new Error("EASGate is not in the label manifest. Nothing was sent.");
  const addressOf = (name, { optional = false } = {}) => {
    const value = label?.contracts?.[name]?.address;
    if (!value && !optional) throw new Error(`No address for ${name} in the label manifest. Nothing was sent.`);
    return value || null;
  };
  const factory = addressOf("SeriesFactory");
  const sale = addressOf("PrimarySale");
  const book = addressOf("OrderBook");
  const registry = addressOf("ProviderRegistry");
  const vault = addressOf("BondVault");
  const panel = addressOf("PanelArbitrator");
  const redemption = addressOf("RedemptionManager");
  const feed = addressOf("ReferenceFeed", { optional: true });

  const abiOf = (name) => {
    const artifact = loader(name);
    if (!artifact?.abi) throw new Error(`Missing bytecode for ${name}.`);
    return artifact.abi;
  };
  const usdcAbi = abiOf("MockUSDC");
  const easAbi = abiOf("EAS");
  const gateAbi = abiOf("EASGate");
  const registryAbi = abiOf("ProviderRegistry");
  const factoryAbi = abiOf("SeriesFactory");
  const saleAbi = abiOf("PrimarySale");
  const bookAbi = abiOf("OrderBook");
  const tokenAbi = abiOf("CUToken");
  const feedAbi = actions.some((action) => action.step?.action === "pushReference") ? abiOf("ReferenceFeed") : null;

  const spenders = {
    PrimarySale: sale,
    OrderBook: book,
    RedemptionManager: redemption,
    BondVault: vault,
  };

  const accounts = new Map();
  const signerAccount = (labelName) => {
    if (labelName === "W-DEP") return deployerAccount;
    if (accounts.has(labelName)) return accounts.get(labelName);
    const envName = SEED_SIGNER_ENV[labelName];
    if (!envName) throw new Error(`No key mapping for ${labelName}. Nothing was sent.`);
    const pk = readEnvKey(env, envName);
    let account;
    try {
      account = privateKeyToAccount(pk);
    } catch {
      throw new Error(`${envName} was rejected. Nothing was sent.`);
    }
    accounts.set(labelName, account);
    return account;
  };

  const series = new Map();
  for (const action of actions) {
    if (action.step?.action === "createSeries") {
      series.set(action.step.symbol, { id: BigInt(action.step.expectedSeriesId), token: null });
    }
  }
  const uids = new Map();
  const receipts = [];
  const targetWei = BigInt(env.ETH_TARGET_WEI || "20000000000000000");
  let lastSeries = null;

  const send = async (account, to, data, value, meta) => {
    const txValue = value ?? 0n;
    if (mode === "simulate") {
      const gas = await client.estimateGas({
        account: account.address,
        to,
        data,
        value: txValue,
      });
      receipts.push({
        kind: "seed",
        contract: meta,
        address: to,
        from: account.address,
        status: "simulated",
        gas: gas.toString(),
      });
      return null;
    }
    const hash = await wallet.sendTransaction({ account, to, data, value: txValue });
    const receipt = await client.waitForTransactionReceipt({ hash });
    if (receipt.status !== "success") {
      throw new Error(`Seed step ${meta} reverted. Nothing further was sent.`);
    }
    receipts.push({
      kind: "seed",
      contract: meta,
      address: to,
      txHash: hash,
      block: Number(receipt.blockNumber),
      from: account.address,
      status: receipt.status,
    });
    return receipt;
  };

  for (const action of actions) {
    const step = action.step;
    if (!step) throw new Error("Seed step is missing its plan. Nothing was sent.");
    if (step.action === "skipped-in-ops-seed") continue;
    const signer = signerAccount(step.signer);

    if (step.action === "topUpEth") {
      const labels = new Set(actions.map((row) => row.signer).filter((name) => name && name !== "W-DEP"));
      for (const actor of actions) {
        if (actor.step?.to) labels.add(actor.step.to);
      }
      for (const labelName of labels) {
        const to = viem.getAddress(actorAddress(labelName, env, deployerAccount.address));
        const balance = await client.getBalance({ address: to });
        if (balance >= targetWei) continue;
        await send(deployerAccount, to, "0x", targetWei - balance, "topUpEth");
      }
      continue;
    }

    if (step.action === "mintUsdc") {
      const to = viem.getAddress(actorAddress(step.to, env, deployerAccount.address));
      const target = BigInt(step.amount);
      const balance = await client.readContract({
        address: usdc,
        abi: usdcAbi,
        functionName: "balanceOf",
        args: [to],
      });
      if (balance >= target) continue;
      const data = viem.encodeFunctionData({
        abi: usdcAbi,
        functionName: "mint",
        args: [to, target - balance],
      });
      await send(signer, usdc, data, 0n, "mintUsdc");
      continue;
    }

    if (step.action === "multiAttest") {
      const requests = step.recipients.map((row) => ({
        recipient: viem.getAddress(actorAddress(row.label, env, deployerAccount.address)),
        expirationTime: 0,
        revocable: true,
        refUID: ZERO_BYTES32,
        data: viem.encodeAbiParameters(
          [{ type: "bytes32" }, { type: "uint8" }, { type: "bytes2" }, { type: "uint64" }],
          [row.entity, row.role, countryToBytes2(row.country), BigInt(row.expiry)],
        ),
        value: 0n,
      }));
      const data = viem.encodeFunctionData({
        abi: easAbi,
        functionName: "multiAttest",
        args: [[{ schema, data: requests }]],
      });
      const receipt = await send(signer, eas, data, 0n, "multiAttest");
      if (receipt) {
        const topic = viem.encodeEventTopics({ abi: easAbi, eventName: "Attested" })[0];
        for (const log of receipt.logs) {
          if (log.topics[0]?.toLowerCase() !== topic.toLowerCase()) continue;
          const recipient = viem.getAddress(`0x${log.topics[1].slice(-40)}`);
          uids.set(recipient.toLowerCase(), log.data);
        }
      }
      continue;
    }

    if (step.action === "linkAttestation") {
      const account = viem.getAddress(actorAddress(step.account, env, deployerAccount.address));
      const uid = uids.get(account.toLowerCase());
      if (!uid) throw new Error(`No attestation uid for ${step.account}. Nothing further was sent.`);
      const data = viem.encodeFunctionData({ abi: gateAbi, functionName: "linkAttestation", args: [uid] });
      await send(signer, gate, data, 0n, "linkAttestation");
      continue;
    }

    if (step.action === "registerProvider") {
      const data = viem.encodeFunctionData({ abi: registryAbi, functionName: "registerProvider", args: [] });
      await send(signer, registry, data, 0n, "registerProvider");
      continue;
    }

    if (step.action === "approve") {
      const spender = spenders[step.spender];
      if (!spender) throw new Error(`Unknown spender ${step.spender}. Nothing was sent.`);
      const data = viem.encodeFunctionData({
        abi: usdcAbi,
        functionName: "approve",
        args: [spender, BigInt(step.amount)],
      });
      await send(signer, usdc, data, 0n, "approve");
      continue;
    }

    if (step.action === "createSeries") {
      const params = {
        gpuModel: viem.keccak256(viem.toBytes(step.gpuKey)),
        gpuHours: BigInt(step.gpuHours),
        primaryPrice: BigInt(step.primaryPrice),
        bondPerCU: BigInt(step.bondPerCU),
        windowStart: BigInt(step.windowStart),
        windowEnd: BigInt(step.windowEnd),
        ackWindow: BigInt(step.ackWindow),
        deliveryWindow: BigInt(step.deliveryWindow),
        disputeWindow: BigInt(step.disputeWindow),
        minRedemption: BigInt(step.minRedemption),
        arbitrator: panel,
        specHash: ZERO_BYTES32,
        termsHash: ZERO_BYTES32,
        country: countryToBytes2(step.country),
        continent: Number(step.continent),
        institutional: Boolean(step.institutional),
        symbol: step.symbol,
      };
      const data = viem.encodeFunctionData({ abi: factoryAbi, functionName: "createSeries", args: [params] });
      const receipt = await send(signer, factory, data, 0n, "createSeries");
      const row = series.get(step.symbol);
      if (receipt && row) {
        const topic = viem.encodeEventTopics({ abi: factoryAbi, eventName: "SeriesCreated" })[0];
        const log = receipt.logs.find((item) => item.topics[0]?.toLowerCase() === topic.toLowerCase());
        if (!log) throw new Error(`SeriesCreated was not in the receipt for ${step.symbol}.`);
        row.token = viem.getAddress(`0x${log.topics[3].slice(-40)}`);
        row.id = BigInt(log.topics[1]);
      }
      lastSeries = row;
      continue;
    }

    if (step.action === "buy") {
      const row = series.get(step.seriesSymbol);
      if (!row) throw new Error(`Unknown series ${step.seriesSymbol}. Nothing was sent.`);
      const data = viem.encodeFunctionData({
        abi: saleAbi,
        functionName: "buy",
        args: [row.id, BigInt(step.qty), BigInt(step.maxCost)],
      });
      await send(signer, sale, data, 0n, "buy");
      lastSeries = row;
      continue;
    }

    if (step.action === "approveCu") {
      if (!lastSeries?.token) throw new Error("CU token address is not known yet. Nothing was sent.");
      const spender = spenders[step.spender];
      const data = viem.encodeFunctionData({
        abi: tokenAbi,
        functionName: "approve",
        args: [spender, BigInt(step.amount)],
      });
      await send(signer, lastSeries.token, data, 0n, "approveCu");
      continue;
    }

    if (step.action === "placeOrder") {
      if (!lastSeries) throw new Error("No series for the resting order. Nothing was sent.");
      const side = step.side === "Ask" ? 1 : 0;
      const data = viem.encodeFunctionData({
        abi: bookAbi,
        functionName: "placeOrder",
        args: [lastSeries.id, side, BigInt(step.price), BigInt(step.qty), Boolean(step.immediateOrCancel)],
      });
      await send(signer, book, data, 0n, "placeOrder");
      continue;
    }

    if (step.action === "pushReference") {
      if (!feed || !feedAbi) throw new Error("ReferenceFeed is not in the label manifest. Nothing was sent.");
      const block = await client.getBlock();
      const observedAt = block.timestamp;
      for (const gpu of step.gpus) {
        const data = viem.encodeFunctionData({
          abi: feedAbi,
          functionName: "push",
          args: [viem.keccak256(viem.toBytes(gpu)), BigInt(step.value), observedAt],
        });
        await send(signer, feed, data, 0n, "pushReference");
      }
      continue;
    }

    throw new Error(`Unknown seed action ${step.action}. Nothing was sent.`);
  }

  return receipts;
}
