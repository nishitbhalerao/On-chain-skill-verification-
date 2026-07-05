import React, { useState, useEffect } from 'react'
import { useWallet } from '../context/WalletContext'
import { useToast } from '../context/ToastContext'
import AnimatedBackground from '../components/AnimatedBackground'
import SkillScoreGauge from '../components/SkillScoreGauge'
import SkillBadge from '../components/SkillBadge'
import { profileAPI, proofAPI } from '../services/apiService'
import { Github, Trophy, Code2, Shield, Briefcase, Loader } from 'lucide-react'

const PROOF_TYPES = {
  github: 'GitHub',
  hackathon: 'Hackathon',
  oss: 'Open Source',
  bugbounty: 'Bug Bounty',
  freelance: 'Freelance',
}

export default function ProfilePage() {
  const { wallet } = useWallet()
  const { addToast } = useToast()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('github')
  const [submitting, setSubmitting] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const [formData, setFormData] = useState({
    github: { username: '' },
    hackathon: { url: '', description: '' },
    oss: { prLink: '', description: '' },
    bugbounty: { link: '', severity: 'medium' },
    freelance: { link: '', description: '' },
  })

  useEffect(() => {
    if (wallet.isConnected) {
      fetchProfile()
    } else {
      setLoading(false)
    }
  }, [wallet.isConnected])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await profileAPI.getProfile(wallet.publicKey)
      setProfile(response.data)
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      // Create profile if it doesn't exist
      try {
        const createResponse = await profileAPI.createProfile(wallet.publicKey)
        setProfile(createResponse.data)
      } catch (createError) {
        addToast('Failed to load profile', 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (type, field, value) => {
    setFormData(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value,
      },
    }))
  }

  const handleSubmitProof = async (type) => {
    try {
      setSubmitting(true)
      
      const proofData = {
        walletAddress: wallet.publicKey,
        proofType: type,
        proofData: formData[type],
      }

      const response = await proofAPI.submitProof(proofData)
      
      addToast(`${PROOF_TYPES[type]} proof submitted successfully!`, 'success')
      
      // Reset form
      setFormData(prev => ({
        ...prev,
        [type]: Object.keys(prev[type]).reduce((acc, key) => {
          acc[key] = ''
          return acc
        }, {}),
      }))

      // Refresh profile
      await refreshProfile()
    } catch (error) {
      console.error('Failed to submit proof:', error)
      addToast('Failed to submit proof', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const refreshProfile = async () => {
    try {
      setRefreshing(true)
      const response = await profileAPI.getProfile(wallet.publicKey)
      setProfile(response.data)
    } catch (error) {
      console.error('Failed to refresh profile:', error)
      addToast('Failed to refresh profile', 'error')
    } finally {
      setRefreshing(false)
    }
  }

  if (!wallet.isConnected) {
    return (
      <>
        <AnimatedBackground />
        <div className="relative z-10 min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
          <div className="glass-card rounded-2xl p-8 max-w-md text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
            <p className="text-gray-400 mb-6">
              Please connect your Freighter wallet to view and manage your skill profile.
            </p>
          </div>
        </div>
      </>
    )
  }

  if (loading) {
    return (
      <>
        <AnimatedBackground />
        <div className="relative z-10 min-h-[calc(100vh-64px)] flex items-center justify-center">
          <Loader className="w-8 h-8 text-stellar-purple animate-spin" />
        </div>
      </>
    )
  }

  return (
    <>
      <AnimatedBackground />
      
      <div className="relative z-10 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-white mb-2">Your Skill Profile</h1>
            <p className="text-gray-400">
              Wallet: {wallet.publicKey.slice(0, 10)}...{wallet.publicKey.slice(-10)}
            </p>
          </div>

          {/* Score and Skills Overview */}
          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            {/* Score Gauge */}
            <div className="glass-card rounded-xl p-8">
              <SkillScoreGauge 
                score={profile?.total_score || 0} 
                maxScore={1000}
              />
            </div>

            {/* Skill Badges */}
            <div className="lg:col-span-2 grid md:grid-cols-2 gap-4">
              <SkillBadge category="github" score={profile?.github_score || 0} maxScore={300} />
              <SkillBadge category="hackathon" score={profile?.hackathon_score || 0} maxScore={200} />
              <SkillBadge category="oss" score={profile?.oss_score || 0} maxScore={250} />
              <SkillBadge category="bugbounty" score={profile?.bugbounty_score || 0} maxScore={150} />
            </div>
          </div>

          {/* Submit Proof Section */}
          <div className="glass-card rounded-xl p-8 mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Submit Proof</h2>
              <button
                onClick={refreshProfile}
                disabled={refreshing}
                className="px-4 py-2 bg-stellar-purple/20 text-stellar-purple rounded-lg hover:bg-stellar-purple/30 transition-smooth disabled:opacity-50"
              >
                {refreshing ? 'Refreshing...' : 'Refresh Score'}
              </button>
            </div>

            {/* Tabs */}
            <div className="flex space-x-2 mb-6 overflow-x-auto">
              {Object.entries(PROOF_TYPES).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-smooth ${
                    activeTab === key
                      ? 'bg-stellar-purple text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Form Content */}
            <div className="space-y-4">
              {activeTab === 'github' && (
                <div>
                  <label className="block text-sm font-medium text-white mb-2">GitHub Username</label>
                  <input
                    type="text"
                    placeholder="octocat"
                    value={formData.github.username}
                    onChange={(e) => handleInputChange('github', 'username', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-stellar-purple"
                  />
                </div>
              )}

              {activeTab === 'hackathon' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Hackathon URL</label>
                    <input
                      type="url"
                      placeholder="https://devpost.com/..."
                      value={formData.hackathon.url}
                      onChange={(e) => handleInputChange('hackathon', 'url', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-stellar-purple"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Description</label>
                    <textarea
                      placeholder="Describe your participation..."
                      value={formData.hackathon.description}
                      onChange={(e) => handleInputChange('hackathon', 'description', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-stellar-purple h-24"
                    />
                  </div>
                </>
              )}

              {activeTab === 'oss' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">PR Link</label>
                    <input
                      type="url"
                      placeholder="https://github.com/..."
                      value={formData.oss.prLink}
                      onChange={(e) => handleInputChange('oss', 'prLink', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-stellar-purple"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Description</label>
                    <textarea
                      placeholder="Describe the contribution..."
                      value={formData.oss.description}
                      onChange={(e) => handleInputChange('oss', 'description', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-stellar-purple h-24"
                    />
                  </div>
                </>
              )}

              {activeTab === 'bugbounty' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Bounty Link</label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={formData.bugbounty.link}
                      onChange={(e) => handleInputChange('bugbounty', 'link', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-stellar-purple"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Severity</label>
                    <select
                      value={formData.bugbounty.severity}
                      onChange={(e) => handleInputChange('bugbounty', 'severity', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-stellar-purple"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </>
              )}

              {activeTab === 'freelance' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Project Link</label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={formData.freelance.link}
                      onChange={(e) => handleInputChange('freelance', 'link', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-stellar-purple"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Description</label>
                    <textarea
                      placeholder="Describe the project..."
                      value={formData.freelance.description}
                      onChange={(e) => handleInputChange('freelance', 'description', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-stellar-purple h-24"
                    />
                  </div>
                </>
              )}

              <button
                onClick={() => handleSubmitProof(activeTab)}
                disabled={submitting}
                className="w-full px-6 py-3 bg-gradient-to-r from-stellar-purple to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-stellar-purple/50 transition-smooth disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : `Submit ${PROOF_TYPES[activeTab]} Proof`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
