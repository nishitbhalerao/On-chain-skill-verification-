# Quick Wallet Connection Test

## Step 1: Open the App
Visit: **http://localhost:5173**

You should see:
- ✅ Animated starfield background
- ✅ Hero text: "Skills you can't fake. Verified on-chain."
- ✅ "Connect Wallet & Build Your Profile" button (top-right in navbar)

---

## Step 2: Click "Connect Wallet" Button

**What happens:**
1. Button is located in top-right corner of navbar
2. Click it → Wallet connects (demo mode if Freighter not installed)
3. Button changes to show wallet address (truncated)
4. You see "(Demo)" badge if no real wallet

---

## Step 3: Verify Connection

After clicking, you should see:
- ✅ Navbar button now shows: `GXXXXXX...XXXX` (wallet address)
- ✅ Button color changes to red/pink with "Disconnect" option
- ✅ "(Demo)" badge visible if in demo mode

---

## Step 4: Go to Profile Page

Click **"My Profile"** in navbar (appears after wallet connects)

You'll see:
- ✅ Animated score gauge (0/1000)
- ✅ Five skill badges (all showing 0)
- ✅ "Submit Proof" form with tabs

---

## Step 5: Submit a Test Proof

1. Click **"GitHub"** tab
2. Enter username: `octocat` (or any GitHub user)
3. Click **"Submit GitHub Proof"** button
4. Wait for success toast notification

**Expected Result:**
- ✅ Toast: "GitHub proof submitted successfully!"
- ✅ Score gauge animates (goes up from 0)
- ✅ GitHub badge shows updated points
- ✅ Total score increases

---

## Step 6: Try Another Proof Type

Click **"Hackathon"** tab:
1. Enter URL: `https://devpost.com/software/test`
2. Enter Description: `Test hackathon`
3. Click **"Submit Hackathon Proof"** button

**Expected Result:**
- ✅ Second toast notification
- ✅ Score gauge animates higher
- ✅ Hackathon badge updates
- ✅ Total score increases further

---

## Step 7: Verify Your Skills

1. Click **"Verify Skills"** in navbar
2. Enter wallet address: `GBRPYHIL2CI3WHZDTOOQFC6EB4KJJGUJWVVF4LTGZCVYK5JSXNL63A3`
3. Click **"Verify"** button

**Expected Result:**
- ✅ Profile loads with your submitted proofs
- ✅ Score gauge shows your current score
- ✅ All skill badges visible with points
- ✅ Proof count shown

---

## Step 8: Disconnect Wallet

Click the wallet button (now showing address) → Button changes back to "Connect Wallet"

---

## 🎉 Success!

If you completed all steps, the wallet connection is **fully functional**!

### What to look for:
✅ Wallet connects without errors
✅ Can navigate between pages
✅ Can submit proofs
✅ Scores update in real-time
✅ Can verify profiles
✅ Animations work smoothly

### If Something Breaks:

**Error**: "Freighter not found"
- **Fix**: This is normal - means extension not installed. Demo mode will work.

**Error**: "Network error" when submitting
- **Fix**: Check backend is running: `http://localhost:5000/health`

**Error**: Toast doesn't appear
- **Fix**: Refresh browser, check browser console for errors

**Button doesn't respond**
- **Fix**: Refresh the page (Ctrl+R or Cmd+R)

---

## 📊 Expected Score Results

After submitting these proofs:
- GitHub (octocat): ~80-100 points
- Hackathon: ~20 points
- **Total**: ~100-120 points (out of 1000 max)

Each additional proof adds more points.

---

## 🔧 For Developers

Check browser console (F12) for logs:
```
✅ "Could not check Freighter installation" - Normal
✅ "Wallet connected successfully" - Working
✅ API requests logged - Check /api responses
```

Check backend logs (Terminal 1):
```
POST /api/proof/submit - Should show proof received
Success response with updated score
```

---

## Next Steps

After testing wallet connection:
1. ✅ Try adding more proofs of different types
2. ✅ Test with different wallet addresses
3. ✅ Install Freighter for real wallet testing
4. ✅ Check /verify page with different addresses
5. ✅ Test mobile responsiveness (resize browser)

---

**Ready?** Go to http://localhost:5173 and click that button! 🚀
