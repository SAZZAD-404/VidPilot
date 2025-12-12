// Real AI-Powered Caption Generator using HuggingFace
// Hybrid approach: Falls back to rule-based if API fails

import { type CaptionOptions, type CaptionResult } from './captionAdapter';

// AI Model URLs
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
const ZAI_API_URL = 'https://api.z.ai/v1/chat/completions';
const OPENAI_FM_API_URL = 'https://api.openai.fm/v1/chat/completions';



// Generate AI-powered captions
export async function generateAICaptions(
  subject: string,
  options: CaptionOptions,
  count: number = 10,
  useAI: boolean = true
): Promise<CaptionResult[]> {

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
      console.error('Raw AI response:', aiText.substring(0, 1000));
      throw new Error('Failed to parse AI response. The AI may have returned an unexpected format.');
    }
    
    console.log('✅ Successfully generated', captions.length, 'caption(s)');

    // Return whatever we got (even if less than requested)
    return captions.slice(0, count);
  } catch (error) {
    console.error('AI caption generation error:', error);
    
    // No fallback - throw error to show user that AI is required
    throw new Error('AI generation failed. Please check your API keys and try again.');
  }
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

  return `You are a senior creative director and award-winning social media strategist with 12+ years of experience writing high-performance captions for global brands. Your writing style is human-like, emotionally intelligent, and audience-aware.

🎯 OBJECTIVE:
Generate 1 deeply polished, scroll-stopping caption about: "${subject}"

The caption must feel premium, intentional, aesthetic, and algorithm-friendly.

──────────────────────────STYLE & RULES──────────────────────────
• Platform style: ${platform.toUpperCase()} → ${platformRules[platform]}
• Tone: ${tone.toUpperCase()} → ${toneGuide[tone]}
• Length: ${lengthGuide[length]}
• Language: ${languageNote}
• Structure: Start with a hook, build emotional connection, end clean.
• No AI tone. No generic phrases. No robotic patterns.
• Captions must feel crafted, human, narrative-driven.
• Mix micro-storytelling + high emotional resonance.
• Avoid cliches and filler words.
• Use emojis sparingly and purposefully (if relevant).
${includeHashtags ? '• Hashtags enabled → 4–7 ultra-clean, niche-specific hashtags.' : '• No hashtags required.'}
${includeCTA ? '• CTA enabled → natural, soft, non-salesy CTA.' : '• No CTA required.'}

──────────────────────────OUTPUT FORMAT (STRICT)──────────────────────────
Return ONLY this format:

CAPTION:
{text}
${includeHashtags ? 'HASHTAGS: #tag #tag #tag' : ''}
${includeCTA ? 'CTA: optional' : ''}
${includeCTA ? 'CTA: optional' : ''}

… continue for all captions …

──────────────────────────NOW CREATE ${count} HIGH-END, BRAND-QUALITY CAPTIONS.──────────────────────────
Make each line refined, modern, emotionally intelligent, and platform-optimized.`;
}

