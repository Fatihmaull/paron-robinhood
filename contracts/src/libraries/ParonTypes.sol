// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

enum ProviderStatus {
    None,
    Active,
    Suspended,
    Banned
}

enum RedemptionState {
    None,
    Requested,
    Acknowledged,
    Delivered,
    Defaultable,
    Disputed,
    Defaulted,
    Finalized,
    Refunded
}

enum Ruling {
    None,
    Delivered,
    NotDelivered
}

enum IndexStatus {
    OK,
    THIN,
    DISRUPTED
}

enum Side {
    Bid,
    Ask
}

enum PrintKind {
    Primary,
    Trade
}

struct Provider {
    ProviderStatus status;
    bytes32 entityId;
    bytes32 attestationUid;
    uint256 deliveredCU;
    uint256 defaultedCU;
    uint256 voluntaryDefaultedCU;
    uint32 disputesLost;
    uint32 strikes;
}

struct SeriesParams {
    bytes32 gpuModel;
    uint64 gpuHours;
    uint256 primaryPrice;
    uint256 bondPerCU;
    uint64 windowStart;
    uint64 windowEnd;
    uint64 ackWindow;
    uint64 deliveryWindow;
    uint64 disputeWindow;
    uint256 minRedemption;
    address arbitrator;
    bytes32 specHash;
    bytes32 termsHash;
    bytes2 country;
    uint8 continent;
    bool institutional;
    string symbol;
}

struct Series {
    address provider;
    address token;
    bytes32 gpuModel;
    uint32 factor;
    uint64 gpuHours;
    uint256 maxSupply;
    uint256 primaryPrice;
    uint256 bondPerCU;
    uint64 windowStart;
    uint64 windowEnd;
    uint64 ackWindow;
    uint64 deliveryWindow;
    uint64 disputeWindow;
    uint256 minRedemption;
    address arbitrator;
    bytes32 specHash;
    bytes32 termsHash;
    bytes2 country;
    uint8 continent;
    bool institutional;
    string symbol;
    bool paused;
    bool finalized;
    uint256 soldSupply;
}

struct WindowBounds {
    uint64 minAck;
    uint64 maxAck;
    uint64 minDelivery;
    uint64 maxDelivery;
    uint64 minDispute;
    uint64 maxDispute;
}

struct SeriesBond {
    address provider;
    uint256 deposited;
    uint256 balance;
    uint256 released;
    uint256 slashed;
    bool finalized;
    bool withdrawn;
}

struct Request {
    uint256 seriesId;
    address holder;
    uint256 amount;
    bytes32 deliveryRef;
    bytes32 receiptHash;
    RedemptionState state;
    uint64 requestedAt;
    uint64 ackDeadline;
    uint64 deliveryDeadline;
    uint64 disputeDeadline;
    uint64 rulingDeadline;
    uint256 disputeBond;
}

struct Order {
    uint256 seriesId;
    address maker;
    bytes32 makerEntity;
    Side side;
    uint256 price;
    uint256 qtyRemaining;
    uint64 createdAt;
    uint256 prev;
    uint256 next;
}

struct IndexParams {
    uint64 windowLength;
    uint256 minVolume;
    uint32 minParticipants;
    uint64 maxCarryForward;
}

struct IndexState {
    int256 answer;
    IndexStatus status;
    uint64 windowStart;
    uint256 sumNotional;
    uint256 sumQty;
    uint32 participantCount;
    uint32 printCount;
    uint64 lastOkAt;
    uint64 updatedAt;
    uint256 roundId;
    uint256 deliveredCU;
    uint256 defaultedCU;
}

struct Dispute {
    uint64 rulingDeadline;
    bool open;
    bool ruled;
}
