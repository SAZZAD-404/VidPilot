import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Video,
  Play,
  Download,
  Trash2,
  Edit,
  Share2,
  Eye,
  Calendar,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useVideos } from "@/hooks/useVideos";

const VideoLibrary = () => {
  const { user } = useAuth();
  const { videos, fetchVideos, deleteVideo, isLoading } = useVideos();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedVideo, setSelectedVideo] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchVideos();
    }
  }, [user]);

  const filteredVideos = videos.filter((video) => {
    const matchesSearch =
      video.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.script?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || video.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (videoId: string) => {
    if (confirm("Are you sure you want to delete this video?")) {
      await deleteVideo(videoId);
      if (selectedVideo?.id === videoId) {
        setSelectedVideo(null);
      }
    }
  };

  const handleDownload = (videoUrl: string, title: string) => {
    const link = document.createElement("a");
    link.href = videoUrl;
    link.download = `${title || "video"}.mp4`;
    link.click();
    toast.success("Download started!");
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
          <Video className="w-8 h-8 text-primary" />
          Video Library
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage and preview all your generated videos
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 mb-6"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search videos by title or script..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-secondary border-border"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full md:w-48 bg-secondary border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
          <span>Total: {videos.length}</span>
          <span>•</span>
          <span>Showing: {filteredVideos.length}</span>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Video List */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-6"
        >
          <h2 className="text-xl font-semibold mb-4">Videos</h2>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : filteredVideos.length === 0 ? (
            <div className="text-center py-12">
              <Video className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No videos found</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {filteredVideos.map((video) => (
                <button
                  key={video.id}
                  onClick={() => setSelectedVideo(video)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    selectedVideo?.id === video.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50 bg-secondary/30"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                      {video.video_url ? (
                        <Play className="w-6 h-6 text-primary-foreground" />
                      ) : (
                        <Video className="w-6 h-6 text-primary-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {video.title || "Untitled Video"}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span
                          className={`px-2 py-0.5 rounded ${
                            video.status === "completed"
                              ? "bg-green-500/20 text-green-500"
                              : video.status === "processing"
                              ? "bg-yellow-500/20 text-yellow-500"
                              : video.status === "failed"
                              ? "bg-red-500/20 text-red-500"
                              : "bg-gray-500/20 text-gray-500"
                          }`}
                        >
                          {video.status}
                        </span>
                        <span>•</span>
                        <Clock className="w-3 h-3" />
                        <span>
                          {new Date(video.created_at || "").toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Video Preview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-6"
        >
          <h2 className="text-xl font-semibold mb-4">Preview</h2>

          {selectedVideo ? (
            <div className="space-y-4">
              {/* Video Player */}
              {selectedVideo.video_url ? (
                <div className="aspect-video rounded-lg overflow-hidden bg-black">
                  <video
                    src={selectedVideo.video_url}
                    controls
                    className="w-full h-full"
                  >
                    Your browser does not support video playback.
                  </video>
                </div>
              ) : (
                <div className="aspect-video rounded-lg bg-secondary/30 flex items-center justify-center">
                  <div className="text-center">
                    <Video className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No video file available
                    </p>
                  </div>
                </div>
              )}

              {/* Video Info */}
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Title
                  </p>
                  <p className="text-foreground">
                    {selectedVideo.title || "Untitled"}
                  </p>
                </div>

                {selectedVideo.caption && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Caption
                    </p>
                    <p className="text-sm text-foreground">
                      {selectedVideo.caption}
                    </p>
                  </div>
                )}

                {selectedVideo.script && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      Script
                    </p>
                    <pre className="text-sm text-foreground whitespace-pre-wrap bg-secondary/30 p-3 rounded-lg max-h-48 overflow-y-auto">
                      {selectedVideo.script}
                    </pre>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Created:{" "}
                    {new Date(
                      selectedVideo.created_at || ""
                    ).toLocaleString()}
                  </span>
                </div>

                {selectedVideo.duration && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Duration: {selectedVideo.duration}s</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                {selectedVideo.video_url && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleDownload(
                          selectedVideo.video_url,
                          selectedVideo.title
                        )
                      }
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </>
                )}
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(selectedVideo.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-24">
              <div className="text-center">
                <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  Select a video to preview
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default VideoLibrary;
