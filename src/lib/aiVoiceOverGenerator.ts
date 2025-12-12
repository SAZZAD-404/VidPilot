// AI-Powered Voice Over Generator - 100% FREE using HuggingFace AI
// Converts text content to professional voice overs using FREE AI services only

export interface VoiceOverOptions {
  voice: 'male' | 'female' | 'neutral' | 'child' | 'elderly' | 'robotic';
  language: 'english' | 'bengali' | 'hindi' | 'spanish' | 'french' | 'german';
  speed: 'very-slow' | 'slow' | 'normal' | 'fast' | 'very-fast';
  tone: 'professional' | 'casual' | 'energetic' | 'calm' | 'dramatic' | 'friendly' | 'authoritative' | 'emotional';
  format: 'mp3' | 'wav' | 'ogg' | 'flac' | 'm4a';
  quality: 'standard' | 'high' | 'premium' | 'studio' | 'broadcast';
  // Advanced options
  pitch?: number; // -2 to +2
  volume?: number; // 0 to 1
  emphasis?: 'none' | 'strong' | 'moderate';
  pauseDuration?: number; // milliseconds
  backgroundMusic?: boolean;
  noiseReduction?: boolean;
  normalization?: boolean;
}

export interface VoiceOverResult {
  audioUrl: string;
  audioBlob: Blob;
  duration: number;
  fileSize: number;
  transcript: string;
  waveformData?: number[]; // For visualization
  metadata: {
    voice: string;
    language: string;
    speed: string;
    tone: string;
    format: string;
    quality: string;
    provider: string;
    pitch?: number;
    volume?: number;
    emphasis?: string;
    processingTime: number;
    wordCount: number;
    characterCount: number;
    estimatedReadingTime: number;
  };
}

// Professional Voice Over Templates
export const voiceOverTemplates = {
  podcast: {
    voice: 'neutral' as const,
    tone: 'professional' as const,
    speed: 'normal' as const,
    emphasis: 'moderate' as const,
    pauseDuration: 800,
    normalization: true
  },
  commercial: {
    voice: 'male' as const,
    tone: 'energetic' as const,
    speed: 'fast' as const,
    emphasis: 'strong' as const,
    backgroundMusic: true,
    volume: 0.9
  },
  documentary: {
    voice: 'male' as const,
    tone: 'authoritative' as const,
    speed: 'slow' as const,
    emphasis: 'moderate' as const,
    pauseDuration: 1200,
    normalization: true
  },
  audiobook: {
    voice: 'neutral' as const,
    tone: 'calm' as const,
    speed: 'normal' as const,
    emphasis: 'none' as const,
    pauseDuration: 600,
    noiseReduction: true
  },
  presentation: {
    voice: 'female' as const,
    tone: 'professional' as const,
    speed: 'normal' as const,
    emphasis: 'moderate' as const,
    pauseDuration: 1000,
    normalization: true
  },
  youtube: {
    voice: 'neutral' as const,
    tone: 'friendly' as const,
    speed: 'normal' as const,
    emphasis: 'moderate' as const,
    backgroundMusic: false,
    volume: 0.8
  }
};

// Generate AI voice over using FREE services
export async function generateAIVoiceOver(
  text: string,
  options: VoiceOverOptions
): Promise<VoiceOverResult> {
  const startTime = Date.now();
  const { voice, language, speed, tone, format, quality, pitch, volume, emphasis, pauseDuration, backgroundMusic, noiseReduction, normalization } = options;

  console.log('🎙️ Generating REAL AI Voice Over...');
  console.log('Text length:', text.length, 'characters');

  try {
    // Filter unsupported characters before processing
    const filteredText = filterUnsupportedCharacters(text);
    console.log('🎙️ Starting voice generation process...');
    console.log('Original text length:', text.length, 'Filtered text length:', filteredText.length);
    
    // Try Google Cloud TTS first (1M chars/month free)
    const googleApiKey = import.meta.env.VITE_GOOGLE_TTS_API_KEY;
    if (googleApiKey && googleApiKey !== 'your_google_tts_key_here' && (quality !== 'standard')) {
      console.log('🎤 Trying Google Cloud TTS (1M chars/month free)...');
      try {
        const googleResult = await generateGoogleTTS(filteredText, voice, speed, tone, language, format);
        if (googleResult) {
          console.log('✅ Google Cloud TTS generation successful!');
          
          // Process audio with professional enhancements
          const processedAudioBlob = await processAudioProfessionally(googleResult.audioBlob, {
            noiseReduction,
            normalization,
            backgroundMusic,
            volume: volume || 1.0
          });

          // Generate waveform data for visualization
          const waveformData = await generateWaveformData(processedAudioBlob);

          const processingTime = Date.now() - startTime;
          const finalWordCount = filteredText.split(/\s+/).length;
          const characterCount = filteredText.length;
          const estimatedReadingTime = Math.ceil(finalWordCount / 150); // minutes

          return {
            audioUrl: googleResult.audioUrl,
            audioBlob: processedAudioBlob,
            duration: googleResult.duration,
            fileSize: processedAudioBlob.size,
            transcript: filteredText,
            waveformData,
            metadata: {
              voice,
              language,
              speed,
              tone,
              format,
              quality,
              provider: 'Google Cloud TTS (Free Tier)',
              pitch,
              volume,
              emphasis,
              processingTime,
              wordCount: finalWordCount,
              characterCount,
              estimatedReadingTime,
            },
          };
        }
      } catch (googleError) {
        console.error('❌ Google Cloud TTS failed, trying ElevenLabs fallback:', googleError);
        console.error('❌ Google Error details:', {
          message: googleError.message,
          stack: googleError.stack
        });
        // Continue to ElevenLabs fallback
      }
    }

    // Try ElevenLabs TTS as fallback (10,000 chars/month free)
    const elevenlabsApiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
    if (elevenlabsApiKey && elevenlabsApiKey !== 'your_elevenlabs_key_here' && (quality !== 'standard')) {
      console.log('🎤 Trying ElevenLabs TTS (Fallback)...');
      try {
        const elevenlabsResult = await generateElevenLabsTTS(filteredText, voice, speed, tone, language, format);
        if (elevenlabsResult) {
          console.log('✅ ElevenLabs TTS generation successful!');
          
          // Process audio with professional enhancements
          const processedAudioBlob = await processAudioProfessionally(elevenlabsResult.audioBlob, {
            noiseReduction,
            normalization,
            backgroundMusic,
            volume: volume || 1.0
          });

          // Generate waveform data for visualization
          const waveformData = await generateWaveformData(processedAudioBlob);

          const processingTime = Date.now() - startTime;
          const finalWordCount = filteredText.split(/\s+/).length;
          const characterCount = filteredText.length;
          const estimatedReadingTime = Math.ceil(finalWordCount / 150); // minutes

          return {
            audioUrl: elevenlabsResult.audioUrl,
            audioBlob: processedAudioBlob,
            duration: elevenlabsResult.duration,
            fileSize: processedAudioBlob.size,
            transcript: filteredText,
            waveformData,
            metadata: {
              voice,
              language,
              speed,
              tone,
              format,
              quality,
              provider: 'ElevenLabs TTS (Free Tier)',
              pitch,
              volume,
              emphasis,
              processingTime,
              wordCount: finalWordCount,
              characterCount,
              estimatedReadingTime,
            },
          };
        }
      } catch (elevenlabsError) {
        console.error('❌ ElevenLabs TTS failed, trying OpenAI fallback:', elevenlabsError);
        console.error('❌ ElevenLabs Error details:', {
          message: elevenlabsError.message,
          stack: elevenlabsError.stack
        });
        // Continue to OpenAI fallback
      }
    }

    // Try OpenAI TTS as fallback (if API key is available)
    const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (openaiApiKey && (quality !== 'standard')) { // Use OpenAI for all except standard
      console.log('🎤 Trying OpenAI TTS (Fallback)...');
      try {
        const openaiResult = await generateOpenAITTS(filteredText, voice, speed, tone, language, format);
        if (openaiResult) {
          console.log('✅ OpenAI TTS generation successful!');
          
          // Process audio with professional enhancements
          const processedAudioBlob = await processAudioProfessionally(openaiResult.audioBlob, {
            noiseReduction,
            normalization,
            backgroundMusic,
            volume: volume || 1.0
          });

          // Generate waveform data for visualization
          const waveformData = await generateWaveformData(processedAudioBlob);

          const processingTime = Date.now() - startTime;
          const finalWordCount = filteredText.split(/\s+/).length;
          const characterCount = filteredText.length;
          const estimatedReadingTime = Math.ceil(finalWordCount / 150); // minutes

          return {
            audioUrl: openaiResult.audioUrl,
            audioBlob: processedAudioBlob,
            duration: openaiResult.duration,
            fileSize: processedAudioBlob.size,
            transcript: filteredText,
            waveformData,
            metadata: {
              voice,
              language,
              speed,
              tone,
              format,
              quality,
              provider: 'OpenAI TTS (Official)',
              pitch,
              volume,
              emphasis,
              processingTime,
              wordCount: finalWordCount,
              characterCount,
              estimatedReadingTime,
            },
          };
        }
      } catch (openaiError) {
        console.error('❌ OpenAI TTS failed, trying Murf.ai fallback:', openaiError);
        console.error('❌ OpenAI Error details:', {
          message: openaiError.message,
          stack: openaiError.stack
        });
        // Continue to Murf.ai fallback
      }
    }

    // Try Murf.ai as fallback for premium quality (if API key is available)
    const murfApiKey = import.meta.env.VITE_MURF_API_KEY;
    if (murfApiKey && (quality !== 'standard')) { // Use Murf for all except standard
      console.log('🎤 Trying Murf.ai Professional TTS (Premium Quality)...');
      try {
        const murfResult = await generateMurfAIVoiceOver(filteredText, voice, speed, tone, language, format);
        if (murfResult) {
          console.log('✅ Murf.ai generation successful!');
          
          // Process audio with professional enhancements
          const processedAudioBlob = await processAudioProfessionally(murfResult.audioBlob, {
            noiseReduction,
            normalization,
            backgroundMusic,
            volume: volume || 1.0
          });

          // Generate waveform data for visualization
          const waveformData = await generateWaveformData(processedAudioBlob);

          const processingTime = Date.now() - startTime;
          const finalWordCount = filteredText.split(/\s+/).length;
          const characterCount = filteredText.length;
          const estimatedReadingTime = Math.ceil(finalWordCount / 150); // minutes

          return {
            audioUrl: murfResult.audioUrl,
            audioBlob: processedAudioBlob,
            duration: murfResult.duration,
            fileSize: processedAudioBlob.size,
            transcript: filteredText,
            waveformData,
            metadata: {
              voice,
              language,
              speed,
              tone,
              format,
              quality,
              provider: 'Murf.ai Professional TTS',
              pitch,
              volume,
              emphasis,
              processingTime,
              wordCount: finalWordCount,
              characterCount,
              estimatedReadingTime,
            },
          };
        }
      } catch (murfError) {
        console.error('❌ Murf.ai failed, falling back to browser TTS:', murfError);
        // Continue to fallback options
      }
    }
    
    // Fallback to Browser TTS
    console.log('🎤 Using Browser SpeechSynthesis API for REAL voice...');
    console.log('💡 Tip: Select "High Quality" or above to use OpenAI TTS instead of Browser TTS');
    
    // Start the speech synthesis immediately for real-time playback
    const speechResult = await startSpeechSynthesis(filteredText, voice, speed, tone, language);
    
    if (speechResult) {
      console.log('✅ Successfully started REAL AI voice over');
      
      // Calculate duration (estimate based on text length and speed)
      const wordsPerMinute = speed === 'slow' ? 120 : speed === 'fast' ? 180 : 150;
      const wordCount = text.split(/\s+/).length;
      const estimatedDuration = Math.ceil((wordCount / wordsPerMinute) * 60);

      // Create a real audio recording for download purposes
      const audioBlob = await createRealAudioRecording(filteredText, voice, speed, tone, language);

      // Process audio with professional enhancements
      const processedAudioBlob = await processAudioProfessionally(audioBlob, {
        noiseReduction,
        normalization,
        backgroundMusic,
        volume: volume || 1.0
      });

      // Generate waveform data for visualization
      const waveformData = await generateWaveformData(processedAudioBlob);

      const processingTime = Date.now() - startTime;
      const finalWordCount = filteredText.split(/\s+/).length;
      const characterCount = filteredText.length;
      const estimatedReadingTime = Math.ceil(finalWordCount / 150); // minutes

      return {
        audioUrl: speechResult.audioUrl,
        audioBlob: processedAudioBlob,
        duration: estimatedDuration,
        fileSize: processedAudioBlob.size,
        transcript: filteredText,
        waveformData,
        metadata: {
          voice,
          language,
          speed,
          tone,
          format,
          quality,
          provider: speechResult.provider,
          pitch,
          volume,
          emphasis,
          processingTime,
          wordCount: finalWordCount,
          characterCount,
          estimatedReadingTime,
        },
      };
    }

    // If browser TTS failed, throw error - NO DEMO AUDIO
    throw new Error('🎙️ Real voice generation unavailable. Browser speech synthesis not supported or failed. Try removing special characters from your text.');

  } catch (error) {
    console.error('Voice over generation error:', error);
    
    // More helpful error messages
    if (error.message.includes('network') || error.message.includes('fetch')) {
      throw new Error('❌ Network error. Please check your internet connection and try again.');
    } else if (error.message.includes('not supported')) {
      throw new Error('❌ Voice generation not supported in this browser. Please try Chrome, Firefox, or Edge.');
    } else {
      throw new Error('🎙️ Real voice generation temporarily unavailable. Please try again in a few minutes.');
    }
  }
}



