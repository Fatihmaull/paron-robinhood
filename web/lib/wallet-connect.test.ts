import assert from "node:assert/strict";
import test from "node:test";
import {
  ConnectTimeoutError,
  connectErrorMessage,
  pickConnector,
  walletDetected,
  withTimeout,
} from "./wallet-connect.ts";

const generic = { id: "injected", name: "Injected", type: "injected" };
const metamask = { id: "io.metamask", name: "MetaMask", type: "injected", rdns: "io.metamask" };
const phantom = { id: "app.phantom", name: "Phantom", type: "injected", rdns: "app.phantom" };
const wc = { id: "walletConnect", name: "WalletConnect", type: "walletConnect" };

test("picks the EIP-6963 MetaMask connector even when generic injected comes first", () => {
  assert.equal(pickConnector([generic, phantom, metamask]), metamask);
  assert.equal(pickConnector([generic, metamask]), metamask);
});

test("falls back to another discovered wallet, then generic injected, then none", () => {
  assert.equal(pickConnector([generic, phantom]), phantom);
  assert.equal(pickConnector([generic]), generic);
  assert.equal(pickConnector([wc]), null);
  assert.equal(pickConnector([]), null);
});

test("wallet detection needs window.ethereum or a discovered wallet", () => {
  assert.equal(walletDetected([generic], false), false);
  assert.equal(walletDetected([generic], true), true);
  assert.equal(walletDetected([generic, metamask], false), true);
});

test("error copy covers rejection, pending request, timeout and the rest", () => {
  assert.match(connectErrorMessage({ code: 4001, message: "x" }), /rejected in MetaMask/);
  assert.match(connectErrorMessage(Object.assign(new Error("User rejected the request."), { name: "UserRejectedRequestError" })), /rejected in MetaMask/);
  assert.match(connectErrorMessage({ code: -32002, message: "Request of type 'wallet_requestPermissions' already pending" }), /already pending.*Open MetaMask/);
  assert.match(connectErrorMessage(new Error("boom", { cause: { code: -32002 } })), /already pending/);
  assert.match(connectErrorMessage(new ConnectTimeoutError()), /No response from the wallet/);
  assert.match(connectErrorMessage(new Error("ProviderNotFoundError")), /Install MetaMask/);
  assert.equal(connectErrorMessage(new Error("weird")), "Could not connect. Try again.");
});

test("withTimeout rejects a hanging request and passes a fast one", async () => {
  await assert.rejects(withTimeout(new Promise(() => {}), 20), ConnectTimeoutError);
  assert.equal(await withTimeout(Promise.resolve(7), 20), 7);
});
