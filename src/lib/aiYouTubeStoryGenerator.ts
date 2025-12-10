// AI-Powered YouTube Story Generator
// Generates engaging YouTube video stories using AI

// AI Model URLs
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
const ZAI_API_URL = 'https://api.z.ai/v1/chat/completions';

export interface YouTubeStoryOptions {
  genre: 'educational' | 'entertainment' | 'lifestyle' | 'tech' | 'business' | 'gaming' | 'cooking' | 'travel';
  duration: 'short' | 'medium' | 'long' | 'extended' | 'documentary'; // 1-3 min, 5-10 min, 15-20 min, 30-45 min, 60+ min
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
  
  // If AI is disabled or no API keys, throw error
  if (!useAI || (!zaiApiKey && !groqApiKey && !geminiApiKey && !hfApiKey)) {
    throw new Error('AI is not configured. Please add VITE_ZAI_API_KEY, VITE_GROQ_API_KEY, or VITE_GEMINI_API_KEY to .env file');
  }

  try {
    // Build AI prompt
    const prompt = buildAIYouTubeStoryPrompt(topic, options);
    
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
            max_tokens: options.duration === 'documentary' ? 8000 : options.duration === 'extended' ? 6000 : 4000,
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
            max_tokens: options.duration === 'documentary' ? 8000 : options.duration === 'extended' ? 6000 : 4000,
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
            maxOutputTokens: options.duration === 'documentary' ? 8000 : options.duration === 'extended' ? 6000 : 4000,
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
            max_new_tokens: options.duration === 'documentary' ? 4000 : options.duration === 'extended' ? 3000 : 2000,
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
• TARGET: 1-3 minutes (150-450 words total)
• PACING: Fast, immediate impact, no filler content
• STRUCTURE: 5 sections, 30-90 words each
• READING SPEED: 150 words per minute average
• ENGAGEMENT: Hook within first 15 seconds`,
    
    medium: `
• TARGET: 5-10 minutes (750-1500 words total)
• PACING: Moderate, detailed but engaging
• STRUCTURE: 5-8 sections, 100-200 words each
• READING SPEED: 150 words per minute average
• ENGAGEMENT: Multiple hooks and retention points`,
    
    long: `
• TARGET: 15-20 minutes (2250-3000 words total)
• PACING: Comprehensive, multiple story beats
• STRUCTURE: 8-10 sections, 250-350 words each
• READING SPEED: 150 words per minute average
• ENGAGEMENT: Chapter-like progression with cliffhangers`,
    
    extended: `
• TARGET: 30-45 minutes (4500-6750 words total)
• PACING: Documentary style, in-depth exploration
• STRUCTURE: 10-12 chapters, 400-600 words each
• READING SPEED: 150 words per minute average
• ENGAGEMENT: Multi-act structure with major turning points`,
    
    documentary: `
• TARGET: 60+ minutes (9000+ words total)
• PACING: Feature documentary, comprehensive coverage
• STRUCTURE: 13-15 acts, 600-800 words each
• READING SPEED: 150 words per minute average
• ENGAGEMENT: Full narrative arc with multiple storylines`
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
    short: '1-3 minutes (150-450 words) - quick, punchy, fast-paced content with immediate impact',
    medium: '5-10 minutes (750-1500 words) - detailed explanation with examples and structured development',
    long: '15-20 minutes (2250-3000 words) - comprehensive storytelling with multiple segments and depth',
    extended: '30-45 minutes (4500-6750 words) - in-depth documentary style with detailed chapters and research',
    documentary: '60+ minutes (9000+ words) - full documentary format with extensive research and multiple story arcs',
  };

  const toneGuide: Record<string, string> = {
    casual: 'friendly, conversational, relatable, everyday language',
    professional: 'authoritative, expert, polished, business-focused',
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

  return `You are an award-winning YouTube content strategist and professional scriptwriter with 15+ years of experience creating viral content for major brands and top creators. You have worked with Netflix, BBC, National Geographic, and top YouTube channels with millions of subscribers. You understand advanced storytelling techniques, psychological triggers, and broadcast-quality content creation.

🎯 OBJECTIVE:
Create a PROFESSIONAL, BROADCAST-QUALITY YouTube video story about: "${topic}"

${inputTypeContext}

This story must meet PROFESSIONAL BROADCAST STANDARDS and be indistinguishable from content created by major media companies.

──────────────────────────PROFESSIONAL BROADCAST REQUIREMENTS──────────────────────────
• Genre: ${genre.toUpperCase()} → ${genreRules[genre]}
• Duration: ${durationGuide[duration]}
• Tone: ${tone.toUpperCase()} → ${toneGuide[tone]}
• Language: ${languageNote}

CRITICAL TIMING REQUIREMENTS:
${getTimingRequirements(duration)}

PROFESSIONAL STORYTELLING STANDARDS:
• BROADCAST QUALITY: Content must match Netflix/BBC/National Geographic standards
• NARRATIVE STRUCTURE: Professional three-act structure with clear story beats
• CHARACTER DEVELOPMENT: Rich, multi-dimensional characters with clear motivations
• EMOTIONAL JOURNEY: Sophisticated emotional arc that resonates with audiences
• VISUAL STORYTELLING: Detailed scene descriptions and cinematic language
• PACING & RHYTHM: Professional pacing with strategic tension and release
• DIALOGUE & NARRATION: Natural, engaging, and purposeful communication
• RESEARCH DEPTH: Include factual details, statistics, and credible information
• PRODUCTION VALUE: Write as if this will be produced with professional crew and budget

ADVANCED TECHNIQUES:
• Use psychological triggers and emotional hooks
• Include pattern interrupts and retention techniques
• Create cliffhangers and curiosity gaps
• Build suspense and anticipation
• Use storytelling devices: foreshadowing, callbacks, reveals
• Include sensory details and immersive descriptions
• Create memorable moments and quotable lines
• Ensure each section has a clear purpose and payoff

${includeHooks ? '• OPENING HOOK: Create a POWERFUL, PROFESSIONAL opening that immediately captures attention and establishes stakes' : '• No hook required'}
${includeCTA ? '• CALL-TO-ACTION: Craft a SOPHISTICATED, NATURAL CTA that feels organic to the story' : '• No CTA required'}

──────────────────────────OUTPUT FORMAT (STRICT)──────────────────────────
Return ONLY this format:

TITLE: {compelling YouTube title}
${includeHooks ? 'HOOK: {powerful opening hook}' : ''}
STORY: {main story content with clear narrative structure - use line breaks for different scenes/sections}

Format the STORY section like this:
- Start with scene setting
- Build tension/interest
- Present main content/conflict
- Show resolution/outcome
- End with impact/lesson

Use clear paragraphs and line breaks to separate different parts of the story.
${includeCTA ? 'CTA: {call-to-action}' : ''}
TAGS: #tag1 #tag2 #tag3 #tag4 #tag5
DURATION: {estimated duration}

──────────────────────────STORY STRUCTURE BY DURATION──────────────────────────

FOR SHORT (1-3 min) - 150-450 WORDS TOTAL:
STORY: [COLD OPEN - 30-90 words. Immediate high-impact scene that establishes stakes. Use cinematic language and vivid imagery. 2-3 sentences with professional pacing.]

[HOOK & SETUP - 30-90 words. Establish the central question or conflict quickly. Create immediate emotional investment. 2-3 sentences with sophisticated narrative structure.]

[DEVELOPMENT - 30-90 words. Build tension rapidly. Include key facts or insights. Create curiosity gaps. 2-3 sentences with broadcast-quality depth.]

[CLIMAX & REVELATION - 30-90 words. The pivotal moment with maximum impact. Use dramatic techniques and emotional payoff. 2-3 sentences with cinematic quality.]

[RESOLUTION & IMPACT - 30-90 words. Quick, sophisticated conclusion. Include lasting implications. Memorable ending. 2-3 sentences with broadcast polish.]

FOR MEDIUM (5-10 min) - 750-1500 WORDS TOTAL:
STORY: [COLD OPEN - 100-200 words. Immediate high-impact scene that establishes stakes and creates intrigue. Use cinematic language and vivid imagery. 4-6 sentences with professional pacing.]

[HOOK & SETUP - 100-200 words. Establish the central question or conflict. Introduce key characters/elements with depth. Create emotional investment. 4-6 sentences with sophisticated narrative structure.]

[DEVELOPMENT PART 1 - 100-200 words. Build tension and complexity. Include research, facts, or detailed exploration. Use professional pacing and rhythm. 4-6 sentences with broadcast-quality depth.]

[DEVELOPMENT PART 2 - 100-200 words. Escalate complexity and stakes. Create curiosity gaps and maintain engagement. Include deeper insights. 4-6 sentences with professional development.]

[CLIMAX & REVELATION - 100-200 words. The pivotal moment with maximum impact. Use dramatic techniques and emotional payoff. Include surprising elements or key insights. 4-6 sentences with cinematic quality.]

[RESOLUTION & IMPACT - 100-200 words. Sophisticated conclusion that ties themes together. Include lasting implications and emotional resonance. Professional wrap-up with memorable ending. 4-6 sentences with broadcast polish.]

FOR LONG (15-20 min) - 2250-3000 WORDS TOTAL:
STORY: [TEASER & COLD OPEN - 250-350 words. Cinematic opening with the most compelling moment. Create immediate intrigue and establish visual tone. Use professional cinematography language. 8-12 sentences with broadcast impact.]

[TITLE SEQUENCE & SETUP - 250-350 words. Establish world, characters, and central premise. Use sophisticated exposition and character development. Create emotional investment and clear stakes. 8-12 sentences with professional depth.]

[ACT 1: INCITING INCIDENT - 250-350 words. Introduce the central conflict or opportunity. Use dramatic structure and pacing. Include research, context, and professional analysis. Build tension systematically. 8-12 sentences with broadcast quality.]

[ACT 1: RISING ACTION - 250-350 words. Develop complexity and obstacles. Include multiple perspectives and detailed exploration. Use professional storytelling techniques and emotional beats. 8-12 sentences with sophisticated narrative.]

[ACT 2: MIDPOINT CRISIS - 250-350 words. Major turning point or revelation. Use dramatic techniques and emotional impact. Include surprising developments and deeper insights. Professional pacing and structure. 8-12 sentences with cinematic quality.]

[ACT 2: COMPLICATIONS - 250-350 words. Escalate tension and stakes. Include detailed analysis and professional research. Use advanced storytelling devices and emotional complexity. 8-12 sentences with broadcast depth.]

[ACT 3: CLIMAX - 250-350 words. The ultimate confrontation or revelation. Use maximum dramatic impact and emotional payoff. Include professional resolution techniques. 8-12 sentences with cinematic power.]

[ACT 3: RESOLUTION - 250-350 words. Sophisticated conclusion with lasting impact. Include broader implications and emotional resonance. Professional wrap-up with memorable themes. 8-12 sentences with broadcast polish.]

FOR EXTENDED (30-45 min):
STORY: [Chapter 1: Opening & Setup - Detailed introduction and scene setting. 6-8 sentences]

[Chapter 2: The Challenge - Present the main problem or opportunity. 6-8 sentences]

[Chapter 3: Background Research - Historical context and relevant information. 6-8 sentences]

[Chapter 4: First Attempts - Initial efforts and early discoveries. 6-8 sentences]

[Chapter 5: Obstacles & Setbacks - Challenges faced and lessons learned. 6-8 sentences]

[Chapter 6: Breakthrough Moment - The turning point or major discovery. 6-8 sentences]

[Chapter 7: Implementation - How the solution was applied. 6-8 sentences]

[Chapter 8: Results & Impact - Outcomes and broader implications. 6-8 sentences]

[Chapter 9: Lessons Learned - Key takeaways and wisdom gained. 4-6 sentences]

[Chapter 10: Future Implications - What this means going forward. 4-6 sentences]

FOR DOCUMENTARY (60+ min) - PROFESSIONAL FEATURE DOCUMENTARY FORMAT:
STORY: [COLD OPEN & TEASER - Cinematic opening with the most compelling footage. Establish visual style and emotional tone. Use professional documentary techniques and powerful imagery. Create immediate intrigue and establish stakes. 8-10 sentences with feature film quality.]

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

CRITICAL FINAL REQUIREMENTS:
• WORD COUNT MUST MATCH DURATION: Follow the exact word count requirements for the selected duration
• TIMING ACCURACY IS MANDATORY: Content must fit the specified time limit precisely
• NO DEVIATION FROM WORD LIMITS: Respect the minimum and maximum word counts strictly
• PROFESSIONAL PACING: Ensure content flows naturally within the time constraints
• QUALITY OVER QUANTITY: Better to have perfect timing with excellent content than exceed limits

CREATE A PROFESSIONAL, BROADCAST-QUALITY YOUTUBE STORY that meets industry standards for premium content creation AND fits the exact timing requirements.`;
}

// Parse AI response into YouTubeStoryResult
function parseAIYouTubeStoryResponse(aiText: string, options: YouTubeStoryOptions): YouTubeStoryResult {
  console.log('Raw AI response:', aiText.substring(0, 500));
  
  let title = '';
  let hook = '';
  let story = '';
  let cta = '';
  let tags: string[] = [];
  let estimatedDuration = '';
  
  // Parse structured format with multi-line support
  const sections = aiText.split(/(?=TITLE:|HOOK:|STORY:|CTA:|TAGS:|DURATION:)/i);
  
  for (const section of sections) {
    const trimmed = section.trim();
    
    if (trimmed.startsWith('TITLE:')) {
      title = trimmed.replace(/^TITLE:\s*/i, '').split('\n')[0].trim();
    } else if (trimmed.startsWith('HOOK:')) {
      hook = trimmed.replace(/^HOOK:\s*/i, '').split(/(?=CTA:|TAGS:|DURATION:)/i)[0].trim();
    } else if (trimmed.startsWith('STORY:')) {
      // Extract multi-line story content
      const storyContent = trimmed.replace(/^STORY:\s*/i, '').split(/(?=CTA:|TAGS:|DURATION:)/i)[0].trim();
      story = storyContent;
    } else if (trimmed.startsWith('CTA:')) {
      cta = trimmed.replace(/^CTA:\s*/i, '').split(/(?=TAGS:|DURATION:)/i)[0].trim();
    } else if (trimmed.startsWith('TAGS:')) {
      const tagText = trimmed.replace(/^TAGS:\s*/i, '').split(/(?=DURATION:)/i)[0].trim();
      tags = tagText.split(/\s+/)
        .filter(tag => tag.startsWith('#'))
        .map(tag => tag.substring(1))
        .slice(0, 10);
    } else if (trimmed.startsWith('DURATION:')) {
      estimatedDuration = trimmed.replace(/^DURATION:\s*/i, '').trim();
    }
  }
  
  // Fallback parsing if structured format failed
  if (!title || !story) {
    console.log('Structured parsing failed, using fallback...');
    
    // Extract title from first meaningful line
    const allLines = aiText.split('\n').filter(line => line.trim());
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
      story = aiText
        .replace(/TITLE:/gi, '')
        .replace(/HOOK:/gi, '')
        .replace(/STORY:/gi, '')
        .replace(/CTA:/gi, '')
        .replace(/TAGS:/gi, '')
        .replace(/DURATION:/gi, '')
        .replace(/\n+/g, ' ')
        .trim();
    }
    
    // Extract hashtags from anywhere in text
    const hashtagMatches = aiText.match(/#\w+/g) || [];
    if (tags.length === 0) {
      tags = hashtagMatches.map(tag => tag.substring(1)).slice(0, 5);
    }
  }
  
  // Ensure we have minimum required content
  if (!title) {
    title = `Amazing ${options.genre} Story About ${aiText.split(' ').slice(0, 5).join(' ')}`;
  }
  
  if (!story) {
    story = aiText.substring(0, 500) + '...';
  }
  
  if (!estimatedDuration) {
    // Calculate based on actual word count (150 words per minute reading speed)
    const actualWordCount = story.split(/\s+/).length;
    const readingTimeMinutes = Math.ceil(actualWordCount / 150);
    
    const durationMap = {
      short: `${Math.max(1, Math.min(3, readingTimeMinutes))} minutes`,
      medium: `${Math.max(5, Math.min(10, readingTimeMinutes))} minutes`,
      long: `${Math.max(15, Math.min(20, readingTimeMinutes))} minutes`,
      extended: `${Math.max(30, Math.min(45, readingTimeMinutes))} minutes`,
      documentary: `${Math.max(60, readingTimeMinutes)} minutes`
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
    short: { min: 150, max: 450 },
    medium: { min: 750, max: 1500 },
    long: { min: 2250, max: 3000 },
    extended: { min: 4500, max: 6750 },
    documentary: { min: 9000, max: 15000 }
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
    title: title.substring(0, 100), // YouTube title limit
    hook: options.includeHooks ? hook : '',
    story,
    cta: options.includeCTA ? cta : '',
    tags,
    estimatedDuration,
    engagementScore: Math.round(engagementScore),
  };
}

// Check if AI is available
export function isAIAvailable(): boolean {
  const hasZai = !!import.meta.env.VITE_ZAI_API_KEY;
  const hasGroq = !!import.meta.env.VITE_GROQ_API_KEY;
  const hasGemini = !!import.meta.env.VITE_GEMINI_API_KEY;
  const hasHF = !!import.meta.env.VITE_HUGGINGFACE_API_KEY;
  
  return hasZai || hasGroq || hasGemini || hasHF;
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
  if (import.meta.env.VITE_ZAI_API_KEY) return 'Z.ai Advanced Conversational AI (PREMIUM)';
  if (import.meta.env.VITE_GROQ_API_KEY) return 'Groq Llama 3.3 70B (FREE & UNLIMITED)';
  if (import.meta.env.VITE_GEMINI_API_KEY) return 'Gemini Flash 2.5';
  if (import.meta.env.VITE_HUGGINGFACE_API_KEY) return 'Mistral-7B';
  return 'None';
}