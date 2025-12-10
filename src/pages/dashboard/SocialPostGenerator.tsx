import { useState } from "react";
import { motion } from "framer-motion";
import { hasCredits, useCredit, getCredits } from "@/lib/creditSystem";
import { activityHistory } from "@/lib/activityHistory";
import CreditDisplay from "@/components/dashboard/CreditDisplay";
import UpgradeModal from "@/components/dashboard/UpgradeModal";
import {
  Sparkles,
  Copy,
  Save,
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
import { Slider } from "@/components/ui/slider";

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
        toast.info("Generating with AI... This may take 10-15 seconds");
      }
      
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
      toast.success(`Generated ${posts.length} ${useAI ? 'AI-powered' : 'quick'} post variations! Credits: ${remainingCredits.remaining}/${remainingCredits.total}`);
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
                {useAI ? 'AI Generating...' : 'Generating...'}
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                {useAI ? 'Generate with AI' : 'Generate Posts (Quick)'}
              </>
            )}
          </Button>
          {!isAIAvailable() && (
            <p className="text-xs text-muted-foreground text-center">
              💡 Add VITE_HUGGINGFACE_API_KEY to .env for AI-powered generation
            </p>
          )}
        </div>

        {/* Right Column - Output */}
        <div className="space-y-6">
          {generatedPosts.length > 0 && (
            <>
              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3"
              >
                <Button variant="outline" className="flex-1" onClick={handleExportAll}>
                  <Download className="w-4 h-4" />
                  Export All
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setGeneratedPosts([])}
                >
                  <RefreshCw className="w-4 h-4" />
                  Clear
                </Button>
              </motion.div>

              {/* Generated Posts */}
              <div className="space-y-4">
                {generatedPosts.map((post, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="p-5 space-y-4 bg-secondary/30 border-border hover:border-primary/50 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                              Variation {index + 1}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {post.characterCount} characters
                            </span>
                          </div>
                          <p className="text-sm text-foreground whitespace-pre-wrap mb-4">
                            {post.text}
                          </p>

                          {post.hashtags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {post.hashtags.map((tag, i) => (
                                <span
                                  key={i}
                                  className="text-xs px-2 py-1 rounded-full bg-accent/10 text-accent"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-3 border-t border-border">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleCopy(post)}
                        >
                          <Copy className="w-4 h-4" />
                          Copy
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </>
          )}

          {generatedPosts.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card p-12 text-center"
            >
              <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No posts generated yet
              </h3>
              <p className="text-sm text-muted-foreground">
                Fill in the details and click "Generate Posts" to create 3 variations
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

export default SocialPostGenerator;
