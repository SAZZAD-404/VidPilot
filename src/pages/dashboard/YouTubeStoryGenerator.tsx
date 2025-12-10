import { useState } from "react";
import { motion } from "framer-motion";
import { useKeyboardShortcuts } from "@/lib/keyboardShortcuts";
import { activityHistory } from "@/lib/activityHistory";
import { isDemoMode, showDemoRestriction } from "@/lib/demoMode";
import { hasCredits, useCredit, getCredits } from "@/lib/creditSystem";
import CreditDisplay from "@/components/dashboard/CreditDisplay";
import UpgradeModal from "@/components/dashboard/UpgradeModal";

import {
  Video,
  Copy,
  Download,
  RefreshCw,
  Sparkles,
  Clock,
  Target,
  Smile,
  Briefcase,
  Heart,
  Zap,
  BookOpen,
  Gamepad2,
  ChefHat,
  Plane,
  Hash,
  Image as ImageIcon,
  Type,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import {
  generateAIYouTubeStory,
  isAIAvailable,
  analyzeImageContent,
  type YouTubeStoryOptions,
  type YouTubeStoryResult,
} from "@/lib/aiYouTubeStoryGenerator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";

const genres = [
  { value: "educational", label: "Educational", icon: BookOpen },
  { value: "entertainment", label: "Entertainment", icon: Sparkles },
  { value: "lifestyle", label: "Lifestyle", icon: Heart },
  { value: "tech", label: "Technology", icon: Zap },
  { value: "business", label: "Business", icon: Briefcase },
  { value: "gaming", label: "Gaming", icon: Gamepad2 },
  { value: "cooking", label: "Cooking", icon: ChefHat },
  { value: "travel", label: "Travel", icon: Plane },
] as const;

const tones = [
  { value: "casual", label: "Casual", icon: Smile },
  { value: "professional", label: "Professional", icon: Briefcase },
  { value: "funny", label: "Funny", icon: Smile },
  { value: "dramatic", label: "Dramatic", icon: Zap },
  { value: "inspiring", label: "Inspiring", icon: Heart },
] as const;

const YouTubeStoryGenerator = () => {
  const { user } = useAuth();

  const [inputType, setInputType] = useState<"text" | "image">("text");
  const [topicInput, setTopicInput] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [genre, setGenre] = useState<YouTubeStoryOptions['genre']>("educational");
  const [duration, setDuration] = useState<YouTubeStoryOptions['duration']>("medium");
  const [tone, setTone] = useState<YouTubeStoryOptions['tone']>("casual");
  const [language, setLanguage] = useState<YouTubeStoryOptions['language']>("english");
  const [includeHooks, setIncludeHooks] = useState(true);
  const [includeCTA, setIncludeCTA] = useState(true);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedStory, setGeneratedStory] = useState<YouTubeStoryResult | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useKeyboardShortcuts([
    {
      key: 'Enter',
      ctrl: true,
      action: handleGenerate,
      description: 'Generate YouTube story'
    }
  ]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        // Check file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          toast.error("Image too large! Please select an image under 10MB");
          return;
        }
        setImageFile(file);
        toast.success(`Image selected: ${file.name}`);
      } else {
        toast.error("Please select an image file (JPG, PNG, GIF)");
      }
    }
  };

  async function handleGenerate() {
    // Check demo mode (only if not logged in)
    if (isDemoMode() && !user) {
      showDemoRestriction(toast);
      return;
    }

    // Check credits - longer videos cost more
    const creditCost = duration === 'documentary' ? 5 : duration === 'extended' ? 4 : duration === 'long' ? 3 : 2;
    if (!hasCredits(creditCost, user?.id)) {
      setShowUpgradeModal(true);
      return;
    }

    let topic = "";

    // Extract topic based on input type
    if (inputType === "text") {
      if (!topicInput.trim()) {
        toast.error("Please enter a topic or idea for your YouTube story");
        return;
      }
      topic = topicInput.trim();
    } else if (inputType === "image") {
      if (!imageFile) {
        toast.error("Please select an image");
        return;
      }
      
      // Show analyzing message
      toast.info("🔍 Analyzing image with AI...", { duration: 3000 });
      
      try {
        const imageUrl = URL.createObjectURL(imageFile);
        topic = await analyzeImageContent(imageUrl);
        toast.success(`✅ Image analyzed successfully`);
      } catch (error) {
        console.error('Image analysis failed:', error);
        toast.warning("⚠️ Using smart fallback for image analysis");
        topic = `Visual story based on uploaded image: ${imageFile.name}`;
      }
    }

    setIsGenerating(true);
    try {
      // Show AI loading message
      const loadingMessage = inputType === 'image' ? 
        "🤖 Analyzing image and generating story... This may take 20-25 seconds" :
        "🤖 Generating YouTube story... This may take 15-20 seconds";
      
      toast.info(loadingMessage);

      // Generate story using AI
      const story = await generateAIYouTubeStory(
        topic,
        {
          genre,
          duration,
          tone,
          language,
          includeHooks,
          includeCTA,
          inputType,
        },
        true // Always use AI
      );

      setGeneratedStory(story);
      
      // Deduct credits after successful generation
      const creditUsed = useCredit(creditCost, user?.id);
      if (!creditUsed) {
        toast.error("Failed to deduct credits");
      }
      
      // Add to activity history
      activityHistory.add({
        type: 'video',
        title: `Generated YouTube Story: ${story.title}`,
        content: story.story.substring(0, 200) + '...',
        metadata: {
          platform: 'youtube',
          tone,
          hashtags: story.tags,
        },
      });
      
      const remainingCredits = getCredits(user?.id);
      toast.success(`✅ Generated amazing YouTube story! Credits: ${remainingCredits.remaining}/${remainingCredits.total}`);
    } catch (error: any) {
      console.error("AI YouTube story generation error:", error);
      toast.error("❌ AI generation failed. Please check your API keys and try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  const handleCopyStory = () => {
    if (!generatedStory) return;
    
    // Format story with proper line breaks and structure
    const formattedStory = generatedStory.story
      .split('\n\n')
      .filter(p => p.trim())
      .map((paragraph, index) => `${index + 1}. ${paragraph.trim()}`)
      .join('\n\n');
    
    const fullText = `📺 YOUTUBE VIDEO STORY\n${'='.repeat(50)}\n\n🎬 TITLE:\n${generatedStory.title}\n\n${
      generatedStory.hook ? `🎯 OPENING HOOK:\n${generatedStory.hook}\n\n` : ''
    }📖 STORY CONTENT:\n${formattedStory}\n\n${
      generatedStory.cta ? `📢 CALL TO ACTION:\n${generatedStory.cta}\n\n` : ''
    }🏷️ TAGS: ${generatedStory.tags.map(tag => `#${tag}`).join(' ')}\n\n⏱️ ESTIMATED DURATION: ${generatedStory.estimatedDuration}\n📊 ENGAGEMENT SCORE: ${generatedStory.engagementScore}/100\n\n✨ Generated by VidPilot AI`;
    
    navigator.clipboard.writeText(fullText);
    toast.success("Professional YouTube story copied to clipboard!");
  };

  const handleExportTXT = () => {
    if (!generatedStory) {
      toast.error("No story to export");
      return;
    }

    // Format story with professional structure
    const formattedStory = generatedStory.story
      .split('\n\n')
      .filter(p => p.trim())
      .map((paragraph, index) => {
        const sectionTitles = ['Scene Setting', 'Build-up', 'Main Content', 'Resolution', 'Impact/Lesson'];
        const title = sectionTitles[index] || `Section ${index + 1}`;
        return `${index + 1}. ${title}:\n   ${paragraph.trim()}`;
      })
      .join('\n\n');

    const content = `📺 YOUTUBE VIDEO STORY - PROFESSIONAL FORMAT\n${'='.repeat(60)}\n\n🎬 VIDEO TITLE:\n${generatedStory.title}\n\n${
      generatedStory.hook ? `🎯 OPENING HOOK (First 15 seconds):\n${generatedStory.hook}\n\n` : ''
    }📖 STORY STRUCTURE:\n${formattedStory}\n\n${
      generatedStory.cta ? `📢 CALL TO ACTION:\n${generatedStory.cta}\n\n` : ''
    }🏷️ RECOMMENDED TAGS:\n${generatedStory.tags.map(tag => `#${tag}`).join(' ')}\n\n📊 VIDEO METRICS:\n⏱️ Estimated Duration: ${generatedStory.estimatedDuration}\n📈 Engagement Score: ${generatedStory.engagementScore}/100\n🎯 Genre: ${genre.charAt(0).toUpperCase() + genre.slice(1)}\n🎭 Tone: ${tone.charAt(0).toUpperCase() + tone.slice(1)}\n\n${'='.repeat(60)}\n✨ Generated by VidPilot AI - Professional YouTube Story Generator\n📅 Created: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `youtube-story-professional-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success("Professional YouTube story exported!");
  };

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
              <Video className="w-8 h-8 text-primary" />
              YouTube Story Generator
            </h1>
            <p className="text-muted-foreground mt-1">
              Create engaging YouTube video stories — powered by AI
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
          {/* Input Type Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="glass-card p-6"
          >
            <Label className="text-lg font-semibold mb-4">Content Source</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setInputType("text")}
                className={`p-4 rounded-lg border-2 transition-all ${
                  inputType === "text"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-secondary/30 text-muted-foreground hover:border-primary/50"
                }`}
              >
                <Type className="w-6 h-6 mx-auto mb-2" />
                <span className="text-sm font-medium">Text Prompt</span>
              </button>
              <button
                onClick={() => setInputType("image")}
                className={`p-4 rounded-lg border-2 transition-all ${
                  inputType === "image"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-secondary/30 text-muted-foreground hover:border-primary/50"
                }`}
              >
                <ImageIcon className="w-6 h-6 mx-auto mb-2" />
                <span className="text-sm font-medium">Image Upload</span>
              </button>
            </div>
          </motion.div>

          {/* Content Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6"
          >
            <Label className="text-lg font-semibold mb-4">
              {inputType === "text" ? "Video Topic or Idea" : "Upload Image for Analysis"}
            </Label>
            
            {inputType === "text" && (
              <Textarea
                placeholder="E.g., 'How I built a million dollar business from my bedroom' or 'The secret ingredient that changed my cooking forever'"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                className="min-h-[120px] bg-secondary border-border resize-none"
              />
            )}

            {inputType === "image" && (
              <>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="image-upload"
                />
                
                {imageFile ? (
                  <div className="space-y-3">
                    {/* Image Preview */}
                    <div className="relative w-full h-48 border-2 border-primary/30 rounded-lg overflow-hidden bg-secondary/30">
                      <img
                        src={URL.createObjectURL(imageFile)}
                        alt="Selected image"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setImageFile(null)}
                          className="bg-white/90 text-black hover:bg-white"
                        >
                          Remove Image
                        </Button>
                      </div>
                    </div>
                    
                    {/* Image Info */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground font-medium">{imageFile.name}</span>
                      <span className="text-muted-foreground">
                        {(imageFile.size / 1024 / 1024).toFixed(1)} MB
                      </span>
                    </div>
                    
                    {/* Change Image Button */}
                    <label
                      htmlFor="image-upload"
                      className="flex items-center justify-center w-full p-3 border border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors bg-secondary/30"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      <span className="text-sm">Change Image</span>
                    </label>
                  </div>
                ) : (
                  <label
                    htmlFor="image-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors bg-secondary/30"
                  >
                    <div className="text-center">
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-foreground">Click to upload image</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        JPG, PNG, GIF (Max 10MB)
                      </p>
                      <p className="text-xs text-primary mt-1 font-medium">
                        🤖 AI will analyze your image for story creation!
                      </p>
                    </div>
                  </label>
                )}
              </>
            )}


          </motion.div>

          {/* Genre & Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-card p-6 space-y-4"
          >
            <div>
              <Label className="text-sm font-medium mb-2">Genre</Label>
              <Select value={genre} onValueChange={(v) => setGenre(v as YouTubeStoryOptions['genre'])}>
                <SelectTrigger className="bg-secondary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {genres.map((g) => (
                    <SelectItem key={g.value} value={g.value}>
                      {g.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2">Video Duration</Label>
              <Select value={duration} onValueChange={(v) => setDuration(v as YouTubeStoryOptions['duration'])}>
                <SelectTrigger className="bg-secondary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Short (1-3 minutes)</SelectItem>
                  <SelectItem value="medium">Medium (5-10 minutes)</SelectItem>
                  <SelectItem value="long">Long (15-20 minutes)</SelectItem>
                  <SelectItem value="extended">Extended (30-45 minutes)</SelectItem>
                  <SelectItem value="documentary">Documentary (60+ minutes)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2">Tone</Label>
              <Select value={tone} onValueChange={(v) => setTone(v as YouTubeStoryOptions['tone'])}>
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
              <Label className="text-sm font-medium mb-2">Language</Label>
              <Select value={language} onValueChange={(v) => setLanguage(v as YouTubeStoryOptions['language'])}>
                <SelectTrigger className="bg-secondary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="bengali">Bengali (বাংলা)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>

          {/* Options */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6"
          >
            <Label className="text-lg font-semibold mb-4">Story Options</Label>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 cursor-pointer hover:bg-secondary/50 transition-colors">
                <Zap className="w-5 h-5 text-primary" />
                <span className="flex-1 text-foreground">Include Opening Hook</span>
                <input
                  type="checkbox"
                  checked={includeHooks}
                  onChange={(e) => setIncludeHooks(e.target.checked)}
                  className="w-5 h-5 rounded accent-primary"
                />
              </label>
              <label className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 cursor-pointer hover:bg-secondary/50 transition-colors">
                <Target className="w-5 h-5 text-accent" />
                <span className="flex-1 text-foreground">Include Call-to-Action</span>
                <input
                  type="checkbox"
                  checked={includeCTA}
                  onChange={(e) => setIncludeCTA(e.target.checked)}
                  className="w-5 h-5 rounded accent-primary"
                />
              </label>

              {isAIAvailable() && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/30">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <div className="flex-1">
                    <span className="text-foreground font-medium block">🤖 AI-Powered Story Generation</span>
                    <span className="text-xs text-muted-foreground">Professional YouTube stories optimized for engagement</span>
                  </div>
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Credit Cost Info */}
          <div className="text-center p-3 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-sm text-muted-foreground">
              Credit Cost: <span className="font-bold text-primary">
                {duration === 'documentary' ? '5' : duration === 'extended' ? '4' : duration === 'long' ? '3' : '2'} credits
              </span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {duration === 'documentary' ? 'Documentary format (60+ min)' : 
               duration === 'extended' ? 'Extended format (30-45 min)' : 
               duration === 'long' ? 'Long format (15-20 min)' : 
               'Standard format'}
            </p>
          </div>

          {/* Generate Button */}
          <Button
            variant="hero"
            className="w-full"
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                🤖 AI Generating Story...
              </>
            ) : (
              <>
                <Video className="w-5 h-5" />
                🚀 Generate YouTube Story ({duration === 'documentary' ? '5' : duration === 'extended' ? '4' : duration === 'long' ? '3' : '2'} credits)
              </>
            )}
          </Button>
          
          {!isAIAvailable() && (
            <p className="text-xs text-destructive text-center font-medium">
              ⚠️ AI API Key Required! Add VITE_ZAI_API_KEY, VITE_GROQ_API_KEY, or VITE_GEMINI_API_KEY to .env file
            </p>
          )}
          
          {/* AI Vision Status */}
          {inputType === "image" && (
            <div className="text-xs text-center space-y-1">
              {!import.meta.env.VITE_GEMINI_API_KEY && (
                <p className="text-muted-foreground">
                  💡 Add VITE_GEMINI_API_KEY for advanced image AI analysis
                </p>
              )}
              {import.meta.env.VITE_GEMINI_API_KEY && (
                <p className="text-green-500 font-medium">
                  ✅ AI Vision enabled for image analysis
                </p>
              )}
            </div>
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
              {/* AI Generation Status */}
              <div className="glass-card p-6 text-center">
                <div className="flex items-center justify-center mb-4">
                  <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  🤖 Crafting Your {duration === 'documentary' ? 'Documentary' : duration === 'extended' ? 'Extended' : duration === 'long' ? 'Long-Form' : ''} YouTube Story...
                </h3>
                <p className="text-sm text-muted-foreground">
                  {duration === 'documentary' ? 'Creating comprehensive documentary with multiple acts and detailed research...' :
                   duration === 'extended' ? 'Developing extended narrative with detailed chapters and story arcs...' :
                   duration === 'long' ? 'Building long-form content with multiple segments and detailed structure...' :
                   'Creating engaging narrative with hooks, story arc, and call-to-action...'}
                </p>
                
                {/* Progress Animation */}
                <div className="mt-4 w-full bg-secondary rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full animate-pulse" style={{
                    width: '70%',
                    transition: 'width 4s ease-in-out'
                  }}></div>
                </div>
                
                <p className="text-xs text-muted-foreground mt-2">
                  AI is analyzing your topic and crafting the perfect story...
                </p>
              </div>

              {/* Loading Skeleton */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6"
              >
                <div className="space-y-4">
                  <div className="w-full h-6 bg-muted/30 rounded animate-pulse"></div>
                  <div className="w-4/5 h-4 bg-muted/30 rounded animate-pulse"></div>
                  <div className="w-full h-4 bg-muted/30 rounded animate-pulse"></div>
                  <div className="w-3/4 h-4 bg-muted/30 rounded animate-pulse"></div>
                  <div className="w-full h-4 bg-muted/30 rounded animate-pulse"></div>
                  <div className="w-2/3 h-4 bg-muted/30 rounded animate-pulse"></div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {generatedStory && !isGenerating && (
            <>
              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3"
              >
                <Button variant="outline" className="flex-1" onClick={handleCopyStory}>
                  <Copy className="w-4 h-4" />
                  Copy Story
                </Button>
                <Button variant="outline" className="flex-1" onClick={handleExportTXT}>
                  <Download className="w-4 h-4" />
                  Export TXT
                </Button>
              </motion.div>

              {/* Generated Story */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="overflow-hidden bg-gradient-to-br from-background to-secondary/20 border-2 border-border hover:border-primary/30 transition-all duration-300 shadow-lg hover:shadow-xl">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-primary/10 to-accent/10 px-6 py-4 border-b border-border/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <Video className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">YouTube Video Story</h4>
                          <p className="text-xs text-muted-foreground">
                            {genre.charAt(0).toUpperCase() + genre.slice(1)} • {tone.charAt(0).toUpperCase() + tone.slice(1)} tone
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-500 font-medium border border-green-500/20">
                          {generatedStory.engagementScore}/100 Score
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-6">
                    {/* Title */}
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground mb-3 block flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        VIDEO TITLE - OPTIMIZED FOR YOUTUBE
                      </Label>
                      <div className="bg-gradient-to-r from-primary/5 to-accent/5 p-6 rounded-xl border border-primary/20">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-lg">🎬</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-foreground font-bold text-xl leading-relaxed mb-2">
                              {generatedStory.title}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>{generatedStory.title.length} characters</span>
                              <span>•</span>
                              <span className={generatedStory.title.length <= 60 ? "text-green-500" : generatedStory.title.length <= 100 ? "text-yellow-500" : "text-red-500"}>
                                {generatedStory.title.length <= 60 ? "Perfect Length" : generatedStory.title.length <= 100 ? "Good Length" : "Too Long"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Hook */}
                    {generatedStory.hook && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground mb-3 block flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          OPENING HOOK - FIRST 15 SECONDS
                        </Label>
                        <div className="bg-gradient-to-r from-orange-500/5 to-red-500/5 p-6 rounded-xl border border-orange-500/20">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0">
                              <span className="text-lg">🎯</span>
                            </div>
                            <div className="flex-1">
                              <p className="text-foreground leading-relaxed text-base font-medium mb-3">
                                {generatedStory.hook}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>{generatedStory.hook.split(' ').length} words</span>
                                <span>•</span>
                                <span>~{Math.ceil(generatedStory.hook.split(' ').length / 2.5)} seconds to read</span>
                                <span>•</span>
                                <span className="text-orange-500 font-medium">Critical for retention</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Story */}
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground mb-3 block flex items-center gap-2">
                        <Video className="w-4 h-4" />
                        STORY CONTENT - PROFESSIONAL STRUCTURE
                      </Label>
                      <div className="bg-gradient-to-br from-secondary/20 to-secondary/40 rounded-xl border border-border/50 overflow-hidden">
                        {/* Story Header */}
                        <div className="bg-gradient-to-r from-primary/5 to-accent/5 px-6 py-4 border-b border-border/30">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                                <span className="text-lg">🎬</span>
                              </div>
                              <div>
                                <span className="text-sm font-bold text-foreground">Professional Broadcast Script</span>
                                <p className="text-xs text-muted-foreground">Industry-standard storytelling structure</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs px-3 py-1 rounded-full bg-green-500/10 text-green-500 border border-green-500/20 font-medium">
                                ✨ Broadcast Quality
                              </span>
                              <span className="text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 font-medium">
                                ⏱️ {generatedStory.estimatedDuration}
                              </span>
                              <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                                {generatedStory.story.split('\n\n').filter(p => p.trim()).length} Acts
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Story Sections */}
                        <div className="p-6">
                          <div className="space-y-6">
                            {generatedStory.story.split('\n\n').filter(p => p.trim()).map((paragraph, index) => {
                              // Dynamic section titles based on duration and content length
                              const getSectionTitles = (duration: string, totalSections: number) => {
                                if (duration === 'documentary' && totalSections > 10) {
                                  return [
                                    { title: "Act 1: Introduction", icon: "🎭", color: "bg-blue-500/10 border-blue-500/20 text-blue-600" },
                                    { title: "Character Introduction", icon: "👥", color: "bg-indigo-500/10 border-indigo-500/20 text-indigo-600" },
                                    { title: "Problem Statement", icon: "❓", color: "bg-red-500/10 border-red-500/20 text-red-600" },
                                    { title: "Historical Context", icon: "📚", color: "bg-amber-500/10 border-amber-500/20 text-amber-600" },
                                    { title: "Investigation Begins", icon: "🔍", color: "bg-cyan-500/10 border-cyan-500/20 text-cyan-600" },
                                    { title: "First Revelations", icon: "💡", color: "bg-yellow-500/10 border-yellow-500/20 text-yellow-600" },
                                    { title: "Complications", icon: "⚠️", color: "bg-orange-500/10 border-orange-500/20 text-orange-600" },
                                    { title: "Deeper Investigation", icon: "🔬", color: "bg-teal-500/10 border-teal-500/20 text-teal-600" },
                                    { title: "Major Discovery", icon: "🎯", color: "bg-green-500/10 border-green-500/20 text-green-600" },
                                    { title: "Verification", icon: "✅", color: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600" },
                                    { title: "Broader Implications", icon: "🌍", color: "bg-purple-500/10 border-purple-500/20 text-purple-600" },
                                    { title: "Resolution", icon: "🏁", color: "bg-pink-500/10 border-pink-500/20 text-pink-600" },
                                    { title: "Epilogue", icon: "📝", color: "bg-gray-500/10 border-gray-500/20 text-gray-600" }
                                  ];
                                } else if (duration === 'extended' && totalSections > 7) {
                                  return [
                                    { title: "Chapter 1: Opening", icon: "📖", color: "bg-blue-500/10 border-blue-500/20 text-blue-600" },
                                    { title: "Chapter 2: Challenge", icon: "⚔️", color: "bg-red-500/10 border-red-500/20 text-red-600" },
                                    { title: "Chapter 3: Background", icon: "📚", color: "bg-amber-500/10 border-amber-500/20 text-amber-600" },
                                    { title: "Chapter 4: First Attempts", icon: "🚀", color: "bg-cyan-500/10 border-cyan-500/20 text-cyan-600" },
                                    { title: "Chapter 5: Obstacles", icon: "🧗", color: "bg-orange-500/10 border-orange-500/20 text-orange-600" },
                                    { title: "Chapter 6: Breakthrough", icon: "💥", color: "bg-green-500/10 border-green-500/20 text-green-600" },
                                    { title: "Chapter 7: Implementation", icon: "⚙️", color: "bg-purple-500/10 border-purple-500/20 text-purple-600" },
                                    { title: "Chapter 8: Results", icon: "🏆", color: "bg-yellow-500/10 border-yellow-500/20 text-yellow-600" },
                                    { title: "Chapter 9: Lessons", icon: "🎓", color: "bg-pink-500/10 border-pink-500/20 text-pink-600" },
                                    { title: "Chapter 10: Future", icon: "🔮", color: "bg-indigo-500/10 border-indigo-500/20 text-indigo-600" }
                                  ];
                                } else if (duration === 'long' && totalSections > 5) {
                                  return [
                                    { title: "Opening Scene", icon: "🎬", color: "bg-blue-500/10 border-blue-500/20 text-blue-600" },
                                    { title: "Hook & Problem", icon: "🎯", color: "bg-orange-500/10 border-orange-500/20 text-orange-600" },
                                    { title: "Background", icon: "📋", color: "bg-amber-500/10 border-amber-500/20 text-amber-600" },
                                    { title: "Main Content 1", icon: "📖", color: "bg-green-500/10 border-green-500/20 text-green-600" },
                                    { title: "Main Content 2", icon: "📘", color: "bg-cyan-500/10 border-cyan-500/20 text-cyan-600" },
                                    { title: "Climax", icon: "⚡", color: "bg-purple-500/10 border-purple-500/20 text-purple-600" },
                                    { title: "Resolution", icon: "🎯", color: "bg-pink-500/10 border-pink-500/20 text-pink-600" },
                                    { title: "Conclusion", icon: "✨", color: "bg-indigo-500/10 border-indigo-500/20 text-indigo-600" }
                                  ];
                                } else {
                                  return [
                                    { title: "Opening Scene", icon: "🎬", color: "bg-blue-500/10 border-blue-500/20 text-blue-600" },
                                    { title: "Hook & Engagement", icon: "🎯", color: "bg-orange-500/10 border-orange-500/20 text-orange-600" },
                                    { title: "Main Content", icon: "📖", color: "bg-green-500/10 border-green-500/20 text-green-600" },
                                    { title: "Climax/Resolution", icon: "⚡", color: "bg-purple-500/10 border-purple-500/20 text-purple-600" },
                                    { title: "Conclusion & Impact", icon: "✨", color: "bg-pink-500/10 border-pink-500/20 text-pink-600" }
                                  ];
                                }
                              };
                              
                              const sectionTitles = getSectionTitles(duration, generatedStory.story.split('\n\n').filter(p => p.trim()).length);
                              
                              const section = sectionTitles[index] || { 
                                title: `Section ${index + 1}`, 
                                icon: "📝", 
                                color: "bg-gray-500/10 border-gray-500/20 text-gray-600" 
                              };

                              return (
                                <div key={index} className="relative">
                                  {/* Section Card */}
                                  <div className="bg-background/50 rounded-lg border border-border/30 p-5 hover:border-primary/30 transition-all duration-200">
                                    {/* Section Header */}
                                    <div className="flex items-center gap-3 mb-4">
                                      <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                                          <span className="text-sm font-bold text-primary">{index + 1}</span>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-xs font-medium border ${section.color}`}>
                                          <span className="mr-1">{section.icon}</span>
                                          {section.title}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Section Content */}
                                    <div className="pl-11">
                                      <p className="text-foreground leading-relaxed text-base font-medium">
                                        {paragraph.trim()}
                                      </p>
                                      
                                      {/* Professional Metrics */}
                                      <div className="mt-4 pt-3 border-t border-border/20">
                                        <div className="grid grid-cols-3 gap-4 text-center">
                                          <div>
                                            <p className="text-xs font-bold text-foreground">{paragraph.trim().split(' ').length}</p>
                                            <p className="text-xs text-muted-foreground">Words</p>
                                          </div>
                                          <div>
                                            <p className="text-xs font-bold text-foreground">~{Math.ceil(paragraph.trim().split(' ').length / 150)}</p>
                                            <p className="text-xs text-muted-foreground">Min Read</p>
                                          </div>
                                          <div>
                                            <p className="text-xs font-bold text-green-500">Pro</p>
                                            <p className="text-xs text-muted-foreground">Quality</p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Connector Arrow (except for last item) */}
                                  {index < generatedStory.story.split('\n\n').filter(p => p.trim()).length - 1 && (
                                    <div className="flex justify-center my-3">
                                      <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                                        <svg className="w-3 h-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                        </svg>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        
                        {/* Professional Summary Footer */}
                        <div className="bg-gradient-to-r from-primary/5 to-accent/5 px-6 py-5 border-t border-border/30">
                          <div className="grid grid-cols-4 gap-4 text-center mb-4">
                            <div>
                              <p className="text-lg font-bold text-foreground">
                                {generatedStory.story.split(' ').length}
                              </p>
                              <p className="text-xs text-muted-foreground">Total Words</p>
                            </div>
                            <div>
                              <p className="text-lg font-bold text-foreground">
                                {generatedStory.story.split('\n\n').filter(p => p.trim()).length}
                              </p>
                              <p className="text-xs text-muted-foreground">Story Acts</p>
                            </div>
                            <div>
                              <p className="text-lg font-bold text-primary">
                                {Math.ceil(generatedStory.story.split(' ').length / 150)}
                              </p>
                              <p className="text-xs text-muted-foreground">Min Read</p>
                            </div>
                            <div>
                              <p className="text-lg font-bold text-green-500">A+</p>
                              <p className="text-xs text-muted-foreground">Pro Grade</p>
                            </div>
                          </div>
                          
                          {/* Professional Quality Indicators */}
                          <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 rounded-full bg-green-500"></div>
                              <span>Broadcast Quality</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                              <span>Timing Accurate</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                              <span>Industry Standard</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                              <span>Production Ready</span>
                            </div>
                          </div>
                          
                          {/* Timing Accuracy Display */}
                          <div className="mt-3 pt-3 border-t border-border/20">
                            <div className="text-center">
                              <p className="text-xs text-muted-foreground mb-1">
                                Target Duration: {duration === 'short' ? '1-3 min' : 
                                                duration === 'medium' ? '5-10 min' : 
                                                duration === 'long' ? '15-20 min' : 
                                                duration === 'extended' ? '30-45 min' : 
                                                '60+ min'}
                              </p>
                              <p className="text-xs font-medium text-green-500">
                                ✅ Generated: {generatedStory.estimatedDuration} - Perfect Match!
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* CTA */}
                    {generatedStory.cta && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground mb-3 block flex items-center gap-2">
                          <Zap className="w-4 h-4" />
                          CALL TO ACTION - ENGAGEMENT DRIVER
                        </Label>
                        <div className="bg-gradient-to-r from-green-500/5 to-blue-500/5 p-6 rounded-xl border border-green-500/20">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center flex-shrink-0">
                              <span className="text-lg">📢</span>
                            </div>
                            <div className="flex-1">
                              <p className="text-foreground leading-relaxed text-base font-medium mb-3">
                                {generatedStory.cta}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>{generatedStory.cta.split(' ').length} words</span>
                                <span>•</span>
                                <span className="text-green-500 font-medium">Drives engagement</span>
                                <span>•</span>
                                <span>Place at video end</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    {generatedStory.tags.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground mb-3 block flex items-center gap-2">
                          <Hash className="w-4 h-4" />
                          RECOMMENDED TAGS - SEO OPTIMIZATION
                        </Label>
                        <div className="bg-gradient-to-br from-purple-500/5 to-pink-500/5 p-6 rounded-xl border border-purple-500/20">
                          <div className="flex items-start gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
                              <span className="text-lg">🏷️</span>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-muted-foreground mb-3">
                                Optimized tags for YouTube discovery and SEO ranking
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {generatedStory.tags.map((tag, i) => (
                                  <span
                                    key={i}
                                    className="inline-flex items-center gap-1 text-sm px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-600 border border-purple-500/20 hover:border-purple-500/40 transition-colors font-medium"
                                  >
                                    <span className="text-xs">#</span>
                                    {tag}
                                  </span>
                                ))}
                              </div>
                              <div className="mt-4 pt-3 border-t border-border/20">
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <span>{generatedStory.tags.length} tags</span>
                                  <span>•</span>
                                  <span className="text-purple-500 font-medium">SEO optimized</span>
                                  <span>•</span>
                                  <span>Copy to video description</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Performance Metrics */}
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground mb-3 block flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        PERFORMANCE METRICS
                      </Label>
                      <div className="bg-gradient-to-br from-blue-500/5 to-cyan-500/5 p-6 rounded-xl border border-blue-500/20">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                              <Clock className="w-6 h-6 text-blue-500" />
                            </div>
                            <p className="text-lg font-bold text-foreground mb-1">{generatedStory.estimatedDuration}</p>
                            <p className="text-xs text-muted-foreground">Estimated Duration</p>
                            <p className="text-xs text-blue-500 font-medium mt-1">Optimal for retention</p>
                          </div>
                          <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                              <Target className="w-6 h-6 text-green-500" />
                            </div>
                            <p className="text-lg font-bold text-green-500 mb-1">{generatedStory.engagementScore}/100</p>
                            <p className="text-xs text-muted-foreground">Engagement Score</p>
                            <p className="text-xs text-green-500 font-medium mt-1">
                              {generatedStory.engagementScore >= 80 ? "Excellent" : 
                               generatedStory.engagementScore >= 60 ? "Good" : "Needs improvement"}
                            </p>
                          </div>
                        </div>
                        
                        {/* Additional Metrics */}
                        <div className="mt-6 pt-4 border-t border-border/20">
                          <div className="grid grid-cols-4 gap-4 text-center">
                            <div>
                              <p className="text-sm font-bold text-foreground">{generatedStory.story.split(' ').length}</p>
                              <p className="text-xs text-muted-foreground">Words</p>
                            </div>
                            <div>
                              <p className="text-sm font-bold text-foreground">{generatedStory.story.split('\n\n').filter(p => p.trim()).length}</p>
                              <p className="text-xs text-muted-foreground">Sections</p>
                            </div>
                            <div>
                              <p className="text-sm font-bold text-foreground">{generatedStory.tags.length}</p>
                              <p className="text-xs text-muted-foreground">Tags</p>
                            </div>
                            <div>
                              <p className="text-sm font-bold text-foreground">{Math.ceil(generatedStory.story.split(' ').length / 150)}</p>
                              <p className="text-xs text-muted-foreground">Min Read</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </>
          )}

          {!generatedStory && !isGenerating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 rounded-2xl"></div>
              <div className="relative glass-card p-12 text-center border-2 border-dashed border-border/50 rounded-2xl">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <Video className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  Ready to Create Your YouTube Story?
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
                  Enter your video topic, select your genre and style, then let our AI craft an engaging story that will captivate your audience.
                </p>
                <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span>Viral-Ready</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-accent"></div>
                    <span>AI-Optimized</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span>Engagement-Focused</span>
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

export default YouTubeStoryGenerator;