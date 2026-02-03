# GitHub Setup Guide - ERP CMS

Complete guide to push your ERP CMS project to a GitHub private repository.

## Quick Start

```bash
# 1. Initialize Git (if not already done)
cd /Users/rajmaha/Sites/continue-project
git init

# 2. Add all files
git add .

# 3. Create first commit
git commit -m "Initial commit: ERP CMS with Docker support"

# 4. Create private repo on GitHub (via web), then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# 5. Push to GitHub
git branch -M main
git push -u origin main
```

---

## Step-by-Step Guide

### Step 1: Verify Git Installation

```bash
git --version
# Should show: git version 2.x.x
```

If not installed:
```bash
# macOS
brew install git

# Or download from: https://git-scm.com/downloads
```

### Step 2: Configure Git (First Time Only)

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

Verify:
```bash
git config --list | grep user
```

### Step 3: Initialize Repository

```bash
cd /Users/rajmaha/Sites/continue-project

# Check if already initialized
ls -la | grep .git

# If not initialized, run:
git init
```

### Step 4: Review What Will Be Committed

```bash
# Check status
git status

# Should show files to be added (green)
# Should NOT show:
# - .env (contains secrets)
# - node_modules/ (large, dependencies)
# - uploads/ (user files)
```

### Step 5: Stage Files

```bash
# Add all files (respects .gitignore)
git add .

# Or add specific files
git add server.js package.json client/ models/ routes/

# Check what's staged
git status
```

### Step 6: Create First Commit

```bash
git commit -m "Initial commit: ERP CMS with Docker support

Features:
- Dynamic CMS with admin panel
- MongoDB database
- React frontend
- Docker deployment ready
- Email notifications
- Dynamic forms
- Job postings
- Product enquiries
- Contact management"
```

### Step 7: Create GitHub Repository

**Option A: Via GitHub Website**

1. Go to: https://github.com/new
2. Repository name: `erp-cms` (or your preferred name)
3. Description: "Full-stack ERP CMS with admin panel, Docker deployment, and email notifications"
4. Visibility: **Private** ⚠️ IMPORTANT
5. DO NOT initialize with README, .gitignore, or license
6. Click "Create repository"

**Option B: Via GitHub CLI**

```bash
# Install GitHub CLI (if not installed)
brew install gh

# Login
gh auth login

# Create private repo
gh repo create erp-cms --private --source=. --remote=origin

# Push
git push -u origin main
```

### Step 8: Connect Local to GitHub

Copy the commands from GitHub (after creating repo):

```bash
# Set main as default branch
git branch -M main

# Add remote origin
git remote add origin https://github.com/YOUR_USERNAME/erp-cms.git

# Verify remote
git remote -v
```

### Step 9: Push to GitHub

```bash
# Push to main branch
git push -u origin main

# Enter GitHub credentials if prompted
# (Use Personal Access Token, not password)
```

### Step 10: Verify on GitHub

Visit: `https://github.com/YOUR_USERNAME/erp-cms`

Should see:
- ✅ All source files
- ✅ README.md
- ✅ Docker files
- ✅ Documentation
- ❌ No .env file
- ❌ No node_modules
- ❌ No uploads folder contents

---

## GitHub Personal Access Token

Since GitHub no longer accepts passwords, you need a Personal Access Token:

### Create Token

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Note: "ERP CMS Repository Access"
4. Expiration: Choose duration (90 days recommended)
5. Select scopes:
   - ✅ `repo` (Full control of private repositories)
