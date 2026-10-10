/**
 * Public eth_call has no sender unless account is set, so msg.sender is 0x0.
 * The faucet then reverts ERC20InvalidReceiver(0x0) before the wallet signs.
 */
export function simulationRequest<T extends object>(
  request: T,
  account: `0x${string}`,
): T & { account: `0x${string}` } {
  return { ...request, account };
}
