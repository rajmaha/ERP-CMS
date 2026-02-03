# ERP CMS - Full-Stack Content Management System

A comprehensive, production-ready CMS with admin panel, Docker deployment, and extensive features for managing dynamic content, jobs, products, and more.

## 🚀 Features

### Core Features
- ✅ **Dynamic CMS** - Manage pages, content, and media
- ✅ **Admin Panel** - Complete admin dashboard with RBAC
- ✅ **User Authentication** - JWT-based auth with role management
- ✅ **MongoDB Database** - Scalable NoSQL database
- ✅ **React Frontend** - Modern, responsive UI
- ✅ **Docker Ready** - Complete Docker & docker-compose setup
- ✅ **Email Notifications** - SMTP support with customizable templates

### Content Management
- 📄 Dynamic Pages (About, Services, etc.)
- 📝 Rich Text Editor
- 🖼️ Media Library with image optimization
- 🎨 Branding & Theme Customization
- 📊 Company Values & Mission
- 📱 Social Media Integration

### Business Features
- 💼 **Job Postings** - Manage careers and applications
- 📦 **Product Management** - Products, categories, enquiries
- 📧 **Contact Forms** - Multiple contact forms with email notifications
- 📝 **Dynamic Forms** - Create custom forms with validation
- 🎯 **WhatsApp Integration** - Direct customer communication

### Admin Features
- 👥 User Management
- 📊 Dashboard & Analytics
- ⚙️ Settings Management
- 🔐 reCAPTCHA Integration
- 📧 Email Notification Controls
- 🎨 Theme Customization
- 🗺️ Google Maps Integration

## 📋 Prerequisites

- **Node.js** 18.x or higher
- **MongoDB** 5.x or higher
- **npm** or **yarn**
- **Docker** (optional, for containerized deployment)

## 🛠️ Installation

### Quick Start (Local)

```bash
# 1. Clone repository
git clone https://github.com/YOUR_USERNAME/erp-cms.git
cd erp-cms

# 2. Install dependencies
npm install
cd client && npm install && cd ..

# 3. Configure environment
cp .env.example .env
# Edit .env with your settings

# 4. Start MongoDB (if not using Docker)
mongod

# 5. Start development servers
npm run dev

# Access at: http://localhost:5000
```

### Docker Deployment (Recommended)

```bash
# 1. Clone repository
git clone https://github.com/YOUR_USERNAME/erp-cms.git
cd erp-cms

# 2. Configure environment
cp .env.example .env
# Edit .env with your settings

# 3. Start with Docker
docker-compose up -d

# Access at: http://localhost:5000
```

See [DOCKER_QUICKSTART.md](DOCKER_QUICKSTART.md) for detailed Docker instructions.

## ⚙️ Configuration

### Environment Variables

Create `.env` file with these required variables:

```env
# Server
NODE_ENV=production
PORT=5000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/erp_cms

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRE=30d

# Admin User (Initial)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin@123

# SMTP (Optional but recommended)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=noreply@yourdomain.com
```

See [.env.example](.env.example) for all available options.

## 🐳 Docker Deployment

### Production

```bash
docker-compose up -d
```

### Development (with hot reload)

```bash
docker-compose -f docker-compose.dev.yml up
```

### With External Nginx

```bash
# App runs on port 5000
# Configure your Nginx to reverse proxy to localhost:5000
```

See [NGINX_REVERSE_PROXY.md](NGINX_REVERSE_PROXY.md) for Nginx configuration examples.

## 📚 Documentation

- **[GITHUB_SETUP.md](GITHUB_SETUP.md)** - GitHub repository setup guide
- **[DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md)** - Complete Docker deployment guide
- **[DOCKER_QUICKSTART.md](DOCKER_QUICKSTART.md)** - Quick Docker setup
- **[NGINX_REVERSE_PROXY.md](NGINX_REVERSE_PROXY.md)** - Nginx configuration
- **[EMAIL_NOTIFICATION_CONTROLS.md](EMAIL_NOTIFICATION_CONTROLS.md)** - Email settings

## 🎯 Default Admin Login

After first setup:

