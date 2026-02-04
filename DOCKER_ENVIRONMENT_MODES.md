# Docker Environment Modes (Development vs Production)

## Overview
This project supports two deployment modes in Docker:

1. **Production Mode** (default)
   - Single container with both frontend and backend
   - React app pre-built
   - Optimized and production-ready
   - Serve frontend from: `http://localhost:5600`

2. **Development Mode** (for local development with hot reload)
   - Use `docker-compose.dev.yml` instead
   - Separate containers for frontend and backend
   - Hot reload enabled
   - Frontend runs on: `http://localhost:3000`
   - Backend API on: `http://localhost:5000`

---

## Production Mode (Default)

### How to Run
```bash
# Using default production settings
docker-compose up -d

# Or explicitly set NODE_ENV to production
NODE_ENV=production docker-compose up -d
```

### Environment File (`.env`)
```dotenv
NODE_ENV=production
APP_PORT=5600
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=changeme123
MONGO_DB_NAME=erp_cms
FRONTEND_URL=http://localhost:5600

# Other settings (JWT, SMTP, etc.)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### Access the Application
- **Application**: `http://localhost:5600`
- **API**: `http://localhost:5600/api`
- **Health Check**: `http://localhost:5600/health`

### Build & Run
```bash
# Build the Docker image (builds React app inside)
docker-compose build

# Start the container
docker-compose up -d

# View logs
docker-compose logs -f app
```

---

## Development Mode (Hot Reload)

### How to Run
```bash
# Use the development docker-compose file
docker-compose -f docker-compose.dev.yml up -d
```

### Environment (Auto-set in `docker-compose.dev.yml`)
- `NODE_ENV=development`
- Backend runs on port `5000`
- Frontend (React dev server) runs on port `3000`
- Database auto-configured with dev credentials

### Access the Application
- **React Frontend**: `http://localhost:3000` (with hot reload)
- **Backend API**: `http://localhost:5000/api`
- **Health Check**: `http://localhost:5000/health`

### Features
- **Hot Reload**: Changes to React code reflect immediately in browser
- **Backend Hot Reload**: Backend changes reload with `npm run dev`
- **MongoDB**: Dev instance with separate data volume

### Build & Run
```bash
# Build with dev Dockerfiles
docker-compose -f docker-compose.dev.yml build

# Start all services
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f frontend
docker-compose -f docker-compose.dev.yml logs -f backend
docker-compose -f docker-compose.dev.yml logs -f mongodb
```

### Stop Development Environment
```bash
docker-compose -f docker-compose.dev.yml down

# Also remove volumes (optional)
docker-compose -f docker-compose.dev.yml down -v
```

---

## Setting NODE_ENV in docker-compose.yml

The `docker-compose.yml` now supports both modes via the `NODE_ENV` variable:

```yaml
environment:
  NODE_ENV: ${NODE_ENV:-production}  # Defaults to 'production'
```

### To Run in Development Mode with Main Compose File
```bash
# This still requires React build to be present in client/build
NODE_ENV=development docker-compose up -d

# This will serve built React app from client/build
# For true development with hot reload, use docker-compose.dev.yml instead
```

---

## Quick Reference

| Mode | Command | Frontend Port | Backend Port | React Build |
|------|---------|---------------|--------------|-------------|
| Production | `docker-compose up -d` | 5600 | 5600 | Built ✓ |
| Production | `NODE_ENV=production docker-compose up -d` | 5600 | 5600 | Built ✓ |
| Development | `docker-compose -f docker-compose.dev.yml up -d` | 3000 | 5000 | Not needed |

---

## Troubleshooting

### "Route / not found" Error
**Cause**: Running with `NODE_ENV=development` without having React build present.

**Solutions**:
1. Use production mode (default): `docker-compose up -d`
2. Or use development mode with dev compose: `docker-compose -f docker-compose.dev.yml up -d`
3. Or manually build React: `cd client && npm run build`

### Port Already in Use
```bash
# Change port in .env
APP_PORT=5700  # or any available port

# Then run
docker-compose up -d
```

### MongoDB Connection Issues
```bash
# Verify MongoDB is running
docker-compose ps

# Restart MongoDB
docker-compose restart mongodb

# Check MongoDB logs
docker-compose logs mongodb
```

---

## Deployment Best Practices

1. **Always use Production Mode for Live**
   ```bash
   NODE_ENV=production docker-compose up -d
   ```

2. **Set Strong Secrets in .env**
   ```dotenv
   JWT_SECRET=use-a-strong-random-string-here
   ADMIN_PASSWORD=use-a-strong-password
   MONGO_ROOT_PASSWORD=use-a-strong-password
   ```

3. **Use Environment-Specific .env Files**
   ```bash
   .env.production  # for production
   .env.development # for development (local)
   ```

4. **Monitor Logs**
   ```bash
   docker-compose logs -f app
   ```

5. **Regular Backups**
   ```bash
   # Backup MongoDB data
   docker-compose exec mongodb mongodump --out=/backup
   ```
