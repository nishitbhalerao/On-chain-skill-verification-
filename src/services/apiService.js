import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const profileAPI = {
  getProfile: (walletAddress) =>
    apiClient.get(`/api/profile/${walletAddress}`),
  
  getScore: (walletAddress) =>
    apiClient.get(`/api/profile/${walletAddress}/score`),
  
  createProfile: (walletAddress) =>
    apiClient.post('/api/profile/create', { walletAddress }),
}

export const proofAPI = {
  submitProof: (data) =>
    apiClient.post('/api/proof/submit', data),
  
  getProofs: (walletAddress) =>
    apiClient.get(`/api/proof/${walletAddress}`),
  
  syncGitHub: (walletAddress, githubUsername) =>
    apiClient.post('/api/proof/github-sync', { 
      walletAddress, 
      githubUsername 
    }),
}

export default apiClient
