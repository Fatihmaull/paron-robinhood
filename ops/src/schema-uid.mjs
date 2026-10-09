/** EAS schema uid = keccak256(abi.encodePacked(schema, resolver, revocable)). Resolver is address(0), revocable is true. */

const UID = {
  "ParticipantVerified(bytes32 entityId,uint8 role,bytes2 country,uint64 expiry)":
    "0x58aa312e14d11b14c0739620c263f5785c00d6a6bb4f5bcc7a1a76ab4a67eee9",
  "KybApplication(bytes32 entityId,uint8 role,bytes2 country,bytes32 dataHash)":
    "0xe1590b17b6320150804a7e1e13e6828f01146fc7cf18bb234aa546c2db2b577d",
};

export function schemaUid(schema) {
  const uid = UID[schema];
  if (!uid) throw new Error("Unknown EAS schema. Nothing was sent.");
  return uid;
}
