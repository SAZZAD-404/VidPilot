# 🚀 Git Setup & GitHub Push Guide - VidPilot

## 📋 Step 1: Install Git

### Windows এ Git Install করুন:

1. **Git Download করুন:**
   - যান: https://git-scm.com/download/windows
   - "64-bit Git for Windows Setup" download করুন

2. **Git Install করুন:**
   - Downloaded file run করুন
   - সব default options রাখুন
   - "Install" click করুন

3. **Verify Installation:**
   ```bash
   # Command Prompt বা PowerShell এ run করুন
   git --version
   ```

## 📋 Step 2: Git Configuration

### প্রথমবার Git setup:

```bash
# আপনার name এবং email set করুন
git config --global user.name "SAZZAD-404"
git config --global user.email "your-email@gmail.com"

# Configuration check করুন
git config --list
```

## 📋 Step 3: Initialize Git Repository

### VidPilot project folder এ:

```bash
# Git repository initialize করুন
git init

# Check status
git status
```

## 📋 Step 4: Create .gitignore File

### Important files ignore করার জন্য:

```bash
# .gitignore file তৈরি করুন
```

### .gitignore Content:
```
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Production builds
dist/
build/

# Environment variables
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# Temporary folders
tmp/
temp/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Supabase
.supabase/

# Test files (optional - remove if you want to commit tests)
test-*.html
ai-test.html
*-test.html
```

## 📋 Step 5: Add Files to Git

### সব files add করুন:

```bash
# সব files stage করুন
git add .

# Check staged files
git status
```

## 📋 Step 6: First Commit

### Initial commit তৈরি করুন:

```bash
# First commit
git commit -m "🚀 Initial commit: VidPilot - AI Caption & Social Post Generator

✨ Features:
- AI Caption Generator with Z.ai, Groq, Gemini integration
- Social Post Generator for multiple platforms
- Image & Video AI analysis with Gemini Vision
- Export functionality (CSV, JSON, TXT, PDF)
- Activity History tracking
- Credit system with Stripe payments
- Mobile responsive dashboard
- Demo mode for testing

🤖 AI Services:
- Z.ai Advanced Conversational AI (Premium)
- Groq Llama 3.3 70B (Free & Unlimited)
- Google Gemini Flash 2.5 (Vision capabilities)
- HuggingFace Mistral-7B (Open source)
- Smart Fallback (Always works)

💳 Payment Integration:
- Stripe subscription system
- Pro & Enterprise plans
- Automatic credit management
- Webhook integration

🎨 UI/UX:
- Modern glass-morphism design
- Dark/Light theme support
- Responsive mobile layout
- Real-time notifications
- Progress indicators

🔧 Technical Stack:
- React + TypeScript + Vite
- Tailwind CSS + Framer Motion
- Supabase (Database & Auth)
- Stripe (Payments)
- Multiple AI APIs"
```

## 📋 Step 7: Add GitHub Remote

### GitHub repository connect করুন:

```bash
# GitHub remote add করুন
git remote add origin https://github.com/SAZZAD-404/VidPilot.git

# Check remote
git remote -v
```

## 📋 Step 8: Push to GitHub

### Code GitHub এ push করুন:

```bash
# Main branch set করুন
git branch -M main

# GitHub এ push করুন
git push -u origin main
```

## 🔧 Troubleshooting

### যদি Git command কাজ না করে:

1. **Git install হয়েছে কিনা check করুন:**
   ```bash
   git --version
   ```

2. **Command Prompt restart করুন** Git install এর পর

3. **PATH environment variable check করুন:**
   - Git installation folder PATH এ আছে কিনা

### যদি GitHub authentication error আসে:

1. **Personal Access Token তৈরি করুন:**
   - GitHub → Settings → Developer settings → Personal access tokens
   - "Generate new token" click করুন
   - Repo permissions দিন

2. **Token দিয়ে login করুন:**
   ```bash
   git config --global credential.helper store
   ```

### যদি repository already exists error আসে:

```bash
# Force push (first time only)
git push -u origin main --force
```

## 📱 Complete Command Sequence

### সব commands একসাথে:

```bash
# 1. Git initialize
git init

# 2. Add all files
git add .

# 3. First commit
git commit -m "🚀 Initial commit: VidPilot - AI Caption & Social Post Generator"

# 4. Add remote
git remote add origin https://github.com/SAZZAD-404/VidPilot.git

# 5. Set main branch
git branch -M main

# 6. Push to GitHub
git push -u origin main
```

## 🎯 After Successful Push

### GitHub এ যা দেখবেন:

- ✅ সব project files
- ✅ README.md with project description
- ✅ Proper folder structure
- ✅ All documentation files
- ✅ Source code organized

### Next Steps:

1. **README.md update করুন** project details দিয়ে
2. **GitHub Pages enable করুন** (optional)
3. **Issues এবং Projects setup করুন**
4. **Collaborators add করুন** (if needed)

---

## 🚀 Quick Start Commands

```bash
# Git install check
git --version

# If not installed, download from: https://git-scm.com/download/windows

# Setup (replace with your info)
git config --global user.name "SAZZAD-404"
git config --global user.email "your-email@gmail.com"

# Initialize and push
git init
git add .
git commit -m "🚀 Initial commit: VidPilot"
git remote add origin https://github.com/SAZZAD-404/VidPilot.git
git branch -M main
git push -u origin main
```

**Git install করার পর এই commands run করুন! 🎯**