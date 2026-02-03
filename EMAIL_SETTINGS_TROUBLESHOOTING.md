# Email Notification Settings - Troubleshooting Guide

## Issue
Email notification settings checkboxes not saving properly.

## Debugging Steps

### Step 1: Check Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Navigate to: Admin → Settings → SMTP
4. Toggle any email notification checkbox
5. Click "Save Settings"
6. Check console output

**Look for:**
```javascript
Email notification values being sent: {
  enableEmailContact: false,  // Should match your checkbox state
  enableEmailProductEnquiry: true,
  enableEmailJobApplication: true,
  enableEmailDynamicForms: true
}
```

**Expected:** Values should match your checkbox states (true/false)

**If values are wrong:** Frontend state update issue
**If values are correct:** Backend save issue

---

### Step 2: Check Server Logs

```bash
# In terminal
docker-compose logs -f app | grep "Email notification"

# Or if not using Docker
# Check your server console
```

**Look for:**
```
Email notification settings update: {
  enableEmailContact: false,
  enableEmailProductEnquiry: true,
  enableEmailJobApplication: true,
  enableEmailDynamicForms: true
}
```

**Expected:** Values should match what frontend sent

**If not appearing:** Backend not receiving data
**If values are wrong:** Data transformation issue

---

### Step 3: Check Database

```bash
# Connect to MongoDB
docker-compose exec mongodb mongosh -u admin -p changeme123 --authenticationDatabase admin

# Switch to database
use erp_cms

# Check current values
db.settings.findOne({}, {
  enableEmailContact: 1,
  enableEmailProductEnquiry: 1,
  enableEmailJobApplication: 1,
  enableEmailDynamicForms: 1,
  _id: 0
})
```

**Expected Output:**
```json
{
  "enableEmailContact": false,
  "enableEmailProductEnquiry": true,
  "enableEmailJobApplication": true,
  "enableEmailDynamicForms": true
}
```

**If values don't match:** Database save issue
**If values match but UI doesn't reflect:** Frontend load issue

---

## Common Issues & Solutions

### Issue 1: Checkboxes Reset After Save

**Symptom:** Toggle checkbox → Save → Checkbox reverts to checked

**Cause:** Settings not being saved to database

**Solution:**
```bash
# 1. Check if settings document exists
docker-compose exec mongodb mongosh -u admin -p changeme123 --authenticationDatabase admin
use erp_cms
db.settings.countDocuments()

# Should return 1, if 0:
db.settings.insertOne({
  siteName: "ERP CMS",
  enableEmailContact: true,
  enableEmailProductEnquiry: true,
  enableEmailJobApplication: true,
  enableEmailDynamicForms: true
})

# Then try saving again in UI
```

---

### Issue 2: Values Not Updating in Database

**Symptom:** Console logs show correct values but database doesn't update

**Cause:** MongoDB update query not working

**Debug:**
```javascript
// In routes/settings.js, after updateData, add:
console.log('Updating with data:', {
  _id: settings._id,
  enableEmailContact: updateData.enableEmailContact
});
```

**Solution:**
```bash
# Restart the app
docker-compose restart app

# Or manually update in database:
docker-compose exec mongodb mongosh -u admin -p changeme123 --authenticationDatabase admin
use erp_cms
db.settings.updateOne(
  {},
  {
    $set: {
      enableEmailContact: false,
      enableEmailProductEnquiry: true,
      enableEmailJobApplication: true,
      enableEmailDynamicForms: true
    }
  }
)
```

---

### Issue 3: Frontend Not Sending Values

**Symptom:** Browser console shows `undefined` for email settings

**Cause:** State not being updated properly

**Solution:**

Check Settings.js handleSubmit function. Should have:
```javascript
enableEmailContact: settings.enableEmailContact !== undefined ? settings.enableEmailContact : true,
```

If missing, add these lines to the `dataToSubmit` object.

---

### Issue 4: Values Show Correctly But Email Still Sends

**Symptom:** Disabled email notifications but emails still being sent

**Cause:** Backend routes not checking the setting

**Solution:**

Check each route file:

**contact.js:**
```javascript
if (settings && settings.email && settings.enableEmailContact !== false) {
  // Send email
}
```

**productEnquiry.js:**
```javascript
if (settings && settings.email && settings.enableEmailProductEnquiry !== false) {
  // Send email
}
```

**jobs.js:**
```javascript
if (settings && settings.email && settings.enableEmailJobApplication !== false) {
  // Send email
}
```