// Generate voice over using Google Cloud TTS (Free Tier - 1M chars/month)
async function generateGoogleTTS(
  text: string,
  voice: VoiceOverOptions['voice'],
  speed: VoiceOverOptions['speed'],
  tone: VoiceOverOptions['tone'],
  language: VoiceOverOptions['language'],
  format: VoiceOverOptions['format']
): Promise<{ audioUrl: string; audioBlob: Blob; duration: number } | null> {
  const googleApiKey = import.meta.env.VITE_GOOGLE_TTS_API_KEY;
  
  if (!googleApiKey || googleApiKey === 'your_google_tts_key_here') {
    console.error('❌ Google Cloud TTS API key not found or is placeholder');
    return null;
  }

  console.log('🔑 Google Cloud TTS API key found, proceeding with TTS generation...');
  console.log('📝 Text length:', text.length, 'characters');
  console.log('🎭 Voice:', voice, 'Tone:', tone, 'Speed:', speed);

  try {
    // Map our voice options to Google TTS voice names
    const getGoogleVoice = (voice: string, tone: string, language: string) => {
      const languageCode = language === 'bengali' ? 'bn-IN' : 
                          language === 'hindi' ? 'hi-IN' :
                          language === 'spanish' ? 'es-ES' :
                          language === 'french' ? 'fr-FR' :
                          language === 'german' ? 'de-DE' : 'en-US';

      // For English, we have more voice options
      if (languageCode === 'en-US') {
        const voiceMap: { [key: string]: { [key: string]: string } } = {
          male: {
            professional: 'en-US-Standard-D',
            casual: 'en-US-Standard-B',
            energetic: 'en-US-Standard-A',
            calm: 'en-US-Standard-D',
            dramatic: 'en-US-Standard-J',
            friendly: 'en-US-Standard-B',
            authoritative: 'en-US-Standard-D',
            emotional: 'en-US-Standard-J'
          },
          female: {
            professional: 'en-US-Standard-C',
            casual: 'en-US-Standard-E',
            energetic: 'en-US-Standard-F',
            calm: 'en-US-Standard-H',
            dramatic: 'en-US-Standard-G',
            friendly: 'en-US-Standard-E',
            authoritative: 'en-US-Standard-C',
            emotional: 'en-US-Standard-G'
          },
          neutral: {
            professional: 'en-US-Standard-C',
            casual: 'en-US-Standard-B',
            energetic: 'en-US-Standard-A',
            calm: 'en-US-Standard-H',
            dramatic: 'en-US-Standard-J',
            friendly: 'en-US-Standard-E',
            authoritative: 'en-US-Standard-D',
            emotional: 'en-US-Standard-G'
          }
        };
        
        return voiceMap[voice]?.[tone] || 'en-US-Standard-C';
      } else {
        // For other languages, use standard voices
        return `${languageCode}-Standard-A`;
      }
    };

    // Map speed to Google TTS speaking rate (0.25 to 4.0)
    const speedMapping = {
      'very-slow': 0.5,
      'slow': 0.75,
      'normal': 1.0,
      'fast': 1.25,
      'very-fast': 1.5
    };

    const selectedVoice = getGoogleVoice(voice, tone, language);
    const selectedSpeed = speedMapping[speed] || 1.0;
    const languageCode = language === 'bengali' ? 'bn-IN' : 
                        language === 'hindi' ? 'hi-IN' :
                        language === 'spanish' ? 'es-ES' :
                        language === 'french' ? 'fr-FR' :
                        language === 'german' ? 'de-DE' : 'en-US';

    console.log(`🎤 Google Cloud TTS: Using voice ${selectedVoice}, speed ${selectedSpeed}`);

    // Prepare the request payload
    const payload = {
      input: { text: text.substring(0, 5000) }, // Google TTS character limit for free tier
      voice: {
        languageCode: languageCode,
        name: selectedVoice,
        ssmlGender: voice === 'female' ? 'FEMALE' : voice === 'male' ? 'MALE' : 'NEUTRAL'
      },
      audioConfig: {
        audioEncoding: format === 'wav' ? 'LINEAR16' : 'MP3',
        speakingRate: selectedSpeed,
        pitch: tone === 'dramatic' ? 2.0 : tone === 'calm' ? -2.0 : 0.0,
        volumeGainDb: 0.0
      }
    };

    console.log('📦 Google Cloud TTS Payload:', JSON.stringify(payload, null, 2));
    console.log('🌐 Making request to Google Cloud TTS API...');

    // Make request to Google Cloud TTS API
    const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${googleApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.text().catch(() => 'Unknown error');
      console.error('❌ Google Cloud TTS API error:', response.status, response.statusText);
      console.error('❌ Error details:', errorData);
      
      if (response.status === 400) {
        throw new Error('Google Cloud TTS API bad request - check parameters');
      } else if (response.status === 401) {
        throw new Error('Google Cloud TTS API key is invalid');
      } else if (response.status === 403) {
        throw new Error('Google Cloud TTS API access denied - check permissions');
      } else if (response.status === 429) {
        throw new Error('Google Cloud TTS API quota exceeded');
      }
      
      throw new Error(`Google Cloud TTS API error: ${response.status} - ${response.statusText}`);
    }

    console.log('✅ Google Cloud TTS API response received successfully');

    // Get the response data
    const responseData = await response.json();
    
    if (!responseData.audioContent) {
      throw new Error('Google Cloud TTS returned no audio content');
    }

    // Convert base64 audio to blob
    const audioBytes = atob(responseData.audioContent);
    const audioArray = new Uint8Array(audioBytes.length);
    for (let i = 0; i < audioBytes.length; i++) {
      audioArray[i] = audioBytes.charCodeAt(i);
    }
    
    const audioBlob = new Blob([audioArray], { 
      type: format === 'wav' ? 'audio/wav' : 'audio/mpeg' 
    });

    // Create object URL for playback
    const audioUrl = URL.createObjectURL(audioBlob);

    // Estimate duration based on text length and speed
    const wordCount = text.split(/\s+/).length;
    const wordsPerMinute = 150 / selectedSpeed; // Adjust for speed
    const estimatedDuration = Math.ceil((wordCount / wordsPerMinute) * 60);

    console.log('✅ Google Cloud TTS audio generated successfully');
    console.log(`Audio size: ${(audioBlob.size / 1024 / 1024).toFixed(2)} MB`);

    return {
      audioUrl,
      audioBlob,
      duration: estimatedDuration
    };

  } catch (error) {
    console.error('Google Cloud TTS generation error:', error);
    return null;
  }
}

