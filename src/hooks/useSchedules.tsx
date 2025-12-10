import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface Schedule {
  id: string;
  user_id: string | null;
  video_id: string | null;
  platform: string | null;
  scheduled_time: string | null;
  status: string | null;
}

export interface CreateScheduleData {
  video_id: string;
  platform: string;
  scheduled_time: string;
}

export const useSchedules = () => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSchedules = async () => {
    if (!user) return;

    setIsLoading(true);
    const { data, error } = await supabase
      .from("schedules")
      .select("*")
      .eq("user_id", user.id)
      .order("scheduled_time", { ascending: true });

    if (error) {
      toast.error("Failed to fetch schedules");
      console.error(error);
    } else {
      setSchedules(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchSchedules();
    }
  }, [user]);

  const createSchedule = async (scheduleData: CreateScheduleData) => {
    if (!user) {
      toast.error("You must be logged in to create schedules");
      return null;
    }

    const { data, error } = await supabase
      .from("schedules")
      .insert({
        user_id: user.id,
        video_id: scheduleData.video_id,
        platform: scheduleData.platform,
        scheduled_time: scheduleData.scheduled_time,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to create schedule");
      console.error(error);
      return null;
    }

    toast.success("Schedule created successfully!");
    await fetchSchedules();
    return data;
  };

  const updateSchedule = async (id: string, updates: Partial<Schedule>) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from("schedules")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      toast.error("Failed to update schedule");
      console.error(error);
      return null;
    }

    toast.success("Schedule updated!");
    await fetchSchedules();
    return data;
  };

  const deleteSchedule = async (id: string) => {
    if (!user) return false;

    const { error } = await supabase.from("schedules").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete schedule");
      console.error(error);
      return false;
    }

    toast.success("Schedule deleted!");
    await fetchSchedules();
    return true;
  };

  return {
    schedules,
    isLoading,
    fetchSchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule,
  };
};
