import { useState } from "react";
import { motion } from "framer-motion";
import { hasCredits, useCredit, getCredits } from "@/lib/creditSystem";
import { activityHistory } from "@/lib/activityHistory";
import CreditDisplay from "@/components/dashboard/CreditDisplay";
import UpgradeModal from "@/components/dashboard/UpgradeModal";
import {
  Sparkles,
  Copy,
  Download,
  RefreshCw,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import {
  type Platform,
  type Tone,
  type Length,
  type PostVariation,
} from "@/lib/socialPostAdapter";
import { generateAIPosts, isAIAvailable } from "@/lib/aiPostGenerator";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";


const platforms: { value: Platform; label: string; color: string }[] = [
  { value: "facebook", label: "Facebook", color: "bg-blue-600" },
  { value: "instagram", label: "Instagram", color: "bg-pink-600" },
  { value: "linkedin", label: "LinkedIn", color: "bg-blue-700" },
  { value: "twitter", label: "Twitter/X", color: "bg-black" },
  { value: "youtube", label: "YouTube", color: "bg-red-600" },
];

const tones: { value: Tone; label: string; emoji: string }[] = [
  { value: "funny", label: "Funny", emoji: "😂" },
  { value: "professional", label: "Professional", emoji: "💼" },
  { value: "emotional", label: "Emotional", emoji: "❤️" },
  { value: "trendy", label: "Trendy", emoji: "🔥" },
  { value: "minimal", label: "Minimal", emoji: "✨" },
  { value: "storytelling", label: "Storytelling", emoji: "📖" },
  { value: "marketing", label: "Marketing", emoji: "🎯" },
];

const SocialPostGenerator = () => {
  const { user } = useAuth();
  
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [topic, setTopic] = useState("");
  const [brand, setBrand] = useState("");
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState<Tone>("trendy");
  const [length, setLength] = useState<Length>("medium");
  const [includeCTA, setIncludeCTA] = useState(true);
  const [useAI, setUseAI] = useState(isAIAvailable());
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPosts, setGeneratedPosts] = useState<PostVariation[]>([]);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic or idea");
      return;
    }
    
    if (!audience.trim()) {
      toast.error("Please enter your target audience");
      return;
    }

    // Check credits
    if (!hasCredits(1, user?.id)) {
      setShowUpgradeModal(true);
      return;
    }

    setIsGenerating(true);
    try {
      // Show loading message based on mode
      if (useAI) {
        toast.info("🤖 Generating posts with AI... This may take 10-15 seconds");
      }
      
      // Generate posts
      const posts = await generateAIPosts({
        platform,
        topic: topic.trim(),
        brand: brand.trim(),
        audience: audience.trim(),
        tone,
        length,
        includeCTA,
        useAI,
      });

      setGeneratedPosts(posts);
      
      // Save to activity history
      try {
        activityHistory.addSocialPostGeneration(posts, {
          platform,
          topic: topic.trim(),
          brand: brand.trim(),
          audience: audience.trim(),
          tone,
          length,
          useAI
        });
      } catch (historyError) {
        console.error('Error saving to activity history:', historyError);
        // Don't fail the whole generation if history fails
      }
      
      // Deduct credit after successful generation
      useCredit(1, user?.id);
      
      const remainingCredits = getCredits(user?.id);
      toast.success(`✅ Generated perfect AI-powered post! Credits: ${remainingCredits.remaining}/${remainingCredits.total}`);
    } catch (error: any) {
      console.error("Post generation error:", error);
      toast.error("Failed to generate posts");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (post: PostVariation) => {
    const fullText = `${post.text}\n\n${
      post.hashtags.length > 0 ? post.hashtags.map(tag => `#${tag}`).join(" ") : ""
    }`;
    navigator.clipboard.writeText(fullText);
    toast.success("Post copied to clipboard!");
  };

  const handleExportAll = () => {
    if (generatedPosts.length === 0) {
      toast.error("No posts to export");
      return;
    }

    const csvContent = [
      ["Post Text", "Hashtags", "CTA", "Character Count"],
      ...generatedPosts.map(p => [
        p.text.replace(/\n/g, " "),
        p.hashtags.join(" "),
        p.cta || "",
        p.characterCount.toString(),
      ]),
    ]
      .map(row => row.map(cell => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `social-posts-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    // Add export activity to history
    activityHistory.addExport("CSV", generatedPosts.length);
    
    toast.success("Posts exported!");
  };

  return (
    <div className="p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <MessageSquare className="w-8 h-8 text-primary" />
          AI Social Media Post Generator
        </h1>
        <p className="text-muted-foreground mt-1">
          Generate scroll-stopping social posts for any platform
        </p>
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
          {/* Platform Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="glass-card p-6"
          >
            <Label className="text-lg font-semibold mb-4">Select Platform</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {platforms.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPlatform(p.value)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    platform === p.value
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg ${p.color} mx-auto mb-2`} />
                  <p className="text-sm font-medium text-foreground">{p.label}</p>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Topic Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6"
          >
            <Label className="text-lg font-semibold mb-4">Topic / Product / Idea</Label>
            <Textarea
              placeholder="E.g., 'New eco-friendly water bottle' or 'Morning productivity tips'"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="min-h-[100px] bg-secondary border-border resize-none"
            />
          </motion.div>

          {/* Brand & Audience */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-card p-6 space-y-4"
          >
            <div>
              <Label className="text-sm font-medium mb-2">Brand Name (Optional)</Label>
              <Input
                placeholder="Your brand name"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="bg-secondary border-border"
              />
            </div>

            <div>
              <Label className="text-sm font-medium mb-2">Target Audience</Label>
              <Input
                placeholder="E.g., 'fitness enthusiasts' or 'small business owners'"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="bg-secondary border-border"
              />
            </div>
          </motion.div>

          {/* Tone Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6"
          >
            <Label className="text-lg font-semibold mb-4">Select Tone</Label>
            <div className="grid grid-cols-2 gap-3">
              {tones.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTone(t.value)}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    tone === t.value
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <span className="text-2xl mb-1 block">{t.emoji}</span>
                  <p className="text-sm font-medium text-foreground">{t.label}</p>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Length & CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass-card p-6 space-y-4"
          >
            <div>
              <Label className="text-sm font-medium mb-3">Post Length</Label>
              <Select value={length} onValueChange={(v) => setLength(v as Length)}>
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

            <label className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 cursor-pointer hover:bg-secondary/50 transition-colors">
              <MessageSquare className="w-5 h-5 text-primary" />
              <span className="flex-1 text-foreground">Include Call-to-Action (CTA)</span>
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
                  <span className="text-foreground font-medium block">🤖 AI-Powered Text Generation</span>
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


          </motion.div>

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
                {useAI ? '🤖 AI Generating...' : 'Generating...'}
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                🚀 Generate Posts
              </>
            )}
          </Button>
          <div className="text-xs text-center space-y-1">
            {!isAIAvailable() && (
              <p className="text-destructive font-medium">
                ⚠️ Add VITE_ZAI_API_KEY, VITE_GROQ_API_KEY, or VITE_GEMINI_API_KEY for AI text generation
              </p>
            )}
          </div>
        </div>

        {/* Right Column - Output */}
        <div className="space-y-6">
          {/* Loading Animation */}
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* AI Generation Status */}
              <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 animate-pulse"></div>
                <div className="relative glass-card p-8 text-center border-2 border-primary/20">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    🤖 AI is Crafting Your Perfect Post
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Our advanced AI is analyzing your requirements and creating engaging content...
                  </p>
                  
                  {/* Enhanced Progress Animation */}
                  <div className="relative w-full bg-secondary/50 rounded-full h-3 mb-4 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 animate-pulse"></div>
                    <div 
                      className="bg-gradient-to-r from-primary to-accent h-3 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                      style={{ width: '75%' }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                      <span>Analyzing Topic</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
                      <span>Optimizing for {platform}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      <span>Applying {tone} tone</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Loading Skeleton */}
              <div className="glass-card overflow-hidden border-2 border-border/50">
                {/* Header Skeleton */}
                <div className="bg-gradient-to-r from-primary/5 to-accent/5 px-6 py-4 border-b border-border/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 animate-pulse"></div>
                      <div className="space-y-2">
                        <div className="w-32 h-4 bg-muted/30 rounded animate-pulse"></div>
                        <div className="w-24 h-3 bg-muted/20 rounded animate-pulse"></div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-20 h-6 bg-primary/20 rounded-full animate-pulse"></div>
                      <div className="w-16 h-6 bg-muted/20 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
                
                {/* Content Skeleton */}
                <div className="p-6 space-y-4">
                  <div className="space-y-3">
                    <div className="w-full h-4 bg-muted/30 rounded animate-pulse"></div>
                    <div className="w-5/6 h-4 bg-muted/30 rounded animate-pulse"></div>
                    <div className="w-4/5 h-4 bg-muted/30 rounded animate-pulse"></div>
                    <div className="w-3/4 h-4 bg-muted/30 rounded animate-pulse"></div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="w-20 h-3 bg-muted/20 rounded animate-pulse"></div>
                    <div className="flex flex-wrap gap-2">
                      {[1,2,3,4,5].map(i => (
                        <div key={i} className="w-16 h-7 bg-accent/20 rounded-full animate-pulse"></div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/30">
                    {[1,2,3].map(i => (
                      <div key={i} className="text-center space-y-1">
                        <div className="w-8 h-6 bg-muted/30 rounded mx-auto animate-pulse"></div>
                        <div className="w-12 h-3 bg-muted/20 rounded mx-auto animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Actions Skeleton */}
                <div className="bg-secondary/30 px-6 py-4 border-t border-border/50">
                  <div className="flex gap-3">
                    <div className="flex-1 h-9 bg-primary/20 rounded animate-pulse"></div>
                    <div className="w-12 h-9 bg-muted/20 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {generatedPosts.length > 0 && !isGenerating && (
            <>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-secondary/20 to-accent/10 p-4 rounded-xl border border-border/50"
              >
                <div className="flex gap-3">
                  <Button 
                    variant="default" 
                    className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg" 
                    onClick={handleExportAll}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export All Posts
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-2 hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive"
                    onClick={() => {
                      setGeneratedPosts([]);
                    }}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Clear All
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  💡 Tip: Copy individual posts or export all as CSV for easy sharing
                </p>
              </motion.div>

              {/* Generated Posts */}
              <div className="space-y-6">
                {generatedPosts.map((post, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="overflow-hidden bg-gradient-to-br from-background to-secondary/20 border-2 border-border hover:border-primary/30 transition-all duration-300 shadow-lg hover:shadow-xl">
                      {/* Header */}
                      <div className="bg-gradient-to-r from-primary/10 to-accent/10 px-6 py-4 border-b border-border/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                              <Sparkles className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-foreground">AI-Generated Post</h3>
                              <p className="text-xs text-muted-foreground">
                                {platform.charAt(0).toUpperCase() + platform.slice(1)} • {tone.charAt(0).toUpperCase() + tone.slice(1)} tone
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">
                              ✨ Premium Quality
                            </span>
                            <span className="text-xs px-2 py-1 rounded-full bg-muted/20 text-muted-foreground">
                              {post.characterCount} chars
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6 space-y-4">
                        {/* Post Text */}
                        <div className="relative">
                          <div className="absolute -left-2 top-0 w-1 h-full bg-gradient-to-b from-primary to-accent rounded-full opacity-30"></div>
                          <div className="pl-4">
                            <p className="text-foreground leading-relaxed whitespace-pre-wrap text-base font-medium">
                              {post.text}
                            </p>
                          </div>
                        </div>

                        {/* Hashtags */}
                        {post.hashtags.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                              Trending Hashtags
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {post.hashtags.map((tag, i) => (
                                <span
                                  key={i}
                                  className="inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded-full bg-gradient-to-r from-accent/10 to-primary/10 text-accent border border-accent/20 hover:border-accent/40 transition-colors"
                                >
                                  <span className="text-xs">#</span>
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* CTA */}
                        {post.cta && (
                          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                              Call to Action
                            </p>
                            <p className="text-sm text-primary font-medium">
                              {post.cta}
                            </p>
                          </div>
                        )}

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/50">
                          <div className="text-center">
                            <p className="text-lg font-bold text-foreground">{post.characterCount}</p>
                            <p className="text-xs text-muted-foreground">Characters</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold text-foreground">{post.hashtags.length}</p>
                            <p className="text-xs text-muted-foreground">Hashtags</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold text-primary">A+</p>
                            <p className="text-xs text-muted-foreground">AI Quality</p>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="bg-secondary/30 px-6 py-4 border-t border-border/50">
                        <div className="flex gap-3">
                          <Button
                            size="sm"
                            variant="default"
                            className="flex-1 bg-primary hover:bg-primary/90"
                            onClick={() => handleCopy(post)}
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Copy Post
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const fullText = `${post.text}\n\n${
                                post.hashtags.length > 0 ? post.hashtags.map(tag => `#${tag}`).join(" ") : ""
                              }`;
                              const blob = new Blob([fullText], { type: 'text/plain' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `social-post-${Date.now()}.txt`;
                              a.click();
                              URL.revokeObjectURL(url);
                            }}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </>
          )}

          {generatedPosts.length === 0 && !isGenerating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 rounded-2xl"></div>
              <div className="relative glass-card p-12 text-center border-2 border-dashed border-border/50 rounded-2xl">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <MessageSquare className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  Ready to Create Amazing Content?
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
                  Fill in your topic, select your platform and tone, then let our AI create the perfect social media post for you.
                </p>
                <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span>AI-Powered</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-accent"></div>
                    <span>Platform Optimized</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span>Engagement Ready</span>
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

export default SocialPostGenerator;
