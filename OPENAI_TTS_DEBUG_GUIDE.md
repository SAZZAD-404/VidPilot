# 🎤 TTS Debugging Guide - ElevenLabs + OpenAI

## 🚨 Current Issue: Only Browser TTS Working

আপনার console logs অনুযায়ী সমস্যা:
- ❌ **ElevenLabs**: Free tier models deprecated (eleven_monolingual_v1 removed)
- ❌ **OpenAI**: Quota exceeded (credit শেষ)
- ❌ **Murf.ai**: 406 errors
- ✅ **Browser TTS**: কাজ করছে কিন্তু quality কম

## 🎯 BEST SOLUTION: Google Cloud TTS (সবচেয়ে ভালো)

Google Cloud TTS **মাসে 1 MILLION characters ফ্রি** দেয় - ElevenLabs এর চেয়ে 100 গুণ বেশি!

### Step 1: Google Cloud Account তৈরি করুন
1. [Google Cloud Console](https://console.cloud.google.com) এ যান
2. Google account দিয়ে sign in করুন
3. Terms accept করুন (credit card লাগবে না!)

### Step 2: Project তৈরি করুন
1. "Select a project" click করুন (উপরে বামে)
2. "New Project" click করুন
3. Name দিন "VidPilot TTS"
4. "Create" click করুন

### Step 3: Text-to-Speech API Enable করুন
1. [APIs & Services](https://console.cloud.google.com/apis/library) এ যান
2. "Text-to-Speech API" search করুন
3. "Cloud Text-to-Speech API" click করুন
4. "Enable" click করুন

### Step 4: API Key তৈরি করুন
1. [Credentials](https://console.cloud.google.com/apis/credentials) এ যান
2. "Create Credentials" → "API Key" click করুন
3. API key copy করুন (শুরু হয় `AIza` দিয়ে)

### Step 5: .env File Update করুন
আপনার `.env` file এ এই line:
```bash
VITE_GOOGLE_TTS_API_KEY=your_google_tts_key_here
```
Replace করুন এই দিয়ে:
```bash
VITE_GOOGLE_TTS_API_KEY=AIzaSyYour_Actual_API_Key_Here
```

### Step 6: Test করুন
1. Development server restart করুন (Ctrl+C, তারপর `npm run dev`)
2. Voice-Over Generator এ যান
3. "🌐 Test Google Cloud TTS (1M Free)" button click করুন
4. Success message দেখুন
5. "Premium Quality" select করুন
6. Text দিয়ে "Generate Voice-Over" click করুন
7. এখন Google TTS ব্যবহার হবে Browser TTS এর পরিবর্তে!

## 🔍 সমস্যা নির্ণয় (Troubleshooting)

আপনি যদি এখনও Browser TTS পাচ্ছেন premium TTS এর পরিবর্তে, তাহলে এই steps follow করুন:

### ✅ Step 1: API Keys Check করুন

Browser console (F12) এ এই command run করুন:
```javascript
console.log('API Keys Status:');
console.log('ElevenLabs:', import.meta.env.VITE_ELEVENLABS_API_KEY);
console.log('OpenAI:', import.meta.env.VITE_OPENAI_API_KEY ? 'Found' : 'Missing');
console.log('Murf:', import.meta.env.VITE_MURF_API_KEY ? 'Found' : 'Missing');
```

**Expected Output:**
- ElevenLabs: `sk-your_actual_key` (not `your_elevenlabs_key`)
- OpenAI: Found বা Missing
- Murf: Found বা Missing

### ✅ Step 2: Quality Level Check করুন

Premium TTS providers এই quality levels এ কাজ করে:
- ❌ **Standard Quality** → Browser TTS (সবসময়)
- ✅ **High Quality** → ElevenLabs → OpenAI → Browser TTS
- ✅ **Premium Quality** → ElevenLabs → OpenAI → Browser TTS
- ✅ **Studio Quality** → ElevenLabs → OpenAI → Browser TTS
- ✅ **Broadcast Quality** → ElevenLabs → OpenAI → Browser TTS

**Important:** "Standard Quality" সবসময় Browser TTS ব্যবহার করে। Premium TTS এর জন্য "High Quality" বা তার উপরে select করুন।

### ✅ Step 3: Console Logs Check করুন

Voice generation এর সময় browser console এ এই messages দেখুন:

**✅ সফল ElevenLabs TTS:**
```
🎙️ Generating REAL AI Voice Over...
🎤 Trying ElevenLabs TTS (Best Free Quality)...
🔑 ElevenLabs API key found, proceeding with TTS generation...
📝 Text length: 50 characters
🎤 ElevenLabs TTS: Using voice ID 21m00Tcm4TlvDq8ikWAM
✅ ElevenLabs TTS API response received successfully
✅ ElevenLabs TTS generation successful!
```

**❌ Failed Premium TTS (fallback to Browser TTS):**
```
❌ ElevenLabs TTS failed, trying OpenAI fallback: Error message
❌ OpenAI TTS failed, trying Murf.ai fallback: Error message
🎤 Using Browser SpeechSynthesis API for REAL voice...
💡 Tip: Select "High Quality" or above to use OpenAI TTS instead of Browser TTS
```

**🎯 Current Issue (আপনার case):**
```
❌ ElevenLabs API key not found or is placeholder
❌ OpenAI TTS API error: 402 - Payment Required (quota exceeded)
❌ Murf.ai API error: 406 - Not Acceptable
🎤 Using Browser SpeechSynthesis API for REAL voice...
```

### ✅ Step 4: API Connection Test করুন

1. Voice Over Generator page এ যান
2. "🔍 Test OpenAI API Connection" button এ click করুন
3. Success/Error message দেখুন

### 🔧 Common Issues & Solutions

#### Issue 1: API Key Invalid
**Error:** `OpenAI API key is invalid or expired`
**Solution:** 
- OpenAI Dashboard এ গিয়ে নতুন API key generate করুন
- `.env` file এ update করুন
- Server restart করুন

#### Issue 2: Quota Exceeded  
**Error:** `OpenAI API quota exceeded`
**Solution:**
- OpenAI account এ billing check করুন
- Credit add করুন অথবা payment method add করুন

#### Issue 3: Rate Limit
**Error:** `OpenAI API rate limit exceeded`
**Solution:**
- কিছুক্ষণ wait করুন
- আবার try করুন

#### Issue 4: Network Error
**Error:** Network/fetch related errors
**Solution:**
- Internet connection check করুন
- VPN disable করুন
- Firewall settings check করুন

### 🎯 Debug Commands

Browser console এ এই commands run করুন:

```javascript
// Check environment variables
console.log('Environment:', {
  openai: import.meta.env.VITE_OPENAI_API_KEY ? 'Found' : 'Missing',
  murf: import.meta.env.VITE_MURF_API_KEY ? 'Found' : 'Missing'
});

// Test API call manually
fetch('https://api.openai.com/v1/audio/speech', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'tts-1',
    input: 'Hello world',
    voice: 'alloy'
  })
}).then(r => console.log('API Response:', r.status, r.statusText));
```

### 📋 Checklist

- [ ] OpenAI API key configured in `.env`
- [ ] Quality level set to "High" or above
- [ ] Browser console shows OpenAI TTS logs
- [ ] API connection test passes
- [ ] No network/firewall issues
- [ ] OpenAI account has sufficient credits

### 🆘 Still Not Working?

যদি এখনও Browser TTS ব্যবহার হয়:

1. **Hard refresh:** Ctrl+F5 বা Cmd+Shift+R
2. **Clear cache:** Browser cache clear করুন
3. **Restart dev server:** `npm run dev` restart করুন
4. **Check network tab:** Browser DevTools এ network requests check করুন
5. **Try different browser:** Chrome/Firefox/Edge test করুন

### 📞 Support

Console logs এর screenshot নিয়ে support এ contact করুন।