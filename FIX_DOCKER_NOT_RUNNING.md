# Fix: Docker Daemon Not Running

## The Issue

```
Cannot connect to the Docker daemon at unix:///Users/rajmaha/.docker/run/docker.sock. 
Is the docker daemon running?
```

This means Docker Desktop is not running on your Mac.

---

## Quick Fix

### Step 1: Start Docker Desktop

**Option A: From Applications**
1. Open **Finder**
2. Go to **Applications**
3. Find **Docker** (or **Docker Desktop**)
4. Double-click to start
5. Wait for Docker icon to appear in menu bar (top-right)
6. Wait until it says "Docker Desktop is running"

**Option B: From Spotlight**
1. Press `Cmd + Space`
2. Type "Docker"
3. Press Enter
4. Wait for Docker to start

**Option C: From Terminal**
```bash
open -a Docker
```

### Step 2: Wait for Docker to Start

Look for Docker icon in menu bar (🐋). Click it and check status:
- ✅ "Docker Desktop is running" - Ready!
- ⏳ "Docker is starting..." - Wait a moment
- ❌ Error message - See troubleshooting below

### Step 3: Verify Docker is Running

```bash
docker ps
```

Should show container list (even if empty). If you see this, Docker is running!

### Step 4: Try Again

```bash
cd /Users/rajmaha/Sites/continue-project
docker-compose up -d
```

---

## Fix Docker Compose Version Warning

You also got this warning:
```
WARN: the attribute `version` is obsolete
```

### Fix the docker-compose.yml:

```bash
cd /Users/rajmaha/Sites/continue-project

# Remove the version line
sed -i '' '/^version:/d' docker-compose.yml
```

Or manually edit `docker-compose.yml` and remove the first line:
```yaml
version: '3.8'  # <-- Remove this line
```

---

## Complete Startup Sequence

```bash
# 1. Start Docker Desktop
open -a Docker

# 2. Wait for Docker (30-60 seconds)
# Watch the menu bar icon

# 3. Verify Docker is running
docker ps

# 4. Navigate to project
cd /Users/rajmaha/Sites/continue-project

# 5. Start containers
docker-compose up -d

# 6. Check status
docker-compose ps

# 7. View logs
docker-compose logs -f app
```

---

## Install Docker Desktop (if not installed)

If you don't have Docker Desktop installed:

### Download & Install:

1. Go to: https://www.docker.com/products/docker-desktop
2. Download **Docker Desktop for Mac**
3. Choose:
   - **Intel Chip**: Docker Desktop for Mac (Intel)
   - **Apple Silicon**: Docker Desktop for Mac (Apple Silicon)
4. Open the `.dmg` file
5. Drag Docker to Applications
6. Open Docker from Applications
7. Follow setup wizard

### Verify Installation:

```bash
docker --version
docker-compose --version
```

---

## Alternative: Run Without Docker

If you don't want to use Docker, run the project directly:

### Prerequisites:

```bash
# Install Node.js 18+ (if not installed)
# Download from: https://nodejs.org/

# Install MongoDB (if not installed)
brew tap mongodb/brew
brew install mongodb-community@7.0
```

### Start MongoDB:

```bash
brew services start mongodb-community@7.0
```

### Start Application:

```bash
cd /Users/rajmaha/Sites/continue-project

# Install dependencies
npm install
cd client && npm install && cd ..

# Copy environment
cp .env.example .env

# Edit .env - set MongoDB URI
nano .env
# Set: MONGODB_URI=mongodb://localhost:27017/erp_cms

# Start development servers
npm run dev
```

Access at: http://localhost:5000

---

## Troubleshooting

### Problem: Docker Desktop won't start

**Solutions:**

1. **Restart your Mac**
   ```bash
   sudo shutdown -r now
   ```

2. **Reset Docker Desktop**
   - Click Docker icon in menu bar
   - Click "Troubleshoot"
   - Click "Reset to factory defaults"
   - Confirm and restart Docker

3. **Check system requirements**
   - macOS 11 or newer
   - 4GB RAM minimum
   - VirtualBox not running (conflicts with Docker)

4. **Reinstall Docker**
   ```bash
   # Uninstall
   /Applications/Docker.app/Contents/MacOS/uninstall
   
   # Download and install again
   # https://www.docker.com/products/docker-desktop
   ```

### Problem: Permission denied

**Solution:**
```bash
sudo chown -R $USER:staff ~/.docker
```

### Problem: Docker daemon not responding

**Solution:**
```bash
# Kill Docker processes
killall Docker

# Restart Docker
open -a Docker
```

### Problem: Out of disk space

**Solution:**
```bash
# Clean up Docker
docker system prune -a --volumes

# This will remove:
# - All stopped containers
# - All networks not used by containers
# - All images without containers
# - All build cache
```

---

## Check Docker Status

```bash
# Check if Docker is running
docker info

# Check Docker version
docker --version
docker-compose --version

# Check containers
docker ps -a

# Check images
docker images

# Check disk usage
docker system df
```

---

## macOS Specific Issues

### Allow Docker in Security Settings

If macOS blocks Docker:

1. System Preferences → Security & Privacy
2. General tab
3. Click the lock to make changes
4. Allow Docker.app
5. Restart Docker

### Grant Docker Permissions

```bash
# Give Docker full disk access
# System Preferences → Security & Privacy → Privacy → Full Disk Access
# Add Docker
```

---

## Quick Reference

```bash
# Start Docker
open -a Docker

# Check status
docker ps

# Start project
cd /Users/rajmaha/Sites/continue-project
docker-compose up -d

# View logs
docker-compose logs -f

# Stop project
docker-compose down

# Restart
docker-compose restart

# Rebuild
docker-compose up -d --build
```

---

## Still Not Working?

### Option 1: Run without Docker

```bash
cd /Users/rajmaha/Sites/continue-project
npm run dev
```

### Option 2: Check Docker Logs

```bash
# Docker Desktop logs location
~/Library/Containers/com.docker.docker/Data/log/
```

### Option 3: Docker Support

- Visit: https://docs.docker.com/desktop/troubleshoot/overview/
- Community: https://forums.docker.com/

---

## Summary

**Most Common Solution:**

1. **Start Docker Desktop**
   ```bash
   open -a Docker
   ```

2. **Wait 30-60 seconds**

3. **Try again**
   ```bash
   docker-compose up -d
   ```

That's it! Just need Docker Desktop running first.

---

**Next Steps:**
1. Start Docker Desktop from Applications
2. Wait for it to fully start
3. Run `docker-compose up -d` again
