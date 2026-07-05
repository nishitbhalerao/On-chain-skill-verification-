import * as StellarSdk from '@stellar/stellar-sdk'

const STELLAR_NETWORK = process.env.STELLAR_NETWORK || 'testnet'
const HORIZON_URL = process.env.STELLAR_HORIZON_URL || 'https://horizon-testnet.stellar.org'
const CONTRACT_ID = process.env.CONTRACT_ID
const ORACLE_SECRET_KEY = process.env.ORACLE_SECRET_KEY

const server = new StellarSdk.Horizon.Server(HORIZON_URL)
const networkPassphrase = STELLAR_NETWORK === 'testnet' 
  ? StellarSdk.Networks.TESTNET_PASSPHRASE
  : StellarSdk.Networks.PUBLIC_PASSPHRASE

export const blockchainService = {
  /**
   * Submit proof to Soroban smart contract
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
      // In production, would call the actual Soroban contract
      // This is a placeholder for the contract interaction
      console.log('Submitting proof to Soroban contract:', {
        wallet: walletAddress,
        proof_hash: proofHash,
        proof_type: proofType,
        score_delta: scoreDelta,
      })

      return {
        tx_id: 'pending_soroban_tx_id',
        status: 'submitted',
        message: 'Proof submitted to blockchain (pending confirmation)',
      }
    } catch (error) {
      console.error('Failed to submit proof to contract:', error)
      throw error
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
      // In production, would read from Soroban contract
      console.log('Reading profile from Soroban contract for:', walletAddress)
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
   * Verify if wallet exists on network
   */
  async isValidWallet(publicKey) {
    try {
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

export default blockchainService
