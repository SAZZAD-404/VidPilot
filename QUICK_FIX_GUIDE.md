# 🚀 Quick Fix: Get Premium Voice-Over Working

## 🎯 Problem
You're only getting Browser TTS instead of premium AI voices because:
- ElevenLabs API key is placeholder (`your_elevenlabs_key`)
- OpenAI quota exceeded
- Murf.ai has errors

## ✅ 5-Minute Solution

### Step 1: Get ElevenLabs Free API Key
1. Go to [elevenlabs.io](https://elevenlabs.io)
2. Sign up (free, no credit card)
3. Go to Profile → API Keys
4. Copy your API key (starts with `sk-`)

### Step 2: Update .env File
Replace this line in your `.env`:
```bash
VITE_ELEVENLABS_API_KEY=your_elevenlabs_key
```
With your real key:
```bash
VITE_ELEVENLABS_API_KEY=sk-your_actual_api_key_here
```

### Step 3: Restart & Test
1. Stop server: `Ctrl+C`
2. Start server: `npm run dev`
3. Go to Voice-Over Generator
4. Click "🎤 Test ElevenLabs API (Free)" button
5. Should show "✅ ElevenLabs API connection successful!"

### Step 4: Generate Premium Voice-Over
1. Select "Premium Quality" or higher
2. Enter your text
3. Click "Generate Voice-Over"
4. Should now use ElevenLabs instead of Browser TTS!

## 🎉 Success Indicators
- Console shows: "🎤 Trying ElevenLabs TTS (Best Free Quality)..."
- Provider shows: "ElevenLabs TTS (Free Tier)"
- Much better audio quality
- 10,000 free characters per month

## 🆘 Still Not Working?
1. Check browser console (F12) for error messages
2. Make sure API key starts with `sk-`
3. Verify you selected "Premium Quality" (not "Standard")
4. Try the test button first

---
**🎤 This gives you professional voice-over quality for free!**