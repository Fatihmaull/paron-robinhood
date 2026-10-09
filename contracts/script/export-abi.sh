#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
out="../shared/abi"
mkdir -p "$out"
contracts=(
  ProviderRegistry
  ConversionTable
  SeriesFactory
  CUToken
  BondVault
  PrimarySale
  OrderBook
  RedemptionManager
  PanelArbitrator
  PrintIndex
  ReferenceFeed
  MockUSDC
  EASGate
  RegistryGate
  IParticipantGate
  IArbitrator
)
for name in "${contracts[@]}"; do
  forge inspect "$name" abi --json | python3 -m json.tool > "$out/$name.json"
done
echo "exported ${#contracts[@]} ABIs to $out"
