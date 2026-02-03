# Email Notifications Implementation

## Overview
Implemented automatic email notifications for all four types of contact/form submissions:
1. **Contact Form** - General website contact submissions
2. **Product Enquiries** - Product-specific enquiry forms
3. **Job Applications** - Career/job application submissions
4. **Dynamic Forms** - Custom form submissions created by admin

All notifications are sent to the contact email address configured in the Settings page of the admin panel (or form-specific email for dynamic forms).

## Features

### 1. Contact Form Notifications
**Route:** `/api/contact`  
**Trigger:** When a visitor submits the contact form

**Email Contains:**
- Sender name and email
- Phone number (if provided)
- Subject (if provided)
- Message content
- Timestamp
- Link to admin panel to view/manage

### 2. Product Enquiry Notifications
**Route:** `/api/product-enquiries`  
**Trigger:** When a visitor enquires about a product

**Email Contains:**
- Product name
- Enquirer name and email
- Phone number (if provided)
- Enquiry message
- Timestamp
- Link to admin panel to view/manage

### 3. Job Application Notifications
**Route:** `/api/jobs/:jobId/apply`  
**Trigger:** When a candidate applies for a job

**Email Contains:**
- Job position, department, and location
- Applicant's full name and email
- Phone number
- Years of experience
- Current company and position (if provided)
- Expected salary (if provided)
- Notice period (if provided)
- Cover letter (if provided)
- LinkedIn and portfolio links (if provided)
- Resume file notification
- Timestamp
- Link to admin panel to view/manage

### 4. Dynamic Form Notifications
**Route:** `/api/forms/:id/submit`  
**Trigger:** When a user submits any custom dynamic form

**Email Contains:**
- Form title and description
- All form responses (formatted by field type)
- Submission timestamp
- IP address (if captured)
- Link to admin panel to view all submissions

**Special Features:**
- Supports all field types (text, email, select, checkbox, radio, etc.)
- Arrays displayed as comma-separated values
- Long text properly formatted with line breaks
- Can use form-specific notification email OR fallback to Settings email

## Implementation Details

### Files Modified

