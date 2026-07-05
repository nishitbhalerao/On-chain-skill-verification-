import React from 'react'
import { useWallet } from '../context/WalletContext'
import AnimatedBackground from '../components/AnimatedBackground'

export default function Dashboard() {
  const { wallet } = useWallet()

  return (
    <>
      <AnimatedBackground />
      
      <div className="relative z-10 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">Dashboard</h1>
          
          <div className="glass-card rounded-xl p-8">
            <p className="text-gray-400">
              {wallet.isConnected 
                ? 'Your submission history and proof records will be displayed here.'
                : 'Connect your wallet to access your dashboard.'}
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
