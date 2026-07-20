#!/bin/bash

# OpenSkills Oracle - Soroban Contract Deployment Script
# Deploy the skill_oracle contract to Stellar testnet

set -e

echo "=== OpenSkills Oracle Contract Deployment ==="
echo ""

# Check for required tools
if ! command -v cargo &> /dev/null; then
    echo "ERROR: cargo not found"
    echo "Install Rust from https://rustup.rs/"
    exit 1
fi

if ! command -v stellar &> /dev/null; then
    echo "ERROR: stellar-cli not found"
    echo "Install from https://github.com/stellar/stellar-cli"
    exit 1
fi

# Step 1: Build contract
echo "Step 1: Building contract..."
cd contracts/skill_oracle
cargo build --target wasm32-unknown-unknown --release

if [ ! -f "target/wasm32-unknown-unknown/release/skill_oracle.wasm" ]; then
    echo "ERROR: Build failed"
    exit 1
fi

echo "✓ Contract built successfully"
WASM_PATH="target/wasm32-unknown-unknown/release/skill_oracle.wasm"
WASM_SIZE=$(stat -f%z "$WASM_PATH" 2>/dev/null || stat -c%s "$WASM_PATH")
echo "  Size: $((WASM_SIZE / 1024)) KB"
echo ""

# Step 2: Deploy to testnet
echo "Step 2: Deploying to Stellar testnet..."
echo "Network: TESTNET_NETWORK_PASSPHRASE"
echo ""

# Create .env for contract (if needed)
if [ ! -f ".env" ]; then
    echo "STELLAR_NETWORK=testnet" > .env
    echo "HORIZON_URL=https://horizon-testnet.stellar.org" >> .env
fi

# Deploy
echo "Deploying contract..."
DEPLOY_OUTPUT=$(stellar contract deploy \
    --wasm "$WASM_PATH" \
    --source deployer \
    --network testnet 2>&1 || true)

if echo "$DEPLOY_OUTPUT" | grep -q "error\|Error"; then
    echo "❌ Deployment failed:"
    echo "$DEPLOY_OUTPUT"
    echo ""
    echo "Make sure:"
    echo "  1. You have a funded testnet account"
    echo "  2. Account name 'deployer' is configured in Stellar CLI"
    echo "  3. Use Friendbot to fund: https://stellar.expert/testnet/friendbot"
    exit 1
fi

# Extract contract ID
CONTRACT_ID=$(echo "$DEPLOY_OUTPUT" | grep -oP 'C[A-Z0-9]{55}' | head -1)

if [ -z "$CONTRACT_ID" ]; then
    echo "Could not extract contract ID from deployment output"
    echo "Full output: $DEPLOY_OUTPUT"
    exit 1
fi

echo "✓ Contract deployed!"
echo "  Contract ID: $CONTRACT_ID"
echo ""

# Step 3: Initialize contract
echo "Step 3: Initializing contract..."
echo ""

read -p "Enter admin wallet address (or press Enter to skip): " ADMIN_ADDRESS

if [ ! -z "$ADMIN_ADDRESS" ]; then
    stellar contract invoke \
        --id "$CONTRACT_ID" \
        --source deployer \
        --network testnet \
        -- initialize \
        --admin "$ADMIN_ADDRESS"
    
    echo "✓ Contract initialized!"
fi

echo ""
echo "=== Deployment Complete ==="
echo "Contract ID: $CONTRACT_ID"
echo ""
echo "Add to your .env:"
echo "  VITE_CONTRACT_ID=$CONTRACT_ID"
echo "  STELLAR_NETWORK=TESTNET_NETWORK_PASSPHRASE"
echo ""
