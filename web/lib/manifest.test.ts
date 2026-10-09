import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { addressesFromManifests, bytes32Of, fillUnset, loadManifestAddresses } from "./manifest.ts";

const USDC = "0x00000000000000000000000000000000000000a1";
const EAS = "0x00000000000000000000000000000000000000a2";
const FACTORY = "0x00000000000000000000000000000000000000a3";
const GATE = "0x00000000000000000000000000000000000000a4";
const REGISTRY_GATE = "0x00000000000000000000000000000000000000a5";
const UID = `0x${"ab".repeat(32)}`;

test("manifest addresses map infra and the label, and ignore non-addresses", () => {
  const found = addressesFromManifests(
    {
      schemaVersion: "paron-deployments/v1",
      mockUsdc: { address: USDC },
      eas: { mode: "self-deploy", address: "self-deploy" },
      schemas: { ParticipantVerified: { uid: UID } },
    },
    {
      schemaVersion: "paron-deployments/v1",
      contracts: {
        SeriesFactory: { address: FACTORY },
        CUToken: { address: "0x00000000000000000000000000000000000000ff" },
        RegistryGate: { address: REGISTRY_GATE },
        EASGate: { address: GATE },
        ReferenceFeed: { address: "0x0000000000000000000000000000000000000000" },
      },
    },
  );
  assert.equal(found.NEXT_PUBLIC_ADDR_USDC, USDC);
  assert.equal(found.NEXT_PUBLIC_ADDR_EAS, undefined);
  assert.equal(found.NEXT_PUBLIC_ADDR_EAS_SCHEMA, UID);
  assert.equal(found.NEXT_PUBLIC_ADDR_SERIES_FACTORY, FACTORY);
  assert.equal(found.NEXT_PUBLIC_ADDR_GATE, GATE);
  assert.equal(found.NEXT_PUBLIC_ADDR_CU_TOKEN_SERIES_4, undefined);
  assert.equal(found.NEXT_PUBLIC_ADDR_REFERENCE_FEED, undefined);
  assert.equal(found.NEXT_PUBLIC_DATA_SOURCE, undefined);
});

test("a real eas address is kept and a registry gate fills in when EASGate is absent", () => {
  const found = addressesFromManifests(
    { schemaVersion: "paron-deployments/v1", eas: { address: EAS } },
    { schemaVersion: "paron-deployments/v1", contracts: { RegistryGate: { address: REGISTRY_GATE } } },
  );
  assert.equal(found.NEXT_PUBLIC_ADDR_EAS, EAS);
  assert.equal(found.NEXT_PUBLIC_ADDR_GATE, REGISTRY_GATE);
});

test("missing files and a foreign schema add nothing", () => {
  assert.deepEqual(addressesFromManifests(null, undefined), {});
  assert.deepEqual(
    addressesFromManifests({ schemaVersion: "other", mockUsdc: { address: USDC } }, null),
    {},
  );
});

test("an env value already set is left alone", () => {
  const found = addressesFromManifests(
    { schemaVersion: "paron-deployments/v1", mockUsdc: { address: USDC } },
    null,
  );
  const applied = fillUnset({ NEXT_PUBLIC_ADDR_USDC: "0x1111111111111111111111111111111111111111" }, found);
  assert.deepEqual(applied, {});
  const filled = fillUnset({}, found);
  assert.equal(filled.NEXT_PUBLIC_ADDR_USDC, USDC);
});

test("schema uids are 32 bytes", () => {
  assert.equal(bytes32Of(UID), UID);
  assert.equal(bytes32Of(USDC), null);
  assert.equal(bytes32Of(`0x${"00".repeat(32)}`), null);
});

test("loadManifestAddresses reads the chain directory and leaves DATA_SOURCE alone", () => {
  const root = mkdtempSync(path.join(tmpdir(), "paron-manifest-"));
  const dir = path.join(root, "deployments", "46630");
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    path.join(dir, "infra.json"),
    JSON.stringify({ schemaVersion: "paron-deployments/v1", mockUsdc: { address: USDC }, eas: { address: "self-deploy" } }),
  );
  writeFileSync(
    path.join(dir, "stage-1.json"),
    JSON.stringify({ schemaVersion: "paron-deployments/v1", contracts: { SeriesFactory: { address: FACTORY } } }),
  );
  try {
    const applied = loadManifestAddresses(root, {
      NEXT_PUBLIC_CHAIN_ID: "46630",
      NEXT_PUBLIC_DATA_SOURCE: "mock",
      NEXT_PUBLIC_ADDR_SERIES_FACTORY: "0x5555555555555555555555555555555555555555",
    });
    assert.equal(applied.NEXT_PUBLIC_ADDR_USDC, USDC);
    assert.equal(applied.NEXT_PUBLIC_ADDR_EAS, undefined);
    assert.equal(applied.NEXT_PUBLIC_ADDR_SERIES_FACTORY, undefined);
    assert.equal(applied.NEXT_PUBLIC_DATA_SOURCE, undefined);
    assert.deepEqual(loadManifestAddresses(root, { NEXT_PUBLIC_DEPLOY_LABEL: "../infra" }), {});
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
