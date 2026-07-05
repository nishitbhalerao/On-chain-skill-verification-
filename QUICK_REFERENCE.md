# OpenSkills Oracle - Quick Reference Guide

## Start the Project (3 Steps)

```bash
# Terminal 1 - Backend
cd backend && npm install && npm start

# Terminal 2 - Frontend  
npm install && npm run dev

# Terminal 3 - Contract (optional)
cd contracts/skill_oracle && cargo build --target wasm32-unknown-unknown --release
```

**URLs**:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- Health: http://localhost:5000/health

---

## File Locations

| Feature | File |
|---------|------|
| Scoring algorithm | `backend/services/scorer.service.js` |
| GitHub integration | `backend/services/github.service.js` |
| Blockchain interaction | `backend/services/blockchain.service.js` |
| Profile API | `backend/routes/profile.routes.js` |
| Proof API | `backend/routes/proof.routes.js` |
| Wallet connect | `src/services/walletService.js` |
| Score gauge | `src/components/SkillScoreGauge.jsx` |
| Profile page | `src/pages/ProfilePage.jsx` |
| Verify page | `src/pages/VerifierPage.jsx` |
| Smart contract | `contracts/skill_oracle/src/lib.rs` |

---

## Common Commands

```bash
# Lint frontend
npm run lint

# Build frontend
npm run build

# Run backend tests
cd backend && npm test

# Run contract tests
cd contracts/skill_oracle && cargo test

# Build contract WASM
cd contracts/skill_oracle && cargo build --target wasm32-unknown-unknown --release

# Deploy contract
bash contracts/deploy.sh
```

---

## Environment Setup

**Frontend (.env):**
```
VITE_API_URL=http://localhost:5000
VITE_CONTRACT_ID=<contract_id>
VITE_STELLAR_PUBLIC_KEY=<public_key>
```

**Backend (backend/.env):**
```
MONGODB_URI=mongodb://localhost:27017/openskilloracle
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
GITHUB_TOKEN=<your_token>
```

---

## API Endpoints

### Profiles

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/profile/:wallet` | Full profile |
| GET | `/api/profile/:wallet/score` | Score only |
| POST | `/api/profile/create` | Create profile |

### Proofs

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/proof/submit` | Submit proof |
| GET | `/api/proof/:wallet` | Get proofs |
| POST | `/api/proof/github-sync` | Auto-sync GitHub |

---

## Scoring Quick Math

```javascript
// Score calculation
github_score = min(commits*2 + prs*15 + stars*0.5, 300)
hackathon_score = min(participation*20 + wins*80, 200)
oss_score = min(major_prs*30 + minor_prs*15 + maintainer*50, 250)
bugbounty_score = severity_map[severity]  // 20-200
freelance_score = min(contracts*25, 100)
total_score = min(sum_of_above, 1000)

// Decay formula (older scores)
decayed_score = score * (0.3 + 0.7 * e^(-days/180))
```

---

## React Hooks

```javascript
// Wallet context
const { wallet, connectWallet, disconnectWallet, signTransaction } = useWallet()

// Toast notifications
const { addToast, removeToast } = useToast()
addToast('Success!', 'success')  // Types: 'success', 'error', 'info'
```

---

## Smart Contract Functions

```rust
// Initialize with admin
initialize(env, admin_address)

// Submit proof (admin only)
submit_proof(env, wallet, proof_hash, proof_type, score_delta)

// Read profile
get_profile(env, wallet) -> SkillProfile

// Read score
get_score(env, wallet) -> u32

// Read proofs
get_proofs(env, wallet) -> Vec<ProofRecord>

// Update score (admin)
update_score(env, wallet, category, new_score)

// Mark verified (admin)
verify_profile(env, wallet)
```

---

## MongoDB Queries

```javascript
// Find profile
db.profiles.findOne({ wallet: "GXXXXXX" })

// Find all proofs for wallet
db.proofs.find({ wallet_address: "GXXXXXX" })

// Count proofs
db.proofs.countDocuments({ wallet_address: "GXXXXXX" })

// Clear all data
db.profiles.deleteMany({})
db.proofs.deleteMany({})
```

---

## Common Errors & Fixes

