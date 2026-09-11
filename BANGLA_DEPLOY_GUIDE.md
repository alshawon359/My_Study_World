# 🚀 MY STUDY WORLD - Deployment Guide (Bangla)

## আমি কি করেছি (Kiro AI)

Research Papers আর AI/ML Roadmap এর জন্য database integration করেছি। এখন localStorage এর বদলে Aiven PostgreSQL database use হবে।

---

## 📝 তুমি এখন কি করবে (Step by Step)

### Step 1: Git Bash Open কর
1. **Git Bash** open কর (PowerShell না)
2. Project folder এ যাও:
```bash
cd "C:/Users/Laptop & Gadget/Desktop/StudyWorld/my-study-world"
```

### Step 2: কি কি file change হয়েছে দেখ
```bash
git status
```

তুমি দেখবে এই files গুলো change হয়েছে:
- ✅ `prisma/schema.prisma` - নতুন database models add হয়েছে
- ✅ `app/research/page.tsx` - Database use করে এখন
- ✅ `app/ai-roadmap/page.tsx` - Database use করে এখন  
- ✅ `app/api/research-papers/route.ts` - নতুন API
- ✅ `app/api/ai-roadmap/route.ts` - নতুন API
- ✅ `app/api/ai-roadmap/topics/route.ts` - নতুন API

### Step 3: সব changes add কর
```bash
git add .
```

এটা সব changed files একসাথে add করবে।

### Step 4: Commit কর
```bash
git commit -m "Database integration for Research Papers and AI Roadmap - now syncs across all browsers"
```

### Step 5: GitHub এ push কর
```bash
git push origin main
```

যদি error আসে "rejected" বলে, তাহলে:
```bash
git pull origin main --rebase
git push origin main
```

### Step 6: Vercel Deployment (Automatic)
Push করার পর:
1. **Vercel automatically build start করবে** (2-3 minutes লাগবে)
2. Vercel dashboard এ যাও: https://vercel.com
3. তোমার project এ click কর
4. "Deployments" tab এ build status দেখবে:
   - 🟡 **Building** - চলছে, wait কর
   - ✅ **Ready** - Done! Site live আছে
   - ❌ **Failed** - Error, নিচে দেখ কি করতে হবে

---

## 🔍 Build যদি Fail করে

### Vercel dashboard এ যা করবে:
1. Failed deployment এ click কর
2. "Build Logs" দেখ
3. Error message খুঁজে বের কর

### Common Errors:

#### Error 1: "Prisma client generation failed"
**Fix:** Usually Vercel automatically করে, but যদি না করে:
- `package.json` এ check কর এটা আছে কিনা:
```json
"scripts": {
  "postinstall": "prisma generate"
}
```

#### Error 2: "Module not found: @prisma/client"  
**Fix:** Vercel এ environment variables check কর:
- `DATABASE_URL` set আছে?
- `DIRECT_URL` set আছে?

#### Error 3: TypeScript errors
**Fix:** Usually Vercel এ first time এ হয় না, locally test করার দরকার নেই

---

## ✅ Deploy হয়ে গেলে Test কর

### Test 1: Research Papers
1. তোমার site এ যাও: `https://your-site.vercel.app/research`
2. একটা paper add কর
3. **Different browser** open কর (Chrome থেকে Edge বা phone)
4. Same site এ যাও
5. ✅ **Same paper দেখতে পাবে!**

### Test 2: AI Roadmap  
1. `/ai-roadmap` page এ যাও
2. নতুন level add কর
3. কিছু topics add কর
4. **Phone বা different device** থেকে open কর
5. ✅ **Same data দেখবে!**

---

## 🎯 কি পরিবর্তন হয়েছে (Summary)

### আগে (Before):
- Research papers **শুধু browser এর localStorage** এ save হতো
- AI Roadmap **শুধু browser এর localStorage** এ save হতো  
- ❌ অন্য browser/device এ data দেখা যেতো না
- ⚠️ Warning message দেখাতো

### এখন (After):
- Research papers **Aiven PostgreSQL database** এ save হয়
- AI Roadmap **Aiven PostgreSQL database** এ save হয়
- ✅ **যেকোনো browser/device থেকে same data**
- ✅ "Database Connected" badge দেখায়
- ✅ Add, Edit, Delete সব কিছু sync হয়

---

## 🛠️ সব Commands এক জায়গায়