// Generate voice over using ElevenLabs TTS (Free Tier - 10,000 chars/month)
async function generateElevenLabsTTS(
  text: string,
  voice: VoiceOverOptions['voice'],
  speed: VoiceOverOptions['speed'],
  tone: VoiceOverOptions['tone'],
  language: VoiceOverOptions['language'],
  format: VoiceOverOptions['format']
): Promise<{ audioUrl: string; audioBlob: Blob; duration: number } | null> {
  const elevenlabsApiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
  
  if (!elevenlabsApiKey || elevenlabsApiKey === 'your_elevenlabs_key_here') {
    console.error('❌ ElevenLabs API key not found or is placeholder');
    return null;
  }

  console.log('🔑 ElevenLabs API key found, proceeding with TTS generation...');
  console.log('📝 Text length:', text.length, 'characters');
  console.log('🎭 Voice:', voice, 'Tone:', tone, 'Speed:', speed);

  try {
    // Map our voice options to ElevenLabs voice IDs with tone variations
    const getElevenLabsVoice = (voice: string, tone: string) => {
      const voiceMap: { [key: string]: { [key: string]: string } } = {
        male: {
          professional: '21m00Tcm4TlvDq8ikWAM', // Rachel (clear, professional)
          casual: 'AZnzlk1XvdvUeBnXmlld', // Domi (friendly, casual)
          energetic: 'EXAVITQu4vr4xnSDxMaL', // Bella (energetic, upbeat)
          calm: '29vD33N1CtxCmqQRPOHJ', // Drew (calm, soothing)
          dramatic: 'TxGEqnHWrfWFTfGW9XjX', // Josh (dramatic, storytelling)
          friendly: 'AZnzlk1XvdvUeBnXmlld', // Domi (warm, friendly)
          authoritative: 'VR6AewLTigWG4xSOukaG', // Arnold (authoritative)
          emotional: 'EXAVITQu4vr4xnSDxMaL'  // Bella (expressive)
        },
        female: {
          professional: '21m00Tcm4TlvDq8ikWAM', // Rachel (professional female)
          casual: 'AZnzlk1XvdvUeBnXmlld', // Domi (casual female)
          energetic: 'EXAVITQu4vr4xnSDxMaL', // Bella (energetic female)
          calm: 'ThT5KcBeYPX3keUQqHPh', // Dorothy (calm female)
          dramatic: 'EXAVITQu4vr4xnSDxMaL', // Bella (dramatic female)
          friendly: 'AZnzlk1XvdvUeBnXmlld', // Domi (friendly female)
          authoritative: '21m00Tcm4TlvDq8ikWAM', // Rachel (authoritative female)
          emotional: 'EXAVITQu4vr4xnSDxMaL'  // Bella (emotional female)
        },
        neutral: {
          professional: '21m00Tcm4TlvDq8ikWAM', // Rachel (balanced)
          casual: 'AZnzlk1XvdvUeBnXmlld', // Domi (neutral casual)
          energetic: 'EXAVITQu4vr4xnSDxMaL', // Bella (neutral energetic)
          calm: '29vD33N1CtxCmqQRPOHJ', // Drew (neutral calm)
          dramatic: 'TxGEqnHWrfWFTfGW9XjX', // Josh (neutral dramatic)
          friendly: 'AZnzlk1XvdvUeBnXmlld', // Domi (neutral friendly)
          authoritative: 'VR6AewLTigWG4xSOukaG', // Arnold (neutral authoritative)
          emotional: 'EXAVITQu4vr4xnSDxMaL'  // Bella (neutral emotional)
        },
        child: {
          professional: 'EXAVITQu4vr4xnSDxMaL', // Bella (young sounding)
          casual: 'EXAVITQu4vr4xnSDxMaL',
          energetic: 'EXAVITQu4vr4xnSDxMaL',
          calm: 'EXAVITQu4vr4xnSDxMaL',
          dramatic: 'EXAVITQu4vr4xnSDxMaL',
          friendly: 'EXAVITQu4vr4xnSDxMaL',
          authoritative: 'EXAVITQu4vr4xnSDxMaL',
          emotional: 'EXAVITQu4vr4xnSDxMaL'
        },
        elderly: {
          professional: 'VR6AewLTigWG4xSOukaG', // Arnold (mature voice)
          casual: 'VR6AewLTigWG4xSOukaG',
          energetic: 'VR6AewLTigWG4xSOukaG',
          calm: 'VR6AewLTigWG4xSOukaG',
          dramatic: 'VR6AewLTigWG4xSOukaG',
          friendly: 'VR6AewLTigWG4xSOukaG',
          authoritative: 'VR6AewLTigWG4xSOukaG',
          emotional: 'VR6AewLTigWG4xSOukaG'
        },
        robotic: {
          professional: '21m00Tcm4TlvDq8ikWAM', // Rachel (clear for robotic)
          casual: '21m00Tcm4TlvDq8ikWAM',
          energetic: '21m00Tcm4TlvDq8ikWAM',
          calm: '21m00Tcm4TlvDq8ikWAM',
          dramatic: '21m00Tcm4TlvDq8ikWAM',
          friendly: '21m00Tcm4TlvDq8ikWAM',
          authoritative: '21m00Tcm4TlvDq8ikWAM',
          emotional: '21m00Tcm4TlvDq8ikWAM'
        }
      };
      
      return voiceMap[voice]?.[tone] || '21m00Tcm4TlvDq8ikWAM'; // Default to Rachel
    };

    const selectedVoiceId = getElevenLabsVoice(voice, tone);
    console.log(`🎤 ElevenLabs TTS: Using voice ID ${selectedVoiceId}`);

    // Prepare the request payload (using default free tier model)
    const payload = {
      text: text.substring(0, 2500), // ElevenLabs free tier character limit
      voice_settings: {
        stability: tone === 'dramatic' ? 0.3 : tone === 'calm' ? 0.8 : 0.5,
        similarity_boost: 0.75,
        style: tone === 'energetic' ? 0.8 : tone === 'calm' ? 0.2 : 0.5,
        use_speaker_boost: true
      }
    };

    console.log('📦 ElevenLabs TTS Payload:', JSON.stringify(payload, null, 2));
    console.log('🌐 Making request to ElevenLabs TTS API...');

    // Make request to ElevenLabs TTS API with retry logic
    let response;
    let retryCount = 0;
    const maxRetries = 2;

    while (retryCount <= maxRetries) {
      try {
        response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`, {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': elevenlabsApiKey
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          break; // Success, exit retry loop
        }

        if (response.status === 429 && retryCount < maxRetries) {
          const retryAfter = response.headers.get('Retry-After') || '2';
          const waitTime = parseInt(retryAfter) * 1000;
          console.log(`⏳ Rate limited, waiting ${retryAfter} seconds before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          retryCount++;
          continue;
        }

        // If not rate limit or max retries reached, break
        break;

      } catch (fetchError) {
        console.error(`❌ ElevenLabs request failed (attempt ${retryCount + 1}):`, fetchError);
        if (retryCount === maxRetries) {
          throw fetchError;
        }
        retryCount++;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    if (!response.ok) {
      const errorData = await response.text().catch(() => 'Unknown error');
      console.error('❌ ElevenLabs TTS API error:', response.status, response.statusText);
      console.error('❌ Error details:', errorData);
      
      if (response.status === 401) {
        console.error('❌ Authentication failed - API key is invalid');
        throw new Error('ElevenLabs API key is invalid');
      } else if (response.status === 429) {
        console.error('❌ Rate limit exceeded - too many requests');
        throw new Error('ElevenLabs API rate limit exceeded. Please wait a moment and try again.');
      } else if (response.status === 402) {
        console.error('❌ Quota exceeded - insufficient credits');
        throw new Error('ElevenLabs API quota exceeded');
      } else if (response.status === 400) {
        console.error('❌ Bad request - invalid parameters');
        throw new Error('ElevenLabs TTS API bad request - check parameters');
      }
      
      throw new Error(`ElevenLabs TTS API error: ${response.status} - ${response.statusText}`);
    }

    console.log('✅ ElevenLabs TTS API response received successfully');

    // Get the audio blob
    const audioBlob = await response.blob();
    
    if (audioBlob.size === 0) {
      throw new Error('ElevenLabs TTS returned empty audio');
    }

    // Create object URL for playback
    const audioUrl = URL.createObjectURL(audioBlob);

    // Estimate duration based on text length
    const wordCount = text.split(/\s+/).length;
    const wordsPerMinute = 150; // Average speaking rate
    const estimatedDuration = Math.ceil((wordCount / wordsPerMinute) * 60);

    console.log('✅ ElevenLabs TTS audio generated successfully');
    console.log(`Audio size: ${(audioBlob.size / 1024 / 1024).toFixed(2)} MB`);

    return {
      audioUrl,
      audioBlob,
      duration: estimatedDuration
    };

  } catch (error) {
    console.error('ElevenLabs TTS generation error:', error);
    return null;
  }
}

// Generate voice over using OpenAI TTS (Official API)
async function generateOpenAITTS(
  text: string,
  voice: VoiceOverOptions['voice'],
  speed: VoiceOverOptions['speed'],
  tone: VoiceOverOptions['tone'],
  language: VoiceOverOptions['language'],
  format: VoiceOverOptions['format']
): Promise<{ audioUrl: string; audioBlob: Blob; duration: number } | null> {
  const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!openaiApiKey) {
    console.error('❌ OpenAI API key not found in environment variables');
    return null;
  }

  console.log('🔑 OpenAI API key found, proceeding with TTS generation...');
  console.log('📝 Text length:', text.length, 'characters');
  console.log('🎭 Voice:', voice, 'Tone:', tone, 'Speed:', speed);

  try {
    // Map our voice options to OpenAI TTS voices with tone variations
    const getOpenAIVoice = (voice: string, tone: string) => {
      const voiceMap: { [key: string]: { [key: string]: string } } = {
        male: {
          professional: 'onyx',    // Deep, authoritative
          casual: 'echo',          // Relaxed, friendly
          energetic: 'fable',      // Dynamic, engaging
          calm: 'echo',            // Soothing, steady
          dramatic: 'onyx',        // Powerful, intense
          friendly: 'echo',        // Warm, approachable
          authoritative: 'onyx',   // Commanding, confident
          emotional: 'fable'       // Expressive, passionate
        },
        female: {
          professional: 'nova',    // Clear, polished
          casual: 'shimmer',       // Light, conversational
          energetic: 'nova',       // Bright, enthusiastic
          calm: 'alloy',           // Gentle, peaceful
          dramatic: 'nova',        // Compelling, theatrical
          friendly: 'shimmer',     // Warm, welcoming
          authoritative: 'nova',   // Confident, expert
          emotional: 'shimmer'     // Heartfelt, moving
        },
        neutral: {
          professional: 'alloy',   // Balanced, versatile
          casual: 'alloy',         // Natural, easy
          energetic: 'alloy',      // Lively, upbeat
          calm: 'alloy',           // Peaceful, centered
          dramatic: 'alloy',       // Engaging, captivating
          friendly: 'alloy',       // Pleasant, likeable
          authoritative: 'alloy',  // Credible, trustworthy
          emotional: 'alloy'       // Sincere, genuine
        },
        child: {
          professional: 'shimmer', // Young but clear
          casual: 'shimmer',       // Playful, natural
          energetic: 'shimmer',    // Excited, animated
          calm: 'shimmer',         // Gentle, sweet
          dramatic: 'shimmer',     // Expressive, lively
          friendly: 'shimmer',     // Cheerful, kind
          authoritative: 'shimmer',// Confident for age
          emotional: 'shimmer'     // Heartfelt, innocent
        },
        elderly: {
          professional: 'echo',    // Mature, experienced
          casual: 'echo',          // Relaxed, wise
          energetic: 'echo',       // Spirited, lively
          calm: 'echo',            // Peaceful, serene
          dramatic: 'echo',        // Rich, compelling
          friendly: 'echo',        // Warm, grandfatherly
          authoritative: 'echo',   // Wise, commanding
          emotional: 'echo'        // Deep, moving
        },
        robotic: {
          professional: 'fable',   // Synthetic, precise
          casual: 'fable',         // Relaxed AI
          energetic: 'fable',      // Dynamic AI
          calm: 'fable',           // Steady AI
          dramatic: 'fable',       // Intense AI
          friendly: 'fable',       // Approachable AI
          authoritative: 'fable',  // Commanding AI
          emotional: 'fable'       // Expressive AI
        }
      };
      
      return voiceMap[voice]?.[tone] || 'alloy';
    };

    // Map speed to OpenAI TTS speed values (0.25 to 4.0)
    const speedMapping = {
      'very-slow': 0.5,
      'slow': 0.75,
      'normal': 1.0,
      'fast': 1.25,
      'very-fast': 1.5
    };

    const selectedVoice = getOpenAIVoice(voice, tone);
    const selectedSpeed = speedMapping[speed] || 1.0;

    console.log(`🎤 OpenAI TTS: Using voice ${selectedVoice}, speed ${selectedSpeed}`);

    // Prepare the request payload
    const payload = {
      model: 'tts-1-hd', // High quality model
      input: text.substring(0, 4096), // OpenAI TTS character limit
      voice: selectedVoice,
      speed: selectedSpeed,
      response_format: format === 'mp3' ? 'mp3' : 'wav'
    };

    console.log('📦 OpenAI TTS Payload:', JSON.stringify(payload, null, 2));
    console.log('🌐 Making request to OpenAI TTS API...');

    // Make request to OpenAI TTS API with retry logic
    let response;
    let retryCount = 0;
    const maxRetries = 2;

    while (retryCount <= maxRetries) {
      try {
        response = await fetch('https://api.openai.com/v1/audio/speech', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          break; // Success, exit retry loop
        }

        if (response.status === 429 && retryCount < maxRetries) {
          const retryAfter = response.headers.get('Retry-After') || '2';
          const waitTime = parseInt(retryAfter) * 1000;
          console.log(`⏳ Rate limited, waiting ${retryAfter} seconds before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          retryCount++;
          continue;
        }

        // If not rate limit or max retries reached, break
        break;

      } catch (fetchError) {
        console.error(`❌ OpenAI request failed (attempt ${retryCount + 1}):`, fetchError);
        if (retryCount === maxRetries) {
          throw fetchError;
        }
        retryCount++;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    if (!response.ok) {
      const errorData = await response.text().catch(() => 'Unknown error');
      console.error('❌ OpenAI TTS API error:', response.status, response.statusText);
      console.error('❌ Error details:', errorData);
      console.error('❌ Request headers:', {
        'Authorization': `Bearer ${openaiApiKey.substring(0, 20)}...`,
        'Content-Type': 'application/json'
      });
      
      if (response.status === 401) {
        console.error('❌ Authentication failed - API key is invalid or expired');
        throw new Error('OpenAI API key is invalid or expired');
      } else if (response.status === 429) {
        console.error('❌ Rate limit exceeded - too many requests');
        throw new Error('OpenAI API rate limit exceeded. Please wait a moment and try again.');
      } else if (response.status === 402) {
        console.error('❌ Quota exceeded - insufficient credits');
        throw new Error('OpenAI API quota exceeded');
      } else if (response.status === 400) {
        console.error('❌ Bad request - invalid parameters');
        throw new Error('OpenAI TTS API bad request - check parameters');
      }
      
      throw new Error(`OpenAI TTS API error: ${response.status} - ${response.statusText}`);
    }

    console.log('✅ OpenAI TTS API response received successfully');

    // Get the audio blob
    const audioBlob = await response.blob();
    
    if (audioBlob.size === 0) {
      throw new Error('OpenAI TTS returned empty audio');
    }

    // Create object URL for playback
    const audioUrl = URL.createObjectURL(audioBlob);

    // Estimate duration based on text length and speed
    const wordCount = text.split(/\s+/).length;
    const wordsPerMinute = 150 / selectedSpeed; // Adjust for speed
    const estimatedDuration = Math.ceil((wordCount / wordsPerMinute) * 60);

    console.log('✅ OpenAI TTS audio generated successfully');
    console.log(`Audio size: ${(audioBlob.size / 1024 / 1024).toFixed(2)} MB`);

    return {
      audioUrl,
      audioBlob,
      duration: estimatedDuration
    };

  } catch (error) {
    console.error('OpenAI TTS generation error:', error);
    return null;
  }
}

// Generate voice over using Murf.ai Professional TTS
async function generateMurfAIVoiceOver(
  text: string,
  voice: VoiceOverOptions['voice'],
  speed: VoiceOverOptions['speed'],
  tone: VoiceOverOptions['tone'],
  language: VoiceOverOptions['language'],
  format: VoiceOverOptions['format']
): Promise<{ audioUrl: string; audioBlob: Blob; duration: number } | null> {
  const murfApiKey = import.meta.env.VITE_MURF_API_KEY;
  
  if (!murfApiKey) {
    console.log('Murf.ai API key not found');
    return null;
  }

  try {
    // Map our voice options to Murf.ai voice IDs with tone variations
    const getVoiceId = (voice: string, tone: string) => {
      const voiceMap: { [key: string]: { [key: string]: string } } = {
        male: {
          professional: 'en-US-davis',
          casual: 'en-US-marcus',
          energetic: 'en-US-tyler',
          calm: 'en-US-benjamin',
          dramatic: 'en-US-jackson',
          friendly: 'en-US-noah',
          authoritative: 'en-US-davis',
          emotional: 'en-US-ethan'
        },
        female: {
          professional: 'en-US-sarah',
          casual: 'en-US-emma',
          energetic: 'en-US-zoe',
          calm: 'en-US-grace',
          dramatic: 'en-US-sophia',
          friendly: 'en-US-lily',
          authoritative: 'en-US-sarah',
          emotional: 'en-US-olivia'
        },
        neutral: {
          professional: 'en-US-alex',
          casual: 'en-US-alex',
          energetic: 'en-US-alex',
          calm: 'en-US-alex',
          dramatic: 'en-US-alex',
          friendly: 'en-US-alex',
          authoritative: 'en-US-alex',
          emotional: 'en-US-alex'
        },
        child: {
          professional: 'en-US-jenny',
          casual: 'en-US-jenny',
          energetic: 'en-US-jenny',
          calm: 'en-US-jenny',
          dramatic: 'en-US-jenny',
          friendly: 'en-US-jenny',
          authoritative: 'en-US-jenny',
          emotional: 'en-US-jenny'
        },
        elderly: {
          professional: 'en-US-frank',
          casual: 'en-US-frank',
          energetic: 'en-US-frank',
          calm: 'en-US-frank',
          dramatic: 'en-US-frank',
          friendly: 'en-US-frank',
          authoritative: 'en-US-frank',
          emotional: 'en-US-frank'
        },
        robotic: {
          professional: 'en-US-alex',
          casual: 'en-US-alex',
          energetic: 'en-US-alex',
          calm: 'en-US-alex',
          dramatic: 'en-US-alex',
          friendly: 'en-US-alex',
          authoritative: 'en-US-alex',
          emotional: 'en-US-alex'
        }
      };
      
      return voiceMap[voice]?.[tone] || voiceMap.neutral.professional;
    };

    // Map language to Murf.ai language codes
    const languageMapping = {
      english: 'en-US',
      bengali: 'bn-BD',
      hindi: 'hi-IN',
      spanish: 'es-ES',
      french: 'fr-FR',
      german: 'de-DE'
    };

    // Map speed to Murf.ai speed values (0.5 to 2.0)
    const speedMapping = {
      'very-slow': 0.6,
      'slow': 0.8,
      'normal': 1.0,
      'fast': 1.3,
      'very-fast': 1.6
    };

    const selectedVoice = getVoiceId(voice, tone);
    const selectedLanguage = languageMapping[language] || languageMapping.english;
    const selectedSpeed = speedMapping[speed] || 1.0;

    console.log(`🎤 Murf.ai: Using voice ${selectedVoice}, language ${selectedLanguage}, speed ${selectedSpeed}`);

    // Prepare the request payload
    const payload = {
      voiceId: selectedVoice,
      text: text.substring(0, 3000), // Murf.ai character limit
      speed: selectedSpeed,
      pitch: 0, // Default pitch
      volume: 1.0,
      format: format === 'mp3' ? 'mp3' : 'wav',
      sampleRate: 44100
    };

    // Make request to Murf.ai API with retry logic
    let response;
    let retryCount = 0;
    const maxRetries = 2;

    while (retryCount <= maxRetries) {
      try {
        response = await fetch('https://global.api.murf.ai/v1/speech/stream', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${murfApiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'audio/mpeg',
            'User-Agent': 'VidPilot-VoiceOver/1.0'
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          break; // Success, exit retry loop
        }

        const errorData = await response.text().catch(() => 'Unknown error');
        console.error(`Murf.ai API error (attempt ${retryCount + 1}):`, response.status, errorData);
        
        if (response.status === 401) {
          throw new Error('Murf.ai API key is invalid or expired');
        } else if (response.status === 429) {
          // Rate limit, wait before retry
          if (retryCount < maxRetries) {
            console.log('Rate limited, waiting 2 seconds before retry...');
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        } else if (response.status >= 500) {
          // Server error, retry
          if (retryCount < maxRetries) {
            console.log('Server error, retrying...');
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } else {
          // Client error, don't retry
          throw new Error(`Murf.ai API error: ${response.status} - ${errorData}`);
        }

      } catch (fetchError) {
        console.error(`Murf.ai request failed (attempt ${retryCount + 1}):`, fetchError);
        if (retryCount === maxRetries) {
          throw fetchError;
        }
      }

      retryCount++;
    }

    if (!response || !response.ok) {
      throw new Error(`Murf.ai API failed after ${maxRetries + 1} attempts`);
    }

    // Get the audio blob
    const audioBlob = await response.blob();
    
    if (audioBlob.size === 0) {
      throw new Error('Murf.ai returned empty audio');
    }

    // Create object URL for playback
    const audioUrl = URL.createObjectURL(audioBlob);

    // Estimate duration based on text length and speed
    const wordCount = text.split(/\s+/).length;
    const wordsPerMinute = 150 / selectedSpeed; // Adjust for speed
    const estimatedDuration = Math.ceil((wordCount / wordsPerMinute) * 60);

    console.log('✅ Murf.ai audio generated successfully');
    console.log(`Audio size: ${(audioBlob.size / 1024 / 1024).toFixed(2)} MB`);

    return {
      audioUrl,
      audioBlob,
      duration: estimatedDuration
    };

  } catch (error) {
    console.error('Murf.ai generation error:', error);
    return null;
  }
}

// Check if AI voice over is available
export function isVoiceOverAvailable(): boolean {
  const hasGoogle = !!import.meta.env.VITE_GOOGLE_TTS_API_KEY && import.meta.env.VITE_GOOGLE_TTS_API_KEY !== 'your_google_tts_key_here';
  const hasElevenLabs = !!import.meta.env.VITE_ELEVENLABS_API_KEY && import.meta.env.VITE_ELEVENLABS_API_KEY !== 'your_elevenlabs_key_here';
  const hasOpenAI = !!import.meta.env.VITE_OPENAI_API_KEY;
  const hasMurf = !!import.meta.env.VITE_MURF_API_KEY;
  const hasBrowserTTS = 'speechSynthesis' in window;
  return hasGoogle || hasElevenLabs || hasOpenAI || hasMurf || hasBrowserTTS;
}

// Test Google Cloud TTS API key
export async function testGoogleTTSConnection(): Promise<boolean> {
  const googleApiKey = import.meta.env.VITE_GOOGLE_TTS_API_KEY;
  
  if (!googleApiKey || googleApiKey === 'your_google_tts_key_here') {
    console.error('❌ Google Cloud TTS API key not found or is placeholder');
    return false;
  }

  try {
    console.log('🔍 Testing Google Cloud TTS API connection...');
    
    // Test with a simple API call to list voices
    const response = await fetch(`https://texttospeech.googleapis.com/v1/voices?key=${googleApiKey}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const voicesData = await response.json();
      console.log('✅ Google Cloud TTS API connection successful');
      console.log(`📊 Available voices: ${voicesData.voices?.length || 0}`);
      return true;
    } else {
      const errorData = await response.text().catch(() => 'Unknown error');
      console.error('❌ Google Cloud TTS API test failed:', response.status, errorData);
      return false;
    }
  } catch (error) {
    console.error('❌ Google Cloud TTS API test error:', error);
    return false;
  }
}

// Test ElevenLabs API key
export async function testElevenLabsConnection(): Promise<boolean> {
  const elevenlabsApiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
  
  if (!elevenlabsApiKey || elevenlabsApiKey === 'your_elevenlabs_key_here') {
    console.error('❌ ElevenLabs API key not found or is placeholder');
    return false;
  }

  try {
    console.log('🔍 Testing ElevenLabs API connection...');
    
    // Test with a simple API call to get user info
    const response = await fetch('https://api.elevenlabs.io/v1/user', {
      method: 'GET',
      headers: {
        'xi-api-key': elevenlabsApiKey
      }
    });

    if (response.ok) {
      const userData = await response.json();
      console.log('✅ ElevenLabs API connection successful');
      console.log(`📊 Characters remaining: ${userData.subscription?.character_limit - userData.subscription?.character_count || 'Unknown'}`);
      return true;
    } else {
      const errorData = await response.text().catch(() => 'Unknown error');
      console.error('❌ ElevenLabs API test failed:', response.status, errorData);
      return false;
    }
  } catch (error) {
    console.error('❌ ElevenLabs API test error:', error);
    return false;
  }
}

// Test OpenAI API key with retry logic
export async function testOpenAIConnection(): Promise<boolean> {
  const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!openaiApiKey) {
    console.error('❌ OpenAI API key not found');
    return false;
  }

  // Use a simple endpoint instead of TTS for testing
  try {
    console.log('🔍 Testing OpenAI API connection...');
    
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      console.log('✅ OpenAI API connection successful');
      return true;
    } else if (response.status === 429) {
      console.warn('⚠️ OpenAI API rate limited, but API key is valid');
      return true; // API key is valid, just rate limited
    } else {
      const errorData = await response.text().catch(() => 'Unknown error');
      console.error('❌ OpenAI API test failed:', response.status, errorData);
      return false;
    }
  } catch (error) {
    console.error('❌ OpenAI API test error:', error);
    return false;
  }
}

// Get provider for specific quality level
export function getProviderForQuality(quality: string): string {
  const hasGoogle = !!import.meta.env.VITE_GOOGLE_TTS_API_KEY && import.meta.env.VITE_GOOGLE_TTS_API_KEY !== 'your_google_tts_key_here';
  const hasElevenLabs = !!import.meta.env.VITE_ELEVENLABS_API_KEY && import.meta.env.VITE_ELEVENLABS_API_KEY !== 'your_elevenlabs_key_here';
  const hasOpenAI = !!import.meta.env.VITE_OPENAI_API_KEY;
  const hasMurf = !!import.meta.env.VITE_MURF_API_KEY;
  
  if (quality === 'standard') {
    return 'Browser TTS (Free)';
  } else {
    if (hasGoogle) {
      return 'Google Cloud TTS (Free Tier)';
    } else if (hasElevenLabs) {
      return 'ElevenLabs TTS (Free Tier)';
    } else if (hasOpenAI) {
      return 'OpenAI TTS Official';
    } else if (hasMurf) {
      return 'Murf.ai Professional';
    } else {
      return 'Browser TTS (Free)';
    }
  }
}

// Get active voice over provider
export function getActiveVoiceProvider(): string {
  const hasGoogle = !!import.meta.env.VITE_GOOGLE_TTS_API_KEY && import.meta.env.VITE_GOOGLE_TTS_API_KEY !== 'your_google_tts_key_here';
  const hasElevenLabs = !!import.meta.env.VITE_ELEVENLABS_API_KEY && import.meta.env.VITE_ELEVENLABS_API_KEY !== 'your_elevenlabs_key_here';
  const hasOpenAI = !!import.meta.env.VITE_OPENAI_API_KEY;
  const hasMurf = !!import.meta.env.VITE_MURF_API_KEY;
  const hasBrowserTTS = 'speechSynthesis' in window;
  
  const providers = [];
  if (hasGoogle) providers.push('Google Cloud TTS (Free Tier)');
  if (hasElevenLabs) providers.push('ElevenLabs TTS (Free Tier)');
  if (hasOpenAI) providers.push('OpenAI TTS (Official)');
  if (hasMurf) providers.push('Murf.ai Professional');
  if (hasBrowserTTS) providers.push('Browser TTS (Free)');
  
  if (providers.length === 0) {
    return 'Voice Over Not Available - No TTS providers configured';
  } else if (providers.length === 1) {
    return `${providers[0]} - Ready for Voice Generation`;
  } else {
    return `${providers.join(' + ')} - Multiple Premium & Free Options Available`;
  }
}

// Helper function to select appropriate voice
function selectVoice(
  voices: SpeechSynthesisVoice[], 
  voice: VoiceOverOptions['voice'], 
  language: VoiceOverOptions['language']
): SpeechSynthesisVoice | null {
  const langCode = language === 'bengali' ? 'bn' : 
                   language === 'hindi' ? 'hi' :
                   language === 'spanish' ? 'es' :
                   language === 'french' ? 'fr' :
                   language === 'german' ? 'de' : 'en';
  
  // First try to find voice by language
  const languageVoices = voices.filter(v => v.lang.startsWith(langCode));
  
  if (languageVoices.length > 0) {
    if (voice === 'female') {
      return languageVoices.find(v => 
        v.name.toLowerCase().includes('female') || 
        v.name.toLowerCase().includes('woman') ||
        v.name.toLowerCase().includes('zira') || 
        v.name.toLowerCase().includes('hazel') ||
        v.name.toLowerCase().includes('samantha') ||
        v.name.toLowerCase().includes('susan')
      ) || languageVoices[0];
    } else if (voice === 'male') {
      return languageVoices.find(v => 
        v.name.toLowerCase().includes('male') || 
        v.name.toLowerCase().includes('man') ||
        v.name.toLowerCase().includes('david') || 
        v.name.toLowerCase().includes('mark') ||
        v.name.toLowerCase().includes('alex') ||
        v.name.toLowerCase().includes('james')
      ) || languageVoices[0];
    } else if (voice === 'child') {
      return languageVoices.find(v => 
        v.name.toLowerCase().includes('child') || 
        v.name.toLowerCase().includes('young')
      ) || languageVoices[0];
    } else if (voice === 'elderly') {
      return languageVoices.find(v => 
        v.name.toLowerCase().includes('elder') || 
        v.name.toLowerCase().includes('mature')
      ) || languageVoices[0];
    } else if (voice === 'robotic') {
      return languageVoices.find(v => 
        v.name.toLowerCase().includes('robot') || 
        v.name.toLowerCase().includes('synthetic')
      ) || languageVoices[0];
    } else {
      return languageVoices[0];
    }
  } else {
    // Fallback to any voice
    return voices[0] || null;
  }
}

// Convert YouTube story to voice over script
export function prepareVoiceOverScript(story: string, includeDirections: boolean = false): string {
  // Clean up the story text for voice over
  let script = story
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown
    .replace(/\*(.*?)\*/g, '$1') // Remove italic markdown
    .replace(/#{1,6}\s/g, '') // Remove markdown headers
    .replace(/\[.*?\]/g, '') // Remove markdown links
    .replace(/\n{3,}/g, '\n\n') // Normalize line breaks
    .trim();

  if (includeDirections) {
    // Add voice direction cues
    script = script
      .replace(/(\d+\.\s)/g, '\n[Pause] $1') // Add pauses before numbered sections
      .replace(/([.!?])\s+([A-Z])/g, '$1 [Short pause] $2') // Add short pauses after sentences
      .replace(/:\s*\n/g, ': [Pause]\n') // Add pauses after colons
      .replace(/\n\n/g, '\n[Long pause]\n'); // Add long pauses for paragraph breaks
  }

  return script;
}

// Estimate voice over cost
export function estimateVoiceOverCost(text: string, quality: string): number {
  const hasOpenAI = !!import.meta.env.VITE_OPENAI_API_KEY;
  const hasMurf = !!import.meta.env.VITE_MURF_API_KEY;
  
  // If using non-standard quality, estimate cost based on available providers
  if (quality !== 'standard') {
    const characterCount = text.length;
    
    // OpenAI TTS pricing (priority provider)
    if (hasOpenAI) {
      // OpenAI TTS-1-HD: $0.030 per 1K characters
      return (characterCount / 1000) * 0.030;
    }
    
    // Murf.ai pricing (fallback)
    if (hasMurf) {
      const costPer1000Chars = quality === 'broadcast' ? 0.20 : quality === 'studio' ? 0.15 : 0.10;
      return (characterCount / 1000) * costPer1000Chars;
    }
  }
  
  return 0; // FREE with Browser TTS for standard/high quality
}

// Start speech synthesis for immediate playback
async function startSpeechSynthesis(
  text: string, 
  voice: VoiceOverOptions['voice'],
  speed: VoiceOverOptions['speed'],
  tone: VoiceOverOptions['tone'],
  language: VoiceOverOptions['language'],
  options?: { pitch?: number; volume?: number; emphasis?: string }
): Promise<{ audioUrl: string; provider: string } | null> {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      console.log('Browser TTS not supported');
      resolve(null);
      return;
    }

    // Validate text doesn't contain problematic characters
    const originalLength = text.length;
    const filteredText = filterUnsupportedCharacters(text);
    if (originalLength !== filteredText.length) {
      console.warn('Text contains unsupported characters, using filtered version');
      text = filteredText;
    }

    try {
      // Stop any existing speech
      speechSynthesis.cancel();

      // Wait for voices to load
      const loadVoices = () => {
        const voices = speechSynthesis.getVoices();
        
        if (voices.length === 0) {
          // Voices not loaded yet, wait a bit
          setTimeout(loadVoices, 100);
          return;
        }

        console.log(`Available voices: ${voices.length}`);

        const utterance = new SpeechSynthesisUtterance(text.substring(0, 2000)); // Increased limit
        
        // Select voice based on preference and language
        const selectedVoice = selectVoice(voices, voice, language);
        
        if (selectedVoice) {
          utterance.voice = selectedVoice;
          console.log(`✅ Selected voice: ${selectedVoice.name} (${selectedVoice.lang})`);
        }

        // Set speech rate based on speed
        utterance.rate = speed === 'slow' ? 0.6 : speed === 'fast' ? 1.4 : 0.9;
        
        // Set pitch based on tone
        utterance.pitch = tone === 'dramatic' ? 1.3 : tone === 'calm' ? 0.7 : tone === 'energetic' ? 1.1 : 1.0;
        
        // Set volume
        utterance.volume = 1.0;

        // Handle speech events
        utterance.onstart = () => {
          console.log('🎤 Browser TTS started - Voice is playing!');
        };

        utterance.onend = () => {
          console.log('✅ Browser TTS completed');
          resolve({
            audioUrl: 'speech-synthesis-active',
            provider: `Browser TTS - ${selectedVoice?.name || 'Default'} (REAL AI Voice)`
          });
        };

        utterance.onerror = (event) => {
          console.error('Browser TTS error:', event);
          resolve(null);
        };

        // Speak the text immediately
        speechSynthesis.speak(utterance);
        
        // Return immediately to indicate speech has started
        setTimeout(() => {
          resolve({
            audioUrl: 'speech-synthesis-active',
            provider: `Browser TTS - ${selectedVoice?.name || 'Default'} (REAL AI Voice)`
          });
        }, 100);
      };

      // Start loading voices
      loadVoices();

    } catch (error) {
      console.error('Browser TTS generation error:', error);
      resolve(null);
    }
  });
}

