/**
 * Provisional fragments from dev doc 01. Replace with shared/abi when lane L1 exports it.
 * SeriesParams field order follows 01 §5.1 input fields.
 */
export const abi = {
  redemptionManager: [
    "function stateOf(uint256 reqId) view returns (uint8)",
    "function claimDefault(uint256 reqId)",
    "function finalizeRedemption(uint256 reqId)",
    "function resolveNoRuling(uint256 reqId)",
    "function reopenedFrom(uint256 reqId) view returns (uint256)",
    "event Defaulted(uint256 indexed reqId, uint256 indexed seriesId, address indexed holder, uint256 amount, uint256 payout, bool voluntary, bool viaDispute, address caller)",
    "event RedemptionReopened(uint256 indexed oldReqId, uint256 indexed newReqId, uint256 indexed seriesId, uint64 ackDeadline)",
  ],
  primarySale: [
    "function buy(uint256 seriesId, uint256 qty, uint256 maxCost) returns (uint256 cost)",
    "event PrimaryBuy(uint256 indexed seriesId, address indexed buyer, uint256 qty, uint256 price, uint256 cost, uint256 fee)",
  ],
  orderBook: [
    "function placeOrder(uint256 seriesId, uint8 side, uint256 price, uint256 qty, bool immediateOrCancel) returns (uint256 orderId, uint256 filledQty)",
  ],
  erc20: [
    "function approve(address spender, uint256 amount) returns (bool)",
    "function balanceOf(address account) view returns (uint256)",
  ],
};
