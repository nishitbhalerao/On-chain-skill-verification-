import * as StellarSdk from '@stellar/stellar-sdk'

const STELLAR_NETWORK = process.env.STELLAR_NETWORK || 'testnet'
const HORIZON_URL = process.env.STELLAR_HORIZON_URL || 'https://horizon-testnet.stellar.org'
const SOROBAN_RPC_URL = process.env.SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org'
const CONTRACT_ID = process.env.CONTRACT_ID
const ORACLE_SECRET_KEY = process.env.ORACLE_SECRET_KEY

const server = new StellarSdk.Horizon.Server(HORIZON_URL)
const networkPassphrase = STELLAR_NETWORK === 'testnet' 
  ? StellarSdk.Networks.TESTNET_PASSPHRASE
  : StellarSdk.Networks.PUBLIC_PASSPHRASE

export const blockchainService = {
  /**
   * Submit proof to Soroban smart contract
   * Invokes: submit_proof(wallet, proof_hash, proof_type, score_delta)
   */
  async submitProofToContract(
    walletAddress,
    proofHash,
    proofType,
    scoreDelta
  ) {
    if (!CONTRACT_ID || !ORACLE_SECRET_KEY) {
      console.warn('Soroban contract not configured, skipping on-chain submission')
      return {
        tx_id: null,
        status: 'pending',
        message: 'Soroban contract not configured',
      }
    }

    try {
      const oracleKeypair = StellarSdk.Keypair.fromSecret(ORACLE_SECRET_KEY)
      const oracleAccount = await server.loadAccount(oracleKeypair.publicKey())

      // Build contract invocation transaction
      const txBuilder = new StellarSdk.TransactionBuilder(oracleAccount, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: networkPassphrase,
      })

      // Add invoke contract operation for submit_proof
      txBuilder.addOperation(
        StellarSdk.Operation.invokeHostFunction({
          func: StellarSdk.xdr.HostFunction.hostFunctionTypeInvokeContract([
            new StellarSdk.xdr.ScVal.scvAddress(
              new StellarSdk.xdr.SCAddress.scAddressTypeContract(
                StellarSdk.StrKey.decodeContract(CONTRACT_ID)
              )
            ),
            new StellarSdk.xdr.ScVal.scvSymbol(Buffer.from('submit_proof')),
            new StellarSdk.xdr.ScVal.scvVec([
              new StellarSdk.xdr.ScVal.scvAddress(
                new StellarSdk.xdr.SCAddress.scAddressTypeAccount(
                  StellarSdk.Keypair.fromPublicKey(walletAddress).xdrAccountId()
                )
              ),
              new StellarSdk.xdr.ScVal.scvString(Buffer.from(proofHash)),
              new StellarSdk.xdr.ScVal.scvU32(proofType),
              new StellarSdk.xdr.ScVal.scvU32(scoreDelta),
            ]),
          ]),
        })
      )

      // Build and sign transaction
      const tx = txBuilder.setTimeout(30).build()
      tx.sign(oracleKeypair)

      // Submit to network
      const response = await server.submitTransaction(tx)

      return {
        tx_id: response.id,
        status: 'submitted',
        message: 'Proof submitted to blockchain (pending confirmation)',
        confirmations: 0,
      }
    } catch (error) {
      console.error('Failed to submit proof to contract:', error)
      return {
        tx_id: null,
        status: 'error',
        message: error.message || 'Failed to submit proof to blockchain',
      }
    }
  },

  /**
   * Read profile from Soroban contract
   */
  async getProfileFromContract(walletAddress) {
    if (!CONTRACT_ID) {
      console.warn('Soroban contract not configured')
      return null
    }

    try {
      const response = await fetch(SOROBAN_RPC_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'simulateTransaction',
          params: {
            transaction: buildReadOnlyTransaction(
              CONTRACT_ID,
              'get_profile',
              walletAddress,
              networkPassphrase
            ),
            resourceLeeway: 10,
          },
        }),
      })

      const result = await response.json()
      if (result.result?.retval) {
        return result.result.retval
      }
      return null
    } catch (error) {
      console.error('Failed to read profile from contract:', error)
      return null
    }
  },

  /**
   * Get Stellar account balance
   */
  async getAccountBalance(publicKey) {
    try {
      const account = await server.loadAccount(publicKey)
      return account.balances
    } catch (error) {
      console.error('Failed to get account balance:', error)
      return null
    }
  },

  /**
   * Verify if wallet exists on network and validate address format
   */
  async isValidWallet(publicKey) {
    try {
      // Validate Stellar address format
      if (!publicKey || !/^G[A-Z2-7]{55}$/.test(publicKey)) {
        return false
      }
      
      await server.loadAccount(publicKey)
      return true
    } catch (error) {
      if (error.status === 404) {
        return false
      }
      throw error
    }
  },
}

/**
 * Helper to build read-only Soroban transaction
 */
function buildReadOnlyTransaction(contractId, functionName, walletAddress, passphrase) {
  try {
    const txBuilder = new StellarSdk.TransactionBuilder(
      new StellarSdk.Account('GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABSC4', 0),
      {
        fee: '0',
        networkPassphrase: passphrase,
      }
    )

    txBuilder.addOperation(
      StellarSdk.Operation.invokeHostFunction({
        func: StellarSdk.xdr.HostFunction.hostFunctionTypeInvokeContract([
          new StellarSdk.xdr.ScVal.scvAddress(
            new StellarSdk.xdr.SCAddress.scAddressTypeContract(
              StellarSdk.StrKey.decodeContract(contractId)
            )
          ),
          new StellarSdk.xdr.ScVal.scvSymbol(Buffer.from(functionName)),
          new StellarSdk.xdr.ScVal.scvVec([
            new StellarSdk.xdr.ScVal.scvAddress(
              new StellarSdk.xdr.SCAddress.scAddressTypeAccount(
                StellarSdk.Keypair.fromPublicKey(walletAddress).xdrAccountId()
              )
            ),
          ]),
        ]),
      })
    )

    const tx = txBuilder.setTimeout(0).build()
    return tx.toEnvelope().toXDR('base64')
  } catch (error) {
    console.error('Failed to build read-only transaction:', error)
    return null
  }
}

export default blockchainService
