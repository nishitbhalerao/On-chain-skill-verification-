# OpenSkills Oracle - System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    USER BROWSER                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  React 18 Frontend (Vite)                            │  │
│  │  ├─ Pages: Landing, Profile, Verify, Report, etc.   │  │
│  │  ├─ Components: Navbar, Gauge, Toast, etc.          │  │
│  │  ├─ Contexts: WalletContext, ToastContext           │  │
│  │  └─ Services: API, Wallet, Stellar                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Freighter Wallet Extension                          │  │
│  │  └─ Connect, Sign Transactions, Get Public Key       │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────┬───────────────────────────────────────┘
                       │ HTTPS
                       │
        ┌──────────────┴──────────────┐
        │                             │
        ▼                             ▼
┌──────────────────┐       ┌──────────────────────┐
│  GitHub API      │       │  Express.js Backend  │
│  (API.github.com)│       │  (localhost:5000)    │
│                  │       │                      │
│ ├─ User data     │       │ ├─ /api/profile      │
│ ├─ Commits       │       │ ├─ /api/proof        │
│ ├─ PRs           │       │ ├─ Routes            │
│ └─ Repos         │       │ ├─ Models (MongoDB)  │
└──────────────────┘       │ ├─ Services          │
                           │ │  ├─ Scorer         │
                           │ │  ├─ GitHub         │
                           │ │  └─ Blockchain     │
                           │ └─ Middleware        │
                           │    ├─ CORS           │
                           │    ├─ Rate Limit     │
                           │    └─ Helmet         │
                           └──────────┬───────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                 │
                    ▼                 ▼                 ▼
          ┌──────────────────┐ ┌──────────────┐ ┌─────────────────┐
          │   MongoDB        │ │ Stellar SDK  │ │ Soroban Contract│
          │   (Database)     │ │ (RPC Client) │ │ (Smart Contract)│
          │                  │ │              │ │                 │
          │ ├─ profiles      │ │ Horizon API  │ │ ├─ initialize   │
          │ ├─ proofs        │ │ Testnet      │ │ ├─ submit_proof │
          │ └─ Indexes       │ │              │ │ ├─ get_profile  │
          │                  │ │              │ │ ├─ get_score    │
          │                  │ │              │ │ ├─ verify_prof  │
          │                  │ │              │ │ └─ Tests        │
          └──────────────────┘ └──────────────┘ └─────────────────┘
                                                         │
                                                         ▼
                                        ┌────────────────────────┐
                                        │ Stellar Blockchain     │
                                        │ (Testnet / Mainnet)    │
                                        └────────────────────────┘
