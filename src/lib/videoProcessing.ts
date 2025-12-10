/**
 * Video Processing Utilities
 * Handles video upload, processing, and storage
 */

import { supabase } from "@/integrations/supabase/client";
import { generateFFmpegCommand, generateSRTContent } from "./ffmpeg";
import { generateSubtitles } from "./huggingface";

export interface VideoUploadOptions {
  file: File;
  userId: string;
  title?: string;
  script?: string;
  caption?: string;
}

export interface ProcessedVideo {
  videoUrl: string;
  thumbnailUrl?: string;
  duration?: number;
}

/**
 * Upload video file to Supabase Storage
 */
export async function uploadVideo(
  options: VideoUploadOptions
): Promise<{ path: string; url: string }> {
  const { file, userId } = options;
  
  // Generate unique filename
  const fileExt = file.name.split(".").pop();
  const fileName = `${userId}/${Date.now()}.${fileExt}`;
  const filePath = `videos/${fileName}`;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from("videos")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("videos").getPublicUrl(filePath);

  return {
    path: filePath,
    url: publicUrl,
  };
}

/**
 * Process video with FFmpeg (calls server-side function)
 * Note: This requires a Supabase Edge Function or external API
 */
export async function processVideo(
  videoUrl: string,
  options: {
    subtitles?: string;
    backgroundMusic?: boolean;
    zoom?: boolean;
    duration?: number;
  }
): Promise<ProcessedVideo> {
  // In production, this should call a Supabase Edge Function
  // that runs FFmpeg on the server
  
  try {
    // Call Supabase Edge Function for video processing
    const { data, error } = await supabase.functions.invoke("process-video", {
      body: {
        videoUrl,
        options,
      },
    });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Video processing error:", error);
    // Fallback: return original video URL
    return {
      videoUrl,
    };
  }
}

/**
 * Generate and add subtitles to video
 */
export async function addSubtitlesToVideo(
  videoUrl: string,
  script: string,
  apiKey?: string
): Promise<string> {
  try {
    // Extract audio from video (requires server-side processing)
    // For now, we'll generate subtitles from script text
    
    // Generate SRT content from script
    const words = script.split(" ");
    const wordsPerSecond = 2.5; // Average speaking rate
    const totalDuration = words.length / wordsPerSecond;
    
    const subtitles = [];
    let currentTime = 0;
    const chunkSize = 5; // Words per subtitle
    
    for (let i = 0; i < words.length; i += chunkSize) {
      const chunk = words.slice(i, i + chunkSize).join(" ");
      const start = currentTime;
      const end = Math.min(currentTime + (chunkSize / wordsPerSecond), totalDuration);
      
      subtitles.push({
        start,
        end,
        text: chunk,
      });
      
      currentTime = end;
    }
    
    const srtContent = generateSRTContent(subtitles);
    
    // In production, upload SRT file and use it in video processing
    return srtContent;
  } catch (error) {
    console.error("Subtitle generation error:", error);
    throw error;
  }
}

/**
 * Create video thumbnail
 */
export async function generateThumbnail(
  videoUrl: string
): Promise<string> {
  try {
    // This requires server-side processing with FFmpeg
    // For now, return a placeholder or use the first frame
    
    const { data, error } = await supabase.functions.invoke("generate-thumbnail", {
      body: {
        videoUrl,
      },
    });

    if (error) {
      throw error;
    }

    return data.thumbnailUrl;
  } catch (error) {
    console.error("Thumbnail generation error:", error);
    // Return placeholder
    return "/placeholder.svg";
  }
}

/**
 * Save processed video to database
 */
export async function saveProcessedVideo(
  userId: string,
  videoData: {
    title: string;
    script: string;
    caption?: string;
    videoUrl: string;
    thumbnailUrl?: string;
    duration?: number;
    status?: string;
  }
) {
  const { data, error } = await supabase
    .from("videos")
    .insert({
      user_id: userId,
      title: videoData.title,
      script: videoData.script,
      caption: videoData.caption,
      video_url: videoData.videoUrl,
      thumbnail_url: videoData.thumbnailUrl,
      duration: videoData.duration,
      status: videoData.status || "completed",
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to save video: ${error.message}`);
  }

  return data;
}

/**
 * Complete video generation pipeline
 */
export async function generateCompleteVideo(
  options: VideoUploadOptions & {
    templateId?: number;
    addSubtitles?: boolean;
    addMusic?: boolean;
  }
): Promise<ProcessedVideo> {
  const { file, userId, title, script, caption, templateId, addSubtitles, addMusic } = options;

  try {
    console.log("🎬 Starting video upload and processing...");

    // Step 1: Upload video to Supabase Storage
    console.log("📤 Uploading video...");
    const { url: videoUrl } = await uploadVideo({
      file,
      userId,
      title,
      script,
      caption,
    });
    console.log("✅ Video uploaded:", videoUrl);

    // Step 2: Generate subtitles if needed
    let srtContent: string | undefined;
    if (addSubtitles && script) {
      console.log("📝 Generating subtitles...");
      srtContent = await addSubtitlesToVideo(videoUrl, script);
      console.log("✅ Subtitles generated");
    }

    // Step 3: Process video with FFmpeg (optional, will use original if fails)
    let processedVideoUrl = videoUrl;
    try {
      console.log("🎥 Processing video with FFmpeg...");
      const processed = await processVideo(videoUrl, {
        subtitles: srtContent,
        backgroundMusic: addMusic,
        zoom: true,
        duration: 20,
      });
      processedVideoUrl = processed.videoUrl;
      console.log("✅ Video processed");
    } catch (error) {
      console.warn("⚠️ FFmpeg processing failed, using original video:", error);
      // Continue with original video URL
    }

    // Step 4: Generate thumbnail (optional)
    let thumbnailUrl = "/placeholder.svg";
    try {
      console.log("🖼️ Generating thumbnail...");
      thumbnailUrl = await generateThumbnail(processedVideoUrl);
      console.log("✅ Thumbnail generated");
    } catch (error) {
      console.warn("⚠️ Thumbnail generation failed, using placeholder");
    }

    // Step 5: Save to database
    console.log("💾 Saving to database...");
    await saveProcessedVideo(userId, {
      title: title || "Untitled Video",
      script: script || "",
      caption,
      videoUrl: processedVideoUrl,
      thumbnailUrl,
      duration: 20,
      status: "completed",
    });
    console.log("✅ Video saved to database");

    console.log("🎉 Video generation complete!");

    return {
      videoUrl: processedVideoUrl,
      thumbnailUrl,
      duration: 20,
    };
  } catch (error) {
    console.error("❌ Video generation error:", error);
    throw error;
  }
}
