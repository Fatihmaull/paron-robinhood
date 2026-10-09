// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {SignatureChecker} from "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import {IArbitrator, IRedemptionCallbacks} from "../interfaces/IArbitrator.sol";
import {Dispute, Ruling} from "../libraries/ParonTypes.sol";

contract PanelArbitrator is IArbitrator, AccessControl, EIP712 {
    bytes32 private constant RULING_TYPEHASH =
        keccak256("Ruling(uint256 reqId,uint8 outcome,uint64 rulingDeadline)");

    IRedemptionCallbacks public immutable redemptionManager;
    address[] private _members;
    uint8 public threshold;

    mapping(uint256 reqId => Dispute) private _disputes;
    mapping(uint256 reqId => address[]) private _snapshot;
    mapping(uint256 reqId => uint8) private _snapshotThreshold;

    error ZeroAddress();
    error OnlyRedemptionManager();
    error InvalidThreshold();
    error UnknownDispute(uint256 reqId);
    error DisputeAlreadyOpen(uint256 reqId);
    error AlreadyRuled(uint256 reqId);
    error RulingDeadlinePassed();
    error NotPanelMember();
    error InvalidSignature();
    error DuplicateSigner(address signer);
    error InsufficientSignatures(uint256 got, uint256 need);

    event PanelUpdated(address[] members, uint8 threshold);
    event DisputeReceived(uint256 indexed reqId, uint64 rulingDeadline);
    event RulingSubmitted(uint256 indexed reqId, Ruling ruling, address[] signers);

    constructor(address[] memory members_, uint8 threshold_, address redemptionManager_, address admin)
        EIP712("Paron", "1")
    {
        if (redemptionManager_ == address(0) || admin == address(0)) revert ZeroAddress();
        redemptionManager = IRedemptionCallbacks(redemptionManager_);
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _setPanel(members_, threshold_);
    }

    function onDisputeOpened(uint256 reqId, uint64 rulingDeadline) external {
        if (msg.sender != address(redemptionManager)) revert OnlyRedemptionManager();
        if (_disputes[reqId].open) revert DisputeAlreadyOpen(reqId);
        _disputes[reqId] = Dispute({rulingDeadline: rulingDeadline, open: true, ruled: false});
        _snapshotThreshold[reqId] = threshold;
        for (uint256 i; i < _members.length; ++i) {
            _snapshot[reqId].push(_members[i]);
        }
        emit DisputeReceived(reqId, rulingDeadline);
    }

    function rule(uint256 reqId, Ruling outcome) external {
        Dispute storage d = _open(reqId);
        if (_snapshotThreshold[reqId] != 1 || !_isMember(reqId, msg.sender)) revert NotPanelMember();
        address[] memory signers = new address[](1);
        signers[0] = msg.sender;
        _submit(reqId, d, outcome, signers);
    }

    function ruleWithSignatures(uint256 reqId, Ruling outcome, bytes[] calldata signatures) external {
        Dispute storage d = _open(reqId);
        bytes32 digest = _hashTypedDataV4(
            keccak256(abi.encode(RULING_TYPEHASH, reqId, outcome, d.rulingDeadline))
        );
        address[] memory signers = new address[](signatures.length);
        uint256 count;
        for (uint256 i; i < signatures.length; ++i) {
            address signer = _match(reqId, digest, signatures[i]);
            if (signer == address(0)) revert InvalidSignature();
            for (uint256 j; j < count; ++j) {
                if (signers[j] == signer) revert DuplicateSigner(signer);
            }
            signers[count++] = signer;
        }
        if (count < _snapshotThreshold[reqId]) revert InsufficientSignatures(count, _snapshotThreshold[reqId]);
        assembly {
            mstore(signers, count)
        }
        _submit(reqId, d, outcome, signers);
    }

    function setPanel(address[] calldata members_, uint8 threshold_) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _setPanel(members_, threshold_);
    }

    function members() external view returns (address[] memory) {
        return _members;
    }

    function getDispute(uint256 reqId) external view returns (Dispute memory) {
        return _disputes[reqId];
    }

    function hashRuling(uint256 reqId, Ruling outcome, uint64 rulingDeadline) external view returns (bytes32) {
        return _hashTypedDataV4(keccak256(abi.encode(RULING_TYPEHASH, reqId, outcome, rulingDeadline)));
    }

    function _submit(uint256 reqId, Dispute storage d, Ruling outcome, address[] memory signers) private {
        d.ruled = true;
        d.open = false;
        emit RulingSubmitted(reqId, outcome, signers);
        redemptionManager.onRuling(reqId, outcome);
    }

    function _open(uint256 reqId) private view returns (Dispute storage d) {
        d = _disputes[reqId];
        if (!d.open && !d.ruled) revert UnknownDispute(reqId);
        if (d.ruled || !d.open) revert AlreadyRuled(reqId);
        if (block.timestamp > d.rulingDeadline) revert RulingDeadlinePassed();
    }

    function _match(uint256 reqId, bytes32 digest, bytes calldata signature) private view returns (address) {
        uint256 n = _snapshot[reqId].length;
        for (uint256 i; i < n; ++i) {
            address member = _snapshot[reqId][i];
            if (SignatureChecker.isValidSignatureNow(member, digest, signature)) return member;
        }
        return address(0);
    }

    function _isMember(uint256 reqId, address account) private view returns (bool) {
        uint256 n = _snapshot[reqId].length;
        for (uint256 i; i < n; ++i) {
            if (_snapshot[reqId][i] == account) return true;
        }
        return false;
    }

    function _setPanel(address[] memory members_, uint8 threshold_) private {
        if (members_.length == 0 || members_.length > 8 || threshold_ == 0 || threshold_ > members_.length) {
            revert InvalidThreshold();
        }
        delete _members;
        for (uint256 i; i < members_.length; ++i) {
            if (members_[i] == address(0)) revert InvalidThreshold();
            _members.push(members_[i]);
        }
        threshold = threshold_;
        emit PanelUpdated(_members, threshold_);
    }
}
