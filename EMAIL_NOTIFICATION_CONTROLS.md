# Email Notification Controls - Feature Documentation

## Overview

Added admin controls to enable/disable email notifications for different form types individually. Administrators can now selectively control which form submissions trigger email notifications.

## Changes Made

### 1. Database Model (`/models/Settings.js`)

Added four new boolean fields to the Settings schema:

```javascript
enableEmailContact: {
  type: Boolean,
  default: true
},
enableEmailProductEnquiry: {
  type: Boolean,
  default: true
},
enableEmailJobApplication: {
  type: Boolean,
  default: true
},
enableEmailDynamicForms: {
  type: Boolean,
  default: true
}
```

**Default:** All email notifications are enabled by default.

### 2. Backend Routes Updated

#### Contact Form (`/routes/contact.js`)
```javascript
// Checks if contact form emails are enabled
if (settings && settings.email && settings.enableEmailContact !== false) {
  // Send email...
}
```

#### Product Enquiries (`/routes/productEnquiry.js`)
```javascript
// Checks if product enquiry emails are enabled
if (settings && settings.email && settings.enableEmailProductEnquiry !== false) {
  // Send email...
}
```

#### Job Applications (`/routes/jobs.js`)
```javascript
// Checks if job application emails are enabled
if (settings && settings.email && settings.enableEmailJobApplication !== false) {
  // Send email...
}
```

#### Dynamic Forms (`/routes/dynamicForms.js`)
```javascript
// Checks both global setting AND form-specific setting
if (notificationEmail && 
    settings?.enableEmailDynamicForms !== false && 
    form.emailNotifications !== false) {
  // Send email...
}
```

**Note:** Dynamic forms have TWO levels of control:
- Global setting: `enableEmailDynamicForms` (in Settings)
- Per-form setting: `emailNotifications` (in each form)

### 3. Admin UI (`/client/src/pages/admin/Settings.js`)

Added new section in the SMTP Email Settings tab:

**Email Notification Settings**
- ✅ Contact Form Submissions
- ✅ Product Enquiries
- ✅ Job Applications
- ✅ Dynamic Forms

Each has:
- Checkbox to enable/disable
- Description of what it controls
- Visual feedback

## Usage

### Admin Access

1. Navigate to: **Admin Panel → Settings → SMTP**
2. Scroll down to "Email Notification Settings" section
3. Toggle checkboxes to enable/disable notifications

### Default Behavior

By default, all email notifications are **enabled**. This ensures existing functionality continues to work without configuration.

### Individual Controls

| Setting | Controls | Default |
|---------|----------|---------|
| Contact Form Submissions | `/api/contact` POST | ✅ Enabled |
| Product Enquiries | `/api/product-enquiries` POST | ✅ Enabled |
| Job Applications | `/api/jobs/:id/apply` POST | ✅ Enabled |
| Dynamic Forms | `/api/forms/:id/submit` POST | ✅ Enabled |

## Dynamic Forms - Special Behavior

Dynamic forms have **two-level control**:

### Level 1: Global Setting (in Settings)
```
enableEmailDynamicForms: true/false
```
Controls ALL dynamic forms globally.

### Level 2: Per-Form Setting (in each Dynamic Form)
```
emailNotifications: true/false
```
Controls individual form notifications.

**Logic:**
```
Send email if:
- Global setting is enabled (Settings → enableEmailDynamicForms)
- AND form-specific setting is enabled (Form → emailNotifications)
- AND notification email is configured
```

### Example Scenarios

**Scenario 1: Disable all dynamic form emails**
- Settings → enableEmailDynamicForms: `false`
- Result: No dynamic forms send emails, regardless of individual form settings

**Scenario 2: Selectively enable specific forms**
- Settings → enableEmailDynamicForms: `true`
- Form A → emailNotifications: `true` ✅ Sends emails
- Form B → emailNotifications: `false` ❌ Does NOT send emails

**Scenario 3: Enable all forms**
- Settings → enableEmailDynamicForms: `true`
- All forms → emailNotifications: `true`
- Result: All forms send emails

## API Behavior

### When Disabled

If email notification is disabled for a form type:
- Form submission still succeeds
- Data is saved to database
- Email is NOT sent
- No error is returned
- Logs show: "Email notifications disabled for [form type]"

### Backward Compatibility

- All settings default to `true` (enabled)
- If setting doesn't exist in database, defaults to `true`
- Existing forms continue working without changes
- No migration required

## Testing

### Test Checklist

1. **Contact Form**
   - [ ] Enabled: Submit → Email received
   - [ ] Disabled: Submit → No email, submission saved

2. **Product Enquiry**
   - [ ] Enabled: Submit → Email received
   - [ ] Disabled: Submit → No email, submission saved

3. **Job Application**
   - [ ] Enabled: Submit → Email received
   - [ ] Disabled: Submit → No email, submission saved

