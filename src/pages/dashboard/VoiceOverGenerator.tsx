import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useKeyboardShortcuts } from "@/lib/keyboardShortcuts";
import { activityHistory } from "@/lib/activityHistory";
import { isDemoMode, showDemoRestriction } from "@/lib/demoMode";
import { hasCredits, useCredit, getCredits } from "@/lib/creditSystem";
import CreditDisplay from "@/components/dashboard/CreditDisplay";
import UpgradeModal from "@/components/dashboard/UpgradeModal";

import {
  Mic,
  Play,
  Pause,
  Download,
  RefreshCw,
  Volume2,
  Settings,
  Copy,
  Sparkles,
  User,
  Users,
  Zap,
  Clock,
  Briefcase,
  Heart,
  Activity,
  Headphones,
  Square,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import {
  generateAIVoiceOver,
  generateDownloadableAudio,
  isVoiceOverAvailable,
  getActiveVoiceProvider,
  getProviderForQuality,
  testOpenAIConnection,
  testElevenLabsConnection,
  testGoogleTTSConnection,
  prepareVoiceOverScript,
  preprocessTextForVoiceOver,
  filterUnsupportedCharacters,
  estimateVoiceOverCost,
  applyVoiceOverTemplate,
  voiceOverTemplates,
  type VoiceOverOptions,
  type VoiceOverResult,
} from "@/lib/aiVoiceOverGenerator";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


const voices = [
  { value: "male", label: "Male Voice", icon: User, description: "Deep, authoritative male voice" },
  { value: "female", label: "Female Voice", icon: Users, description: "Clear, professional female voice" },
  { value: "neutral", label: "Neutral Voice", icon: Activity, description: "Balanced, versatile voice" },
  { value: "child", label: "Child Voice", icon: Heart, description: "Young, playful voice" },
  { value: "elderly", label: "Elderly Voice", icon: Clock, description: "Mature, wise voice" },
  { value: "robotic", label: "Robotic Voice", icon: Zap, description: "Synthetic, futuristic voice" },
] as const;

const tones = [
  { value: "professional", label: "Professional", icon: Briefcase, description: "Business and corporate content" },
  { value: "casual", label: "Casual", icon: Heart, description: "Relaxed, everyday conversation" },
  { value: "energetic", label: "Energetic", icon: Zap, description: "High-energy, motivational" },
  { value: "calm", label: "Calm", icon: Activity, description: "Soothing, meditative" },
  { value: "dramatic", label: "Dramatic", icon: Sparkles, description: "Theatrical, storytelling" },
  { value: "friendly", label: "Friendly", icon: Heart, description: "Warm, approachable" },
  { value: "authoritative", label: "Authoritative", icon: Briefcase, description: "Commanding, expert" },
  { value: "emotional", label: "Emotional", icon: Heart, description: "Expressive, passionate" },
] as const;

const templates = [
  { value: "podcast", label: "Podcast", description: "Perfect for podcast episodes" },
  { value: "commercial", label: "Commercial", description: "Marketing and advertisements" },
  { value: "documentary", label: "Documentary", description: "Educational and informative" },
  { value: "audiobook", label: "Audiobook", description: "Long-form narration" },
  { value: "presentation", label: "Presentation", description: "Business presentations" },
  { value: "youtube", label: "YouTube", description: "Video content and tutorials" },
] as const;

const VoiceOverGenerator = () => {
  const { user } = useAuth();

  const [textInput, setTextInput] = useState("");
  const [voice, setVoice] = useState<VoiceOverOptions['voice']>("neutral");
  const [language, setLanguage] = useState<VoiceOverOptions['language']>("english");
  const [speed, setSpeed] = useState<VoiceOverOptions['speed']>("normal");
  const [tone, setTone] = useState<VoiceOverOptions['tone']>("professional");
  const [format, setFormat] = useState<VoiceOverOptions['format']>("mp3");
  const [quality, setQuality] = useState<VoiceOverOptions['quality']>("high");
  
  // Advanced settings
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [pitch, setPitch] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1.0);
  const [emphasis, setEmphasis] = useState<'none' | 'strong' | 'moderate'>('moderate');
  const [backgroundMusic, setBackgroundMusic] = useState<boolean>(false);
  const [noiseReduction, setNoiseReduction] = useState<boolean>(true);
  const [normalization, setNormalization] = useState<boolean>(true);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState<boolean>(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVoiceOver, setGeneratedVoiceOver] = useState<VoiceOverResult | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Handle pre-filled text from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const prefilledText = urlParams.get('text');
    if (prefilledText) {
      setTextInput(decodeURIComponent(prefilledText));
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Cleanup audio on component unmount
  useEffect(() => {
    return () => {
      if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
      }
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
      }
    };
  }, [audioElement]);

  useKeyboardShortcuts([
    {
      key: 'Enter',
      ctrl: true,
      action: handleGenerate,
      description: 'Generate voice over'
    }
  ]);

  async function handleGenerate() {
    // Check demo mode
    if (isDemoMode() && !user) {
      showDemoRestriction(toast);
      return;
    }

    // Check credits
    const creditCost = quality === 'broadcast' ? 10 : 
                      quality === 'studio' ? 8 : 
                      quality === 'premium' ? 5 : 
                      quality === 'high' ? 3 : 2;
    if (!hasCredits(creditCost, user?.id)) {
      setShowUpgradeModal(true);
      return;
    }

    if (!textInput.trim()) {
      toast.error("Please enter text for voice over generation");
      return;
    }

    // Stop any currently playing audio
    if (audioElement) {
      audioElement.pause();
      setIsPlaying(false);
      setAudioElement(null);
    }

    setIsGenerating(true);
    try {
      toast.info("🎙️ Generating AI voice over... This may take 15-30 seconds");

      // Prepare script for voice over (limit to 4000 characters for API limits)
      const rawScript = prepareVoiceOverScript(textInput.substring(0, 4000), true);
      const script = filterUnsupportedCharacters(rawScript);

      // Generate voice over using AI with advanced options
      const voiceOver = await generateAIVoiceOver(script, {
        voice,
        language,
        speed,
        tone,
        format,
        quality,
        pitch,
        volume,
        emphasis,
        backgroundMusic,
        noiseReduction,
        normalization,
      });

      setGeneratedVoiceOver(voiceOver);
      
      // Deduct credits after successful generation
      const creditUsed = useCredit(creditCost, user?.id);
      if (!creditUsed) {
        toast.error("Failed to deduct credits");
      }
      
      // Add to activity history
      activityHistory.add({
        type: 'export',
        title: `Generated AI Voice Over (${voiceOver.metadata.provider})`,
        content: textInput.substring(0, 200) + '...',
        metadata: {
          format: 'voice_over',
          tone: tone,
          language: language,
        },
      });
      
      const remainingCredits = getCredits(user?.id);
      toast.success(`✅ Voice over generated successfully! Credits: ${remainingCredits.remaining}/${remainingCredits.total}`);
    } catch (error: any) {
      console.error("AI voice over generation error:", error);
      
      // More specific error messages
      let errorMessage = "❌ Voice over generation failed.";
      
      if (error.message.includes('Unsupported characters detected') || error.message.includes('special characters')) {
        errorMessage = "❌ Text contains unsupported characters. Please use the 'Clean Text' button to remove them.";
        toast.error(errorMessage);
        toast.info("💡 Click 'Remove Unsupported Characters' button below the text area to fix this.");
      } else if (error.message.includes('All AI voice over services failed')) {
        errorMessage = "❌ All TTS services are currently unavailable. Please try again in a few minutes or check your internet connection.";
        toast.error(errorMessage);
      } else if (error.message.includes('OpenAI TTS API error: 401')) {
        errorMessage = "❌ OpenAI API key is invalid. Using free HuggingFace TTS instead.";
        toast.error(errorMessage);
      } else if (error.message.includes('OpenAI TTS API error: 402')) {
        errorMessage = "❌ OpenAI credits exhausted. Using free HuggingFace TTS instead.";
        toast.error(errorMessage);
      } else if (error.message.includes('OpenAI TTS API error: 429')) {
        errorMessage = "❌ OpenAI rate limit exceeded. Using free HuggingFace TTS instead.";
        toast.error(errorMessage);
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = "❌ Network error. Please check your internet connection and try again.";
        toast.error(errorMessage);
      } else {
        errorMessage = `❌ Voice generation failed: ${error.message}`;
        toast.error(errorMessage);
        
        // Show helpful info
        toast.info("💡 Using HuggingFace TTS (Free). Check console for detailed logs.");
      }
    } finally {
      setIsGenerating(false);
    }
  }

  const handlePlayPause = () => {
    if (!generatedVoiceOver) return;

    // Check if this is a speech synthesis result
    if (generatedVoiceOver.audioUrl === 'speech-synthesis-active') {
      // Handle speech synthesis playback
      if ('speechSynthesis' in window) {
        if (speechSynthesis.speaking) {
          if (speechSynthesis.paused) {
            speechSynthesis.resume();
            setIsPlaying(true);
            toast.info("🎵 Voice over resumed");
          } else {
            speechSynthesis.pause();
            setIsPlaying(false);
            toast.info("⏸️ Voice over paused");
          }
        } else {
          // Re-speak the text
          const utterance = new SpeechSynthesisUtterance(generatedVoiceOver.transcript);
          
          // Apply the same settings as generation
          utterance.rate = speed === 'slow' ? 0.6 : speed === 'fast' ? 1.4 : 0.9;
          utterance.pitch = tone === 'dramatic' ? 1.3 : tone === 'calm' ? 0.7 : tone === 'energetic' ? 1.1 : 1.0;
          utterance.volume = 1.0;
          
          utterance.onstart = () => {
            setIsPlaying(true);
            toast.success("🎵 Voice over is playing!");
          };
          
          utterance.onend = () => {
            setIsPlaying(false);
            toast.info("✅ Voice over completed");
          };
          
          utterance.onerror = () => {
            setIsPlaying(false);
            toast.error("❌ Voice playback failed");
          };
          
          speechSynthesis.speak(utterance);
        }
      }
      return;
    }

    // Handle regular audio file playback
    if (audioElement) {
      if (isPlaying) {
        audioElement.pause();
        setIsPlaying(false);
      } else {
        audioElement.play().then(() => {
          setIsPlaying(true);
        }).catch((error) => {
          console.error('Playback failed:', error);
          setIsPlaying(false);
        });
      }
    } else {
      const audio = new Audio(generatedVoiceOver.audioUrl);
      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        setAudioElement(null);
      });
      audio.addEventListener('pause', () => setIsPlaying(false));
      audio.addEventListener('play', () => setIsPlaying(true));
      audio.addEventListener('error', (e) => {
        console.error('Audio error:', e);
        setIsPlaying(false);
        setAudioElement(null);
      });
      
      setAudioElement(audio);
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch((error) => {
        console.error('Playback failed:', error);
        setIsPlaying(false);
        setAudioElement(null);
      });
    }
  };

  const handleStop = () => {
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
      setIsPlaying(false);
      setAudioElement(null);
    }
    
    // Stop any Web Speech synthesis
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    
    toast.info("Audio stopped");
  };

  const handleDownload = async () => {
    if (!generatedVoiceOver) return;
    
    // Check if this is speech synthesis
    if (generatedVoiceOver.audioUrl === 'speech-synthesis-active') {
      toast.info("🎵 Creating downloadable audio file...");
      
      try {
        // Generate a real audio recording
        const audioBlob = await generateDownloadableAudio(generatedVoiceOver.transcript, {
          voice,
          language,
          speed,
          tone,
          format,
          quality
        });
        
        // Download the audio file
        const url = URL.createObjectURL(audioBlob);
        const link = document.createElement('a');
        link.href = url;
        
        // Determine file extension based on blob type
        const fileExtension = audioBlob.type.includes('webm') ? 'webm' : 
                             audioBlob.type.includes('wav') ? 'wav' : 
                             audioBlob.type.includes('mp3') ? 'mp3' : 'audio';
        
        link.download = `voice-over-${Date.now()}.${fileExtension}`;
        link.click();
        
        URL.revokeObjectURL(url);
        
        if (audioBlob.type.includes('audio')) {
          toast.success("🎵 Real voice over audio downloaded!");
        } else {
          toast.info("📄 Voice over file downloaded (audio recording not fully supported)");
        }
        
      } catch (error) {
        console.error('Audio generation failed:', error);
        
        // Fallback to transcript download
        const textContent = `Voice Over Transcript
Generated by: ${generatedVoiceOver.metadata.provider}
Voice: ${generatedVoiceOver.metadata.voice}
Tone: ${generatedVoiceOver.metadata.tone}
Language: ${generatedVoiceOver.metadata.language}
Speed: ${generatedVoiceOver.metadata.speed}
Duration: ${Math.floor(generatedVoiceOver.duration / 60)}m ${generatedVoiceOver.duration % 60}s

Transcript:
${generatedVoiceOver.transcript}

Note: Audio recording failed. This is the text transcript of your voice over.`;

        const blob = new Blob([textContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `voice-over-transcript-${Date.now()}.txt`;
        link.click();
        
        URL.revokeObjectURL(url);
        toast.error("❌ Audio recording failed. Transcript downloaded instead.");
      }
      return;
    }
    
    // Handle regular audio file download
    try {
      const link = document.createElement('a');
      link.href = generatedVoiceOver.audioUrl;
      link.download = `voice-over-${Date.now()}.${generatedVoiceOver.metadata.format}`;
      link.click();
      
      toast.success("🎵 Voice over audio file downloaded!");
    } catch (error) {
      console.error('Download failed:', error);
      
      // Fallback: download the audio blob directly
      try {
        const url = URL.createObjectURL(generatedVoiceOver.audioBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `voice-over-${Date.now()}.${generatedVoiceOver.metadata.format}`;
        link.click();
        
        URL.revokeObjectURL(url);
        toast.success("🎵 Voice over downloaded!");
      } catch (blobError) {
        console.error('Blob download failed:', blobError);
        toast.error("❌ Download failed. Please try again.");
      }
    }
  };

  const handleCopyScript = () => {
    if (!textInput) return;
    
    const script = prepareVoiceOverScript(textInput, true);
    navigator.clipboard.writeText(script);
    toast.success("Voice over script copied to clipboard!");
  };

  const handleTemplateChange = (templateName: string) => {
    if (!templateName) return;
    
    const template = applyVoiceOverTemplate(templateName as keyof typeof voiceOverTemplates);
    
    setVoice(template.voice);
    setTone(template.tone);
    setSpeed(template.speed);
    setEmphasis(template.emphasis || 'moderate');
    setBackgroundMusic(template.backgroundMusic || false);
    setNoiseReduction(template.noiseReduction || false);
    setNormalization(template.normalization || false);
    setVolume(template.volume || 1.0);
    
    setSelectedTemplate(templateName);
    toast.success(`Applied ${templateName} template settings!`);
  };

  const handlePreprocessText = () => {
    if (!textInput.trim()) return;
    
    const processedText = preprocessTextForVoiceOver(textInput, {
      addPauses: true,
      expandAbbreviations: true,
      normalizeNumbers: true,
      addEmphasis: true,
      filterUnsupported: true
    });
    
    setTextInput(processedText);
    toast.success("Text preprocessed for better voice over quality!");
  };

  const handleCleanText = () => {
    if (!textInput.trim()) return;
    
    const cleanedText = filterUnsupportedCharacters(textInput);
    setTextInput(cleanedText);
    toast.success("Removed unsupported characters from text!");
  };

  // Check if text contains unsupported characters
  const hasUnsupportedChars = textInput !== filterUnsupportedCharacters(textInput);

  // Test Google TTS connection
  const handleTestGoogleTTS = async () => {
    toast.info("Testing Google Cloud TTS API connection...");
    
    try {
      const isConnected = await testGoogleTTSConnection();
      
      if (isConnected) {
        toast.success("✅ Google Cloud TTS API connection successful!");
      } else {
        toast.error("❌ Google Cloud TTS API connection failed. Check console for details.");
      }
    } catch (error) {
      toast.error("❌ Google Cloud TTS API connection failed. Check console for details.");
    }
  };

  // Test ElevenLabs connection
  const handleTestElevenLabs = async () => {
    toast.info("Testing ElevenLabs API connection...");
    
    try {
      const isConnected = await testElevenLabsConnection();
      
      if (isConnected) {
        toast.success("✅ ElevenLabs API connection successful!");
      } else {
        toast.error("❌ ElevenLabs API connection failed. Check console for details.");
      }
    } catch (error) {
      toast.error("❌ ElevenLabs API connection failed. Check console for details.");
    }
  };

  // Test OpenAI connection
  const handleTestOpenAI = async () => {
    toast.info("Testing OpenAI API connection...");
    
    try {
      const isConnected = await testOpenAIConnection();
      
      if (isConnected) {
        toast.success("✅ OpenAI API connection successful!");
      } else {
        toast.error("❌ OpenAI API connection failed. Check console for details.");
      }
    } catch (error) {
      if (error.message.includes('rate limit')) {
        toast.warning("⚠️ OpenAI API rate limited. Please wait a moment and try again.");
      } else {
        toast.error("❌ OpenAI API connection failed. Check console for details.");
      }
    }
  };

  const estimatedCost = estimateVoiceOverCost(textInput, quality);
  const characterCount = textInput.length;
  const estimatedDuration = Math.ceil((textInput.split(/\s+/).length / 150) * 60); // 150 WPM average

  return (
    <div className="p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Mic className="w-8 h-8 text-primary" />
              AI Voice Over Generator
            </h1>
            <p className="text-muted-foreground mt-1">
              Convert your text content into professional AI voice overs
            </p>
          </div>
        </div>
      </motion.div>

      {/* Credit Display */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <CreditDisplay />
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column - Input */}
        <div className="space-y-6">
          {/* Text Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6"
          >
            <Label className="text-lg font-semibold mb-4">Text Content</Label>
            <Textarea
              placeholder="Enter your text content here... This can be a YouTube script, story, presentation, or any text you want to convert to voice over."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              className="min-h-[200px] bg-secondary border-border resize-none"
            />
            
            {/* Unsupported Characters Warning */}
            {hasUnsupportedChars && (
              <div className="mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                      Unsupported characters detected
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCleanText}
                    className="text-xs h-7"
                  >
                    Clean Text
                  </Button>
                </div>
                <p className="text-xs text-yellow-600/80 dark:text-yellow-400/80 mt-1">
                  Special characters like emojis, accents, or symbols may cause speech generation errors
                </p>
              </div>
            )}

            {/* Text Stats */}
            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm font-bold text-foreground">{characterCount}</p>
                <p className="text-xs text-muted-foreground">Characters</p>
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{textInput.split(/\s+/).filter(w => w).length}</p>
                <p className="text-xs text-muted-foreground">Words</p>
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">~{estimatedDuration}s</p>
                <p className="text-xs text-muted-foreground">Duration</p>
              </div>
            </div>
          </motion.div>
          {/* Voice Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-card p-6 space-y-4"
          >
            <Label className="text-lg font-semibold mb-4">Voice Settings</Label>
            
            <div>
              <Label className="text-sm font-medium mb-2">Voice Type</Label>
              <Select value={voice} onValueChange={(v) => setVoice(v as VoiceOverOptions['voice'])}>
                <SelectTrigger className="bg-secondary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {voices.map((v) => (
                    <SelectItem key={v.value} value={v.value}>
                      {v.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2">Voice Tone</Label>
              <Select value={tone} onValueChange={(v) => setTone(v as VoiceOverOptions['tone'])}>
                <SelectTrigger className="bg-secondary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tones.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2">Speaking Speed</Label>
              <Select value={speed} onValueChange={(v) => setSpeed(v as VoiceOverOptions['speed'])}>
                <SelectTrigger className="bg-secondary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="very-slow">Very Slow (0.4x)</SelectItem>
                  <SelectItem value="slow">Slow (0.6x)</SelectItem>
                  <SelectItem value="normal">Normal (0.9x)</SelectItem>
                  <SelectItem value="fast">Fast (1.4x)</SelectItem>
                  <SelectItem value="very-fast">Very Fast (1.8x)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2">Language</Label>
              <Select value={language} onValueChange={(v) => setLanguage(v as VoiceOverOptions['language'])}>
                <SelectTrigger className="bg-secondary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="bengali">Bengali (বাংলা)</SelectItem>
                  <SelectItem value="hindi">Hindi (हिन्दी)</SelectItem>
                  <SelectItem value="spanish">Spanish (Español)</SelectItem>
                  <SelectItem value="french">French (Français)</SelectItem>
                  <SelectItem value="german">German (Deutsch)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>

          {/* Professional Templates */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.17 }}
            className="glass-card p-6 space-y-4"
          >
            <Label className="text-lg font-semibold mb-4">Professional Templates</Label>
            
            <div>
              <Label className="text-sm font-medium mb-2">Voice Over Template</Label>
              <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                <SelectTrigger className="bg-secondary">
                  <SelectValue placeholder="Choose a template (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.value} value={template.value}>
                      <div className="flex flex-col">
                        <span className="font-medium">{template.label}</span>
                        <span className="text-xs text-muted-foreground">{template.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedTemplate && (
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                <p className="text-sm text-primary font-medium">
                  ✨ Template Applied: {templates.find(t => t.value === selectedTemplate)?.label}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Voice settings have been optimized for {selectedTemplate} content
                </p>
              </div>
            )}
          </motion.div>

          {/* Advanced Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="glass-card p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">Advanced Settings</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
              >
                <Settings className="w-4 h-4 mr-2" />
                {showAdvancedSettings ? 'Hide' : 'Show'}
              </Button>
            </div>

            {showAdvancedSettings && (
              <div className="space-y-4 pt-4 border-t border-border/50">
                {/* Pitch Control */}
                <div>
                  <Label className="text-sm font-medium mb-2">Voice Pitch: {pitch > 0 ? '+' : ''}{pitch}</Label>
                  <input
                    type="range"
                    min="-2"
                    max="2"
                    step="0.1"
                    value={pitch}
                    onChange={(e) => setPitch(parseFloat(e.target.value))}
                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Lower</span>
                    <span>Normal</span>
                    <span>Higher</span>
                  </div>
                </div>

                {/* Volume Control */}
                <div>
                  <Label className="text-sm font-medium mb-2">Volume: {Math.round(volume * 100)}%</Label>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.1"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Emphasis Level */}
                <div>
                  <Label className="text-sm font-medium mb-2">Emphasis Level</Label>
                  <Select value={emphasis} onValueChange={(v) => setEmphasis(v as 'none' | 'strong' | 'moderate')}>
                    <SelectTrigger className="bg-secondary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None - Flat delivery</SelectItem>
                      <SelectItem value="moderate">Moderate - Natural emphasis</SelectItem>
                      <SelectItem value="strong">Strong - Dramatic emphasis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Audio Processing Options */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Audio Processing</Label>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium text-foreground">Background Music</Label>
                      <p className="text-xs text-muted-foreground">Add subtle background music</p>
                    </div>
                    <button
                      onClick={() => setBackgroundMusic(!backgroundMusic)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        backgroundMusic ? 'bg-primary' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          backgroundMusic ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium text-foreground">Noise Reduction</Label>
                      <p className="text-xs text-muted-foreground">Remove background noise</p>
                    </div>
                    <button
                      onClick={() => setNoiseReduction(!noiseReduction)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        noiseReduction ? 'bg-primary' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          noiseReduction ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium text-foreground">Audio Normalization</Label>
                      <p className="text-xs text-muted-foreground">Optimize audio levels</p>
                    </div>
                    <button
                      onClick={() => setNormalization(!normalization)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        normalization ? 'bg-primary' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          normalization ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Quality & Format */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6 space-y-4"
          >
            <Label className="text-lg font-semibold mb-4">Output Settings</Label>
            
            <div>
              <Label className="text-sm font-medium mb-2">Audio Quality</Label>
              <Select value={quality} onValueChange={(v) => setQuality(v as VoiceOverOptions['quality'])}>
                <SelectTrigger className="bg-secondary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard Quality - Browser TTS (2 credits)</SelectItem>
                  <SelectItem value="high">High Quality - Google Cloud TTS Free (3 credits)</SelectItem>
                  <SelectItem value="premium">Premium Quality - Google Cloud TTS Free (5 credits)</SelectItem>
                  <SelectItem value="studio">Studio Quality - Google Cloud TTS Free (8 credits)</SelectItem>
                  <SelectItem value="broadcast">Broadcast Quality - Google Cloud TTS Free (10 credits)</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Provider Indicator */}
              <div className="mt-2 p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                  🎤 Will use: {getProviderForQuality(quality)}
                </p>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2">Audio Format</Label>
              <Select value={format} onValueChange={(v) => setFormat(v as VoiceOverOptions['format'])}>
                <SelectTrigger className="bg-secondary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mp3">MP3 (Recommended)</SelectItem>
                  <SelectItem value="wav">WAV (Uncompressed)</SelectItem>
                  <SelectItem value="ogg">OGG (Web Optimized)</SelectItem>
                  <SelectItem value="flac">FLAC (Lossless)</SelectItem>
                  <SelectItem value="m4a">M4A (Apple)</SelectItem>
                </SelectContent>
              </Select>
            </div>



            {isVoiceOverAvailable() && (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/30">
                  <Volume2 className="w-5 h-5 text-primary" />
                  <div className="flex-1">
                    <span className="text-foreground font-medium block">🎙️ AI Voice Over Ready</span>
                    <span className="text-xs text-muted-foreground">Provider: {getActiveVoiceProvider()}</span>
                  </div>
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                
                {/* API Test Buttons */}
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleTestGoogleTTS}
                    className="w-full text-xs"
                  >
                    🌐 Test Google Cloud TTS (1M Free)
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleTestElevenLabs}
                    className="w-full text-xs"
                  >
                    🎤 Test ElevenLabs API (10K Free)
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleTestOpenAI}
                    className="w-full text-xs"
                  >
                    🔍 Test OpenAI API Connection
                  </Button>
                </div>
              </div>
            )}
          </motion.div>

          {/* Cost Estimate */}
          <div className="text-center p-3 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-sm text-muted-foreground">
              Credit Cost: <span className="font-bold text-primary">
                {quality === 'broadcast' ? '10' : quality === 'studio' ? '8' : quality === 'premium' ? '5' : quality === 'high' ? '3' : '2'} credits
              </span>
            </p>
            {estimatedCost > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Estimated API cost: ${estimatedCost.toFixed(3)}
              </p>
            )}
            {quality !== 'standard' && (
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-medium">
                🎤 Uses Google Cloud TTS Free (with ElevenLabs & Browser TTS fallback)
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              variant="hero"
              className="w-full"
              onClick={handleGenerate}
              disabled={isGenerating || !textInput.trim()}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  🎙️ Generating Voice Over...
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5" />
                  🚀 Generate Professional Voice Over ({quality === 'broadcast' ? '10' : quality === 'studio' ? '8' : quality === 'premium' ? '5' : quality === 'high' ? '3' : '2'} credits)
                </>
              )}
            </Button>
            
            {textInput.trim() && (
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" onClick={handleCopyScript}>
                  <Copy className="w-4 h-4" />
                  Copy Script
                </Button>
                <Button variant="outline" onClick={handlePreprocessText}>
                  <Zap className="w-4 h-4" />
                  Optimize Text
                </Button>
              </div>
            )}
            
            {hasUnsupportedChars && (
              <Button variant="outline" onClick={handleCleanText} className="w-full">
                <RefreshCw className="w-4 h-4" />
                Remove Unsupported Characters
              </Button>
            )}
            

          </div>
          
          {!isVoiceOverAvailable() && (
            <p className="text-xs text-muted-foreground text-center font-medium">
              ℹ️ Voice Over Available! Using free HuggingFace TTS services. Add API keys for premium quality: VITE_OPENAI_API_KEY, VITE_ELEVENLABS_API_KEY, or VITE_GOOGLE_TTS_API_KEY
            </p>
          )}
        </div>
        {/* Right Column - Results */}
        <div className="space-y-6">
          {/* Loading Animation */}
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="glass-card p-6 text-center">
                <div className="flex items-center justify-center mb-4">
                  <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  🎙️ Generating AI Voice Over...
                </h3>
                <p className="text-sm text-muted-foreground">
                  Creating professional {quality} quality voice over with {voice} {tone} voice...
                </p>
                
                <div className="mt-4 w-full bg-secondary rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full animate-pulse" style={{
                    width: '70%',
                    transition: 'width 4s ease-in-out'
                  }}></div>
                </div>
                
                <p className="text-xs text-muted-foreground mt-2">
                  AI is processing your text and generating natural speech...
                </p>
              </div>
            </motion.div>
          )}

          {generatedVoiceOver && !isGenerating && (
            <>
              {/* Audio Player */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Generated Voice Over</h3>
                  <div className="flex items-center gap-2">
                    {isPlaying && (
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-500 font-medium border border-blue-500/20 animate-pulse flex items-center gap-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        Playing
                      </span>
                    )}
                    <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-500 font-medium border border-green-500/20">
                      {generatedVoiceOver.metadata.provider}
                    </span>
                  </div>
                </div>

                {/* Audio Controls */}
                <div className="bg-gradient-to-r from-primary/5 to-accent/5 p-6 rounded-xl border border-primary/20 mb-4">
                  <div className="flex items-center gap-4 mb-4">
                    <Button
                      size="lg"
                      variant={isPlaying ? "secondary" : "default"}
                      onClick={handlePlayPause}
                      className="w-16 h-16 rounded-full"
                    >
                      {isPlaying ? (
                        <Pause className="w-6 h-6" />
                      ) : (
                        <Play className="w-6 h-6" />
                      )}
                    </Button>
                    
                    {(isPlaying || audioElement) && (
                      <Button
                        size="lg"
                        variant="outline"
                        onClick={handleStop}
                        className="w-12 h-12 rounded-full"
                      >
                        <Square className="w-4 h-4" />
                      </Button>
                    )}
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-foreground">
                          {generatedVoiceOver.metadata.voice.charAt(0).toUpperCase() + generatedVoiceOver.metadata.voice.slice(1)} • {generatedVoiceOver.metadata.tone.charAt(0).toUpperCase() + generatedVoiceOver.metadata.tone.slice(1)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {Math.floor(generatedVoiceOver.duration / 60)}:{(generatedVoiceOver.duration % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
                      
                      {/* Audio Waveform Placeholder */}
                      <div className="w-full h-8 bg-secondary/50 rounded-lg flex items-center px-2">
                        <div className="flex items-center gap-1 w-full">
                          {Array.from({ length: 50 }).map((_, i) => (
                            <div
                              key={i}
                              className={`w-1 rounded-full transition-all duration-200 ${
                                isPlaying 
                                  ? 'bg-primary animate-pulse' 
                                  : 'bg-primary/30'
                              }`}
                              style={{
                                height: `${Math.random() * 20 + 4}px`,
                                animationDelay: `${i * 50}ms`
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Audio Info */}
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-sm font-bold text-foreground">{(generatedVoiceOver.fileSize / 1024 / 1024).toFixed(1)}MB</p>
                      <p className="text-xs text-muted-foreground">File Size</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{generatedVoiceOver.metadata.format.toUpperCase()}</p>
                      <p className="text-xs text-muted-foreground">Format</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{generatedVoiceOver.metadata.quality}</p>
                      <p className="text-xs text-muted-foreground">Quality</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{generatedVoiceOver.metadata.speed}</p>
                      <p className="text-xs text-muted-foreground">Speed</p>
                    </div>
                  </div>
                </div>

                {/* Download Button */}
                <Button variant="outline" className="w-full" onClick={handleDownload}>
                  <Download className="w-4 h-4" />
                  Download Voice Over ({generatedVoiceOver.metadata.format.toUpperCase()})
                </Button>
              </motion.div>

              {/* Voice Over Details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-6"
              >
                <h3 className="text-lg font-semibold text-foreground mb-4">Voice Over Details</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Provider:</span>
                    <span className="text-sm font-medium text-foreground">{generatedVoiceOver.metadata.provider}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Voice Type:</span>
                    <span className="text-sm font-medium text-foreground capitalize">{generatedVoiceOver.metadata.voice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Tone:</span>
                    <span className="text-sm font-medium text-foreground capitalize">{generatedVoiceOver.metadata.tone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Language:</span>
                    <span className="text-sm font-medium text-foreground capitalize">{generatedVoiceOver.metadata.language}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Duration:</span>
                    <span className="text-sm font-medium text-foreground">{Math.floor(generatedVoiceOver.duration / 60)}m {generatedVoiceOver.duration % 60}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">File Size:</span>
                    <span className="text-sm font-medium text-foreground">{(generatedVoiceOver.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                </div>
              </motion.div>
            </>
          )}

          {!generatedVoiceOver && !isGenerating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 rounded-2xl"></div>
              <div className="relative glass-card p-12 text-center border-2 border-dashed border-border/50 rounded-2xl">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <Headphones className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  Ready to Create AI Voice Over?
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
                  Enter your text content, select voice settings, and let our AI create professional voice overs in seconds.
                </p>
                <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span>Professional Quality</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-accent"></div>
                    <span>Multiple Voices</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span>Instant Generation</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        creditsRemaining={getCredits(user?.id).remaining}
        resetDate={getCredits(user?.id).resetDate}
      />
    </div>
  );
};

export default VoiceOverGenerator;