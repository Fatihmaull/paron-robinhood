/** Resolve constructor and call inputs. Prediction uses the deployer nonce. Nothing here signs. */

import { SCHEMA_KYB, SCHEMA_PARTICIPANT, windowBounds } from "./deploy-plan.mjs";
import { schemaUid } from "./schema-uid.mjs";

const ZERO = "0x0000000000000000000000000000000000000000";

export function predictDeploys(actions, from, startNonce, predict) {
  const known = {};
  let nonce = startNonce;
  for (const action of actions) {
    if (action.kind !== "deploy") continue;
    known[action.contract] = predict(from, nonce);
    nonce += 1;
  }
  return known;
}

function filled(value) {
  return Boolean(value) && value !== "self-deploy" && value !== ZERO;
}

export function buildKnown({ actions, from, nonce, predict, env, params, infra, chain }) {
  const known = predictDeploys(actions, from, nonce, predict);
  known.deployer = from;
  known.gate = known.EASGate || known.RegistryGate || null;
  const mock = infra?.mockUsdc?.address;
  if (mock) known.MockUSDC = mock;
  const easAddress = infra?.eas?.address;
  if (filled(easAddress)) known.EAS = easAddress;
  else if (chain?.eas?.mode === "existing" && filled(chain.eas.address)) known.EAS = chain.eas.address;
  const registry = infra?.eas?.schemaRegistry;
  if (filled(registry)) known.SchemaRegistry = registry;
  else if (filled(chain?.eas?.schemaRegistry)) known.SchemaRegistry = chain.eas.schemaRegistry;
  if (env.W_VERIFIER) known["W-VERIFIER"] = [env.W_VERIFIER];
  known.treasury = env.TREASURY_ADDRESS || env.SAFE_ADDRESS || null;
  known.panel = [env.W_ARB_1, env.W_ARB_2, env.W_ARB_3].filter(Boolean);
  known["safe-and-admin"] = [env.SAFE_ADDRESS, env.W_ADMIN].filter(Boolean);
  known["admin-eoas"] = [env.W_ADMIN, env.TEAM_EOA_1, env.TEAM_EOA_2].filter(Boolean);
  if (env.W_FEED) known["W-FEED"] = env.W_FEED;
  const index = params.printIndex || params.index;
  known["params.timelockDelay"] = params.timelockDelay;
  known["params.index"] = {
    windowLength: Number(index.windowLength),
    minVolume: BigInt(index.minVolume),
    minParticipants: Number(index.minParticipants),
    maxCarryForward: Number(index.maxCarryForward),
  };
  known["params.bounds"] = windowBounds(params.bounds);
  known["params.allowOpenWindow"] = params.allowOpenWindow;
  known["params.enforceCalendarMonth"] = params.enforceCalendarMonth;
  known["params.leadTime"] = params.leadTime;
  known["params.bondFloorBps"] = params.bondFloorBps;
  known["params.primaryFeeBps"] = params.primaryFeeBps;
  known["params.takerFeeBps"] = params.takerFeeBps;
  known["params.makerFeeBps"] = params.makerFeeBps;
  known["params.maxLevels"] = params.maxLevels;
  known["params.maxFillsPerTx"] = params.maxFillsPerTx;
  known["params.rulingWindow"] = params.rulingWindow;
  known["params.disputeBondBps"] = params.disputeBondBps;
  known["params.minDisputeBond"] = params.minDisputeBond;
  known["params.panelThreshold"] = params.panelThreshold;
  known.ParticipantVerified = infra?.schemas?.ParticipantVerified?.uid || schemaUid(SCHEMA_PARTICIPANT);
  known.KybApplication = infra?.schemas?.KybApplication?.uid || schemaUid(SCHEMA_KYB);
  return known;
}

export function resolveArg(arg, known) {
  if (Object.hasOwn(arg, "value")) return arg.value;
  if (!arg.ref || known[arg.ref] == null || known[arg.ref] === "") {
    throw new Error(`Unresolved input ${arg.name || arg.ref}. Nothing was sent.`);
  }
  return known[arg.ref];
}

export function resolveArgs(args, known) {
  return args.map((arg) => resolveArg(arg, known));
}
