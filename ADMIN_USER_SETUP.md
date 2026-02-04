# Admin User Setup Guide - After Docker Deployment

Complete guide to create and manage the admin user after deploying with Docker.

---

## Quick Setup (30 seconds)

### Step 1: Add Admin Credentials to .env

Edit your `.env` file:

```bash
nano .env
```

Add these lines (or update if they exist):

```env
# Admin User Credentials
ADMIN_NAME=Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=SecurePassword123!
```

⚠️ **Important:** Use a strong password!

### Step 2: Run Admin Seed Script

```bash
# If containers are running
docker-compose exec app node scripts/seedAdmin.js

# Or if not running yet
docker-compose run --rm app node scripts/seedAdmin.js
```

You should see:
```
✓ Connected to MongoDB
✓ Created admin user: admin@example.com
   - name: Admin
   - password: SecurePassword123!
⚠️ Please change the password after first login in production.
```

### Step 3: Login

Go to: http://localhost:5000/login

- **Email**: admin@example.com (or your ADMIN_EMAIL)
- **Password**: SecurePassword123! (or your ADMIN_PASSWORD)

---

## Detailed Setup Steps

### Method 1: Before Starting Docker (Recommended)

**1. Configure .env file:**

```bash
cd /Users/rajmaha/Sites/continue-project
nano .env
```

Add these lines:

```env
# Admin User Setup
ADMIN_NAME=Your Name
ADMIN_EMAIL=youradmin@example.com
ADMIN_PASSWORD=Your$ecureP@ssw0rd123!
```

**2. Start Docker containers:**

```bash
docker-compose up -d
```

**3. Wait for containers to start (30 seconds):**

```bash
# Check status
docker-compose ps

# Watch logs
docker-compose logs -f app
```

**4. Create admin user:**

```bash
docker-compose exec app node scripts/seedAdmin.js
```

**5. Login:**

Visit: http://localhost:5000/login

---

### Method 2: After Docker is Already Running

**1. Check if containers are running:**

```bash
docker-compose ps
```

Should show:
- `erp-cms-mongodb` - running
- `erp-cms-app` - running

**2. Add admin credentials to .env:**

```bash
nano .env
```

Add:
```env
ADMIN_NAME=Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=StrongPassword123!
```

**3. Restart app container (to load new .env):**

```bash
docker-compose restart app
```

**4. Run seed script:**

```bash
docker-compose exec app node scripts/seedAdmin.js
```

**5. Login:**

http://localhost:5000/login

---

## Environment Variables Reference

### Required

```env
ADMIN_EMAIL=admin@example.com
```
- Your admin email address
- Used for login

### Optional (with defaults)

```env
ADMIN_NAME=Admin
```
- Default: "Admin"
- Display name in dashboard

```env
ADMIN_PASSWORD=admin123
```
- Default: "admin123"
- ⚠️ **Highly recommended to set a strong password!**
- Minimum 6 characters

---

## Example .env Configuration

```env
# MongoDB (already configured)
MONGODB_URI= your_mongo_uri_here

# Server
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345
JWT_EXPIRE=30d

# Admin User Setup
ADMIN_NAME=John Doe
ADMIN_EMAIL=john@yourcompany.com
ADMIN_PASSWORD=MyS3cur3P@ssw0rd!2024

# SMTP (for email notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=noreply@yourcompany.com
```

---

## Seed Script Commands

### Create Admin User

```bash
# Inside Docker container
docker-compose exec app node scripts/seedAdmin.js

# Or if containers not running
docker-compose run --rm app node scripts/seedAdmin.js

# Without Docker (local)
npm run seed-admin
# or
node scripts/seedAdmin.js
```

### Expected Output

**Success:**
```
✓ Connected to MongoDB
✓ Created admin user: admin@example.com
   - name: Admin
   - password: YourPassword123
⚠️ Please change the password after first login in production.
```

