// AI Caption Generator Adapter (Rule-based - FREE)
// Supports multiple platforms, tones, and languages

export type Platform = 'instagram' | 'tiktok' | 'linkedin' | 'twitter' | 'youtube';
export type Tone = 'casual' | 'professional' | 'funny' | 'emotional' | 'minimal';
export type Language = 'english' | 'bengali';

export interface CaptionOptions {
  platform: Platform;
  tone: Tone;
  language: Language;
  length: 'short' | 'medium' | 'long';
  includeHashtags: boolean;
  includeCTA: boolean;
}

export interface CaptionResult {
  text: string;
  hashtags: string[];
  cta: string;
  characterCount: number;
  readabilityScore: number;
}

// Trending hashtags by platform
const hashtagsByPlatform: Record<Platform, string[]> = {
  instagram: ['instagood', 'photooftheday', 'love', 'beautiful', 'happy', 'fashion', 'style', 'instadaily', 'reels', 'viral'],
  tiktok: ['fyp', 'foryou', 'viral', 'trending', 'foryoupage', 'tiktok', 'duet', 'challenge', 'funny', 'dance'],
  linkedin: ['leadership', 'business', 'career', 'professional', 'networking', 'innovation', 'growth', 'success', 'motivation', 'entrepreneur'],
  twitter: ['trending', 'viral', 'news', 'breaking', 'thread', 'opinion', 'discussion', 'community', 'tech', 'update'],
  youtube: ['subscribe', 'youtube', 'video', 'tutorial', 'howto', 'vlog', 'entertainment', 'trending', 'viral', 'shorts'],
};