```

---

## Data Flow Diagrams

### 1. User Submitting a Proof

```
Frontend (React)           Backend (Express)        External APIs
├─ User fills form         │                         │
├─ Clicks "Submit"         ├─ POST /api/proof/submit │
├─ Shows spinner           │                         │
│                          ├─ Validate input         │
│                          ├─ Generate proof hash    │
│                          ├─ Check for duplicates   │
│                          │   (MongoDB query)       │
│                          ├─ If GitHub:             │
│                          │   ├─ Call GitHub API────────► github.com
│                          │   ├─ Fetch user data◄────────
│                          │   ├─ Parse commits/PRs
│                          │   └─ Calculate score
│                          │
│                          ├─ Score proof            │
│                          ├─ Create Proof document  │
│                          ├─ Update Profile:        │
│                          │   ├─ Add to category    │
│                          │   ├─ Recalc total       │
│                          │   └─ Save to MongoDB    │
│                          │
│                          ├─ (Async) Submit to      │
│                          │   smart contract        │
│                          │
│◄─ Return {proof, profile}
├─ Toast: "Success!"       │
├─ Close form              │
├─ Refresh score gauge     │
└─ Update badges           │
```

### 2. Employer Verifying Skills

```
Browser (Employer)         Backend (Express)        MongoDB
├─ Enter wallet address    │                         │
├─ Click "Verify"          ├─ GET /api/profile/:addr │
├─ Show spinner            │                         │
│                          ├─ Query profile◄──────────
│                          │◄─ Return profile
│                          │
│◄─ Return profile data    │
├─ Display score gauge     │
├─ Show badges             │
├─ Show verified badge     │
└─ Share link              │
```

### 3. Smart Contract Interaction

```
Backend (Node.js)         Stellar SDK              Smart Contract
├─ Proof submitted        │                         │
├─ Create transaction     │                         │
├─ Build operations       │                         │
│                         ├─ Sign with oracle key   │
│                         ├─ Submit transaction────────────► Contract
│                         │                         │
│                         │                         ├─ Verify admin
│                         │                         ├─ Load profile
│                         │                         ├─ Update scores
│                         │                         ├─ Store proof
│                         │                         └─ Return result
│                         │◄─── Transaction result
├─ (Async) Update proof   │
│   status to "verified"  │
└─                        │
```

---

## Component Architecture

### Frontend Component Hierarchy

```
App (Router)
├── Navbar
│   └── WalletButton (uses WalletContext)
├── AnimatedBackground
└── Routes
    ├── LandingPage
    │   ├── AnimatedBackground
    │   ├── Hero
    │   ├── ProblemSolution
    │   ├── SkillCards
    │   └── CTA
    ├── ProfilePage (Protected)
    │   ├── SkillScoreGauge
    │   ├── SkillBadge (x5)
    │   └── ProofForm
    │       ├── TabButtons
    │       ├── FormInputs
    │       └── SubmitButton
    ├── VerifierPage
    │   ├── SearchForm
    │   ├── SkillScoreGauge
    │   ├── SkillBadge (x5)
    │   └── ShareSection
    ├── SkillReport
    └── Dashboard
└── Toast (uses ToastContext)
```

---

## Backend Service Architecture

```
Express Server
├── Middleware
│   ├── helmet()           → Security headers
│   ├── cors()             → Cross-origin
│   ├── json()             → JSON parsing
│   └── rateLimit()        → 100 req/15min
│
├── Routes
│   ├── /api/profile
│   │   ├── GET /:wallet
│   │   ├── GET /:wallet/score
│   │   └── POST /create
│   └── /api/proof
│       ├── POST /submit
│       ├── GET /:wallet
│       └── POST /github-sync
│
├── Models
│   ├── Profile (MongoDB)
│   └── Proof (MongoDB)
│
├── Services
│   ├── scorerService
│   │   ├── calculateGitHubScore()
│   │   ├── calculateHackathonScore()
│   │   ├── calculateOSSScore()
│   │   ├── calculateBugBountyScore()
│   │   ├── calculateFreelanceScore()
│   │   ├── calculateTotalScore()
│   │   ├── applyRecencyDecay()
│   │   └── generateProofHash()
│   │
│   ├── githubService
│   │   ├── getUserData()
│   │   ├── getRecentCommits()
│   │   ├── getUserRepos()
│   │   ├── getPullRequestStats()
│   │   └── syncProfile()
│   │
│   └── blockchainService
│       ├── submitProofToContract()
│       ├── getProfileFromContract()
│       ├── getAccountBalance()
│       └── isValidWallet()
│
└── Database (MongoDB)
    ├── profiles collection
    │   └── Indexes: wallet (unique), last_updated
    └── proofs collection
        └── Indexes: proof_hash (unique), wallet_address, timestamp
```

---

## Database Schema

```sql
-- MongoDB Collections

-- Profiles Collection
{
  _id: ObjectId,
  wallet: String (unique, indexed),
  total_score: Number (0-1000),
  github_score: Number (0-300),
  hackathon_score: Number (0-200),
  oss_score: Number (0-250),
  bugbounty_score: Number (0-150),
  freelance_score: Number (0-100),
  proof_count: Number,
  last_updated: Date (indexed),
  is_verified: Boolean,
  proof_hashes: [String],
  createdAt: Date,
  updatedAt: Date
}

