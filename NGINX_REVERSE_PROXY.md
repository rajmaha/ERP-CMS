# External Nginx Reverse Proxy Configuration

This file provides an example configuration for your external Nginx server to reverse proxy the ERP CMS Docker application.

## Application Details

- **Container**: erp-cms-app
- **Port**: 5000
- **Protocol**: HTTP
- **Health Check**: http://localhost:5000/health

## Basic Nginx Configuration

Add this to your main Nginx configuration file:

```nginx
# Upstream to Docker container
upstream erp_cms_app {
    server localhost:5000;
    keepalive 64;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Max upload size (for file uploads)
    client_max_body_size 50M;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Proxy all requests to Docker container
    location / {
        proxy_pass http://erp_cms_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check endpoint (no logging)
    location /health {
        access_log off;
        proxy_pass http://erp_cms_app;
    }
}
```

## HTTPS Configuration (Recommended)

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Certificates
    ssl_certificate /etc/ssl/certs/yourdomain.com.crt;
    ssl_certificate_key /etc/ssl/private/yourdomain.com.key;
    
    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Max upload size
    client_max_body_size 50M;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript 
               application/json application/javascript application/xml+rss 
               application/rss+xml font/truetype font/opentype 
               application/vnd.ms-fontobject image/svg+xml;

    # Proxy to Docker container
    location / {
        proxy_pass http://erp_cms_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check endpoint
    location /health {
        access_log off;
        proxy_pass http://erp_cms_app;
    }
}
```

## Rate Limiting (Optional but Recommended)

Add rate limiting zones before the server block:

```nginx
# Rate limiting zones
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/m;
limit_req_zone $binary_remote_addr zone=auth_limit:10m rate=20r/m;

server {
    # ... other configuration ...

    # API routes - rate limited
    location /api/ {
        limit_req zone=api_limit burst=20 nodelay;
        proxy_pass http://erp_cms_app;
        # ... proxy headers ...
    }

    # Auth routes - stricter rate limit
    location /api/auth/ {
        limit_req zone=auth_limit burst=5 nodelay;
        proxy_pass http://erp_cms_app;
        # ... proxy headers ...
    }
}
```

## Static File Caching (Optional)

For better performance, cache static uploads:

```nginx
server {
    # ... other configuration ...

    # Cache uploaded files
    location /uploads/ {
        proxy_pass http://erp_cms_app;
        proxy_cache_valid 200 30d;
        proxy_cache_bypass $http_cache_control;
        add_header X-Cache-Status $upstream_cache_status;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

## Let's Encrypt SSL (Using Certbot)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is set up automatically
# Test renewal
sudo certbot renew --dry-run
```

## Configuration Steps

1. **Add upstream definition** to your Nginx config
2. **Create server block** for your domain
3. **Set up SSL certificates** (Let's Encrypt recommended)
4. **Test configuration**:
   ```bash
   sudo nginx -t
   ```
5. **Reload Nginx**:
   ```bash
   sudo systemctl reload nginx
   ```

## Testing

After configuration:

```bash
# Test HTTP
curl http://yourdomain.com/health

# Test HTTPS
curl https://yourdomain.com/health

# Check logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## Important Notes

1. **Update FRONTEND_URL** in Docker `.env`:
   ```env
   FRONTEND_URL=https://yourdomain.com
   ```

2. **Expose only port 5000** from Docker:
   - The application runs on port 5000
   - Nginx proxies to localhost:5000
   - No need to expose MongoDB port externally

3. **Security Recommendations**:
   - Use HTTPS in production
   - Enable rate limiting
   - Keep SSL certificates updated
   - Monitor logs regularly

4. **Firewall Rules**:
   ```bash
   # Allow HTTP/HTTPS
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   
   # Block direct access to app port (optional)
   sudo ufw deny 5000/tcp
   ```

## Troubleshooting

**Connection Refused**:
- Verify Docker container is running: `docker-compose ps`
- Check app is listening: `curl http://localhost:5000/health`
- Verify upstream address in Nginx config

**502 Bad Gateway**:
- Check Docker logs: `docker-compose logs -f app`
- Verify MongoDB is running: `docker-compose ps`
- Check health endpoint: `curl http://localhost:5000/health`

**413 Request Entity Too Large**:
- Increase `client_max_body_size` in Nginx config
- Reload Nginx: `sudo systemctl reload nginx`

**SSL Certificate Issues**:
- Verify certificates exist and are readable
- Check certificate expiry: `openssl x509 -in /path/to/cert.crt -noout -dates`
- Renew if needed: `sudo certbot renew`

## Complete Example Configuration

See the complete example in this file above, which includes:
- ✅ HTTP to HTTPS redirect
- ✅ SSL/TLS configuration
- ✅ Security headers
- ✅ Gzip compression
- ✅ Proxy settings
- ✅ Health check endpoint

Adjust domain names and SSL certificate paths according to your setup.
