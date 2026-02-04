# Admin User Setup - Quick Reference

## After Docker Starts

### Quick 3-Step Setup:

```bash
# 1. Make sure .env has admin credentials (already done ✅)
cat .env | grep ADMIN

# 2. Run admin seed script
docker-compose exec app node scripts/seedAdmin.js

# 3. Login
open http://localhost:5000/login
# Email: admin@example.com
# Password: Admin@123
```

---

## Your Current Admin Credentials

From your `.env` file:

- **Name**: Admin
- **Email**: admin@example.com
- **Password**: Admin@123

⚠️ **Change this password after first login!**

---

## Common Commands

```bash
# Create admin user
docker-compose exec app node scripts/seedAdmin.js

# Check if containers are running
docker-compose ps

# View app logs
docker-compose logs -f app

# Restart app
docker-compose restart app

# Access MongoDB
docker-compose exec mongodb mongosh -u admin -p changeme123 --authenticationDatabase admin
```

---

## Troubleshooting

### Script not found
```bash
# Make sure containers are running
docker-compose up -d

# Wait 30 seconds, then try again
docker-compose exec app node scripts/seedAdmin.js
```

### Connection refused
```bash
# Check MongoDB is running
docker-compose ps mongodb

# If not running
docker-compose up -d mongodb
```

### User already exists
```bash
# To delete and recreate:
docker-compose exec mongodb mongosh -u admin -p changeme123 --authenticationDatabase admin
use erp_cms
db.users.deleteOne({ email: "admin@example.com" })
exit

# Then run seed script again
docker-compose exec app node scripts/seedAdmin.js
```

---

## Change Admin Password

### After Login:
1. Go to Profile
2. Click "Change Password"
3. Enter new password
4. Save

### Via Database:
```bash
# Delete user
docker-compose exec mongodb mongosh -u admin -p changeme123 --authenticationDatabase admin
use erp_cms
db.users.deleteOne({ email: "admin@example.com" })
exit

# Update .env with new password
nano .env

# Recreate user
docker-compose exec app node scripts/seedAdmin.js
```

---

## Full Documentation

See: **ADMIN_USER_SETUP.md** for complete guide

---

**Ready? Run this:**

```bash
docker-compose exec app node scripts/seedAdmin.js
```

Then login at: http://localhost:5000/login 🎉
