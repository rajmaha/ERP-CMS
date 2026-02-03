# Docker Setup - Updated Configuration

## Changes Made

✅ **Removed embedded Nginx** from docker-compose.yml  
✅ **Simplified to 2 services** (MongoDB + App only)  
✅ **App exposes port 5000** for your external Nginx to proxy  
✅ **Created NGINX_REVERSE_PROXY.md** with complete reverse proxy examples

---

## Architecture

### Your Setup

```
┌─────────────────────────────────┐
│   Your External Nginx           │
│   - Port 80/443                 │
│   - SSL/TLS termination         │
│   - Reverse proxy to :5000      │
└───────────────┬─────────────────┘
                │
                │ proxies to
                │ localhost:5000
                │
┌───────────────▼─────────────────┐
│   Docker: erp-cms-app           │
│   - Port 5000 (exposed)         │
│   - Node.js + React (built)     │
└───────────────┬─────────────────┘
                │
┌───────────────▼─────────────────┐
│   Docker: erp-cms-mongodb       │
│   - Port 27017 (internal only)  │
└─────────────────────────────────┘
```

---

## Quick Start

### 1. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
```env
# Update these for production
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
MONGO_ROOT_PASSWORD=YourSecurePassword123
JWT_SECRET=your-32-char-secret-key
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=SecurePassword123
```

### 2. Start Docker Containers

```bash
docker-compose up -d
```

This starts:
- ✅ MongoDB on internal network
- ✅ App on http://localhost:5000

### 3. Configure Your External Nginx

See **[NGINX_REVERSE_PROXY.md](NGINX_REVERSE_PROXY.md)** for complete configuration examples.

Basic setup:

```nginx
upstream erp_cms_app {
    server localhost:5000;
}

server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://erp_cms_app;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 4. Test

```bash
# Test Docker app directly
curl http://localhost:5000/health

# Test through your Nginx
curl http://yourdomain.com/health
```

---

## Docker Services

### App Service
- **Container**: erp-cms-app
- **Port**: 5000 (exposed to host)
- **Health Check**: http://localhost:5000/health
- **Restart**: unless-stopped
- **Volumes**: 
  - uploads_data (persistent uploads)
  - ./logs (application logs)

### MongoDB Service  
- **Container**: erp-cms-mongodb
- **Port**: 27017 (internal only, not exposed to host)
- **Health Check**: MongoDB ping
- **Restart**: unless-stopped
- **Volumes**:
  - mongodb_data (database files)
  - mongodb_config (configuration)

---

## Exposed Ports

| Service | Port | Exposed to Host | Purpose |
|---------|------|-----------------|---------|
| App | 5000 | ✅ Yes | HTTP API + Frontend |
| MongoDB | 27017 | ❌ No | Internal database |

**Note**: MongoDB is NOT exposed to the host for security. The app connects via Docker internal network.

---

## External Nginx Configuration

Your external Nginx should:

1. **Proxy to localhost:5000**
   ```nginx
   proxy_pass http://localhost:5000;
   ```

2. **Set proper headers**
   ```nginx
   proxy_set_header Host $host;
   proxy_set_header X-Real-IP $remote_addr;
   proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
   proxy_set_header X-Forwarded-Proto $scheme;
   ```

3. **Configure SSL/TLS** (your responsibility)
4. **Set max upload size** (for file uploads)
   ```nginx
   client_max_body_size 50M;
   ```

See **[NGINX_REVERSE_PROXY.md](NGINX_REVERSE_PROXY.md)** for:
- ✅ Complete HTTP configuration
- ✅ HTTPS/SSL configuration
- ✅ Rate limiting examples
- ✅ Security headers
- ✅ Gzip compression
- ✅ Static file caching
- ✅ Let's Encrypt setup
- ✅ Troubleshooting

---

## Common Commands

```bash
# Start services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up -d --build

# Enter app container
docker-compose exec app sh

# Backup database
docker-compose exec mongodb mongodump \
  --username=admin \
  --password=changeme123 \
  --archive > backup.dump
