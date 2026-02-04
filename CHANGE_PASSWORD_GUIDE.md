# Change Password Guide

## How to Change Your Admin Password

### Quick Steps:

1. **Login** to admin panel
2. Click on **"My Profile"** in the sidebar (under Settings section)
3. Click on **"Change Password"** tab
4. Fill in the form:
   - Current Password
   - New Password (min 6 characters)
   - Confirm New Password
5. Click **"Update Password"**
6. Done! ✅

---

## Step-by-Step Instructions

### Method 1: Via Admin Sidebar Link (Recommended)

**1. Access Admin Dashboard:**
```
http://localhost:5000/login
```

Login with your credentials:
- Email: admin@example.com
- Password: Admin@123

**2. Find Profile Link:**

In the admin sidebar, look for:
- **Settings** section (at the bottom)
- Click **"My Profile"** 

Or click on your name/email at the very bottom of the sidebar.

**3. Go to Change Password Tab:**

On the Profile page, you'll see two tabs:
- Profile Settings
- **Change Password** ← Click this

**4. Fill in the Form:**

- **Current Password**: Admin@123 (your current password)
- **New Password**: YourNewP@ssw0rd123 (min 6 characters)
- **Confirm New Password**: YourNewP@ssw0rd123 (same as above)

**5. Submit:**

Click **"Update Password"** button.

You'll see a success message: "Password changed successfully"

**6. Verify:**

Logout and login again with your new password to verify it works.

---

### Method 2: Direct URL

**1. Go directly to profile page:**
```
http://localhost:5000/profile
```

Or for dev server:
```
http://localhost:3000/profile
```

**2. Follow steps 3-6 from Method 1**

---

## Password Requirements

