# Fix: Repository Not Found

## The Issue

You're trying to push to: `https://github.com/rajmaha/ERP-CMS.git`

This error means the repository doesn't exist on GitHub yet.

---

## Solution 1: Create Repository on GitHub (Recommended)

### Step 1: Go to GitHub
Visit: https://github.com/new

### Step 2: Create Repository
- **Repository name**: `ERP-CMS` (or any name you prefer)
- **Description**: "Full-stack ERP CMS with admin panel and Docker deployment"
- **Visibility**: ⚠️ **Private**
- **DO NOT** initialize with README, .gitignore, or license
- Click "**Create repository**"

### Step 3: Push Your Code
```bash
cd /Users/rajmaha/Sites/continue-project

# Push to the repository you just created
git push -u origin main
```

---

## Solution 2: Use GitHub CLI (Alternative)

If you have GitHub CLI installed:

```bash
cd /Users/rajmaha/Sites/continue-project

# Create private repo and push in one command
gh repo create ERP-CMS --private --source=. --remote=origin --push

# Or if you want a different name
gh repo create erp-cms-project --private --source=. --remote=origin --push
```

---

## Solution 3: Change Repository Name

If you want a different name:

```bash
cd /Users/rajmaha/Sites/continue-project

# Remove current remote
git remote remove origin

# Add new remote with different name
git remote add origin https://github.com/rajmaha/YOUR-NEW-REPO-NAME.git

# Then create repo on GitHub with that name and push
git push -u origin main
```

---

## Verify Remote

Check your remote URL:
```bash
cd /Users/rajmaha/Sites/continue-project
git remote -v
```

Should show:
```
origin  https://github.com/rajmaha/ERP-CMS.git (fetch)
origin  https://github.com/rajmaha/ERP-CMS.git (push)
```

---

## Authentication

When you push, you'll be asked for credentials:

**Username**: `rajmaha`
**Password**: Use your **Personal Access Token** (NOT your GitHub password)

### Create Token (if you don't have one):

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Name: "ERP CMS Repository"
4. Select scopes:
   - ✅ `repo` (full control of private repositories)
5. Click "Generate token"
6. **COPY THE TOKEN** - you won't see it again!
7. Use this token as your password when pushing

### Store Token in Keychain (macOS)

```bash
# Tell Git to use macOS keychain
git config --global credential.helper osxkeychain

# Next push will ask for credentials once, then remember
git push -u origin main
```

---

## Complete Step-by-Step

```bash
# 1. Go to https://github.com/new
# 2. Create repository named "ERP-CMS" (Private)
# 3. Don't initialize with anything
# 4. Click "Create repository"

# 5. In terminal:
cd /Users/rajmaha/Sites/continue-project

# 6. Verify remote (should already be set)
git remote -v

# 7. Push to GitHub
git push -u origin main

# 8. Enter credentials:
# Username: rajmaha
# Password: [Your Personal Access Token]

# 9. Done! Visit: https://github.com/rajmaha/ERP-CMS
```

---

## Troubleshooting

### Error: Authentication Failed

**Solution**: Use Personal Access Token, not password
```bash
# Get token from: https://github.com/settings/tokens
# Use token as password
```

### Error: Permission Denied

**Solution**: Make sure you're logged in as `rajmaha`
```bash
# Check current user
gh auth status

# Or login
gh auth login
```

### Error: Repository Already Exists

**Solution**: You already created it, just push
```bash
git push -u origin main
```

---

## Quick Commands

```bash
# Create repo on GitHub first, then:
cd /Users/rajmaha/Sites/continue-project
git push -u origin main
```

That's it! Just need to create the repository on GitHub first.

---

**Next Action**: Go to https://github.com/new and create the "ERP-CMS" repository!
