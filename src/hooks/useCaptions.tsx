import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import { localCaptionStorage } from "@/lib/localStorageCaption";

export interface Caption {
  id: string;
  user_id: string;
  job_id?: string;
  text: string;
  hashtags: string[];
  tone: string;
  language: string;
  platform: string;
  saved: boolean;
  created_at: string;
}

export interface CaptionJob {
  id: string;
  user_id: string;
  project_id?: string;
  input_meta: {
    type: 'image' | 'video' | 'text';
    url?: string;
    text?: string;
    platform: string;
    tone: string;
    language: string;
  };
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result_meta?: {
    captionCount: number;
    generatedAt: string;
  };
  created_at: string;
}

export const useCaptions = () => {
  const { user } = useAuth();
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [jobs, setJobs] = useState<CaptionJob[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load captions on mount (from localStorage if not logged in)
  useEffect(() => {
    if (!user) {
      // Load from localStorage
      const localCaptions = localCaptionStorage.getAll();
      setCaptions(localCaptions as any);
    }
  }, [user]);

  // Fetch user's saved captions
  const fetchCaptions = async () => {
    if (!user) {
      // Load from localStorage
      const localCaptions = localCaptionStorage.getAll();
      setCaptions(localCaptions as any);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("captions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCaptions(data || []);
    } catch (error: any) {
      console.error("Error fetching captions:", error);
      // Fallback to localStorage
      const localCaptions = localCaptionStorage.getAll();
      setCaptions(localCaptions as any);
      toast.info("Using offline mode");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch caption generation jobs
  const fetchJobs = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setJobs(data || []);
    } catch (error: any) {
      console.error("Error fetching jobs:", error);
    }
  };

  // Save a single caption
  const saveCaption = async (caption: Omit<Caption, "id" | "user_id" | "created_at">) => {
    if (!user) {
      // Save to localStorage
      const saved = localCaptionStorage.save(caption as any);
      toast.success("Caption saved locally!");
      await fetchCaptions();
      return saved as any;
    }

    try {
      const { data, error } = await supabase
        .from("captions")
        .insert({
          user_id: user.id,
          ...caption,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Caption saved!");
      await fetchCaptions();
      return data;
    } catch (error: any) {
      console.error("Error saving caption:", error);
      // Fallback to localStorage
      const saved = localCaptionStorage.save(caption as any);
      toast.info("Saved locally (offline mode)");
      await fetchCaptions();
      return saved as any;
    }
  };

  // Save multiple captions
  const saveCaptions = async (captionsData: Omit<Caption, "id" | "user_id" | "created_at">[]) => {
    if (!user) {
      // Save to localStorage
      const saved = localCaptionStorage.saveMany(captionsData as any);
      toast.success(`${saved.length} captions saved locally!`);
      await fetchCaptions();
      return saved as any;
    }

    try {
      const captionsWithUser = captionsData.map(caption => ({
        user_id: user.id,
        ...caption,
      }));

      const { data, error } = await supabase
        .from("captions")
        .insert(captionsWithUser)
        .select();

      if (error) throw error;

      toast.success(`${data.length} captions saved!`);
      await fetchCaptions();
      return data;
    } catch (error: any) {
      console.error("Error saving captions:", error);
      // Fallback to localStorage
      const saved = localCaptionStorage.saveMany(captionsData as any);
      toast.info(`${saved.length} captions saved locally (offline mode)`);
      await fetchCaptions();
      return saved as any;
    }
  };

  // Create a caption generation job
  const createJob = async (jobData: Omit<CaptionJob, "id" | "user_id" | "created_at" | "status">) => {
    if (!user) {
      toast.error("Please login first");
      return null;
    }

    try {
      const { data, error } = await supabase
        .from("jobs")
        .insert({
          user_id: user.id,
          status: "pending",
          ...jobData,
        })
        .select()
        .single();

      if (error) throw error;
      await fetchJobs();
      return data;
    } catch (error: any) {
      console.error("Error creating job:", error);
      toast.error("Failed to create job");
      return null;
    }
  };

  // Update job status
  const updateJobStatus = async (
    jobId: string,
    status: CaptionJob["status"],
    resultMeta?: CaptionJob["result_meta"]
  ) => {
    try {
      const updateData: any = { status };
      if (resultMeta) {
        updateData.result_meta = resultMeta;
      }

      const { error } = await supabase
        .from("jobs")
        .update(updateData)
        .eq("id", jobId);

      if (error) throw error;
      await fetchJobs();
    } catch (error: any) {
      console.error("Error updating job:", error);
    }
  };

  // Delete a caption
  const deleteCaption = async (captionId: string) => {
    if (!user || captionId.startsWith('local_')) {
      // Delete from localStorage
      localCaptionStorage.delete(captionId);
      toast.success("Caption deleted");
      await fetchCaptions();
      return;
    }

    try {
      const { error } = await supabase
        .from("captions")
        .delete()
        .eq("id", captionId);

      if (error) throw error;

      toast.success("Caption deleted");
      await fetchCaptions();
    } catch (error: any) {
      console.error("Error deleting caption:", error);
      toast.error("Failed to delete caption");
    }
  };

  // Toggle saved status
  const toggleSaved = async (captionId: string, saved: boolean) => {
    try {
      const { error } = await supabase
        .from("captions")
        .update({ saved })
        .eq("id", captionId);

      if (error) throw error;
      await fetchCaptions();
    } catch (error: any) {
      console.error("Error updating caption:", error);
      toast.error("Failed to update caption");
    }
  };

  // Track usage
  const trackUsage = async (kind: string, amount: number = 1) => {
    if (!user) return;

    try {
      await supabase.from("usage_records").insert({
        user_id: user.id,
        kind,
        amount,
      });
    } catch (error: any) {
      console.error("Error tracking usage:", error);
    }
  };

  // Get usage stats
  const getUsageStats = async () => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("usage_records")
        .select("kind, amount")
        .eq("user_id", user.id);

      if (error) throw error;

      // Calculate totals by kind
      const stats: Record<string, number> = {};
      data?.forEach(record => {
        stats[record.kind] = (stats[record.kind] || 0) + record.amount;
      });

      return stats;
    } catch (error: any) {
      console.error("Error fetching usage stats:", error);
      return null;
    }
  };

  return {
    captions,
    jobs,
    isLoading,
    fetchCaptions,
    fetchJobs,
    saveCaption,
    saveCaptions,
    createJob,
    updateJobStatus,
    deleteCaption,
    toggleSaved,
    trackUsage,
    getUsageStats,
  };
};