- **URL**: `http://localhost:5000/login`
- **Email**: `admin@example.com` (or your ADMIN_EMAIL)
- **Password**: `Admin@123` (or your ADMIN_PASSWORD)

⚠️ **Important**: Change the default password immediately after first login!

## 🔧 Development

### Project Structure

```
erp-cms/
├── server.js           # Express server entry point
├── models/             # MongoDB models
├── routes/             # API routes
├── middleware/         # Auth, upload, etc.
├── utils/              # Utilities (email, etc.)
├── uploads/            # User uploads (not in Git)
├── client/             # React frontend
│   ├── public/
│   └── src/
│       ├── components/ # React components
│       ├── pages/      # Page components
│       ├── contexts/   # React contexts
│       └── utils/      # Frontend utilities
├── Dockerfile          # Production Docker image
├── docker-compose.yml  # Production orchestration
└── package.json        # Dependencies
```

### Available Scripts

```bash
# Development (server + client)
npm run dev

# Server only
npm run server

# Client only
cd client && npm start

# Production build
cd client && npm run build

# Docker
docker-compose up -d
docker-compose logs -f
docker-compose down
```

## 🚀 Deployment

### Option 1: Docker (Recommended)

See [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md)

### Option 2: Traditional Server

```bash
# 1. Build frontend
cd client && npm run build && cd ..

# 2. Set environment
export NODE_ENV=production

# 3. Start server
npm start

# Or with PM2
pm2 start server.js --name erp-cms
```

### Option 3: Cloud Platforms

- **Heroku**: Use included Procfile
- **AWS**: Deploy with ECS/EC2 + RDS MongoDB
- **DigitalOcean**: Use Docker on Droplet
- **Vercel/Netlify**: Frontend only (needs separate API)

## 🔒 Security

- ✅ JWT authentication
- ✅ Password hashing (bcrypt)
- ✅ Input validation
- ✅ XSS protection
- ✅ CORS configured
- ✅ Helmet security headers
- ✅ Rate limiting
- ✅ File upload restrictions
- ✅ Environment-based secrets

## 📧 Email Notifications

The system sends email notifications for:
- Contact form submissions
- Product enquiries
- Job applications
- Dynamic form submissions

Each can be enabled/disabled individually in Settings → SMTP.

## 🎨 Customization

### Branding

Admin → Settings → General → Upload logo and favicon

### Theme Colors

Admin → Settings → Branding → Customize colors:
- Primary, Secondary, Accent
- Title, Text colors

### Pages

Admin → Pages → Create/Edit pages with rich content

### Forms

Admin → Dynamic Forms → Create custom forms

## 🧪 Testing

```bash
# Run tests (if configured)
npm test

# Lint code
npm run lint
```

## 📊 Database

### MongoDB Collections

- `users` - System users
- `settings` - Site configuration
- `pages` - Dynamic pages
- `posts` - Blog posts
- `products` - Products catalog
- `jobs` - Job postings
- `contacts` - Contact submissions
- `applications` - Job applications
- `forms` - Dynamic forms
- `formsubmissions` - Form submissions

### Backup

```bash
# Backup database
docker-compose exec mongodb mongodump \
  --username=admin \
  --password=changeme123 \
  --archive > backup.dump

# Restore database
docker-compose exec -T mongodb mongorestore \
  --archive < backup.dump
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

This project is private and proprietary.

## 🆘 Support

For issues or questions:

1. Check [Documentation](#-documentation)
2. Review [Troubleshooting Guides](DOCKER_DEPLOYMENT.md#troubleshooting)
3. Create an issue on GitHub

## 📈 Roadmap

- [ ] Multi-language support
- [ ] Advanced analytics
- [ ] API documentation (Swagger)
- [ ] Mobile app
- [ ] Advanced SEO tools
- [ ] E-commerce integration
- [ ] Newsletter management
- [ ] Advanced permissions

## 🙏 Acknowledgments

Built with:
- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [React](https://reactjs.org/)
- [Docker](https://www.docker.com/)

---

**Made with ❤️ for efficient content management**

For setup help, see [GITHUB_SETUP.md](GITHUB_SETUP.md)