| Error | Fix |
|-------|-----|
| "Freighter not found" | Install Freighter extension |
| "MongoDB connection refused" | Start mongod service |
| "CORS error" | Check FRONTEND_URL in .env |
| "GitHub sync fails" | Verify GitHub token in .env |
| "Contract ID not set" | Set CONTRACT_ID in backend .env |
| "Wallet connection failed" | Ensure testnet selected in Freighter |

---

## Testing

```bash
# Run all tests
npm test                    # Frontend linting
cd backend && npm test      # Backend unit tests
cd contracts/skill_oracle && cargo test  # Contract tests

# Run specific test
cd backend && npm test -- scorer.test.js

# Watch mode
cd backend && npm test -- --watch
```

---

## Component Tree

```
App
├── Navbar (wallet connect)
├── Router
│   ├── LandingPage
│   │   ├── AnimatedBackground
│   │   └── Hero + CTA
│   ├── ProfilePage
│   │   ├── SkillScoreGauge
│   │   ├── SkillBadge (x5)
│   │   └── ProofForm (tabs)
│   ├── SkillReport
│   ├── VerifierPage
│   │   ├── SearchForm
│   │   ├── SkillScoreGauge
│   │   └── SkillBadge (x4)
│   └── Dashboard
└── Toast
```

---

## State Management

**WalletContext**
- `wallet.isConnected` - Boolean
- `wallet.publicKey` - Wallet address
- `wallet.network` - 'testnet' | 'mainnet'

**ToastContext**
- `toasts` - Array of {id, message, type}
- `addToast(msg, type, duration)` - Add notification
- `removeToast(id)` - Remove notification

---

## Database Schemas

**Profile**
```javascript
{
  wallet: String (unique),
  total_score: Number,
  github_score: Number,
  hackathon_score: Number,
  oss_score: Number,
  bugbounty_score: Number,
  freelance_score: Number,
  proof_count: Number,
  last_updated: Date,
  is_verified: Boolean,
  proof_hashes: [String],
  timestamps: true
}
```

**Proof**
```javascript
{
  proof_hash: String (unique),
  proof_type: Number (1-5),
  wallet_address: String,
  score_delta: Number,
  timestamp: Date,
  submitter: String,
  proof_data: Mixed,
  is_verified_on_chain: Boolean,
  on_chain_tx_id: String,
  timestamps: true
}
```

---

## Deployment Checklist

- [ ] Set all environment variables
- [ ] Run tests locally
- [ ] Build frontend: `npm run build`
- [ ] Deploy frontend to Vercel
- [ ] Deploy backend to Railway/Render
- [ ] Deploy contract to Stellar mainnet
- [ ] Verify APIs are accessible
- [ ] Test wallet connection
- [ ] Test proof submission
- [ ] Verify scores calculate correctly

---

## Performance Tips

- Use `/api/profile/:wallet/score` for employer verification (lightweight)
- GitHub sync is cached (not called every request)
- MongoDB queries use indexes (check with `explain()`)
- Frontend bundle is <200KB
- Rate limit: 100 req/15min per IP

---

## Security Reminders

- ✅ Never commit `.env` files
- ✅ GitHub token should have `public_repo` scope only
- ✅ Validate all inputs server-side
- ✅ Sanitize proof data
- ✅ Use HTTPS in production
- ✅ Keep MongoDB password secure
- ✅ Rotate keys quarterly

---

## Useful Links

- [Freighter API Docs](https://github.com/stellar/freighter/blob/main/API_DOCUMENTATION.md)
- [Stellar SDK Docs](https://developers.stellar.org/docs/)
- [Soroban Docs](https://developers.stellar.org/docs/learn/smart-contracts)
- [React Docs](https://react.dev)
- [Tailwind Docs](https://tailwindcss.com/docs)
- [MongoDB Docs](https://docs.mongodb.com/)
- [Express Docs](https://expressjs.com/en/api.html)

---

## Need Help?

1. **Read**: README.md (full documentation)
2. **Demo**: DEMO.md (step-by-step walkthrough)
3. **Code**: Inline comments in all files
4. **Tests**: See `backend/tests/scorer.test.js` for examples
5. **Issues**: Check GitHub Issues

---

**Version**: 1.0.0 | **Last Updated**: January 2024
