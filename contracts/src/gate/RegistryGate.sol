// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {IParticipantGate} from "../interfaces/IParticipantGate.sol";
import {ParonConstants} from "../libraries/ParonConstants.sol";

contract RegistryGate is IParticipantGate, AccessControl {
    bytes32 public constant VERIFIER_ROLE = ParonConstants.VERIFIER_ROLE;

    struct Participant {
        bytes32 entityId;
        uint8 role;
        bytes2 country;
        uint64 expiry;
        bool exists;
    }

    mapping(address account => Participant) private _participants;

    error NotVerified();
    error ZeroEntity();
    error ZeroAddress();

    event ParticipantSet(address indexed account, bytes32 indexed entityId, uint8 role, bytes2 country, uint64 expiry);
    event ParticipantRevoked(address indexed account);

    constructor(address admin) {
        if (admin == address(0)) revert ZeroAddress();
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(VERIFIER_ROLE, admin);
    }

    function setParticipant(address account, bytes32 entityId_, uint8 role, bytes2 country, uint64 expiry)
        external
        onlyRole(VERIFIER_ROLE)
    {
        if (account == address(0)) revert ZeroAddress();
        if (entityId_ == bytes32(0)) revert ZeroEntity();
        _participants[account] = Participant({
            entityId: entityId_, role: role, country: country, expiry: expiry, exists: true
        });
        emit ParticipantSet(account, entityId_, role, country, expiry);
    }

    function revokeParticipant(address account) external onlyRole(VERIFIER_ROLE) {
        if (!_participants[account].exists) revert NotVerified();
        delete _participants[account];
        emit ParticipantRevoked(account);
    }

    function isVerified(address account) public view returns (bool) {
        Participant memory p = _participants[account];
        return p.exists && p.entityId != bytes32(0) && p.expiry > block.timestamp;
    }

    function entityId(address account) external view returns (bytes32) {
        return isVerified(account) ? _participants[account].entityId : bytes32(0);
    }

    function participantOf(address account)
        external
        view
        returns (bytes32 entityId_, uint8 role, bytes2 country, uint64 expiry)
    {
        Participant memory p = _participants[account];
        if (!p.exists) return (bytes32(0), 0, bytes2(0), 0);
        return (p.entityId, p.role, p.country, p.expiry);
    }
}