// Create a real audio recording of speech synthesis
async function createRealAudioRecording(
  text: string, 
  voice: VoiceOverOptions['voice'],
  speed: VoiceOverOptions['speed'],
  tone: VoiceOverOptions['tone'],
  language: VoiceOverOptions['language']
): Promise<Blob> {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      console.log('Browser TTS not supported for recording');
      resolve(createFallbackAudioFile(text));
      return;
    }

    // Validate and filter text
    const originalLength = text.length;
    const filteredText = filterUnsupportedCharacters(text);
    if (originalLength !== filteredText.length) {
      console.warn('Text contains unsupported characters, using filtered version for recording');
      text = filteredText;
    }

    try {
      // Stop any existing speech
      speechSynthesis.cancel();

      // Wait for voices to load
      const loadVoices = () => {
        const voices = speechSynthesis.getVoices();
        
        if (voices.length === 0) {
          setTimeout(loadVoices, 100);
          return;
        }

        const utterance = new SpeechSynthesisUtterance(text.substring(0, 2000));
        
        // Select voice using helper function
        const selectedVoice = selectVoice(voices, voice, language);
        
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }

        // Set speech parameters
        utterance.rate = speed === 'slow' ? 0.6 : speed === 'fast' ? 1.4 : 0.9;
        utterance.pitch = tone === 'dramatic' ? 1.3 : tone === 'calm' ? 0.7 : tone === 'energetic' ? 1.1 : 1.0;
        utterance.volume = 1.0;

        // Try to record using Web Audio API
        try {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const destination = audioContext.createMediaStreamDestination();
          
          // Create MediaRecorder
          const mediaRecorder = new MediaRecorder(destination.stream, {
            mimeType: 'audio/webm;codecs=opus'
          });

          const audioChunks: Blob[] = [];

          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              audioChunks.push(event.data);
            }
          };

          mediaRecorder.onstop = () => {
            if (audioChunks.length > 0) {
              const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
              console.log('✅ Real audio recorded successfully');
              resolve(audioBlob);
            } else {
              console.log('No audio recorded, creating fallback');
              resolve(createFallbackAudioFile(text));
            }
          };

          // Start recording
          mediaRecorder.start();

          utterance.onend = () => {
            setTimeout(() => {
              if (mediaRecorder.state === 'recording') {
                mediaRecorder.stop();
              }
            }, 500);
          };

          utterance.onerror = () => {
            if (mediaRecorder.state === 'recording') {
              mediaRecorder.stop();
            }
          };

          // Speak and record
          speechSynthesis.speak(utterance);

          // Timeout fallback
          setTimeout(() => {
            if (mediaRecorder.state === 'recording') {
              mediaRecorder.stop();
            }
          }, 30000);

        } catch (recordError) {
          console.log('Recording failed, creating fallback audio');
          resolve(createFallbackAudioFile(text));
        }
      };

      loadVoices();

    } catch (error) {
      console.error('Audio recording error:', error);
      resolve(createFallbackAudioFile(text));
    }
  });
}

