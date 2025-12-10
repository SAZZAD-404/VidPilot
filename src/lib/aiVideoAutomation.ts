/**
 * AI Video Automation System
 * Complete automated pipeline: Text → Video → Post
 * Uses FREE AI services
 */

import { supabase } from "@/integrations/supabase/client";
import { generateScript } from "./huggingface";
import { generateVideoFromScript } from "./aiVideoGenerator";

export interface AutomationConfig {
  topic: string;
  style: "motivational" | "tutorial" | "story" | "news";
  duration: number; // seconds
  platforms: Array<"youtube" | "tiktok" | "instagram" | "facebook" | "linkedin">;
  scheduleTime?: Date;
  autoPost: boolean;
}

export interface AutomationResult {
  videoId: string;
  videoUrl: string;
  script: string;
  scheduleIds?: string[];
  status: "success" | "partial" | "failed";
  errors?: string[];
}

/**
 * Complete AI Video Automation Pipeline
 * Step 1: Generate Script (AI)
 * Step 2: Generate Video (AI)
 * Step 3: Save to Database
 * Step 4: Schedule Posts (Optional)
 */
export async function automateVideoCreation(
  userId: string,
  config: AutomationConfig
): Promise<AutomationResult> {
  const errors: string[] = [];
  
  try {
    console.log("🤖 Starting AI Video Automation Pipeline...");
    console.log("📋 Config:", config);

    // Step 0: Verify user exists in database
    console.log("👤 Verifying user profile...");
    const { data: userProfile, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("id", userId)
      .single();

    if (userError || !userProfile) {
      console.error("User profile not found:", userError);
      throw new Error(
        "User profile not found. Please logout and login again, or contact support. " +
        "This usually happens when the user profile wasn't created during signup."
      );
    }
    console.log("✅ User profile verified");

    // Step 1: Generate Script using AI
    console.log("📝 Step 1: Generating script with AI...");
    const script = await generateScriptForTopic(config.topic, config.style);
    console.log("✅ Script generated:", script.substring(0, 100) + "...");

    // Step 2: Generate Video
    console.log("🎥 Step 2: Generating video...");
    
    let videoUrl: string | undefined;
    let videoGenerationMethod = "none";
    
    try {
      // Try Shotstack first (professional quality)
      const { isShotstackConfigured, generateShotstackVideo } = await import("./shotstackVideoGenerator");
      
      if (isShotstackConfigured()) {
        console.log("🎬 Using Shotstack for professional video...");
        console.log("⏳ This will take 20-30 seconds...");
        
        const result = await generateShotstackVideo({
          script,
          title: generateTitleFromTopic(config.topic),
          style: config.style,
          duration: config.duration,
        });
        
        videoUrl = result.videoUrl;
        videoGenerationMethod = "shotstack";
        console.log("✅ Shotstack video generated:", videoUrl);
      } else {
        // Fallback to simple canvas video
        console.log("📝 Shotstack not configured, using Canvas fallback...");
        const { generateSimpleVideo } = await import("./simpleVideoGenerator");
        
        const result = await generateSimpleVideo({
          script,
          title: generateTitleFromTopic(config.topic),
          style: config.style,
          duration: config.duration,
        });
        
        videoUrl = result.videoUrl;
        videoGenerationMethod = "canvas";
        console.log("✅ Canvas video generated:", videoUrl);
      }
    } catch (error: any) {
      console.error("❌ Video generation failed:", error);
      console.warn("⚠️ Saving script only, video can be added later");
      // Continue without video - script will be saved
    }

    // Step 3: Save to Database
    console.log("💾 Step 3: Saving to database...");
    
    // Prepare video data (only include fields that exist in schema)
    const videoData: any = {
      user_id: userId,
      title: generateTitleFromTopic(config.topic),
      script: script,
      caption: generateCaptionFromScript(script),
      status: videoUrl ? "completed" : "draft",
    };
    
    // Add video URL if generated
    if (videoUrl) {
      videoData.video_url = videoUrl;
    }
    
    // Add optional fields if they exist
    if (config.duration) {
      videoData.duration = config.duration;
    }
    
    const { data: video, error: saveError } = await supabase
      .from("videos")
      .insert(videoData)
      .select()
      .single();

    if (saveError) {
      console.error("Database save error:", saveError);
      throw new Error(`Failed to save video: ${saveError.message}. Please check if all database migrations are applied.`);
    }
    console.log("✅ Video saved to database:", video.id);

    // Step 4: Schedule Posts (if autoPost enabled)
    let scheduleIds: string[] = [];
    if (config.autoPost && config.platforms.length > 0) {
      console.log("📅 Step 4: Scheduling posts...");
      
      for (const platform of config.platforms) {
        try {
          const scheduleTime = config.scheduleTime || new Date(Date.now() + 60000); // 1 min from now
          
          const { data: schedule, error: scheduleError } = await supabase
            .from("schedules")
            .insert({
              user_id: userId,
              video_id: video.id,
              platform: platform,
              scheduled_time: scheduleTime.toISOString(),
              status: "pending",
            })
            .select()
            .single();

          if (scheduleError) {
            errors.push(`Failed to schedule ${platform}: ${scheduleError.message}`);
          } else {
            scheduleIds.push(schedule.id);
            console.log(`✅ Scheduled for ${platform}:`, schedule.id);
          }
        } catch (error: any) {
          errors.push(`Failed to schedule ${platform}: ${error.message}`);
        }
      }
    }

    console.log("🎉 AI Video Automation Complete!");

    return {
      videoId: video.id,
      videoUrl: video.video_url || "",
      script: script,
      scheduleIds: scheduleIds.length > 0 ? scheduleIds : undefined,
      status: errors.length > 0 ? "partial" : "success",
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error: any) {
    console.error("❌ AI Video Automation Failed:", error);
    throw error;
  }
}

/**
 * Generate script for specific topic and style
 */
async function generateScriptForTopic(
  topic: string,
  style: string
): Promise<string> {
  const stylePrompts = {
    motivational: `Create a powerful motivational video script about ${topic}. Include an attention-grabbing hook, inspiring message, and strong call to action. Keep it under 20 seconds.`,
    tutorial: `Create a clear tutorial video script about ${topic}. Include step-by-step instructions, helpful tips, and actionable advice. Keep it under 20 seconds.`,
    story: `Create an engaging story video script about ${topic}. Include a compelling narrative, emotional connection, and memorable ending. Keep it under 20 seconds.`,
    news: `Create a news-style video script about ${topic}. Include key facts, important updates, and relevant information. Keep it under 20 seconds.`,
  };

  const prompt = stylePrompts[style as keyof typeof stylePrompts] || stylePrompts.motivational;
  
  const apiKey = import.meta.env.VITE_HUGGINGFACE_API_KEY;
  
  try {
    const script = await generateScript(
      {
        prompt: prompt,
        maxLength: 200,
        temperature: 0.8,
      },
      apiKey
    );
    
    return script;
  } catch (error) {
    console.error("Script generation error:", error);
    // Fallback script
    return generateFallbackScript(topic, style);
  }
}

/**
 * Generate fallback script if AI fails
 */
function generateFallbackScript(topic: string, style: string): string {
  const templates = {
    motivational: `🎬 Hook: Want to master ${topic}? Here's the secret!\n\n💡 Main Point: ${topic} is the key to success. Most people overlook this powerful strategy.\n\n🔥 Key Insight: Start implementing ${topic} today and watch your life transform.\n\n✅ Call to Action: Follow for more tips on ${topic}! Share this with someone who needs it!`,
    
    tutorial: `🎬 Hook: Learn ${topic} in 20 seconds!\n\n💡 Step 1: Understand the basics of ${topic}\n\n🔥 Step 2: Apply these proven techniques\n\n✅ Step 3: Practice daily and see results! Follow for more tutorials!`,
    
    story: `🎬 Hook: This ${topic} story will change your perspective...\n\n💡 The Journey: Someone discovered ${topic} and everything changed.\n\n🔥 The Transformation: Their life improved dramatically through ${topic}.\n\n✅ Your Turn: Start your ${topic} journey today! Follow for more inspiring stories!`,
    
    news: `🎬 Breaking: Important update about ${topic}!\n\n💡 What's New: Latest developments in ${topic} you need to know.\n\n🔥 Why It Matters: This impacts everyone interested in ${topic}.\n\n✅ Stay Updated: Follow for more news on ${topic}!`,
  };

  return templates[style as keyof typeof templates] || templates.motivational;
}

/**
 * Get template ID based on style
 */
function getTemplateIdForStyle(style: string): number {
  const templateMap = {
    motivational: 1,
    tutorial: 2,
    story: 3,
    news: 4,
  };
  
  return templateMap[style as keyof typeof templateMap] || 1;
}

/**
 * Generate title from topic
 */
function generateTitleFromTopic(topic: string): string {
  // Capitalize first letter
  const capitalized = topic.charAt(0).toUpperCase() + topic.slice(1);
  return `${capitalized} - AI Generated Video`;
}

/**
 * Generate caption from script
 */
function generateCaptionFromScript(script: string): string {
  // Extract first line or first 100 characters
  const firstLine = script.split("\n")[0];
  const caption = firstLine.replace(/[🎬💡🔥✅]/g, "").trim();
  
  return caption.length > 100 ? caption.substring(0, 97) + "..." : caption;
}

/**
 * Batch automation: Create multiple videos at once
 */
export async function batchAutomateVideos(
  userId: string,
  topics: string[],
  config: Omit<AutomationConfig, "topic">
): Promise<AutomationResult[]> {
  console.log(`🤖 Starting Batch Automation for ${topics.length} videos...`);
  
  const results: AutomationResult[] = [];
  
  for (let i = 0; i < topics.length; i++) {
    const topic = topics[i];
    console.log(`\n📹 Processing video ${i + 1}/${topics.length}: ${topic}`);
    
    try {
      // Add delay between videos to avoid rate limiting
      if (i > 0) {
        console.log("⏳ Waiting 5 seconds before next video...");
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
      
      const result = await automateVideoCreation(userId, {
        ...config,
        topic,
      });
      
      results.push(result);
      console.log(`✅ Video ${i + 1} completed:`, result.videoId);
    } catch (error: any) {
      console.error(`❌ Video ${i + 1} failed:`, error);
      results.push({
        videoId: "",
        videoUrl: "",
        script: "",
        status: "failed",
        errors: [error.message],
      });
    }
  }
  
  console.log(`\n🎉 Batch Automation Complete! ${results.filter(r => r.status === "success").length}/${topics.length} successful`);
  
  return results;
}

/**
 * Schedule recurring automation
 * Creates videos automatically on a schedule
 */
export interface RecurringConfig extends AutomationConfig {
  frequency: "daily" | "weekly" | "monthly";
  topicList: string[];
  startDate: Date;
  endDate?: Date;
}

export async function setupRecurringAutomation(
  userId: string,
  config: RecurringConfig
): Promise<{ success: boolean; message: string }> {
  try {
    // Save recurring config to database
    const { data, error } = await supabase
      .from("automation_configs")
      .insert({
        user_id: userId,
        config: config,
        status: "active",
        next_run: config.startDate.toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      success: true,
      message: `Recurring automation set up! Will create videos ${config.frequency} starting ${config.startDate.toLocaleDateString()}`,
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Failed to set up recurring automation: ${error.message}`,
    };
  }
}

/**
 * AI Content Ideas Generator
 * Generates video topic ideas based on niche
 */
export async function generateContentIdeas(
  niche: string,
  count: number = 10
): Promise<string[]> {
  const apiKey = import.meta.env.VITE_HUGGINGFACE_API_KEY;
  
  try {
    const prompt = `Generate ${count} engaging video topic ideas for ${niche} niche. List only the topics, one per line.`;
    
    const result = await generateScript(
      {
        prompt: prompt,
        maxLength: 300,
        temperature: 0.9,
      },
      apiKey
    );
    
    // Parse topics from result
    const topics = result
      .split("\n")
      .filter(line => line.trim().length > 0)
      .map(line => line.replace(/^\d+\.\s*/, "").replace(/^-\s*/, "").trim())
      .filter(topic => topic.length > 5)
      .slice(0, count);
    
    return topics.length > 0 ? topics : generateFallbackTopics(niche, count);
  } catch (error) {
    console.error("Content ideas generation error:", error);
    return generateFallbackTopics(niche, count);
  }
}

/**
 * Generate fallback topics if AI fails
 */
function generateFallbackTopics(niche: string, count: number): string[] {
  const templates = [
    `Top 5 ${niche} tips for beginners`,
    `How to master ${niche} in 30 days`,
    `${niche} mistakes to avoid`,
    `Best ${niche} strategies for 2024`,
    `${niche} secrets nobody tells you`,
    `Quick ${niche} tutorial for busy people`,
    `${niche} transformation story`,
    `Why ${niche} matters more than ever`,
    `${niche} hacks that actually work`,
    `The future of ${niche}`,
  ];
  
  return templates.slice(0, count);
}

/**
 * Analyze video performance and suggest improvements
 */
export async function analyzeAndOptimize(
  videoId: string
): Promise<{
  suggestions: string[];
  optimizedScript?: string;
}> {
  try {
    // Fetch video data
    const { data: video, error } = await supabase
      .from("videos")
      .select("*")
      .eq("id", videoId)
      .single();

    if (error || !video) {
      throw new Error("Video not found");
    }

    // Fetch analytics
    const { data: analytics } = await supabase
      .from("analytics")
      .select("*")
      .eq("schedule_id", videoId);

    const suggestions: string[] = [];

    // Analyze and provide suggestions
    if (video.script && video.script.length < 100) {
      suggestions.push("Script is too short. Consider adding more details.");
    }

    if (video.script && !video.script.includes("✅")) {
      suggestions.push("Add a clear call-to-action at the end.");
    }

    if (!video.caption || video.caption.length < 20) {
      suggestions.push("Add a more descriptive caption to improve engagement.");
    }

    if (analytics && analytics.length > 0) {
      const totalViews = analytics.reduce((sum, a) => sum + (a.views || 0), 0);
      const totalLikes = analytics.reduce((sum, a) => sum + (a.likes || 0), 0);
      
      if (totalViews > 0 && totalLikes / totalViews < 0.05) {
        suggestions.push("Low engagement rate. Try more emotional hooks in your script.");
      }
    }

    return {
      suggestions,
    };
  } catch (error: any) {
    console.error("Analysis error:", error);
    return {
      suggestions: ["Unable to analyze video. Please try again."],
    };
  }
}
