// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

interface IParticipantGate {
    function isVerified(address account) external view returns (bool);

    function entityId(address account) external view returns (bytes32);

    function participantOf(address account)
        external
        view
        returns (bytes32 entityId_, uint8 role, bytes2 country, uint64 expiry);
}
