import React from 'react'
import { Link } from 'react-router-dom'
import { useWallet } from '../context/WalletContext'
import AnimatedBackground from '../components/AnimatedBackground'
import { Github, Trophy, Code2, Shield, Briefcase, Users, Zap, CheckCircle } from 'lucide-react'

export default function LandingPage() {
  const { wallet, connectWallet } = useWallet()

  const skills = [
    { icon: Github, title: 'GitHub Commits', desc: 'Real code contributions' },
    { icon: Trophy, title: 'Hackathons', desc: 'Event participation & wins' },
    { icon: Code2, title: 'Open Source', desc: 'Maintained repositories' },
    { icon: Shield, title: 'Bug Bounties', desc: 'Security vulnerabilities' },
    { icon: Briefcase, title: 'Freelance Work', desc: 'Project completions' },
    { icon: Users, title: 'Peer Attestation', desc: 'Community validation' },
  ]

  const stats = [
    { label: '< 5s Verification', desc: 'On-chain instant verification' },
    { label: 'Stellar Testnet', desc: 'Blockchain verified' },
    { label: 'Non-Transferable NFT', desc: 'Soulbound skills' },
  ]

  const problems = [
    { title: 'Resume Red Flags', desc: 'Inflated claims, unverifiable credentials' },
    { title: 'Credential Gaps', desc: 'No proof of actual technical ability' },
    { title: 'Time Consuming', desc: 'Employers must verify manually' },
  ]

  const solutions = [
    { title: 'Work Signals', desc: 'Real GitHub commits, hackathon wins, OSS PR' },
    { title: 'Dynamic Scoring', desc: 'Skill score automatically updated, recency factored' },
    { title: 'On-Chain Verified', desc: 'Non-transferable skill NFT minted to wallet' },
  ]

  return (
    <>
      <AnimatedBackground />
      
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 pt-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6 leading-tight">
              Skills you can't fake.{' '}
              <span className="bg-gradient-to-r from-stellar-purple via-purple-400 to-purple-600 bg-clip-text text-transparent">
                Verified on-chain.
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              OpenSkills Oracle transforms your real developer achievements into a non-transferable 
              skill NFT verified on Stellar blockchain. Employers see proof, not promises.
            </p>

            <button
              onClick={wallet.isConnected ? () => {} : connectWallet}
              className={`px-8 py-4 rounded-xl font-bold text-lg transition-smooth ${
                wallet.isConnected
                  ? 'bg-gradient-to-r from-stellar-purple to-purple-600 text-white'
                  : 'bg-gradient-to-r from-stellar-purple to-purple-600 text-white hover:shadow-lg hover:shadow-stellar-purple/50'
              }`}
            >
              {wallet.isConnected ? (
                <Link to="/profile" className="block">
                  Go to Profile
                </Link>
              ) : (
                'Connect Wallet & Build Your Profile'
              )}
            </button>

            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {stats.map((stat, idx) => (
                <div key={idx} className="glass-card p-4 rounded-lg">
                  <div className="text-stellar-purple font-bold">{stat.label}</div>
                  <div className="text-xs text-gray-400 mt-1">{stat.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Problem vs Solution */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-white">
              The Problem & Our Solution
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-6 text-red-400 flex items-center space-x-2">
                  <span>❌ The Problem</span>
                </h3>
                <div className="space-y-4">
                  {problems.map((problem, idx) => (
                    <div key={idx} className="glass-card border-red-500/20 p-4 rounded-lg">
                      <h4 className="font-semibold text-red-300">{problem.title}</h4>
                      <p className="text-sm text-gray-400 mt-2">{problem.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-6 text-green-400 flex items-center space-x-2">
                  <span>✅ Our Solution</span>
                </h3>
                <div className="space-y-4">
                  {solutions.map((solution, idx) => (
                    <div key={idx} className="glass-card border-green-500/20 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-300">{solution.title}</h4>
                      <p className="text-sm text-gray-400 mt-2">{solution.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Skill Signals */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-white">
              Skill Signals We Verify
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              {skills.map((skill, idx) => {
                const IconComponent = skill.icon
                return (
                  <div key={idx} className="glass-card p-6 rounded-xl hover:bg-white/10 transition-smooth group">
                    <div className="text-stellar-purple group-hover:text-purple-400 transition-smooth">
                      <IconComponent className="w-10 h-10 mb-4" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{skill.title}</h3>
                    <p className="text-gray-400 text-sm">{skill.desc}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto glass-card border-stellar-purple/30 rounded-2xl p-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Prove Your Skills?</h2>
            <p className="text-gray-300 mb-8">
              Connect your Freighter wallet, submit your achievements, and get verified on-chain 
              in minutes.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              {wallet.isConnected ? (
                <>
                  <Link
                    to="/profile"
                    className="px-6 py-3 bg-gradient-to-r from-stellar-purple to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-stellar-purple/50 transition-smooth"
                  >
                    Go to My Profile
                  </Link>
                  <Link
                    to="/verify"
                    className="px-6 py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-smooth"
                  >
                    Verify Someone
                  </Link>
                </>
              ) : (
                <button
                  onClick={connectWallet}
                  className="px-6 py-3 bg-gradient-to-r from-stellar-purple to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-stellar-purple/50 transition-smooth"
                >
                  Connect Freighter Wallet
                </button>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