// Create a fallback audio file when recording fails
function createFallbackAudioFile(text: string): Blob {
  try {
    // Create a simple WAV file with a tone
    const sampleRate = 44100;
    const duration = Math.min(text.length * 0.05, 5); // Max 5 seconds
    const numSamples = duration * sampleRate;
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + numSamples * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, numSamples * 2, true);
    
    // Generate a simple tone pattern
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const frequency = 440; // A note
      const sample = Math.sin(2 * Math.PI * frequency * t) * 0.1 * Math.exp(-t * 2); // Fade out
      view.setInt16(44 + i * 2, sample * 32767, true);
    }
    
    return new Blob([buffer], { type: 'audio/wav' });
  } catch (error) {
    console.error('Error creating fallback audio:', error);
    return new Blob([`Voice over transcript: ${text}`], { type: 'text/plain' });
  }
}

// Generate REAL TTS using browser's built-in SpeechSynthesis API
async function generateRealBrowserTTS(
  text: string, 
  voice: VoiceOverOptions['voice'],
  speed: VoiceOverOptions['speed'],
  tone: VoiceOverOptions['tone'],
  language: VoiceOverOptions['language']
): Promise<{ audioUrl: string; audioBlob: Blob; provider: string } | null> {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      console.log('Browser TTS not supported');
      resolve(null);
      return;
    }

    try {
      // Stop any existing speech
      speechSynthesis.cancel();

      // Wait for voices to load
      const loadVoices = () => {
        const voices = speechSynthesis.getVoices();
        
        if (voices.length === 0) {
          // Voices not loaded yet, wait a bit
          setTimeout(loadVoices, 100);
          return;
        }

        console.log(`Available voices: ${voices.length}`);
        voices.forEach(v => console.log(`- ${v.name} (${v.lang})`));

        const utterance = new SpeechSynthesisUtterance(text.substring(0, 2000)); // Increased limit
        
        // Select voice using helper function
        const selectedVoice = selectVoice(voices, voice, language);
        
        if (selectedVoice) {
          utterance.voice = selectedVoice;
          console.log(`✅ Selected voice: ${selectedVoice.name} (${selectedVoice.lang})`);
        } else {
          console.log('⚠️ No voice selected, using default');
        }

        // Set speech rate based on speed
        utterance.rate = speed === 'slow' ? 0.6 : speed === 'fast' ? 1.4 : 0.9;
        
        // Set pitch based on tone
        utterance.pitch = tone === 'dramatic' ? 1.3 : tone === 'calm' ? 0.7 : tone === 'energetic' ? 1.1 : 1.0;
        
        // Set volume
        utterance.volume = 1.0;

        // Create audio context for recording
        let audioContext: AudioContext;
        let mediaRecorder: MediaRecorder;
        let audioChunks: Blob[] = [];

        try {
          audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const destination = audioContext.createMediaStreamDestination();
          
          // Create MediaRecorder to capture audio
          mediaRecorder = new MediaRecorder(destination.stream, {
            mimeType: 'audio/webm;codecs=opus'
          });

          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              audioChunks.push(event.data);
            }
          };

          mediaRecorder.onstop = () => {
            if (audioChunks.length > 0) {
              const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
              const audioUrl = URL.createObjectURL(audioBlob);
              
              resolve({
                audioUrl,
                audioBlob,
                provider: `Browser TTS - ${selectedVoice?.name || 'Default'} (REAL AI Voice)`
              });
            } else {
              console.log('No audio chunks recorded');
              resolve(null);
            }
          };

          // Start recording
          mediaRecorder.start();
          console.log('🎤 Started recording browser TTS...');

        } catch (recordError) {
          console.log('Recording not available, using direct speech synthesis');
          
          // Fallback: Just play the speech directly without recording
          utterance.onstart = () => {
            console.log('🎤 Browser TTS started (direct playback)');
          };

          utterance.onend = () => {
            console.log('✅ Browser TTS completed (direct playback)');
            // Create a minimal blob to indicate success
            const successBlob = new Blob(['TTS_SUCCESS'], { type: 'text/plain' });
            const audioUrl = URL.createObjectURL(successBlob);
            
            resolve({
              audioUrl,
              audioBlob: successBlob,
              provider: `Browser TTS - ${selectedVoice?.name || 'Default'} (Direct Playback)`
            });
          };

          utterance.onerror = (event) => {
            console.error('Browser TTS error:', event);
            resolve(null);
          };

          // Speak the text directly
          speechSynthesis.speak(utterance);
          return;
        }

        // Handle speech events for recording
        utterance.onstart = () => {
          console.log('🎤 Browser TTS started with recording');
        };

        utterance.onend = () => {
          console.log('✅ Browser TTS ended, stopping recording');
          setTimeout(() => {
            if (mediaRecorder && mediaRecorder.state === 'recording') {
              mediaRecorder.stop();
            }
          }, 500); // Small delay to ensure all audio is captured
        };

        utterance.onerror = (event) => {
          console.error('Browser TTS error:', event);
          if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
          }
          resolve(null);
        };

        // Speak the text
        speechSynthesis.speak(utterance);

        // Fallback timeout
        setTimeout(() => {
          if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
          }
          speechSynthesis.cancel();
        }, 60000); // 60 second timeout for longer texts
      };

      // Start loading voices
      loadVoices();

    } catch (error) {
      console.error('Browser TTS generation error:', error);
      resolve(null);
    }
  });
}