**Already Exists:**
```
✓ Connected to MongoDB
✓ Admin user already exists: admin@example.com
```

**Error:**
```
✗ MongoDB connection error: ...
```
Check your MONGODB_URI in .env

---

## Troubleshooting

### Problem: Script says "Admin user already exists"

**Solution 1: Update existing user**

The script updates the user if it exists:

```bash
# Set new password in .env
ADMIN_PASSWORD=NewPassword123!

# Run script
docker-compose exec app node scripts/seedAdmin.js

# Note: This WON'T update password if user exists
# To change password, use Method 2 below
```

**Solution 2: Delete and recreate**

```bash
# Connect to MongoDB
docker-compose exec mongodb mongosh -u admin -p changeme123 --authenticationDatabase admin

# Switch to database
use erp_cms

# Delete admin user
db.users.deleteOne({ email: "admin@example.com" })

# Exit
exit

# Run seed script again
docker-compose exec app node scripts/seedAdmin.js
```

**Solution 3: Change password via API**

```bash
# After logging in, go to:
# Admin Dashboard → Profile → Change Password
```

---

### Problem: MongoDB connection error

**Check 1: MongoDB container running**

```bash
docker-compose ps
```

Should show `erp-cms-mongodb` as running.

If not:
```bash
docker-compose up -d mongodb
```

**Check 2: .env MONGODB_URI is correct**

For Docker deployment:
```env
MONGODB_URI=mongodb://admin:changeme123@mongodb:27017/erp_cms?authSource=admin
```

For MongoDB Atlas (cloud):
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?appName=Cluster0
```

**Check 3: Check logs**

```bash
docker-compose logs mongodb
docker-compose logs app
```

---

### Problem: Weak password warning

**Warning:**
```
⚠️ Using weak admin password. Consider setting ADMIN_PASSWORD in .env (min 6 chars).
```

**Solution:**

Use a strong password with:
- At least 8 characters
- Mix of uppercase and lowercase
- Numbers
- Special characters

Example:
```env
ADMIN_PASSWORD=MyS3cur3P@ssw0rd!2024
```

---

### Problem: Can't login after creating admin

**Check 1: Verify user was created**

```bash
docker-compose exec mongodb mongosh -u admin -p changeme123 --authenticationDatabase admin
use erp_cms
db.users.find({ email: "admin@example.com" })
```

Should show the user.

**Check 2: Check password**

Make sure you're using the exact password from .env

**Check 3: Clear browser cache**

- Clear cookies
- Try incognito mode
- Try different browser

**Check 4: Check app logs**

```bash
docker-compose logs -f app
```

Look for login errors.

---

## Change Admin Password

### Method 1: Via Dashboard (Recommended)

1. Login at http://localhost:5000/login
2. Go to: Profile → Change Password
3. Enter old password
4. Enter new password
5. Save

### Method 2: Via Database

```bash
# Connect to MongoDB
docker-compose exec mongodb mongosh -u admin -p changeme123 --authenticationDatabase admin

use erp_cms

# User model hashes password automatically, so we can't just update
# Need to delete and recreate:
db.users.deleteOne({ email: "admin@example.com" })
exit

# Update ADMIN_PASSWORD in .env
nano .env

# Run seed script
docker-compose exec app node scripts/seedAdmin.js
```

### Method 3: Create Password Reset Link

```bash
# This would require implementing password reset feature
# For now, use Method 1 or 2
```

---

## Multiple Admin Users

To create additional admin users:

### Via Seed Script (First Admin)

```bash
# Set in .env
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Password123

docker-compose exec app node scripts/seedAdmin.js
```

### Via Registration + Manual Role Change

**1. Register new user:**
- Go to /register
- Create account

**2. Promote to admin:**

```bash
# Connect to MongoDB
docker-compose exec mongodb mongosh -u admin -p changeme123 --authenticationDatabase admin

use erp_cms

