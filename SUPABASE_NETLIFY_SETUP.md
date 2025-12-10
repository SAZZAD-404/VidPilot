# 🔗 Supabase এ Netlify Link Add করার Guide

## 🎯 কেন এটা প্রয়োজন?

Supabase এ আপনার production URL add করতে হবে যাতে:
- ✅ **Authentication** properly কাজ করে
- ✅ **CORS errors** না আসে
- ✅ **Redirect URLs** সঠিকভাবে কাজ করে
- ✅ **API calls** secure হয়

## 📋 Step-by-Step Setup

### Step 1: Supabase Dashboard এ যান

1. **Supabase Dashboard খুলুন:** https://supabase.com/dashboard
2. **আপনার VidPilot project select করুন**
3. **Settings এ যান** (left sidebar এ)

### Step 2: Authentication Settings

1. **Settings → Authentication এ যান**
2. **"URL Configuration" section খুঁজুন**
3. **Site URL এবং Redirect URLs add করুন**

### Step 3: Site URL Add করুন

**Site URL field এ add করুন:**
```
https://vidpilot.netlify.app
```

### Step 4: Redirect URLs Add করুন

**Redirect URLs field এ add করুন (comma separated):**
```
https://vidpilot.netlify.app/auth/callback,
https://vidpilot.netlify.app/dashboard,
https://vidpilot.netlify.app/login,
https://vidpilot.netlify.app/register,
https://vidpilot.netlify.app/**
```

### Step 5: Additional Redirect URLs (Optional)

যদি আরো specific routes থাকে:
```
https://vidpilot.netlify.app/auth/confirm,
https://vidpilot.netlify.app/auth/reset-password,
https://vidpilot.netlify.app/dashboard/**
```

### Step 6: Save Settings

1. **"Save" button এ click করুন**
2. **Changes apply হতে 1-2 minutes সময় লাগতে পারে**

## 🔧 CORS Configuration

### Step 1: API Settings

1. **Settings → API এ যান**
2. **"CORS" section খুঁজুন**

### Step 2: Allowed Origins Add করুন

**Allowed Origins field এ add করুন:**
```
https://vidpilot.netlify.app
```

**অথবা wildcard ব্যবহার করুন (development এর জন্য):**
```
https://vidpilot.netlify.app,
http://localhost:5173,
http://localhost:3000
```

## 🎯 Complete Configuration

### Authentication URLs:
- **Site URL:** `https://vidpilot.netlify.app`
- **Redirect URLs:** 
  ```
  https://vidpilot.netlify.app/auth/callback
  https://vidpilot.netlify.app/dashboard
  https://vidpilot.netlify.app/**
  ```

### API CORS:
- **Allowed Origins:** `https://vidpilot.netlify.app`

## 🔍 Verification Steps

### Test Authentication:

1. **আপনার live site এ যান:** https://vidpilot.netlify.app
2. **"Sign Up" বা "Login" try করুন**
3. **Email verification check করুন**
4. **Dashboard access test করুন**

### Test API Calls:

1. **Caption Generator try করুন**
2. **Social Post Generator test করুন**
3. **Browser Console check করুন** (F12) - কোন CORS error থাকলে দেখাবে

## 🛠️ Troubleshooting

### যদি Authentication কাজ না করে:

1. **Supabase Settings double-check করুন**
2. **URL spelling সঠিক আছে কিনা verify করুন**
3. **Browser cache clear করুন**
4. **Incognito mode এ test করুন**

### যদি CORS Error আসে:

```
Access to fetch at 'https://your-project.supabase.co' from origin 'https://vidpilot.netlify.app' has been blocked by CORS policy
```

**Solution:**
- Supabase API Settings এ আপনার domain add করুন
- Allowed Origins এ `https://vidpilot.netlify.app` add করুন

### যদি Redirect Error আসে:

```
Invalid redirect URL
```

**Solution:**
- Authentication Settings এ সব possible redirect URLs add করুন
- Wildcard pattern ব্যবহার করুন: `https://vidpilot.netlify.app/**`

## 📱 Mobile & PWA Support

যদি PWA বা mobile app বানান:

### Additional URLs:
```
https://vidpilot.netlify.app/manifest.json
https://vidpilot.netlify.app/sw.js
capacitor://localhost
http://localhost
```

## 🔒 Security Best Practices

### Production Settings:
- ✅ **Exact URLs ব্যবহার করুন** (wildcard avoid করুন production এ)
- ✅ **HTTPS only** enable করুন
- ✅ **Email confirmation** enable রাখুন
- ✅ **Rate limiting** enable করুন

### Development Settings:
```
Site URL: http://localhost:5173
Redirect URLs: 
http://localhost:5173/**,
https://vidpilot.netlify.app/**
```

## ✅ Final Checklist

- [ ] Site URL: `https://vidpilot.netlify.app` ✅
- [ ] Redirect URLs: Added all necessary routes ✅
- [ ] CORS Origins: Domain added ✅
- [ ] Settings Saved ✅
- [ ] Authentication Tested ✅
- [ ] API Calls Working ✅

---

## 🚀 Quick Setup Commands

### Supabase Dashboard URLs:
- **Main Dashboard:** https://supabase.com/dashboard
- **Authentication Settings:** https://supabase.com/dashboard/project/YOUR_PROJECT/auth/settings
- **API Settings:** https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api

### URLs to Add:
```
Site URL: https://vidpilot.netlify.app
Redirect URLs: https://vidpilot.netlify.app/**
CORS Origins: https://vidpilot.netlify.app
```

**এই setup complete করার পর আপনার VidPilot production এ fully functional হবে! 🎯**