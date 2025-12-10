import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Video,
  Clock,
  X,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useSchedules } from "@/hooks/useSchedules";
import { useVideos } from "@/hooks/useVideos";
import { toast } from "sonner";

const platforms = [
  { name: "YouTube", color: "#FF0000", value: "youtube" },
  { name: "TikTok", color: "#00F2EA", value: "tiktok" },
  { name: "Instagram", color: "#E4405F", value: "instagram" },
  { name: "Facebook", color: "#1877F2", value: "facebook" },
  { name: "LinkedIn", color: "#0A66C2", value: "linkedin" },
];

const Scheduler = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    video_id: "",
    platform: "",
    scheduled_time: "",
  });

  const { schedules, isLoading, createSchedule, deleteSchedule } = useSchedules();
  const { videos } = useVideos();
  
  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();
  
  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const getPostsForDay = (day: number) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    
    return schedules.filter(schedule => {
      if (!schedule.scheduled_time) return false;
      const scheduleDate = new Date(schedule.scheduled_time);
      return scheduleDate.getDate() === day && 
             scheduleDate.getMonth() === month && 
             scheduleDate.getFullYear() === year;
    });
  };

  const getPlatformColor = (platformName: string) => {
    return platforms.find(p => p.value === platformName)?.color || "#888";
  };

  const handleDayClick = (day: number) => {
    setSelectedDay(day);
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const date = new Date(year, month, day);
    date.setHours(12, 0, 0, 0);
    setScheduleForm({
      ...scheduleForm,
      scheduled_time: date.toISOString().slice(0, 16),
    });
    setIsDialogOpen(true);
  };

  const handleCreateSchedule = async () => {
    if (!scheduleForm.video_id || !scheduleForm.platform || !scheduleForm.scheduled_time) {
      toast.error("Please fill in all fields");
      return;
    }

    await createSchedule({
      video_id: scheduleForm.video_id,
      platform: scheduleForm.platform,
      scheduled_time: new Date(scheduleForm.scheduled_time).toISOString(),
    });

    setIsDialogOpen(false);
    setScheduleForm({
      video_id: "",
      platform: "",
      scheduled_time: "",
    });
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (confirm("Are you sure you want to delete this schedule?")) {
      await deleteSchedule(scheduleId);
    }
  };

  const getUpcomingSchedules = () => {
    const now = new Date();
    return schedules
      .filter(s => {
        if (!s.scheduled_time) return false;
        return new Date(s.scheduled_time) > now && s.status === "pending";
      })
      .sort((a, b) => {
        const timeA = new Date(a.scheduled_time || 0).getTime();
        const timeB = new Date(b.scheduled_time || 0).getTime();
        return timeA - timeB;
      })
      .slice(0, 5);
  };

  const getVideoTitle = (videoId: string | null) => {
    if (!videoId) return "Unknown";
    const video = videos.find(v => v.id === videoId);
    return video?.title || "Untitled";
  };

  return (
    <div className="p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Calendar className="w-8 h-8 text-primary" />
            Content Scheduler
          </h1>
          <p className="text-muted-foreground mt-1">
            Plan and schedule your content across all platforms
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="hero" onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-5 h-5" />
              Schedule Post
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule New Post</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Select Video</Label>
                <Select
                  value={scheduleForm.video_id}
                  onValueChange={(value) => setScheduleForm({ ...scheduleForm, video_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a video" />
                  </SelectTrigger>
                  <SelectContent>
                    {videos.map((video) => (
                      <SelectItem key={video.id} value={video.id}>
                        {video.title || "Untitled"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Platform</Label>
                <Select
                  value={scheduleForm.platform}
                  onValueChange={(value) => setScheduleForm({ ...scheduleForm, platform: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {platforms.map((platform) => (
                      <SelectItem key={platform.value} value={platform.value}>
                        {platform.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Date & Time</Label>
                <Input
                  type="datetime-local"
                  value={scheduleForm.scheduled_time}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, scheduled_time: e.target.value })}
                />
              </div>
              <Button variant="hero" className="w-full" onClick={handleCreateSchedule}>
                Create Schedule
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 glass-card p-6"
        >
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => {
                const newDate = new Date(currentMonth);
                newDate.setMonth(newDate.getMonth() - 1);
                setCurrentMonth(newDate);
              }}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h2 className="text-xl font-semibold text-foreground">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h2>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => {
                const newDate = new Date(currentMonth);
                newDate.setMonth(newDate.getMonth() + 1);
                setCurrentMonth(newDate);
              }}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Day Labels */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
              <div key={day} className="text-center text-sm text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {emptyDays.map(i => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            {days.map(day => {
              const posts = getPostsForDay(day);
              return (
                <div 
                  key={day}
                  onClick={() => handleDayClick(day)}
                  className={`aspect-square rounded-lg p-1 border border-border hover:border-primary/50 transition-colors cursor-pointer ${
                    posts.length > 0 ? 'bg-secondary/30' : ''
                  }`}
                >
                  <div className="text-sm text-foreground mb-1">{day}</div>
                  {posts.map((post, i) => (
                    <div 
                      key={i}
                      className="w-full h-1.5 rounded-full mb-0.5"
                      style={{ backgroundColor: getPlatformColor(post.platform || "") }}
                      title={`${getVideoTitle(post.video_id)} - ${post.platform}`}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Sidebar - Upcoming */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Upcoming Posts */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Upcoming Posts
            </h3>
            <div className="space-y-3">
              {isLoading ? (
                <p className="text-sm text-muted-foreground text-center py-4">Loading...</p>
              ) : getUpcomingSchedules().length > 0 ? (
                getUpcomingSchedules().map((schedule) => {
                  const scheduleDate = schedule.scheduled_time ? new Date(schedule.scheduled_time) : null;
                  return (
                    <div 
                      key={schedule.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 group"
                    >
                      <div 
                        className="w-2 h-8 rounded-full flex-shrink-0"
                        style={{ backgroundColor: getPlatformColor(schedule.platform || "") }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {getVideoTitle(schedule.video_id)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {scheduleDate?.toLocaleDateString()} at {scheduleDate?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {schedule.platform}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                        onClick={() => handleDeleteSchedule(schedule.id)}
                      >
                        <Trash2 className="w-3 h-3 text-destructive" />
                      </Button>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No scheduled posts</p>
              )}
            </div>
          </div>

          {/* Platform Legend */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Platforms</h3>
            <div className="space-y-2">
              {platforms.map(platform => (
                <div key={platform.name} className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: platform.color }}
                  />
                  <span className="text-sm text-foreground">{platform.name}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Scheduler;
