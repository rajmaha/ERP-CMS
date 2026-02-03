# Docker Deployment Guide

Complete guide for deploying ERP CMS using Docker and Docker Compose.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Prerequisites](#prerequisites)
- [Production Deployment](#production-deployment)
- [Development Setup](#development-setup)
- [Configuration](#configuration)
- [Nginx Reverse Proxy](#nginx-reverse-proxy)
- [Monitoring & Logs](#monitoring--logs)
- [Backup & Restore](#backup--restore)
- [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### Production (Single Command)

```bash
# 1. Clone the repository
git clone <repository-url>
cd continue-project

# 2. Create environment file
cp .env.example .env
# Edit .env with your configuration

# 3. Start all services
docker-compose up -d

# 4. Check status
docker-compose ps

# Access the application at http://localhost:5000
```

### Development (With Hot Reload)

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up

# Access frontend at http://localhost:3000
# Access backend at http://localhost:5000
```

---

## 📦 Prerequisites

### Required Software

- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 2.0 or higher

### Installation

#### macOS
```bash
# Install Docker Desktop (includes Docker Compose)
brew install --cask docker
```

#### Linux (Ubuntu/Debian)
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### Windows
- Download and install [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop)

### Verify Installation

```bash
docker --version
docker-compose --version
```

---

## 🏭 Production Deployment

### Step 1: Environment Configuration

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Edit `.env` with your production settings:

```env
# Application
NODE_ENV=production
APP_PORT=5000
FRONTEND_URL=https://yourdomain.com

# MongoDB
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=YourSecurePassword123!
MONGO_DB_NAME=erp_cms_prod

# JWT
JWT_SECRET=your-super-long-random-secret-key-min-32-characters
JWT_EXPIRE=30d

# Admin User
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=SecureAdminPassword123!
ADMIN_NAME=Admin User

# SMTP (Required for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=noreply@yourdomain.com
SMTP_FROM_NAME=Your Company Name
```

### Step 2: Build and Start Services

```bash
# Build images
docker-compose build

# Start all services in detached mode
docker-compose up -d

# Or build and start in one command
docker-compose up -d --build
```

### Step 3: Verify Deployment

```bash
# Check service status
docker-compose ps

# Check logs
docker-compose logs -f

# Test health endpoint
curl http://localhost:5000/health
```

### Step 4: Create Admin User

The admin user is automatically created on first startup using the credentials from `.env`.

Default login:
- **Email**: admin@example.com (or your ADMIN_EMAIL)
- **Password**: Admin@123 (or your ADMIN_PASSWORD)

⚠️ **Important**: Change the default admin password immediately after first login!

---

## 🛠️ Development Setup

For local development with hot reload:

### Start Development Environment

```bash
# Start all services with hot reload
docker-compose -f docker-compose.dev.yml up

# Or in detached mode
docker-compose -f docker-compose.dev.yml up -d
```

### Access Services

- **Frontend**: http://localhost:3000 (React Dev Server)
- **Backend API**: http://localhost:5000 (Node.js with Nodemon)
- **MongoDB**: localhost:27017

### Development Features

✅ Hot reload for both frontend and backend  
✅ Source code mounted as volumes  
✅ All dependencies installed in containers  
✅ Separate development database

### Stop Development Environment

```bash
docker-compose -f docker-compose.dev.yml down
```

---

## ⚙️ Configuration

### Service Architecture

```
┌─────────────────┐
│   Nginx (80)    │  ← Optional Reverse Proxy
└────────┬────────┘
         │
┌────────▼────────┐
│   App (5000)    │  ← Node.js + React (Built)
└────────┬────────┘
         │
┌────────▼────────┐
│ MongoDB (27017) │  ← Database
└─────────────────┘
```

### Docker Compose Services

#### 1. MongoDB
- **Image**: mongo:7.0
- **Port**: 27017
- **Data**: Persisted in `mongodb_data` volume
- **Health Check**: Automatic ping test every 10s

#### 2. App (Node.js + React)
- **Port**: 5000
- **Volumes**: 
  - `uploads_data`: For uploaded files
  - `./logs`: For application logs (optional)
- **Health Check**: HTTP GET to /health every 30s
- **Dependencies**: Waits for MongoDB to be healthy

#### 3. Nginx (Optional)
- **Ports**: 80, 443
- **Profile**: `with-nginx` (enabled separately)
- **Purpose**: Reverse proxy, SSL termination, rate limiting

### Environment Variables

All configuration via `.env` file. See [.env.example](.env.example) for all options.

**Critical Variables**:
- `JWT_SECRET`: Must be at least 32 characters
- `MONGO_ROOT_PASSWORD`: Strong password recommended
- `ADMIN_PASSWORD`: Change default immediately

---

## 🌐 Nginx Reverse Proxy

### Enable Nginx

```bash
# Start with Nginx profile
docker-compose --profile with-nginx up -d
```

### Features

- ✅ SSL/TLS termination
- ✅ Rate limiting (100 req/min for API, 20 req/min for auth)
- ✅ Gzip compression
- ✅ Static file caching
- ✅ Security headers

### SSL Configuration

1. Get SSL certificates (Let's Encrypt recommended)
2. Place certificates in `./ssl/` directory:
   ```
   ssl/
   ├── cert.pem
   └── key.pem
   ```
3. Uncomment HTTPS section in `nginx.conf`
4. Restart Nginx:
   ```bash
   docker-compose restart nginx
   ```

### Let's Encrypt Example

```bash
# Install Certbot
sudo apt install certbot

# Get certificate
sudo certbot certonly --standalone -d yourdomain.com

# Copy certificates
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ./ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ./ssl/key.pem
```

---

## 📊 Monitoring & Logs

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f mongodb

# Last 100 lines
docker-compose logs --tail=100 app

# Since specific time
docker-compose logs --since 30m app
```

### Service Status

```bash
# Check running services
docker-compose ps

# Check resource usage
docker stats

# Inspect service
docker-compose exec app sh
```

### Health Checks

All services have health checks:

```bash
# Check app health
curl http://localhost:5000/health

# MongoDB health (from inside container)
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"
```

---

## 💾 Backup & Restore

### Backup MongoDB

```bash
# Create backup directory
mkdir -p backups

# Backup database
docker-compose exec -T mongodb mongodump \
  --username=admin \
  --password=changeme123 \
  --authenticationDatabase=admin \
  --db=erp_cms \
  --archive > backups/erp_cms_$(date +%Y%m%d_%H%M%S).dump

# Or with gzip compression
docker-compose exec -T mongodb mongodump \
  --username=admin \
  --password=changeme123 \
  --authenticationDatabase=admin \
  --db=erp_cms \
  --archive | gzip > backups/erp_cms_$(date +%Y%m%d_%H%M%S).dump.gz
```

### Restore MongoDB

```bash
# Restore from backup
docker-compose exec -T mongodb mongorestore \
  --username=admin \
  --password=changeme123 \
  --authenticationDatabase=admin \
  --archive < backups/erp_cms_20240101_120000.dump

# Or from gzipped backup
gunzip < backups/erp_cms_20240101_120000.dump.gz | \
docker-compose exec -T mongodb mongorestore \
  --username=admin \
  --password=changeme123 \
  --authenticationDatabase=admin \
  --archive
```

### Backup Uploads

```bash
# Backup uploads directory
docker run --rm \
  -v erp_cms_uploads_data:/uploads \
  -v $(pwd)/backups:/backup \
  alpine tar czf /backup/uploads_$(date +%Y%m%d_%H%M%S).tar.gz -C /uploads .
```

### Restore Uploads

```bash
# Restore uploads directory
docker run --rm \
  -v erp_cms_uploads_data:/uploads \
  -v $(pwd)/backups:/backup \
  alpine tar xzf /backup/uploads_20240101_120000.tar.gz -C /uploads
```

### Automated Backup Script

Create `backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup MongoDB
echo "Backing up database..."
docker-compose exec -T mongodb mongodump \
  --username=admin \
  --password=changeme123 \
  --authenticationDatabase=admin \
  --db=erp_cms \
  --archive | gzip > $BACKUP_DIR/db_$DATE.dump.gz

# Backup uploads
echo "Backing up uploads..."
docker run --rm \
  -v erp_cms_uploads_data:/uploads \
  -v $(pwd)/$BACKUP_DIR:/backup \
  alpine tar czf /backup/uploads_$DATE.tar.gz -C /uploads .

echo "Backup completed: $BACKUP_DIR"
```

Make executable and run:
```bash
chmod +x backup.sh
./backup.sh
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Port Already in Use

**Problem**: Port 5000, 3000, or 27017 already in use

**Solution**:
```bash
# Find process using port
lsof -i :5000

# Kill process or change port in .env
APP_PORT=5001
```

#### 2. MongoDB Connection Failed

**Problem**: App can't connect to MongoDB

**Solutions**:
- Check MongoDB is running: `docker-compose ps`
- Check MongoDB health: `docker-compose logs mongodb`
- Verify credentials in `.env`
- Wait for MongoDB to be ready (health check)

#### 3. Permission Denied for Uploads

**Problem**: Can't write to uploads directory

**Solution**:
```bash
# Fix permissions
docker-compose exec app chmod -R 755 /app/uploads

# Or recreate volume
docker-compose down -v
docker-compose up -d
```

#### 4. React Build Fails

**Problem**: Out of memory during build

**Solution**:
```bash
# Increase Docker memory limit
# Docker Desktop → Settings → Resources → Memory: 4GB+

# Or build locally and copy
cd client
npm run build
cd ..
docker-compose up -d
```

#### 5. Database Not Persisting

**Problem**: Data lost after restart

**Solution**:
```bash
# Check volumes
docker volume ls | grep erp

# Don't use -v flag when stopping
docker-compose down  # Keep data
# NOT: docker-compose down -v  # Deletes data
```

### Debug Commands

```bash
# Enter app container
docker-compose exec app sh

# Enter MongoDB container
docker-compose exec mongodb mongosh -u admin -p changeme123

# Check environment variables
docker-compose exec app env

# Inspect logs
docker-compose logs --tail=100 -f app

# Rebuild without cache
docker-compose build --no-cache

# Remove everything and start fresh
docker-compose down -v
docker-compose up -d --build
```

### Performance Issues

```bash
# Check resource usage
docker stats

# Clean up unused Docker resources
docker system prune -a

# Limit container resources
# Add to docker-compose.yml:
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
```

---

## 🚀 Production Deployment Checklist

Before going to production:

- [ ] Change all default passwords
- [ ] Set strong JWT_SECRET (32+ characters)
- [ ] Configure SMTP for email notifications
- [ ] Set up SSL certificates for HTTPS
- [ ] Configure firewall rules
- [ ] Set up automated backups
- [ ] Configure monitoring/logging
- [ ] Test backup and restore procedures
- [ ] Set up domain name and DNS
- [ ] Configure Nginx reverse proxy
- [ ] Enable rate limiting
- [ ] Set up container restart policies
- [ ] Document admin credentials securely
- [ ] Test health checks
- [ ] Configure log rotation
- [ ] Set up alerts for service failures

---

## 📚 Additional Resources

### Docker Commands Reference

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop and remove containers + volumes
docker-compose down -v

# Rebuild images
docker-compose build

# View logs
docker-compose logs -f

# Execute command in container
docker-compose exec app sh

# Restart service
docker-compose restart app

# Scale service
docker-compose up -d --scale app=3
```

### Useful Aliases

Add to `~/.bashrc` or `~/.zshrc`:

```bash
alias dc='docker-compose'
alias dcup='docker-compose up -d'
alias dcdown='docker-compose down'
alias dclogs='docker-compose logs -f'
alias dcps='docker-compose ps'
```

---

## 🆘 Support

For issues or questions:

1. Check logs: `docker-compose logs -f`
2. Review troubleshooting section above
3. Check Docker documentation
4. Search existing issues
5. Create new issue with:
   - Docker version
   - Docker Compose version
   - OS version
   - Full error logs
   - Steps to reproduce

---

## 📄 License

MIT License - See LICENSE file for details
