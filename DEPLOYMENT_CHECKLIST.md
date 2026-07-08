# OpenSkills Oracle - Production Deployment Checklist

## Pre-Deployment Requirements

### ✅ Environment Setup

- [ ] Node.js 18+ installed
- [ ] MongoDB 5+ (or MongoDB Atlas account)
- [ ] Rust toolchain installed (for smart contract)
- [ ] Git configured
- [ ] GitHub account with personal access token
- [ ] Stellar testnet account with funds
- [ ] Freighter wallet extension installed

### ✅ Code Review

- [ ] All frontend code reviewed and tested
- [ ] All backend code reviewed and tested
- [ ] Smart contract code reviewed and tested
- [ ] No hardcoded secrets in code
- [ ] No console.log() debug statements left
- [ ] Error handling implemented
- [ ] Input validation complete
- [ ] Database indexes created

---

## Frontend Deployment (Vercel)

### Step 1: Prepare Build

```bash
# 1. Install dependencies
npm install

# 2. Create production build
npm run build

# 3. Test build locally
npm run preview

# 4. Verify dist/ folder created
ls -la dist/
```

### Step 2: Environment Variables

Create `.env.production`:
```
VITE_API_URL=https://your-backend-url.com
VITE_CONTRACT_ID=CAXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
```

### Step 3: Deploy to Vercel

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy
vercel --prod

# 4. Set environment variables in Vercel dashboard
# Project Settings > Environment Variables
```

### Step 4: Verify Deployment

- [ ] Frontend accessible at deployed URL
- [ ] Wallet connection works
- [ ] API calls reach backend
- [ ] No console errors (F12)
- [ ] Responsive on mobile

**Deployment Link**: `https://your-app.vercel.app`

---

## Backend Deployment (Railway or Render)

### Step 1: Prepare Repository

```bash
# 1. Create .env.production
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://your-app.vercel.app
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/openskilloracle
STELLAR_NETWORK=testnet
STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
CONTRACT_ID=CAXXXXXXX...
ORACLE_SECRET_KEY=SXXXXXXX... (keep secret!)
GITHUB_TOKEN=ghp_XXXXXXX... (keep secret!)

# 2. Test production build locally
npm run build  # if applicable
node server.js

# 3. Verify server starts and connects to DB
# Should see: "Server running on port 3000"
#            "MongoDB connected"
```

### Step 2: Deploy to Railway

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Link project
railway link

# 4. Add environment variables
railway variable add MONGODB_URI "mongodb+srv://..."
railway variable add CONTRACT_ID "CAXXXXXXX..."
railway variable add ORACLE_SECRET_KEY "SXXXXXXX..."
railway variable add GITHUB_TOKEN "ghp_XXXXXXX..."

# 5. Deploy
railway up
```

### Step 2 (Alternative): Deploy to Render

```bash
# 1. Go to https://render.com
# 2. Create new Web Service
# 3. Connect GitHub repository
# 4. Configure:
#    - Environment: Node
#    - Build Command: npm install
#    - Start Command: node server.js
# 5. Add Environment Variables:
#    - MONGODB_URI
#    - CONTRACT_ID
#    - ORACLE_SECRET_KEY
#    - GITHUB_TOKEN
# 6. Deploy
```

### Step 3: Verify Backend

```bash
# Test API endpoints
curl https://your-backend.railway.app/health
# Should return: {"status":"ok"}

# Test profile endpoint
curl https://your-backend.railway.app/api/profile/GBRPYHIL2CI3WHZDTOOQFC6EB4KJJGUJWVVF4LTGZCVYK5JSXNL63A3
```

**Backend URL**: `https://your-backend.railway.app`

---

## Smart Contract Deployment (Stellar Testnet)

### Step 1: Build WASM