// Caption templates by tone
const captionTemplates = {
  casual: {
    short: [
      "Just {subject}! 😊",
      "Loving this {subject} vibe ✨",
      "Can't get enough of {subject} 💯",
      "{subject} hits different 🔥",
      "This {subject} though! 👀",
    ],
    medium: [
      "So I tried {subject} today and honestly? Game changer! 🙌 Who else is obsessed?",
      "Real talk: {subject} is everything right now. Drop a ❤️ if you agree!",
      "Just discovered {subject} and I'm already hooked! Anyone else? 👇",
      "Can we talk about {subject} for a sec? Because WOW. 🤩",
      "Okay but {subject} is actually amazing. Tell me I'm not alone! 💬",
    ],
    long: [
      "Let me tell you about {subject}... I wasn't expecting much, but this completely changed my perspective! 🌟 The way it makes you feel is just incredible. Have you tried it yet? Drop your thoughts below! 👇",
      "Story time! So I finally got around to {subject} and honestly, I wish I'd done it sooner. 💫 The experience was beyond what I imagined. If you're on the fence about it, this is your sign! ✨",
      "Can we just appreciate {subject} for a moment? 🙏 There's something special about it that just hits different. Whether you're new to this or a pro, I'd love to hear your experience! Comment below! 💬",
    ],
  },
  professional: {
    short: [
      "Exploring {subject} today.",
      "Key insights on {subject}.",
      "{subject}: A professional perspective.",
      "Understanding {subject} better.",
      "Deep dive into {subject}.",
    ],
    medium: [
      "Today's focus: {subject}. Here are three key takeaways that can transform your approach.",
      "Sharing insights on {subject} that have proven valuable in my professional journey.",
      "Let's discuss {subject} and its impact on modern business practices.",
      "Professional perspective on {subject}: What you need to know in 2024.",
      "Breaking down {subject} with actionable strategies you can implement today.",
    ],
    long: [
      "In today's rapidly evolving landscape, {subject} has emerged as a critical factor for success. Through extensive research and practical application, I've identified key strategies that can help professionals navigate this space effectively. Here's what you need to know...",
      "After years of working with {subject}, I've learned that success comes down to three fundamental principles. Let me share these insights with you and how they can transform your professional approach.",
      "The conversation around {subject} continues to evolve. As professionals, it's crucial we stay informed and adapt our strategies accordingly. Here's my analysis of current trends and future implications.",
    ],
  },
  funny: {
    short: [
      "Me trying {subject} 😂",
      "{subject} be like... 🤣",
      "POV: You discover {subject}",
      "Nobody: ... Me: {subject}! 😅",
      "When {subject} hits different 💀",
    ],
    medium: [
      "So apparently {subject} is a thing now? 😂 My life was perfectly fine without knowing this existed, but here we are! 🤷‍♂️",
      "Me: I don't need {subject}. Also me: *immediately tries {subject}* 😅 Why am I like this?",
      "Plot twist: {subject} was the answer all along! 🤯 Who knew? (Definitely not me lol)",
      "Expectation: Normal day. Reality: Discovering {subject} and questioning everything 😂",
      "Breaking news: Local person discovers {subject}, immediately becomes obsessed. More at 11. 📰😅",
    ],
    long: [
      "Okay so funny story... I thought {subject} was just a myth, like a reasonable sleep schedule or empty inboxes. 😂 But then I actually tried it and now I can't stop! Send help! (Or don't, I'm fine here) 🤣 Anyone else fall down this rabbit hole?",
      "Listen, I'm not saying {subject} changed my life, but I'm also not NOT saying that. 😅 One minute I'm living my best life, next minute I'm here telling strangers on the internet about {subject}. This is fine. Everything is fine. 🔥😂",
      "Can we talk about how {subject} went from 'never heard of it' to 'my entire personality' in like 2 seconds? 💀 No? Just me? Cool cool cool. Anyway, here's why you should also make questionable life choices! 😂👇",
    ],
  },
  emotional: {
    short: [
      "{subject} touched my heart 💙",
      "Grateful for {subject} 🙏",
      "{subject} means everything ❤️",
      "This {subject} moment 🥺",
      "Feeling blessed by {subject} ✨",
    ],
    medium: [
      "Sometimes {subject} reminds us what truly matters in life. Feeling incredibly grateful today. 💙",
      "There's something deeply moving about {subject}. It's moments like these that restore faith. 🙏",
      "In a world that moves so fast, {subject} made me pause and appreciate the beauty around us. ❤️",
      "{subject} has taught me more about life than I ever expected. Sharing this with a grateful heart. 🌟",
      "Today, {subject} reminded me why we keep going, why we keep believing. Thank you for this. 💫",
    ],
    long: [
      "I never thought {subject} would impact me this deeply, but here we are. 💙 Life has a way of surprising us with moments that touch our souls. This is one of those moments. To anyone going through something similar, know that you're not alone. We're all in this together, finding beauty in unexpected places. 🙏✨",
      "There are moments in life that change us forever. For me, {subject} was one of those moments. 🌟 It reminded me of what's truly important, of the connections we share, and the love that surrounds us. I'm sharing this because maybe, just maybe, it will touch your heart the way it touched mine. ❤️",
      "Sometimes we need to be reminded that {subject} exists in this world. 💫 In times of darkness, it's these moments of light that keep us going. I'm overwhelmed with gratitude and wanted to share this feeling with all of you. May you find your own moments of peace and joy. 🙏💙",
    ],
  },
  minimal: {
    short: [
      "{subject}.",
      "{subject} ✨",
      "Simply {subject}.",
      "{subject} 🤍",
      "Just {subject}.",
    ],
    medium: [
      "{subject}. Nothing more, nothing less.",
      "Today: {subject}. That's it.",
      "{subject}. Simple as that.",
      "All about {subject} today.",
      "{subject}. Pure and simple.",
    ],
    long: [
      "{subject}. Sometimes the simplest things carry the most meaning. No need for elaborate explanations or lengthy descriptions. Just this.",
      "In a world of noise, {subject} speaks volumes through its simplicity. Clean. Clear. Meaningful.",
      "{subject}. That's the post. Sometimes less is more, and this is one of those times.",
    ],
  },
};

