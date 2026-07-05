import express from 'express'
import Profile from '../models/Profile.model.js'
import Proof from '../models/Proof.model.js'
import { blockchainService } from '../services/blockchain.service.js'

const router = express.Router()

/**
 * GET /api/profile/:walletAddress
 * Get full profile with all scores
 */
router.get('/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params

    // Validate wallet address format
    if (!walletAddress || walletAddress.length < 10) {
      return res.status(400).json({ error: 'Invalid wallet address' })
    }

    let profile = await Profile.findOne({ wallet: walletAddress })

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' })
    }

    // Get proof count
    const proofCount = await Proof.countDocuments({ wallet_address: walletAddress })
    profile.proof_count = proofCount

    res.json(profile)
  } catch (error) {
    console.error('Error fetching profile:', error)
    res.status(500).json({ error: 'Failed to fetch profile' })
  }
})

/**
 * GET /api/profile/:walletAddress/score
 * Get only the score (for verifiers)
 */
router.get('/:walletAddress/score', async (req, res) => {
  try {
    const { walletAddress } = req.params

    const profile = await Profile.findOne({ wallet: walletAddress })

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' })
    }

    res.json({
      wallet: profile.wallet,
      total_score: profile.total_score,
      github_score: profile.github_score,
      hackathon_score: profile.hackathon_score,
      oss_score: profile.oss_score,
      bugbounty_score: profile.bugbounty_score,
      freelance_score: profile.freelance_score,
      is_verified: profile.is_verified,
      last_updated: profile.last_updated,
    })
  } catch (error) {
    console.error('Error fetching score:', error)
    res.status(500).json({ error: 'Failed to fetch score' })
  }
})

/**
 * POST /api/profile/create
 * Create a new profile for a wallet
 */
router.post('/create', async (req, res) => {
  try {
    const { walletAddress } = req.body

    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address required' })
    }

    // Check if wallet exists on network
    const isValid = await blockchainService.isValidWallet(walletAddress)
    if (!isValid) {
      return res.status(400).json({ error: 'Wallet not found on Stellar network' })
    }

    // Check if profile already exists
    let profile = await Profile.findOne({ wallet: walletAddress })
    if (profile) {
      return res.json(profile)
    }

    // Create new profile
    profile = new Profile({
      wallet: walletAddress,
      total_score: 0,
      github_score: 0,
      hackathon_score: 0,
      oss_score: 0,
      bugbounty_score: 0,
      freelance_score: 0,
      proof_count: 0,
      is_verified: false,
    })

    await profile.save()

    res.status(201).json(profile)
  } catch (error) {
    console.error('Error creating profile:', error)
    res.status(500).json({ error: 'Failed to create profile' })
  }
})

export default router
