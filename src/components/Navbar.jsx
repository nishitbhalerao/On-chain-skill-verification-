import React from 'react'
import { Link } from 'react-router-dom'
import { useWallet } from '../context/WalletContext'
import { Link2, LogOut } from 'lucide-react'

export default function Navbar() {
  const { wallet, connectWallet, disconnectWallet } = useWallet()

  const truncateAddress = (address) => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const handleWalletClick = async () => {
    if (wallet.isConnected) {
      disconnectWallet()
    } else {
      try {
        const result = await connectWallet()
        if (result) {
          console.log('Wallet connected successfully:', result)
        }
      } catch (error) {
        console.error('Failed to connect wallet:', error)
        // Still show as connected for demo mode
        alert('Connected in Demo Mode\n\nWallet Address:\nGBRPYHIL2CI3WHZDTOOQFC6EB4KJJGUJWVVF4LTGZCVYK5JSXNL63A3\n\nNote: Install Freighter browser extension for real wallet connection.')
      }
    }
  }

  return (
    <nav className="fixed top-0 w-full z-50 glass-card border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-smooth">
            <Link2 className="w-6 h-6 text-stellar-purple" />
            <span className="text-xl font-bold text-white hidden sm:inline">
              OpenSkills Oracle
            </span>
            <span className="text-lg font-bold text-white sm:hidden">
              OSO
            </span>
          </Link>

          <div className="hidden md:flex space-x-6">
            <Link to="/" className="hover:text-stellar-purple transition-smooth">
              Home
            </Link>
            <Link to="/profile" className="hover:text-stellar-purple transition-smooth">
              My Profile
            </Link>
            <Link to="/verify" className="hover:text-stellar-purple transition-smooth">
              Verify Skills
            </Link>
          </div>

          <button
            onClick={handleWalletClick}
            className={`px-4 py-2 rounded-lg font-medium transition-smooth flex items-center space-x-2 ${
              wallet.isConnected
                ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                : 'bg-gradient-to-r from-stellar-purple to-purple-600 text-white hover:opacity-90'
            }`}
            title={!wallet.isFreighterInstalled && !wallet.isConnected ? 'Click to connect in demo mode or install Freighter' : ''}
          >
            {wallet.isConnected ? (
              <>
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">{truncateAddress(wallet.publicKey)}</span>
                <span className="sm:hidden">Disconnect</span>
                {!wallet.isFreighterInstalled && <span className="text-xs ml-1">(Demo)</span>}
              </>
            ) : (
              <>
                <Link2 className="w-4 h-4" />
                <span>Connect Wallet</span>
              </>
            )}
          </button>
        </div>
      </div>
    </nav>
  )
}