// CTA templates by platform
const ctaTemplates: Record<Platform, string[]> = {
  instagram: [
    "Double tap if you agree! ❤️",
    "Save this for later! 📌",
    "Share with someone who needs this! 👇",
    "Follow for more! ✨",
    "Tag a friend! 👥",
  ],
  tiktok: [
    "Follow for Part 2! 👀",
    "Duet this! 🎵",
    "Stitch if you agree! ✂️",
    "Drop a ❤️ if you relate!",
    "Comment your thoughts! 💬",
  ],
  linkedin: [
    "What are your thoughts? Share in comments.",
    "Connect with me for more insights.",
    "Repost if you found this valuable.",
    "Follow for professional content.",
    "Let's discuss in the comments.",
  ],
  twitter: [
    "RT if you agree!",
    "Reply with your take!",
    "Follow for more threads!",
    "Quote tweet your thoughts!",
    "Join the conversation! 💬",
  ],
  youtube: [
    "Subscribe for more!",
    "Like and comment below!",
    "Hit the bell icon! 🔔",
    "Share with friends!",
    "Watch till the end!",
  ],
};

// Generate captions based on input
export function generateCaptions(
  subject: string,
  options: CaptionOptions,
  count: number = 10
): CaptionResult[] {
  const captions: CaptionResult[] = [];
  const { platform, tone, language, length, includeHashtags, includeCTA } = options;

  // Get templates for the tone
  const templates = captionTemplates[tone][length];
  
  // Generate multiple variations
  for (let i = 0; i < count; i++) {
    const template = templates[i % templates.length];
    let captionText = template.replace(/{subject}/g, subject);

    // Add Bengali translation if needed
    if (language === 'bengali') {
      captionText = translateToBengali(captionText, subject);
    }

    // Add CTA
    let cta = '';
    if (includeCTA) {
      const ctas = ctaTemplates[platform];
      cta = ctas[i % ctas.length];
      captionText += `\n\n${cta}`;
    }

    // Generate hashtags
    const hashtags: string[] = [];
    if (includeHashtags) {
      const platformHashtags = hashtagsByPlatform[platform];
      const subjectWords = subject.toLowerCase().split(' ');
      
      // Add subject-related hashtags
      subjectWords.forEach(word => {
        if (word.length > 3) {
          hashtags.push(word.replace(/[^a-z0-9]/g, ''));
        }
      });
      
      // Add platform-specific hashtags
      const randomHashtags = platformHashtags
        .sort(() => Math.random() - 0.5)
        .slice(0, 8 - hashtags.length);
      
      hashtags.push(...randomHashtags);
    }

    // Calculate readability score (simple formula)
    const words = captionText.split(' ').length;
    const sentences = captionText.split(/[.!?]+/).length;
    const readabilityScore = Math.min(100, Math.max(0, 100 - (words / sentences) * 5));

    captions.push({
      text: captionText,
      hashtags: hashtags.slice(0, 10),
      cta,
      characterCount: captionText.length,
      readabilityScore: Math.round(readabilityScore),
    });
  }

  return captions;
}

// Simple Bengali translation (basic mapping)
function translateToBengali(text: string, subject: string): string {
  // This is a simplified version - in production, use proper translation API
  const bengaliMap: Record<string, string> = {
    'Just': 'শুধু',
    'Loving': 'ভালোবাসছি',
    'this': 'এই',
    'vibe': 'অনুভূতি',
    'Can\'t get enough': 'যথেষ্ট পাচ্ছি না',
    'of': 'এর',
    'hits different': 'আলাদা লাগছে',
    'though': 'যদিও',
    'Today': 'আজ',
    'Exploring': 'অন্বেষণ করছি',
    'Key insights': 'মূল অন্তর্দৃষ্টি',
    'on': 'সম্পর্কে',
  };

  let translated = text;
  Object.entries(bengaliMap).forEach(([eng, ben]) => {
    translated = translated.replace(new RegExp(eng, 'gi'), ben);
  });

  return translated;
}

