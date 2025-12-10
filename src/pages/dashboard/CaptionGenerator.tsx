import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useKeyboardShortcuts } from "@/lib/keyboardShortcuts";
import { CharacterCounter } from "@/components/ui/character-counter";
import { activityHistory } from "@/lib/activityHistory";
import { isDemoMode, showDemoRestriction } from "@/lib/demoMode";
import { hasCredits, useCredit, getCredits } from "@/lib/creditSystem";
import CreditDisplay from "@/components/dashboard/CreditDisplay";
import UpgradeModal from "@/components/dashboard/UpgradeModal";
import AIStatusChecker from "@/components/dashboard/AIStatusChecker";
import {
  Sparkles,
  Image as ImageIcon,
  Video,
  Type,
  Copy,
  Download,
  RefreshCw,
  Upload,
  Hash,
  MessageSquare,
  Globe,
  Smile,
  Briefcase,
  Heart,
  Minus,
  Library,
  Settings,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useCaptions } from "@/hooks/useCaptions";
import {
  extractSubjectFromImage,
  extractSubjectFromVideo,
  type Platform,
  type Tone,
  type Language,
  type CaptionResult,
} from "@/lib/captionAdapter";
import { generateAICaptions, isAIAvailable } from "@/lib/aiCaptionGenerator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";

const platforms: { value: Platform; label: string; icon: any }[] = [
  { value: "instagram", label: "Instagram", icon: ImageIcon },
  { value: "tiktok", label: "TikTok", icon: Video },
  { value: "linkedin", label: "LinkedIn", icon: Briefcase },
  { value: "twitter", label: "Twitter/X", icon: MessageSquare },
  { value: "youtube", label: "YouTube", icon: Video },
];

const tones: { value: Tone; label: string; icon: any }[] = [
  { value: "casual", label: "Casual", icon: Smile },
  { value: "professional", label: "Professional", icon: Briefcase },
  { value: "funny", label: "Funny", icon: Smile },
  { value: "emotional", label: "Emotional", icon: Heart },
  { value: "minimal", label: "Minimal", icon: Minus },
];