```bash
cd contracts/skill_oracle

# 1. Install dependencies
cargo build --target wasm32-unknown-unknown --release

# 2. Check WASM file
ls -la target/wasm32-unknown-unknown/release/skill_oracle.wasm

# 3. Get file size (should be <1MB)
# Windows: dir target/wasm32-unknown-unknown/release/skill_oracle.wasm
# Mac/Linux: ls -lh target/wasm32-unknown-unknown/release/skill_oracle.wasm
```

### Step 2: Deploy Contract

```bash
# 1. Fund your account on testnet
# Go to: https://stellar.org/testnet#create-account

# 2. Set up Stellar CLI
# Follow: https://developers.stellar.org/docs/tools/stellar-cli/install

# 3. Configure Stellar CLI
stellar keys generate --name oracle-admin
stellar config set --global network testnet

# 4. Deploy contract
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/skill_oracle.wasm \
  --source oracle-admin \
  --network testnet

# Output will show: CONTRACT_ID = CXXXXXX...
```

### Step 3: Initialize Contract

```bash
# Get CONTRACT_ID from deployment output above
export CONTRACT_ID=CXXXXXX...

# Initialize with oracle admin
stellar contract invoke \
  --id $CONTRACT_ID \
  --source oracle-admin \
  --network testnet \
  -- initialize \
  --admin <oracle-admin-stellar-address>
```

### Step 4: Update Environment

```bash
# Update backend/.env
CONTRACT_ID=CXXXXXX...
ORACLE_SECRET_KEY=SXXXXXX... (oracle-admin secret)

# Update frontend/.env.production
VITE_CONTRACT_ID=CXXXXXX...
```

**Contract ID**: `CXXXXXX...`

---

## Database Setup (MongoDB Atlas)

### Step 1: Create MongoDB Atlas Account

- [ ] Go to https://cloud.mongodb.com
- [ ] Create account
- [ ] Create new project
- [ ] Create cluster (free tier available)

### Step 2: Configure Database

```bash
# 1. Create database user
# Username: openskilloracle
# Password: <strong-password>

# 2. Create database
# Name: openskilloracle

# 3. Whitelist IP addresses
# Add: 0.0.0.0/0 (or specific IPs)

# 4. Get connection string
# Format: mongodb+srv://username:password@cluster.mongodb.net/openskilloracle
```

### Step 3: Create Indexes

```bash
# Connect to MongoDB Atlas

# In MongoDB shell:
use openskilloracle

# Create indexes
db.profiles.createIndex({ wallet: 1 }, { unique: true })
db.profiles.createIndex({ last_updated: -1 })
db.proofs.createIndex({ proof_hash: 1 }, { unique: true })
db.proofs.createIndex({ wallet_address: 1 })
db.proofs.createIndex({ timestamp: -1 })
```

---

## Security Configuration

### Step 1: Environment Variables

- [ ] Never commit `.env` files
- [ ] All secrets use `.env.example` as template
- [ ] All team members know not to share secrets
- [ ] Rotate secrets quarterly

### Step 2: CORS Configuration

```javascript
// backend/server.js - Already configured
cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
})
```

### Step 3: Rate Limiting

```javascript
// backend/server.js - Already configured
rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
})
```

### Step 4: Helmet Security Headers

```javascript
// backend/server.js - Already configured
helmet() // Adds 15+ security headers
```

### Step 5: Input Validation

- [ ] All user inputs validated on backend
- [ ] Wallet addresses validated against Stellar format
- [ ] GitHub usernames sanitized
- [ ] Proof data validated before storage

---

## Post-Deployment Verification

### Frontend Checks

```bash
# 1. Check site loads
https://your-app.vercel.app

# 2. Open DevTools (F12)
# - Check Console: No errors
# - Check Network: All API calls succeed
# - Check Performance: Page loads in <3s

# 3. Test wallet connection
# - Click "Connect Wallet"
# - Should show address in navbar

# 4. Test profile submission
# - Go to My Profile
# - Submit test proof
# - Check score updates

# 5. Test verification
# - Go to Verify Skills
# - Enter wallet address
# - Should show profile with scores
```

### Backend Checks

