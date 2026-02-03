# Docker Quick Start 🐳

Deploy ERP CMS with Docker in 3 simple steps!

## 🚀 Quick Deploy

```bash
# 1. Clone and navigate
git clone <repository-url>
cd continue-project

# 2. Configure environment
cp .env.example .env
# Edit .env with your settings (see below)

# 3. Start everything
docker-compose up -d

# ✅ Done! Access at http://localhost:5000
```

## ⚙️ Minimum Configuration

Edit `.env` and change these:

```env
# Strong passwords!
MONGO_ROOT_PASSWORD=YourSecurePassword123
JWT_SECRET=your-super-long-random-secret-at-least-32-chars

# Admin login
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=SecurePassword123

# Email notifications
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

## 📦 What Gets Started

- ✅ MongoDB database (port 27017)
- ✅ Node.js API (port 5000)
- ✅ React frontend (built and served)
- ✅ Automatic health checks
- ✅ Persistent data volumes

## 🎯 Common Commands

```bash
# View logs
docker-compose logs -f

# Check status
docker-compose ps

# Stop services
docker-compose down

# Restart services
docker-compose restart

# Update and restart
git pull
docker-compose up -d --build
```

## 🔐 First Login

After starting, go to: **http://localhost:5000/login**

Use credentials from `.env`:
- Email: `ADMIN_EMAIL`
- Password: `ADMIN_PASSWORD`

⚠️ **Change password immediately after first login!**

## 🛠️ Development Mode

For development with hot reload:

```bash
docker-compose -f docker-compose.dev.yml up
```

Access:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 📚 Full Documentation

See [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md) for:
- Complete configuration guide
- Nginx reverse proxy setup
- SSL/HTTPS configuration
- Backup & restore procedures
- Monitoring & logging
- Troubleshooting
- Production checklist

## ⚡ Quick Tips

**Reset everything:**
```bash
docker-compose down -v
docker-compose up -d --build
```

**Backup database:**
```bash
docker-compose exec mongodb mongodump \
  --username=admin \
  --password=changeme123 \
  --archive > backup.dump
```

**View MongoDB:**
```bash
docker-compose exec mongodb mongosh \
  -u admin -p changeme123 --authenticationDatabase admin
```

**Check health:**
```bash
curl http://localhost:5000/health
```

## 🆘 Having Issues?

1. Check logs: `docker-compose logs -f app`
2. Verify MongoDB: `docker-compose logs mongodb`
3. Check ports: `lsof -i :5000`
4. See [Troubleshooting](DOCKER_DEPLOYMENT.md#troubleshooting)

## 🌟 Production Deployment

For production with Nginx and SSL:

```bash
# Copy SSL certificates to ./ssl/
# Edit nginx.conf for your domain
docker-compose --profile with-nginx up -d
```

Access on port 80/443 through Nginx.

---

**Need help?** Check the [full documentation](DOCKER_DEPLOYMENT.md)!
