# Quick GitHub Setup Commands

## 🚀 Push to GitHub (First Time)

```bash
cd /Users/rajmaha/Sites/continue-project

# 1. Initialize Git
git init

# 2. Add all files
git add .

# 3. First commit
git commit -m "Initial commit: ERP CMS with Docker support"

# 4. Create repo on GitHub.com (PRIVATE), then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# 5. Push to GitHub
git branch -M main
git push -u origin main
```

## 📝 Create GitHub Token

1. Go to: https://github.com/settings/tokens
2. "Generate new token" → "Generate new token (classic)"
3. Select: `repo` (full control)
4. Generate and copy token
5. Use token as password when pushing

## ✅ What's Included

- ✅ All source code
- ✅ Docker files
- ✅ Documentation
- ✅ .env.example (template)
- ❌ .env (secrets - excluded)
- ❌ node_modules (excluded)
- ❌ uploads (excluded)

## 🔄 Daily Git Commands

```bash
# Check status
git status

# Add changes
git add .

# Commit
git commit -m "Description of changes"

# Push to GitHub
git push
```

## 📚 Full Guide

See [GITHUB_SETUP.md](GITHUB_SETUP.md) for complete documentation.

---

**Ready? Run the commands above to push your project to GitHub!** 🎉
