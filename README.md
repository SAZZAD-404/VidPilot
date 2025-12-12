# 🚀 VidPilot - AI Content Creation Platform

Professional AI-powered platform for creating viral social media content, YouTube stories, and high-quality voice-overs. Generate captions, posts, stories, and professional voice-overs in seconds.

## 🚀 Core Features

### 🎯 AI Caption Generator
- **Multi-Platform Support** - Instagram, TikTok, LinkedIn, Twitter, YouTube
- **5 Tone Options** - Casual, Professional, Funny, Emotional, Minimal
- **Smart Hashtags** - Auto-generate trending, relevant hashtags
- **Language Support** - English & Bengali (বাংলা)
- **Batch Generation** - Get 10 caption variations instantly
- **Export Ready** - Copy or download as CSV

### 📱 AI Social Media Post Generator
- **5 Platforms** - Facebook, Instagram, LinkedIn, Twitter/X, YouTube
- **7 Tone Styles** - Funny, Professional, Emotional, Trendy, Minimal, Storytelling, Marketing
- **3 Post Lengths** - Short, Medium, Long (platform-optimized)
- **Smart Hashtags** - Platform-specific trending hashtags
- **CTA Options** - Include call-to-action buttons

### 📖 AI YouTube Story Generator
- **6 Genres** - Educational, Entertainment, Lifestyle, Tech, Business, Gaming
- **6 Durations** - Short (1-3min), Medium (5-10min), Long (15-20min), Extended (30-45min), Documentary (60+min), Epic (120+min)
- **8 Tone Styles** - Professional, Casual, Funny, Dramatic, Inspiring, Energetic, Calm, Authoritative
- **Multi-Language** - English, Bengali, Hindi, Spanish, French, German
- **SEO Optimized** - Titles, descriptions, tags, hashtags, keywords
- **Professional Templates** - Podcast, Commercial, Documentary, Audiobook, Presentation, YouTube

### 🎤 AI Voice-Over Generator
- **Multiple TTS Providers** - OpenAI TTS Official, Murf.ai Professional, Browser TTS (Free)
- **6 Voice Types** - Male, Female, Neutral, Child, Elderly, Robotic
- **8 Tone Variations** - Professional, Casual, Energetic, Calm, Dramatic, Friendly, Authoritative, Emotional
- **5 Speed Options** - Very Slow, Slow, Normal, Fast, Very Fast
- **5 Quality Levels** - Standard (Free), High, Premium, Studio, Broadcast
- **Professional Features** - Pitch control, volume adjustment, emphasis levels, audio processing
- **Multi-Language** - English, Bengali, Hindi, Spanish, French, German
- **Export Formats** - MP3, WAV, OGG, FLAC, M4A

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui + Framer Motion
- **Backend**: Supabase (Database + Auth)
- **AI**: Rule-based caption generation (100% free, no API keys)
- **Deployment**: Vercel (free tier)

## 📋 Prerequisites

- Node.js 18+ installed
- Supabase account (free tier works)
- Vercel account (for deployment)
- Social media developer accounts (for API access)

