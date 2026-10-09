import { keccak256, toBytes } from "viem";

/** Canonical GPU strings (03 P3-03). RTX 4090 is not seeded (D-09). */
export const GPU_TYPES = {
  H100: "H100-SXM-80GB",
  H200: "H200-SXM-141GB",
  B200: "B200-SXM-180GB",
  GB200: "GB200-NVL72",
  A100: "A100-SXM-80GB",
} as const;

export type GpuShort = keyof typeof GPU_TYPES;

export const GPU_SHORTS = Object.keys(GPU_TYPES) as GpuShort[];

const MODEL_TO_SHORT = new Map<string, GpuShort>(
  GPU_SHORTS.map((short) => [keccak256(toBytes(GPU_TYPES[short])), short]),
);

export function gpuModelHash(short: GpuShort): `0x${string}` {
  return keccak256(toBytes(GPU_TYPES[short]));
}

export function shortOfModel(model: `0x${string}`): GpuShort | null {
  return MODEL_TO_SHORT.get(model.toLowerCase()) ?? null;
}

export function gpuTypeOf(short: string): string | null {
  if (short in GPU_TYPES) return GPU_TYPES[short as GpuShort];
  return null;
}

export function isGpuShort(value: string): value is GpuShort {
  return value in GPU_TYPES;
}
