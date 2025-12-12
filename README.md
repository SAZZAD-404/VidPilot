# 🚀 **VidPilot – AI-Powered Viral Content Creation Platform**  
**Professional • Fast • 100% Free Core Features**  

The ultimate all-in-one AI toolbox to create viral social media posts, YouTube scripts, captivating stories, and studio-quality voice-overs in seconds.

[![License: MIT](https://img.shields.io/badge/License-MIT-brightgreen.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://reactjs.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-Enabled-success?logo=supabase)](https://supabase.com)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://vercel.com)

Live Demo → https://vidpilot.vercel.app (replace with your actual link)

## ✨ **Core Features**

### 🎯 AI Caption Generator
- Supports Instagram, TikTok, LinkedIn, Twitter/X, YouTube  
- 5 tones: Casual • Professional • Funny • Emotional • Minimal  
- Smart trending & relevant hashtags  
- English + Bengali (বাংলা support  
- Instant 10-variation batch generation  
- Export as CSV or copy to clipboard  

### 📱 AI Social Media Post Generator
- 5 platforms + 7 tone styles + 3 length options  
- Platform-optimized hashtags & CTA buttons  
- Ready-to-post in one click  

### 📖 AI YouTube Story & Script Generator
- 6 genres × 6 durations (1 min → 120+ min epics)  
- 8 professional tones  
- 6 languages (English, Bengali, Hindi, Spanish, French, German)  
- Full SEO package: Title • Description • Tags • Keywords • Hashtags  
- Ready templates: Podcast, Documentary, Commercial, Audiobook, etc.  

### 🎤 Professional AI Voice-Over Generator
- Multiple TTS engines: OpenAI TTS • Murf.ai • Free Browser TTS  
- 6 voice types × 8 tones × 5 speeds × 5 quality tiers  
- Pitch, volume, emphasis & audio post-processing controls  
- Export: MP3 • WAV • OGG • FLAC • M4A  

## 🛠 Tech Stack (Fully Free Tier Friendly)

| Layer         | Technology                              |
|---------------|------------------------------------------|
| Frontend      | React  React 18 + TypeScript + Vite                |
| Styling       |  Tailwind CSS + shadcn/ui + Framer Motion     |
| Backend       |  Supabase (Auth + PostgreSQL + Storage + Edge Functions) |
| AI            |  Rule-based (caption) + Optional Hugging Face / OpenAI TTS |
| Deployment    |  Vercel (free tier + cron jobs)                |
| Video Processing | FFmpeg.wasm / Supabase Edge Functions         |

## 🚀 Quick Start (Local Development)

```bash
git clone https://github.com/yourusername/vidpilot.git
cd vidpilot
npm install
cp .env.example .env

# Fill VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY
npm run dev
```

Open http://localhost:5173

## 📦 Deployment (One-Click)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/vidpilot)

Just connect your GitHub repo → Vercel auto-detects everything.

## 📋 Project Structure

```
vidpilot/
├── src/
│   ├── components/        # Dashboard, UI, VideoEditor
│   ├── hooks/             # useAuth, useVideos, useSchedules
│   ├── lib/               # AI, ffmpeg, social posting utilities
│   ├── pages/             # Dashboard & landing pages
│   └── integrations/supabase/
├── supabase/
│   ├── migrations/        # SQL schema
│   └── functions/         Edge Functions (video processing, cron)
├── public/templates/      Stock video templates
└── vercel.json            Cron jobs for auto-posting
```

## 🔐 Database Schema (Supabase)

- `users` – profiles & subscription  
- `videos` – generated & processed videos  
- `social_accounts` – connected platforms (OAuth tokens)  
- `schedules` – scheduled posts  
- `analytics` – performance tracking  

## 🎨 Ready-to-Use Video Templates

Drop your stock videos in `public/templates/`:
- `template1.mp4` – Motivational
- `template2.mp4` – Tutorial / How-to
- `template3.mp4` – Storytelling
- `template4.mp4` – News / Announcement

Free sources: [Pexels](https://pexels.com/videos) • [Pixabay](https://pixabay.com/videos)

## 🤝 Contributing

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/amazing`)
3. Commit (`git commit -m 'Add amazing feature'`)
4. Push & open a Pull Request

## 📄 License

MIT License – free for personal and commercial use.

## 💬 Support & Community

- Open an issue for bugs or feature requests  
- Join our Discord (link coming soon)  
- Star ⭐ the repo if you like it!

---

**Built with ❤️ using only free-tier tools – Supabase, Vercel, Tailwind, and a lot of coffee.**

Made by **YourName • 2025  
Turn ideas into viral content – faster than ever before.  

**VidPilot – Create. Schedule. Go Viral.** 🚀
