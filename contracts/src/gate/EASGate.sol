// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Attestation, IEAS} from "@ethereum-attestation-service/eas-contracts/IEAS.sol";
import {IParticipantGate} from "../interfaces/IParticipantGate.sol";

contract EASGate is IParticipantGate, AccessControl {
    IEAS public immutable eas;
    bytes32 public immutable schemaUid;

    mapping(address attester => bool) public trustedAttester;
    mapping(address account => bytes32 uid) public uidOf;

    error ZeroAddress();
    error WrongSchema();
    error UntrustedAttester(address attester);
    error AttestationRevoked();
    error AttestationExpired();
    error UnknownAttestation();
    error RecipientMismatch();
    error StaleAttestation();

    event AttesterUpdated(address indexed attester, bool trusted);
    event AttestationLinked(address indexed account, bytes32 indexed uid, bytes32 entityId);

    constructor(address eas_, bytes32 schemaUid_, address[] memory attesters, address admin) {
        if (eas_ == address(0) || admin == address(0)) revert ZeroAddress();
        eas = IEAS(eas_);
        schemaUid = schemaUid_;
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        for (uint256 i; i < attesters.length; ++i) {
            if (attesters[i] == address(0)) revert ZeroAddress();
            trustedAttester[attesters[i]] = true;
            emit AttesterUpdated(attesters[i], true);
        }
    }

    function setTrustedAttester(address attester, bool trusted) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (attester == address(0)) revert ZeroAddress();
        trustedAttester[attester] = trusted;
        emit AttesterUpdated(attester, trusted);
    }

    function linkAttestation(bytes32 uid) external {
        Attestation memory incoming = eas.getAttestation(uid);
        _validate(incoming, false);
        (bytes32 entityId_,,,) = _decode(incoming.data);

        bytes32 current = uidOf[incoming.recipient];
        if (current != bytes32(0) && current != uid) {
            Attestation memory linked = eas.getAttestation(current);
            if (_stillValid(linked) && incoming.time < linked.time) revert StaleAttestation();
        }

        uidOf[incoming.recipient] = uid;
        emit AttestationLinked(incoming.recipient, uid, entityId_);
    }

    function isVerified(address account) public view returns (bool) {
        bytes32 uid = uidOf[account];
        if (uid == bytes32(0)) return false;
        Attestation memory a = eas.getAttestation(uid);
        return _stillValid(a) && a.recipient == account;
    }

    function entityId(address account) external view returns (bytes32) {
        if (!isVerified(account)) return bytes32(0);
        (bytes32 entityId_,,,) = _decode(eas.getAttestation(uidOf[account]).data);
        return entityId_;
    }

    function participantOf(address account)
        external
        view
        returns (bytes32 entityId_, uint8 role, bytes2 country, uint64 expiry)
    {
        bytes32 uid = uidOf[account];
        if (uid == bytes32(0)) return (bytes32(0), 0, bytes2(0), 0);
        return _decode(eas.getAttestation(uid).data);
    }

    function _stillValid(Attestation memory a) internal view returns (bool) {
        if (a.uid == bytes32(0) || a.schema != schemaUid || !trustedAttester[a.attester]) return false;
        if (a.revocationTime != 0) return false;
        if (a.expirationTime != 0 && a.expirationTime <= block.timestamp) return false;
        (bytes32 entityId_,,, uint64 expiry) = _decode(a.data);
        return entityId_ != bytes32(0) && expiry > block.timestamp;
    }

    function _validate(Attestation memory a, bool) internal view {
        if (a.uid == bytes32(0)) revert UnknownAttestation();
        if (a.schema != schemaUid) revert WrongSchema();
        if (!trustedAttester[a.attester]) revert UntrustedAttester(a.attester);
        if (a.revocationTime != 0) revert AttestationRevoked();
        if (a.recipient == address(0)) revert RecipientMismatch();
        if (a.expirationTime != 0 && a.expirationTime <= block.timestamp) revert AttestationExpired();
        (bytes32 entityId_,,, uint64 expiry) = _decode(a.data);
        if (entityId_ == bytes32(0)) revert UnknownAttestation();
        if (expiry <= block.timestamp) revert AttestationExpired();
    }

    function _decode(bytes memory data)
        internal
        pure
        returns (bytes32 entityId_, uint8 role, bytes2 country, uint64 expiry)
    {
        (entityId_, role, country, expiry) = abi.decode(data, (bytes32, uint8, bytes2, uint64));
    }
}
