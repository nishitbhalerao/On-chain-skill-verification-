# OpenSkills Oracle - Troubleshooting Guide

## Common Issues & Solutions

### Frontend Issues

#### 1. "Freighter not found"

**Problem**: Wallet button shows connection error

**Solutions**:
- ✅ Install [Freighter](https://freighter.app) browser extension
- ✅ Enable extension in browser (check extension settings)
- ✅ Refresh the page after installing
- ✅ Switch to **demo mode** (app will work without Freighter)

**Demo Mode**: If Freighter not installed, wallet uses demo address:
```
GBRPYHIL2CI3WHZDTOOQFC6EB4KJJGUJWVVF4LTGZCVYK5JSXNL63A3
```

---

#### 2. "Failed to submit proof"

**Problem**: Proof submission returns error

**Check**:
1. Backend is running: `http://localhost:5000/health` should respond
2. MongoDB is connected (check backend logs)
3. GitHub token is valid (if using GitHub sync)
4. Network connectivity is good

**Fix**:
```bash
# Restart backend
cd backend && npm start

# Check logs for detailed errors
# Look for: "Failed to submit proof"
```

---

#### 3. "Score not updating"

**Problem**: Gauge shows 0 after proof submission

**Causes & Fixes**:

1. **API not responding**
   ```bash
   # Test API health
   curl http://localhost:5000/health
   # Should return: {"status":"ok"}
   ```

2. **MongoDB connection lost**
   ```bash
   # Check if MongoDB is running
   mongod --version
   # Restart MongoDB if needed
   ```

3. **Wallet not actually connected**
   - Click wallet button again
   - Make sure address appears in navbar
   - Check browser console (F12)

---

#### 4. "Page not loading / Blank screen"

**Solutions**:
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh page (Ctrl+Shift+R)
3. Check browser console (F12) for errors
4. Restart frontend: `npm run dev`

---

#### 5. "CORS error when submitting proof"

**Problem**: 
```
Access to XMLHttpRequest at 'http://localhost:5000/api/proof/submit' 
blocked by CORS policy
```

**Fix**:
```bash
# Update backend/.env
FRONTEND_URL=http://localhost:5173

# Restart backend
cd backend && npm start
```

---

### Backend Issues

#### 1. "MongoDB connection refused"

**Problem**: `ECONNREFUSED 127.0.0.1:27017`

**Solutions**:

1. **Check if MongoDB is running**
   ```bash
   # Windows
   mongod --version
   
   # If not installed, install from https://www.mongodb.com/try/download/community
   ```

2. **Start MongoDB**
   ```bash
   # Windows
   mongod
   
   # Or with Homebrew (Mac)
   brew services start mongodb-community
   ```

3. **Use MongoDB Atlas (Cloud)**
   ```bash
   # Update backend/.env
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/openskilloracle
   ```

---

#### 2. "Port 5000 already in use"

**Problem**: `Error: listen EADDRINUSE :::5000`

**Solutions**:
```bash
# Find process using port 5000
# Windows
netstat -ano | findstr :5000

# Kill process (replace PID)
taskkill /PID <PID> /F

# Or use different port
PORT=5001 npm start
```

---

#### 3. "GitHub API rate limit exceeded"

**Problem**: `API rate limit exceeded`

**Solutions**:
1. **Wait 1 hour** - Rate limits reset hourly
2. **Add GitHub token** to backend/.env:
   ```bash
   GITHUB_TOKEN=ghp_your_personal_access_token
   # Get token from: https://github.com/settings/tokens
   ```
3. **Create new token with these scopes**:
   - `public_repo` (read public repositories)
   - `read:user` (read user profile)

---

#### 4. "500 error on proof submission"

**Problem**: `Internal server error`

**Debug**:
1. Check backend console for error message
2. Look for validation errors
3. Verify wallet address format: `G[A-Z2-7]{55}`
4. Check MongoDB connection

**Common causes**:
- Invalid GitHub username
- Database connection lost
- Proof hash already exists (duplicate submission)

---

### Smart Contract Issues

#### 1. "Contract deployment fails"

**Problem**: `stellar contract deploy` command fails

**Solutions**:
```bash
# 1. Check Rust installation
rustup --version
rustup target list | grep wasm32

# 2. Install wasm target if missing
rustup target add wasm32-unknown-unknown

# 3. Clean and rebuild
cd contracts/skill_oracle
cargo clean
cargo build --target wasm32-unknown-unknown --release

# 4. Check file exists
ls -la target/wasm32-unknown-unknown/release/skill_oracle.wasm
```

---

#### 2. "SOROBAN_RPC_URL not configured"

**Problem**: Stellar Service not submitting to blockchain

**Fix**:
```bash
# Add to frontend/.env
VITE_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
VITE_CONTRACT_ID=CAXXXXXXXX...

# Add to backend/.env
SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
CONTRACT_ID=CAXXXXXXXX...
ORACLE_SECRET_KEY=SXXXXXXX... (Stellar secret key)
```

---

### Network Issues

#### 1. "Cannot reach http://localhost:5173"

**Check**:
1. Frontend is running: `npm run dev`
2. Port 5173 is not blocked
3. Try: `http://127.0.0.1:5173`
4. Check Vite output for errors

---

#### 2. "Cannot reach http://localhost:5000"

**Check**:
1. Backend is running: `npm start` (in backend folder)
2. Port 5000 is not blocked
3. MongoDB is connected
4. Check backend console for startup errors

---

#### 3. "Slow API responses (>1000ms)"

**Causes**:
1. Database is slow
2. GitHub API is slow
3. Network latency

**Solutions**:
- Check MongoDB indexes: `db.profiles.getIndexes()`
- Monitor API response times in browser (F12 > Network)
- Check GitHub rate limits

---

## Debugging Tips

### 1. Check Browser Console (F12)

Most frontend errors appear here:
- JavaScript errors
- Network errors
- CORS issues
- Missing environment variables

### 2. Check Backend Logs

Terminal where you ran `npm start` shows:
- MongoDB connection status
- API request logs
- Error messages with stack traces
- GitHub API calls

### 3. Check Network Tab (F12 > Network)

See all API calls:
- Request URL
- Response status (200, 404, 500, etc.)
- Response body
- Response time

### 4. Test API Endpoints Directly

```bash
# Test profile endpoint
curl http://localhost:5000/api/profile/GBRPYHIL2CI3WHZDTOOQFC6EB4KJJGUJWVVF4LTGZCVYK5JSXNL63A3

# Test health check
curl http://localhost:5000/health

# Test GitHub sync
curl -X POST http://localhost:5000/api/proof/github-sync \
  -H "Content-Type: application/json" \
  -d '{"walletAddress":"GBRPYHIL2CI3WHZDTOOQFC6EB4KJJGUJWVVF4LTGZCVYK5JSXNL63A3","githubUsername":"octocat"}'
```

### 5. Environment Variables

Print env vars to check they're set:
```bash
# Frontend
console.log(import.meta.env)

# Backend
console.log(process.env)
```

---

## Performance Issues

### 1. Slow Score Updates

**Check**:
- API response time (should be <200ms)
- Database query performance
- GitHub API latency

**Optimize**:
```bash
# Add database indexes
db.profiles.createIndex({ wallet: 1 })
db.profiles.createIndex({ last_updated: -1 })
db.proofs.createIndex({ wallet_address: 1 })
```

---

### 2. High CPU Usage

**Causes**:
- Infinite loops in frontend
- Slow MongoDB queries
- GitHub API polling too frequently

**Solutions**:
- Check browser console for JS errors
- Monitor backend CPU
- Reduce polling frequency in code

---

## Reset Data

### Clear Everything & Start Fresh

```bash
# 1. Delete MongoDB data
mongo
> db.profiles.deleteMany({})
> db.proofs.deleteMany({})

# 2. Clear browser cache
# Ctrl+Shift+Delete

# 3. Disconnect wallet
# Click "Disconnect" in navbar

# 4. Restart services
# Terminal 1: cd backend && npm start
# Terminal 2: npm run dev
```

---

## Getting Help

### Information to Provide

When asking for help, include:
1. **Error message** (full text)
2. **Browser console** (F12)
3. **Backend logs** (terminal output)
4. **What you were doing** (step-by-step)
5. **Environment** (Windows/Mac/Linux)

### Check Documentation

- **README.md** - Setup & API docs
- **DEMO.md** - Step-by-step walkthrough
- **ARCHITECTURE.md** - System design
- **QUICK_REFERENCE.md** - Common commands

---

## Emergency Restart

If everything is broken, try:

```bash
# 1. Stop all services (Ctrl+C in terminals)

# 2. Clean cache
npm cache clean --force
cd backend && rm -rf node_modules package-lock.json
cd .. && rm -rf node_modules package-lock.json

# 3. Reinstall
npm install
cd backend && npm install && cd ..

# 4. Start fresh
cd backend && npm start     # Terminal 1
npm run dev                 # Terminal 2 (new terminal)

# 5. Go to http://localhost:5173
```

---

**Still stuck?** Check the browser console (F12) - most issues show helpful error messages there!
