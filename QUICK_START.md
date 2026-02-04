# Quick Start Guide - Run Without Docker

Docker build is having issues with package locks. Here's a faster way to run your project:

## Quick Start (5 minutes)

```bash
cd /Users/rajmaha/Sites/continue-project

# 1. You already have .env file ✅

# 2. Start the app (MongoDB is already configured in .env)
npm run dev
```

That's it! Your app will start at: **http://localhost:5000**

---

## What's Configured

Your `.env` file already has MongoDB Atlas configured:
```
mongodb+srv://rajmaha:Chohbar570@cluster0.ggqbk.mongodb.net/?appName=Cluster0
```

This means:
- ✅ No need to install local MongoDB
- ✅ No need to start MongoDB
- ✅ Using cloud database (MongoDB Atlas)
- ✅ Just run `npm run dev`

---

## Start Development

### Terminal 1: Start Server

```bash
cd /Users/rajmaha/Sites/continue-project
npm run dev
```

This will:
- Start backend on http://localhost:5000
- Start frontend on http://localhost:3000
- Auto-reload on file changes

### Access:

- **Frontend**: http://localhost:3000 (React dev server)
- **Backend API**: http://localhost:5000
- **Admin**: http://localhost:3000/login

---

## Default Admin Login

- **Email**: admin@example.com (or check your .env ADMIN_EMAIL)
- **Password**: Admin@123 (or check your .env ADMIN_PASSWORD)

---

## Troubleshooting

### Port Already in Use

If port 5000 or 3000 is already in use:

```bash
# Find what's using the port
lsof -ti:5000 | xargs kill -9
lsof -ti:3000 | xargs kill -9

# Or change port in .env
PORT=5001
```

### MongoDB Connection Error

Your .env already has MongoDB Atlas URL. If you get connection error:

1. Check MongoDB Atlas is accessible
2. Check credentials are correct
3. Check network allows MongoDB Atlas

Or use local MongoDB:

```bash
# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community@7.0

# Start MongoDB
brew services start mongodb-community@7.0

# Update .env
MONGODB_URI=mongodb://localhost:27017/erp_cms
```

### Dependencies Error

```bash
# Reinstall dependencies
rm -rf node_modules client/node_modules
npm install
cd client && npm install && cd ..
```

---

## Development Workflow

```bash
# Start development
npm run dev

# In another terminal, make code changes
# Both frontend and backend will auto-reload

# Stop servers
# Ctrl + C in terminal
```

---

## Production Build

When ready for production:

```bash
# Build frontend
cd client
npm run build
cd ..

# Start production server
NODE_ENV=production npm start
```

Or use Docker:

```bash
# Make sure package-lock.json is up to date
npm install
cd client && npm install && cd ..

# Build with Docker
docker-compose up -d --build
```

---

## Why Skip Docker for Development?

**Docker (Production):**
- ✅ Great for deployment
- ✅ Consistent environment
- ❌ Slower builds (5-10 minutes)
- ❌ Harder to debug
- ❌ More complex setup

**Direct Node.js (Development):**
- ✅ Fast startup (30 seconds)
- ✅ Easy debugging
- ✅ Auto-reload on changes
- ✅ Simple setup
- ✅ See logs directly

---

## Recommended Setup

**Development:**
```bash
npm run dev
```

**Production:**
```bash
docker-compose up -d
```

---

## Quick Commands

```bash
# Start development
npm run dev

# Start backend only
npm run server

# Start frontend only  
cd client && npm start

# Install dependencies
npm install
cd client && npm install

# Build for production
cd client && npm run build

# Check logs
# They appear directly in terminal

# Stop
# Ctrl + C
```

---

## Your Current Setup

Based on your `.env`:

✅ MongoDB: **MongoDB Atlas** (cloud)
✅ Database: `cluster0.ggqbk.mongodb.net`
✅ No local MongoDB needed
✅ Just run: `npm run dev`

---

## Next Steps

1. **Start the app:**
   ```bash
   cd /Users/rajmaha/Sites/continue-project
   npm run dev
   ```

2. **Open browser:**
   http://localhost:3000

3. **Login:**
   - Email: admin@example.com
   - Password: Admin@123

4. **Start developing!**

---

## Docker Later (Optional)

Once everything works, you can build for Docker:

```bash
# Update package locks
npm install
cd client && npm install && cd ..

# Build Docker
docker-compose up -d --build

# This time it should work!
```

But for now, **just use `npm run dev`** - it's much faster! 🚀

---

**TL;DR:**

```bash
cd /Users/rajmaha/Sites/continue-project
npm run dev
# Open http://localhost:3000
# Login with admin@example.com / Admin@123
```

Done! 🎉