6. Click "Generate token"
7. **COPY THE TOKEN** (you won't see it again!)

### Use Token

When pushing:
```bash
git push -u origin main

# Username: your_github_username
# Password: paste_your_token_here
```

### Store Credentials (Optional)

```bash
# Store in keychain (macOS)
git config --global credential.helper osxkeychain

# Or cache for 1 hour
git config --global credential.helper 'cache --timeout=3600'

# Next push will remember credentials
```

---

## Common Git Commands

### Daily Workflow

```bash
# Check status
git status

# See changes
git diff

# Add specific files
git add file1.js file2.js

# Add all changes
git add .

# Commit with message
git commit -m "Add email notification feature"

# Push to GitHub
git push

# Pull latest changes (if working in team)
git pull
```

### Viewing History

```bash
# View commit history
git log

# Compact view
git log --oneline

# Last 5 commits
git log -5

# See what changed
git show <commit-hash>
```

### Branching

```bash
# Create new branch
git branch feature/new-feature

# Switch to branch
git checkout feature/new-feature

# Create and switch (shortcut)
git checkout -b feature/new-feature

# List branches
git branch

# Push branch to GitHub
git push -u origin feature/new-feature

# Merge branch to main
git checkout main
git merge feature/new-feature

# Delete branch
git branch -d feature/new-feature
```

### Undo Changes

```bash
# Discard changes in file
git checkout -- file.js

# Unstage file
git reset HEAD file.js

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes) ⚠️ DANGEROUS
git reset --hard HEAD~1
```

---

## What's Included in Repository

### Source Code
✅ Server files (server.js, app.js, etc.)
✅ Models (MongoDB schemas)
✅ Routes (API endpoints)
✅ Controllers
✅ Middleware
✅ Client (React frontend)
✅ Docker files

### Configuration
✅ package.json
✅ .env.example (template)
✅ .gitignore
✅ .dockerignore
✅ docker-compose.yml
✅ Dockerfile

### Documentation
✅ README.md
✅ All feature documentation
✅ Docker deployment guides
✅ API documentation

### Excluded (by .gitignore)
❌ .env (secrets)
❌ node_modules/ (dependencies)
❌ uploads/ (user files)
❌ logs/
❌ .DS_Store
❌ backups/

---

## Repository Structure on GitHub

```
erp-cms/
├── .dockerignore
├── .gitignore
├── .github/
├── Dockerfile
├── docker-compose.yml
├── docker-compose.dev.yml
├── package.json
├── server.js
├── README.md
├── client/
│   ├── package.json
│   ├── public/
│   └── src/
├── models/
│   ├── User.js
│   ├── Settings.js
│   ├── Page.js
│   └── ...
├── routes/
│   ├── auth.js
│   ├── settings.js
│   ├── pages.js
│   └── ...
├── middleware/
│   ├── auth.js
│   ├── upload.js
│   └── ...
├── utils/
│   └── email.js
├── uploads/
│   └── .gitkeep
└── [Documentation Files].md
```

---

## Secrets Management

### DO NOT commit these files:
- ❌ `.env` - Contains database passwords, JWT secrets, SMTP passwords
- ❌ `uploads/` - User-uploaded files
- ❌ `ssl/` - SSL certificates
- ❌ `backups/` - Database backups

### Instead, provide:
- ✅ `.env.example` - Template with dummy values
- ✅ Documentation explaining what to configure
- ✅ Instructions for setup

---

## Setting Up From GitHub

If cloning your repo on another machine:

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/erp-cms.git
cd erp-cms

# Copy environment template
cp .env.example .env

# Edit .env with actual values
nano .env

# Install dependencies
npm install
cd client && npm install && cd ..

# Create uploads directories
mkdir -p uploads/images uploads/media uploads/resumes uploads/gallery

# Start with Docker
docker-compose up -d

# Or start normally
npm run dev
```

---

## Branch Strategy (Recommended)

### Main Branch
- Production-ready code
- Always stable
- Protected (no direct pushes)

### Development Branch
```bash
git checkout -b development
# Make changes
git push -u origin development
```

### Feature Branches
```bash
git checkout -b feature/email-notifications
# Develop feature
git push -u origin feature/email-notifications
# Create Pull Request on GitHub
```

### Workflow
```
feature/xxx → development → main
```

---

## GitHub Actions (Optional)

Create `.github/workflows/test.yml` for automated testing:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Use Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
```

---

## Collaborators

To add team members:

1. Go to: `https://github.com/YOUR_USERNAME/erp-cms/settings/access`
2. Click "Invite a collaborator"
3. Enter their GitHub username
4. Choose permission level:
   - **Admin**: Full access
   - **Write**: Can push
   - **Read**: Can only view

---

## Protecting Secrets

### Environment Variables on Server

```bash
# On production server, create .env
cp .env.example .env

# Edit with production values
nano .env

# Never commit this file!
```

### GitHub Secrets (for CI/CD)

1. Go to: Repository → Settings → Secrets
2. Add secrets:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `SMTP_PASSWORD`
3. Use in GitHub Actions: `${{ secrets.MONGODB_URI }}`

---

## Troubleshooting

### Problem: Can't push (authentication failed)

**Solution:**
```bash
# Use Personal Access Token
# Username: your_github_username
# Password: your_token (not actual password)

# Or use SSH instead
git remote set-url origin git@github.com:YOUR_USERNAME/erp-cms.git
```

### Problem: Accidentally committed .env

**Solution:**
```bash
# Remove from Git history
git rm --cached .env
git commit -m "Remove .env from repository"

# Add to .gitignore (if not already)
echo ".env" >> .gitignore
git add .gitignore
git commit -m "Add .env to gitignore"

# Force push (⚠️ only if no one else has cloned)
git push --force

# Change all secrets in .env immediately!
```

### Problem: Repository too large

**Solution:**
```bash
# Check size
du -sh .git

# Remove large files from history
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch path/to/large/file' \
  --prune-empty --tag-name-filter cat -- --all

# Clean up
git gc --aggressive --prune=now
```

---

## Quick Reference

```bash
# Setup
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/USER/REPO.git
git push -u origin main

# Daily use
git status
git add .
git commit -m "Message"
git push

# Branching
git checkout -b feature/new
git push -u origin feature/new

# Undo
git reset --soft HEAD~1  # Undo commit, keep changes
git reset --hard HEAD~1  # Undo commit, discard changes ⚠️
```

---

## Next Steps

After pushing to GitHub:

1. ✅ Verify repository is private
2. ✅ Add collaborators if needed
3. ✅ Set up branch protection rules
4. ✅ Add repository description
5. ✅ Add topics/tags
6. ✅ Create GitHub Projects for task management
7. ✅ Set up GitHub Actions (CI/CD)
8. ✅ Document deployment process
9. ✅ Create backup strategy
10. ✅ Set up monitoring

---

**Ready to push!** 🚀

Your code is ready for GitHub. Just follow the Quick Start steps at the top!
