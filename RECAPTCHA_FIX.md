# reCAPTCHA Verification Fix

## Issue
The reCAPTCHA verification was still triggering even when disabled in the admin settings. The system was showing "reCAPTCHA verification failed" messages despite having reCAPTCHA disabled.

## Root Cause
All form submission routes were checking for `process.env.RECAPTCHA_SECRET_KEY` instead of checking the database settings:
- `enableRecaptchaContact`
- `enableRecaptchaJobApply`
- `enableRecaptchaProductEnquiry`

This meant that if the environment variable existed, reCAPTCHA validation would run regardless of the admin panel settings.

## Solution
Updated all affected routes to:
1. Fetch settings from the database
2. Check if reCAPTCHA is enabled for that specific form type
3. Use the secret key from database settings instead of environment variables

## Files Modified

### 1. `/routes/contact.js`
- Added `Settings` model import
- Changed verification logic to check `settings.enableRecaptchaContact`
- Uses `settings.recaptchaSecretKey` instead of `process.env.RECAPTCHA_SECRET_KEY`

### 2. `/routes/productEnquiry.js`
- Added `Settings` model import
- Changed verification logic to check `settings.enableRecaptchaProductEnquiry`
- Uses `settings.recaptchaSecretKey` instead of `process.env.RECAPTCHA_SECRET_KEY`

### 3. `/routes/jobs.js`
- Added `Settings` model import
- Changed verification logic to check `settings.enableRecaptchaJobApply`
- Uses `settings.recaptchaSecretKey` instead of `process.env.RECAPTCHA_SECRET_KEY`

### 4. `/routes/dynamicForms.js`
- Added `Settings` model import
- Updated to fetch settings and use `settings.recaptchaSecretKey`
- Already had proper check for `form.enableRecaptcha`

## Testing
After this fix:
1. Go to Admin Settings > Security/Forms
2. Disable reCAPTCHA for any form type (Contact, Product Enquiry, or Job Application)
3. Submit the form - it should work without reCAPTCHA validation
4. Enable reCAPTCHA again and verify it works with validation

## Impact
- Forms now respect the reCAPTCHA enable/disable settings from the admin panel
- No breaking changes to existing functionality
- Better control over reCAPTCHA usage per form type
