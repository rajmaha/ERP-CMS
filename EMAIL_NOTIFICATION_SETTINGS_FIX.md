# Email Notification Settings - Fix Applied

## Issue
Email notification settings (enableEmailContact, etc.) were not being saved when updating settings in the admin panel.

## Root Cause
The `/routes/settings.js` POST endpoint was missing the new email notification fields in the `updateData` object.

## Fix Applied

### File: `/routes/settings.js`

Added the following fields to the settings update endpoint:

```javascript
enableEmailContact: req.body.enableEmailContact !== undefined ? req.body.enableEmailContact : true,
enableEmailProductEnquiry: req.body.enableEmailProductEnquiry !== undefined ? req.body.enableEmailProductEnquiry : true,
enableEmailJobApplication: req.body.enableEmailJobApplication !== undefined ? req.body.enableEmailJobApplication : true,
enableEmailDynamicForms: req.body.enableEmailDynamicForms !== undefined ? req.body.enableEmailDynamicForms : true,
```

### File: `/client/src/pages/admin/Settings.js`

Also added missing reCAPTCHA enable fields to the submit data:

```javascript
enableRecaptchaContact: settings.enableRecaptchaContact !== undefined ? settings.enableRecaptchaContact : true,
enableRecaptchaProductEnquiry: settings.enableRecaptchaProductEnquiry !== undefined ? settings.enableRecaptchaProductEnquiry : true,
enableRecaptchaJobApply: settings.enableRecaptchaJobApply !== undefined ? settings.enableRecaptchaJobApply : true,
```

## Testing

### Before Fix
1. Go to Settings → SMTP
2. Uncheck "Contact Form Submissions"
3. Click Save
4. Reload page
5. ❌ Checkbox is checked again (not saved)

### After Fix
1. Go to Settings → SMTP
2. Uncheck "Contact Form Submissions"
3. Click Save
4. Reload page
5. ✅ Checkbox remains unchecked (saved correctly)

## Verification

To verify the fix is working:

```bash
# 1. Test in browser
Admin → Settings → SMTP → Toggle any email notification → Save

# 2. Check database directly
docker-compose exec mongodb mongosh -u admin -p changeme123 --authenticationDatabase admin
use erp_cms
db.settings.findOne({}, {
  enableEmailContact: 1,
  enableEmailProductEnquiry: 1,
  enableEmailJobApplication: 1,
  enableEmailDynamicForms: 1
})

# 3. Test API directly
curl -X POST http://localhost:5000/api/settings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "enableEmailContact": false,
    "enableEmailProductEnquiry": true,
    "enableEmailJobApplication": true,
    "enableEmailDynamicForms": false
  }'
```

## Files Modified

1. ✅ `/routes/settings.js` - Added email notification fields to update endpoint
2. ✅ `/client/src/pages/admin/Settings.js` - Added reCAPTCHA fields to submit data

## Status

✅ **Fixed** - Email notification settings now save and persist correctly

## Additional Notes

- All settings default to `true` if not provided
- Settings are immediately effective (no restart required)
- Changes can be verified in Settings page after reload
- Database stores the actual boolean values