```bash
# 1. Project folder এ যাও
cd "C:/Users/Laptop & Gadget/Desktop/StudyWorld/my-study-world"

# 2. কি change হয়েছে দেখ
git status

# 3. সব changes add কর
git add .

# 4. Commit কর (message দিয়ে)
git commit -m "Database integration complete"

# 5. GitHub এ push কর
git push origin main

# 6. Vercel dashboard check কর
# Link: https://vercel.com
```

---

## 🆘 Problem হলে কি করবে

### Problem 1: Git command কাজ করছে না
**Solution:** 
- PowerShell close কর
- **Git Bash** open কর
- ওখানে commands run কর

### Problem 2: "Permission denied" error
**Solution:**
```bash
git config --global user.email "your-email@gmail.com"
git config --global user.name "Your Name"
```

### Problem 3: Push করতে পারছি না
**Solution:**
```bash
# First pull কর
git pull origin main

# Conflict হলে manually fix কর
# Then commit & push
git add .
git commit -m "Fix conflicts"
git push origin main
```

### Problem 4: Vercel build failed
**Solution:**
1. Vercel dashboard এ "View Function Logs" click কর
2. Error message copy কর
3. Google এ search কর বা আমাকে বল

### Problem 5: Data show করছে না pages এ
**Solution:**
1. Browser console open কর (F12 press কর)
2. Console tab এ error আছে কিনা দেখ
3. Network tab এ API calls check কর
4. `/api/research-papers?userId=cmtszibhe0000uzf04p06d1fe` এটা browser এ paste করে test কর

---

## 📱 Checklist: সব কিছু ঠিক আছে কিনা

Deploy এর পর এগুলো test কর:

- [ ] Laptop থেকে research paper add করতে পারি
- [ ] Phone থেকে same paper দেখতে পারি
- [ ] Phone থেকে AI roadmap level add করতে পারি
- [ ] Laptop থেকে same level দেখতে পারি
- [ ] Paper edit করলে sync হয়
- [ ] Paper delete করলে everywhere থেকে delete হয়
- [ ] Topic complete toggle করলে sync হয়
- [ ] দুই pages এ "Database Connected" badge দেখাচ্ছে

---

## 💾 Database Information

**Provider:** Aiven PostgreSQL (Already connected তোমার `.env` file এ)  
**User ID:** `cmtszibhe0000uzf04p06d1fe` (তোমার ID - Shawon)

**New Tables Created:**
1. `StandaloneResearchPaper` - Research papers এর জন্য
2. `AIRoadmapLevel` - AI learning roadmap levels এর জন্য  
3. `AIRoadmapTopic` - Topics within levels এর জন্য

---

## 🎉 শেষ কথা

এই steps follow করলে:
1. ✅ Code GitHub এ চলে যাবে
2. ✅ Vercel automatically deploy করবে (2-3 minutes)
3. ✅ Research Papers সব browser এ sync হবে
4. ✅ AI Roadmap সব device এ sync হবে
5. ✅ আর কোনো localStorage warning নেই!

**Live Site:** Vercel dashboard থেকে link পাবে

---

## 📞 যদি কোনো সমস্যা হয়

1. Vercel dashboard এ যাও
2. Latest deployment এ click কর  
3. "Build Logs" পড় - সেখানে error message থাকবে
4. Common issue: Prisma generation - Vercel automatically করে
5. যদি table না থাকে: First API call এ error আসবে, তারপর automatic create হবে

---

## 🚨 Emergency: Build একেবারেই fail করছে

যদি একেবারেই deploy না হয়, তাহলে:

1. **Revert to previous working commit:**
```bash
git log --oneline
# Find the last working commit (like: 5e3e9f2)
git reset --hard 5e3e9f2
git push -f origin main
```

2. **Or contact:** GitHub repository তে issue create কর

---

**তৈরি করেছে:** Kiro AI  
**তারিখ:** ১১ সেপ্টেম্বর, ২০২৬  
**উদ্দেশ্য:** Database integration deployment এর complete Bangla guide

---

## 🔥 Quick Start (যদি তাড়াহুড়ো থাকে)

শুধু এই 5টা command run কর Git Bash এ:

```bash
cd "C:/Users/Laptop & Gadget/Desktop/StudyWorld/my-study-world"
git add .
git commit -m "Database integration"
git push origin main
# Then open: https://vercel.com (2-3 min wait করো)
```

Done! 🎉
