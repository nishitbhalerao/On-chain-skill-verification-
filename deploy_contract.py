#!/usr/bin/env python3
"""
OpenSkills Oracle - Stellar Soroban Contract Deployment Script
Deploy the skill_oracle contract to Stellar testnet
"""

import json
import os
import sys
from pathlib import Path

try:
    from stellar_sdk import (
        Keypair,
        Network,
        Server,
        TransactionBuilder,
        UploadBytesOp,
        CreateContractOp,
        Address,
    )
except ImportError:
    print("ERROR: stellar-sdk not installed")
    print("Install with: pip install py-stellar-base")
    sys.exit(1)


def load_contract_wasm():
    """Load the compiled WASM contract"""
    wasm_path = Path("contracts/skill_oracle/target/wasm32-unknown-unknown/release/skill_oracle.wasm")
    
    if not wasm_path.exists():
        print(f"ERROR: WASM file not found at {wasm_path}")
        print("Build first with: cd contracts/skill_oracle && cargo build --target wasm32-unknown-unknown --release")
        return None
    
    with open(wasm_path, "rb") as f:
        return f.read()


def deploy_contract(secret_key: str):
    """Deploy contract to Stellar testnet"""
    
    print("🚀 OpenSkills Oracle - Contract Deployment")
    print("=" * 50)
    print()
    
    # Load WASM
    print("📦 Loading contract WASM...")
    wasm_data = load_contract_wasm()
    if not wasm_data:
        return None
    
    print(f"✓ Contract loaded: {len(wasm_data)} bytes")
    print()
    
    # Setup Stellar connection
    print("🌐 Connecting to Stellar testnet...")
    network = Network.testnet_network()
    server = Server("https://horizon-testnet.stellar.org")
    
    keypair = Keypair.from_secret(secret_key)
    source_account = server.load_account(keypair.public_key)
    
    print(f"✓ Connected as: {keypair.public_key}")
    print()
    
    # Build transaction to upload contract
    print("📝 Building deployment transaction...")
    
    # Note: The exact implementation depends on Soroban SDK updates
    # This is a reference implementation
    
    print()
    print("=" * 50)
    print("📋 Deployment Instructions")
    print("=" * 50)
    print()
    print("To deploy using Stellar CLI:")
    print()
    print("1. Build the contract:")
    print("   cd contracts/skill_oracle")
    print("   cargo build --target wasm32-unknown-unknown --release")
    print()
    print("2. Deploy to testnet:")
    print("   stellar contract deploy \\")
    print("     --wasm target/wasm32-unknown-unknown/release/skill_oracle.wasm \\")
    print("     --source <ACCOUNT_NAME> \\")
    print("     --network testnet")
    print()
    print("3. Initialize the contract:")
    print("   stellar contract invoke \\")
    print("     --id <CONTRACT_ID> \\")
    print("     --source <ACCOUNT_NAME> \\")
    print("     --network testnet \\")
    print("     -- initialize \\")
    print("     --admin <ADMIN_ADDRESS>")
    print()
    
    return None


def main():
    """Main deployment function"""
    
    # Get secret key from environment or argument
    secret_key = os.getenv("STELLAR_SECRET_KEY")
    
    if not secret_key and len(sys.argv) > 1:
        secret_key = sys.argv[1]
    
    if not secret_key:
        print("ERROR: Stellar secret key not provided")
        print()
        print("Usage:")
        print("  python deploy_contract.py <SECRET_KEY>")
        print()
        print("Or set environment variable:")
        print("  export STELLAR_SECRET_KEY=<YOUR_SECRET_KEY>")
        print()
        print("Get a testnet account at: https://developers.stellar.org/docs/learn/fundamentals/testnet")
        print("Fund it with: https://stellar.expert/testnet/friendbot")
        sys.exit(1)
    
    try:
        deploy_contract(secret_key)
    except Exception as e:
        print(f"ERROR: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
