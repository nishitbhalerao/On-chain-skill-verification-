import * as StellarSdk from '@stellar/stellar-sdk'

const CONTRACT_ID = import.meta.env.VITE_CONTRACT_ID
const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET_PASSPHRASE
const HORIZON_URL = 'https://horizon-testnet.stellar.org'
const SOROBAN_RPC_URL = import.meta.env.VITE_SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org'

const server = new StellarSdk.Horizon.Server(HORIZON_URL)

export const stellarService = {
  /**
   * Read profile from Soroban contract
   * Calls: get_profile(wallet: Address) -> SkillProfile
   */
  getProfileFromContract: async (walletAddress) => {
    try {
      if (!CONTRACT_ID) {
        console.warn('CONTRACT_ID not set, cannot fetch from chain')
        return null
      }

      // Build Soroban RPC read-only call to get_profile function
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
              [new StellarSdk.xdr.ScVal.scvAddress(
                new StellarSdk.xdr.SCAddress.scAddressTypeAccount(
                  StellarSdk.Keypair.fromPublicKey(walletAddress).xdrAccountId()
                )
              )]
            ),
            resourceLeeway: 10,
          },
        }),
      })

      const result = await response.json()
      
      if (result.result?.retval) {
        // Parse result - would need custom deserializer based on SkillProfile struct
        console.log('Profile fetched from contract:', result.result.retval)
        return result.result.retval
      }
      return null
    } catch (error) {
      console.error('Failed to fetch profile from contract:', error)
      return null
    }
  },

  /**
   * Read score from Soroban contract (more efficient)
   * Calls: get_score(wallet: Address) -> u32
   */
  getScoreFromContract: async (walletAddress) => {
    try {
      if (!CONTRACT_ID) {
        console.warn('CONTRACT_ID not set, cannot fetch score from chain')
        return null
      }

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
              'get_score',
              [new StellarSdk.xdr.ScVal.scvAddress(
                new StellarSdk.xdr.SCAddress.scAddressTypeAccount(
                  StellarSdk.Keypair.fromPublicKey(walletAddress).xdrAccountId()
                )
              )]
            ),
            resourceLeeway: 10,
          },
        }),
      })

      const result = await response.json()
      
      if (result.result?.retval) {
        // Parse u32 from XDR result
        const scoreValue = result.result.retval.u32?.value || 0
        return scoreValue
      }
      return 0
    } catch (error) {
      console.error('Failed to fetch score from contract:', error)
      return 0
    }
  },

  /**
   * Submit proof to Soroban contract (write operation)
   * Calls: submit_proof(wallet, proof_hash, proof_type, score_delta)
   */
  submitProofToChain: async (
    signTransaction,
    walletAddress,
    proofHash,
    proofType,
    scoreDelta
  ) => {
    try {
      if (!CONTRACT_ID) {
        console.warn('CONTRACT_ID not set, cannot submit to chain')
        return { tx_id: null, status: 'error', message: 'Contract ID not configured' }
      }

      // Build write transaction for submit_proof
      const tx = new StellarSdk.TransactionBuilder(
        await server.loadAccount(walletAddress),
        {
          fee: StellarSdk.BASE_FEE,
          networkPassphrase: NETWORK_PASSPHRASE,
        }
      )
        .setTimeout(30)
        .build()

      // Add contract invocation operation
      const invoked = new StellarSdk.TransactionBuilder(
        await server.loadAccount(walletAddress),
        {
          fee: StellarSdk.BASE_FEE,
          networkPassphrase: NETWORK_PASSPHRASE,
        }
      )
        .addOperation(
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
        .setTimeout(30)
        .build()

      // Sign with user's wallet
      const signedTx = await signTransaction(invoked.toEnvelope().toXDR('base64'))

      // Submit to network
      const response = await server.submitTransaction(
        new StellarSdk.TransactionBuilder.fromXDR(signedTx, NETWORK_PASSPHRASE)
      )

      return {
        tx_id: response.id,
        status: 'submitted',
        message: 'Proof submitted to blockchain',
      }
    } catch (error) {
      console.error('Failed to submit proof to chain:', error)
      return {
        tx_id: null,
        status: 'error',
        message: error.message || 'Failed to submit proof',
      }
    }
  },

  /**
   * Helper to build read-only contract invocation
   */
  buildReadOnlyTransaction: (contractId, functionName, args) => {
    // Implementation for building read-only Soroban transaction
    // This is a simplified version - full implementation needs XDR encoding
    return null
  },
}

/**
 * Build read-only Soroban transaction
 */
function buildReadOnlyTransaction(contractId, functionName, args) {
  try {
    const txn = new StellarSdk.TransactionBuilder(
      new StellarSdk.Account('GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABSC4', 0),
      {
        fee: '0',
        networkPassphrase: NETWORK_PASSPHRASE,
      }
    )
      .addOperation(
        StellarSdk.Operation.invokeHostFunction({
          func: StellarSdk.xdr.HostFunction.hostFunctionTypeInvokeContract([
            new StellarSdk.xdr.ScVal.scvAddress(
              new StellarSdk.xdr.SCAddress.scAddressTypeContract(
                StellarSdk.StrKey.decodeContract(contractId)
              )
            ),
            new StellarSdk.xdr.ScVal.scvSymbol(Buffer.from(functionName)),
            new StellarSdk.xdr.ScVal.scvVec(args || []),
          ]),
        })
      )
      .setTimeout(0)
      .build()

    return txn.toEnvelope().toXDR('base64')
  } catch (error) {
    console.error('Failed to build read-only transaction:', error)
    return null
  }
}

export default stellarService