// Parse AI response into CaptionResult array
function parseAICaptionResponse(aiText: string, options: CaptionOptions): CaptionResult[] {
  const captions: CaptionResult[] = [];
  
  console.log('Raw AI response:', aiText.substring(0, 500));
  
  // Strategy 1: Parse new structured format (CAPTION:)
  const captionBlocks = aiText.split(/CAPTION:/i).filter(block => block.trim());
  
  if (captionBlocks.length >= 1) {
    console.log('Using new structured format parsing');
    for (const block of captionBlocks) {
      try {
        const lines = block.trim().split('\n').filter(line => line.trim());
        if (lines.length === 0) continue;
        
        let captionText = '';
        let hashtagsText = '';
        let cta = '';
        
        // Parse each line in the block
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          
          if (line.startsWith('HASHTAGS:')) {
            hashtagsText = line.replace('HASHTAGS:', '').trim();
          } else if (line.startsWith('CTA:')) {
            cta = line.replace('CTA:', '').trim();
          } else if (!line.startsWith('HASHTAGS:') && !line.startsWith('CTA:') && line.length > 0) {
            // This is caption text
            if (captionText) {
              captionText += '\n' + line;
            } else {
              captionText = line;
            }
          }
        }
        
        if (captionText.length > 10) {
          // Extract hashtags
          const allHashtags = new Set<string>();
          if (hashtagsText) {
            hashtagsText.split(/\s+/)
              .filter(tag => tag.startsWith('#'))
              .forEach(tag => allHashtags.add(tag.substring(1)));
          }
          
          // Also check for hashtags in caption text
          const captionHashtags = captionText.match(/#\w+/g) || [];
          captionHashtags.forEach(tag => allHashtags.add(tag.substring(1)));
          
          // Remove hashtags from caption text if they exist at the end
          captionText = captionText.replace(/\s*#\w+(\s+#\w+)*\s*$/, '').trim();

          const hashtags = Array.from(allHashtags).slice(0, 10);
          const words = captionText.split(/\s+/).length;
          const sentences = captionText.split(/[.!?]+/).filter(s => s.trim()).length || 1;
          const readabilityScore = Math.min(100, Math.max(0, 100 - (words / sentences) * 5));

          captions.push({
            text: captionText,
            hashtags: options.includeHashtags ? hashtags : [],
            cta: options.includeCTA ? cta : '',
            characterCount: captionText.length,
            readabilityScore: Math.round(readabilityScore),
          });
        }
      } catch (error) {
        console.error('Error parsing structured caption:', error);
      }
    }
  }
  
  // Strategy 2: Fallback to old marker-based parsing
  if (captions.length === 0) {
    console.log('Trying fallback marker-based parsing');
    let parts = aiText.split('---CAPTION---').filter(p => p.trim());
    
    if (parts.length > 1) {
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

  // Ultimate fallback: Create one caption from the entire response
  if (captions.length === 0) {
    console.log('Using ultimate fallback - creating caption from raw response');
    
    // Clean up the raw text
    let cleanText = aiText
      .replace(/CAPTION:/gi, '')
      .replace(/HASHTAGS:/gi, '')
      .replace(/CTA:/gi, '')
      .replace(/\n+/g, ' ')
      .trim();
    
    // Extract hashtags from anywhere in the text
    const hashtagMatches = cleanText.match(/#\w+/g) || [];
    const hashtags = hashtagMatches.map(tag => tag.substring(1)).slice(0, 5);
    
    // Remove hashtags from text
    cleanText = cleanText.replace(/#\w+/g, '').replace(/\s+/g, ' ').trim();
    
    // Take first reasonable sentence/paragraph
    const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 10);
    if (sentences.length > 0) {
      cleanText = sentences.slice(0, 3).join('. ').trim();
      if (!cleanText.endsWith('.') && !cleanText.endsWith('!') && !cleanText.endsWith('?')) {
        cleanText += '.';
      }
    }
    
    if (cleanText.length > 10 && cleanText.length < 2000) {
      const words = cleanText.split(/\s+/).length;
      const readabilityScore = Math.min(100, Math.max(50, 100 - words * 2));
      
      captions.push({
        text: cleanText,
        hashtags: options.includeHashtags ? hashtags : [],
        cta: options.includeCTA ? 'Engage with this post!' : '',
        characterCount: cleanText.length,
        readabilityScore: Math.round(readabilityScore),
      });
      
      console.log('✅ Created fallback caption successfully');
    }
  }
  
  console.log(`Parsed ${captions.length} captions successfully`);
  return captions;
}

// Check if AI is available
export function isAIAvailable(): boolean {
  const hasZai = !!import.meta.env.VITE_ZAI_API_KEY;
  const hasGroq = !!import.meta.env.VITE_GROQ_API_KEY;
  const hasGemini = !!import.meta.env.VITE_GEMINI_API_KEY;
  const hasHF = !!import.meta.env.VITE_HUGGINGFACE_API_KEY;
  
  console.log('AI Availability Check:', {
    hasZai,
    hasGroq,
    hasGemini,
    hasHF,
    zaiKey: import.meta.env.VITE_ZAI_API_KEY ? `Present (${import.meta.env.VITE_ZAI_API_KEY.substring(0, 8)}...)` : 'Missing',
    groqKey: import.meta.env.VITE_GROQ_API_KEY ? `Present (${import.meta.env.VITE_GROQ_API_KEY.substring(0, 8)}...)` : 'Missing',
    geminiKey: import.meta.env.VITE_GEMINI_API_KEY ? `Present (${import.meta.env.VITE_GEMINI_API_KEY.substring(0, 8)}...)` : 'Missing',
    hfKey: import.meta.env.VITE_HUGGINGFACE_API_KEY ? `Present (${import.meta.env.VITE_HUGGINGFACE_API_KEY.substring(0, 8)}...)` : 'Missing'
  });
  
  return hasZai || hasGroq || hasGemini || hasHF;
}

// Test function for debugging
export async function testCaptionGeneration(): Promise<boolean> {
  try {
    console.log('🧪 Testing caption generation...');
    const testCaption = await generateAICaptions(
      'morning coffee',
      {
        platform: 'instagram',
        tone: 'casual',
        language: 'english',
        length: 'medium',
        includeHashtags: true,
        includeCTA: false
      },
      1,
      true
    );
    
    console.log('✅ Caption generation test successful!', testCaption);
    return true;
  } catch (error) {
    console.error('❌ Caption generation test failed:', error);
    return false;
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
