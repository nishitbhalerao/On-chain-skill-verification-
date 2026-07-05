import * as StellarSdk from '@stellar/stellar-sdk'

const CONTRACT_ID = import.meta.env.VITE_CONTRACT_ID
const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET_PASSPHRASE
const HORIZON_URL = 'https://horizon-testnet.stellar.org'

const server = new StellarSdk.Horizon.Server(HORIZON_URL)

export const stellarService = {
  getProfileFromContract: async (walletAddress) => {
    try {
      // This is a read-only call to the Soroban contract
      // In production, use the Soroban RPC endpoint
      console.log('Fetching profile from contract for:', walletAddress)
      return null // Would be replaced with actual contract call
    } catch (error) {
      console.error('Failed to fetch profile from contract:', error)
      throw error
    }
  },

  getScoreFromContract: async (walletAddress) => {
    try {
      console.log('Fetching score from contract for:', walletAddress)
      return null // Would be replaced with actual contract call
    } catch (error) {
      console.error('Failed to fetch score from contract:', error)
      throw error
    }
  },

  submitProofToChain: async (
    signTransaction,
    walletAddress,
    proofHash,
    proofType,
    scoreDelta
  ) => {
    try {
      // Build transaction to submit proof to Soroban contract
      console.log('Submitting proof to chain:', {
        walletAddress,
        proofHash,
        proofType,
        scoreDelta,
      })
      return null // Would be replaced with actual contract call
    } catch (error) {
      console.error('Failed to submit proof to chain:', error)
      throw error
    }
  },

  buildAndSignTransaction: async (operations, signTransaction) => {
    try {
      const sourceAccount = await server.loadAccount(
        import.meta.env.VITE_STELLAR_PUBLIC_KEY
      )
      
      const txBuilder = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: NETWORK_PASSPHRASE,
      })

      operations.forEach(op => {
        txBuilder.addOperation(op)
      })

      const transaction = txBuilder.setTimeout(30).build()
      return await signTransaction(transaction.toEnvelope().toXDR())
    } catch (error) {
      console.error('Failed to build and sign transaction:', error)
      throw error
    }
  },
}

export default stellarService