# Update user role
db.users.updateOne(
  { email: "newadmin@example.com" },
  { $set: { role: "admin" } }
)

exit
```

### Via Admin Dashboard (If Implemented)

If user management is available:
1. Login as admin
2. Go to Users
3. Edit user
4. Change role to "admin"
5. Save

---

## Security Best Practices

### 1. Strong Password

```env
# Bad
ADMIN_PASSWORD=admin
ADMIN_PASSWORD=123456
ADMIN_PASSWORD=password

# Good
ADMIN_PASSWORD=MyS3cur3P@ssw0rd!2024
ADMIN_PASSWORD=Adm!n#2024$Strong
ADMIN_PASSWORD=C0mpl3x&P@ssw0rd!
```

### 2. Change Default Password

After first login:
1. Go to Profile
2. Change password immediately
3. Use password manager to store it

### 3. Use Strong JWT Secret

```env
# Generate random string:
JWT_SECRET=$(openssl rand -base64 32)

# Or online: https://generate-secret.vercel.app/32
```

### 4. Environment-Specific Credentials

```env
# Development
ADMIN_EMAIL=admin@localhost
ADMIN_PASSWORD=DevPassword123!

# Production
ADMIN_EMAIL=admin@yourcompany.com
ADMIN_PASSWORD=Pr0d!Secur3&P@ss2024
```

### 5. Never Commit .env

Ensure `.env` is in `.gitignore`:

```bash
echo ".env" >> .gitignore
git rm --cached .env  # If already committed
```

---

## Complete Workflow

### First Time Setup

```bash
# 1. Configure
cd /Users/rajmaha/Sites/continue-project
cp .env.example .env
nano .env
# Set ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD

# 2. Start Docker
docker-compose up -d

# 3. Wait for startup
sleep 30

# 4. Create admin
docker-compose exec app node scripts/seedAdmin.js

# 5. Login
open http://localhost:5000/login
# Email: your ADMIN_EMAIL
# Password: your ADMIN_PASSWORD

# 6. Change password
# Profile → Change Password
```

### Reset Admin User

```bash
# 1. Stop containers
docker-compose down

# 2. Update .env
nano .env
# Change ADMIN_PASSWORD

# 3. Start containers
docker-compose up -d

# 4. Delete old admin
docker-compose exec mongodb mongosh -u admin -p changeme123 --authenticationDatabase admin
use erp_cms
db.users.deleteOne({ email: "admin@example.com" })
exit

# 5. Create new admin
docker-compose exec app node scripts/seedAdmin.js
```

---

## Quick Reference

```bash
# Create admin user
docker-compose exec app node scripts/seedAdmin.js

# Check if admin exists
docker-compose exec mongodb mongosh -u admin -p changeme123 --authenticationDatabase admin
use erp_cms
db.users.find({ role: "admin" })

# Delete admin user
db.users.deleteOne({ email: "admin@example.com" })

# Change user role to admin
db.users.updateOne(
  { email: "user@example.com" },
  { $set: { role: "admin" } }
)
```

---

## Default Credentials (If Not Set)

If you don't set ADMIN_EMAIL and ADMIN_PASSWORD in .env:

- **Email**: admin@example.com
- **Password**: admin123

⚠️ **NOT RECOMMENDED FOR PRODUCTION!**

Always set custom credentials in .env!

---

## Need Help?

**Check logs:**
```bash
docker-compose logs -f app
docker-compose logs -f mongodb
```

**Restart everything:**
```bash
docker-compose restart
```

**Full reset:**
```bash
docker-compose down -v
docker-compose up -d
docker-compose exec app node scripts/seedAdmin.js
```

---

**Summary:**

1. Add ADMIN_EMAIL and ADMIN_PASSWORD to .env
2. Run: `docker-compose exec app node scripts/seedAdmin.js`
3. Login at http://localhost:5000/login
4. Change password after first login

Done! 🎉
