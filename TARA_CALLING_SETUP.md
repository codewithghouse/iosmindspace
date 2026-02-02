# TARA Calling Integration Setup Guide

## Environment Variables

To enable TARA voice calling functionality, you need to add the following environment variables to your `.env` file:

### Required for TARA Calling

```env
# ElevenLabs API Configuration
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# Agent Configuration
VITE_AGENT_ID=your_agent_id_here
```

### Optional (for Subscriptions)

```env
# Razorpay Payment Gateway Configuration
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id_here
VITE_RAZORPAY_SECRET_KEY=your_razorpay_secret_key_here
```

### Existing Firebase Variables (Already Required)

Your existing Firebase configuration variables are already in use:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`

## How to Get These Values

### ElevenLabs API Key
1. Sign up at [ElevenLabs](https://elevenlabs.io/)
2. Go to your profile settings
3. Copy your API key

### Agent ID
1. In ElevenLabs dashboard, go to "Conversational AI"
2. Create or select your voice agent
3. Copy the Agent ID

### Razorpay Keys (Optional)
1. Sign up at [Razorpay](https://razorpay.com/)
2. Go to Settings > API Keys
3. Generate test keys for development or live keys for production
4. Copy Key ID and Secret Key

## Notes

- The `.env` file is gitignored for security
- For production, set these variables in your hosting platform's environment variable settings
- Test keys can be used during development
- Live keys should only be used in production

