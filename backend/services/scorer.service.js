// Scoring weights and algorithm
const WEIGHTS = {
  github: {
    commit: 2,              // per commit (last 90 days)
    merged_pr: 15,          // per merged PR
    repo_stars: 0.5,        // per star on authored repo (capped at 100pts)
    code_review: 8,         // per PR review given
  },
  hackathon: {
    participation: 20,      // per hackathon
    winner: 80,             // per win/placement
  },
  oss: {
    merged_pr_major: 30,    // merged PR in repo with 100+ stars
    merged_pr_minor: 15,    // merged PR in repo with <100 stars
    maintainer: 50,         // repo maintainer (100+ stars)
  },
  bugbounty: {
    low: 20,
    medium: 50,
    high: 100,
    critical: 200,
  },
  freelance: {
    completed_contract: 25, // per completed contract
  },
}

// Category caps
const CATEGORY_CAPS = {
  github: 300,
  hackathon: 200,
  oss: 250,
  bugbounty: 150,
  freelance: 100,
}

const MAX_TOTAL_SCORE = 1000

export const scorerService = {
  /**
   * Calculate recency decay factor
   * score * (0.3 + 0.7 * Math.exp(-days/180))
   */
  applyRecencyDecay(score, daysSince) {
    const decayFactor = 0.3 + 0.7 * Math.exp(-daysSince / 180)
    return score * decayFactor
  },

  /**
   * Calculate GitHub score from commit data
   */
  calculateGitHubScore(data) {
    let score = 0

    if (data.commits) {
      score += data.commits * WEIGHTS.github.commit
    }

    if (data.merged_prs) {
      score += data.merged_prs * WEIGHTS.github.merged_pr
    }

    if (data.repo_stars) {
      const starScore = Math.min(
        data.repo_stars * WEIGHTS.github.repo_stars,
        100
      )
      score += starScore
    }

    if (data.code_reviews) {
      score += data.code_reviews * WEIGHTS.github.code_review
    }

    return Math.min(score, CATEGORY_CAPS.github)
  },

  /**
   * Calculate Hackathon score
   */
  calculateHackathonScore(data) {
    let score = 0

    if (data.participations) {
      score += data.participations * WEIGHTS.hackathon.participation
    }

    if (data.wins) {
      score += data.wins * WEIGHTS.hackathon.winner
    }

    return Math.min(score, CATEGORY_CAPS.hackathon)
  },

  /**
   * Calculate OSS score
   */
  calculateOSSScore(data) {
    let score = 0

    if (data.major_prs) {
      score += data.major_prs * WEIGHTS.oss.merged_pr_major
    }

    if (data.minor_prs) {
      score += data.minor_prs * WEIGHTS.oss.merged_pr_minor
    }

    if (data.is_maintainer) {
      score += WEIGHTS.oss.maintainer
    }

    return Math.min(score, CATEGORY_CAPS.oss)
  },

  /**
   * Calculate Bug Bounty score
   */
  calculateBugBountyScore(severity) {
    const severityMap = {
      low: WEIGHTS.bugbounty.low,
      medium: WEIGHTS.bugbounty.medium,
      high: WEIGHTS.bugbounty.high,
      critical: WEIGHTS.bugbounty.critical,
    }

    return severityMap[severity] || 0
  },

  /**
   * Calculate Freelance score
   */
  calculateFreelanceScore(data) {
    let score = 0

    if (data.completed_contracts) {
      score += data.completed_contracts * WEIGHTS.freelance.completed_contract
    }

    return Math.min(score, CATEGORY_CAPS.freelance)
  },

  /**
   * Calculate total score from category scores
   */
  calculateTotalScore(categoryScores) {
    const total = Object.values(categoryScores).reduce((sum, score) => sum + score, 0)
    return Math.min(total, MAX_TOTAL_SCORE)
  },

  /**
   * Generate proof hash (SHA256-like)
   */
  generateProofHash(proofData) {
    const hash = require('crypto-js').SHA256(JSON.stringify(proofData)).toString()
    return hash
  },
}

export default scorerService