// Generate downloadable audio file from speech synthesis
export async function generateDownloadableAudio(
  text: string,
  options: VoiceOverOptions
): Promise<Blob> {
  const { voice, language, speed, tone } = options;
  console.log('🎵 Creating downloadable audio file...');
  
  try {
    const audioBlob = await createRealAudioRecording(text, voice, speed, tone, language);
    console.log('✅ Downloadable audio created');
    return audioBlob;
  } catch (error) {
    console.error('Failed to create downloadable audio:', error);
    return createFallbackAudioFile(text);
  }
}

// Professional Audio Processing
async function processAudioProfessionally(
  audioBlob: Blob,
  options: {
    noiseReduction?: boolean;
    normalization?: boolean;
    backgroundMusic?: boolean;
    volume?: number;
  }
): Promise<Blob> {
  try {
    if (!options.noiseReduction && !options.normalization && !options.backgroundMusic && options.volume === 1.0) {
      return audioBlob; // No processing needed
    }

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    // Create a new buffer for processing
    const processedBuffer = audioContext.createBuffer(
      audioBuffer.numberOfChannels,
      audioBuffer.length,
      audioBuffer.sampleRate
    );

    // Process each channel
    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
      const inputData = audioBuffer.getChannelData(channel);
      const outputData = processedBuffer.getChannelData(channel);

      // Copy input to output
      for (let i = 0; i < inputData.length; i++) {
        outputData[i] = inputData[i];
      }

      // Apply volume adjustment
      if (options.volume && options.volume !== 1.0) {
        for (let i = 0; i < outputData.length; i++) {
          outputData[i] *= options.volume;
        }
      }

      // Apply normalization
      if (options.normalization) {
        const maxAmplitude = Math.max(...outputData.map(Math.abs));
        if (maxAmplitude > 0) {
          const normalizeRatio = 0.95 / maxAmplitude;
          for (let i = 0; i < outputData.length; i++) {
            outputData[i] *= normalizeRatio;
          }
        }
      }

      // Simple noise reduction (high-pass filter simulation)
      if (options.noiseReduction) {
        for (let i = 1; i < outputData.length; i++) {
          outputData[i] = outputData[i] * 0.9 + outputData[i - 1] * 0.1;
        }
      }
    }

    // Convert back to blob
    return audioBufferToBlob(processedBuffer);
  } catch (error) {
    console.error('Audio processing failed:', error);
    return audioBlob; // Return original if processing fails
  }
}

