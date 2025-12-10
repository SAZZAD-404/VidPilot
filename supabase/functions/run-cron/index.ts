// Supabase Edge Function for Cron Job
// This should be called by Vercel Cron or similar service

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Verify cron secret (for security)
    const authHeader = req.headers.get("Authorization");
    if (authHeader !== `Bearer ${Deno.env.get("CRON_SECRET")}`) {
      return new Response("Unauthorized", { status: 401 });
    }

    const now = new Date().toISOString();

    // Fetch pending posts
    const { data: schedules, error } = await supabaseClient
      .from("schedules")
      .select("*")
      .eq("status", "pending")
      .lte("scheduled_time", now);

    if (error) throw error;

    const results = [];

    for (const schedule of schedules || []) {
      try {
        // Fetch video
        const { data: video } = await supabaseClient
          .from("videos")
          .select("*")
          .eq("id", schedule.video_id)
          .single();

        if (!video || !video.video_url) {
          await supabaseClient
            .from("schedules")
            .update({ status: "failed", error_message: "Video not found" })
            .eq("id", schedule.id);
          continue;
        }

        // Fetch social account
        const { data: account } = await supabaseClient
          .from("social_accounts")
          .select("*")
          .eq("user_id", schedule.user_id)
          .eq("platform", schedule.platform)
          .single();

        if (!account || !account.access_token) {
          await supabaseClient
            .from("schedules")
            .update({ status: "failed", error_message: "Account not connected" })
            .eq("id", schedule.id);
          continue;
        }

        // Post to social media (call external API)
        // This would call your socialPoster functions
        // For now, we'll mark as posted (you need to implement actual posting)

        await supabaseClient
          .from("schedules")
          .update({
            status: "posted",
            updated_at: new Date().toISOString(),
          })
          .eq("id", schedule.id);

        results.push({ scheduleId: schedule.id, status: "posted" });
      } catch (error) {
        await supabaseClient
          .from("schedules")
          .update({
            status: "failed",
            error_message: error.message,
          })
          .eq("id", schedule.id);
        results.push({ scheduleId: schedule.id, status: "failed", error: error.message });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        results,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
