import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { 
  Wand2, 
  Sparkles, 
  Video, 
  Captions, 
  Music, 
  Download,
  Play,
  RefreshCw,
  Save,
  Upload,
  FileVideo
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useVideos } from "@/hooks/useVideos";
import { useAuth } from "@/hooks/useAuth";
import { generateScript } from "@/lib/huggingface";
import { uploadVideo, generateCompleteVideo } from "@/lib/videoProcessing";
import { generateVideoFromScript } from "@/lib/aiVideoGenerator";
import VideoEditor from "@/components/VideoEditor";

const templates = [
  { id: 1, name: "Motivational", color: "from-primary to-accent" },
  { id: 2, name: "Tutorial", color: "from-blue-500 to-cyan-500" },
  { id: 3, name: "Story Time", color: "from-pink-500 to-rose-500" },
  { id: 4, name: "News Update", color: "from-emerald-500 to-green-500" },
];

const VideoGenerator = () => {
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [generatedScript, setGeneratedScript] = useState("");
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [addSubtitles, setAddSubtitles] = useState(true);
  const [addMusic, setAddMusic] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { saveVideo, videos, fetchVideos, isLoading: videosLoading } = useVideos();

  useEffect(() => {
    if (user) {
      fetchVideos();
    }
  }, [user]);

  const handleGenerateScript = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a topic or idea");
      return;
    }
    
    setIsGenerating(true);
    try {
      // Get HuggingFace API key from environment (optional)
      const apiKey = import.meta.env.VITE_HUGGINGFACE_API_KEY;
      
      const script = await generateScript(
        {
          prompt: prompt,
          maxLength: 150,
          temperature: 0.7,
        },
        apiKey
      );
      
      setGeneratedScript(script);
      toast.success("Script generated successfully!");
    } catch (error) {
      console.error("Script generation error:", error);
      toast.error("Failed to generate script. Using fallback.");
      // Fallback script
      setGeneratedScript(
        `🎬 Hook: Did you know that ${prompt.toLowerCase()}? Most people don't realize this simple truth.\n\n` +
        `💡 Main Point: Here's the thing - ${prompt.toLowerCase()} can transform your life. Let me explain...\n\n` +
        `🔥 Key Insight: Studies show that understanding ${prompt.toLowerCase()} leads to 80% better outcomes.\n\n` +
        `✅ Call to Action: Follow for more tips and share this with someone who needs to hear it!`
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('video/')) {
        setSelectedVideoFile(file);
        const url = URL.createObjectURL(file);
        setVideoPreviewUrl(url);
        toast.success("Video file selected!");
      } else {
        toast.error("Please select a video file");
      }
    }
  };

  const handleGenerateVideo = async () => {
    if (!generatedScript) {
      toast.error("Generate a script first");
      return;
    }
    
    if (!title.trim()) {
      toast.error("Please enter a title for your video");
      return;
    }

    if (!user) {
      toast.error("Please login first");
      return;
    }

    setIsGeneratingVideo(true);
    try {
      // If video file is selected, use it
      if (selectedVideoFile) {
        toast.info("Uploading video to Supabase Storage...");
        
        // Upload and process uploaded video
        const result = await generateCompleteVideo({
          file: selectedVideoFile,
          userId: user.id,
          title,
          script: generatedScript,
          caption: prompt,
          templateId: selectedTemplate || undefined,
          addSubtitles,
          addMusic,
        });

        toast.success("Video uploaded and saved successfully! 🎉");
        await fetchVideos();
      } else if (selectedTemplate) {
        // Generate video from script using AI + template
        toast.info("Generating video from script with AI...");
        
        try {
          const aiVideoResult = await generateVideoFromScript({
            script: generatedScript,
            title,
            templateId: selectedTemplate,
            voice: "default",
            style: "modern",
          });

          // Save AI-generated video to database
          await saveVideo({
            title,
            script: generatedScript,
            caption: prompt,
            video_url: aiVideoResult.videoUrl,
            status: "completed",
          });

          toast.success("AI video generated successfully! 🎉");
          await fetchVideos();
        } catch (error: any) {
          console.error("AI video generation error:", error);
          
          // If template not found, save script only
          if (error.message?.includes("template") || error.message?.includes("Template")) {
            toast.warning("Template not found. Saving script only...");
            await saveVideo({
              title,
              script: generatedScript,
              caption: prompt,
              status: "draft",
            });
            toast.info("Script saved! Add template videos to /public/templates/ for AI generation.");
            await fetchVideos();
          } else {
            throw error;
          }
        }
      } else {
        // No file or template - save script only
        toast.info("No video file or template selected. Saving script...");
        
        await saveVideo({
          title,
          script: generatedScript,
          caption: prompt,
          status: "draft",
        });

        toast.success("Script saved! Upload a video file or select a template to create video.");
        await fetchVideos();
      }
      
      // Reset form
      setTitle("");
      setPrompt("");
      setGeneratedScript("");
      setSelectedTemplate(null);
      setSelectedVideoFile(null);
      setVideoPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error("Video generation error:", error);
      
      // Better error messages
      if (error.message?.includes("Bucket not found") || error.message?.includes("bucket")) {
        toast.error("⚠️ Supabase Storage bucket not found! Please create 'videos' bucket in Supabase Dashboard → Storage");
      } else if (error.message?.includes("Upload failed")) {
        toast.error("Upload failed. Check Supabase Storage permissions.");
      } else if (error.message?.includes("template")) {
        toast.error("Template not found. Upload a video file instead or add templates to /public/templates/");
      } else {
        toast.error(error.message || "Failed to generate video. Try uploading a video file instead.");
      }
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const handleSaveVideo = async () => {
    if (!generatedScript) {
      toast.error("Generate a script first");
      return;
    }
    
    if (!title.trim()) {
      toast.error("Please enter a title for your video");
      return;
    }

    await saveVideo({
      title,
      script: generatedScript,
      caption: prompt,
      status: "draft",
    });
    
    toast.success("Video script saved successfully!");
    
    // Reset form
    setTitle("");
    setPrompt("");
    setGeneratedScript("");
    setSelectedTemplate(null);
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
          <Wand2 className="w-8 h-8 text-primary" />
          Video Generator
        </h1>
        <p className="text-muted-foreground mt-1">
          Create AI-powered videos in minutes
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column - Input */}
        <div className="space-y-6">
          {/* Title Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="glass-card p-6"
          >
            <Label className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Video className="w-5 h-5 text-primary" />
              Video Title
            </Label>
            <Input
              placeholder="E.g., 'Morning Motivation Tips'"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-secondary border-border"
            />
          </motion.div>

          {/* Prompt Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6"
          >
            <Label className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Describe Your Video
            </Label>
            <Textarea
              placeholder="E.g., 'Morning routine tips for productivity' or 'How to stay motivated during tough times'"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[120px] bg-secondary border-border resize-none"
            />
            <Button 
              variant="hero" 
              className="w-full mt-4"
              onClick={handleGenerateScript}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  Generate Script
                </>
              )}
            </Button>
          </motion.div>

          {/* Template Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6"
          >
            <Label className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Video className="w-5 h-5 text-primary" />
              Choose Template
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedTemplate === template.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className={`w-full h-16 rounded-lg bg-gradient-to-r ${template.color} mb-2`} />
                  <p className="text-sm font-medium text-foreground">{template.name}</p>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Video Upload */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass-card p-6"
          >
            <Label className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              Upload Video File
            </Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden"
              id="video-upload"
            />
            <label
              htmlFor="video-upload"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors bg-secondary/30"
            >
              {selectedVideoFile ? (
                <div className="text-center">
                  <FileVideo className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-sm font-medium text-foreground">{selectedVideoFile.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {(selectedVideoFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-foreground">Click to upload video</p>
                  <p className="text-xs text-muted-foreground mt-1">MP4, MOV, AVI (Max 100MB)</p>
                </div>
              )}
            </label>
            {selectedVideoFile && (
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2"
                onClick={() => {
                  setSelectedVideoFile(null);
                  setVideoPreviewUrl(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
              >
                Remove File
              </Button>
            )}
          </motion.div>

          {/* Options */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6"
          >
            <Label className="text-lg font-semibold mb-4">Options</Label>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 cursor-pointer hover:bg-secondary/50 transition-colors">
                <Captions className="w-5 h-5 text-primary" />
                <span className="flex-1 text-foreground">Auto Captions</span>
                <input 
                  type="checkbox" 
                  checked={addSubtitles}
                  onChange={(e) => setAddSubtitles(e.target.checked)}
                  className="w-5 h-5 rounded accent-primary" 
                />
              </label>
              <label className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 cursor-pointer hover:bg-secondary/50 transition-colors">
                <Music className="w-5 h-5 text-accent" />
                <span className="flex-1 text-foreground">Background Music</span>
                <input 
                  type="checkbox" 
                  checked={addMusic}
                  onChange={(e) => setAddMusic(e.target.checked)}
                  className="w-5 h-5 rounded accent-primary" 
                />
              </label>
            </div>
          </motion.div>
        </div>

        {/* Right Column - Preview */}
        <div className="space-y-6">
          {/* Video Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-6"
          >
            <Label className="text-lg font-semibold mb-4">Preview</Label>
            <div className="aspect-[9/16] max-w-xs mx-auto rounded-2xl bg-gradient-to-br from-secondary to-card border border-border overflow-hidden relative">
              {videoPreviewUrl ? (
                <video
                  src={videoPreviewUrl}
                  className="w-full h-full object-cover"
                  controls
                />
              ) : (
                <>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="w-16 h-16 rounded-full bg-primary/20 backdrop-blur-xl border border-primary/30 flex items-center justify-center cursor-pointer"
                    >
                      <Play className="w-6 h-6 text-primary ml-1" />
                    </motion.div>
                  </div>
                  
                  {/* Caption Preview */}
                  <div className="absolute bottom-8 left-4 right-4">
                    <div className="bg-background/80 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-sm text-foreground text-center">
                        {generatedScript ? "Upload video to see preview" : "Generate a script first"}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>

          {/* Generated Script */}
          {generatedScript && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6"
            >
              <Label className="text-lg font-semibold mb-4">Generated Script</Label>
              <div className="bg-secondary/30 rounded-lg p-4 max-h-64 overflow-y-auto">
                <pre className="text-sm text-foreground whitespace-pre-wrap font-sans">
                  {generatedScript}
                </pre>
              </div>
              <div className="flex flex-col gap-3 mt-4">
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setGeneratedScript("")}>
                    <RefreshCw className="w-4 h-4" />
                    Regenerate
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={handleSaveVideo}>
                    <Save className="w-4 h-4" />
                    Save Script
                  </Button>
                </div>
                <Button 
                  variant="hero" 
                  className="w-full" 
                  onClick={handleGenerateVideo}
                  disabled={isGeneratingVideo}
                >
                  {isGeneratingVideo ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      {selectedVideoFile ? "Processing Video..." : "Generating AI Video..."}
                    </>
                  ) : (
                    <>
                      <Video className="w-4 h-4" />
                      {selectedVideoFile ? "Generate Complete Video" : "Generate AI Video from Script"}
                    </>
                  )}
                </Button>
                {!selectedVideoFile && !selectedTemplate && (
                  <p className="text-xs text-muted-foreground text-center">
                    Select a template or upload video file. AI will generate video from script.
                  </p>
                )}
                {selectedTemplate && !selectedVideoFile && (
                  <p className="text-xs text-muted-foreground text-center">
                    AI will generate video using selected template and script
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {/* Recent Videos */}
          {videos.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="glass-card p-6"
            >
              <Label className="text-lg font-semibold mb-4">Recent Videos</Label>
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {videos.slice(0, 5).map((video) => (
                  <div
                    key={video.id}
                    className="p-3 rounded-lg bg-secondary/30 space-y-2"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                        <Video className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {video.title || "Untitled"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {video.status} • {new Date(video.created_at || "").toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    {/* Video Preview */}
                    {video.video_url && (
                      <div className="mt-2">
                        <video
                          src={video.video_url}
                          controls
                          className="w-full rounded-lg"
                          style={{ maxHeight: "200px" }}
                        >
                          Your browser does not support video playback.
                        </video>
                      </div>
                    )}
                    
                    {/* Script Preview */}
                    {video.script && (
                      <details className="mt-2">
                        <summary className="text-xs text-primary cursor-pointer hover:underline">
                          View Script
                        </summary>
                        <pre className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap bg-secondary/50 p-2 rounded max-h-32 overflow-y-auto">
                          {video.script}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoGenerator;
