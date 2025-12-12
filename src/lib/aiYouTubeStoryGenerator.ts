// AI-Powered YouTube Story Generator
// Generates engaging YouTube video stories using AI

// AI Model URLs
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
const ZAI_API_URL = 'https://api.z.ai/v1/chat/completions';
const OPENAI_FM_API_URL = 'https://api.openai.fm/v1/chat/completions';

export interface YouTubeStoryOptions {
  genre: 'educational' | 'entertainment' | 'lifestyle' | 'tech' | 'business' | 'gaming' | 'cooking' | 'travel';
  duration: 'short' | 'medium' | 'long' | 'extended' | 'documentary' | 'epic'; // 1-3 min, 5-10 min, 15-20 min, 30-45 min, 60+ min, 120+ min
  tone: 'casual' | 'professional' | 'funny' | 'dramatic' | 'inspiring';
  language: 'english' | 'bengali';
  includeHooks: boolean;
  includeCTA: boolean;
  inputType?: 'text' | 'image';
}

export interface YouTubeStoryResult {
  title: string;
  hook: string;
  story: string;
  cta: string;
  tags: string[];
  hashtags: string[];
  description: string;
  seoKeywords: string[];
  estimatedDuration: string;
  engagementScore: number;
}

// Generate AI-powered YouTube stories
export async function generateAIYouTubeStory(
  topic: string,
  options: YouTubeStoryOptions,
  useAI: boolean = true
): Promise<YouTubeStoryResult> {
  const { genre, duration, tone, language, includeHooks, includeCTA } = options;

  // Check which AI model to use
  const zaiApiKey = import.meta.env.VITE_ZAI_API_KEY;
  const groqApiKey = import.meta.env.VITE_GROQ_API_KEY;
  const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const hfApiKey = import.meta.env.VITE_HUGGINGFACE_API_KEY;
  const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY;
  const openaiFmApiKey = import.meta.env.VITE_OPENAI_FM_API_KEY;
  
  // If AI is disabled or no API keys, throw error
  if (!useAI || (!zaiApiKey && !groqApiKey && !geminiApiKey && !hfApiKey && !openaiApiKey && !openaiFmApiKey)) {
    throw new Error('AI is not configured. Please add VITE_ZAI_API_KEY, VITE_GROQ_API_KEY, VITE_GEMINI_API_KEY, VITE_OPENAI_API_KEY, or VITE_OPENAI_FM_API_KEY to .env file');
  }

  try {
    // Build AI prompt
    const prompt = buildAIYouTubeStoryPrompt(topic, options);
    
    let aiText = '';
    
    // Try Official OpenAI first (You have the official API key)
    if (openaiApiKey) {
      console.log('🚀 USING OFFICIAL OPENAI GPT-4O-MINI (Priority #1)');
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini', // Cost-effective and high quality
            messages: [{
              role: 'user',
              content: prompt
            }],
            temperature: 0.8,
            max_tokens: options.duration === 'epic' ? 16000 : options.duration === 'documentary' ? 8000 : options.duration === 'extended' ? 6000 : 4000,
            top_p: 0.9,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('OpenAI API error:', errorData);
          throw new Error(`OpenAI API error: ${response.status}`);
        }

        const data = await response.json();
        console.log('OpenAI API response received');
        
        if (data.choices && data.choices[0] && data.choices[0].message) {
          aiText = data.choices[0].message.content || '';
        }
        
        if (!aiText) {
          throw new Error('OpenAI returned empty response');
        } else {
          console.log('✅ OpenAI generation successful!');
        }
      } catch (openaiError) {
        console.error('❌ OpenAI failed, trying fallback:', openaiError);
        // Continue to fallback options
      }
    }
    
    // Try OpenAI.fm second (Cost-effective OpenAI Alternative)
    if (!aiText && openaiFmApiKey) {
      console.log('🚀 USING OPENAI.FM - COST-EFFECTIVE OPENAI ALTERNATIVE (Priority #1)');
      try {
        const response = await fetch(OPENAI_FM_API_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiFmApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini', // Cost-effective model
            messages: [{
              role: 'user',
              content: prompt
            }],
            temperature: 0.8,
            max_tokens: options.duration === 'epic' ? 16000 : options.duration === 'documentary' ? 8000 : options.duration === 'extended' ? 6000 : 4000,
            top_p: 0.9,
            stream: false
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('OpenAI.fm API error:', errorData);
          throw new Error(`OpenAI.fm API error: ${response.status}`);
        }

        const data = await response.json();
        console.log('OpenAI.fm API response received');
        
        if (data.choices && data.choices[0] && data.choices[0].message) {
          aiText = data.choices[0].message.content || '';
        }
        
        if (!aiText) {
          throw new Error('OpenAI.fm returned empty response');
        } else {
          console.log('✅ OpenAI.fm generation successful!');
        }
      } catch (openaiFmError) {
        console.error('❌ OpenAI.fm failed, trying fallback:', openaiFmError);
        // Continue to fallback options
      }
    }
    
    // Try Z.ai second (Advanced Conversational AI)
    if (!aiText && zaiApiKey) {
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
            max_tokens: options.duration === 'epic' ? 16000 : options.duration === 'documentary' ? 8000 : options.duration === 'extended' ? 6000 : 4000,
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
            max_tokens: options.duration === 'epic' ? 16000 : options.duration === 'documentary' ? 8000 : options.duration === 'extended' ? 6000 : 4000,
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
            maxOutputTokens: options.duration === 'epic' ? 16000 : options.duration === 'documentary' ? 8000 : options.duration === 'extended' ? 6000 : 4000,
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
            max_new_tokens: options.duration === 'epic' ? 8000 : options.duration === 'documentary' ? 4000 : options.duration === 'extended' ? 3000 : 2000,
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
    const story = parseAIYouTubeStoryResponse(aiText, options);

    console.log('✅ Successfully generated YouTube story');

    return story;
  } catch (error) {
    console.error('AI YouTube story generation error:', error);
    
    // No fallback - throw error to show user that AI is required
    throw new Error('AI generation failed. Please check your API keys and try again.');
  }
}

