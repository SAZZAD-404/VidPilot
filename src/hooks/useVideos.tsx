import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface Video {
  id: string;
  title: string | null;
  script: string | null;
  caption: string | null;
  video_url: string | null;
  status: string | null;
  created_at: string | null;
  user_id: string | null;
}

export const useVideos = () => {
  const { user } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchVideos = async () => {
    if (!user) return;
    
    setIsLoading(true);
    const { data, error } = await supabase
      .from("videos")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) {
      toast.error("Failed to fetch videos");
      console.error(error);
    } else {
      setVideos(data || []);
    }
    setIsLoading(false);
  };

  const saveVideo = async (videoData: {
    title: string;
    script: string;
    caption?: string;
    video_url?: string;
    status?: string;
  }) => {
    if (!user) {
      toast.error("You must be logged in to save videos");
      return null;
    }

    const { data, error } = await supabase
      .from("videos")
      .insert({
        user_id: user.id,
        title: videoData.title,
        script: videoData.script,
        caption: videoData.caption || null,
        video_url: videoData.video_url || null,
        status: videoData.status || "draft",
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to save video");
      console.error(error);
      return null;
    }

    toast.success("Video saved successfully!");
    await fetchVideos();
    return data;
  };

  const updateVideo = async (id: string, updates: Partial<Video>) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from("videos")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      toast.error("Failed to update video");
      console.error(error);
      return null;
    }

    toast.success("Video updated!");
    await fetchVideos();
    return data;
  };

  const deleteVideo = async (id: string) => {
    if (!user) return false;

    const { error } = await supabase
      .from("videos")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete video");
      console.error(error);
      return false;
    }

    toast.success("Video deleted!");
    await fetchVideos();
    return true;
  };

  return {
    videos,
    isLoading,
    fetchVideos,
    saveVideo,
    updateVideo,
    deleteVideo,
  };
};
