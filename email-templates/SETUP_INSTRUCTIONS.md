# Email Template Setup for Supabase

## Overview

This directory contains email templates for the ReadTrace user registration flow. The templates are designed to match the ReadTrace brand with orange accents (#FF7A45) and cream background (#FFF8F2).

## Files

- **confirm-signup.html** - HTML email template with full styling
- **confirm-signup.txt** - Plain text fallback version
- **SETUP_INSTRUCTIONS.md** - This file

## How to Use in Supabase

### Step 1: Access Email Templates

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Authentication** → **Email Templates**

### Step 2: Locate "Confirm signup" Template

1. Find the **"Confirm signup"** template in the list
2. Click on it to open the editor

### Step 3: Copy HTML Template

1. Open `confirm-signup.html` in your text editor
2. Copy the entire HTML content
3. In Supabase, switch to the **HTML** tab (if not already there)
4. Clear the existing template
5. Paste the HTML template

### Step 4: Verify Template Variables

The template uses Supabase's built-in variables:
- `{{ .ConfirmationURL }}` - The email confirmation link (required)
- `{{ .SiteURL }}` - Your application URL (optional)

These are automatically replaced by Supabase when sending emails.

### Step 5: Test the Template

1. Click the **"Test"** button in Supabase
2. Enter a test email address
3. Check your inbox for the test email
4. Verify the styling and links work correctly

### Step 6: Save and Deploy

1. Click **"Save"** to save the template
2. The template is now active for all new registrations

---

## Template Features

### Design Elements

- **Brand Colors**: Orange (#FF7A45) with hover state (#FF6A30)
- **Background**: Cream (#FFF8F2) with peach accents (#FFEDE3)
- **Typography**: System fonts for maximum compatibility
- **Responsive**: Mobile-friendly design that works on all devices

### Content Sections

1. **Header** - ReadTrace branding with gradient background
2. **Greeting** - Personalized welcome message
3. **Main Message** - Clear explanation of what to do
4. **CTA Button** - Large, prominent confirmation button
5. **Alternative Link** - Fallback for email clients that don't support buttons
6. **Security Note** - Reassurance for security-conscious users
7. **What's Next** - Benefits of confirming email
8. **Help Section** - Support contact information
9. **Footer** - Legal links and social media

### Accessibility

- High contrast text (#222222 on #FFF8F2)
- Clear visual hierarchy
- Mobile-responsive design
- Plain text fallback available
- All links are explicit and clickable

---

## Customization

### Change Colors

To customize the orange color, find and replace:
- `#FF7A45` - Primary orange (main CTA button)
- `#FF6A30` - Darker orange (hover state)
- `#FFEDE3` - Light peach (accents)
- `#FFF8F2` - Cream background

### Change Text

All text content can be edited directly in the HTML. Key sections:
- Line 108: Header logo and subtitle
- Line 113: Greeting message
- Line 115: Main message
- Line 120: CTA button text
- Line 125: Alternative link text
- Lines 130-135: Security note
- Lines 139-151: Footer content

### Change Links

Update these URLs to match your site:
- `https://readtrace.com/help` - Help center
- `support@readtrace.com` - Support email
- `https://readtrace.com/privacy` - Privacy policy
- `https://readtrace.com/terms` - Terms of service
- Social media links (Twitter, Instagram, Facebook)

---

## Email Client Compatibility

The template is tested and compatible with:

- **Desktop**: Gmail, Outlook, Apple Mail, Thunderbird
- **Mobile**: Gmail (iOS/Android), Apple Mail (iOS), Outlook (iOS/Android)
- **Web**: Gmail, Outlook.com, Yahoo Mail

### Known Limitations

- Some email clients may not support gradients (fallback to solid color)
- Some clients may not render hover states on links
- Mobile clients may have limited CSS support

---

## Testing Checklist

Before deploying to production:

- [ ] Test in Supabase email template editor
- [ ] Verify confirmation link works
- [ ] Check styling in Gmail
- [ ] Check styling in Outlook
- [ ] Check styling on mobile (iPhone/Android)
- [ ] Verify all links are clickable
- [ ] Test with actual user registration
- [ ] Confirm email delivery is working

---

## Troubleshooting

### Email not received

1. Check Supabase email logs: **Logs** → **Auth**
2. Verify SMTP settings are configured
3. Check spam/junk folder
4. Verify email address is correct

### Styling looks broken

1. Some email clients strip CSS - this is normal
2. The template includes fallback styles
3. Test in multiple email clients
4. Consider using the plain text version for clients with limited CSS support

### Confirmation link not working

1. Verify `{{ .ConfirmationURL }}` is in the template
2. Check that redirect URLs are configured in Auth settings
3. Verify Site URL is correct
4. Check browser console for errors

### Template not updating

1. Clear browser cache
2. Log out and log back into Supabase
3. Try a different browser
4. Check that you clicked "Save"

---

## Plain Text Version

If you need to use the plain text version instead:

1. In Supabase, switch to the **Plain Text** tab
2. Copy the content from `confirm-signup.txt`
3. Paste it into the plain text editor
4. Click **Save**

The plain text version provides the same information without HTML styling.

---

## Version History

- **v1.0** (Feb 10, 2026) - Initial template with ReadTrace branding
  - Orange accent colors (#FF7A45)
  - Cream background (#FFF8F2)
  - Responsive design
  - Mobile-friendly layout

---

## Support

For questions about the template:
- Check Supabase documentation: https://supabase.com/docs/guides/auth/auth-email-templates
- Review the HTML comments in `confirm-signup.html`
- Test in the Supabase email template editor

---

**Last Updated**: February 10, 2026