// Get timing requirements based on duration
function getTimingRequirements(duration: string): string {
  const requirements = {
    short: `
• TARGET: 1-3 minutes (250-950 words total)
• PACING: Fast, immediate impact, detailed but concise
• STRUCTURE: 3-5 sections, 80-200 words each
• SPEAKING SPEED: 120 words per minute (YouTube video)
• ENGAGEMENT: Hook within first 15 seconds`,
    
    medium: `
• TARGET: 5-10 minutes (1500-3500 words total)
• PACING: Moderate, detailed and engaging
• STRUCTURE: 5-8 sections, 200-450 words each
• SPEAKING SPEED: 120 words per minute (YouTube video)
• ENGAGEMENT: Multiple hooks and retention points`,
    
    long: `
• TARGET: 15-20 minutes (3250-6000 words total)
• PACING: Comprehensive, multiple story beats
• STRUCTURE: 8-12 sections, 400-600 words each
• SPEAKING SPEED: 120 words per minute (YouTube video)
• ENGAGEMENT: Chapter-like progression with cliffhangers`,
    
    extended: `
• TARGET: 30-45 minutes (6000-9750 words total)
• PACING: Documentary style, in-depth exploration
• STRUCTURE: 10-15 chapters, 500-750 words each
• SPEAKING SPEED: 120 words per minute (YouTube video)
• ENGAGEMENT: Multi-act structure with major turning points`,
    
    documentary: `
• TARGET: 60+ minutes (15000+ words total)
• PACING: Feature documentary, comprehensive coverage
• STRUCTURE: 15-20 acts, 800-1200 words each
• SPEAKING SPEED: 120 words per minute (YouTube video)
• ENGAGEMENT: Full narrative arc with multiple storylines`,
    
    epic: `
• TARGET: 120+ minutes (15000-20000 words total)
• PACING: Epic series with short, readable chapters
• STRUCTURE: 25 chapters, 600-800 words each
• SPEAKING SPEED: 120 words per minute (YouTube video)
• ENGAGEMENT: Easy-to-read parts with natural flow`
  };
  
  return requirements[duration as keyof typeof requirements] || requirements.medium;
}