✅ **Minimum length**: 6 characters
✅ **Recommended**: 
- 8+ characters
- Mix of uppercase and lowercase
- At least one number
- At least one special character (!@#$%^&*)

### Good Examples:
```
MyS3cur3P@ss!
Adm!n#2024$Strong
C0mpl3x&P@ssw0rd!
```

### Bad Examples (Don't use):
```
admin
123456
password
Admin123
```

---

## Troubleshooting

### Problem: Can't find "My Profile" link

**Solution:**

The profile link is in two places:

1. **Settings Section** (in sidebar):
   - Scroll down in the sidebar
   - Look for "Settings" section
   - Click "My Profile"

2. **User Info** (at bottom of sidebar):
   - Click on your name/avatar at the very bottom
   - This takes you to profile page

3. **Direct URL**:
   ```
   http://localhost:5000/profile
   ```

---

### Problem: "Current password is incorrect"

**Solution:**

Make sure you're entering the exact password you're currently using.

If you forgot your current password:

**Option 1: Reset via Database**
```bash
# Connect to MongoDB
docker-compose exec mongodb mongosh -u admin -p changeme123 --authenticationDatabase admin

use erp_cms

# Delete user
db.users.deleteOne({ email: "admin@example.com" })

exit

# Update ADMIN_PASSWORD in .env
nano .env
# Change: ADMIN_PASSWORD=NewPassword123!

# Recreate admin
docker-compose exec app node scripts/seedAdmin.js
```

**Option 2: Without Docker**
```bash
# Connect to MongoDB
mongosh

use erp_cms

# Delete user
db.users.deleteOne({ email: "admin@example.com" })

exit

# Update .env
nano .env

# Run seed script
node scripts/seedAdmin.js
```

---

### Problem: "Passwords do not match"

**Solution:**

Make sure:
- New Password and Confirm New Password are **exactly the same**
- Check for typos
- Check if Caps Lock is on

---

### Problem: "Password must be at least 6 characters"

**Solution:**

Your new password is too short. Use at least 6 characters.

Better: Use 8+ characters for security.

---

### Problem: Password changes but can't login

**Solution:**

1. **Clear browser cache/cookies**
   ```
   Ctrl+Shift+Delete (Windows/Linux)
   Cmd+Shift+Delete (Mac)
   ```

2. **Try incognito/private window**

3. **Check if you're using correct email**
   - Email: admin@example.com (from .env)

4. **Verify password was saved**
   ```bash
   # Check MongoDB
   docker-compose exec mongodb mongosh -u admin -p changeme123 --authenticationDatabase admin
   use erp_cms
   db.users.find({ email: "admin@example.com" })
   ```

---

### Problem: Page not loading / 404 error

**Solution:**

Make sure the app is running:

**With Docker:**
```bash
docker-compose ps
# Should show containers running
```

**Without Docker:**
```bash
# Check if server is running
ps aux | grep node

# If not running
npm run dev
```

---

## Security Best Practices

### 1. Change Default Password Immediately

If you're using the default password `Admin@123`, change it immediately after first login!

### 2. Use Strong Passwords

**Bad:**
- admin
- 123456
- password
- admin123

**Good:**
- MyS3cur3P@ssw0rd!2024
- Adm!n#System$2024
- C0mpl3x&Passw0rd!

### 3. Change Password Regularly

Change your admin password every 3-6 months.

### 4. Don't Share Passwords

Each admin should have their own account.

### 5. Use Password Manager

Use a password manager like:
- 1Password
- LastPass
- Bitwarden
- KeePass

---

## Where to Find Profile Page

### In Admin Panel:

**Sidebar Navigation:**
```
Settings
└── My Profile ← Click here
└── Menu Manager
└── Settings
```

**User Info (bottom of sidebar):**
```
[👤] Admin User       ← Click here
     admin@example.com
     
[Logout]
```

### Direct URLs:

**Production:**
```
http://localhost:5000/profile
http://yourdomain.com/profile
```

**Development:**
```
http://localhost:3000/profile
```

---

## Profile Page Features

Once you're on the profile page, you have two tabs:

### 1. Profile Settings

Update:
- Full Name
- Email (read-only)
- Phone Number
- Address
- Profile Photo

### 2. Change Password

Change your password securely.

---

## Complete Workflow

```bash
# 1. Login
http://localhost:5000/login

# 2. In sidebar, click "My Profile" (under Settings)

# 3. Click "Change Password" tab

# 4. Fill form:
Current Password: [your current password]
New Password: [strong new password]
Confirm New Password: [same as above]

# 5. Click "Update Password"

# 6. See success message

# 7. Logout and login with new password to verify
```

---

## Quick Reference

```bash
# Profile page URLs
http://localhost:5000/profile   # Production
http://localhost:3000/profile   # Development

# Where to find link
Admin Sidebar → Settings → My Profile

# Or click on
User name at bottom of sidebar

# Password requirements
- Minimum 6 characters
- Recommended 8+ characters
- Mix of letters, numbers, special chars
```

---

## Video/Screenshot Guide

### Step 1: Sidebar
Look for "Settings" section in the left sidebar:
```
[Settings]
  🙍 My Profile     ← Click
  📋 Menu Manager
  ⚙️ Settings
```

### Step 2: Profile Page
You'll see two tabs:
```
[Profile Settings] [Change Password] ← Click this tab
```

### Step 3: Form
Fill in the password change form:
```
Current Password:   [●●●●●●●●]
New Password:       [●●●●●●●●]
Confirm Password:   [●●●●●●●●]

[Update Password]  ← Click
```

### Step 4: Success
```
✓ Password changed successfully
```

---

## Support

If you still can't find or access the profile page:

1. **Check if you're logged in**
   - You should see the admin sidebar
   - Your name should appear at bottom

2. **Check your role**
   - Only logged-in users can access profile
   - Make sure you have proper permissions

3. **Check the route exists**
   ```bash
   cd client/src
   grep -r "Profile" pages/
   # Should show Profile.js
   ```

4. **Check App.js has the route**
   ```bash
   grep "/profile" App.js
   # Should show: <Route path="/profile" element={<Profile />} />
   ```

---

## Summary

**To change your password:**

1. Login to admin panel
2. Click **"My Profile"** in sidebar (under Settings)
3. Click **"Change Password"** tab
4. Fill in current and new passwords
5. Click **"Update Password"**
6. Done!

**Location:** Admin Sidebar → Settings → My Profile → Change Password tab

**Direct URL:** http://localhost:5000/profile

---

**Need more help?** Check the troubleshooting section above or contact support.