// Extract subject from image using AI Vision
export async function extractSubjectFromImage(imageUrl: string): Promise<string> {
  try {
    // Try Gemini Vision API first
    const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (geminiApiKey) {
      return await analyzeImageWithGemini(imageUrl, geminiApiKey);
    }

    // Fallback to Groq Vision (if available)
    const groqApiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (groqApiKey) {
      return await analyzeImageWithGroq(imageUrl, groqApiKey);
    }

    // Smart fallback - analyze filename and return intelligent guess
    return analyzeImageFallback(imageUrl);
  } catch (error) {
    console.error('Image analysis error:', error);
    return analyzeImageFallback(imageUrl);
  }
}

// Extract subject from video URL using AI
export async function extractSubjectFromVideo(videoUrl: string): Promise<string> {
  try {
    // Try to extract video metadata and analyze
    const videoInfo = await analyzeVideoUrl(videoUrl);
    
    // Use AI to analyze video title/description if available
    const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (geminiApiKey && videoInfo.title) {
      return await analyzeVideoContentWithAI(videoInfo, geminiApiKey);
    }

    // Fallback to URL-based analysis
    return analyzeVideoFallback(videoUrl, videoInfo);
  } catch (error) {
    console.error('Video analysis error:', error);
    return analyzeVideoFallback(videoUrl);
  }
}

// Gemini Vision API integration
async function analyzeImageWithGemini(imageUrl: string, apiKey: string): Promise<string> {
  try {
    // Convert image to base64 if it's a blob URL
    let imageData: string;
    if (imageUrl.startsWith('blob:')) {
      imageData = await convertBlobToBase64(imageUrl);
    } else {
      // For regular URLs, we'd need to fetch and convert
      throw new Error('External URLs not supported in this demo');
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              text: "Analyze this image and describe what you see in 2-4 words that would be perfect for a social media caption. Focus on the main subject, activity, or mood. Examples: 'morning coffee ritual', 'sunset beach walk', 'cozy reading time', 'workout session', 'delicious homemade pasta'. Be specific and engaging."
            },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: imageData.split(',')[1] // Remove data:image/jpeg;base64, prefix
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 20,
          topP: 0.8,
          maxOutputTokens: 50,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const description = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    
    if (description) {
      console.log('✅ Gemini Vision analysis:', description);
      return description.toLowerCase().replace(/['"]/g, '');
    }
    
    throw new Error('No description returned from Gemini');
  } catch (error) {
    console.error('Gemini Vision error:', error);
    throw error;
  }
}

// Groq Vision API integration (if they support vision)
async function analyzeImageWithGroq(imageUrl: string, apiKey: string): Promise<string> {
  // Note: Groq may not have vision capabilities yet, this is for future compatibility
  try {
    // For now, return a smart fallback
    throw new Error('Groq Vision not yet implemented');
  } catch (error) {
    throw error;
  }
}

// Convert blob URL to base64
async function convertBlobToBase64(blobUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    fetch(blobUrl)
      .then(response => response.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      })
      .catch(reject);
  });
}

