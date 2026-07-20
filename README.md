# OpenSkills Oracle

**Decentralized skill verification protocol on Stellar blockchain**

Skills you can't fake. Verified on-chain.

OpenSkills Oracle transforms real developer achievements into a non-transferable skill NFT verified on the Stellar blockchain. Employers verify by querying the contract with a wallet address.

## 🚀 Live Application

**[View Live App](https://openskills-oracle-nishitbhalerao-7784.vercel.app)** - Deployed on Vercel

Try the live demo: https://openskills-oracle-nishitbhalerao-7784.vercel.app

## 📜 Smart Contract

**Network**: Stellar Testnet  
**Contract Language**: Rust (Soroban)  
**Status**: ✅ Deployed  

### Contract Functions
- `initialize(admin)` - Initialize contract with admin
- `submit_proof(wallet, proof_hash, proof_type, score_delta)` - Submit skill proof
- `get_profile(wallet)` - Get full skill profile
- `get_score(wallet)` - Get total score (optimized)
- `get_proofs(wallet)` - Get proof history
- `update_score(wallet, category, new_score)` - Update category score
- `verify_profile(wallet)` - Mark profile as verified

### To Deploy the Contract

1. **Build the contract**:
```bash
cd contracts/skill_oracle
cargo build --target wasm32-unknown-unknown --release
```

2. **Deploy to testnet**:
```bash
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/skill_oracle.wasm \
  --source oracle-admin \
  --network testnet
```

3. **Initialize**:
```bash
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source oracle-admin \
  --network testnet \
  -- initialize \
  --admin <YOUR_WALLET_ADDRESS>
```

**See `contracts/deploy.sh` for full deployment instructions**

## Problem

- **Resume red flags**: Inflated claims, unverifiable credentials
- **Credential gaps**: No proof of actual technical ability
- **Time-consuming**: Employers must verify manually

## Solution

- **Work Signals**: Real GitHub commits, hackathon wins, OSS contributions tracked automatically
- **Dynamic Scoring**: Skill score automatically updated with recency factoring
- **On-Chain Verified**: Non-transferable skill NFT minted to wallet on Stellar testnet

## Features

✅ **Multi-source skill verification** - GitHub, Hackathons, Open Source, Bug Bounties, Freelance  
✅ **Automated scoring algorithm** - Real-time score calculation with recency decay  
✅ **Soroban smart contract** - Deployed on Stellar testnet  
✅ **Freighter wallet integration** - Seamless Web3 connection  
✅ **Employer verification page** - Query any wallet for skill score  
✅ **Production-ready backend** - MongoDB, Express, rate limiting, validation  
✅ **Responsive UI** - Mobile-first design with glassmorphic components  

## Tech Stack

### Frontend
- React 18 + Vite
- Tailwind CSS + Lucide React
- Recharts for visualizations
- @stellar/freighter-api
- React Router + Axios

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- GitHub API integration
- Stellar SDK

### Blockchain
- Rust + Soroban SDK
- Stellar Testnet
- Smart contract for skill profile management

### Deployment
- Vercel (frontend)
- Railway/Render (backend)
- Stellar Testnet (smart contract)

## Project Structure

```
OpenSkillsOracle/
├── src/                               # React frontend (Vite)
│   ├── components/
│   │   ├── AnimatedBackground.jsx     # Starfield particles
│   │   ├── Navbar.jsx                 # Navigation + wallet button
│   │   ├── SkillScoreGauge.jsx        # Animated gauge (0-1000)
│   │   ├── SkillBadge.jsx             # Skill category badge
│   │   └── Toast.jsx                  # Notifications
│   ├── pages/
│   │   ├── LandingPage.jsx            # Hero + problem/solution
│   │   ├── ProfilePage.jsx            # User profile + proof submission
│   │   ├── SkillReport.jsx            # Detailed breakdown
│   │   ├── VerifierPage.jsx           # Employer verification
│   │   └── Dashboard.jsx              # User submission history
│   ├── context/
│   │   ├── WalletContext.jsx          # Freighter state management
│   │   └── ToastContext.jsx           # Notifications state
│   ├── services/
│   │   ├── apiService.js              # Backend API calls
│   │   ├── walletService.js           # Freighter integration
│   │   └── stellarService.js          # Soroban contract interaction
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── backend/
│   ├── server.js                      # Express app entry point
│   ├── models/
│   │   ├── Profile.model.js           # MongoDB profile schema
│   │   └── Proof.model.js             # Proof submission schema
│   ├── routes/
│   │   ├── profile.routes.js          # Profile endpoints
│   │   └── proof.routes.js            # Proof submission endpoints
│   ├── services/
│   │   ├── scorer.service.js          # Scoring algorithm
│   │   ├── github.service.js          # GitHub API integration
│   │   └── blockchain.service.js      # Stellar/Soroban integration
│   ├── tests/
│   │   └── scorer.test.js             # Jest tests
│   └── package.json
├── contracts/
│   ├── skill_oracle/
│   │   ├── Cargo.toml
│   │   ├── src/
│   │   │   └── lib.rs                 # Soroban smart contract
│   │   └── src/
│   │       └── test.rs                # Contract tests
│   └── deploy.sh                      # Deployment script
├── .github/workflows/
│   └── ci.yml                         # GitHub Actions CI/CD
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
├── .env.example
└── README.md
```

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB 5+
- Rust 1.70+ (for contract development)
- Freighter wallet browser extension
- GitHub personal access token (optional, for GitHub sync)

### Installation

1. **Clone and setup**
```bash
git clone https://github.com/yourusername/OpenSkillsOracle
cd OpenSkillsOracle
npm install
```

2. **Backend setup**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI, GitHub token, etc.
node server.js
```

3. **Smart contract setup** (optional for local development)
```bash
cd contracts/skill_oracle
cargo build --target wasm32-unknown-unknown --release
# See contracts/deploy.sh for testnet deployment
```

4. **Frontend setup** (in new terminal)
```bash
npm run dev
# Open http://localhost:5173
```

## Running the Application

**Terminal 1 - Backend API**
```bash
cd backend
npm install
node server.js
# Runs on http://localhost:5000
```

**Terminal 2 - Frontend**
```bash
npm install
npm run dev
# Runs on http://localhost:5173
```

**Terminal 3 - Smart Contract** (optional)
```bash
cd contracts/skill_oracle
cargo build --target wasm32-unknown-unknown --release
```

## API Documentation

### Profile Endpoints

#### Get Profile
```
GET /api/profile/:walletAddress
```
Returns full profile with all scores.

**Response:**
```json
{
  "_id": "...",
  "wallet": "GXXXXXX...",
  "total_score": 150,
  "github_score": 80,
  "hackathon_score": 40,
  "oss_score": 30,
  "bugbounty_score": 0,
  "freelance_score": 0,
  "proof_count": 3,
  "last_updated": "2024-01-15T10:30:00Z",
  "is_verified": false
}
```

#### Get Score Only
```
GET /api/profile/:walletAddress/score
```
Optimized endpoint for verification page (employer use case).

#### Create Profile
```
POST /api/profile/create
Content-Type: application/json

{
  "walletAddress": "GXXXXXX..."
}
```

### Proof Endpoints

#### Submit Proof
```
POST /api/proof/submit
Content-Type: application/json

{
  "walletAddress": "GXXXXXX...",
  "proofType": "github|hackathon|oss|bugbounty|freelance",
  "proofData": {
    // Type-specific data
  }
}
```

**GitHub proof data:**
```json
{
  "username": "octocat"
}
```

**Hackathon proof data:**
```json
{
  "url": "https://devpost.com/...",
  "description": "2nd place in HackXYZ 2024"
}
```

**OSS proof data:**
```json
{
  "prLink": "https://github.com/.../pull/123",
  "description": "Added feature X to project Y"
}
```

**Bug Bounty proof data:**
```json
{
  "link": "https://hackerone.com/...",
  "severity": "high|medium|low|critical"
}
```

**Freelance proof data:**
```json
{
  "link": "https://upwork.com/...",
  "description": "Built REST API for SaaS platform"
}
```

#### Get All Proofs
```
GET /api/proof/:walletAddress
```
Returns all submitted proofs for a wallet (latest 50).

#### GitHub Sync
```
POST /api/proof/github-sync
Content-Type: application/json

{
  "walletAddress": "GXXXXXX...",
  "githubUsername": "octocat"
}
```
Auto-fetches GitHub data and calculates score.

## Scoring Algorithm

### Category Weights

```javascript
GitHub (max 300 pts):
  - 2 pts per commit (last 90 days)
  - 15 pts per merged PR
  - 0.5 pts per star on authored repos (capped 100 pts)
  - 8 pts per code review given

Hackathons (max 200 pts):
  - 20 pts per participation
  - 80 pts per win/placement

Open Source (max 250 pts):
  - 30 pts per merged PR (100+ stars)
  - 15 pts per merged PR (<100 stars)
  - 50 pts if maintainer (100+ stars)

Bug Bounty (max 150 pts):
  - 20 pts low
  - 50 pts medium
  - 100 pts high
  - 200 pts critical

Freelance (max 100 pts):
  - 25 pts per completed contract
```

### Total Score Cap: 1000 pts

### Recency Decay
Scores older than 90 days gradually decay:
```
adjusted_score = score * (0.3 + 0.7 * e^(-days/180))
```

## Smart Contract Functions

### initialize(admin: Address)
Set the contract admin (called once at deployment).

### submit_proof(wallet, proof_hash, proof_type, score_delta)
Admin-only function to submit proof and update score.

### get_profile(wallet) -> SkillProfile
Read full profile for verification.

### get_score(wallet) -> u32
Read total score only (optimized).

### get_proofs(wallet) -> Vec<ProofRecord>
Get proof history for a wallet.

### update_score(wallet, category, new_score)
Admin function to manually adjust category scores.

### verify_profile(wallet)
Admin marks profile as verified on-chain.

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=https://your-backend-url.com
VITE_CONTRACT_ID=CCVGHJYXWM5JD7MFHJ2VKXQHJQZWQVJXWM5JD7MFHJ2VKXQHJQZW
VITE_STELLAR_PUBLIC_KEY=GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### Backend (backend/.env)
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/openskilloracle
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://openskills-oracle-nishitbhalerao-7784.vercel.app
STELLAR_NETWORK=testnet
STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
CONTRACT_ID=CCVGHJYXWM5JD7MFHJ2VKXQHJQZWQVJXWM5JD7MFHJ2VKXQHJQZW
ORACLE_SECRET_KEY=SXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
GITHUB_TOKEN=ghp_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

## Smart Contract Deployment

### Prerequisites
- Stellar CLI installed
- Funded testnet account
- Rust toolchain with wasm32 target

### Build
```bash
cd contracts/skill_oracle
cargo build --target wasm32-unknown-unknown --release
```

### Deploy to Testnet
```bash
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/skill_oracle.wasm \
  --source oracle-admin \
  --network testnet
```

### Initialize
```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --source oracle-admin \
  --network testnet \
  -- initialize \
  --admin $ORACLE_ADMIN_ADDRESS
```

See `contracts/deploy.sh` for detailed deployment steps.

## Testing

### Backend Tests
```bash
cd backend
npm test
```

### Smart Contract Tests
```bash
cd contracts/skill_oracle
cargo test
```

## Security Considerations

- ✅ Rate limiting on API (100 req/15min)
- ✅ Helmet.js for HTTP headers
- ✅ Wallet signature verification
- ✅ Admin-only smart contract functions
- ✅ Input validation on all endpoints
- ✅ MongoDB indexes for performance
- ✅ Proof hash uniqueness checking
- ✅ Non-transferable NFTs (soulbound)

## Production Deployment

### Frontend (Vercel)
```bash
npm run build
# Deploy 'dist' directory to Vercel
```

### Backend (Railway/Render)
```bash
# Push to Git repository
# Connect Railway/Render to GitHub
# Set environment variables in dashboard
```

### Smart Contract (Stellar Testnet → Mainnet)
Update `STELLAR_NETWORK` to `mainnet` in deployment script and re-deploy.

## Roadmap

- [ ] Peer attestation system (Web of Trust)
- [ ] Skill endorsements from community
- [ ] Integration with more GitHub activity signals
- [ ] Mobile app (React Native)
- [ ] Resume generation from profile
- [ ] Multi-chain support (Ethereum, Polygon)
- [ ] Real NFT minting (currently on testnet)
- [ ] AI-powered skill recommendations

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues, questions, or contributions:
- GitHub Issues: [Create an issue](https://github.com/yourusername/OpenSkillsOracle/issues)
- Discord: [Join our community](#)
- Email: support@openskilloracle.dev

## Acknowledgments

- Built with [Stellar SDK](https://developers.stellar.org/)
- Inspired by [StellarGuard](https://github.com/nishitbhalerao/StellarGuard.RiseIn)
- UI inspired by modern Web3 platforms

---

**Made with ❤️ by the OpenSkills Oracle team**
