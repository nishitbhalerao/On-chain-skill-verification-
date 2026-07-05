import { describe, it, expect } from '@jest/globals'
import { scorerService } from '../services/scorer.service.js'

describe('Scorer Service', () => {
  describe('calculateGitHubScore', () => {
    it('should calculate GitHub score from commits and PRs', () => {
      const data = {
        commits: 5,
        merged_prs: 2,
        repo_stars: 50,
        code_reviews: 1,
      }

      const score = scorerService.calculateGitHubScore(data)
      // 5*2 + 2*15 + 50*0.5 + 1*8 = 10 + 30 + 25 + 8 = 73
      expect(score).toBe(73)
    })

    it('should cap stars at 100 points', () => {
      const data = {
        commits: 0,
        merged_prs: 0,
        repo_stars: 500,
        code_reviews: 0,
      }

      const score = scorerService.calculateGitHubScore(data)
      // 500 * 0.5 = 250, but capped at 100
      expect(score).toBe(100)
    })

    it('should cap GitHub score at 300', () => {
      const data = {
        commits: 100,
        merged_prs: 100,
        repo_stars: 1000,
        code_reviews: 100,
      }

      const score = scorerService.calculateGitHubScore(data)
      expect(score).toBe(300)
    })

    it('should return 0 for empty data', () => {
      const score = scorerService.calculateGitHubScore({})
      expect(score).toBe(0)
    })
  })

  describe('calculateHackathonScore', () => {
    it('should calculate hackathon score correctly', () => {
      const data = {
        participations: 2,
        wins: 1,
      }

      const score = scorerService.calculateHackathonScore(data)
      // 2*20 + 1*80 = 40 + 80 = 120
      expect(score).toBe(120)
    })

    it('should cap hackathon score at 200', () => {
      const data = {
        participations: 20,
        wins: 5,
      }

      const score = scorerService.calculateHackathonScore(data)
      expect(score).toBe(200)
    })
  })

  describe('calculateOSSScore', () => {
    it('should calculate OSS score correctly', () => {
      const data = {
        major_prs: 2,
        minor_prs: 3,
        is_maintainer: false,
      }

      const score = scorerService.calculateOSSScore(data)
      // 2*30 + 3*15 = 60 + 45 = 105
      expect(score).toBe(105)
    })

    it('should include maintainer bonus', () => {
      const data = {
        major_prs: 1,
        minor_prs: 0,
        is_maintainer: true,
      }

      const score = scorerService.calculateOSSScore(data)
      // 1*30 + 50 = 80
      expect(score).toBe(80)
    })

    it('should cap OSS score at 250', () => {
      const data = {
        major_prs: 20,
        minor_prs: 20,
        is_maintainer: true,
      }

      const score = scorerService.calculateOSSScore(data)
      expect(score).toBe(250)
    })
  })

  describe('calculateBugBountyScore', () => {
    it('should calculate bug bounty score by severity', () => {
      expect(scorerService.calculateBugBountyScore('low')).toBe(20)
      expect(scorerService.calculateBugBountyScore('medium')).toBe(50)
      expect(scorerService.calculateBugBountyScore('high')).toBe(100)
      expect(scorerService.calculateBugBountyScore('critical')).toBe(200)
    })

    it('should return 0 for invalid severity', () => {
      expect(scorerService.calculateBugBountyScore('invalid')).toBe(0)
    })
  })

  describe('calculateFreelanceScore', () => {
    it('should calculate freelance score correctly', () => {
      const data = {
        completed_contracts: 3,
      }

      const score = scorerService.calculateFreelanceScore(data)
      // 3 * 25 = 75
      expect(score).toBe(75)
    })

    it('should cap freelance score at 100', () => {
      const data = {
        completed_contracts: 10,
      }

      const score = scorerService.calculateFreelanceScore(data)
      expect(score).toBe(100)
    })
  })

  describe('calculateTotalScore', () => {
    it('should sum category scores', () => {
      const categoryScores = {
        github: 80,
        hackathon: 40,
        oss: 30,
        bugbounty: 50,
        freelance: 25,
      }

      const total = scorerService.calculateTotalScore(categoryScores)
      expect(total).toBe(225)
    })

    it('should cap total at 1000', () => {
      const categoryScores = {
        github: 300,
        hackathon: 200,
        oss: 250,
        bugbounty: 150,
        freelance: 100,
      }

      const total = scorerService.calculateTotalScore(categoryScores)
      expect(total).toBe(1000)
    })
  })

  describe('applyRecencyDecay', () => {
    it('should apply decay factor correctly', () => {
      const score = 100
      const daysSince = 0

      const decayed = scorerService.applyRecencyDecay(score, daysSince)
      // At 0 days: 100 * (0.3 + 0.7 * 1) = 100
      expect(Math.round(decayed)).toBe(100)
    })

    it('should decay score after 90 days', () => {
      const score = 100
      const daysSince = 90

      const decayed = scorerService.applyRecencyDecay(score, daysSince)
      // 100 * (0.3 + 0.7 * e^(-90/180)) ≈ 81
      expect(Math.round(decayed)).toBeGreaterThan(75)
      expect(Math.round(decayed)).toBeLessThan(85)
    })

    it('should decay score significantly after 180 days', () => {
      const score = 100
      const daysSince = 180

      const decayed = scorerService.applyRecencyDecay(score, daysSince)
      // 100 * (0.3 + 0.7 * e^(-180/180)) ≈ 56
      expect(Math.round(decayed)).toBeGreaterThan(50)
      expect(Math.round(decayed)).toBeLessThan(60)
    })

    it('should never go below 30% of original', () => {
      const score = 100
      const daysSince = 1000

      const decayed = scorerService.applyRecencyDecay(score, daysSince)
      // 100 * (0.3 + 0.7 * ~0) ≈ 30
      expect(decayed).toBeGreaterThanOrEqual(30)
    })
  })

  describe('generateProofHash', () => {
    it('should generate consistent hash for same data', () => {
      const data = { type: 'github', username: 'octocat' }
      const hash1 = scorerService.generateProofHash(data)
      const hash2 = scorerService.generateProofHash(data)

      expect(hash1).toBe(hash2)
    })

    it('should generate different hash for different data', () => {
      const data1 = { type: 'github', username: 'octocat' }
      const data2 = { type: 'github', username: 'torvalds' }

      const hash1 = scorerService.generateProofHash(data1)
      const hash2 = scorerService.generateProofHash(data2)

      expect(hash1).not.toBe(hash2)
    })

    it('should generate 64-character SHA256 hash', () => {
      const data = { test: 'data' }
      const hash = scorerService.generateProofHash(data)

      expect(hash).toHaveLength(64)
      expect(/^[a-f0-9]{64}$/.test(hash)).toBe(true)
    })
  })

  describe('Realistic scoring scenarios', () => {
    it('should score experienced developer correctly', () => {
      const scores = {
        github: scorerService.calculateGitHubScore({
          commits: 150,
          merged_prs: 25,
          repo_stars: 200,
          code_reviews: 30,
        }),
        hackathon: scorerService.calculateHackathonScore({
          participations: 5,
          wins: 2,
        }),
        oss: scorerService.calculateOSSScore({
          major_prs: 5,
          minor_prs: 3,
          is_maintainer: true,
        }),
        bugbounty: scorerService.calculateBugBountyScore('high'),
        freelance: scorerService.calculateFreelanceScore({
          completed_contracts: 4,
        }),
      }

      const total = scorerService.calculateTotalScore(scores)
      expect(total).toBeGreaterThan(500)
      expect(total).toBeLessThanOrEqual(1000)
    })

    it('should score junior developer correctly', () => {
      const scores = {
        github: scorerService.calculateGitHubScore({
          commits: 10,
          merged_prs: 2,
          repo_stars: 5,
          code_reviews: 0,
        }),
        hackathon: 0,
        oss: 0,
        bugbounty: 0,
        freelance: 0,
      }

      const total = scorerService.calculateTotalScore(scores)
      expect(total).toBeGreaterThan(0)
      expect(total).toBeLessThan(100)
    })
  })
})
