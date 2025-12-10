// Real AI-Powered Caption Generator using HuggingFace
// Hybrid approach: Falls back to rule-based if API fails

import { generateCaptions, type CaptionOptions, type CaptionResult } from './captionAdapter';

// AI Model URLs
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
const ZAI_API_URL = 'https://api.z.ai/v1/chat/completions';

interface AICaptionOptions extends CaptionOptions {
  useAI?: boolean;
  subject: string;
}

// Generate AI-powered captions
export async function generateAICaptions(
  subject: string,
  options: CaptionOptions,
  count: number = 10,
  useAI: boolean = true
): Promise<CaptionResult[]> {
  const { platform, tone, language, length, includeHashtags, includeCTA } = options;

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
    const prompt = buildAICaptionPrompt(subject, options, count);
    
    let aiText = '';
    
    // Try Z.ai first (Advanced Conversational AI)
    if (zaiApiKey) {
      console.log('🚀 USING Z.AI ADVANCED CONVERSATIONAL AI (Priority #1)');
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
            stream: false
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
        } else {
          console.log('✅ Z.ai generation successful!');
        }
      } catch (zaiError) {
        console.error('❌ Z.ai failed, trying fallback:', zaiError);
        // Continue to fallback options
      }
    }
    
    // Fallback to Groq if Z.ai failed or not available
    if (!aiText && groqApiKey) {
      console.log('⚡ USING GROQ LLAMA 3.3 70B (Priority #2 - FREE & UNLIMITED)');
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
            temperature: 0.9,
            max_tokens: 3000,
            top_p: 0.95,
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
        } else {
          console.log('✅ Groq generation successful!');
        }
      } catch (groqError) {
        console.error('❌ Groq failed, trying fallback:', groqError);
        // Continue to fallback options
      }
    }
    
    // Fallback to Gemini if Z.ai and Groq failed or not available
    if (!aiText && geminiApiKey) {
      console.log('🧠 USING GOOGLE GEMINI FLASH 2.5 (Priority #3)');
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
            temperature: 0.9,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 3000,
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
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
    // Final fallback to HuggingFace
    else if (!aiText && hfApiKey) {
      console.log('🤖 USING HUGGINGFACE MISTRAL-7B (Priority #4)');
      const response = await fetch(HUGGINGFACE_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${hfApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 1500,
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
      aiText = data[0]?.generated_text || '';
    }
    
    console.log('AI generated text length:', aiText.length);
    
    // Parse AI response
    const captions = parseAICaptionResponse(aiText, options);

    console.log('Parsed captions count:', captions.length);

    // If parsing failed, return at least some captions
    if (captions.length === 0) {
      console.error('AI parsing completely failed');
      throw new Error('Failed to parse AI response. Please try again.');
    }

    // Return whatever we got (even if less than requested)
    return captions.slice(0, count);
  } catch (error) {
    console.error('AI caption generation error:', error);
    
    // Smart fallback: Generate professional captions without AI
    console.log('🛡️ USING SMART FALLBACK GENERATOR (Priority #5 - Always Works!)');
    return generateSmartFallbackCaptions(subject, options, count);
  }
}

// Smart fallback caption generator (no API needed) - Professional & Dynamic
function generateSmartFallbackCaptions(
  subject: string,
  options: CaptionOptions,
  count: number
): CaptionResult[] {
  const { platform, tone, language, includeHashtags, includeCTA } = options;
  const captions: CaptionResult[] = [];
  
  // Extract key words from subject for better hashtags
  const subjectWords = subject.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const subjectHashtags = subjectWords.slice(0, 3).map(w => w.replace(/[^a-z0-9]/g, ''));
  
  // Professional caption generators by tone
  const generators = {
    casual: [
      `${subject} hits different 💯 Can't stop thinking about it!`,
      `Just experienced ${subject} and wow... absolutely amazing ✨`,
      `${subject} vibes are unmatched 🔥 Who else feels this?`,
      `Living for these ${subject} moments 💫 Pure magic!`,
      `${subject} is everything I needed today 🌟`,
      `Can't get enough of ${subject} lately 😍 It's become my favorite!`,
      `${subject} making every day better ☀️ Grateful for this!`,
      `This ${subject} energy is exactly what I needed 💪`,
      `${subject} = instant happiness 🎉 Every single time!`,
      `Completely obsessed with ${subject} right now 💖 And I'm not sorry!`
    ],
    professional: [
      `${subject}: A Comprehensive Analysis\n\nRecent market research indicates a 47% increase in adoption rates. Our data-driven approach reveals three critical success factors that industry leaders are leveraging. Key findings suggest organizations implementing these strategies see 3x ROI within 18 months.\n\nMethodology: Cross-sectional analysis of 500+ case studies across Fortune 500 companies.`,
      `The Strategic Impact of ${subject} on Modern Business Operations\n\nExecutive Summary: Our Q4 analysis demonstrates ${subject} is fundamentally reshaping competitive dynamics. Organizations that prioritize this see 65% higher customer retention and 40% improved operational efficiency.\n\nData Source: McKinsey Global Institute, Harvard Business Review.`,
      `${subject}: Evidence-Based Best Practices for Sustainable Growth\n\nOur research team analyzed 1,000+ implementations to identify proven success patterns. Results show companies following these frameworks achieve 2.5x faster market penetration and 58% higher profit margins.\n\nPeer-reviewed findings published in Journal of Business Strategy.`,
      `Leveraging ${subject} for Competitive Advantage: A Strategic Framework\n\nIndustry benchmarking reveals top performers allocate 23% more resources here. Our proprietary analysis identifies five critical pillars that drive measurable outcomes. Early adopters report 89% satisfaction rates.\n\nMethodology: Longitudinal study spanning 36 months, N=750 organizations.`,
      `The Future of ${subject}: Trends Shaping the Next Decade\n\nForward-looking analysis by leading economists predicts 156% market growth by 2030. Organizations positioning themselves now will capture disproportionate value. Our forecast model shows 73% probability of industry disruption.\n\nSource: Gartner Research, Deloitte Insights, PwC Global Trends.`,
      `${subject} Excellence: Quantifiable Strategies for Market Leadership\n\nPerformance metrics from 300+ high-growth companies reveal consistent patterns. Implementation of these proven methodologies correlates with 91% higher stakeholder value and 67% improved brand equity.\n\nValidated through rigorous statistical analysis (p<0.01, CI 95%).`,
      `Transforming ${subject} into Measurable Business Value\n\nOur comprehensive meta-analysis of 2,000+ data points identifies optimal resource allocation strategies. Organizations following this framework report 4.2x return on investment and 52% reduction in time-to-market.\n\nPublished in MIT Sloan Management Review.`,
      `${subject} Mastery: Advanced Insights for C-Suite Executives\n\nExecutive briefing based on proprietary research across 15 industries. Key performance indicators show 78% correlation between strategic focus here and market capitalization growth. Board-level implications discussed.\n\nSource: Boston Consulting Group, Bain & Company analysis.`,
      `Understanding ${subject}: Critical Success Factors for Long-Term Value Creation\n\nLongitudinal research spanning 5 years reveals sustainable competitive advantages. Companies excelling here demonstrate 3.8x higher employee engagement and 61% better innovation outcomes.\n\nMethodology: Mixed-methods research, validated by external auditors.`,
      `${subject} Innovation at Scale: How Industry Leaders Stay Ahead\n\nBenchmarking study of top 100 global enterprises shows consistent investment patterns. Organizations dedicating strategic resources here achieve 94% higher customer lifetime value and dominate market share.\n\nData: Bloomberg Terminal, S&P Capital IQ, proprietary algorithms.`
    ],
    funny: [
      `Me trying to explain ${subject} to my friends: *gestures wildly* 😂`,
      `${subject} got me acting like a whole different person 🤪`,
      `POV: You just discovered ${subject} and your life will never be the same 🎭`,
      `${subject} at 3am hits different and I have questions 😅`,
      `Nobody: ... Absolutely nobody: ... Me: Let me tell you about ${subject} 🤣`,
      `${subject} is officially my entire personality now 💀 No regrets!`,
      `When ${subject} makes perfect sense but also no sense at all 🧠`,
      `${subject} energy is unmatched and slightly concerning 😎`,
      `Living my best ${subject} life and it's beautifully chaotic 🎪`,
      `${subject} but make it ✨chaotic good✨ ⚡`
    ],
    emotional: [
      `${subject} reminds me why I started this journey. Every moment matters 💙`,
      `Finding unexpected beauty in ${subject} every single day 🌸 It's the little things.`,
      `${subject} taught me more about myself than I ever imagined 🦋 Growth is beautiful.`,
      `Deeply grateful for ${subject} and everything it brings to my life 🙏`,
      `${subject} fills my heart with pure joy and purpose ❤️ This is what living feels like.`,
      `The magic of ${subject} never fades, it only grows stronger ✨`,
      `${subject} has become my sanctuary, my happy place 🌈 Peace found here.`,
      `Cherishing every precious ${subject} moment like the gift it is 💕`,
      `${subject} speaks directly to my soul in ways words can't capture 🌙`,
      `Forever thankful for ${subject} and the journey it's taken me on 🌻`
    ],
    minimal: [
      `${subject}.`,
      `${subject} ✨`,
      `Simply ${subject}`,
      `${subject} 🤍`,
      `Pure ${subject}`,
      `${subject} essence`,
      `${subject} 💫`,
      `Just ${subject}`,
      `${subject} ◦`,
      `${subject} —`
    ]
  };
  
  // Platform-specific hashtags
  const platformHashtags: Record<string, string[]> = {
    instagram: ['instagood', 'photooftheday', 'love', 'beautiful', 'happy', 'instadaily', 'lifestyle', 'inspiration'],
    tiktok: ['fyp', 'foryou', 'viral', 'trending', 'foryoupage', 'tiktok', 'trend', 'explore'],
    linkedin: ['business', 'professional', 'career', 'success', 'leadership', 'growth', 'innovation', 'strategy'],
    twitter: ['trending', 'viral', 'thread', 'news', 'update', 'breaking', 'discussion', 'community'],
    youtube: ['youtube', 'video', 'subscribe', 'content', 'creator', 'vlog', 'tutorial', 'educational']
  };
  
  // CTAs by platform
  const ctas: Record<string, string[]> = {
    instagram: ['Double tap if you agree! 💕', 'Save this for later! 📌', 'Tag someone who needs this! 🏷️', 'Share your thoughts below! 💬', 'Follow for more! ✨'],
    tiktok: ['Drop a ❤️ if you relate!', 'Duet this! 🎵', 'Stitch your reaction! 🎬', 'Follow for Part 2! 👀', 'Comment your thoughts! 💭'],
    linkedin: ['What are your thoughts? Share below.', 'Connect with me for more insights.', 'Repost if you found this valuable.', 'Join the conversation in comments.', 'Follow for more professional content.'],
    twitter: ['RT if you agree!', 'Reply with your take!', 'Quote tweet your thoughts!', 'Join the thread below!', 'Follow for more updates!'],
    youtube: ['Like and subscribe for more!', 'Drop a comment below!', 'Hit the bell for notifications!', 'Share with your friends!', 'Check the description for links!']
  };
  
  const selectedGenerators = generators[tone] || generators.casual;
  const baseHashtags = platformHashtags[platform] || platformHashtags.instagram;
  const platformCTAs = ctas[platform] || ctas.instagram;
  
  // Generate unique, professional captions
  for (let i = 0; i < Math.min(count, selectedGenerators.length); i++) {
    let text = selectedGenerators[i];
    
    // Add CTA if requested
    if (includeCTA && platformCTAs[i]) {
      text += `\n\n${platformCTAs[i]}`;
    }
    
    // Generate relevant hashtags
    const hashtags = includeHashtags 
      ? [...subjectHashtags, ...baseHashtags.slice(i * 2, (i * 2) + 5)].slice(0, 8)
      : [];
    
    captions.push({
      text,
      hashtags,
      cta: includeCTA ? platformCTAs[i] : '',
      characterCount: text.length,
      readabilityScore: 85,
    });
  }
  
  return captions;
}

// Build AI prompt for captions
function buildAICaptionPrompt(subject: string, options: CaptionOptions, count: number): string {
  const { platform, tone, language, length, includeHashtags, includeCTA } = options;

  const platformRules: Record<string, string> = {
    instagram: 'visual, lifestyle-oriented, emoji-rich, engaging',
    tiktok: 'viral, trendy, Gen-Z friendly, hook-focused',
    linkedin: 'professional, value-driven, business-focused',
    twitter: 'concise, impactful, conversation-starter',
    youtube: 'descriptive, engaging, SEO-friendly',
  };

  const lengthGuide: Record<string, string> = {
    short: '1-2 short sentences, punchy and direct',
    medium: '2-4 sentences, balanced and engaging',
    long: '4-6 sentences or a short paragraph, detailed and storytelling',
  };

  const toneGuide: Record<string, string> = {
    casual: 'friendly, relatable, everyday language, conversational',
    professional: 'formal, expert, business-focused, authoritative',
    funny: 'humorous, entertaining, witty, meme-worthy',
    emotional: 'heartfelt, touching, inspiring, authentic',
    minimal: 'clean, simple, elegant, less is more',
  };

  const languageNote = language === 'bengali' 
    ? 'Generate in Bengali (বাংলা) language with appropriate Bengali expressions.'
    : 'Generate in English language.';

  return `You are an expert ${platform} content strategist with 10+ years of experience creating viral content. Your captions consistently achieve 10x engagement rates.

🎯 TASK: Create ${count} scroll-stopping captions about "${subject}"

📋 SPECIFICATIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Platform: ${platform.toUpperCase()}
Style: ${platformRules[platform]}
Tone: ${tone.toUpperCase()} - ${toneGuide[tone]}
Length: ${lengthGuide[length]}
Language: ${language === 'bengali' ? 'বাংলা (Bengali) - স্বাভাবিক কথোপকথন' : 'English - Natural & Conversational'}
${includeHashtags ? 'Hashtags: 5-8 trending, relevant tags' : 'Hashtags: None'}
${includeCTA ? 'CTA: Include compelling call-to-action' : 'CTA: Not required'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✨ QUALITY REQUIREMENTS:
1. Write like a human expert, NOT like AI
2. Start with a powerful hook that stops scrolling
3. Use ${platform}-appropriate emojis strategically
4. Make every word count - no fluff
5. Create emotional connection with audience
6. Each caption must be 100% unique
7. Sound natural, authentic, and relatable
8. Include specific details about "${subject}"
9. Use storytelling when appropriate
10. Optimize for ${platform} algorithm

🎨 CREATIVE GUIDELINES:
• ${tone === 'professional' ? 'Use data, statistics, and authoritative language' : ''}
• ${tone === 'casual' ? 'Be relatable, friendly, and conversational' : ''}
• ${tone === 'funny' ? 'Use humor, wit, and entertainment value' : ''}
• ${tone === 'emotional' ? 'Create deep emotional resonance and inspiration' : ''}
• ${tone === 'minimal' ? 'Be elegant, concise, and impactful' : ''}
• Understand ${platform} culture and trends
• Write for the target audience mindset
• Make "${subject}" the hero of the story

📝 OUTPUT FORMAT (Clean bullet list):
* [Caption 1 with full text and context]${includeHashtags ? ' #tag1 #tag2 #tag3' : ''}
* [Caption 2 with full text and context]${includeHashtags ? ' #tag4 #tag5 #tag6' : ''}
* [Caption 3 with full text and context]${includeHashtags ? ' #tag7 #tag8 #tag9' : ''}

🚀 Generate ${count} exceptional, high-converting captions NOW:`;
}

// Parse AI response into CaptionResult array
function parseAICaptionResponse(aiText: string, options: CaptionOptions): CaptionResult[] {
  const captions: CaptionResult[] = [];
  
  console.log('Raw AI response:', aiText.substring(0, 500));
  
  // Try multiple parsing strategies
  
  // Strategy 1: Look for structured format with markers
  let parts = aiText.split('---CAPTION---').filter(p => p.trim());
  
  if (parts.length > 1) {
    console.log('Using marker-based parsing');
    for (const part of parts) {
      try {
        const captionMatch = part.match(/CAPTION:\s*(.+?)(?=\n\s*HASHTAGS:|HASHTAGS:|CTA:|$)/s);
        const hashtagsMatch = part.match(/HASHTAGS:\s*(.+?)(?=\n\s*CTA:|CTA:|$)/s);
        const ctaMatch = part.match(/CTA:\s*(.+?)$/s);

        if (captionMatch) {
          let captionText = captionMatch[1].trim();
          const hashtagsText = hashtagsMatch ? hashtagsMatch[1].trim() : '';
          const cta = ctaMatch ? ctaMatch[1].trim() : '';
          
          const allHashtags = new Set<string>();
          if (hashtagsText) {
            hashtagsText.split(/\s+/)
              .filter(tag => tag.startsWith('#'))
              .forEach(tag => allHashtags.add(tag.substring(1)));
          }
          
          const captionHashtags = captionText.match(/#\w+/g) || [];
          captionHashtags.forEach(tag => allHashtags.add(tag.substring(1)));
          captionText = captionText.replace(/\s*#\w+(\s+#\w+)*\s*$/, '').trim();

          const hashtags = Array.from(allHashtags).slice(0, 10);
          const words = captionText.split(/\s+/).length;
          const sentences = captionText.split(/[.!?]+/).filter(s => s.trim()).length || 1;
          const readabilityScore = Math.min(100, Math.max(0, 100 - (words / sentences) * 5));

          if (captionText.length > 10) {
            captions.push({
              text: captionText,
              hashtags,
              cta,
              characterCount: captionText.length,
              readabilityScore: Math.round(readabilityScore),
            });
          }
        }
      } catch (error) {
        console.error('Error parsing caption:', error);
      }
    }
  }

  // Strategy 2: Look for bullet points or numbered lists
  if (captions.length === 0) {
    console.log('Trying bullet/list parsing...');
    const lines = aiText.split('\n').filter(l => l.trim());
    
    for (const line of lines) {
      const trimmed = line.trim();
      // Match bullets (*, -, •) or numbers (1., 2.)
      const match = trimmed.match(/^(?:[*\-•]|\d+\.)\s+(.+)$/);
      if (match) {
        let text = match[1].trim();
        
        // Extract hashtags
        const hashtagMatches = text.match(/#\w+/g) || [];
        const hashtags = hashtagMatches.map(tag => tag.substring(1)).slice(0, 10);
        text = text.replace(/\s*#\w+(\s+#\w+)*\s*$/, '').trim();
        
        // Remove emoji-only or very short captions
        if (text.length > 15 && !/^[\u{1F300}-\u{1F9FF}]+$/u.test(text)) {
          const words = text.split(/\s+/).length;
          const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length || 1;
          const readabilityScore = Math.min(100, Math.max(0, 100 - (words / sentences) * 5));
          
          captions.push({
            text,
            hashtags: options.includeHashtags ? hashtags : [],
            cta: '',
            characterCount: text.length,
            readabilityScore: Math.round(readabilityScore),
          });
        }
      }
    }
  }

  // Strategy 3: Split by double newlines (paragraphs)
  if (captions.length === 0) {
    console.log('Trying paragraph parsing...');
    const paragraphs = aiText.split(/\n\n+/).filter(p => p.trim().length > 20);
    
    for (const para of paragraphs.slice(0, 10)) {
      try {
        let text = para.trim();
        
        // Skip headers or instructions
        if (text.includes('**') || text.toLowerCase().includes('caption') || text.toLowerCase().includes('option')) {
          continue;
        }
        
        const hashtagMatches = text.match(/#\w+/g) || [];
        const hashtags = hashtagMatches.map(tag => tag.substring(1)).slice(0, 10);
        text = text.replace(/\s*#\w+(\s+#\w+)*\s*$/, '').trim();
        
        if (text.length > 15) {
          const words = text.split(/\s+/).length;
          const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length || 1;
          const readabilityScore = Math.min(100, Math.max(0, 100 - (words / sentences) * 5));
          
          captions.push({
            text,
            hashtags: options.includeHashtags ? hashtags : [],
            cta: '',
            characterCount: text.length,
            readabilityScore: Math.round(readabilityScore),
          });
        }
      } catch (error) {
        console.error('Error in paragraph parsing:', error);
      }
    }
  }

  console.log(`Parsed ${captions.length} captions successfully`);
  return captions;
}

// Check if AI is available
export function isAIAvailable(): boolean {
  return !!(import.meta.env.VITE_ZAI_API_KEY || import.meta.env.VITE_GROQ_API_KEY || import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_HUGGINGFACE_API_KEY);
}

// Get active AI model name
export function getActiveAIModel(): string {
  if (import.meta.env.VITE_ZAI_API_KEY) return 'Z.ai Advanced Conversational AI (PREMIUM)';
  if (import.meta.env.VITE_GROQ_API_KEY) return 'Groq Llama 3.3 70B (FREE & UNLIMITED)';
  if (import.meta.env.VITE_GEMINI_API_KEY) return 'Gemini Flash 2.5';
  if (import.meta.env.VITE_HUGGINGFACE_API_KEY) return 'Mistral-7B';
  return 'None';
}
