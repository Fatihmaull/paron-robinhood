/** Resolve constructor and call inputs. Prediction uses the deployer nonce. Nothing here signs. */

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

export function buildKnown({ actions, from, nonce, predict, env, params, infra }) {
  const known = predictDeploys(actions, from, nonce, predict);
  known.gate = known.EASGate || known.RegistryGate || null;
  const mock = infra?.mockUsdc?.address;
  if (mock) known.MockUSDC = mock;
  const easAddress = infra?.eas?.address;
  if (easAddress && easAddress !== "self-deploy") known.EAS = easAddress;
  const registry = infra?.eas?.schemaRegistry;
  if (registry && registry !== "self-deploy") known.SchemaRegistry = registry;
  if (env.W_VERIFIER) known["W-VERIFIER"] = [env.W_VERIFIER];
  known.treasury = env.TREASURY_ADDRESS || env.SAFE_ADDRESS || null;
  known.panel = [env.W_ARB_1, env.W_ARB_2, env.W_ARB_3].filter(Boolean);
  known["safe-and-admin"] = [env.SAFE_ADDRESS, env.W_ADMIN].filter(Boolean);
  known["admin-eoas"] = [env.W_ADMIN, env.TEAM_EOA_1, env.TEAM_EOA_2].filter(Boolean);
  if (env.W_FEED) known["W-FEED"] = env.W_FEED;
  known["params.timelockDelay"] = params.timelockDelay;
  known["params.printIndex.windowLength"] = params.printIndex.windowLength;
  known["params.printIndex.minVolume"] = BigInt(params.printIndex.minVolume);
  known["params.printIndex.minParticipants"] = params.printIndex.minParticipants;
  known["params.printIndex.maxCarryForward"] = params.printIndex.maxCarryForward;
  known["params.bounds"] = params.bounds;
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
  known["ParticipantVerified"] = infra?.schemas?.ParticipantVerified?.uid || null;
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