4. **Dynamic Forms**
   - [ ] Global enabled, form enabled → Email received
   - [ ] Global enabled, form disabled → No email
   - [ ] Global disabled, form enabled → No email
   - [ ] Global disabled, form disabled → No email

### Testing Steps

```bash
# 1. Disable contact form emails
Admin → Settings → SMTP → Uncheck "Contact Form Submissions"

# 2. Submit contact form
Visit /contact → Submit form

# 3. Verify
- Check database: Submission exists ✅
- Check email: No email received ✅
- Check logs: "Email notifications disabled" ✅

# 4. Re-enable
Admin → Settings → SMTP → Check "Contact Form Submissions"

# 5. Submit again
Visit /contact → Submit form

# 6. Verify
- Check email: Email received ✅
```

## UI Screenshots

### Email Notification Controls

Located in: **Admin Panel → Settings → SMTP**

```
┌─────────────────────────────────────────┐
│ Email Notification Settings             │
├─────────────────────────────────────────┤
│ Control which form submissions trigger  │
│ email notifications.                     │
│                                          │
│ ☑ Contact Form Submissions              │
│   Send email when visitors submit the   │
│   contact form                           │
│                                          │
│ ☑ Product Enquiries                     │
│   Send email when visitors enquire      │
│   about products                         │
│                                          │
│ ☑ Job Applications                      │
│   Send email when candidates submit     │
│   job applications                       │
│                                          │
│ ☑ Dynamic Forms                          │
│   Send email for custom dynamic forms   │
│   (can be overridden per form)          │
│                                          │
└─────────────────────────────────────────┘
```

## Configuration Examples

### Disable All Email Notifications

```javascript
// In Admin Settings
enableEmailContact: false
enableEmailProductEnquiry: false
enableEmailJobApplication: false
enableEmailDynamicForms: false
```

**Use Case:** Development/testing environment, or when using external notification system.

### Enable Only Critical Notifications

```javascript
enableEmailContact: false          // No contact emails
enableEmailProductEnquiry: true    // Get product enquiries
enableEmailJobApplication: true    // Get job applications
enableEmailDynamicForms: false     // No dynamic form emails
```

**Use Case:** High-traffic site, want to reduce email volume, prioritize sales and recruitment.

### Enable All (Default)

```javascript
enableEmailContact: true
enableEmailProductEnquiry: true
enableEmailJobApplication: true
enableEmailDynamicForms: true
```

**Use Case:** Normal operation, want all form notifications.

## Benefits

1. **Granular Control**: Enable/disable notifications per form type
2. **Reduce Email Volume**: Disable unnecessary notifications
3. **Flexible**: Different settings for dev/staging/production
4. **Backward Compatible**: Existing setups work without changes
5. **User-Friendly**: Simple checkboxes in admin panel
6. **Safe**: Form submissions always saved, only email is affected

## Future Enhancements

Possible future improvements:

1. **Email Throttling**: Limit emails per hour/day
2. **Notification Groups**: Send to different emails based on form type
3. **Email Templates**: Customize email format per form type
4. **Schedule**: Only send emails during business hours
5. **Digest Mode**: Batch multiple submissions into one email
6. **Priority Levels**: Mark certain forms as high-priority
7. **Webhooks**: Alternative to email for integrations
8. **SMS Notifications**: Add SMS option for critical forms

## Troubleshooting

### Emails Not Being Sent

**Check 1:** Verify setting is enabled
```
Admin → Settings → SMTP → Check relevant checkbox
```

**Check 2:** Verify SMTP is configured
```
Admin → Settings → SMTP → Test SMTP Connection
```

**Check 3:** Check contact email is set
```
Admin → Settings → General → Contact Email
```

**Check 4:** Check server logs
```bash
docker-compose logs -f app | grep "Email"
```

### Unexpected Behavior

**Dynamic Forms Not Sending:**
- Check global setting: `enableEmailDynamicForms`
- Check form-specific setting: `emailNotifications`
- Both must be `true` for emails to send

**Emails Sending When Disabled:**
- Clear browser cache
- Check database for current setting value
- Restart application: `docker-compose restart app`

## Related Files

- `/models/Settings.js` - Database schema
- `/routes/contact.js` - Contact form route
- `/routes/productEnquiry.js` - Product enquiry route
- `/routes/jobs.js` - Job application route
- `/routes/dynamicForms.js` - Dynamic forms route
- `/client/src/pages/admin/Settings.js` - Admin UI

## Changelog

### Version 1.0 (Current)
- ✅ Added 4 email notification toggles
- ✅ Updated backend routes to check settings
- ✅ Added UI controls in admin panel
- ✅ Backward compatible with defaults
- ✅ Two-level control for dynamic forms
- ✅ Documentation complete

---

**Feature Status:** ✅ Complete and Ready

All form types now have individual email notification controls accessible from the admin settings page!
