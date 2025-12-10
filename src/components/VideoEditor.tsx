import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Settings,
  Download,
  Save,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface VideoEditorProps {
  videoUrl?: string;
  script?: string;
  onSave?: (editedVideo: Blob) => void;
  onCaptionChange?: (caption: string) => void;
}

const VideoEditor = ({
  videoUrl,
  script = "",
  onSave,
  onCaptionChange,
}: VideoEditorProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState([100]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [caption, setCaption] = useState(script);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);
    const handleEnded = () => setIsPlaying(false);

    video.addEventListener("timeupdate", updateTime);
    video.addEventListener("loadedmetadata", updateDuration);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("timeupdate", updateTime);
      video.removeEventListener("loadedmetadata", updateDuration);
      video.removeEventListener("ended", handleEnded);
    };
  }, [videoUrl]);

  useEffect(() => {
    if (onCaptionChange) {
      onCaptionChange(caption);
    }
  }, [caption, onCaptionChange]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = (value[0] / 100) * duration;
    setCurrentTime(video.currentTime);
  };

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = value[0] / 100;
    video.volume = newVolume;
    setVolume(value);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isMuted) {
      video.volume = volume[0] / 100;
      setIsMuted(false);
    } else {
      video.volume = 0;
      setIsMuted(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleDownload = async () => {
    if (!videoUrl) {
      toast.error("No video to download");
      return;
    }

    try {
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "edited-video.mp4";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Video downloaded!");
    } catch (error) {
      toast.error("Failed to download video");
    }
  };

  const handleSave = async () => {
    if (!videoUrl || !onSave) {
      toast.error("No video to save");
      return;
    }

    try {
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      onSave(blob);
      toast.success("Video saved!");
    } catch (error) {
      toast.error("Failed to save video");
    }
  };

  return (
    <div className="space-y-6">
      {/* Video Player */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="relative aspect-[9/16] max-w-xs mx-auto rounded-2xl overflow-hidden bg-black">
          {videoUrl ? (
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full h-full object-cover"
              muted={isMuted}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-secondary">
              <p className="text-muted-foreground">No video loaded</p>
            </div>
          )}

          {/* Play/Pause Overlay */}
          {videoUrl && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <Button
                variant="ghost"
                size="icon"
                className="w-16 h-16 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background/90"
                onClick={togglePlay}
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8 text-foreground" />
                ) : (
                  <Play className="w-8 h-8 text-foreground ml-1" />
                )}
              </Button>
            </div>
          )}

          {/* Caption Overlay */}
          {caption && (
            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-background/90 backdrop-blur-sm rounded-lg p-3">
                <p className="text-sm text-foreground text-center font-medium">
                  {caption.split("\n")[0]}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Video Controls */}
        {videoUrl && (
          <div className="mt-4 space-y-3">
            {/* Progress Bar */}
            <div className="space-y-2">
              <Slider
                value={[duration ? (currentTime / duration) * 100 : 0]}
                onValueChange={handleSeek}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className="flex-shrink-0"
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </Button>
              <Slider
                value={volume}
                onValueChange={handleVolumeChange}
                className="flex-1"
                max={100}
              />
              <span className="text-xs text-muted-foreground w-10 text-right">
                {volume[0]}%
              </span>
            </div>
          </div>
        )}
      </motion.div>

      {/* Caption Editor */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6"
      >
        <Label className="text-lg font-semibold mb-4">Edit Caption</Label>
        <Textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Enter video caption..."
          className="min-h-[100px] bg-secondary border-border resize-none"
        />
      </motion.div>

      {/* Action Buttons */}
      {videoUrl && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-3"
        >
          <Button variant="outline" className="flex-1" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          {onSave && (
            <Button variant="hero" className="flex-1" onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default VideoEditor;
