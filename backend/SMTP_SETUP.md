# Free SMTP Email Setup Guide

This guide shows you how to set up **free email sending** using SMTP instead of Resend. No domain verification required!

## Why SMTP Instead of Resend?

✅ **Completely FREE** - No API costs
✅ **No domain verification** needed
✅ **Works immediately** - No DNS setup
✅ **Multiple provider options** - Gmail, Outlook, Yahoo, etc.

## Quick Start (Gmail - Recommended)

### Step 1: Get Gmail App Password

1. **Enable 2-Factor Authentication** on your Gmail account
   - Go to https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Create App Password**
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Name it "MercurJS Backend"
   - Click "Generate"
   - **Copy the 16-character password** (you'll need this!)

### Step 2: Configure Environment Variables

Add these to your Railway environment variables or `.env` file:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
SMTP_FROM=your-email@gmail.com
```

### Step 3: Install Dependencies & Restart

```bash
pnpm install
# Then restart your backend service
```

That's it! Password reset emails will now send through your Gmail account.

---

## Other Free SMTP Providers

### Microsoft Outlook / Hotmail

```bash
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
SMTP_FROM=your-email@outlook.com
```

**Note**: Outlook may require an app password if you have 2FA enabled.

### Yahoo Mail

```bash
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@yahoo.com
```

**Note**: Yahoo requires an app password: https://help.yahoo.com/kb/SLN15241.html

### Custom SMTP Server

If you have your own mail server:

```bash
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587                    # or 465 for SSL
SMTP_SECURE=false                # or true for port 465
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=your-password
SMTP_FROM=noreply@yourdomain.com
```

---

## Configuration Reference

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SMTP_HOST` | ✅ Yes | - | SMTP server hostname |
| `SMTP_PORT` | ✅ Yes | 587 | SMTP server port (587 or 465) |
| `SMTP_SECURE` | No | auto | Use SSL/TLS (true for port 465) |
| `SMTP_USER` | ✅ Yes | - | SMTP username (usually your email) |
| `SMTP_PASS` | ✅ Yes | - | SMTP password or app password |
| `SMTP_FROM` | No | SMTP_USER | Email address to send from |

### Common Ports

- **Port 587** (STARTTLS) - Recommended, works with most firewalls
- **Port 465** (SSL/TLS) - Older standard, requires `SMTP_SECURE=true`
- **Port 25** (Plain) - Often blocked by ISPs, not recommended

---

## Troubleshooting

### "Invalid login" Error

**Solution**: You likely need an **app password** instead of your regular password.

- **Gmail**: https://myaccount.google.com/apppasswords (requires 2FA)
- **Outlook**: https://account.microsoft.com/security
- **Yahoo**: https://help.yahoo.com/kb/SLN15241.html

### "Connection timeout" Error

**Possible causes**:
1. Wrong SMTP host or port
2. Firewall blocking outbound SMTP connections
3. ISP blocking port 25 (use port 587 instead)

**Solution**: Try port 587 with `SMTP_SECURE=false`

### Emails going to spam

**Solutions**:
1. Use a verified email address in `SMTP_FROM`
2. Avoid generic content that triggers spam filters
3. Consider adding SPF/DKIM records if using custom domain
4. Use a professional "from" address (not personal Gmail for business)

### "Must issue STARTTLS command first"

**Solution**: Set `SMTP_SECURE=false` when using port 587

### Rate limits (Gmail: 500 emails/day)

**Options**:
1. Use multiple Gmail accounts with load balancing (not implemented)
2. Switch to Amazon SES ($0.10 per 1000 emails)
3. Use SendGrid free tier (100 emails/day)
4. Use Mailgun free tier (5000 emails/month)

---

## Switching Between SMTP and Resend

The backend **automatically chooses the provider** based on environment variables:

1. **SMTP is used** if `SMTP_HOST` is set
2. **Resend is used** if `SMTP_HOST` is not set but `RESEND_API_KEY` is set
3. **No email service** if neither is configured

To switch from Resend to SMTP:
- Add SMTP environment variables
- Restart the backend
- (Optional) Remove `RESEND_API_KEY` to prevent fallback

To switch from SMTP back to Resend:
- Remove `SMTP_HOST` variable
- Ensure `RESEND_API_KEY` is set
- Restart the backend

---

## Testing Your Configuration

### 1. Check Logs on Startup

After restarting, you should see:

```
[inf] SMTP connection verified successfully
```

If you see an error, check your credentials.

### 2. Test Password Reset

1. Go to your frontend
2. Click "Forgot Password"
3. Enter an email address
4. Check backend logs for:

```
[passwordReset subscriber] Password reset email sent successfully to email@example.com
```

### 3. Check Email Inbox

The password reset email should arrive within seconds. Check spam folder if not in inbox.

---

## Security Best Practices

### Production Recommendations

1. ✅ **Use app passwords**, never your main account password
2. ✅ **Use environment variables**, never hardcode credentials
3. ✅ **Use dedicated email account** for sending (e.g., noreply@)
4. ✅ **Enable 2FA** on the email account
5. ✅ **Monitor sending limits** to avoid lockouts

### For High-Volume Production

If sending more than 500 emails/day, consider:

- **Amazon SES** - $0.10 per 1000 emails, very reliable
- **SendGrid** - 100/day free, paid plans available
- **Mailgun** - 5000/month free, paid plans available
- **Postmark** - Excellent deliverability, paid only

---

## Comparison: SMTP vs Resend vs Other Services

| Service | Cost | Setup Difficulty | Domain Verification | Daily Limit |
|---------|------|------------------|---------------------|-------------|
| **Gmail SMTP** | FREE | ⭐ Easy | ❌ No | 500 emails |
| **Outlook SMTP** | FREE | ⭐ Easy | ❌ No | 300 emails |
| **Resend** | FREE (1K/mo) | ⭐⭐ Medium | ✅ Yes | ~33 emails/day |
| **SendGrid** | FREE (100/day) | ⭐⭐ Medium | ⚠️  Optional | 100 emails |
| **Amazon SES** | $0.10/1K | ⭐⭐⭐ Hard | ✅ Yes | High |
| **Mailgun** | FREE (5K/mo) | ⭐⭐ Medium | ⚠️  Optional | ~166 emails/day |

**Recommendation**: Start with Gmail SMTP for development, move to Amazon SES for production.

---

## Related Files

- SMTP Service: `src/modules/smtp/service.ts`
- Module Configuration: `src/modules/smtp/index.ts`
- Email Templates: `src/modules/resend/emails/` (shared with Resend)
- Password Reset Subscriber: `src/subscribers/password-reset.ts`
- Main Config: `medusa-config.ts` (lines 302-340)

---

## Need Help?

- **Gmail App Passwords**: https://support.google.com/accounts/answer/185833
- **Nodemailer Docs**: https://nodemailer.com/about/
- **Check SMTP Settings**: https://www.gmass.co/smtp-test

---

## Migration from Resend

If you were using Resend and want to switch to SMTP:

1. **Backup current config** (save your `RESEND_API_KEY` somewhere safe)
2. **Add SMTP variables** as shown above
3. **Restart backend** - SMTP will automatically take priority
4. **Test password reset** to confirm it works
5. **Optional**: Remove `RESEND_API_KEY` to prevent fallback

No code changes needed - the system automatically detects and uses SMTP when configured!
