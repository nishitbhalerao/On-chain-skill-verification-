import React from 'react'
import { useWallet } from '../context/WalletContext'
import AnimatedBackground from '../components/AnimatedBackground'

export default function SkillReport() {
  const { wallet } = useWallet()

  return (
    <>
      <AnimatedBackground />
      
      <div className="relative z-10 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">Detailed Skill Report</h1>
          
          <div className="glass-card rounded-xl p-8">
            <p className="text-gray-400">
              {wallet.isConnected 
                ? 'Your detailed skill breakdown will be displayed here.'
                : 'Connect your wallet to view your skill report.'}
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
