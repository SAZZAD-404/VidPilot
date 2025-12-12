# 🎤 ElevenLabs Free TTS Setup Guide

## 🆓 Get 10,000 Free Characters Per Month

ElevenLabs offers the **best free TTS quality** with 10,000 characters per month - perfect for voice-overs!

### 🚀 Quick Setup (5 minutes)

#### Step 1: Create Free Account
1. Go to [elevenlabs.io](https://elevenlabs.io)
2. Click "Sign Up" (top right)
3. Use your email or Google account
4. **No credit card required!**

#### Step 2: Get Your API Key
1. After signing up, go to [Speech Synthesis](https://elevenlabs.io/app/speech-synthesis)
2. Click your profile picture (top right)
3. Select "Profile + API Key"
4. Copy your API key (starts with `sk-`)

#### Step 3: Add to VidPilot
1. Open your `.env` file in VidPilot
2. Find this line:
   ```
   VITE_ELEVENLABS_API_KEY=your_elevenlabs_key_here
   ```
3. Replace with your actual key:
   ```
   VITE_ELEVENLABS_API_KEY=sk-your_actual_api_key_here
   ```
4. Save the file

#### Step 4: Restart & Test
1. Stop your development server (Ctrl+C)
2. Restart: `npm run dev` (or `yarn dev` / `bun dev`)
3. Go to Voice-Over Generator
4. Select "Premium Quality" or higher
5. Enter some text and click "Generate Voice-Over"
6. Should now use ElevenLabs instead of Browser TTS!

## ✅ Success Indicators

When ElevenLabs is working correctly, you'll see:
- Console log: "🎤 Trying ElevenLabs TTS (Best Free Quality)..."
- Console log: "✅ ElevenLabs TTS generation successful!"
- Provider shows: "ElevenLabs TTS (Free Tier)"
- Much better audio quality than Browser TTS

## 🎯 Free Tier Limits

- **10,000 characters/month** (resets monthly)
- **29+ premium voices** available
- **Multiple languages** supported
- **Commercial use allowed**
- **No credit card required**

### Character Usage Examples:
- Short video script: ~500 characters
- Medium article: ~2,000 characters
- Long presentation: ~5,000 characters
- **Total: ~20 voice-overs per month**

## 🔧 Troubleshooting

### Common Issues:

#### 1. "ElevenLabs API key not found"
- Check `.env` file has correct key
- Restart development server
- Key should start with `sk-`

#### 2. "Authentication failed - API key is invalid"
- Copy key again from ElevenLabs dashboard
- Make sure no extra spaces in `.env` file
- Check key is not expired

#### 3. "Quota exceeded"
- You've used 10,000 characters this month
- Wait for monthly reset
- Or upgrade to paid plan for more characters

#### 4. Still using Browser TTS
- Check console for error messages
- Verify API key is correct
- Make sure you selected "Premium Quality" or higher
- "Standard Quality" always uses Browser TTS

### Debug Steps:
1. Open browser console (F12)
2. Generate voice-over
3. Look for ElevenLabs logs
4. Check for error messages

## 🎉 Voice Quality Comparison

| Provider | Quality | Free Limit | Setup Time |
|----------|---------|------------|------------|
| **ElevenLabs** | ⭐⭐⭐⭐⭐ | 10K chars/month | 5 min |
| OpenAI TTS | ⭐⭐⭐⭐ | Paid only | 10 min |
| Browser TTS | ⭐⭐⭐ | Unlimited | None |

## 💡 Pro Tips

1. **Save Characters**: Remove unnecessary punctuation and spaces
2. **Test First**: Use "Standard Quality" for testing, "Premium" for final output
3. **Monitor Usage**: Check remaining characters in ElevenLabs dashboard
4. **Multiple Accounts**: Create separate accounts for different projects (if needed)

## 🔗 Useful Links

- [ElevenLabs Dashboard](https://elevenlabs.io/app/speech-synthesis)
- [API Documentation](https://docs.elevenlabs.io/)
- [Voice Library](https://elevenlabs.io/voices)
- [Pricing Plans](https://elevenlabs.io/pricing)

---

**🎤 Enjoy professional-quality voice generation with ElevenLabs free tier!**

Need help? Check the browser console for detailed error messages.