# Resend Email Service Setup

## Current Issue

Password reset emails are failing with the error:
```
You can only send testing emails to your own email address (bmc@blackmarketcoa.com).
To send emails to other recipients, please verify a domain at resend.com/domains,
and change the `from` address to an email using this domain.
```

## Root Cause

The Resend email service is configured with:
- `RESEND_FROM_EMAIL=bmc@blackmarketcoa.com`

However, the domain `blackmarketcoa.com` is **not verified** in your Resend account. Without domain verification, Resend operates in "testing mode" which only allows sending emails to the exact same email address specified in the `from` field.

## Solution

You have two options:

### Option 1: Verify Your Domain (Recommended for Production)

1. **Log in to Resend**
   - Go to [resend.com/domains](https://resend.com/domains)
   - Sign in with your Resend account

2. **Add Your Domain**
   - Click "Add Domain"
   - Enter `blackmarketcoa.com`
   - Follow the DNS verification instructions

3. **Update DNS Records**
   - Add the DNS records provided by Resend to your domain's DNS settings
   - This typically includes:
     - SPF record (TXT)
     - DKIM record (TXT)
     - DMARC record (TXT)

4. **Wait for Verification**
   - DNS propagation can take up to 48 hours
   - Resend will verify your domain automatically
   - You'll receive a confirmation email when verified

5. **Update Environment Variable** (if needed)
   ```bash
   RESEND_FROM_EMAIL=noreply@blackmarketcoa.com
   # or
   RESEND_FROM_EMAIL=support@blackmarketcoa.com
   ```

### Option 2: Use Resend's Testing Email (For Development Only)

For development/testing purposes only, you can use Resend's default testing email:

```bash
RESEND_FROM_EMAIL=onboarding@resend.dev
```

**⚠️ Warning**: This is only for testing and has limitations:
- Professional branding is lost (emails come from resend.dev)
- May have sending limits
- Not suitable for production

## Environment Variables

Ensure these are set in your Railway environment:

```bash
# Required
RESEND_API_KEY=re_your_api_key_here

# From email (must use verified domain or onboarding@resend.dev)
RESEND_FROM_EMAIL=noreply@blackmarketcoa.com
```

## Testing

After setting up domain verification or changing the from email:

1. Restart your backend service
2. Test password reset from the frontend
3. Check the logs for:
   ```
   [passwordReset subscriber] Password reset email sent successfully to [email]
   ```

## Troubleshooting

### Still getting domain verification errors?

- Verify DNS records are correctly set: `dig TXT blackmarketcoa.com`
- Check domain status in Resend dashboard
- DNS changes can take up to 48 hours to propagate

### Emails going to spam?

- Ensure SPF, DKIM, and DMARC records are set
- Use a professional from address (e.g., `noreply@` or `support@`)
- Avoid using free email providers in the from field

### Need help?

- Resend Documentation: https://resend.com/docs
- Resend Support: https://resend.com/support
- Check Railway logs for detailed error messages

## Related Files

- Email service: `src/modules/resend/service.ts`
- Password reset subscriber: `src/subscribers/password-reset.ts`
- Email template: `src/modules/resend/emails/password-reset.tsx`
- Configuration: `medusa-config.ts`
