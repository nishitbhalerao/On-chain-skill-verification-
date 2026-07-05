import axios from 'axios'

const GITHUB_API_URL = 'https://api.github.com'
const GITHUB_TOKEN = process.env.GITHUB_TOKEN

const githubClient = axios.create({
  baseURL: GITHUB_API_URL,
  headers: {
    Authorization: GITHUB_TOKEN ? `token ${GITHUB_TOKEN}` : undefined,
    Accept: 'application/vnd.github.v3+json',
  },
})

export const githubService = {
  /**
   * Get user data from GitHub
   */
  async getUserData(username) {
    try {
      const response = await githubClient.get(`/users/${username}`)
      return response.data
    } catch (error) {
      console.error(`Failed to get GitHub user data for ${username}:`, error.message)
      return null
    }
  },

  /**
   * Get commits for last 90 days
   */
  async getRecentCommits(username) {
    try {
      const ninetyDaysAgo = new Date()
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
      const formattedDate = ninetyDaysAgo.toISOString().split('T')[0]

      const response = await githubClient.get(`/search/commits`, {
        params: {
          q: `author:${username} committer-date:>${formattedDate}`,
          sort: 'committer-date',
          order: 'desc',
        },
      })

      return response.data.total_count || 0
    } catch (error) {
      console.error(`Failed to get commits for ${username}:`, error.message)
      return 0
    }
  },

  /**
   * Get user repositories with star count
   */
  async getUserRepos(username) {
    try {
      const response = await githubClient.get(`/users/${username}/repos`, {
        params: {
          per_page: 100,
          sort: 'stars',
          order: 'desc',
        },
      })

      return response.data.map(repo => ({
        name: repo.name,
        stars: repo.stargazers_count,
        url: repo.html_url,
      }))
    } catch (error) {
      console.error(`Failed to get repos for ${username}:`, error.message)
      return []
    }
  },

  /**
   * Get pull requests stats
   */
  async getPullRequestStats(username) {
    try {
      const response = await githubClient.get(`/search/issues`, {
        params: {
          q: `author:${username} type:pr state:closed`,
          per_page: 1,
        },
      })

      return {
        total_prs: response.data.total_count || 0,
      }
    } catch (error) {
      console.error(`Failed to get PR stats for ${username}:`, error.message)
      return { total_prs: 0 }
    }
  },

  /**
   * Sync complete GitHub profile data
   */
  async syncProfile(username) {
    const [userData, commits, repos, prStats] = await Promise.all([
      this.getUserData(username),
      this.getRecentCommits(username),
      this.getUserRepos(username),
      this.getPullRequestStats(username),
    ])

    if (!userData) {
      return null
    }

    const totalStars = repos.reduce((sum, repo) => sum + repo.stars, 0)

    return {
      username: userData.login,
      name: userData.name,
      avatar_url: userData.avatar_url,
      bio: userData.bio,
      public_repos: userData.public_repos,
      followers: userData.followers,
      following: userData.following,
      commits_90d: commits,
      total_prs: prStats.total_prs,
      total_stars: totalStars,
      repos,
    }
  },
}

export default githubService
