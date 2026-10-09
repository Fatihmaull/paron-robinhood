import type { Address, PublicClient } from "viem";
import { erc20Abi } from "./abi";
import { splitSignature, uint256Of } from "./settlement";

type SignPermit = (args: {
  domain: { name: string; version: string; chainId: number; verifyingContract: Address };
  types: { Permit: { name: string; type: string }[] };
  primaryType: "Permit";
  message: { owner: Address; spender: Address; value: bigint; nonce: bigint; deadline: bigint };
}) => Promise<`0x${string}`>;

const PERMIT_TYPES = {
  Permit: [
    { name: "owner", type: "address" },
    { name: "spender", type: "address" },
    { name: "value", type: "uint256" },
    { name: "nonce", type: "uint256" },
    { name: "deadline", type: "uint256" },
  ],
};

/** EIP-2612 permit using the token's name() and nonces(owner). Version is "1". */
export async function signErc2612(opts: {
  client: PublicClient;
  sign: SignPermit;
  token: Address;
  owner: Address;
  spender: Address;
  value: bigint;
  chainId: number;
}): Promise<{ deadline: bigint; v: number; r: `0x${string}`; s: `0x${string}` }> {
  const name = await opts.client.readContract({
    address: opts.token,
    abi: erc20Abi,
    functionName: "name",
  });
  const nonce = await opts.client.readContract({
    address: opts.token,
    abi: erc20Abi,
    functionName: "nonces",
    args: [opts.owner],
  });
  const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);
  const signature = await opts.sign({
    domain: {
      name: String(name),
      version: "1",
      chainId: opts.chainId,
      verifyingContract: opts.token,
    },
    types: PERMIT_TYPES,
    primaryType: "Permit",
    message: {
      owner: opts.owner,
      spender: opts.spender,
      value: opts.value,
      nonce: uint256Of(nonce, 0n),
      deadline,
    },
  });
  return { deadline, ...splitSignature(signature) };
}