## 🔧 Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd vidpilot
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Go to [Supabase](https://supabase.com) and create a new project

2. In Supabase Dashboard → SQL Editor, run the migration files:
   
   **For NEW database:**
   - Copy and paste contents of `supabase/migrations/20250101000000_initial_schema.sql`
   - Click "Run"
   - Then copy and paste contents of `supabase/migrations/20250102000000_add_caption_tables.sql`
   - Click "Run"
   
   **For EXISTING database (already has users/videos tables):**
   - Copy and paste contents of `supabase/migrations/20250102000000_add_caption_tables.sql`
   - Click "Run"

3. Create Storage Bucket:
   - Go to Storage → Create Bucket
   - Name: `videos`
   - Make it public (or set up proper RLS policies)

4. Get your Supabase credentials:
   - Go to Settings → API
   - Copy `Project URL` and `anon public` key

### 4. Configure Environment Variables

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Fill in your values:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_HUGGINGFACE_API_KEY=your_huggingface_api_key (optional)
```

### 5. Set Up Social Media APIs (Optional)

#### Facebook/Instagram
1. Go to [Facebook Developers](https://developers.facebook.com)
2. Create an app → Add Facebook Login & Instagram Basic Display
3. Get App ID and App Secret

#### YouTube
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create project → Enable YouTube Data API v3
3. Create OAuth 2.0 credentials

#### TikTok
1. Go to [TikTok Developers](https://developers.tiktok.com)
2. Create an app → Get Client Key and Client Secret

#### LinkedIn
1. Go to [LinkedIn Developers](https://www.linkedin.com/developers)
2. Create an app → Get Client ID and Client Secret

### 6. Set Up Supabase Edge Functions (Optional)

For video processing and cron jobs:

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Login to Supabase:
```bash
supabase login
```

3. Link your project:
```bash
supabase link --project-ref your-project-ref
```

4. Deploy functions:
```bash
supabase functions deploy process-video
supabase functions deploy run-cron
```

### 7. Set Up Vercel Cron (For Auto-Posting)

1. Deploy to Vercel:
```bash
npm install -g vercel
vercel
```

2. Add Cron Job in `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron",
    "schedule": "0 * * * *"
  }]
}
```

3. Set environment variable in Vercel:
   - `CRON_SECRET` - Random secret for cron authentication

## 🎯 Caption Generator Usage

### Quick Start
1. Go to Dashboard → Caption Generator
2. Choose input type: Text, Image, or Video URL
3. Select platform (Instagram/TikTok/LinkedIn/Twitter/YouTube)
4. Choose tone (Casual/Professional/Funny/Emotional/Minimal)
5. Select language (English/Bengali)
6. Click "Generate Captions"
7. Get 10 caption variations with hashtags
8. Copy, save, or export to CSV

### Features
- **Rule-based AI** - 100% free, no API keys needed
- **Platform-specific** - Optimized captions for each social media
- **Hashtag suggestions** - Trending and relevant hashtags
- **CTA included** - Call-to-action for better engagement
- **Usage tracking** - Monitor your monthly quota
- **Export options** - Copy to clipboard or download CSV

## 🎬 Video Templates

Add video templates to `public/templates/`:
- `template1.mp4` - Motivational template
- `template2.mp4` - Tutorial template
- `template3.mp4` - Story template
- `template4.mp4` - News template

You can use free stock videos from:
- [Pexels Videos](https://www.pexels.com/videos/)
- [Pixabay Videos](https://pixabay.com/videos/)

## 🚀 Running the Application

### Development

```bash
npm run dev
```

Visit `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
vidpilot2/
├── src/
│   ├── components/          # React components
│   │   ├── dashboard/      # Dashboard components
│   │   ├── ui/             # shadcn/ui components
│   │   └── VideoEditor.tsx # Video editing component
│   ├── hooks/              # Custom React hooks
│   │   ├── useAuth.tsx
│   │   ├── useVideos.tsx
│   │   ├── useSchedules.tsx
│   │   └── useSocialAccounts.tsx
│   ├── lib/                # Utility functions
│   │   ├── huggingface.ts  # AI script generation
│   │   ├── ffmpeg.ts       # Video processing
│   │   ├── socialPoster.ts # Social media posting
│   │   ├── cron.ts         # Cron job utilities
│   │   └── videoProcessing.ts
│   ├── pages/              # Page components
│   │   ├── dashboard/      # Dashboard pages
│   │   └── Index.tsx       # Landing page
│   └── integrations/      # External integrations
│       └── supabase/       # Supabase client
├── supabase/
│   ├── functions/          # Edge Functions
│   └── migrations/         # Database migrations
├── public/
│   └── templates/          # Video templates
└── package.json
```

## 🔐 Database Schema

- **users** - User profiles
- **videos** - Generated videos
- **social_accounts** - Connected social media accounts
- **schedules** - Scheduled posts
- **analytics** - Post performance data

## 🎯 Usage Guide

### 1. Create Account
- Sign up at `/register`
- Verify email (if required)

### 2. Generate Video
1. Go to Dashboard → Video Generator
2. Enter video title and description
3. Click "Generate Script"
4. Select template
5. Click "Save Video"

### 3. Connect Social Accounts
1. Go to Dashboard → Connections
2. Click "Connect" on desired platform
3. Enter access token (or use OAuth flow)
4. Save

### 4. Schedule Post
1. Go to Dashboard → Scheduler
2. Select video and platform
3. Choose date & time
4. Click "Create Schedule"

### 5. View Analytics
- Go to Dashboard → Analytics
- See views, likes, shares across platforms

## 🐛 Troubleshooting

### Video Processing Not Working
- Ensure Supabase Edge Functions are deployed
- Check FFmpeg service is running (if using external service)
- Verify video file format (MP4 recommended)

### Social Media Posting Failing
- Check access tokens are valid
- Verify API permissions are granted
- Ensure tokens haven't expired

### Cron Job Not Running
- Verify Vercel Cron is set up correctly
- Check `CRON_SECRET` matches
- Review Edge Function logs in Supabase

## 📝 Environment Variables

See `.env.example` for all required variables.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Submit pull request

## 📄 License

MIT License - feel free to use for personal or commercial projects.

## 🆘 Support

For issues or questions:
- Open an issue on GitHub
- Check documentation
- Review Supabase/Vercel logs

## 🎉 Next Steps

1. ✅ Set up Supabase database
2. ✅ Configure environment variables
3. ✅ Connect social media accounts
4. ✅ Generate first video
5. ✅ Schedule first post
6. ✅ Deploy to production

---

**Built with ❤️ using free tools and services**
#   V i d P i l o t 
 
 #   V i d P i l o t 
 
 

---

## 🌟 Key Highlights

- ✅ **100% Free Core Features** - Works without any API keys
- ✅ **Multiple AI Services** - Z.ai, Groq, Gemini, HuggingFace integration
- ✅ **Image & Video Analysis** - AI Vision capabilities with Gemini
- ✅ **Export Everything** - CSV, JSON, TXT, PDF export options
- ✅ **Activity History** - Track all your generations and exports
- ✅ **Credit System** - Fair usage with Stripe payment integration
- ✅ **Mobile Responsive** - Works perfectly on all devices
- ✅ **Real-time Updates** - Live notifications and progress tracking

## 🎯 Live Demo

- **Demo Mode:** Try without signup at `/login` → "Try Demo Mode"
- **Full Features:** Sign up for free account

## 🤖 AI Services Supported

1. **Z.ai Advanced** - Premium conversational AI (Best quality)
2. **Groq Llama 3.3** - Free & unlimited (Fastest)
3. **Google Gemini** - Vision capabilities (Image analysis)
4. **HuggingFace Mistral** - Open source (Reliable)
5. **Smart Fallback** - Always works (No API needed)

## 📞 Contact

- **GitHub:** [@SAZZAD-404](https://github.com/SAZZAD-404)
- **Repository:** [VidPilot](https://github.com/SAZZAD-404/VidPilot)

**Built with ❤️ by SAZZAD-404**