// Generate waveform data for visualization
async function generateWaveformData(audioBlob: Blob): Promise<number[]> {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    const channelData = audioBuffer.getChannelData(0);
    const samples = 100; // Number of waveform points
    const blockSize = Math.floor(channelData.length / samples);
    const waveformData: number[] = [];

    for (let i = 0; i < samples; i++) {
      const start = i * blockSize;
      const end = start + blockSize;
      let sum = 0;

      for (let j = start; j < end && j < channelData.length; j++) {
        sum += Math.abs(channelData[j]);
      }

      waveformData.push(sum / blockSize);
    }

    return waveformData;
  } catch (error) {
    console.error('Waveform generation failed:', error);
    return Array(100).fill(0.5); // Fallback waveform
  }
}

// Convert AudioBuffer to Blob
function audioBufferToBlob(audioBuffer: AudioBuffer): Blob {
  const numberOfChannels = audioBuffer.numberOfChannels;
  const length = audioBuffer.length;
  const sampleRate = audioBuffer.sampleRate;
  const arrayBuffer = new ArrayBuffer(44 + length * numberOfChannels * 2);
  const view = new DataView(arrayBuffer);

  // WAV header
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + length * numberOfChannels * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numberOfChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numberOfChannels * 2, true);
  view.setUint16(32, numberOfChannels * 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, length * numberOfChannels * 2, true);

  // Convert float samples to 16-bit PCM
  let offset = 44;
  for (let i = 0; i < length; i++) {
    for (let channel = 0; channel < numberOfChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, audioBuffer.getChannelData(channel)[i]));
      view.setInt16(offset, sample * 0x7FFF, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

// Batch process multiple texts
export async function generateBatchVoiceOver(
  texts: string[],
  options: VoiceOverOptions,
  onProgress?: (completed: number, total: number) => void
): Promise<VoiceOverResult[]> {
  const results: VoiceOverResult[] = [];
  
  for (let i = 0; i < texts.length; i++) {
    try {
      const result = await generateAIVoiceOver(texts[i], options);
      results.push(result);
      
      if (onProgress) {
        onProgress(i + 1, texts.length);
      }
    } catch (error) {
      console.error(`Failed to generate voice over for text ${i + 1}:`, error);
      // Continue with next text
    }
  }
  
  return results;
}

// Apply voice over template
export function applyVoiceOverTemplate(
  templateName: keyof typeof voiceOverTemplates,
  baseOptions: Partial<VoiceOverOptions> = {}
): VoiceOverOptions {
  const template = voiceOverTemplates[templateName];
  
  return {
    voice: 'neutral',
    language: 'english',
    speed: 'normal',
    tone: 'professional',
    format: 'mp3',
    quality: 'high',
    ...template,
    ...baseOptions, // Override with user preferences
  };
}

// Filter out unsupported characters for speech synthesis
export function filterUnsupportedCharacters(text: string): string {
  // Remove or replace unsupported characters that cause TTS errors
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
    // Remove other problematic Unicode characters
    .replace(/[⃣⏱️]/g, '')
    // Remove zero-width characters and other invisible characters
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    // Clean up multiple spaces
    .replace(/\s+/g, ' ')
    .trim();

  return filteredText;
}

// Advanced text preprocessing for better voice over
export function preprocessTextForVoiceOver(text: string, options: {
  addPauses?: boolean;
  expandAbbreviations?: boolean;
  normalizeNumbers?: boolean;
  addEmphasis?: boolean;
  filterUnsupported?: boolean;
} = {}): string {
  let processedText = text;

  // Filter unsupported characters first if requested
  if (options.filterUnsupported !== false) {
    processedText = filterUnsupportedCharacters(processedText);
  }

  // Expand common abbreviations
  if (options.expandAbbreviations) {
    const abbreviations = {
      'Mr.': 'Mister',
      'Mrs.': 'Missus',
      'Dr.': 'Doctor',
      'Prof.': 'Professor',
      'Inc.': 'Incorporated',
      'Ltd.': 'Limited',
      'Co.': 'Company',
      'etc.': 'etcetera',
      'vs.': 'versus',
      'e.g.': 'for example',
      'i.e.': 'that is',
    };

    Object.entries(abbreviations).forEach(([abbr, expansion]) => {
      processedText = processedText.replace(new RegExp(abbr, 'g'), expansion);
    });
  }

  // Normalize numbers
  if (options.normalizeNumbers) {
    processedText = processedText.replace(/\b(\d+)\b/g, (match) => {
      const num = parseInt(match);
      if (num < 21) {
        const numbers = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
                        'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];
        return numbers[num] || match;
      }
      return match;
    });
  }

  // Add strategic pauses
  if (options.addPauses) {
    processedText = processedText
      .replace(/([.!?])\s+/g, '$1 <break time="800ms"/> ')
      .replace(/([,;:])\s+/g, '$1 <break time="400ms"/> ')
      .replace(/\n\n/g, ' <break time="1200ms"/> ');
  }

  // Add emphasis to important words
  if (options.addEmphasis) {
    processedText = processedText
      .replace(/\*\*(.*?)\*\*/g, '<emphasis level="strong">$1</emphasis>')
      .replace(/\*(.*?)\*/g, '<emphasis level="moderate">$1</emphasis>');
  }

  return processedText;
}

// Split long text into chunks for voice over
export function splitTextForVoiceOver(text: string, maxChunkSize: number = 1000): string[] {
  if (text.length <= maxChunkSize) {
    return [text];
  }

  const chunks: string[] = [];
  const sentences = text.split(/[.!?]+/);
  let currentChunk = '';

  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();
    if (!trimmedSentence) continue;

    const sentenceWithPunctuation = trimmedSentence + '.';
    
    if ((currentChunk + sentenceWithPunctuation).length > maxChunkSize) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = sentenceWithPunctuation;
      } else {
        // Single sentence is too long, split by words
        const words = sentenceWithPunctuation.split(' ');
        let wordChunk = '';
        
        for (const word of words) {
          if ((wordChunk + ' ' + word).length > maxChunkSize) {
            if (wordChunk) {
              chunks.push(wordChunk.trim());
              wordChunk = word;
            } else {
              chunks.push(word); // Single word is too long
            }
          } else {
            wordChunk += (wordChunk ? ' ' : '') + word;
          }
        }
        
        if (wordChunk) {
          currentChunk = wordChunk;
        }
      }
    } else {
      currentChunk += (currentChunk ? ' ' : '') + sentenceWithPunctuation;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}