// Build AI prompt for YouTube stories
function buildAIYouTubeStoryPrompt(topic: string, options: YouTubeStoryOptions): string {
  const { genre, duration, tone, language, includeHooks, includeCTA } = options;

  const genreRules: Record<string, string> = {
    educational: 'informative, value-driven, step-by-step, expert knowledge',
    entertainment: 'engaging, fun, dramatic, story-driven',
    lifestyle: 'relatable, personal, aspirational, authentic',
    tech: 'innovative, detailed, future-focused, problem-solving',
    business: 'professional, strategic, results-oriented, actionable',
    gaming: 'exciting, competitive, community-focused, entertaining',
    cooking: 'appetizing, step-by-step, cultural, family-friendly',
    travel: 'adventurous, cultural, inspiring, visual storytelling',
  };

  const durationGuide: Record<string, string> = {
    short: '1-3 minutes (250-950 words) - detailed, punchy, fast-paced content with immediate impact',
    medium: '5-10 minutes (1500-3500 words) - comprehensive explanation with examples and structured development',
    long: '15-20 minutes (3250-6000 words) - extensive storytelling with multiple segments and depth',
    extended: '30-45 minutes (6000-9750 words) - in-depth documentary style with detailed chapters and research',
    documentary: '60+ minutes (15000+ words) - full documentary format with extensive research and multiple story arcs',
    epic: '120+ minutes (25000+ words) - EPIC MULTI-PART SERIES: Create 20+ detailed parts with 1200+ words each, cinematic storytelling, complex character arcs, and extensive world-building',
  };

  const toneGuide: Record<string, string> = {
    casual: 'friendly, conversational, relatable, everyday language',
    professional: 'authoritative, expert, polished, business-focused, sophisticated vocabulary, industry-standard terminology, broadcast-quality narration, executive-level presentation, credible and trustworthy, data-driven insights, strategic perspective',
    funny: 'humorous, entertaining, witty, light-hearted',
    dramatic: 'intense, emotional, suspenseful, compelling',
    inspiring: 'motivational, uplifting, transformational, empowering',
  };

  const languageNote = language === 'bengali' 
    ? 'Generate in Bengali (বাংলা) language with appropriate Bengali expressions and cultural context.'
    : 'Generate in English language.';

  const inputTypeContext = options.inputType === 'image' ? 
    'This story is based on visual content from an uploaded image. Focus on visual storytelling, scene description, and narrative elements that can be derived from the imagery.' :
    'This story is based on a text prompt. Create original narrative content that engages viewers from start to finish.';

  return `${options.duration === 'epic' ? `
🚨🚨🚨 EPIC DURATION ALERT 🚨🚨🚨
You MUST write 25,000+ words total. This is NOT a summary.
Write 20 complete story parts with 1200+ words each.
Include full dialogue, descriptions, and character development.
This is a COMPLETE STORY, not an outline or summary.
🚨🚨🚨 EPIC DURATION ALERT 🚨🚨🚨

` : ''}${tone === 'professional' ? `
🎯 PROFESSIONAL TONE ACTIVATED 🎯
You are a senior executive consultant and C-suite advisor with 20+ years of experience in strategic communication, business transformation, and executive leadership. You have advised Fortune 500 CEOs, delivered keynotes at major industry conferences, and authored business bestsellers. Your content is referenced by Harvard Business Review, McKinsey, and top business schools worldwide.

PROFESSIONAL AUTHORITY REQUIREMENTS:
• Write with the sophistication of a McKinsey report
• Use the authority of a Harvard Business Review article  
• Employ the strategic thinking of a Fortune 500 CEO
• Include the credibility of peer-reviewed research
• Maintain the polish of premium business media
🎯 PROFESSIONAL TONE ACTIVATED 🎯

` : ''}You are an award-winning YouTube content strategist and professional scriptwriter with 15+ years of experience creating viral content for major brands and top creators. You have worked with Netflix, BBC, National Geographic, and top YouTube channels with millions of subscribers. You understand advanced storytelling techniques, psychological triggers, and broadcast-quality content creation.

🎯 OBJECTIVE:
Create a HUMAN-LIKE, ENGAGING YouTube video story about: "${topic}"

${inputTypeContext}

CRITICAL REQUIREMENTS:
• Create a NATURAL, CONVERSATIONAL story that feels human-written
• Base the entire story on the user's topic/idea: "${topic}"
• Make it relatable, engaging, and easy to follow
• Use storytelling techniques that connect with real human emotions
• Structure the content in a logical, serial progression
• Each section should flow naturally into the next

${options.duration === 'epic' ? `
🚨 EPIC DURATION SPECIAL REQUIREMENTS 🚨
CRITICAL: You MUST write 25,000+ words total for Epic duration.

EPIC REQUIREMENTS:
- Write 20 complete story parts
- Each part = 1200-1500 words of actual story content
- Include full dialogue, descriptions, and character development
- This is NOT a summary or outline - write the complete detailed story
- Think full Netflix series episode scripts
- Total minimum: 25,000 words
` : ''}

──────────────────────────PROFESSIONAL BROADCAST REQUIREMENTS──────────────────────────
• Genre: ${genre.toUpperCase()} → ${genreRules[genre]}
• Duration: ${durationGuide[duration]}
• Tone: ${tone.toUpperCase()} → ${toneGuide[tone]}
• Language: ${languageNote}

CRITICAL TIMING REQUIREMENTS:
${getTimingRequirements(duration)}

HUMAN-LIKE STORYTELLING STANDARDS:
• NATURAL FLOW: Write like a human storyteller, not a robot
• CONVERSATIONAL TONE: Use everyday language that people actually speak
• EMOTIONAL CONNECTION: Include personal experiences, feelings, and relatable moments
• LOGICAL PROGRESSION: Each section builds naturally on the previous one
• REAL-WORLD EXAMPLES: Use concrete examples people can relate to
• AUTHENTIC VOICE: Sound like a real person sharing their story
• ENGAGING NARRATIVE: Keep readers interested with natural curiosity and suspense
• PRACTICAL VALUE: Provide useful insights and takeaways
• SERIAL STRUCTURE: Organize content in clear, numbered sections that flow together

HUMAN STORYTELLING TECHNIQUES:
• Start with a relatable situation or problem
• Use "you" and "we" to connect with the audience
• Include personal anecdotes and real-life examples
• Ask rhetorical questions to engage the reader
• Use simple, clear language that anyone can understand
• Create natural transitions between sections
• Include moments of surprise, humor, or insight
• End each section with a reason to continue reading
• Make the story feel like a conversation with a friend

PROFESSIONAL TONE ENHANCEMENT (when tone = "professional"):
• Use sophisticated vocabulary and industry terminology
• Employ executive-level communication style
• Include data points, statistics, and credible sources
• Structure content with strategic frameworks
• Use authoritative language that builds trust
• Include expert insights and professional perspectives
• Maintain formal yet engaging presentation style
• Reference industry standards and best practices
• Use business-focused examples and case studies
• Employ broadcast-quality narration techniques

YOUTUBE SEO REQUIREMENTS:
• TITLE: 60 characters max, include primary keyword, emotional trigger words
• DESCRIPTION: 125+ words, include keywords naturally, add timestamps, call-to-action
• TAGS: 10 relevant tags, mix of broad and specific keywords
• HASHTAGS: 5 trending hashtags related to topic and genre
• SEO KEYWORDS: 5 primary keywords for search optimization
• Use power words: "Ultimate", "Secret", "Proven", "Amazing", "Complete"
• Include numbers and years for better CTR
• Add emotional triggers: "Shocking", "Incredible", "Life-changing"

${includeHooks ? '• OPENING HOOK: Create a POWERFUL, PROFESSIONAL opening that immediately captures attention and establishes stakes' : '• No hook required'}
${includeCTA ? '• CALL-TO-ACTION: Craft a SOPHISTICATED, NATURAL CTA that feels organic to the story' : '• No CTA required'}

──────────────────────────OUTPUT FORMAT (STRICT)──────────────────────────
Return ONLY this format:

TITLE: {SEO-optimized YouTube title with keywords, 60 characters max}
${includeHooks ? 'HOOK: {powerful opening hook}' : ''}
STORY: {human-like story content organized in clear, numbered sections}

Format the STORY section like this:
1. Opening: Start with a relatable hook about "${topic}"
2. Background: Explain why this topic matters to real people
3. Main Content: Break down the story into logical, easy-to-follow parts
4. Examples: Include real-world examples and practical applications
5. Resolution: Show the outcome and what people can learn
6. Conclusion: End with actionable insights and next steps

CRITICAL: Number each section (1, 2, 3, etc.) and make each section flow naturally into the next. Write like you're telling a story to a friend, not giving a lecture.
${includeCTA ? 'CTA: {call-to-action}' : ''}
DESCRIPTION: {SEO-optimized YouTube description with keywords, timestamps, and call-to-action}
TAGS: tag1, tag2, tag3, tag4, tag5, tag6, tag7, tag8, tag9, tag10
HASHTAGS: #hashtag1 #hashtag2 #hashtag3 #hashtag4 #hashtag5
SEO_KEYWORDS: keyword1, keyword2, keyword3, keyword4, keyword5
DURATION: {estimated duration}

──────────────────────────STORY STRUCTURE BY DURATION──────────────────────────

FOR SHORT (1-3 min) - 250-950 WORDS TOTAL:
STORY: 
1. Opening Hook (50-120 words): ${tone === 'professional' ? `Present a compelling business case or strategic insight about "${topic}". Use executive-level language and cite relevant data or market trends.` : `Start with something relatable about "${topic}". Keep it short and punchy.`}

2. Why It Matters (50-120 words): ${tone === 'professional' ? `Establish the strategic importance and business impact of "${topic}". Reference industry benchmarks, ROI potential, or competitive advantages.` : `Quickly explain why "${topic}" is important. Use simple language.`}

3. The Main Point (50-120 words): ${tone === 'professional' ? `Present the core strategic framework or methodology for "${topic}" with a proven case study or data-driven example.` : `Share the core message about "${topic}" with one clear example.`}

4. The Insight (50-120 words): ${tone === 'professional' ? `Deliver a sophisticated analysis or expert perspective on "${topic}" that demonstrates thought leadership and industry expertise.` : `Give one key takeaway or surprising fact about "${topic}".`}

5. What You Can Do (50-120 words): ${tone === 'professional' ? `Provide strategic recommendations and actionable next steps with clear success metrics and implementation guidelines.` : `End with one simple action people can take.`}

${tone === 'professional' ? 'Write with the authority of a business consultant and the sophistication of executive communication.' : 'Keep each part short and easy to read. Write like you\'re texting a friend.'}

FOR MEDIUM (5-10 min) - 1500-3500 WORDS TOTAL:
STORY:
1. Executive Summary (150-300 words): ${tone === 'professional' ? `Present the strategic value proposition of "${topic}" with market context, competitive landscape, and business impact potential.` : `Connect "${topic}" to everyday life. Keep it relatable and short.`}

2. Market Analysis (150-300 words): ${tone === 'professional' ? `Provide comprehensive background on "${topic}" including industry trends, market size, and key stakeholders. Reference authoritative sources.` : `Give simple context about "${topic}". Use easy examples.`}

3. Implementation Framework (150-300 words): ${tone === 'professional' ? `Detail the strategic methodology for "${topic}" with proven frameworks, best practices, and success metrics.` : `Show how "${topic}" works in practice. One clear example.`}

4. Competitive Advantage (150-300 words): ${tone === 'professional' ? `Analyze the unique differentiators and strategic advantages of "${topic}" with data-driven insights and expert perspectives.` : `Share something surprising about "${topic}". Keep it engaging.`}

5. Strategic Insights (150-300 words): ${tone === 'professional' ? `Present sophisticated analysis and thought leadership on "${topic}" with industry benchmarks and expert validation.` : `Explain the key insight about "${topic}". Make it clear.`}

6. Case Studies (150-300 words): ${tone === 'professional' ? `Showcase proven results and ROI from "${topic}" implementation with specific metrics, timelines, and business outcomes.` : `Show "${topic}" in action with real stories.`}

7. Risk Mitigation (150-300 words): ${tone === 'professional' ? `Address common implementation challenges and provide strategic solutions for "${topic}" with risk management frameworks.` : `What people get wrong about "${topic}". Keep it helpful.`}

8. Action Plan (150-300 words): ${tone === 'professional' ? `Deliver strategic recommendations with clear KPIs, implementation roadmap, and success measurement criteria for "${topic}".` : `One simple thing people can do right now.`}

${tone === 'professional' ? 'Structure each section like an executive briefing with clear value propositions and strategic insights.' : 'Write in short, easy-to-read paragraphs. Each part should be like a quick conversation.'}

FOR LONG (15-20 min) - 3250-6000 WORDS TOTAL:
STORY:
1. The Hook (200-350 words): Start with the most interesting thing about "${topic}". Grab attention immediately.

2. Why This Matters (200-350 words): Explain why "${topic}" is important to regular people.

3. The Beginning (200-350 words): How "${topic}" started or how you discovered it.

4. The Challenge (200-350 words): What makes "${topic}" difficult or interesting.

5. The Journey (200-350 words): Exploring "${topic}" step by step.

6. The Obstacles (200-350 words): Problems or complications with "${topic}".

7. The Breakthrough (200-350 words): The moment when "${topic}" became clear.

8. The Solution (200-350 words): How "${topic}" actually works.

9. Real Examples (200-350 words): Show "${topic}" in action with real stories.

10. Common Mistakes (200-350 words): What people get wrong about "${topic}".

11. Advanced Tips (200-350 words): Deeper insights about "${topic}".

12. The Results (200-350 words): What happens when you apply "${topic}".

13. Your Action Plan (200-350 words): Simple steps to get started with "${topic}".

14. Final Thoughts (200-350 words): Key takeaways and encouragement.

Keep each section short and focused. Write like you're explaining to a friend over coffee.

FOR EXTENDED (30-45 min) - 6000-9750 WORDS TOTAL:
STORY:
1. Introduction (300-500 words): What is "${topic}" and why should you care?

2. My Story (300-500 words): How I first encountered "${topic}".

3. The Problem (300-500 words): What challenge does "${topic}" solve?

4. The Background (300-500 words): Simple history and context of "${topic}".

5. First Steps (300-500 words): Getting started with "${topic}".

6. Early Challenges (300-500 words): What went wrong at first.

7. Learning Process (300-500 words): How to understand "${topic}" better.

8. The Breakthrough (300-500 words): When "${topic}" finally clicked.

9. Practical Application (300-500 words): Using "${topic}" in real life.

10. Advanced Techniques (300-500 words): Taking "${topic}" to the next level.

11. Common Pitfalls (300-500 words): Mistakes to avoid with "${topic}".

12. Success Stories (300-500 words): Real examples of "${topic}" working.

13. Tools and Resources (300-500 words): What you need for "${topic}".

14. Measuring Results (300-500 words): How to track progress with "${topic}".

15. Troubleshooting (300-500 words): Fixing problems with "${topic}".

16. Advanced Strategies (300-500 words): Expert-level "${topic}" techniques.

17. Future Trends (300-500 words): Where "${topic}" is heading.

18. Your Action Plan (300-500 words): Step-by-step guide to start.

Write each section as a short, focused chapter. Keep paragraphs small and easy to scan.

[Chapter 3: Background Research - Historical context and relevant information. 6-8 sentences]

[Chapter 4: First Attempts - Initial efforts and early discoveries. 6-8 sentences]

[Chapter 5: Obstacles & Setbacks - Challenges faced and lessons learned. 6-8 sentences]

[Chapter 6: Breakthrough Moment - The turning point or major discovery. 6-8 sentences]

[Chapter 7: Implementation - How the solution was applied. 6-8 sentences]

[Chapter 8: Results & Impact - Outcomes and broader implications. 6-8 sentences]

[Chapter 9: Lessons Learned - Key takeaways and wisdom gained. 4-6 sentences]

[Chapter 10: Future Implications - What this means going forward. 4-6 sentences]

FOR DOCUMENTARY (60+ min) - PROFESSIONAL FEATURE DOCUMENTARY FORMAT (15000+ WORDS TOTAL):
STORY: [COLD OPEN & TEASER - 800-1200 words. Cinematic opening with the most compelling footage. Establish visual style and emotional tone. Use professional documentary techniques and powerful imagery. Create immediate intrigue and establish stakes. 20-30 sentences with feature film quality.]

[TITLE SEQUENCE & WORLD ESTABLISHMENT - Comprehensive introduction to the world, setting, and context. Use sophisticated cinematography and professional narration. Establish the documentary's unique perspective and approach. 8-10 sentences with broadcast excellence.]

[CHARACTER INTRODUCTIONS & STAKES - Introduce key figures with depth and complexity. Use professional interview techniques and character development. Establish personal stakes and emotional investment. Create multi-dimensional portraits. 8-10 sentences with cinematic character work.]

[CENTRAL THESIS & INVESTIGATION LAUNCH - Present the core question or mystery with professional gravitas. Use investigative journalism techniques and compelling presentation. Establish the documentary's unique angle and approach. 6-8 sentences with journalistic excellence.]

[HISTORICAL CONTEXT & RESEARCH FOUNDATION - Provide comprehensive background with expert analysis. Use archival footage, expert interviews, and professional research presentation. Build credibility and context systematically. 8-10 sentences with academic rigor.]

[INVESTIGATION PHASE 1 - Begin the journey with professional investigative techniques. Use compelling interviews, evidence presentation, and narrative momentum. Include obstacles and discoveries with dramatic pacing. 8-10 sentences with investigative depth.]

[FIRST MAJOR REVELATIONS - Present initial findings with dramatic impact. Use professional revelation techniques and emotional resonance. Include expert analysis and compelling evidence. Build toward larger discoveries. 8-10 sentences with dramatic sophistication.]

[COMPLICATIONS & DEEPER MYSTERIES - Escalate complexity with professional pacing. Include unexpected developments and deeper investigations. Use advanced storytelling techniques and emotional complexity. 8-10 sentences with narrative sophistication.]

[INTENSIVE INVESTIGATION - Deep dive with professional research methods. Include multiple perspectives, expert analysis, and compelling evidence. Use advanced documentary techniques and emotional depth. 8-10 sentences with investigative excellence.]

[BREAKTHROUGH DISCOVERY - The pivotal revelation with maximum dramatic impact. Use professional presentation techniques and emotional payoff. Include verification and expert confirmation. 8-10 sentences with cinematic power.]

[VERIFICATION & CONFIRMATION - Professional fact-checking and expert validation. Use journalistic rigor and compelling presentation. Include multiple sources and credible analysis. 6-8 sentences with journalistic integrity.]

[BROADER IMPLICATIONS & IMPACT - Explore wider significance with professional analysis. Include expert commentary and societal implications. Use sophisticated presentation and emotional resonance. 8-10 sentences with intellectual depth.]

[RESOLUTION & LASTING IMPACT - Professional conclusion with emotional and intellectual satisfaction. Include long-term implications and memorable themes. Use cinematic techniques and powerful imagery. 6-8 sentences with feature film quality.]

[EPILOGUE & FUTURE VISION - Sophisticated wrap-up with lasting resonance. Include future implications and call for reflection. Use professional documentary techniques and memorable conclusion. 4-6 sentences with broadcast excellence.]

FOR EPIC (120+ min) - HUMAN-LIKE EPIC STORY FORMAT (15,000-20,000 WORDS TOTAL):

🚨 CRITICAL: Write a complete, human-like story about "${topic}" with 25 short, readable parts. Each part must be 600-800 words of natural, conversational storytelling.

STORY: Write a complete epic story about "${topic}" with these 25 short, readable parts:

1. First Discovery (600-800 words): How I first found "${topic}"
2. Why It Matters (600-800 words): Real impact of "${topic}"
3. Getting Started (600-800 words): My first steps with "${topic}"
4. Learning Curve (600-800 words): What I didn't know about "${topic}"
5. The Challenge (600-800 words): When "${topic}" got hard
6. Going Deeper (600-800 words): Advanced aspects of "${topic}"
7. Meeting Experts (600-800 words): People who taught me about "${topic}"
8. Testing Limits (600-800 words): Pushing "${topic}" boundaries
9. Preparation (600-800 words): Getting ready for big challenges
10. The Crisis (600-800 words): When "${topic}" went wrong
11. The Breakthrough (600-800 words): The moment everything changed
12. New Knowledge (600-800 words): What I learned about "${topic}"
13. Transformation (600-800 words): How "${topic}" changed me
14. Teaching Others (600-800 words): Sharing "${topic}" knowledge
15. New Reality (600-800 words): Living with "${topic}" understanding
16. Long-term Impact (600-800 words): Ongoing influence of "${topic}"
17. Hidden Connections (600-800 words): Discovering more about "${topic}"
18. Wider Effects (600-800 words): How "${topic}" affects everyone
19. Bigger Picture (600-800 words): "${topic}" in context
20. The Legacy (600-800 words): Future of "${topic}"
21. Practical Guide (600-800 words): How to start with "${topic}"
22. Common Mistakes (600-800 words): What to avoid with "${topic}"
23. Success Stories (600-800 words): Real examples of "${topic}" working
24. Advanced Tips (600-800 words): Expert techniques for "${topic}"
25. Your Journey (600-800 words): Next steps with "${topic}"

WRITE LIKE A HUMAN: Use conversational language, personal experiences, real examples, and natural storytelling. Make each part flow into the next like chapters in a fascinating book.

──────────────────────────PROFESSIONAL QUALITY STANDARDS──────────────────────────
BROADCAST EXCELLENCE CHECKLIST:
✓ Cinematic language and vivid imagery
✓ Professional pacing and rhythm
✓ Sophisticated character development
✓ Advanced storytelling techniques
✓ Emotional depth and resonance
✓ Research accuracy and credibility
✓ Visual storytelling elements
✓ Professional dialogue and narration
✓ Compelling hooks and retention
✓ Memorable and quotable moments

FINAL REQUIREMENTS:
• Write at BROADCAST PROFESSIONAL level (Netflix/BBC/National Geographic quality)
• Use sophisticated vocabulary and storytelling techniques
• Include specific details, research, and credible information
• Create emotional investment and character depth
• Use professional pacing and dramatic structure
• Include visual descriptions and cinematic language
• Ensure each section has clear purpose and payoff
• Create content that could be produced with professional crew and budget
• Make it indistinguishable from major media company content

PROFESSIONAL TONE REQUIREMENTS (when tone = "professional"):
• EXECUTIVE COMMUNICATION: Use C-suite level language and strategic thinking
• INDUSTRY AUTHORITY: Reference established frameworks, methodologies, and best practices
• DATA-DRIVEN INSIGHTS: Include relevant statistics, market data, and research findings
• CREDIBLE SOURCING: Reference expert opinions, case studies, and proven results
• SOPHISTICATED VOCABULARY: Use professional terminology appropriate to the subject matter
• STRATEGIC PERSPECTIVE: Frame content from a business and strategic viewpoint
• AUTHORITATIVE DELIVERY: Write with confidence and expertise that builds trust
• PROFESSIONAL STRUCTURE: Use executive summary style with clear value propositions
• BUSINESS FOCUS: Emphasize ROI, efficiency, results, and measurable outcomes
• BROADCAST QUALITY: Maintain the polish and sophistication of premium business content

CRITICAL FINAL REQUIREMENTS:
• HUMAN-LIKE WRITING: Write like a real person telling an engaging story
• TOPIC-FOCUSED: Everything must relate directly to "${topic}"
• SERIAL STRUCTURE: Number each section clearly (1, 2, 3, etc.)
• NATURAL FLOW: Each section should lead naturally to the next
• CONVERSATIONAL TONE: Use "you," "we," "I" and everyday language
• WORD COUNT ACCURACY: Meet the exact word requirements for the duration
• PRACTICAL VALUE: Include actionable insights people can use

HUMAN STORYTELLING CHECKLIST:
✓ Start with something relatable about "${topic}"
✓ Use simple, clear language anyone can understand
✓ Include real-world examples and practical applications
✓ Make each section flow naturally into the next
✓ End with actionable takeaways
✓ Write like you're talking to a friend
✓ Keep the focus on "${topic}" throughout

CREATE A HUMAN-LIKE, ENGAGING YOUTUBE STORY that feels natural and conversational while providing real value about "${topic}".`;
}

