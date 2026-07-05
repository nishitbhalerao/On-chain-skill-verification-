import freighter from '@stellar/freighter-api'

export const walletService = {
  isConnected: async () => {
    return await freighter.isConnected()
  },

  requestAccess: async () => {
    return await freighter.requestAccess()
  },

  getPublicKey: async () => {
    return await freighter.getPublicKey()
  },

  getNetwork: async () => {
    return await freighter.getNetwork()
  },

  signTransaction: async (transaction, options = {}) => {
    const defaultOptions = {
      network: options.network || 'testnet',
      networkPassphrase: options.networkPassphrase || 
        'Test SDF Network ; September 2015',
    }
    return await freighter.signTransaction(transaction, defaultOptions)
  },

  signMessage: async (message) => {
    return await freighter.signMessage(message)
  },
}

export default walletService
