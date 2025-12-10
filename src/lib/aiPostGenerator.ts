// Real AI-Powered Social Post Generator using HuggingFace
// Hybrid approach: Falls back to rule-based if API fails

import { generateSocialPosts, type PostOptions, type PostVariation } from './socialPostAdapter';

// AI Model URLs
const ZAI_API_URL = 'https://api.z.ai/v1/chat/completions';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

interface AIPostOptions extends PostOptions {
  useAI?: boolean;
}

// Generate AI-powered social posts
export async function generateAIPosts(options: AIPostOptions): Promise<PostVariation[]> {
  const { platform, topic, brand, audience, tone, length, includeCTA, useAI = true } = options;

  // Check which AI model to use
  const zaiApiKey = import.meta.env.VITE_ZAI_API_KEY;
  const groqApiKey = import.meta.env.VITE_GROQ_API_KEY;
  const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const hfApiKey = import.meta.env.VITE_HUGGINGFACE_API_KEY;
  
  // If AI is disabled or no API keys, throw error
  if (!useAI || (!zaiApiKey && !groqApiKey && !geminiApiKey && !hfApiKey)) {
    throw new Error('AI is not configured. Please add VITE_ZAI_API_KEY, VITE_GROQ_API_KEY, or VITE_GEMINI_API_KEY to .env file');
  }

  try {
    // Build AI prompt
    const prompt = buildAIPrompt(options);
    
    let aiText = '';
    
    // Try Z.ai first (Advanced Conversational AI)
    if (zaiApiKey) {
      console.log('Using Z.ai Advanced Conversational AI');
      try {
        const response = await fetch(ZAI_API_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${zaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'z-ai-advanced',
            messages: [{
              role: 'user',
              content: prompt
            }],
            temperature: 0.8,
            max_tokens: 3000,
            top_p: 0.9,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Z.ai API error:', errorData);
          throw new Error(`Z.ai API error: ${response.status}`);
        }

        const data = await response.json();
        console.log('Z.ai API response received');
        
        if (data.choices && data.choices[0] && data.choices[0].message) {
          aiText = data.choices[0].message.content || '';
        }
        
        if (!aiText) {
          throw new Error('Z.ai returned empty response');
        }
      } catch (zaiError) {
        console.error('Z.ai failed, trying fallback:', zaiError);
        // Continue to fallback options
      }
    }
    
    // Fallback to Groq if Z.ai failed or not available
    if (!aiText && groqApiKey) {
      console.log('Using Groq AI (Llama 3.3 70B)');
      try {
        const response = await fetch(GROQ_API_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${groqApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [{
              role: 'user',
              content: prompt
            }],
            temperature: 0.8,
            max_tokens: 3000,
            top_p: 0.9,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Groq API error:', errorData);
          throw new Error(`Groq API error: ${response.status}`);
        }

        const data = await response.json();
        console.log('Groq API response received');
        
        if (data.choices && data.choices[0] && data.choices[0].message) {
          aiText = data.choices[0].message.content || '';
        }
        
        if (!aiText) {
          throw new Error('Groq returned empty response');
        }
      } catch (groqError) {
        console.error('Groq failed, trying fallback:', groqError);
        // Continue to fallback options
      }
    }
    
    // Fallback to Gemini if Groq failed or not available
    if (!aiText && geminiApiKey) {
      console.log('Using Google Gemini Flash 2.0');
      const response = await fetch(`${GEMINI_API_URL}?key=${geminiApiKey}`, {
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
            temperature: 0.8,
            topK: 20,
            topP: 0.9,
            maxOutputTokens: 2048,
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } 
    // Fallback to HuggingFace
    else if (hfApiKey) {
      console.log('Using HuggingFace Mistral-7B');
      const response = await fetch(HUGGINGFACE_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${hfApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 1000,
            temperature: 0.95,
            top_p: 0.95,
            top_k: 50,
            do_sample: true,
            return_full_text: false,
            repetition_penalty: 1.2,
            num_return_sequences: 1,
            seed: Math.floor(Math.random() * 1000000),
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HuggingFace API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Gemini API response:', data);
      
      // Handle different response formats
      if (data.candidates && data.candidates[0]) {
        const candidate = data.candidates[0];
        if (candidate.content && candidate.content.parts && candidate.content.parts[0]) {
          aiText = candidate.content.parts[0].text || '';
        } else if (candidate.text) {
          aiText = candidate.text;
        }
      }
      
      if (!aiText) {
        console.error('No text in response:', JSON.stringify(data));
        throw new Error('AI returned empty response');
      }
    }
    
    // Parse AI response
    const posts = parseAIResponse(aiText, options);

    // If parsing failed or got less than 3 posts, throw error
    if (posts.length < 3) {
      console.error('AI parsing failed. Generated only', posts.length, 'posts');
      throw new Error(`AI generated only ${posts.length} posts. Please try again.`);
    }

    return posts;
  } catch (error) {
    console.error('AI generation error:', error);
    
    // Smart fallback: Generate professional posts without AI
    console.log('Using smart fallback post generator');
    return generateSmartFallbackPosts(options);
  }
}

// Smart fallback post generator (no API needed) - Professional & Dynamic
function generateSmartFallbackPosts(options: PostOptions): PostVariation[] {
  const { platform, topic, brand, audience, tone, length, includeCTA } = options;
  const posts: PostVariation[] = [];
  
  // Extract keywords for hashtags
  const topicWords = topic.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const topicHashtags = topicWords.slice(0, 3).map(w => w.replace(/[^a-z0-9]/g, ''));
  
  // Professional post generators by tone
  const generators = {
    casual: [
      `${topic} is giving main character energy and I'm here for it ✨\n\n${brand ? `At ${brand}, ` : ''}We believe in making every moment count. ${audience ? `For ${audience}, ` : ''}this is your sign to embrace what matters most.`,
      `Just discovered the magic of ${topic} and honestly? Life-changing 💯\n\n${brand ? `${brand} ` : ''}Bringing you the best experiences, tailored ${audience ? `for ${audience}` : 'for you'}.`,
      `${topic} hits different when you truly understand it 🔥\n\nLet's talk about why this matters ${audience ? `to ${audience}` : 'to everyone'}.`,
      `Living for ${topic} moments like these 💫\n\n${brand ? `${brand} ` : ''}Creating experiences that resonate with ${audience || 'people like you'}.`,
      `${topic} is exactly the vibe we all need right now 🌟\n\nReady to dive deeper? ${brand ? `${brand} ` : ''}We've got you covered.`
    ],
    professional: [
      `${topic}: Strategic Analysis & Market Implications\n\n${brand ? `${brand} Research Division | ` : ''}Executive Summary:\n\nOur Q4 data analysis reveals ${topic} is driving 47% YoY growth across key sectors. ${audience ? `For ${audience}, ` : 'For industry leaders, '}this represents a critical inflection point.\n\n📊 Key Metrics:\n• 3.2x ROI for early adopters\n• 65% improvement in operational efficiency\n• 89% stakeholder satisfaction rate\n\nMethodology: Cross-sectional analysis of 500+ case studies.\n\n${brand ? `${brand} ` : ''}Delivering data-driven insights ${audience ? `for ${audience}` : 'for strategic decision-makers'}.`,
      `The Economic Impact of ${topic}: A Comprehensive Framework\n\n${brand ? `${brand} Insights | ` : ''}Industry Report:\n\nLongitudinal research spanning 36 months demonstrates ${topic} is fundamentally reshaping competitive dynamics. ${audience ? `${audience} ` : 'Organizations '}implementing these strategies see:\n\n✓ 156% market growth projection by 2030\n✓ 2.5x faster market penetration\n✓ 58% higher profit margins\n\nSource: McKinsey Global Institute, Harvard Business Review\n\n${brand ? `${brand}: ` : ''}Empowering ${audience || 'forward-thinking organizations'} with evidence-based strategies.`,
      `${topic} & Competitive Advantage: Strategic Positioning for Market Leadership\n\n${brand ? `${brand} Strategy Group | ` : ''}White Paper Excerpt:\n\nBenchmarking analysis of Fortune 500 companies reveals top performers allocate 23% more resources to ${topic}. ${audience ? `${audience} can` : 'Organizations can'} leverage five critical pillars:\n\n1. Data-driven decision frameworks\n2. Agile implementation methodologies\n3. Stakeholder alignment protocols\n4. Performance optimization systems\n5. Continuous improvement cycles\n\nResult: 91% higher stakeholder value, 67% improved brand equity.\n\n${brand ? `${brand} ` : ''}Leading ${audience || 'industry transformation'} through proven methodologies.`,
      `${topic}: Evidence-Based Best Practices for Sustainable Growth\n\n${brand ? `${brand} Research Lab | ` : ''}Peer-Reviewed Findings:\n\nMeta-analysis of 2,000+ data points identifies optimal strategies. ${audience ? `${audience} ` : 'High-performing organizations '}following this framework report:\n\n📈 Performance Indicators:\n• 4.2x return on investment\n• 52% reduction in time-to-market\n• 78% correlation with market cap growth\n• 3.8x higher employee engagement\n\nPublished: MIT Sloan Management Review, Journal of Business Strategy\n\n${brand ? `${brand}: ` : ''}Transforming ${audience || 'business operations'} through rigorous research.`,
      `The Future of ${topic}: Predictive Analysis & Strategic Foresight\n\n${brand ? `${brand} Innovation Center | ` : ''}Trend Forecast:\n\nProprietary algorithms analyzing 15 industries predict significant disruption. ${audience ? `${audience} ` : 'Market leaders '}positioning strategically will capture disproportionate value:\n\n🎯 Projections (2025-2030):\n• 73% probability of industry transformation\n• 94% higher customer lifetime value\n• Market share consolidation among early movers\n• 61% better innovation outcomes\n\nData: Gartner Research, Deloitte Insights, Bloomberg Terminal\n\n${brand ? `${brand} ` : ''}Partnering with ${audience || 'visionary leaders'} to shape tomorrow.`
    ],
    funny: [
      `Me trying to explain ${topic} to literally anyone who'll listen 😂\n\n${brand ? `${brand} ` : ''}Making ${topic} actually fun ${audience ? `for ${audience}` : 'for everyone'}. You're welcome.`,
      `${topic} got me acting like a whole different person 🤪\n\nBut seriously, ${brand ? `${brand} ` : ''}we're here to make ${audience ? `${audience}'s` : 'your'} experience unforgettable.`,
      `POV: You just learned about ${topic} and your entire worldview shifted 🎭\n\n${brand ? `${brand} ` : ''}Bringing the plot twists ${audience ? `${audience}` : 'you'} didn't know you needed.`,
      `${topic} at 3am hits different and I have so many questions 😅\n\n${brand ? `${brand} ` : ''}Answering the questions ${audience ? `${audience}` : 'everyone'} is too afraid to ask.`,
      `Nobody: ...\nAbsolutely nobody: ...\nMe: Let me tell you about ${topic} 🤣\n\n${brand ? `${brand} ` : ''}Making ${audience ? `${audience}` : 'everyone'} laugh while learning.`
    ],
    emotional: [
      `${topic} reminds me why I started this journey in the first place 💙\n\n${brand ? `At ${brand}, ` : ''}We're committed to creating meaningful experiences ${audience ? `for ${audience}` : 'that touch hearts'}. Every moment matters.`,
      `Finding unexpected beauty in ${topic} every single day 🌸\n\n${brand ? `${brand} ` : ''}Celebrating the journey with ${audience || 'our community'}. It's the little things that make the biggest difference.`,
      `${topic} taught me more about myself than I ever imagined possible 🦋\n\nGrowth is beautiful. ${brand ? `${brand} ` : ''}Supporting ${audience ? `${audience}'s` : 'your'} transformation every step of the way.`,
      `Deeply grateful for ${topic} and everything it brings to our lives 🙏\n\n${brand ? `${brand} ` : ''}Honored to serve ${audience || 'this amazing community'}. Thank you for being part of this.`,
      `${topic} fills my heart with pure joy and purpose ❤️\n\nThis is what living feels like. ${brand ? `${brand} ` : ''}Creating moments that matter ${audience ? `for ${audience}` : 'for everyone'}.`
    ],
    minimal: [
      `${topic}.\n\n${brand || 'Excellence'} ${audience ? `for ${audience}` : 'redefined'}.`,
      `${topic} ✨\n\n${brand ? `${brand}. ` : ''}${audience ? `${audience}. ` : ''}Elevated.`,
      `Simply ${topic}\n\n${brand || 'Quality'}. ${audience || 'Experience'}. Perfection.`,
      `${topic} 🤍\n\n${brand ? `${brand} ` : ''}${audience ? `× ${audience}` : ''}`,
      `Pure ${topic}\n\n${brand || 'Authentic'}. ${audience || 'Refined'}. Essential.`
    ]
  };
  
  // Platform-specific CTAs
  const platformCTAs: Record<string, string[]> = {
    instagram: ['Double tap if you agree! 💕', 'Save this for later! 📌', 'Tag someone who needs this! 🏷️', 'Share your thoughts below! 💬', 'Follow for more! ✨'],
    tiktok: ['Drop a ❤️ if you relate!', 'Duet this! 🎵', 'Stitch your reaction! 🎬', 'Follow for Part 2! 👀', 'Comment your thoughts! 💭'],
    linkedin: ['What are your thoughts? Share below.', 'Connect with me for more insights.', 'Repost if you found this valuable.', 'Join the conversation in comments.', 'Follow for more professional content.'],
    twitter: ['RT if you agree!', 'Reply with your take!', 'Quote tweet your thoughts!', 'Join the thread below!', 'Follow for more updates!'],
    youtube: ['Like and subscribe for more!', 'Drop a comment below!', 'Hit the bell for notifications!', 'Share with your friends!', 'Check the description for links!']
  };
  
  // Platform-specific hashtags
  const platformHashtags: Record<string, string[]> = {
    instagram: ['instagood', 'photooftheday', 'love', 'beautiful', 'happy', 'instadaily', 'lifestyle', 'inspiration'],
    tiktok: ['fyp', 'foryou', 'viral', 'trending', 'foryoupage', 'tiktok', 'trend', 'explore'],
    linkedin: ['business', 'professional', 'career', 'success', 'leadership', 'growth', 'innovation', 'strategy'],
    twitter: ['trending', 'viral', 'thread', 'news', 'update', 'breaking', 'discussion', 'community'],
    youtube: ['youtube', 'video', 'subscribe', 'content', 'creator', 'vlog', 'tutorial', 'educational']
  };
  
  const selectedGenerators = generators[tone] || generators.casual;
  const ctas = platformCTAs[platform] || platformCTAs.instagram;
  const baseHashtags = platformHashtags[platform] || platformHashtags.instagram;
  
  // Generate only 1 post (first one from the selected generators)
  let text = selectedGenerators[0];
  const cta = includeCTA ? ctas[0] : '';
  
  // Add CTA if requested
  if (cta) {
    text += `\n\n${cta}`;
  }
  
  // Generate relevant hashtags
  const hashtags = [...topicHashtags, ...baseHashtags.slice(0, 5)].slice(0, 8);
  
  posts.push({
    text,
    hashtags,
    cta,
    characterCount: text.length,
  });
  
  return posts;
}

// Build AI prompt
function buildAIPrompt(options: PostOptions): string {
  const { platform, topic, brand, audience, tone, length, includeCTA } = options;

  const platformRules: Record<string, string> = {
    facebook: 'conversational, community-focused, max 500 characters',
    instagram: 'visual, lifestyle-oriented, emoji-rich, max 2200 characters',
    linkedin: 'professional, value-driven, business-focused, max 3000 characters',
    twitter: 'concise, impactful, thread-ready, max 280 characters',
    youtube: 'descriptive, engaging, SEO-optimized, max 5000 characters',
  };

  const lengthGuide: Record<string, string> = {
    short: '1-2 sentences',
    medium: '3-5 sentences',
    long: '6-10 sentences or multiple paragraphs',
  };

  const toneGuide: Record<string, string> = {
    funny: 'humorous, entertaining, meme-worthy, relatable jokes',
    professional: 'formal, business-focused, value-driven, expert tone',
    emotional: 'heartfelt, touching, inspiring, authentic feelings',
    trendy: 'viral, Gen-Z slang, current trends, main character energy',
    minimal: 'clean, simple, elegant, less is more',
    storytelling: 'narrative, journey-based, chapter format, engaging story',
    marketing: 'promotional, sales-focused, CTA-heavy, conversion-oriented',
  };

  return `You are an expert social media content creator specializing in ${platform} marketing. Generate 1 perfect, high-converting social media post.

=== USER SELECTIONS (MUST FOLLOW EXACTLY) ===
Platform: ${platform.toUpperCase()} (${platformRules[platform]})
Topic/Product: "${topic}"
Brand Name: "${brand || 'Generic Brand'}"
Target Audience: "${audience}"
Tone Style: ${tone.toUpperCase()} (${toneGuide[tone]})
Post Length: ${length.toUpperCase()} (${lengthGuide[length]})
Call-to-Action: ${includeCTA ? 'YES - Include compelling CTA' : 'NO - No CTA needed'}

=== STRICT REQUIREMENTS ===
1. PLATFORM: Write EXACTLY for ${platform} - match their character limits, style, and audience expectations
2. AUDIENCE: Speak directly to "${audience}" - use their language, pain points, and desires
3. TONE: Use ${tone} tone in EVERY sentence - this is NON-NEGOTIABLE
4. LENGTH: ${length} means ${lengthGuide[length]} - follow this precisely
5. BRAND: Mention "${brand || 'Generic Brand'}" naturally in the post
6. TOPIC: Focus on "${topic}" - this is the main subject
7. HASHTAGS: Include 5-10 relevant, trending hashtags at the end
8. EMOJIS: Use emojis that match ${platform} culture and ${tone} tone
9. CTA: ${includeCTA ? 'MUST include a clear, compelling call-to-action that drives engagement' : 'DO NOT include any call-to-action'}
10. ENGAGEMENT: Make it scroll-stopping, shareable, and conversation-starting
11. UNIQUENESS: Create a completely original, never-seen-before approach

=== PROFESSIONAL QUALITY STANDARDS ===
✓ GRAMMAR: Perfect grammar, spelling, and punctuation - zero errors allowed
✓ FLOW: Natural, conversational flow - sounds like a professional human wrote it
✓ AUTHENTICITY: Genuine, relatable, not robotic or AI-generated sounding
✓ CREATIVITY: Original ideas, fresh perspectives, unique storytelling angles
✓ EMOTION: Connect emotionally with "${audience}" - make them feel something real
✓ VALUE: Provide genuine value, actionable insights, or meaningful entertainment
✓ HOOK: Start with a powerful hook that stops the scroll immediately
✓ STRUCTURE: Well-organized, scannable, proper paragraph breaks and formatting
✓ BRAND VOICE: Consistent with "${brand || 'Generic Brand'}" personality and values
✓ POLISH: Refined, polished, publication-ready - looks professionally crafted
✓ PERSUASION: Use proven copywriting techniques - AIDA, PAS, storytelling
✓ SOCIAL PROOF: Where appropriate, imply credibility and trust
✓ URGENCY: Create subtle FOMO or urgency without being pushy
✓ CLARITY: Crystal clear message - no confusion about the main point

=== EXAMPLES OF PROFESSIONAL QUALITY ===

BAD (Avoid):
"Hey everyone! Check out our new ${topic}! It's amazing! Buy now! 🎉"
(Too salesy, no value, generic, pushy)

GOOD (Aim for):
"I'll be honest - I was skeptical about ${topic} at first. But after 3 months of testing with our ${audience} community, the results speak for themselves. Here's what we discovered..."
(Authentic, builds trust, creates curiosity, professional)

BAD (Avoid):
"${topic} is the best! Everyone loves it! Get yours today!"
(No specifics, no proof, sounds fake)

GOOD (Aim for):
"Last Tuesday, something unexpected happened with ${topic}. A member of our ${audience} community shared their story, and it reminded me why we do what we do at ${brand || 'our company'}. Let me share it with you..."
(Storytelling, specific, emotional, brand integration)

Format exactly like this:
POST: [your professional, polished post text here]
HASHTAGS: #hashtag1 #hashtag2 #hashtag3

APPROACH: Use storytelling with emotional connection and authentic brand voice

Generate 1 PERFECT, PROFESSIONAL, PUBLICATION-READY POST now:`;
}

// Parse AI response into PostVariation array
function parseAIResponse(aiText: string, options: PostOptions): PostVariation[] {
  const variations: PostVariation[] = [];
  
  try {
    // Extract POST and HASHTAGS from single response
    const postMatch = aiText.match(/POST:\s*(.+?)(?=HASHTAGS:|$)/s);
    const hashtagsMatch = aiText.match(/HASHTAGS:\s*(.+?)$/s);

    if (postMatch) {
      let postText = postMatch[1].trim();
      const hashtagsText = hashtagsMatch ? hashtagsMatch[1].trim() : '';
      
      // Extract hashtags
      const hashtags = hashtagsText
        .split(/\s+/)
        .filter(tag => tag.startsWith('#'))
        .map(tag => tag.substring(1))
        .slice(0, 10);

      // Remove hashtags from post text if they're at the end
      postText = postText.replace(/\s*#\w+(\s+#\w+)*\s*$/, '').trim();

      // Extract CTA if present
      const ctaMatch = postText.match(/(👉|🔗|💬|📲|🔔|👍|🔄).*$/);
      const cta = ctaMatch ? ctaMatch[0] : '';

      variations.push({
        text: postText,
        hashtags,
        cta,
        characterCount: postText.length,
      });
    }
  } catch (error) {
    console.error('Error parsing post:', error);
  }

  return variations;
}

// Check if AI is available
export function isAIAvailable(): boolean {
  return !!(import.meta.env.VITE_ZAI_API_KEY || import.meta.env.VITE_GROQ_API_KEY || import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_HUGGINGFACE_API_KEY);
}

// Get active AI model name
export function getActiveAIModel(): string {
  if (import.meta.env.VITE_ZAI_API_KEY) return 'Z.ai Advanced Conversational AI (PREMIUM)';
  if (import.meta.env.VITE_GROQ_API_KEY) return 'Groq Llama 3.3 70B (FREE & UNLIMITED)';
  if (import.meta.env.VITE_GEMINI_API_KEY) return 'Gemini Flash 2.0';
  if (import.meta.env.VITE_HUGGINGFACE_API_KEY) return 'Mistral-7B';
  return 'None';
}