#### 1. `/routes/contact.js`
- Added `sendEmail` import from `emailService`
- Added email notification logic after contact creation
- Uses SMTP settings from database Settings model
- Sends professionally formatted HTML email
- Gracefully handles email failures (doesn't block form submission)

#### 2. `/routes/productEnquiry.js`
- Updated to use `emailService` instead of old `sendEmail` utility
- Changed from environment variable `ADMIN_EMAIL` to Settings model `email` field
- Enhanced email template with better formatting
- Uses database SMTP configuration
- Gracefully handles email failures

#### 3. `/routes/jobs.js`
- Added `sendEmail` import from `emailService`
- Added comprehensive email notification for job applications
- Includes all applicant details in email
- Uses database SMTP configuration
- Gracefully handles email failures

#### 4. `/routes/dynamicForms.js`
- Updated to use `emailService` instead of old `sendEmail` utility
- Uses form-specific `notificationEmail` OR falls back to Settings `email`
- Enhanced email template with proper formatting for all field types
- Handles arrays, objects, and long text responses
- Uses database SMTP configuration
- Gracefully handles email failures
- Sends notification even if form doesn't have specific email configured

### Email Service

**Utility:** `/utils/emailService.js`

Features:
- Creates reusable transporter with custom SMTP settings
- Supports both environment variables and database settings
- Proper error handling
- Returns success/failure status
- Includes SMTP connection testing

### Settings Configuration

Email notifications use the following settings from the Settings model:

**Contact Email:**
- `email` - The email address that receives all notifications

**SMTP Configuration:**
- `smtpHost` - SMTP server hostname
- `smtpPort` - SMTP port (default: 587)
- `smtpSecure` - Use TLS/SSL (true/false)
- `smtpUser` - SMTP username
- `smtpPassword` - SMTP password
- `smtpFromEmail` - From email address
- `smtpFromName` - From name/label

**Fallback:**
If SMTP settings are not configured in the database, the system attempts to use environment variables:
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASSWORD`
- `SMTP_FROM_EMAIL`
- `SMTP_FROM_NAME`

## Email Templates

All email templates feature:
- **Professional Design:** Clean, modern HTML with inline CSS
- **Responsive Layout:** Mobile-friendly design
- **Branded Colors:** Uses primary blue (#2563eb) consistently
- **Clear Hierarchy:** Important information highlighted
- **Action Button:** Direct link to admin panel
- **Timestamp:** Shows when submission was received
- **Contact Links:** Clickable email addresses

### Template Structure
```html
<div style="background: #f9fafb; padding: 20px;">
  <div style="background: white; border-radius: 8px; padding: 30px;">
    <h2>Notification Title</h2>
    
    <div>Contact Information</div>
    <div>Message Content</div>
    <div>Timestamp</div>
    
    <a href="link-to-admin">View in Admin Panel</a>
  </div>
  
  <div>Automated notification footer</div>
</div>
```

## Configuration Steps

### 1. Configure SMTP Settings
Navigate to: **Admin Panel → Settings → Email Settings**

Required fields:
- SMTP Host (e.g., `smtp.gmail.com`)
- SMTP Port (e.g., `587` for TLS, `465` for SSL)
- SMTP User (your email)
- SMTP Password (your email password or app password)
- From Email (e.g., `noreply@yourdomain.com`)
- From Name (e.g., `Your Company Name`)
- SMTP Secure (enable for SSL/TLS)

### 2. Set Contact Email
Navigate to: **Admin Panel → Settings → Contact Information**

Set the email address where you want to receive notifications.

### 3. Test Email Configuration
1. Save your SMTP settings
2. Use the "Test SMTP" button (if available)
3. Or submit a test contact form to verify

## Gmail Configuration Example

If using Gmail:

```
SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP Secure: false (for STARTTLS)
SMTP User: your-email@gmail.com
SMTP Password: [App Password - not your regular password]
From Email: your-email@gmail.com
From Name: Your Company Name
```

**Important:** For Gmail, you need to:
1. Enable 2-Factor Authentication
2. Generate an "App Password" specifically for this application
3. Use the App Password instead of your regular password

## Other Email Providers

### SendGrid
```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP User: apikey
SMTP Password: [Your SendGrid API Key]
```

### Mailgun
```
SMTP Host: smtp.mailgun.org
SMTP Port: 587
SMTP User: [Your Mailgun SMTP username]
SMTP Password: [Your Mailgun SMTP password]
```

### AWS SES
```
SMTP Host: email-smtp.[region].amazonaws.com
SMTP Port: 587
SMTP User: [Your AWS SES SMTP username]
SMTP Password: [Your AWS SES SMTP password]
```

### Office 365 / Outlook
```
SMTP Host: smtp.office365.com
SMTP Port: 587
SMTP Secure: false (STARTTLS)
SMTP User: your-email@outlook.com
SMTP Password: [Your password]
```

## Error Handling

The implementation includes robust error handling:

1. **Email Failure:** If sending email fails, the form submission still succeeds
2. **Missing Configuration:** Gracefully skips email if settings are incomplete
3. **Logging:** Errors are logged to console for debugging
4. **User Experience:** Users are not affected by email issues

### Example Error Handling
```javascript
try {
  await sendEmail({...});
  console.log('Email sent successfully');
} catch (emailError) {
  console.error('Failed to send email:', emailError);
  // Form submission continues regardless
}
```

## Testing

### 1. Test Contact Form
1. Go to `/contact` page
2. Fill out and submit the form
3. Check the configured email address for notification

### 2. Test Product Enquiry
1. Go to any product detail page
2. Click "Send Enquiry"
3. Fill out and submit the form
4. Check email for notification

### 3. Test Job Application
1. Go to `/careers` page
2. Select a job and click "Apply Now"
3. Fill out application form and attach resume
4. Submit application
5. Check email for notification

### 4. Test Dynamic Form
1. Create a custom form in Admin → Forms
2. Set notification email (or leave blank to use Settings email)
3. Enable email notifications for the form
4. Publish the form
5. Navigate to `/forms/[form-slug]`
6. Fill out and submit the form
7. Check email for notification

## Troubleshooting

### Emails Not Received

**Check 1: SMTP Settings**
- Verify all SMTP settings are correct
- Test SMTP connection if test feature is available

**Check 2: Contact Email**
- Verify contact email is set in Settings
- Check for typos in email address

**Check 3: Spam Folder**
- Check spam/junk folder
- Add sending email to safe senders list

**Check 4: Server Logs**
- Check console logs for error messages
- Look for "Email sent successfully" or error logs

**Check 5: Firewall/Port**
- Ensure SMTP port is not blocked
- Try different ports (587, 465, 25)

### Common Issues

**Issue: "Authentication failed"**
- Solution: Check username and password
- For Gmail: Use App Password, not regular password

**Issue: "Connection timeout"**
- Solution: Check SMTP host and port
- Verify firewall settings

**Issue: "Invalid recipient"**
- Solution: Verify contact email format
- Check for extra spaces or special characters

**Issue: "TLS/SSL error"**
- Solution: Try toggling SMTP Secure setting
- Try different ports

## Security Considerations

1. **SMTP Credentials:** Stored encrypted in database
2. **Email Validation:** All email addresses validated before sending
3. **Content Sanitization:** User input is properly escaped in emails
4. **Rate Limiting:** Consider adding rate limiting for form submissions
5. **reCAPTCHA:** Already implemented to prevent spam

## Performance

- **Async Processing:** Email sending doesn't block form submission
- **Error Recovery:** Failed emails don't affect user experience
- **Logging:** All email operations logged for monitoring
- **Connection Pooling:** SMTP transporter reused efficiently

## Future Enhancements

Consider these improvements:

1. **Email Queue:** Use queue system (Bull, BullMQ) for reliability
2. **Retry Logic:** Automatic retry for failed emails
3. **Templates:** Store email templates in database for customization
4. **Admin Notifications:** Send copies to multiple admin emails
5. **User Confirmations:** Send confirmation emails to form submitters
6. **Webhooks:** Add webhook support for external integrations
7. **Analytics:** Track email open rates and click-through rates
8. **Attachments:** Attach resume files to job application emails
9. **Priority Levels:** Set priority for different notification types
10. **Custom Fields:** Allow custom fields in email templates

## API Integration

If you need to integrate with external systems:

```javascript
// Example webhook notification
await axios.post('https://your-webhook-url.com/notifications', {
  type: 'contact_form',
  data: contact,
  timestamp: new Date()
});
```

## Monitoring

To monitor email notifications:

1. Check server logs regularly
2. Monitor SMTP server statistics
3. Track delivery failures
4. Monitor response times
5. Set up alerts for repeated failures

## Support

For issues or questions:
1. Check server console logs
2. Verify SMTP provider documentation
3. Test with different email providers
4. Contact hosting provider for firewall issues

## Related Files

- `/routes/contact.js` - Contact form with notifications
- `/routes/productEnquiry.js` - Product enquiry with notifications
- `/routes/jobs.js` - Job applications with notifications
- `/routes/dynamicForms.js` - Dynamic forms with notifications
- `/utils/emailService.js` - Email service utility
- `/models/Settings.js` - Settings model with email configuration

## Dynamic Forms Email Configuration

Dynamic forms have flexible email configuration:

### Option 1: Form-Specific Email
Set a custom email for each form in the form settings. This email will receive notifications only for that specific form.

**Use Case:** Different departments handle different forms
- Contact Sales form → sales@company.com
- Support Request form → support@company.com
- HR Inquiry form → hr@company.com

### Option 2: Global Email (Fallback)
If no form-specific email is set, notifications go to the email configured in Settings → Contact Information.

**Use Case:** Single team handles all forms

### Option 3: Disable Notifications
Set `emailNotifications: false` in the form settings to disable email notifications for that specific form.

**Use Case:** Forms that log data but don't need immediate notification

## Dynamic Form Field Type Handling

The notification email intelligently handles different field types:

**Text Fields:** Displayed as-is  
**Email Fields:** Displayed with clickable mailto link  
**Select/Dropdown:** Shows selected option  
**Checkboxes (multiple):** Comma-separated list of checked options  
**Radio Buttons:** Shows selected option  
**Textarea:** Preserves line breaks and formatting  
**File Upload:** Shows filename (future: attach file)  
**Arrays/Objects:** Formatted as JSON or comma-separated

Example:
```
Favorite Colors: Red, Blue, Green
Comments: This is a long comment
          that spans multiple lines
          and preserves formatting
```

## Changelog

### Version 1.1 (Current)
- ✅ Added dynamic form notifications
- ✅ Form-specific email OR Settings fallback
- ✅ Enhanced field type handling
- ✅ Array and object support
- ✅ IP address tracking in emails

### Version 1.0
- ✅ Implemented contact form notifications
- ✅ Implemented product enquiry notifications
- ✅ Implemented job application notifications
- ✅ HTML email templates
- ✅ Database-driven SMTP configuration
- ✅ Graceful error handling
- ✅ Comprehensive documentation