```bash
# 1. Check health endpoint
curl https://your-backend.railway.app/health
# Response: {"status":"ok"}

# 2. Test API
curl https://your-backend.railway.app/api/profile/GBRPYHIL2CI3WHZDTOOQFC6EB4KJJGUJWVVF4LTGZCVYK5JSXNL63A3
# Should return profile data

# 3. Check logs
# Look for any ERROR messages
# Verify MongoDB connection successful

# 4. Test proof submission
curl -X POST https://your-backend.railway.app/api/proof/submit \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress":"GBRPYHIL2CI3WHZDTOOQFC6EB4KJJGUJWVVF4LTGZCVYK5JSXNL63A3",
    "proofType":"github",
    "proofData":{"username":"octocat"}
  }'
```

### Database Checks

```bash
# 1. Connect to MongoDB Atlas

# 2. Check collections created
show collections

# 3. Check indexes
db.profiles.getIndexes()
db.proofs.getIndexes()

# 4. Verify data storage
db.profiles.countDocuments()
db.proofs.countDocuments()
```

### Smart Contract Checks

```bash
# 1. Verify contract deployed
stellar contract info --id $CONTRACT_ID --network testnet

# 2. Call get_score function
stellar contract invoke \
  --id $CONTRACT_ID \
  --source oracle-admin \
  --network testnet \
  -- get_score \
  --wallet <wallet-address>
```

---

## Monitoring & Maintenance

### Daily Checks

- [ ] Check uptime monitors
- [ ] Review error logs
- [ ] Verify API response times
- [ ] Check database size

### Weekly Tasks

- [ ] Review user submissions
- [ ] Check GitHub rate limits
- [ ] Verify backups running
- [ ] Update dependencies (security patches)

### Monthly Tasks

- [ ] Review access logs
- [ ] Rotate secrets if needed
- [ ] Database optimization
- [ ] Performance analysis

### Security Updates

- [ ] Keep Node.js updated
- [ ] Update npm dependencies
- [ ] Monitor security advisories
- [ ] Rotate auth keys quarterly

---

## Rollback Plan

If deployment fails:

```bash
# Frontend
# - Revert deployment in Vercel dashboard
# - Or redeploy from previous commit

# Backend
# - Redeploy from Railway/Render dashboard
# - Or rollback to previous version in git

# Database
# - Restore from MongoDB Atlas backup
# - Located in: Project > Backups

# Smart Contract
# - Deploy new version with same or different contract ID
# - Update backend/frontend with new CONTRACT_ID
```

---

## Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Frontend Load Time | <3s | - |
| API Response Time | <200ms | - |
| Database Query | <100ms | - |
| Smart Contract Call | <5s | - |
| Uptime | 99.9% | - |

---

## Success Criteria

✅ Deployment successful when:

- [ ] Frontend accessible and responsive
- [ ] Backend API responding <200ms
- [ ] Database connected and indexes created
- [ ] Smart contract deployed and initialized
- [ ] Wallet connection works
- [ ] Proof submission works end-to-end
- [ ] Score calculation works
- [ ] Verification page works
- [ ] No console errors
- [ ] All monitoring active

---

## Post-Launch (Week 1)

- [ ] Monitor for errors continuously
- [ ] Check user feedback
- [ ] Verify Stellar network reliability
- [ ] Test GitHub API rate limits
- [ ] Prepare documentation for users

---

## Emergency Contacts

| Service | Contact | Status Page |
|---------|---------|------------|
| Vercel | vercel.com/support | https://www.vercelstatus.com |
| Railway/Render | support@railway.app | https://status.render.com |
| MongoDB Atlas | support.mongodb.com | https://status.mongodb.com |
| Stellar | stellar.org | https://status.stellar.org |

---

**Deployment Date**: _________________
**Deployed By**: _________________
**Verification Date**: _________________

---

For detailed setup instructions, see README.md
For architecture overview, see ARCHITECTURE.md
For troubleshooting, see TROUBLESHOOTING.md
