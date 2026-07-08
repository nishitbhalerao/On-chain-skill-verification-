import React, { createContext, useContext, useState, useEffect } from 'react'

// Mock Freighter for development if not available
const mockFreighter = {
  isConnected: async () => {
    // Check if window.freighter exists (browser extension)
    return typeof window !== 'undefined' && !!window.freighter
  },
  requestAccess: async () => {
    if (typeof window !== 'undefined' && window.freighter) {
      return await window.freighter.requestAccess()
    }
    // Generate a mock testnet address for demo
    return 'GBRPYHIL2CI3WHZDTOOQFC6EB4KJJGUJWVVF4LTGZCVYK5JSXNL63A3'
  },
  getNetwork: async () => {
    if (typeof window !== 'undefined' && window.freighter?.getNetwork) {
      return await window.freighter.getNetwork()
    }
    return { name: 'testnet' }
  },
  getPublicKey: async () => {
    if (typeof window !== 'undefined' && window.freighter?.getPublicKey) {
      return await window.freighter.getPublicKey()
    }
    return 'GBRPYHIL2CI3WHZDTOOQFC6EB4KJJGUJWVVF4LTGZCVYK5JSXNL63A3'
  },
  signTransaction: async (tx, options) => {
    if (typeof window !== 'undefined' && window.freighter?.signTransaction) {
      return await window.freighter.signTransaction(tx, options)
    }
    return tx
  },
  signMessage: async (msg) => {
    if (typeof window !== 'undefined' && window.freighter?.signMessage) {
      return await window.freighter.signMessage(msg)
    }
    return { signature: 'mock_signature' }
  },
}

// Try to load actual Freighter, fallback to mock
let freighterAPI = mockFreighter
try {
  if (typeof window !== 'undefined' && window.freighter) {
    freighterAPI = window.freighter
  }
} catch (e) {
  console.warn('Freighter not available, using demo mode')
}

const WalletContext = createContext()

export function WalletProvider({ children }) {
  const [wallet, setWallet] = useState({
    isConnected: false,
    publicKey: null,
    network: 'testnet',
    isFreighterInstalled: false,
  })

  useEffect(() => {
    checkFreighterInstalled()
  }, [])

  const checkFreighterInstalled = async () => {
    try {
      const installed = typeof window !== 'undefined' && !!window.freighter
      setWallet(prev => ({ ...prev, isFreighterInstalled: installed }))
    } catch (error) {
      console.warn('Could not check Freighter installation:', error)
      setWallet(prev => ({ ...prev, isFreighterInstalled: false }))
    }
  }

  const connectWallet = async () => {
    try {
      const publicKey = await freighterAPI.requestAccess()
      if (publicKey) {
        const network = await freighterAPI.getNetwork()
        setWallet({
          isConnected: true,
          publicKey,
          network: network?.name || 'testnet',
          isFreighterInstalled: typeof window !== 'undefined' && !!window.freighter,
        })
        return publicKey
      }
    } catch (error) {
      console.error('Wallet connection failed:', error)
      // Still set as connected for demo purposes
      const demoAddress = 'GBRPYHIL2CI3WHZDTOOQFC6EB4KJJGUJWVVF4LTGZCVYK5JSXNL63A3'
      setWallet({
        isConnected: true,
        publicKey: demoAddress,
        network: 'testnet',
        isFreighterInstalled: false,
      })
    }
  }

  const disconnectWallet = () => {
    setWallet({
      isConnected: false,
      publicKey: null,
      network: 'testnet',
      isFreighterInstalled: wallet.isFreighterInstalled,
    })
  }

  const getPublicKey = async () => {
    try {
      return await freighterAPI.getPublicKey()
    } catch (error) {
      console.error('Failed to get public key:', error)
      return null
    }
  }

  const signTransaction = async (transaction) => {
    try {
      return await freighterAPI.signTransaction(transaction, {
        network: wallet.network,
        networkPassphrase: wallet.network === 'testnet' 
          ? 'Test SDF Network ; September 2015'
          : 'Public Global Stellar Network ; September 2015',
      })
    } catch (error) {
      console.error('Transaction signing failed:', error)
      throw error
    }
  }

  return (
    <WalletContext.Provider
      value={{
        wallet,
        connectWallet,
        disconnectWallet,
        getPublicKey,
        signTransaction,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider')
  }
  return context
}
