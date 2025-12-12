# 🌐 Google Cloud TTS Setup Guide - BEST FREE OPTION

## 🆓 Get 1 Million Free Characters Per Month!

Google Cloud TTS offers the **most generous free tier** with 1 million characters per month - 100x more than ElevenLabs!

### 🚀 Quick Setup (10 minutes)

#### Step 1: Create Google Cloud Account
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Sign in with your Google account
3. Accept terms and create account
4. **No credit card required for free tier!**

#### Step 2: Create New Project
1. Click "Select a project" (top left)
2. Click "New Project"
3. Name it "VidPilot TTS" or similar
4. Click "Create"

#### Step 3: Enable Text-to-Speech API
1. Go to [APIs & Services](https://console.cloud.google.com/apis/library)
2. Search for "Text-to-Speech API"
3. Click on "Cloud Text-to-Speech API"
4. Click "Enable"

#### Step 4: Create API Key
1. Go to [Credentials](https://console.cloud.google.com/apis/credentials)
2. Click "Create Credentials" → "API Key"
3. Copy your API key (starts with `AIza`)
4. **Optional:** Click "Restrict Key" for security:
   - API restrictions: Select "Cloud Text-to-Speech API"
   - Application restrictions: Choose as needed

#### Step 5: Add to VidPilot
1. Open your `.env` file in VidPilot
2. Find this line:
   ```
   VITE_GOOGLE_TTS_API_KEY=your_google_tts_key_here
   ```
3. Replace with your actual key:
   ```
   VITE_GOOGLE_TTS_API_KEY=AIzaSyYour_Actual_API_Key_Here
   ```
4. Save the file

#### Step 6: Restart & Test
1. Stop your development server (Ctrl+C)
2. Restart: `npm run dev` (or `yarn dev` / `bun dev`)
3. Go to Voice-Over Generator
4. Click "🌐 Test Google Cloud TTS (1M Free)" button
5. Should show success message with voice count
6. Select "Premium Quality" or higher
7. Generate voice-over - should now use Google TTS!

## ✅ Success Indicators

When Google Cloud TTS is working correctly, you'll see:
- Console log: "🎤 Trying Google Cloud TTS (1M chars/month free)..."
- Console log: "✅ Google Cloud TTS generation successful!"
- Provider shows: "Google Cloud TTS (Free Tier)"
- Excellent audio quality with natural voices

## 🎯 Free Tier Benefits

With Google Cloud TTS free tier, you get:
- **1,000,000 characters/month** (≈ 2000+ voice-overs!)
- **220+ premium voices** in 40+ languages
- **WaveNet voices** (neural network-based)
- **SSML support** for advanced control
- **Commercial use allowed**
- **No credit card required**

### Character Usage Examples:
- Short video script: ~500 characters
- Medium article: ~2,000 characters  
- Long presentation: ~5,000 characters
- **Total: ~2000 voice-overs per month!**

## 🆚 Provider Comparison

| Provider | Quality | Free Limit | Setup Time | Status |
|----------|---------|------------|------------|--------|
| **Google Cloud TTS** | ⭐⭐⭐⭐⭐ | 1M chars/month | 10 min | ✅ **Recommended** |
| ElevenLabs | ⭐⭐⭐⭐⭐ | 10K chars/month | 5 min | ❌ Models deprecated |
| OpenAI TTS | ⭐⭐⭐⭐ | Paid only | 5 min | ❌ Quota exceeded |
| Browser TTS | ⭐⭐⭐ | Unlimited | None | ✅ Fallback |

## 🔧 Troubleshooting

### Common Issues:

#### 1. "Google Cloud TTS API key not found"
- Check `.env` file has correct key
- Key should start with `AIza`
- Restart development server after changing `.env`

#### 2. "API access denied - check permissions"
- Make sure Text-to-Speech API is enabled
- Check API key restrictions in Google Cloud Console
- Verify project is selected correctly

#### 3. "API quota exceeded"
- You've used 1M characters this month (very unlikely!)
- Check usage in Google Cloud Console
- Wait for monthly reset

#### 4. "Bad request - check parameters"
- Text might be too long (limit: 5000 chars)
- Invalid language/voice combination
- Check console for detailed error

### Debug Steps:
1. Open browser console (F12)
2. Generate voice-over with "Premium Quality"
3. Look for Google TTS logs
4. Check for error messages
5. Verify API key format and permissions

## 🎉 Voice Quality Features

Google Cloud TTS provides:
- **WaveNet voices**: Most natural-sounding AI voices
- **Standard voices**: High quality, faster generation
- **Multiple languages**: 40+ languages supported
- **Custom voice speed**: 0.25x to 4.0x speed
- **Pitch control**: -20 to +20 semitones
- **SSML support**: Advanced speech markup

## 💡 Pro Tips

1. **Monitor Usage**: Check Google Cloud Console for character usage
2. **Voice Selection**: Try different voices for different content types
3. **Speed Control**: Adjust speed for different audiences
4. **Language Support**: Great for multilingual content
5. **Batch Processing**: Process multiple texts efficiently

## 🔗 Useful Links

- [Google Cloud Console](https://console.cloud.google.com)
- [Text-to-Speech API Documentation](https://cloud.google.com/text-to-speech/docs)
- [Voice Samples](https://cloud.google.com/text-to-speech/docs/voices)
- [Pricing Calculator](https://cloud.google.com/products/calculator)
- [SSML Guide](https://cloud.google.com/text-to-speech/docs/ssml)

## 🎊 Why Google Cloud TTS is Best

1. **Massive Free Tier**: 100x more characters than ElevenLabs
2. **Enterprise Quality**: Used by Google products
3. **Reliable**: 99.9% uptime SLA
4. **Constantly Updated**: New voices added regularly
5. **No Deprecation Risk**: Stable API with long-term support

---

**🌐 Enjoy professional voice generation with Google's massive free tier!**

This gives you 1 million characters per month - enough for thousands of voice-overs without any cost!