// Filter out unsupported characters for clean text output
export function filterUnsupportedCharacters(text: string): string {
  // Remove or replace unsupported characters that cause issues
  let filteredText = text
    // Remove emoji and special Unicode characters
    .replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '')
    // Remove combining characters and diacritics that might cause issues
    .replace(/[\u{0300}-\u{036F}]/gu, '')
    // Remove specific problematic characters mentioned in the error
    .replace(/[=àâäãåāăąćčçďđèéêëēėęěğģħīįìíîïıķĺļľłńņňñōøõöôőŕřśšşťţùúûüūůűųẃẅỳýÿźžż]/gi, (match) => {
      // Replace common accented characters with their base equivalents
      const replacements: { [key: string]: string } = {
        'à': 'a', 'á': 'a', 'â': 'a', 'ã': 'a', 'ä': 'a', 'å': 'a', 'ā': 'a', 'ă': 'a', 'ą': 'a',
        'è': 'e', 'é': 'e', 'ê': 'e', 'ë': 'e', 'ē': 'e', 'ė': 'e', 'ę': 'e', 'ě': 'e',
        'ì': 'i', 'í': 'i', 'î': 'i', 'ï': 'i', 'ī': 'i', 'į': 'i', 'ı': 'i',
        'ò': 'o', 'ó': 'o', 'ô': 'o', 'õ': 'o', 'ö': 'o', 'ø': 'o', 'ō': 'o', 'ő': 'o',
        'ù': 'u', 'ú': 'u', 'û': 'u', 'ü': 'u', 'ū': 'u', 'ů': 'u', 'ű': 'u', 'ų': 'u',
        'ý': 'y', 'ÿ': 'y', 'ỳ': 'y',
        'ñ': 'n', 'ń': 'n', 'ņ': 'n', 'ň': 'n',
        'ç': 'c', 'ć': 'c', 'č': 'c',
        'ś': 's', 'š': 's', 'ş': 's',
        'ź': 'z', 'ž': 'z', 'ż': 'z',
        '=': '', // Remove equals sign
      };
      return replacements[match.toLowerCase()] || '';
    })
    // Remove markdown formatting that can cause issues
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown
    .replace(/\*(.*?)\*/g, '$1') // Remove italic markdown
    .replace(/#{1,6}\s/g, '') // Remove markdown headers
    .replace(/\[.*?\]/g, '') // Remove markdown links
    // Remove other problematic Unicode characters
    .replace(/[⃣⏱️]/g, '')
    // Remove zero-width characters and other invisible characters
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    // Clean up multiple spaces
    .replace(/\s+/g, ' ')
    .trim();

  return filteredText;
}

