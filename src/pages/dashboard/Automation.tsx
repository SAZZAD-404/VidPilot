import { useState } from "react";
import { motion } from "framer-motion";
import {
  Bot,
  Sparkles,
  Calendar,
  Zap,
  Play,
  Settings,
  TrendingUp,
  Lightbulb,
  Video,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import {
  automateVideoCreation,
  batchAutomateVideos,
  generateContentIdeas,
  type AutomationConfig,
} from "@/lib/aiVideoAutomation";

const Automation = () => {
  const { user } = useAuth();
  const [topic, setTopic] = useState("");
  const [style, setStyle] = useState<"motivational" | "tutorial" | "story" | "news">("motivational");
  const [duration, setDuration] = useState(20);
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [autoPost, setAutoPost] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedIdeas, setGeneratedIdeas] = useState<string[]>([]);
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
  const [batchTopics, setBatchTopics] = useState("");
  const [isBatchGenerating, setIsBatchGenerating] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const platformOptions = [
    { id: "youtube", name: "YouTube", icon: "🎥" },
    { id: "tiktok", name: "TikTok", icon: "🎵" },
    { id: "instagram", name: "Instagram", icon: "📸" },
    { id: "facebook", name: "Facebook", icon: "👥" },
    { id: "linkedin", name: "LinkedIn", icon: "💼" },
  ];

  const handlePlatformToggle = (platformId: string) => {
    setPlatforms((prev) =>
      prev.includes(platformId)
        ? prev.filter((p) => p !== platformId)
        : [...prev, platformId]
    );
  };

  const handleSingleAutomation = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }

    if (!user) {
      toast.error("Please login first");
      return;
    }

    setIsGenerating(true);
    try {
      toast.info("🤖 Starting AI automation...");

      const config: AutomationConfig = {
        topic,
        style,
        duration,
        platforms: platforms as any[],
        autoPost,
      };

      const result = await automateVideoCreation(user.id, config);

      if (result.status === "success") {
        toast.success("🎉 Video created and scheduled successfully!");
        setResults([result]);
        setTopic("");
      } else if (result.status === "partial") {
        toast.warning("Video created but some schedules failed");
        setResults([result]);
      }
    } catch (error: any) {
      console.error("Automation error:", error);
      toast.error(error.message || "Automation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBatchAutomation = async () => {
    if (!batchTopics.trim()) {
      toast.error("Please enter topics (one per line)");
      return;
    }

    if (!user) {
      toast.error("Please login first");
      return;
    }

    const topics = batchTopics
      .split("\n")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (topics.length === 0) {
      toast.error("No valid topics found");
      return;
    }

    setIsBatchGenerating(true);
    try {
      toast.info(`🤖 Creating ${topics.length} videos...`);

      const config = {
        style,
        duration,
        platforms: platforms as any[],
        autoPost,
      };

      const results = await batchAutomateVideos(user.id, topics, config);

      const successCount = results.filter((r) => r.status === "success").length;
      
      if (successCount === results.length) {
        toast.success(`🎉 All ${successCount} videos created successfully!`);
      } else {
        toast.warning(`${successCount}/${results.length} videos created successfully`);
      }

      setResults(results);
      setBatchTopics("");
    } catch (error: any) {
      console.error("Batch automation error:", error);
      toast.error(error.message || "Batch automation failed");
    } finally {
      setIsBatchGenerating(false);
    }
  };

  const handleGenerateIdeas = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a niche or topic");
      return;
    }

    setIsGeneratingIdeas(true);
    try {
      toast.info("💡 Generating content ideas...");

      const ideas = await generateContentIdeas(topic, 10);
      setGeneratedIdeas(ideas);
      toast.success(`Generated ${ideas.length} content ideas!`);
    } catch (error: any) {
      console.error("Ideas generation error:", error);
      toast.error("Failed to generate ideas");
    } finally {
      setIsGeneratingIdeas(false);
    }
  };

  const handleUseIdea = (idea: string) => {
    setTopic(idea);
    toast.success("Idea added to topic field!");
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
          <Bot className="w-8 h-8 text-primary" />
          AI Video Automation
        </h1>
        <p className="text-muted-foreground mt-1">
          Create videos automatically with AI - from script to post
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column - Single Automation */}
        <div className="space-y-6">
          {/* Single Video Automation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Single Video Automation
            </h2>

            <div className="space-y-4">
              {/* Topic Input */}
              <div>
                <Label>Video Topic</Label>
                <Input
                  placeholder="E.g., Morning productivity tips"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="bg-secondary border-border"
                />
              </div>

              {/* Style Selection */}
              <div>
                <Label>Video Style</Label>
                <Select value={style} onValueChange={(v: any) => setStyle(v)}>
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="motivational">🔥 Motivational</SelectItem>
                    <SelectItem value="tutorial">📚 Tutorial</SelectItem>
                    <SelectItem value="story">📖 Story</SelectItem>
                    <SelectItem value="news">📰 News</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Duration */}
              <div>
                <Label>Duration (seconds)</Label>
                <Input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="bg-secondary border-border"
                  min={10}
                  max={60}
                />
              </div>

              {/* Platform Selection */}
              <div>
                <Label className="mb-3 block">Target Platforms</Label>
                <div className="grid grid-cols-2 gap-2">
                  {platformOptions.map((platform) => (
                    <label
                      key={platform.id}
                      className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        platforms.includes(platform.id)
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <Checkbox
                        checked={platforms.includes(platform.id)}
                        onCheckedChange={() => handlePlatformToggle(platform.id)}
                      />
                      <span className="text-xl">{platform.icon}</span>
                      <span className="text-sm font-medium">{platform.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Auto Post */}
              <label className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 cursor-pointer">
                <Checkbox checked={autoPost} onCheckedChange={(c: boolean) => setAutoPost(c)} />
                <div className="flex-1">
                  <p className="font-medium">Auto-Post to Platforms</p>
                  <p className="text-xs text-muted-foreground">
                    Schedule posts automatically after video creation
                  </p>
                </div>
              </label>

              {/* Generate Button */}
              <Button
                variant="hero"
                className="w-full"
                onClick={handleSingleAutomation}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating Video...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    Create Video with AI
                  </>
                )}
              </Button>
            </div>
          </motion.div>

          {/* Content Ideas Generator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6"
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-accent" />
              AI Content Ideas
            </h2>

            <div className="space-y-4">
              <div>
                <Label>Your Niche</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="E.g., Fitness, Business, Cooking"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="bg-secondary border-border"
                  />
                  <Button
                    onClick={handleGenerateIdeas}
                    disabled={isGeneratingIdeas}
                    variant="outline"
                  >
                    {isGeneratingIdeas ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {generatedIdeas.length > 0 && (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  <Label>Generated Ideas (Click to use)</Label>
                  {generatedIdeas.map((idea, index) => (
                    <button
                      key={index}
                      onClick={() => handleUseIdea(idea)}
                      className="w-full text-left p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors text-sm"
                    >
                      💡 {idea}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Right Column - Batch Automation & Results */}
        <div className="space-y-6">
          {/* Batch Automation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6"
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Video className="w-5 h-5 text-primary" />
              Batch Video Creation
            </h2>

            <div className="space-y-4">
              <div>
                <Label>Topics (One per line)</Label>
                <Textarea
                  placeholder="Morning routine tips&#10;Productivity hacks&#10;Success mindset&#10;Time management"
                  value={batchTopics}
                  onChange={(e) => setBatchTopics(e.target.value)}
                  className="min-h-[150px] bg-secondary border-border resize-none font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {batchTopics.split("\n").filter((t) => t.trim()).length} topics
                </p>
              </div>

              <Button
                variant="hero"
                className="w-full"
                onClick={handleBatchAutomation}
                disabled={isBatchGenerating}
              >
                {isBatchGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating Videos...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Create All Videos
                  </>
                )}
              </Button>
            </div>
          </motion.div>

          {/* Results */}
          {results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6"
            >
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-accent" />
                Automation Results
              </h2>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 ${
                      result.status === "success"
                        ? "border-green-500/30 bg-green-500/10"
                        : result.status === "partial"
                        ? "border-yellow-500/30 bg-yellow-500/10"
                        : "border-red-500/30 bg-red-500/10"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {result.status === "success" ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      ) : result.status === "partial" ? (
                        <Clock className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">
                          Video {index + 1}
                          {result.status === "success" && " - Created Successfully"}
                          {result.status === "partial" && " - Partially Created"}
                          {result.status === "failed" && " - Failed"}
                        </p>
                        {result.videoId && (
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            ID: {result.videoId}
                          </p>
                        )}
                        {result.videoUrl && result.status === "success" && (
                          <div className="mt-2">
                            <video
                              src={result.videoUrl}
                              controls
                              className="w-full max-w-xs rounded-lg"
                              style={{ maxHeight: "200px" }}
                            >
                              Your browser does not support video playback.
                            </video>
                          </div>
                        )}
                        {result.scheduleIds && result.scheduleIds.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Scheduled for {result.scheduleIds.length} platform(s)
                          </p>
                        )}
                        {result.script && result.status === "success" && (
                          <details className="mt-2">
                            <summary className="text-xs text-primary cursor-pointer hover:underline">
                              View Script
                            </summary>
                            <pre className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap bg-secondary/30 p-2 rounded">
                              {result.script}
                            </pre>
                          </details>
                        )}
                        {result.errors && result.errors.length > 0 && (
                          <p className="text-xs text-red-500 mt-1">
                            {result.errors[0]}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 rounded-lg bg-secondary/30">
                <p className="text-sm font-medium">
                  ✅ Success: {results.filter((r) => r.status === "success").length} /{" "}
                  {results.length}
                </p>
              </div>
            </motion.div>
          )}

          {/* Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6 bg-gradient-to-br from-primary/10 to-accent/10"
          >
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              How It Works
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">1.</span>
                <span>AI generates engaging script from your topic</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">2.</span>
                <span>Video is created automatically with template</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">3.</span>
                <span>Saved to your video library</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">4.</span>
                <span>Optionally scheduled for social media</span>
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Automation;
