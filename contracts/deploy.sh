#!/bin/bash

# OpenSkills Oracle - Soroban Contract Deployment Script
# This script builds and deploys the skill_oracle contract to Stellar testnet

set -e

echo "=== OpenSkills Oracle Contract Deployment ==="
echo ""

# Check for required tools
if ! command -v cargo &> /dev/null; then
    echo "ERROR: cargo not found. Please install Rust from https://rustup.rs/"
    exit 1
fi

if ! command -v stellar &> /dev/null; then
    echo "ERROR: stellar-cli not found. Please install from https://github.com/stellar/stellar-cli"
    exit 1
fi

# Build contract
echo "Building contract..."
cd contracts/skill_oracle
cargo build --target wasm32-unknown-unknown --release

if [ ! -f "target/wasm32-unknown-unknown/release/skill_oracle.wasm" ]; then
    echo "ERROR: Build failed"
    exit 1
fi

echo "✓ Contract built successfully"
echo ""

# Deploy to testnet
echo "Deploying to Stellar testnet..."
echo "Network: testnet"
echo "This requires a funded testnet account"
echo ""

# Note: The actual deployment command would be:
# stellar contract deploy --wasm target/wasm32-unknown-unknown/release/skill_oracle.wasm \
#   --source oracle-admin \
#   --network testnet

echo "To deploy, run:"
echo ""
echo "stellar contract deploy \\"
echo "  --wasm target/wasm32-unknown-unknown/release/skill_oracle.wasm \\"
echo "  --source oracle-admin \\"
echo "  --network testnet"
echo ""
echo "Then to initialize:"
echo ""
echo "stellar contract invoke \\"
echo "  --id <CONTRACT_ID> \\"
echo "  --source oracle-admin \\"
echo "  --network testnet \\"
echo "  -- initialize \\"
echo "  --admin <ORACLE_ADMIN_ADDRESS>"
echo ""