const CaptionGenerator = () => {
  const { user } = useAuth();
  const {
    captions: savedCaptions,
    fetchCaptions,
    saveCaption,
    saveCaptions,
    trackUsage,
    getUsageStats,
  } = useCaptions();

  const [inputType, setInputType] = useState<"text" | "image" | "video">("text");
  const [textInput, setTextInput] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [tone, setTone] = useState<Tone>("casual");
  const [language, setLanguage] = useState<Language>("english");
  const [length, setLength] = useState<"short" | "medium" | "long">("medium");
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [includeCTA, setIncludeCTA] = useState(true);
  const [useAI, setUseAI] = useState(isAIAvailable());
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCaptions, setGeneratedCaptions] = useState<CaptionResult[]>([]);
  const [usageStats, setUsageStats] = useState<Record<string, number> | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showAIStatus, setShowAIStatus] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      fetchCaptions();
      loadUsageStats();
    }
  }, [user]);

  const loadUsageStats = async () => {
    const stats = await getUsageStats();
    setUsageStats(stats);
  };

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

  const handleGenerate = async () => {
    // Check demo mode (only if not logged in)
    if (isDemoMode() && !user) {
      showDemoRestriction(toast);
      return;
    }

    // Check credits
    if (!hasCredits(1, user?.id)) {
      setShowUpgradeModal(true);
      return;
    }

    let subject = "";

    // Extract subject based on input type
    if (inputType === "text") {
      if (!textInput.trim()) {
        toast.error("Please enter a topic or description");
        return;
      }
      subject = textInput.trim();
    } else if (inputType === "image") {
      if (!imageFile) {
        toast.error("Please select an image");
        return;
      }
      
      // Show analyzing message
      toast.info("🔍 Analyzing image with AI...", { duration: 3000 });
      
      try {
        subject = await extractSubjectFromImage(URL.createObjectURL(imageFile));
        toast.success(`✅ Image analyzed: "${subject}"`);
      } catch (error) {
        console.error('Image analysis failed:', error);
        toast.warning("⚠️ Using smart fallback for image analysis");
        subject = await extractSubjectFromImage(URL.createObjectURL(imageFile));
      }
    } else if (inputType === "video") {
      if (!videoUrl.trim()) {
        toast.error("Please enter a video URL");
        return;
      }
      
      // Validate video URL
      const urlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|tiktok\.com|instagram\.com|facebook\.com)/i;
      if (!urlPattern.test(videoUrl.trim())) {
        toast.error("Please enter a valid video URL (YouTube, TikTok, Instagram, Facebook)");
        return;
      }
      
      // Show analyzing message
      toast.info("🔍 Analyzing video content...", { duration: 3000 });
      
      try {
        subject = await extractSubjectFromVideo(videoUrl.trim());
        toast.success(`✅ Video analyzed: "${subject}"`);
      } catch (error) {
        console.error('Video analysis failed:', error);
        toast.warning("⚠️ Using smart fallback for video analysis");
        subject = await extractSubjectFromVideo(videoUrl.trim());
      }
    }

    setIsGenerating(true);
    try {
      // Show loading message based on mode
      if (useAI) {
        toast.info("Generating with AI... This may take 10-15 seconds");
      }

      // Generate captions using AI or rule-based
      const captions = await generateAICaptions(
        subject,
        {
          platform,
          tone,
          language,
          length,
          includeHashtags,
          includeCTA,
        },
        10,
        useAI
      );

      setGeneratedCaptions(captions);
      
      // Deduct credit after successful generation
      const creditUsed = useCredit(1, user?.id);
      if (!creditUsed) {
        toast.error("Failed to deduct credit");
      }
      
      // Auto-save all generated captions to history
      const captionsToSave = captions.map(caption => ({
        text: caption.text,
        hashtags: caption.hashtags,
        tone,
        language,
        platform,
        saved: true, // Auto-save to history
      }));
      
      await saveCaptions(captionsToSave);
      
      // Add to activity history
      activityHistory.addCaptionGeneration(captions, {
        platform,
        tone,
        language,
        subject,
      });
      
      // Track usage
      await trackUsage("caption_generation", 1);
      await loadUsageStats();
      
      const remainingCredits = getCredits(user?.id);
      toast.success(`Generated ${captions.length} ${useAI ? 'AI-powered' : 'quick'} captions! Credits: ${remainingCredits.remaining}/${remainingCredits.total}`);
    } catch (error: any) {
      console.error("Caption generation error:", error);
      toast.error("Failed to generate captions");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyCaption = (caption: CaptionResult) => {
    const fullText = `${caption.text}\n\n${
      caption.hashtags.length > 0 ? caption.hashtags.map(tag => `#${tag}`).join(" ") : ""
    }`;
    navigator.clipboard.writeText(fullText);
    toast.success("Caption copied to clipboard!");
  };



  const handleExportCSV = () => {
    if (generatedCaptions.length === 0) {
      toast.error("No captions to export");
      return;
    }

    const csvContent = [
      ["Caption", "Hashtags", "CTA", "Character Count", "Readability Score"],
      ...generatedCaptions.map(c => [
        c.text.replace(/\n/g, " "),
        c.hashtags.join(" "),
        c.cta,
        c.characterCount.toString(),
        c.readabilityScore.toString(),
      ]),
    ]
      .map(row => row.map(cell => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `captions-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    // Add export activity to history
    activityHistory.addExport("CSV", generatedCaptions.length);
    
    toast.success("Captions exported!");
  };

  const monthlyLimit = 100;
  const currentUsage = usageStats?.caption_generation || 0;
  const usagePercentage = (currentUsage / monthlyLimit) * 100;

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
              <Sparkles className="w-8 h-8 text-primary" />
              AI Caption Generator
            </h1>
            <p className="text-muted-foreground mt-1">
              Create viral captions in seconds — powered by AI
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAIStatus(!showAIStatus)}
            className="flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            AI Status
          </Button>
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

      {/* AI Status Checker */}
      {showAIStatus && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <AIStatusChecker />
        </motion.div>
      )}

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
            <Label className="text-lg font-semibold mb-4">Input Type</Label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setInputType("text")}
                className={`p-4 rounded-lg border-2 transition-all ${
                  inputType === "text"
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <Type className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">Text</p>
              </button>
              <button
                onClick={() => setInputType("image")}
                className={`p-4 rounded-lg border-2 transition-all ${
                  inputType === "image"
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <ImageIcon className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">Image</p>
              </button>
              <button
                onClick={() => setInputType("video")}
                className={`p-4 rounded-lg border-2 transition-all ${
                  inputType === "video"
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <Video className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">Video</p>
              </button>
            </div>
          </motion.div>

          {/* Input Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6"
          >
            <Label className="text-lg font-semibold mb-4">
              {inputType === "text" && "Enter Topic or Description"}
              {inputType === "image" && "Upload Image"}
              {inputType === "video" && "Video URL"}
            </Label>

            {inputType === "text" && (
              <Textarea
                placeholder="E.g., 'Morning coffee routine' or 'Sunset at the beach'"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="min-h-[120px] bg-secondary border-border resize-none"
              />
            )}

            {inputType === "image" && (
              <>
                <input
                  ref={fileInputRef}
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
                        🤖 AI will analyze your image for better captions!
                      </p>
                    </div>
                  </label>
                )}
              </>
            )}

            {inputType === "video" && (
              <div className="space-y-3">
                <Input
                  placeholder="https://youtube.com/watch?v=... or https://tiktok.com/@..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="bg-secondary border-border"
                />
                
                {/* Video URL Info */}
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>✅ Supported platforms:</p>
                  <div className="grid grid-cols-2 gap-1 ml-4">
                    <span>• YouTube & YouTube Shorts</span>
                    <span>• TikTok videos</span>
                    <span>• Instagram Reels</span>
                    <span>• Facebook videos</span>
                  </div>
                  <p className="text-primary font-medium mt-2">
                    🤖 AI will analyze video content for relevant captions!
                  </p>
                </div>
                
                {/* Video Preview (if valid URL) */}
                {videoUrl && /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|tiktok\.com|instagram\.com|facebook\.com)/i.test(videoUrl) && (
                  <div className="p-3 bg-primary/10 border border-primary/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-primary">
                        Valid video URL detected
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      AI will analyze this video when generating captions
                    </p>
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* Platform & Tone */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-card p-6 space-y-4"
          >
            <div>
              <Label className="text-sm font-medium mb-2">Platform</Label>
              <Select value={platform} onValueChange={(v) => setPlatform(v as Platform)}>
                <SelectTrigger className="bg-secondary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {platforms.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2">Tone</Label>
              <Select value={tone} onValueChange={(v) => setTone(v as Tone)}>
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
              <Select value={language} onValueChange={(v) => setLanguage(v as Language)}>
                <SelectTrigger className="bg-secondary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="bengali">Bengali (বাংলা)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2">Caption Length</Label>
              <Select value={length} onValueChange={(v) => setLength(v as any)}>
                <SelectTrigger className="bg-secondary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Short</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="long">Long</SelectItem>
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
            <Label className="text-lg font-semibold mb-4">Options</Label>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 cursor-pointer hover:bg-secondary/50 transition-colors">
                <Hash className="w-5 h-5 text-primary" />
                <span className="flex-1 text-foreground">Include Hashtags</span>
                <input
                  type="checkbox"
                  checked={includeHashtags}
                  onChange={(e) => setIncludeHashtags(e.target.checked)}
                  className="w-5 h-5 rounded accent-primary"
                />
              </label>
              <label className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 cursor-pointer hover:bg-secondary/50 transition-colors">
                <MessageSquare className="w-5 h-5 text-accent" />
                <span className="flex-1 text-foreground">Include CTA</span>
                <input
                  type="checkbox"
                  checked={includeCTA}
                  onChange={(e) => setIncludeCTA(e.target.checked)}
                  className="w-5 h-5 rounded accent-primary"
                />
              </label>

              {isAIAvailable() && (
                <label className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/30 cursor-pointer hover:bg-primary/20 transition-colors">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <div className="flex-1">
                    <span className="text-foreground font-medium block">AI-Powered Generation</span>
                    <span className="text-xs text-muted-foreground">Better quality, takes 10-15 seconds</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={useAI}
                    onChange={(e) => setUseAI(e.target.checked)}
                    className="w-5 h-5 rounded accent-primary"
                  />
                </label>
              )}
            </div>
          </motion.div>

          {/* Generate Button */}
          <Button
            variant="hero"
            className="w-full"
            onClick={handleGenerate}
            disabled={isGenerating || currentUsage >= monthlyLimit}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                {useAI ? 'AI Generating...' : 'Generating...'}
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                {useAI ? 'Generate with AI' : 'Generate Captions (Quick)'}
              </>
            )}
          </Button>
          {currentUsage >= monthlyLimit && (
            <p className="text-xs text-destructive text-center">
              Monthly limit reached. Upgrade to Pro for unlimited captions!
            </p>
          )}
          {!isAIAvailable() && (
            <p className="text-xs text-muted-foreground text-center">
              💡 Add VITE_ZAI_API_KEY, VITE_GROQ_API_KEY, or VITE_GEMINI_API_KEY to .env for AI-powered generation
            </p>
          )}
          
          {/* AI Vision Status */}
          {(inputType === "image" || inputType === "video") && (
            <div className="text-xs text-center space-y-1">
              {import.meta.env.VITE_GEMINI_API_KEY ? (
                <p className="text-primary font-medium">
                  🤖 Gemini Vision AI: Ready for {inputType} analysis
                </p>
              ) : (
                <p className="text-muted-foreground">
                  💡 Add VITE_GEMINI_API_KEY for advanced {inputType} AI analysis
                </p>
              )}
              {import.meta.env.VITE_ZAI_API_KEY && (
                <p className="text-purple-500 font-medium">
                  ✨ Z.ai Premium: Enhanced conversational AI ready
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right Column - Results */}
        <div className="space-y-6">
          {generatedCaptions.length > 0 && (
            <>
              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3"
              >
                <Button variant="outline" className="flex-1" onClick={handleExportCSV}>
                  <Download className="w-4 h-4" />
                  Export CSV
                </Button>
                <Button variant="outline" className="flex-1" asChild>
                  <Link to="/dashboard/history">
                    <Library className="w-4 h-4" />
                    View History
                  </Link>
                </Button>
              </motion.div>

              {/* Generated Captions */}
              <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2">
                {generatedCaptions.map((caption, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="p-4 space-y-3 bg-secondary/30 border-border hover:border-primary/50 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm text-foreground whitespace-pre-wrap flex-1">
                          {caption.text}
                        </p>
                        <div className="flex gap-2 flex-shrink-0">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCopyCaption(caption)}
                            title="Copy to clipboard"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {caption.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {caption.hashtags.map((tag, i) => (
                            <span
                              key={i}
                              className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{caption.characterCount} characters</span>
                        <span>•</span>
                        <span>Readability: {caption.readabilityScore}/100</span>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </>
          )}

          {generatedCaptions.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card p-12 text-center"
            >
              <Sparkles className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No captions yet
              </h3>
              <p className="text-sm text-muted-foreground">
                Enter your content and click "Generate Captions" to get started
              </p>
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

export default CaptionGenerator;
