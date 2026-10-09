// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {IParticipantGate} from "../interfaces/IParticipantGate.sol";
import {IProviderRegistryView, IProviderRegistryWrite} from "../interfaces/IWiring.sol";
import {ParonConstants} from "../libraries/ParonConstants.sol";
import {Provider, ProviderStatus} from "../libraries/ParonTypes.sol";

contract ProviderRegistry is IProviderRegistryView, IProviderRegistryWrite, AccessControl {
    bytes32 public constant ADMIN_ROLE = ParonConstants.ADMIN_ROLE;

    IParticipantGate public gate;
    address public immutable redemptionManager;

    mapping(address provider => Provider) private _providers;

    error ZeroAddress();
    error NotVerified();
    error NotProviderRole();
    error AlreadyRegistered();
    error UnknownProvider(address provider);
    error OnlyRedemptionManager();

    event ProviderRegistered(address indexed provider, bytes32 indexed entityId);
    event ProviderStatusChanged(address indexed provider, ProviderStatus oldStatus, ProviderStatus newStatus);
    event ReputationUpdated(
        address indexed provider,
        uint256 deliveredCU,
        uint256 defaultedCU,
        uint256 voluntaryDefaultedCU,
        uint32 disputesLost,
        uint32 strikes
    );
    event GateUpdated(address indexed oldGate, address indexed newGate);

    constructor(address gate_, address redemptionManager_, address admin) {
        if (gate_ == address(0) || redemptionManager_ == address(0) || admin == address(0)) revert ZeroAddress();
        gate = IParticipantGate(gate_);
        redemptionManager = redemptionManager_;
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ADMIN_ROLE, admin);
    }

    function registerProvider() external {
        if (!gate.isVerified(msg.sender)) revert NotVerified();
        (bytes32 entityId_, uint8 role,,) = gate.participantOf(msg.sender);
        if (role != ParonConstants.ROLE_PROVIDER) revert NotProviderRole();
        if (_providers[msg.sender].status != ProviderStatus.None) revert AlreadyRegistered();

        bytes32 uid = _attestationUid(msg.sender);
        _providers[msg.sender].status = ProviderStatus.Active;
        _providers[msg.sender].entityId = entityId_;
        _providers[msg.sender].attestationUid = uid;
        emit ProviderRegistered(msg.sender, entityId_);
    }

    function setStatus(address provider, ProviderStatus status) external onlyRole(ADMIN_ROLE) {
        if (_providers[provider].status == ProviderStatus.None) revert UnknownProvider(provider);
        if (status == ProviderStatus.None) revert UnknownProvider(provider);
        ProviderStatus old = _providers[provider].status;
        _providers[provider].status = status;
        emit ProviderStatusChanged(provider, old, status);
    }

    function setGate(address gate_) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (gate_ == address(0)) revert ZeroAddress();
        address old = address(gate);
        gate = IParticipantGate(gate_);
        emit GateUpdated(old, gate_);
    }

    function recordDelivered(address provider, uint256 cu) external {
        Provider storage p = _onlyKnown(provider);
        p.deliveredCU += cu;
        _emitReputation(provider, p);
    }

    function recordDefault(address provider, uint256 cu, bool voluntary) external {
        Provider storage p = _onlyKnown(provider);
        if (voluntary) p.voluntaryDefaultedCU += cu;
        else {
            p.defaultedCU += cu;
            p.strikes += 1;
        }
        _emitReputation(provider, p);
    }

    function recordDisputeLost(address provider) external {
        Provider storage p = _onlyKnown(provider);
        p.disputesLost += 1;
        _emitReputation(provider, p);
    }

    function isListable(address provider) external view returns (bool) {
        if (_providers[provider].status != ProviderStatus.Active) return false;
        if (!gate.isVerified(provider)) return false;
        (, uint8 role,,) = gate.participantOf(provider);
        return role == ParonConstants.ROLE_PROVIDER;
    }

    function getProvider(address provider) external view returns (Provider memory) {
        return _providers[provider];
    }

    function entityIdOf(address provider) external view returns (bytes32) {
        return _providers[provider].entityId;
    }

    function _onlyKnown(address provider) private view returns (Provider storage p) {
        if (msg.sender != redemptionManager) revert OnlyRedemptionManager();
        p = _providers[provider];
        if (p.status == ProviderStatus.None) revert UnknownProvider(provider);
    }

    function _emitReputation(address provider, Provider storage p) private {
        emit ReputationUpdated(provider, p.deliveredCU, p.defaultedCU, p.voluntaryDefaultedCU, p.disputesLost, p.strikes);
    }

    function _attestationUid(address account) private view returns (bytes32) {
        (bool ok, bytes memory data) = address(gate).staticcall(abi.encodeWithSignature("uidOf(address)", account));
        if (!ok || data.length < 32) return bytes32(0);
        return abi.decode(data, (bytes32));
    }
}