**dynamicForms.js:**
```javascript
if (notificationEmail && settings?.enableEmailDynamicForms !== false && form.emailNotifications !== false) {
  // Send email
}
```

---

## Complete Test Procedure

### Test 1: Disable Contact Form Emails

```bash
# 1. Open browser console (F12)
# 2. Go to: Admin → Settings → SMTP
# 3. Uncheck "Contact Form Submissions"
# 4. Click "Save Settings"

# Check console output:
# ✅ Should see: enableEmailContact: false

# 5. Reload page (F5)
# ✅ Checkbox should stay unchecked

# 6. Check database
docker-compose exec mongodb mongosh -u admin -p changeme123 --authenticationDatabase admin
use erp_cms
db.settings.findOne({}, {enableEmailContact: 1})
# ✅ Should return: { "enableEmailContact": false }

# 7. Test form submission
# Visit /contact → Fill form → Submit
# ✅ No email should be sent
# ✅ Check server logs: Should NOT see "Contact notification sent"
```

### Test 2: Re-enable Contact Form Emails

```bash
# 1. Go to: Admin → Settings → SMTP
# 2. Check "Contact Form Submissions"
# 3. Click "Save Settings"

# ✅ Console: enableEmailContact: true
# ✅ Reload: Checkbox stays checked
# ✅ Database: { "enableEmailContact": true }

# 4. Test form submission
# Visit /contact → Fill form → Submit
# ✅ Email should be sent
# ✅ Server logs: "Contact notification sent to [email]"
```

---

## Manual Database Fix

If all else fails, manually set the values:

```javascript
// Connect to MongoDB
docker-compose exec mongodb mongosh -u admin -p changeme123 --authenticationDatabase admin

use erp_cms

// Update all email notification settings
db.settings.updateOne(
  {},
  {
    $set: {
      enableEmailContact: true,
      enableEmailProductEnquiry: true,
      enableEmailJobApplication: true,
      enableEmailDynamicForms: true
    }
  },
  { upsert: true }
)

// Verify
db.settings.findOne({}, {
  enableEmailContact: 1,
  enableEmailProductEnquiry: 1,
  enableEmailJobApplication: 1,
  enableEmailDynamicForms: 1
})
```

---

## Quick Verification Script

Save this as `test-email-settings.js`:

```javascript
const axios = require('axios');

const token = 'YOUR_ADMIN_TOKEN'; // Get from localStorage in browser

async function testSettings() {
  // Get current settings
  const current = await axios.get('http://localhost:5000/api/settings');
  console.log('Current email settings:', {
    enableEmailContact: current.data.data.enableEmailContact,
    enableEmailProductEnquiry: current.data.data.enableEmailProductEnquiry,
    enableEmailJobApplication: current.data.data.enableEmailJobApplication,
    enableEmailDynamicForms: current.data.data.enableEmailDynamicForms
  });

  // Update settings
  const update = await axios.post(
    'http://localhost:5000/api/settings',
    {
      ...current.data.data,
      enableEmailContact: false
    },
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );

  console.log('Update successful:', update.data.success);

  // Verify update
  const verify = await axios.get('http://localhost:5000/api/settings');
  console.log('After update:', {
    enableEmailContact: verify.data.data.enableEmailContact
  });
}

testSettings();
```

Run:
```bash
node test-email-settings.js
```

---

## Still Not Working?

### Reset Everything

```bash
# 1. Stop app
docker-compose down

# 2. Clear database (CAUTION: Deletes all data)
docker-compose exec mongodb mongosh -u admin -p changeme123 --authenticationDatabase admin
use erp_cms
db.settings.deleteMany({})

# 3. Restart
docker-compose up -d

# 4. Go to admin and configure settings fresh
```

---

## Debug Checklist

- [ ] Browser console shows correct values being sent
- [ ] Server logs show correct values received
- [ ] Database shows correct values stored
- [ ] Page reload shows correct checkbox states
- [ ] Form submission respects the setting (no email when disabled)
- [ ] All 4 email notification types working independently

---

## Need More Help?

1. **Check logs:** `docker-compose logs -f app`
2. **Check database:** `docker-compose exec mongodb mongosh`
3. **Check network:** Browser DevTools → Network tab
4. **Check state:** React DevTools → Components → Settings

Provide these details when asking for help:
- Browser console output
- Server log output
- Database query results
- Screenshots of the issue
