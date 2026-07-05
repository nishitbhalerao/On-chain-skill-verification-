# OpenSkills Oracle - Demo Guide

This guide walks through the complete user journey of OpenSkills Oracle.

## Prerequisites

1. **Freighter Wallet**: Install from [freighter.app](https://freighter.app)
2. **Testnet Account**: Fund one at [stellar.org/testnet](https://developers.stellar.org/guides/get-started)
3. **GitHub Account**: Required for GitHub skill verification
4. **Running Services**:
   - Frontend: `http://localhost:5173`
   - Backend: `http://localhost:5000`

## Demo Scenario

### Scenario: Developer Building Their Skill Profile

**User**: Alex, a full-stack developer with:
- GitHub commits and PRs
- Previous hackathon participation
- Open source contributions

---

## Step-by-Step Demo

### 1. Landing Page

**URL**: `http://localhost:5173/`

**Flow**:
1. User sees animated background with starfield
2. Hero section: "Skills you can't fake. Verified on-chain."
3. Three stat cards: "< 5s Verification", "Stellar Testnet", "Non-Transferable NFT"
4. Problem/Solution comparison (red vs green cards)
5. Six skill signal cards (GitHub, Hackathons, OSS, Bug Bounty, Freelance, Peer)
6. CTA: "Connect Wallet & Build Your Profile"

**Action**: Click "Connect Wallet & Build Your Profile"

### 2. Freighter Connection

**Flow**:
1. Modal appears: "OpenSkills Oracle wants to connect"
2. Click "Connect" in Freighter popup
3. Freighter verifies connection to testnet
4. Navbar updates: "Connect Wallet" → Shows truncated address (GXXXX...XXXX)

**Expected**: Navbar now shows connected wallet with "Disconnect" option

---

### 3. User Profile Page

**URL**: `http://localhost:5173/profile`

**Initial State**:
- SkillScoreGauge animates from 0 → 0 (new user)
- Five skill category badges below (all 0 points)
- "Submit Proof" form with tabs

**Flow**:

#### Step 3a: Submit GitHub Proof

1. Click "GitHub" tab in "Submit Proof" section
2. Input: GitHub username (e.g., "octocat")
3. Click "Submit GitHub Proof"
4. Spinner appears: "Submitting..."
5. Backend fetches GitHub data via GitHub API
6. Toast notification: "GitHub proof submitted successfully!"
7. Score updates (animated):
   - SkillScoreGauge: 0 → ~80 (based on commits/PRs)
   - GitHub badge: 0 → 80
   - Total score updates proportionally

**Expected Output**:
```
Score updated:
- GitHub: 80 pts (2 commits × 2 + 3 PRs × 15 + 20 stars × 0.5)
- Total: 80 pts
Toast: "GitHub proof submitted successfully!"
```

#### Step 3b: Submit Hackathon Proof

1. Click "Hackathon" tab
2. Input URL: `https://devpost.com/software/my-awesome-project`
3. Input Description: "Won 2nd place at HackXYZ 2024"
4. Click "Submit Hackathon Proof"
5. Backend scores: 80 pts (winner bonus)
6. Toast: "Hackathon proof submitted successfully!"
7. Scores update:
   - Hackathon badge: 0 → 80
   - Total: 80 + 80 = 160

#### Step 3c: Submit OSS Proof

1. Click "Open Source" tab
2. Input PR Link: `https://github.com/facebook/react/pull/28844`
3. Input Description: "Added performance optimization to React fiber"
4. Click "Submit OSS Proof"
5. Backend scores: 30 pts (merged PR in major repo)
6. Total: 160 + 30 = 190

#### Step 3d: Submit Bug Bounty Proof

1. Click "Bug Bounty" tab
2. Input Bounty Link: `https://hackerone.com/reports/123456`
3. Select Severity: "High"
4. Click "Submit Bug Bounty Proof"
5. Backend scores: 100 pts
6. Total: 190 + 100 = 290

#### Step 3e: Submit Freelance Proof

1. Click "Freelance" tab
2. Input Project Link: `https://upwork.com/freelancers/...`
3. Input Description: "Built REST API and React dashboard for SaaS"
4. Click "Submit Freelance Proof"
5. Backend scores: 25 pts
6. Total: 290 + 25 = 315

**Final Profile State**:
```
Total Score: 315 / 1000
- GitHub: 80 / 300
- Hackathon: 80 / 200
- OSS: 30 / 250
- Bug Bounty: 100 / 150
- Freelance: 25 / 100
Proofs Submitted: 5
```

---

### 4. Refresh Score

1. In Profile page, click "Refresh Score" button
2. Spinner shows: "Refreshing..."
3. Backend re-fetches GitHub data
4. Toast: "Profile refreshed"
5. Gauge and badges smoothly animate to updated values

---

### 5. Skill Report Page

**URL**: `http://localhost:5173/report`

**Expected**:
- Full breakdown of skills with detailed metrics
- Category-wise score breakdown
- Timeline of proof submissions
- Recency decay visualization

---

### 6. Verification Page (Employer View)

**URL**: `http://localhost:5173/verify`

**Flow**:
1. Input wallet address (copy from user's profile)
2. Click "Verify"
3. Spinner: "Verifying..."
4. Results load:
   - Animated score gauge (shows 315)
   - "Verified on-chain" badge (if verified)
   - Profile info: Wallet, proofs count, last updated
   - Category breakdown in badges
   - Share-friendly URL

**Share Section**:
```
Share this profile link with employers:
https://localhost:5173/verify?address=GXXXXXX...XXXX
```

**Actions Available**:
- Copy wallet address
- Share link
- View individual proofs (expandable list)

---

### 7. Dashboard

**URL**: `http://localhost:5173/dashboard`

**Expected**:
- Submission history
- Timeline of all proofs
- Category breakdown
- Export profile data option

---

## Advanced Features Demo

### Batch Submission Performance

**Test**: Submit 10 proofs rapidly

**Expected**:
- All proofs queue properly
- Backend handles rate limiting (100 req/15min)
- Scores accumulate correctly
- No lost or duplicate proofs

### Error Handling

**Test 1**: Invalid wallet address
- Result: Toast error "Invalid wallet address"

**Test 2**: Duplicate proof
- Result: Toast error "This proof has already been submitted"

**Test 3**: GitHub user not found
- Result: Toast error "GitHub user not found"

**Test 4**: Disconnected wallet
- Result: Redirects to login or shows connection prompt

### Recency Decay

**Test**: Submit proof with old timestamp
- Expected: Score decay applied (formula: `score * (0.3 + 0.7 * e^(-days/180))`)
- Score gradually decreases over 180 days

---

## Visual Inspection Checklist

- [ ] Animated background starfield on all pages
- [ ] Smooth gauge animations (0-1000)
- [ ] Glassmorphism cards (semi-transparent borders)
- [ ] Purple gradient buttons (stellar-purple)
- [ ] Toast notifications slide in/out
- [ ] Navbar color changes on wallet connect
- [ ] Mobile responsive layout (test on 375px width)
- [ ] Loading spinners on async operations
- [ ] Smooth hover effects on interactive elements

---

## Data Inspection

### MongoDB Collections

```javascript
// Check profiles
db.profiles.find()

// Check proofs
db.proofs.find()

// Count submissions
db.proofs.countDocuments({ wallet_address: "GXXXXXX..." })
```

### API Response Examples

#### GET /api/profile/:walletAddress
```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
  "wallet": "GBRPYHIL2CI3WHZDTOOQFC6EB4KJJGUJWVVF4LTGZCVYK5JSXNL63A3",
  "total_score": 315,
  "github_score": 80,
  "hackathon_score": 80,
  "oss_score": 30,
  "bugbounty_score": 100,
  "freelance_score": 25,
  "proof_count": 5,
  "last_updated": "2024-01-15T14:30:00.000Z",
  "is_verified": false,
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T14:30:00.000Z"
}
```

#### GET /api/proof/:walletAddress
```json
[
  {
    "_id": "...",
    "proof_hash": "abc123...",
    "proof_type": 1,
    "wallet_address": "GBRPYHIL2CI3...",
    "score_delta": 80,
    "timestamp": "2024-01-15T10:30:00.000Z",
    "submitter": "GBRPYHIL2CI3...",
    "proof_data": {
      "username": "octocat",
      "commits_90d": 12,
      "total_prs": 8,
      "total_stars": 150
    },
    "is_verified_on_chain": false
  }
  // ... more proofs
]
```

---

## Performance Testing

### Load Testing

**Tool**: Apache Bench or k6

```bash
# 100 concurrent users, 1000 requests
ab -n 1000 -c 100 http://localhost:5000/api/profile/GXXXXXX

# Expected: <200ms response time, <1% error rate
```

### Database Performance

```bash
# Check query performance
db.profiles.explain("executionStats").find({ wallet: "GXXXXXX" })

# Expected: Uses index, <1000 examined docs
```

---

## Smart Contract Testing

### Deploy Locally (Rust)

```bash
cd contracts/skill_oracle
cargo test
```

**Expected Output**:
```
running 4 tests

test tests::test_initialize - should pass
test tests::test_submit_proof_and_get_score - should pass
test tests::test_multiple_proofs - should pass
test tests::test_score_caps - should pass

test result: ok. 4 passed; 0 failed
```

---

## Cleanup

### Reset Demo Data

```bash
# Clear MongoDB collections
mongo openskilloracle
db.profiles.deleteMany({})
db.proofs.deleteMany({})

# Disconnect wallet in UI
# Click "Disconnect" on navbar
```

---

## Troubleshooting

### Issue: "Freighter not found"
- **Solution**: Ensure Freighter extension installed and enabled

### Issue: "MongoDB connection refused"
- **Solution**: Start MongoDB: `mongod` or `brew services start mongodb-community`

### Issue: CORS errors
- **Solution**: Check `FRONTEND_URL` in backend `.env` matches running frontend

### Issue: GitHub sync fails
- **Solution**: Verify GitHub token in backend `.env` has `public_repo` scope

### Issue: Slow score updates
- **Solution**: Check MongoDB indexes: `db.profiles.getIndexes()`

---

## Next Steps

After completing demo:

1. **Deploy to production**:
   - Build: `npm run build`
   - Deploy frontend to Vercel
   - Deploy backend to Railway
   - Deploy contract to Stellar mainnet

2. **Launch beta**:
   - Invite 50 developers
   - Collect feedback
   - Iterate on scoring algorithm

3. **Scale**:
   - Add peer attestation
   - Integrate more skill signals
   - Mobile app
   - DAO governance

---

**Ready to demo? Start with:** `http://localhost:5173`