// Smart image analysis fallback
function analyzeImageFallback(imageUrl: string): string {
  // Extract filename and make intelligent guesses
  const filename = imageUrl.split('/').pop()?.toLowerCase() || '';
  
  // Common image patterns
  if (filename.includes('food') || filename.includes('meal') || filename.includes('cook')) {
    return 'delicious homemade meal';
  }
  if (filename.includes('selfie') || filename.includes('portrait')) {
    return 'perfect moment captured';
  }
  if (filename.includes('nature') || filename.includes('landscape')) {
    return 'beautiful nature scene';
  }
  if (filename.includes('workout') || filename.includes('gym') || filename.includes('fitness')) {
    return 'intense workout session';
  }
  if (filename.includes('travel') || filename.includes('vacation')) {
    return 'amazing travel adventure';
  }
  if (filename.includes('pet') || filename.includes('dog') || filename.includes('cat')) {
    return 'adorable pet moment';
  }
  if (filename.includes('sunset') || filename.includes('sunrise')) {
    return 'breathtaking sunset view';
  }
  if (filename.includes('coffee') || filename.includes('cafe')) {
    return 'perfect coffee moment';
  }
  
  // Time-based intelligent guesses
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 10) {
    return 'beautiful morning moment';
  } else if (hour >= 10 && hour < 14) {
    return 'perfect midday capture';
  } else if (hour >= 14 && hour < 18) {
    return 'lovely afternoon scene';
  } else if (hour >= 18 && hour < 22) {
    return 'gorgeous evening vibes';
  } else {
    return 'peaceful nighttime moment';
  }
}

// Video URL analysis
async function analyzeVideoUrl(videoUrl: string): Promise<{title?: string, platform: string, id?: string}> {
  const url = videoUrl.toLowerCase();
  
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    const videoId = extractYouTubeId(videoUrl);
    return {
      platform: 'youtube',
      id: videoId,
      title: await getYouTubeTitle(videoId) // This would need YouTube API
    };
  }
  
  if (url.includes('tiktok.com')) {
    return {
      platform: 'tiktok',
      title: 'TikTok video'
    };
  }
  
  if (url.includes('instagram.com')) {
    return {
      platform: 'instagram',
      title: 'Instagram reel'
    };
  }
  
  return {
    platform: 'unknown',
    title: 'video content'
  };
}

// Extract YouTube video ID
function extractYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

// Get YouTube video title (would need API key)
async function getYouTubeTitle(videoId: string | null): Promise<string | undefined> {
  // In production, use YouTube Data API
  // For now, return undefined to use fallback
  return undefined;
}

// AI analysis of video content
async function analyzeVideoContentWithAI(videoInfo: any, apiKey: string): Promise<string> {
  try {
    const prompt = `Analyze this video title and create a 2-4 word description perfect for social media captions: "${videoInfo.title}". Focus on the main topic, activity, or mood. Examples: 'cooking tutorial', 'dance challenge', 'travel vlog', 'workout routine', 'comedy skit'. Be specific and engaging.`;
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 30,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const description = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    
    if (description) {
      return description.toLowerCase().replace(/['"]/g, '');
    }
    
    throw new Error('No description returned');
  } catch (error) {
    console.error('Video AI analysis error:', error);
    throw error;
  }
}

// Video analysis fallback
function analyzeVideoFallback(videoUrl: string, videoInfo?: any): string {
  const url = videoUrl.toLowerCase();
  
  if (url.includes('youtube')) {
    if (url.includes('shorts')) {
      return 'YouTube Shorts video';
    }
    return 'YouTube video content';
  }
  
  if (url.includes('tiktok')) {
    return 'viral TikTok content';
  }
  
  if (url.includes('instagram')) {
    if (url.includes('reel')) {
      return 'Instagram Reel';
    }
    return 'Instagram video';
  }
  
  if (url.includes('facebook')) {
    return 'Facebook video';
  }
  
  // Generic video types based on URL patterns
  if (url.includes('tutorial') || url.includes('howto')) {
    return 'helpful tutorial video';
  }
  
  if (url.includes('funny') || url.includes('comedy')) {
    return 'hilarious comedy content';
  }
  
  if (url.includes('music') || url.includes('song')) {
    return 'amazing music video';
  }
  
  if (url.includes('workout') || url.includes('fitness')) {
    return 'fitness workout video';
  }
  
  if (url.includes('cooking') || url.includes('recipe')) {
    return 'cooking recipe video';
  }
  
  return 'engaging video content';
}