```

---

## Important Configuration

### Update FRONTEND_URL

In `.env`, set your actual domain:

```env
FRONTEND_URL=https://yourdomain.com
```

This is used for:
- CORS configuration
- Email notification links
- OAuth redirects

### Firewall Configuration

Since you're using external Nginx:

```bash
# Your external Nginx handles these
# No need to expose from Docker

# Optionally block direct access to app port
sudo ufw deny 5000/tcp

# Or allow only from localhost
sudo ufw allow from 127.0.0.1 to any port 5000
```

---

## Health Checks

### Docker Internal Health Checks

The app container has automatic health checks:
- Endpoint: http://localhost:5000/health
- Interval: 30 seconds
- Timeout: 10 seconds
- Retries: 3

Container will auto-restart if unhealthy.

### External Monitoring

Configure your Nginx to monitor:

```nginx
location /health {
    access_log off;  # Don't log health checks
    proxy_pass http://localhost:5000/health;
}
```

Then monitor from outside:
```bash
curl https://yourdomain.com/health
```

---

## Security Considerations

### 1. App Port Exposure
- App runs on port 5000
- Only exposed to localhost (127.0.0.1)
- Not accessible from internet directly
- Only through your Nginx reverse proxy

### 2. MongoDB Security
- NOT exposed to host machine
- Only accessible from app container
- Uses Docker internal network
- Strong password required

### 3. Your Nginx Responsibilities
- ✅ SSL/TLS encryption
- ✅ Rate limiting
- ✅ Security headers
- ✅ Access logging
- ✅ Firewall rules

---

## Backup & Restore

### Database Backup

```bash
docker-compose exec -T mongodb mongodump \
  --username=admin \
  --password=changeme123 \
  --authenticationDatabase=admin \
  --db=erp_cms \
  --archive | gzip > backup_$(date +%Y%m%d).dump.gz
```

### Uploads Backup

```bash
docker run --rm \
  -v erp_cms_uploads_data:/uploads \
  -v $(pwd):/backup \
  alpine tar czf /backup/uploads_$(date +%Y%m%d).tar.gz -C /uploads .
```

### Restore Database

```bash
gunzip < backup_20240101.dump.gz | \
docker-compose exec -T mongodb mongorestore \
  --username=admin \
  --password=changeme123 \
  --authenticationDatabase=admin \
  --archive
```

---

## Troubleshooting

### Can't Access App

1. **Check Docker is running**:
   ```bash
   docker-compose ps
   ```

2. **Check app health**:
   ```bash
   curl http://localhost:5000/health
   ```

3. **Check logs**:
   ```bash
   docker-compose logs -f app
   ```

4. **Verify Nginx config**:
   ```bash
   sudo nginx -t
   sudo systemctl status nginx
   ```

### 502 Bad Gateway

- App container stopped: `docker-compose ps`
- App unhealthy: `docker-compose logs app`
- MongoDB issue: `docker-compose logs mongodb`
- Port conflict: `lsof -i :5000`

### Database Connection Failed

- Check MongoDB is running: `docker-compose ps`
- Check credentials in `.env`
- Verify MongoDB logs: `docker-compose logs mongodb`

---

## Documentation

- **[DOCKER_QUICKSTART.md](DOCKER_QUICKSTART.md)** - Quick start guide
- **[DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md)** - Complete deployment guide
- **[NGINX_REVERSE_PROXY.md](NGINX_REVERSE_PROXY.md)** - ⭐ Your Nginx configuration examples
- **[DOCKER_SUMMARY.md](DOCKER_SUMMARY.md)** - Architecture overview

---

## Summary

Your setup is now optimized for external Nginx:

✅ **Docker handles**: App + Database  
✅ **Your Nginx handles**: Reverse proxy, SSL, security  
✅ **Port 5000**: Exposed for your Nginx to proxy  
✅ **MongoDB**: Internal only, secure  

**Next steps**:
1. Start Docker: `docker-compose up -d`
2. Configure your Nginx (see NGINX_REVERSE_PROXY.md)
3. Point your domain to the server
4. Test: `curl https://yourdomain.com/health`

You're ready to deploy! 🚀