// Parse AI response into YouTubeStoryResult
function parseAIYouTubeStoryResponse(aiText: string, options: YouTubeStoryOptions): YouTubeStoryResult {
  console.log('Raw AI response:', aiText.substring(0, 500));
  
  // Filter unsupported characters from the entire AI response first
  const cleanedAiText = filterUnsupportedCharacters(aiText);
  
  let title = '';
  let hook = '';
  let story = '';
  let cta = '';
  let description = '';
  let tags: string[] = [];
  let hashtags: string[] = [];
  let seoKeywords: string[] = [];
  let estimatedDuration = '';
  
  // Parse structured format with multi-line support using cleaned text
  const sections = cleanedAiText.split(/(?=TITLE:|HOOK:|STORY:|CTA:|DESCRIPTION:|TAGS:|HASHTAGS:|SEO_KEYWORDS:|DURATION:)/i);
  
  for (const section of sections) {
    const trimmed = section.trim();
    
    if (trimmed.startsWith('TITLE:')) {
      title = trimmed.replace(/^TITLE:\s*/i, '').split('\n')[0].trim();
    } else if (trimmed.startsWith('HOOK:')) {
      hook = trimmed.replace(/^HOOK:\s*/i, '').split(/(?=CTA:|TAGS:|DURATION:)/i)[0].trim();
    } else if (trimmed.startsWith('STORY:')) {
      // Extract multi-line story content
      const storyContent = trimmed.replace(/^STORY:\s*/i, '').split(/(?=CTA:|DESCRIPTION:|TAGS:|HASHTAGS:|SEO_KEYWORDS:|DURATION:)/i)[0].trim();
      story = storyContent;
    } else if (trimmed.startsWith('CTA:')) {
      cta = trimmed.replace(/^CTA:\s*/i, '').split(/(?=DESCRIPTION:|TAGS:|HASHTAGS:|SEO_KEYWORDS:|DURATION:)/i)[0].trim();
    } else if (trimmed.startsWith('DESCRIPTION:')) {
      description = trimmed.replace(/^DESCRIPTION:\s*/i, '').split(/(?=TAGS:|HASHTAGS:|SEO_KEYWORDS:|DURATION:)/i)[0].trim();
    } else if (trimmed.startsWith('TAGS:')) {
      const tagText = trimmed.replace(/^TAGS:\s*/i, '').split(/(?=HASHTAGS:|SEO_KEYWORDS:|DURATION:)/i)[0].trim();
      tags = tagText.split(/[,\s]+/)
        .filter(tag => tag.trim())
        .map(tag => tag.replace(/^#/, '').trim())
        .slice(0, 10);
    } else if (trimmed.startsWith('HASHTAGS:')) {
      const hashtagText = trimmed.replace(/^HASHTAGS:\s*/i, '').split(/(?=SEO_KEYWORDS:|DURATION:)/i)[0].trim();
      hashtags = hashtagText.split(/\s+/)
        .filter(tag => tag.startsWith('#'))
        .map(tag => tag.substring(1))
        .slice(0, 5);
    } else if (trimmed.startsWith('SEO_KEYWORDS:')) {
      const keywordText = trimmed.replace(/^SEO_KEYWORDS:\s*/i, '').split(/(?=DURATION:)/i)[0].trim();
      seoKeywords = keywordText.split(/[,\s]+/)
        .filter(keyword => keyword.trim())
        .map(keyword => keyword.trim())
        .slice(0, 5);
    } else if (trimmed.startsWith('DURATION:')) {
      estimatedDuration = trimmed.replace(/^DURATION:\s*/i, '').trim();
    }
  }
  
  // Fallback parsing if structured format failed
  if (!title || !story) {
    console.log('Structured parsing failed, using fallback...');
    
    // Extract title from first meaningful line using cleaned text
    const allLines = cleanedAiText.split('\n').filter(line => line.trim());
    const meaningfulLines = allLines.filter(line => 
      line.length > 10 && 
      !line.toLowerCase().includes('youtube') && 
      !line.toLowerCase().includes('story')
    );
    
    if (meaningfulLines.length > 0) {
      title = title || meaningfulLines[0].replace(/^[*\-•\d\.]+\s*/, '').trim();
    }
    
    // Use entire response as story if no structured story found
    if (!story) {
      story = cleanedAiText
        .replace(/TITLE:/gi, '')
        .replace(/HOOK:/gi, '')
        .replace(/STORY:/gi, '')
        .replace(/CTA:/gi, '')
        .replace(/TAGS:/gi, '')
        .replace(/DURATION:/gi, '')
        .replace(/\n+/g, ' ')
        .trim();
    }
    
    // Extract hashtags from anywhere in cleaned text
    const hashtagMatches = cleanedAiText.match(/#\w+/g) || [];
    if (tags.length === 0) {
      tags = hashtagMatches.map(tag => tag.substring(1)).slice(0, 10);
    }
    if (hashtags.length === 0) {
      hashtags = hashtagMatches.map(tag => tag.substring(1)).slice(0, 5);
    }
  }
  
  // Ensure we have minimum required content
  if (!title) {
    if (options.tone === 'professional') {
      title = `Strategic Insights: ${options.genre.charAt(0).toUpperCase() + options.genre.slice(1)} Excellence in ${aiText.split(' ').slice(0, 4).join(' ')}`;
    } else {
      title = `Amazing ${options.genre} Story About ${aiText.split(' ').slice(0, 5).join(' ')}`;
    }
  }
  
  if (!story) {
    story = aiText.substring(0, 500) + '...';
  }
  
  if (!description) {
    if (options.tone === 'professional') {
      description = `🎯 ${title}\n\nExecutive-level insights on ${options.genre} excellence. This comprehensive analysis covers strategic frameworks, industry best practices, and actionable recommendations for ${aiText.split(' ').slice(0, 8).join(' ')}.\n\n📊 Key Topics Covered:\n• Strategic Analysis & Market Insights\n• Implementation Frameworks & Best Practices\n• ROI Optimization & Success Metrics\n• Risk Management & Competitive Advantages\n\n⏰ Professional Timestamps:\n0:00 Executive Summary\n\n🔔 Subscribe for premium business content and strategic insights\n💼 Share your professional experience in the comments\n📈 Connect with industry leaders in our community\n\n#${options.genre} #BusinessStrategy #ProfessionalDevelopment #ExecutiveInsights`;
    } else {
      description = `🎬 ${title}\n\nIn this ${options.genre} video, we explore ${aiText.split(' ').slice(0, 10).join(' ')}...\n\n⏰ Timestamps:\n0:00 Introduction\n\n👍 Like this video if you found it helpful!\n🔔 Subscribe for more ${options.genre} content!\n💬 Comment your thoughts below!\n\n#${options.genre} #YouTube #${options.tone}`;
    }
  }
  
  if (tags.length === 0) {
    if (options.tone === 'professional') {
      tags = [options.genre, 'business strategy', 'professional development', 'executive insights', 'industry analysis', 'best practices', 'strategic planning', 'leadership', 'business excellence', 'professional growth'];
    } else {
      tags = [options.genre, options.tone, 'youtube', 'story', 'content'];
    }
  }
  
  if (hashtags.length === 0) {
    if (options.tone === 'professional') {
      hashtags = ['BusinessStrategy', 'ExecutiveInsights', 'ProfessionalDevelopment', 'IndustryLeadership', 'BusinessExcellence'];
    } else {
      hashtags = [options.genre, options.tone, 'youtube', 'viral', 'trending'];
    }
  }
  
  if (seoKeywords.length === 0) {
    if (options.tone === 'professional') {
      seoKeywords = [`${options.genre} strategy`, 'business excellence', 'professional development', 'executive insights', 'industry best practices'];
    } else {
      seoKeywords = [options.genre, `${options.genre} story`, `${options.tone} ${options.genre}`, 'youtube content', `${options.genre} tutorial`];
    }
  }
  
  if (!estimatedDuration) {
    // Calculate based on actual word count (120 words per minute speaking speed for YouTube)
    const actualWordCount = story.split(/\s+/).length;
    const readingTimeMinutes = Math.ceil(actualWordCount / 120);
    
    const durationMap = {
      short: `${Math.max(1, Math.min(3, readingTimeMinutes))} minutes`,
      medium: `${Math.max(5, Math.min(10, readingTimeMinutes))} minutes`,
      long: `${Math.max(15, Math.min(20, readingTimeMinutes))} minutes`,
      extended: `${Math.max(30, Math.min(45, readingTimeMinutes))} minutes`,
      documentary: `${Math.max(60, Math.min(120, readingTimeMinutes))} minutes`,
      epic: `${Math.max(120, readingTimeMinutes)} minutes`
    };
    
    estimatedDuration = durationMap[options.duration] || `${readingTimeMinutes} minutes`;
  }
  
  // Calculate engagement score based on content quality and timing accuracy
  const wordCount = story.split(/\s+/).length;
  const hasEmotionalWords = /amazing|incredible|shocking|unbelievable|secret|revealed|breakthrough|discovery|transformation/i.test(story);
  const hasNumbers = /\d+/.test(story);
  const hasQuestions = /\?/.test(story);
  
  // Check if word count matches duration requirements
  const targetWordCounts = {
    short: { min: 250, max: 600 },
    medium: { min: 1200, max: 2400 },
    long: { min: 2800, max: 4900 },
    extended: { min: 5400, max: 9000 },
    documentary: { min: 12000, max: 20000 },
    epic: { min: 15000, max: 20000 }
  };
  
  const target = targetWordCounts[options.duration] || targetWordCounts.medium;
  const isWithinRange = wordCount >= target.min && wordCount <= target.max;
  
  let engagementScore = 70; // Base score
  if (hasEmotionalWords) engagementScore += 10;
  if (hasNumbers) engagementScore += 5;
  if (hasQuestions) engagementScore += 5;
  if (isWithinRange) engagementScore += 15; // Bonus for proper timing
  if (wordCount > target.min) engagementScore += 5;
  
  engagementScore = Math.min(100, engagementScore);
  
  return {
    title: filterUnsupportedCharacters(title).substring(0, 100), // YouTube title limit
    hook: options.includeHooks ? filterUnsupportedCharacters(hook) : '',
    story: filterUnsupportedCharacters(story),
    cta: options.includeCTA ? filterUnsupportedCharacters(cta) : '',
    description: filterUnsupportedCharacters(description).substring(0, 5000), // YouTube description limit
    tags: tags.map(tag => filterUnsupportedCharacters(tag)),
    hashtags: hashtags.map(hashtag => filterUnsupportedCharacters(hashtag)),
    seoKeywords: seoKeywords.map(keyword => filterUnsupportedCharacters(keyword)),
    estimatedDuration,
    engagementScore: Math.round(engagementScore),
  };
}

// Check if AI is available
export function isAIAvailable(): boolean {
  const hasOpenAI = !!import.meta.env.VITE_OPENAI_API_KEY;
  const hasOpenAIFm = !!import.meta.env.VITE_OPENAI_FM_API_KEY;
  const hasZai = !!import.meta.env.VITE_ZAI_API_KEY;
  const hasGroq = !!import.meta.env.VITE_GROQ_API_KEY;
  const hasGemini = !!import.meta.env.VITE_GEMINI_API_KEY;
  const hasHF = !!import.meta.env.VITE_HUGGINGFACE_API_KEY;
  
  return hasOpenAI || hasOpenAIFm || hasZai || hasGroq || hasGemini || hasHF;
}

// Analyze image content using AI vision
export async function analyzeImageContent(imageUrl: string): Promise<string> {
  const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!geminiApiKey) {
    // Fallback analysis based on image characteristics
    return "A compelling visual story that captures attention and tells a meaningful narrative through imagery.";
  }

  try {
    // Convert image to base64 if it's a blob URL
    let imageData = '';
    if (imageUrl.startsWith('blob:')) {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const reader = new FileReader();
      
      return new Promise((resolve, reject) => {
        reader.onload = async () => {
          const base64 = (reader.result as string).split(',')[1];
          
          try {
            const geminiResponse = await fetch(`${GEMINI_API_URL}?key=${geminiApiKey}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                contents: [{
                  parts: [
                    {
                      text: "Analyze this image and describe what story it tells. Focus on the main subject, setting, mood, and potential narrative elements. Provide a detailed description that could be used to create a compelling YouTube video story."
                    },
                    {
                      inline_data: {
                        mime_type: blob.type,
                        data: base64
                      }
                    }
                  ]
                }],
                generationConfig: {
                  temperature: 0.7,
                  topK: 40,
                  topP: 0.95,
                  maxOutputTokens: 1000,
                }
              }),
            });

            if (!geminiResponse.ok) {
              throw new Error(`Gemini API error: ${geminiResponse.status}`);
            }

            const data = await geminiResponse.json();
            
            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
              const analysis = data.candidates[0].content.parts[0].text;
              resolve(analysis || "A visually compelling story with rich narrative potential.");
            } else {
              resolve("A captivating visual narrative with strong storytelling elements.");
            }
          } catch (error) {
            console.error('Image analysis error:', error);
            resolve("A powerful visual story that captures the viewer's imagination and tells a compelling narrative.");
          }
        };
        
        reader.onerror = () => {
          resolve("An engaging visual story with strong narrative elements.");
        };
        
        reader.readAsDataURL(blob);
      });
    }
    
    return "A compelling visual narrative ready for storytelling.";
  } catch (error) {
    console.error('Image analysis failed:', error);
    return "A visually rich story with compelling narrative elements that will engage viewers.";
  }
}



// Get active AI model name
export function getActiveAIModel(): string {
  if (import.meta.env.VITE_OPENAI_API_KEY) return 'OpenAI GPT-4o-mini (OFFICIAL)';
  if (import.meta.env.VITE_OPENAI_FM_API_KEY) return 'OpenAI.fm GPT-4o-mini (COST-EFFECTIVE)';
  if (import.meta.env.VITE_ZAI_API_KEY) return 'Z.ai Advanced Conversational AI (PREMIUM)';
  if (import.meta.env.VITE_GROQ_API_KEY) return 'Groq Llama 3.3 70B (FREE & UNLIMITED)';
  if (import.meta.env.VITE_GEMINI_API_KEY) return 'Gemini Flash 2.5';
  if (import.meta.env.VITE_HUGGINGFACE_API_KEY) return 'Mistral-7B';
  return 'None';
}