import express from 'express'
import crypto from 'crypto-js'
import Profile from '../models/Profile.model.js'
import Proof from '../models/Proof.model.js'
import { scorerService } from '../services/scorer.service.js'
import { githubService } from '../services/github.service.js'
import { blockchainService } from '../services/blockchain.service.js'

const router = express.Router()

const PROOF_TYPE_MAP = {
  github: 1,
  hackathon: 2,
  oss: 3,
  bugbounty: 4,
  freelance: 5,
}

/**
 * POST /api/proof/submit
 * Submit a proof and update score
 */
router.post('/submit', async (req, res) => {
  try {
    const { walletAddress, proofType, proofData } = req.body

    if (!walletAddress || !proofType || !proofData) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    if (!PROOF_TYPE_MAP[proofType]) {
      return res.status(400).json({ error: 'Invalid proof type' })
    }

    // Generate proof hash
    const proofHash = crypto.SHA256(JSON.stringify(proofData)).toString()

    // Check if proof already submitted
    const existingProof = await Proof.findOne({ proof_hash: proofHash })
    if (existingProof) {
      return res.status(400).json({ error: 'This proof has already been submitted' })
    }

    // Calculate score based on proof type
    let scoreDelta = 0

    if (proofType === 'github') {
      // Sync GitHub data and calculate score
      const githubData = await githubService.syncProfile(proofData.username)
      if (githubData) {
        scoreDelta = scorerService.calculateGitHubScore({
          commits: githubData.commits_90d,
          merged_prs: Math.floor(githubData.total_prs * 0.3), // Estimate ~30% merged
          repo_stars: githubData.total_stars,
          code_reviews: 0, // Would need additional API calls
        })
      }
    } else if (proofType === 'hackathon') {
      scoreDelta = scorerService.calculateHackathonScore({ participations: 1 })
    } else if (proofType === 'oss') {
      scoreDelta = scorerService.calculateOSSScore({ major_prs: 1 })
    } else if (proofType === 'bugbounty') {
      const severity = proofData.severity || 'medium'
      scoreDelta = scorerService.calculateBugBountyScore(severity)
    } else if (proofType === 'freelance') {
      scoreDelta = scorerService.calculateFreelanceScore({ completed_contracts: 1 })
    }

    // Create proof record
    const proof = new Proof({
      proof_hash: proofHash,
      proof_type: PROOF_TYPE_MAP[proofType],
      wallet_address: walletAddress,
      score_delta: scoreDelta,
      submitter: walletAddress,
      proof_data: proofData,
      is_verified_on_chain: false,
    })

    await proof.save()

    // Update or create profile
    let profile = await Profile.findOne({ wallet: walletAddress })

    if (!profile) {
      profile = new Profile({
        wallet: walletAddress,
        total_score: 0,
        github_score: 0,
        hackathon_score: 0,
        oss_score: 0,
        bugbounty_score: 0,
        freelance_score: 0,
        proof_count: 0,
      })
    }

    // Update scores
    const categoryMap = {
      github: 'github_score',
      hackathon: 'hackathon_score',
      oss: 'oss_score',
      bugbounty: 'bugbounty_score',
      freelance: 'freelance_score',
    }

    const scoreKey = categoryMap[proofType]
    if (scoreKey) {
      const currentScore = profile[scoreKey] || 0
      const caps = {
        github_score: 300,
        hackathon_score: 200,
        oss_score: 250,
        bugbounty_score: 150,
        freelance_score: 100,
      }

      profile[scoreKey] = Math.min(currentScore + scoreDelta, caps[scoreKey])
    }

    // Recalculate total score
    profile.total_score = Math.min(
      (profile.github_score || 0) +
      (profile.hackathon_score || 0) +
      (profile.oss_score || 0) +
      (profile.bugbounty_score || 0) +
      (profile.freelance_score || 0),
      1000
    )

    profile.last_updated = new Date()
    profile.proof_count = await Proof.countDocuments({ wallet_address: walletAddress })

    await profile.save()

    // Submit to blockchain (non-blocking)
    blockchainService
      .submitProofToContract(walletAddress, proofHash, PROOF_TYPE_MAP[proofType], scoreDelta)
      .catch(err => console.error('Failed to submit proof to blockchain:', err))

    res.status(201).json({
      proof,
      profile,
      score_delta: scoreDelta,
    })
  } catch (error) {
    console.error('Error submitting proof:', error)
    res.status(500).json({ error: 'Failed to submit proof' })
  }
})

/**
 * GET /api/proof/:walletAddress
 * Get all proofs for a wallet
 */
router.get('/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params

    const proofs = await Proof.find({ wallet_address: walletAddress })
      .sort({ timestamp: -1 })
      .limit(50)

    res.json(proofs)
  } catch (error) {
    console.error('Error fetching proofs:', error)
    res.status(500).json({ error: 'Failed to fetch proofs' })
  }
})

/**
 * POST /api/proof/github-sync
 * Sync GitHub data for a user
 */
router.post('/github-sync', async (req, res) => {
  try {
    const { walletAddress, githubUsername } = req.body

    if (!walletAddress || !githubUsername) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Fetch GitHub data
    const githubData = await githubService.syncProfile(githubUsername)
    if (!githubData) {
      return res.status(404).json({ error: 'GitHub user not found' })
    }

    // Calculate GitHub score
    const githubScore = scorerService.calculateGitHubScore({
      commits: githubData.commits_90d,
      merged_prs: Math.floor(githubData.total_prs * 0.3),
      repo_stars: githubData.total_stars,
      code_reviews: 0,
    })

    // Generate proof hash
    const proofHash = crypto
      .SHA256(JSON.stringify({ type: 'github', ...githubData }))
      .toString()

    // Check if already submitted
    const existingProof = await Proof.findOne({ proof_hash: proofHash })
    if (existingProof) {
      return res.status(400).json({ error: 'GitHub profile already synced' })
    }

    // Create proof
    const proof = new Proof({
      proof_hash: proofHash,
      proof_type: PROOF_TYPE_MAP.github,
      wallet_address: walletAddress,
      score_delta: githubScore,
      submitter: walletAddress,
      proof_data: githubData,
    })

    await proof.save()

    // Update profile
    let profile = await Profile.findOne({ wallet: walletAddress })
    if (!profile) {
      profile = new Profile({ wallet: walletAddress })
    }

    profile.github_score = Math.min(
      (profile.github_score || 0) + githubScore,
      300
    )
    profile.total_score = Math.min(
      (profile.github_score || 0) +
      (profile.hackathon_score || 0) +
      (profile.oss_score || 0) +
      (profile.bugbounty_score || 0) +
      (profile.freelance_score || 0),
      1000
    )
    profile.last_updated = new Date()

    await profile.save()

    res.status(201).json({
      proof,
      profile,
      github_data: githubData,
    })
  } catch (error) {
    console.error('Error syncing GitHub:', error)
    res.status(500).json({ error: 'Failed to sync GitHub data' })
  }
})

export default router
