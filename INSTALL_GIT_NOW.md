# 🚀 Git Install করুন - VidPilot GitHub Push এর জন্য

## ❌ সমস্যা: Git installed নেই

আপনার system এ Git installed নেই, তাই GitHub এ push করতে পারছেন না।

## ✅ সমাধান: Git Install করুন

### Step 1: Git Download করুন

1. **এই link এ যান:** https://git-scm.com/download/windows
2. **"64-bit Git for Windows Setup" download করুন**
3. **File size:** প্রায় 50MB

### Step 2: Git Install করুন

1. **Downloaded file run করুন** (Git-2.x.x-64-bit.exe)
2. **Installation wizard follow করুন:**
   - "Next" click করুন সব steps এ
   - সব default options রাখুন
   - "Install" click করুন
3. **Installation complete হলে "Finish" click করুন**

### Step 3: Verify Installation

1. **Command Prompt বা PowerShell restart করুন**
2. **এই command run করুন:**
   ```bash
   git --version
   ```
3. **Output দেখবেন:** `git version 2.x.x.windows.x`

## 🎯 Git Install এর পর Commands

### VidPilot folder এ যান:
```bash
cd "C:\Users\Sazzad Islam\Desktop\Vidpilot"
```

### Git Configuration (প্রথমবার):
```bash
git config --global user.name "SAZZAD-404"
git config --global user.email "your-email@gmail.com"
```

### GitHub এ Push করুন:
```bash
# 1. Git initialize
git init

# 2. All files add
git add .

# 3. First commit
git commit -m "🚀 Initial commit: VidPilot - AI Social Media Content Generator"

# 4. GitHub remote add
git remote add origin https://github.com/SAZZAD-404/VidPilot.git

# 5. Main branch set
git branch -M main

# 6. Push to GitHub
git push -u origin main
```

## 🔧 Alternative: GitHub Desktop (GUI)

যদি command line ব্যবহার করতে না চান:

1. **GitHub Desktop download করুন:** https://desktop.github.com/
2. **Install করুন**
3. **GitHub account দিয়ে login করুন**
4. **"Add an Existing Repository from your Hard Drive" select করুন**
5. **VidPilot folder select করুন**
6. **"Publish repository" click করুন**

## 📱 Quick Steps Summary

1. ✅ **Git download:** https://git-scm.com/download/windows
2. ✅ **Install Git** with default options
3. ✅ **Restart Command Prompt**
4. ✅ **Navigate to VidPilot folder**
5. ✅ **Run Git commands** to push to GitHub

## 🎯 After Git Installation

আপনার terminal এ এই commands run করুন:

```bash
# VidPilot folder এ যান
cd "C:\Users\Sazzad Islam\Desktop\Vidpilot"

# Git version check
git --version

# Git configure
git config --global user.name "SAZZAD-404"
git config --global user.email "your-email@gmail.com"

# Push to GitHub
git init
git add .
git commit -m "🚀 Initial commit: VidPilot"
git remote add origin https://github.com/SAZZAD-404/VidPilot.git
git branch -M main
git push -u origin main
```

## 🛠️ Troubleshooting

### যদি Git install এর পর command কাজ না করে:
1. **Command Prompt completely close করুন**
2. **নতুন Command Prompt open করুন**
3. **`git --version` command try করুন**

### যদি PATH issue হয়:
1. **System Properties → Environment Variables**
2. **PATH variable এ Git folder add করুন**
3. **Usually:** `C:\Program Files\Git\bin`

---

## 🚀 Next Steps

1. **Git install করুন** (5 minutes)
2. **Command Prompt restart করুন**
3. **VidPilot folder এ navigate করুন**
4. **Git commands run করুন**
5. **GitHub এ আপনার project live দেখুন!**

**Git install করার পর আপনার VidPilot project GitHub এ push হয়ে যাবে! 🎯**