-- Proofs Collection
{
  _id: ObjectId,
  proof_hash: String (unique, indexed),
  proof_type: Number (1-5),
  wallet_address: String (indexed),
  score_delta: Number,
  timestamp: Date (indexed),
  submitter: String,
  proof_data: Mixed,
  is_verified_on_chain: Boolean,
  on_chain_tx_id: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Smart Contract State

```rust
// On-chain Storage (Soroban)

DataKey::Admin
├─ Value: Address (contract admin)

DataKey::Profile(Address)
├─ Value: SkillProfile {
│   wallet: Address,
│   total_score: u32,
│   github_score: u32,
│   hackathon_score: u32,
│   oss_score: u32,
│   bugbounty_score: u32,
│   freelance_score: u32,
│   proof_count: u32,
│   last_updated: u64,
│   is_verified: bool
│ }

DataKey::ProofHistory(Address)
└─ Value: Vec<ProofRecord> {
    proof_hash: String,
    proof_type: u32,
    score_delta: u32,
    timestamp: u64,
    submitter: Address
  }
```

---

## API Request/Response Flow

### POST /api/proof/submit

**Request**
```json
{
  "walletAddress": "GBRPYHIL2CI3...",
  "proofType": "github",
  "proofData": {
    "username": "octocat"
  }
}
```

**Processing Pipeline**
1. Validate wallet address format
2. Validate proof type (1-5)
3. Fetch GitHub data via GitHub API
4. Calculate score using scoring algorithm
5. Generate proof hash (SHA256)
6. Check uniqueness in MongoDB
7. Create Proof document
8. Update Profile document
9. (Async) Submit to Soroban contract
10. Return response

**Response**
```json
{
  "proof": {
    "_id": "...",
    "proof_hash": "abc123...",
    "proof_type": 1,
    "wallet_address": "GBRPYHIL2CI3...",
    "score_delta": 80
  },
  "profile": {
    "wallet": "GBRPYHIL2CI3...",
    "total_score": 315,
    "github_score": 80,
    "proof_count": 5
  },
  "score_delta": 80
}
```

---

## Error Handling Strategy

```
Frontend Error
├─ Network error
│  ├─ Show toast: "Network error"
│  └─ Offer retry
├─ Validation error
│  ├─ Show inline error
│  └─ Highlight field
├─ Server error (5xx)
│  ├─ Show toast: "Server error"
│  └─ Log to console
└─ Not found (404)
   ├─ Redirect to home
   └─ Show error page

Backend Error
├─ Validation (400)
│  └─ Return { error: "Invalid input" }
├─ Auth (401)
│  └─ Return { error: "Unauthorized" }
├─ Rate limit (429)
│  └─ Return { error: "Too many requests" }
├─ Not found (404)
│  └─ Return { error: "Resource not found" }
└─ Server (500)
   ├─ Log error with stack trace
   └─ Return { error: "Internal server error" }
```

---

## Deployment Architecture

```
Production
├── Frontend (Vercel)
│   ├─ CDN distribution
│   ├─ Auto HTTPS
│   ├─ 0-downtime deployments
│   └─ Environment variables
├── Backend (Railway/Render)
│   ├─ Auto-scaling
│   ├─ Health checks
│   ├─ Persistent storage
│   └─ Environment variables
├── Database (MongoDB Atlas)
│   ├─ Replica set (HA)
│   ├─ Automatic backups
│   ├─ Indexes optimized
│   └─ Monitoring
├── Smart Contract (Stellar Mainnet)
│   ├─ Deployed WASM
│   ├─ Immutable code
│   ├─ State persistence
│   └─ RPC endpoints
└── DNS & Monitoring
    ├─ CloudFlare
    ├─ Sentry (error tracking)
    └─ New Relic (monitoring)
```

---

## Security Architecture

```
Layer 1: Transport
├─ HTTPS/TLS 1.3
├─ Certificate pinning
└─ HSTS headers

Layer 2: API
├─ Rate limiting (100 req/15min)
├─ CORS whitelist
├─ Request validation
├─ Input sanitization
└─ Helmet.js security headers

Layer 3: Authentication
├─ Freighter wallet signature
├─ Ethereum-style signing
└─ Nonce verification

Layer 4: Authorization
├─ Admin-only contract functions
├─ Wallet ownership check
└─ Permission matrices

Layer 5: Data
├─ MongoDB encryption at rest
├─ Field-level encryption
├─ Audit logging
└─ Data validation

Layer 6: Infrastructure
├─ Network isolation
├─ Firewall rules
├─ DDoS protection
└─ Secrets management
```

---

## Scaling Strategy

```
Current (Single Server)
├─ Frontend: 1 Vercel instance
├─ Backend: 1 Express server
├─ Database: 1 MongoDB instance
└─ Capacity: ~1,000 active users

Phase 2 (Horizontal Scaling)
├─ Frontend: CDN distribution
├─ Backend: 3-5 Express instances + load balancer
├─ Database: MongoDB replica set
└─ Capacity: ~10,000 active users

Phase 3 (Global Scale)
├─ Frontend: Multi-region Vercel
├─ Backend: Regional servers + API gateway
├─ Database: MongoDB sharding by wallet
└─ Capacity: ~100,000 active users
```

---

## Performance Optimization

```
Frontend
├─ Code splitting (Vite)
├─ Lazy loading routes
├─ Image optimization
├─ Caching strategies
└─ Bundle: ~180KB gzipped

Backend
├─ MongoDB indexes (wallet, timestamp)
├─ Connection pooling
├─ Request caching (Redis)
├─ Query optimization
└─ Response time: <200ms

Smart Contract
├─ Efficient storage layout
├─ Batch operations
├─ Gas optimization
└─ Execution: <1s
```

---

## Technology Rationale

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | React 18 + Vite | Fast, modern, large ecosystem |
| Styling | Tailwind CSS | Utility-first, performant |
| Backend | Node.js + Express | JavaScript full-stack, scalable |
| Database | MongoDB | Flexible schema, rapid iteration |
| Blockchain | Stellar + Soroban | Fast, cheap, ECU focus |
| Wallet | Freighter | Stellar native, secure |
| Testing | Jest | Comprehensive, well-documented |
| CI/CD | GitHub Actions | Free, integrated, reliable |

---

## Monitoring & Observability

```
Frontend Monitoring
├─ Error tracking (Sentry)
├─ Performance metrics (Vercel Analytics)
├─ User behavior (Mixpanel)
└─ Uptime monitoring (Uptime Robot)

Backend Monitoring
├─ Application logs (Winston/Pino)
├─ Error tracking (Sentry)
├─ Performance metrics (New Relic)
├─ Database monitoring (MongoDB Atlas)
└─ API metrics (Prometheus)

Alerts
├─ Error rate > 1%
├─ Response time > 1s
├─ Database connection pool full
├─ GitHub API rate limit reached
└─ Contract submission failed
```

---

## Future Architecture Enhancements

```
v2.0: Peer Attestation
├─ Trust graph
├─ Web of trust
└─ Multi-signature verification

v2.5: Sharding
├─ Split by wallet prefix
├─ Geographic distribution
└─ Query federation

v3.0: Zero-Knowledge Proofs
├─ Privacy-preserving scores
├─ Anonymous verification
└─ Confidential computing

v3.5: Multi-Chain
├─ Ethereum/Polygon support
├─ Cross-chain messaging
└─ Unified score aggregation
```

---

This architecture is designed for:
- ✅ Scalability (horizontal & vertical)
- ✅ Security (multiple layers)
- ✅ Performance (<200ms API response)
- ✅ Reliability (99.9% uptime target)
- ✅ Maintainability (clear separation of concerns)
- ✅ Extensibility (modular design)
