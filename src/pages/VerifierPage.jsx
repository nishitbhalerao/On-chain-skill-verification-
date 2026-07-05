import React, { useState } from 'react'
import { useToast } from '../context/ToastContext'
import AnimatedBackground from '../components/AnimatedBackground'
import SkillScoreGauge from '../components/SkillScoreGauge'
import SkillBadge from '../components/SkillBadge'
import { profileAPI } from '../services/apiService'
import { CheckCircle, Loader, Search } from 'lucide-react'

export default function VerifierPage() {
  const { addToast } = useToast()
  const [walletAddress, setWalletAddress] = useState('')
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleVerify = async (e) => {
    e.preventDefault()
    
    if (!walletAddress.trim()) {
      addToast('Please enter a wallet address', 'error')
      return
    }

    try {
      setLoading(true)
      const response = await profileAPI.getProfile(walletAddress)
      setProfile(response.data)
      addToast('Profile found!', 'success')
    } catch (error) {
      console.error('Failed to verify profile:', error)
      addToast('Profile not found or not verified on-chain', 'error')
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <AnimatedBackground />
      
      <div className="relative z-10 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Verify Skills</h1>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Enter a Stellar wallet address to verify a developer's skill profile and on-chain credentials.
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleVerify} className="max-w-2xl mx-auto mb-12">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Enter Stellar wallet address..."
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-stellar-purple"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-stellar-purple to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-stellar-purple/50 transition-smooth disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Verify
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Results */}
          {profile && (
            <div className="space-y-8">
              {/* Verified Badge */}
              {profile.is_verified && (
                <div className="glass-card border-green-500/30 bg-green-500/10 rounded-xl p-6 flex items-center justify-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <div>
                    <h3 className="font-bold text-green-300">Verified on-chain</h3>
                    <p className="text-sm text-green-400/70">This profile is verified on Stellar testnet</p>
                  </div>
                </div>
              )}

              {/* Score and Details */}
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Score Gauge */}
                <div className="glass-card rounded-xl p-8">
                  <SkillScoreGauge 
                    score={profile.total_score || 0} 
                    maxScore={1000}
                  />
                </div>

                {/* Profile Info */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="glass-card rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Profile Information</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-400">Wallet Address</p>
                        <p className="text-white font-mono text-sm break-all">
                          {profile.wallet}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-400">Proofs Submitted</p>
                          <p className="text-2xl font-bold text-stellar-purple">
                            {profile.proof_count || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Last Updated</p>
                          <p className="text-white">
                            {profile.last_updated 
                              ? new Date(profile.last_updated * 1000).toLocaleDateString()
                              : 'Never'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Skill Breakdown */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">Skill Breakdown</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <SkillBadge category="github" score={profile.github_score || 0} maxScore={300} />
                  <SkillBadge category="hackathon" score={profile.hackathon_score || 0} maxScore={200} />
                  <SkillBadge category="oss" score={profile.oss_score || 0} maxScore={250} />
                  <SkillBadge category="bugbounty" score={profile.bugbounty_score || 0} maxScore={150} />
                </div>
              </div>

              {/* Share Section */}
              <div className="glass-card rounded-xl p-6 text-center">
                <p className="text-gray-400 mb-4">Share this profile link with employers:</p>
                <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white font-mono text-sm break-all">
                  {`${window.location.origin}/verify?address=${profile.wallet}`}
                </div>
              </div>
            </div>
          )}

          {!profile && !loading && walletAddress && (
            <div className="glass-card rounded-xl p-8 text-center">
              <p className="text-gray-400">No verified profile found for this address.</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
