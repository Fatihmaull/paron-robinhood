import { isAddress, recoverTypedDataAddress, type Address, type Hex } from "viem";

/** EIP-712 Ruling, matching PanelArbitrator.RULING_TYPEHASH. */
export const RULING_TYPES = {
  Ruling: [
    { name: "reqId", type: "uint256" },
    { name: "outcome", type: "uint8" },
    { name: "rulingDeadline", type: "uint64" },
  ],
} as const;

export type RulingOutcome = 1 | 2;

/** D-43 package. The fragment is not sent to the server. */
export type RulingPackage = {
  chainId: number;
  arbitrator: Address;
  reqId: string;
  outcome: RulingOutcome;
  rulingDeadline: string;
  signatures: Hex[];
};

export function rulingDomain(chainId: number, arbitrator: Address) {
  return {
    name: "Paron",
    version: "1",
    chainId,
    verifyingContract: arbitrator,
  } as const;
}

export function encodeRulingFragment(pkg: RulingPackage): string {
  return `sig=${encodeURIComponent(JSON.stringify(pkg))}`;
}

export function packageUrl(origin: string, path: string, pkg: RulingPackage): string {
  const base = origin.replace(/\/$/, "");
  const route = path.startsWith("/") ? path : `/${path}`;
  return `${base}${route}#${encodeRulingFragment(pkg)}`;
}

export function parseRulingPackage(raw: string): RulingPackage | null {
  const hash = raw.includes("#") ? raw.slice(raw.indexOf("#") + 1) : raw.trim();
  const body = hash.startsWith("sig=") ? hash.slice(4) : hash;
  let value: unknown;
  try {
    value = JSON.parse(decodeURIComponent(body));
  } catch {
    return null;
  }
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (typeof row.chainId !== "number" || !Number.isInteger(row.chainId) || row.chainId <= 0) return null;
  if (typeof row.arbitrator !== "string" || !isAddress(row.arbitrator)) return null;
  if (typeof row.reqId !== "string" || !/^\d+$/.test(row.reqId)) return null;
  if (row.outcome !== 1 && row.outcome !== 2) return null;
  if (typeof row.rulingDeadline !== "string" || !/^\d+$/.test(row.rulingDeadline)) return null;
  if (!Array.isArray(row.signatures)) return null;
  const signatures: Hex[] = [];
  for (const signature of row.signatures) {
    if (typeof signature !== "string" || !/^0x[0-9a-fA-F]{130,}$/.test(signature)) return null;
    signatures.push(signature as Hex);
  }
  return {
    chainId: row.chainId,
    arbitrator: row.arbitrator,
    reqId: row.reqId,
    outcome: row.outcome,
    rulingDeadline: row.rulingDeadline,
    signatures,
  };
}

export type SignatureReview = {
  signers: Address[];
  ready: boolean;
  reason: string | null;
};

export async function reviewRulingPackage(
  pkg: RulingPackage,
  members: readonly Address[],
  threshold: number,
): Promise<SignatureReview> {
  if (threshold < 1) {
    return { signers: [], ready: false, reason: "Panel threshold is not loaded." };
  }
  if (members.length === 0) {
    return { signers: [], ready: false, reason: "Panel members are not loaded." };
  }
  const signers: Address[] = [];
  const known = new Set(members.map((member) => member.toLowerCase()));
  for (const signature of pkg.signatures) {
    let signer: Address;
    try {
      signer = await recoverTypedDataAddress({
        domain: rulingDomain(pkg.chainId, pkg.arbitrator),
        types: RULING_TYPES,
        primaryType: "Ruling",
        message: {
          reqId: BigInt(pkg.reqId),
          outcome: pkg.outcome,
          rulingDeadline: BigInt(pkg.rulingDeadline),
        },
        signature,
      });
    } catch {
      return { signers, ready: false, reason: "A signature in this package is invalid." };
    }
    const id = signer.toLowerCase();
    if (signers.some((item) => item.toLowerCase() === id)) {
      return { signers, ready: false, reason: "This package repeats a signer." };
    }
    if (!known.has(id)) {
      return { signers, ready: false, reason: "A signer is not on the panel." };
    }
    signers.push(signer);
  }
  if (signers.length < threshold) {
    return { signers, ready: false, reason: `Signatures in this package: ${signers.length}/${threshold}.` };
  }
  return { signers, ready: true, reason: null };
}
