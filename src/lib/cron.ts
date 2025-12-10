/**
 * Cron Job Utilities for Auto-Posting
 * This should run on the server (Vercel Cron or similar)
 */

import { supabase } from "@/integrations/supabase/client";
import { postToSocialMedia, SocialPostOptions } from "./socialPoster";

export interface ScheduledPost {
  id: string;
  user_id: string;
  video_id: string;
  platform: string;
  scheduled_time: string;
  status: string;
}

/**
 * Fetch pending scheduled posts that are due
 */
export async function fetchPendingPosts(): Promise<ScheduledPost[]> {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("schedules")
    .select("*")
    .eq("status", "pending")
    .lte("scheduled_time", now);

  if (error) {
    console.error("Error fetching pending posts:", error);
    return [];
  }

  return data || [];
}

/**
 * Process and post a scheduled video
 */
export async function processScheduledPost(
  schedule: ScheduledPost
): Promise<boolean> {
  try {
    // Fetch video details
    const { data: video, error: videoError } = await supabase
      .from("videos")
      .select("*")
      .eq("id", schedule.video_id)
      .single();

    if (videoError || !video) {
      console.error("Video not found:", videoError);
      await updateScheduleStatus(schedule.id, "failed");
      return false;
    }

    // Fetch social account credentials
    const { data: socialAccount, error: accountError } = await supabase
      .from("social_accounts")
      .select("*")
      .eq("user_id", schedule.user_id)
      .eq("platform", schedule.platform)
      .single();

    if (accountError || !socialAccount || !socialAccount.access_token) {
      console.error("Social account not found or not connected:", accountError);
      await updateScheduleStatus(schedule.id, "failed");
      return false;
    }

    // Check if token is expired
    if (socialAccount.expires_at && new Date(socialAccount.expires_at) < new Date()) {
      console.error("Access token expired");
      await updateScheduleStatus(schedule.id, "failed");
      return false;
    }

    // Post to social media
    const postOptions: SocialPostOptions = {
      videoUrl: video.video_url || "",
      caption: video.caption || video.script || "",
      platform: schedule.platform as any,
      accessToken: socialAccount.access_token,
      pageId: socialAccount.page_id || undefined,
    };

    const result = await postToSocialMedia(postOptions);

    if (result.success) {
      await updateScheduleStatus(schedule.id, "posted");
      return true;
    } else {
      console.error("Posting failed:", result.error);
      await updateScheduleStatus(schedule.id, "failed");
      return false;
    }
  } catch (error) {
    console.error("Error processing scheduled post:", error);
    await updateScheduleStatus(schedule.id, "failed");
    return false;
  }
}

/**
 * Update schedule status
 */
async function updateScheduleStatus(
  scheduleId: string,
  status: string
): Promise<void> {
  await supabase
    .from("schedules")
    .update({ status })
    .eq("id", scheduleId);
}

/**
 * Main cron job function
 * This should be called by Vercel Cron or similar service
 */
export async function runCronJob(): Promise<void> {
  console.log("Running cron job at", new Date().toISOString());

  const pendingPosts = await fetchPendingPosts();
  console.log(`Found ${pendingPosts.length} pending posts`);

  for (const post of pendingPosts) {
    console.log(`Processing post ${post.id} for platform ${post.platform}`);
    await processScheduledPost(post);
  }

  console.log("Cron job completed");
}

/**
 * Client-side function to trigger cron (for testing)
 * In production, this should only run on the server
 */
export async function triggerCronManually(): Promise<void> {
  // This should only be called from an admin interface
  // In production, use Vercel Cron or similar
  await runCronJob();
}
