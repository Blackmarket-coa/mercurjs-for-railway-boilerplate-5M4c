# Apprise API for Railway Deployment
# 
# To deploy Apprise API on Railway:
# 1. Create a new service in your Railway project
# 2. Choose "Deploy from Docker Image"
# 3. Use image: caronc/apprise-api:latest
# 4. Set the following environment variables

# Required Environment Variables for Railway:
# ============================================

# Port (Railway sets this automatically)
# PORT=8000

# Optional: Persistent storage path
# APPRISE_STATEFUL_MODE=simple
# APPRISE_CONFIG_LOCK=no

# Configuration URLs (add your notification services here)
# ========================================================
# 
# Format: APPRISE_URLS="url1,url2,url3"
#
# Examples:
#
# Email (Gmail):
#   APPRISE_URLS="mailto://your-email:app-password@gmail.com"
#
# SMS (Twilio):
#   APPRISE_URLS="twilio://AccountSid:AuthToken@FromPhone/ToPhone1/ToPhone2"
#
# Discord Webhook:
#   APPRISE_URLS="discord://WebhookID/WebhookToken"
#
# Slack:
#   APPRISE_URLS="slack://TokenA/TokenB/TokenC/#channel"
#
# Telegram:
#   APPRISE_URLS="tgram://BotToken/ChatID"
#
# Pushover (mobile push):
#   APPRISE_URLS="pover://UserKey@AppToken"
#
# ntfy (self-hosted push):
#   APPRISE_URLS="ntfy://topic" or "ntfys://ntfy.sh/your-topic"
#
# Multiple services:
#   APPRISE_URLS="discord://...,slack://...,mailto://..."

# Environment Variables for Backend Service:
# ==========================================
# Add these to your backend Railway service:
#
# APPRISE_API_URL=https://your-apprise-service.railway.app
# APPRISE_CONFIG_KEY=default  (optional, for persistent configs)

# Docker Run Command (for local testing):
# =======================================
# docker run -d \
#   -p 8000:8000 \
#   -e APPRISE_STATEFUL_MODE=simple \
#   caronc/apprise-api:latest

# API Endpoints:
# ==============
# POST /notify         - Send notification (urls in body)
# POST /notify/{key}   - Send to saved config
# POST /add/{key}      - Save config
# GET  /get/{key}      - Get config
# POST /del/{key}      - Delete config
# GET  /status         - Health check
