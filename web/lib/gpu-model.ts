import { keccak256, toBytes } from "viem";

/**
 * SeriesFactory, ConversionTable, PrintIndex, and ReferenceFeed key a model
 * with keccak256(bytes(name)), matching ParonConstants.H100 and the seed script.
 * stringToHex(name, { size: 32 }) is a different bytes32 and reverts factorOf.
 */
export function gpuModelId(model: string): `0x${string}` {
  return keccak256(toBytes(model));
}
