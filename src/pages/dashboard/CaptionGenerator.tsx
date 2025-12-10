import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useKeyboardShortcuts } from "@/lib/keyboardShortcuts";
import { CharacterCounter } from "@/components/ui/character-counter";
import { activityHistory } from "@/lib/activityHistory";
import { isDemoMode, showDemoRestriction } from "@/lib/demoMode";
import { hasCredits, useCredit, getCredits } from "@/lib/creditSystem";
import CreditDisplay from "@/components/dashboard/CreditDisplay";
import UpgradeModal from "@/components/dashboard/UpgradeModal";

import {
  Sparkles,
  Copy,
  Download,
  RefreshCw,
  Hash,
  MessageSquare,
  Smile,
  Briefcase,
  Heart,
  Minus,
  Library,
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
  { value: "instagram", label: "Instagram", icon: MessageSquare },
  { value: "tiktok", label: "TikTok", icon: MessageSquare },
  { value: "linkedin", label: "LinkedIn", icon: Briefcase },
  { value: "twitter", label: "Twitter/X", icon: MessageSquare },
  { value: "youtube", label: "YouTube", icon: MessageSquare },
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

  const [textInput, setTextInput] = useState("");
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [tone, setTone] = useState<Tone>("casual");
  const [language, setLanguage] = useState<Language>("english");
  const [length, setLength] = useState<"short" | "medium" | "long">("medium");
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [includeCTA, setIncludeCTA] = useState(true);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCaptions, setGeneratedCaptions] = useState<CaptionResult[]>([]);
  const [usageStats, setUsageStats] = useState<Record<string, number> | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

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

    // Validate text input
    if (!textInput.trim()) {
      toast.error("Please enter a topic or description");
      return;
    }

    const subject = textInput.trim();

    setIsGenerating(true);
    try {
      // Show AI loading message
      toast.info("🤖 Generating with AI... This may take 10-15 seconds");

      // Generate captions using AI only
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
        1, // Generate only 1 perfect caption
        true // Always use AI
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
      toast.success(`✅ Generated perfect AI-powered caption! Credits: ${remainingCredits.remaining}/${remainingCredits.total}`);
    } catch (error: any) {
      console.error("AI caption generation error:", error);
      toast.error("❌ AI generation failed. Please check your API keys and try again.");
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


          {/* Input Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6"
          >
            <Label className="text-lg font-semibold mb-4">Enter Topic or Description</Label>
            
            <Textarea
              placeholder="E.g., 'Morning coffee routine' or 'Sunset at the beach'"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              className="min-h-[120px] bg-secondary border-border resize-none"
            />


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
                <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/30">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <div className="flex-1">
                    <span className="text-foreground font-medium block">🤖 AI-Powered Generation</span>
                    <span className="text-xs text-muted-foreground">High-quality captions powered by advanced AI models</span>
                  </div>
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
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
                🤖 AI Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                🚀 Generate Caption
              </>
            )}
          </Button>
          {currentUsage >= monthlyLimit && (
            <p className="text-xs text-destructive text-center">
              Monthly limit reached. Upgrade to Pro for unlimited captions!
            </p>
          )}
          {!isAIAvailable() && (
            <p className="text-xs text-destructive text-center font-medium">
              ⚠️ AI API Key Required! Add VITE_ZAI_API_KEY, VITE_GROQ_API_KEY, or VITE_GEMINI_API_KEY to .env file
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
              {/* AI Generation Status */}
              <div className="glass-card p-6 text-center">
                <div className="flex items-center justify-center mb-4">
                  <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  🤖 Generating AI Captions...
                </h3>
                <p className="text-sm text-muted-foreground">
                  Creating 10 unique, scroll-stopping captions for you...
                </p>
                
                {/* Progress Animation */}
                <div className="mt-4 w-full bg-secondary rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full animate-pulse" style={{
                    width: '60%',
                    transition: 'width 3s ease-in-out'
                  }}></div>
                </div>
                
                <p className="text-xs text-muted-foreground mt-2">
                  AI is analyzing your content...
                </p>
              </div>

              {/* Loading Skeletons for Captions */}
              <div className="space-y-4">
                {[1,2,3,4,5].map(i => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="glass-card p-4"
                  >
                    <div className="space-y-3">
                      <div className="w-full h-4 bg-muted/30 rounded animate-pulse"></div>
                      <div className="w-4/5 h-4 bg-muted/30 rounded animate-pulse"></div>
                      <div className="w-3/4 h-4 bg-muted/30 rounded animate-pulse"></div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-4">
                      {[1,2,3,4].map(j => (
                        <div key={j} className="w-16 h-6 bg-primary/20 rounded-full animate-pulse"></div>
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs mt-3">
                      <div className="w-20 h-3 bg-muted/30 rounded animate-pulse"></div>
                      <div className="w-24 h-3 bg-muted/30 rounded animate-pulse"></div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {generatedCaptions.length > 0 && !isGenerating && (
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
              <div className="space-y-6 max-h-[800px] overflow-y-auto pr-2">
                {generatedCaptions.map((caption, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="overflow-hidden bg-gradient-to-br from-background to-secondary/20 border-2 border-border hover:border-primary/30 transition-all duration-300 shadow-lg hover:shadow-xl">
                      {/* Header */}
                      <div className="bg-gradient-to-r from-primary/10 to-accent/10 px-5 py-3 border-b border-border/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                              {index + 1}
                            </div>
                            <div>
                              <h4 className="font-semibold text-foreground text-sm">Caption Variation {index + 1}</h4>
                              <p className="text-xs text-muted-foreground">
                                {platform.charAt(0).toUpperCase() + platform.slice(1)} • {tone.charAt(0).toUpperCase() + tone.slice(1)} tone
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">
                              ✨ Premium Quality
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 space-y-4">
                        {/* Caption Text */}
                        <div className="relative">
                          <div className="absolute -left-2 top-0 w-1 h-full bg-gradient-to-b from-primary to-accent rounded-full opacity-30"></div>
                          <div className="pl-4">
                            <p className="text-foreground leading-relaxed whitespace-pre-wrap text-sm">
                              {caption.text}
                            </p>
                          </div>
                        </div>

                        {/* Hashtags */}
                        {caption.hashtags.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                              Trending Hashtags
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {caption.hashtags.map((tag, i) => (
                                <span
                                  key={i}
                                  className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 text-primary border border-primary/20 hover:border-primary/40 transition-colors"
                                >
                                  <span className="text-xs">#</span>
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 pt-3 border-t border-border/50">
                          <div className="text-center">
                            <p className="text-sm font-bold text-foreground">{caption.characterCount}</p>
                            <p className="text-xs text-muted-foreground">Characters</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-bold text-foreground">{caption.hashtags.length}</p>
                            <p className="text-xs text-muted-foreground">Hashtags</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-bold text-primary">{caption.readabilityScore}/100</p>
                            <p className="text-xs text-muted-foreground">Quality</p>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="bg-secondary/30 px-5 py-3 border-t border-border/50">
                        <Button
                          size="sm"
                          variant="default"
                          className="w-full bg-primary hover:bg-primary/90"
                          onClick={() => handleCopyCaption(caption)}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Caption
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </>
          )}

          {generatedCaptions.length === 0 && !isGenerating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 rounded-2xl"></div>
              <div className="relative glass-card p-12 text-center border-2 border-dashed border-border/50 rounded-2xl">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  Ready to Generate Perfect Caption?
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
                  Enter your content, select your platform and tone, then let our AI create the perfect caption for you.
                </p>
                <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span>Perfect Quality</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-accent"></div>
                    <span>AI-Powered</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span>Auto-Saved</span>
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

export default CaptionGenerator;
